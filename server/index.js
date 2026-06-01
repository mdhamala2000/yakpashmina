import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import cookieParser from 'cookie-parser'
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import { sanitizeInput } from './middlewares/sanitization.js';
import connectDB from './config/connectDb.js';
import auth, { requireAdmin } from './middlewares/auth.js';
import userRouter from './route/user.route.js'
import categoryRouter from './route/category.route.js';
import productRouter from './route/product.route.js';
import variantRouter from './route/variant.route.js';
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
import paymentGatewayRouter from './route/paymentGateway.route.js';
import stripeRouter from './route/stripe.route.js';
import stripePaymentsRouter from './route/stripePayments.route.js';
import paypalWebhookRouter from './route/paypalWebhook.route.js';
import airwallexRouter from './route/airwallex.route.js';
import seoRouter from './route/seo.route.js';
import currencyRouter from './route/currency.route.js';
import duplicatesRouter from './route/duplicates.route.js';
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

// Log only errors in production, all requests in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

const allowedOrigins = (() => {
  const env = process.env.ALLOWED_ORIGINS;
  const clientUrl = process.env.CLIENT_URL || 'https://yakpashamina.com';
  
  if (process.env.NODE_ENV === 'production') {
    // Production: use only the production domain
    return [clientUrl, 'https://www.yakpashamina.com'].filter(Boolean);
  }
  // Development: allow localhosts
  return env ? env.split(',') : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000'];
})();

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked - origin:', origin);
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

// Process-level error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

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

// Rate limiting - payment endpoints (stricter)
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 payment attempts per window
  message: { error: true, message: 'Too many payment attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Body parser must come before sanitizers
app.use(express.json())
app.use(cookieParser())

// MongoDB sanitize - prevent injection attacks
app.use(mongoSanitize());
app.use(sanitizeInput) // XSS prevention - sanitize all inputs
app.use(helmet({
    crossOriginResourcePolicy: false
}))


app.use(express.static(clientBuildPath));

app.get("/", (request, response) => {
    response.sendFile(path.join(clientBuildPath, 'index.html'));
})


app.use('/api/user', generalLimiter, userRouter)
app.use('/api/category', generalLimiter, categoryRouter)
app.use('/api/product', generalLimiter, productRouter);
app.use('/api/variant', generalLimiter, variantRouter);
app.use("/api/cart", generalLimiter, cartRouter)
app.use("/api/myList", generalLimiter, myListRouter)
app.use("/api/address", generalLimiter, addressRouter)
app.use("/api/homeSlides", generalLimiter, homeSlidesRouter)
app.use("/api/bannerV1", generalLimiter, bannerV1Router)
app.use("/api/bannerList2", generalLimiter, bannerList2Router)
app.use("/api/blog", generalLimiter, blogRouter)
app.use("/api/order", generalLimiter, orderRouter)
app.use("/api/logo", generalLimiter, logoRouter)
app.use("/api/discountCode", generalLimiter, discountCodeRouter)
app.use("/api/shippingRate", generalLimiter, shippingRateRouter)
app.use("/api/abandonedCart", generalLimiter, abandonedCartRouter)
app.use("/api/payment-gateway", paymentLimiter, paymentGatewayRouter)
app.use("/api/stripe", generalLimiter, stripeRouter)
app.use("/api/stripe-payments", paymentLimiter, stripePaymentsRouter)
app.use("/api/paypal-webhook", paypalWebhookRouter)
app.use("/api/airwallex", paymentLimiter, airwallexRouter)
app.use("/api/currency", generalLimiter, currencyRouter)
app.use("/api/seo", generalLimiter, seoRouter)
app.use("/api/duplicates", generalLimiter, duplicatesRouter)

// Debug endpoint removed for security - no debug endpoints in production
// To rebuild indexes, use MongoDB admin tools or contact DevOps

// Serve sitemap.xml directly
app.get('/sitemap.xml', async (req, res) => {
    try {
        const generateSitemap = (await import('./utils/sitemapGenerator.js')).default;
        const baseUrl = process.env.CLIENT_URL || 'https://yakpashamina.com';

        res.set('Cache-Control', 'public, max-age=3600');
        res.set('Content-Type', 'application/xml');

        const sitemap = await generateSitemap(baseUrl);
        res.send(sitemap);
    } catch (error) {
        console.error('Sitemap generation error:', error);
        res.status(500).send('Error generating sitemap');
    }
});

// Serve React app for any other GET route (SPA support - must come before 404)
app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: true,
    message: 'Endpoint not found'
  });
});

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


connectDB().then(() => {
    initializePaymentGateways();
    
    setInterval(async () => {
        try {
            await detectAbandonedCarts(24);
            await sendAutomatedReminders();
            const { default: OrderModel } = await import('./models/order.model.js');
            const result = await OrderModel.updateMany(
                { payment_status: 'PENDING_VERIFICATION', paymentExpiresAt: { $lte: new Date() } },
                { $set: { order_status: 'cancelled', payment_status: 'EXPIRED' } }
            );
            if (result.modifiedCount > 0) {
                console.log(`Auto-cancelled ${result.modifiedCount} expired bank transfer orders`);
            }
        } catch (error) {
            console.error('Scheduled task error:', error);
        }
    }, 60 * 60 * 1000);
    
    app.listen(process.env.PORT, () => {
        console.log("Server is running", process.env.PORT);
    })
})