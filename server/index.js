import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import cookieParser from 'cookie-parser'
import morgan from 'morgan';
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import connectDB from './config/connectDb.js';
import userRouter from './route/user.route.js'
import categoryRouter from './route/category.route.js';
import productRouter from './route/product.route.js';
import cartRouter from './route/cart.route.js';
import myListRouter from './route/mylist.route.js';
import addressRouter from './route/address.route.js';
import homeSlidesRouter from './route/homeSlides.route.js';
import bannerV1Router from './route/bannerV1.route.js';
import bannerList2Router from './route/bannerList2.route.js';
import blogRouter from './route/blog.route.js';
import orderRouter from './route/order.route.js';
import logoRouter from './route/logo.route.js';
import discountCodeRouter from './route/discountCode.route.js';
import shippingRateRouter from './route/shippingRate.route.js';
import abandonedCartRouter from './route/abandonedCart.route.js';
import paymentRouter from './route/payment.route.js';
import paymentGatewayRouter from './route/paymentGateway.route.js';
import stripeRouter from './route/stripe.route.js';
import airwallexRouter from './route/airwallex.route.js';
import { initializePaymentGateways } from './controllers/paymentGateway.controller.js';
import { sendAutomatedReminders, detectAbandonedCarts } from './controllers/abandonedCart.controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const clientBuildPath = path.join(__dirname, '../client/dist');

const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.options('*', cors())

// HTTPS enforcement for production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    }
    next();
  });
}

// Rate limiting - login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { error: true, message: 'Too many login attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting - general API
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: { error: true, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// MongoDB sanitize - prevent injection attacks
app.use(mongoSanitize());

app.use(express.json())
app.use(cookieParser())
// app.use(morgan())
app.use(helmet({
    crossOriginResourcePolicy: false
}))


app.use(express.static(clientBuildPath));

app.get("/", (request, response) => {
    response.sendFile(path.join(clientBuildPath, 'index.html'));
})


app.use('/api/user',userRouter)
app.use('/api/category',categoryRouter)
app.use('/api/product',productRouter);
app.use("/api/cart",cartRouter)
app.use("/api/myList",myListRouter)
app.use("/api/address",addressRouter)
app.use("/api/homeSlides",homeSlidesRouter)
app.use("/api/bannerV1",bannerV1Router)
app.use("/api/bannerList2",bannerList2Router)
app.use("/api/blog",blogRouter)
app.use("/api/order",orderRouter)
app.use("/api/logo",logoRouter)
app.use("/api/discountCode",discountCodeRouter)
app.use("/api/shippingRate",shippingRateRouter)
app.use("/api/abandonedCart", abandonedCartRouter)
app.use("/api/payment", paymentRouter)
app.use("/api/payment-gateway", paymentGatewayRouter)
app.use("/api/stripe", stripeRouter)
app.use("/api/airwallex", airwallexRouter)

// Global error handler - hide stack traces in production
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: true,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: 'Endpoint not found'
  });
});

// Serve React app for any other route (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
});


connectDB().then(() => {
    initializePaymentGateways();
    
    setInterval(async () => {
        try {
            await detectAbandonedCarts(24);
            await sendAutomatedReminders();
        } catch (error) {
            console.error('Scheduled task error:', error);
        }
    }, 60 * 60 * 1000);
    
    app.listen(process.env.PORT, () => {
        console.log("Server is running", process.env.PORT);
    })
})