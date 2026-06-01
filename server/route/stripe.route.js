import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import auth from '../middlewares/auth.js';
import PaymentGateway from '../models/paymentGateway.model.js';
import OrderModel from '../models/order.model.js';
import ProductModel from '../models/product.modal.js';
import VariantModel from '../models/variant.model.js';
import ProcessedWebhookEvent from '../models/processedWebhookEvent.model.js';
import sendEmailFun from '../config/sendEmail.js';
import OrderConfirmationEmail from '../utils/orderEmailTemplate.js';

dotenv.config();

const router = express.Router();

// Validate payment amount
const validateAmount = (req, res, next) => {
  const amount = req.body.amount;
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: true, message: 'Invalid or missing amount' });
  }
  if (amount > 999999.99) {
    return res.status(400).json({ error: true, message: 'Amount exceeds maximum limit' });
  }
  if (amount < 0.50) {
    return res.status(400).json({ error: true, message: 'Amount must be at least $0.50' });
  }
  next();
};

// PRIORITY: .env → Database → Fallback (most secure)
const getStripeKeys = async () => {
  const envSecretKey = process.env.STRIPE_SECRET_KEY;
  const envPublishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  
  const envHasValidKey = envSecretKey && envSecretKey.startsWith('sk_') && envSecretKey.length > 20;
  
  // Always prefer .env if it has valid keys
  if (envHasValidKey && envPublishableKey) {
    return {
      secretKey: envSecretKey,
      publishableKey: envPublishableKey,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
      environment: envSecretKey.startsWith('sk_live') ? 'live' : 'test',
      source: 'env'
    };
  }
  
  // Fall back to .env even if only secret key exists (for server-side operations)
  if (envHasValidKey) {
    return {
      secretKey: envSecretKey,
      publishableKey: envPublishableKey || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
      environment: envSecretKey.startsWith('sk_live') ? 'live' : 'test',
      source: 'env'
    };
  }
  
  try {
    const gateway = await PaymentGateway.findOne({ gatewayType: 'stripe' });
    if (gateway && gateway.isActive && gateway.apiSecret && gateway.apiSecret.startsWith('sk_')) {
      return {
        secretKey: gateway.apiSecret,
        publishableKey: gateway.publishableKey || envPublishableKey || '',
        webhookSecret: gateway.webhookSecret || '',
        environment: gateway.environment,
        source: 'database'
      };
    }
  } catch (e) {
    console.error('Error fetching Stripe from DB:', e);
  }
  
  return { secretKey: '', publishableKey: envPublishableKey || '', webhookSecret: '', environment: 'test', source: 'none' };
};

let stripeInstance = null;

const getStripe = async () => {
  if (stripeInstance) return stripeInstance;
  
  const config = await getStripeKeys();
  
  if (config.secretKey && config.secretKey.startsWith('sk_')) {
    stripeInstance = new Stripe(config.secretKey);
  }
  
  return stripeInstance;
};

// Test Stripe connection
const testStripeConnection = async () => {
  try {
    const stripe = await getStripe();
    if (!stripe) return { success: false, error: 'Stripe not configured' };
    
    const account = await stripe.account.retrieve();
    return { 
      success: true, 
      accountId: account.id,
      email: account.email,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get Stripe config for ADMIN (includes connection status)
router.get('/config', auth, async (req, res) => {
  try {
    const config = await getStripeKeys();
    const connection = await testStripeConnection();

    return res.status(200).json({
      error: false,
      configured: !!config.secretKey,
      environment: config.environment,
      hasPublishableKey: !!config.publishableKey,
      keySource: config.source,
      connection
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message });
  }
});

// Get config for FRONTEND (publishable key only)
router.get('/public-config', async (req, res) => {
  const config = await getStripeKeys();
  return res.status(200).json({
    error: false,
    publishableKey: config.publishableKey || '',
    currency: 'usd',
  });
});

// Get PayPal config for checkout page
router.get('/paypal-config', async (req, res) => {
  try {
    const mode = process.env.PAYPAL_MODE || 'sandbox';
    const clientId = mode === 'live' 
      ? process.env.PAYPAL_CLIENT_ID_LIVE 
      : process.env.PAYPAL_CLIENT_ID_TEST;
    
    return res.status(200).json({
      error: false,
      clientId: clientId || '',
      mode: mode,
      currency: 'USD'
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message });
  }
});

// Create Payment Intent (for checkout)
router.post('/create-payment-intent', auth, validateAmount, async (req, res) => {
  try {
    const { amount, currency = 'usd', metadata = {} } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: true, message: 'Invalid amount' });
    }

    const stripe = await getStripe();
    if (!stripe) {
      return res.status(500).json({ error: true, message: 'Stripe not configured' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      automatic_payment_methods: { enabled: true },
      // Don't auto-confirm - let frontend handle 3D Secure properly
      metadata,
    });

    return res.status(200).json({
      error: false,
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Stripe create-payment-intent error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Failed to create payment intent'
    });
  }
});

// Get Payment Intent status
router.get('/payment-intent/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const stripe = await getStripe();
    
    if (!stripe) {
      return res.status(500).json({ error: true, message: 'Stripe not configured' });
    }
    
    const paymentIntent = await stripe.paymentIntents.retrieve(id);

    return res.status(200).json({
      error: false,
      success: true,
      paymentIntent,
    });
  } catch (error) {
    console.error('Stripe payment-intent error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message
    });
  }
});

// Confirm payment
router.post('/confirm-payment', auth, validateAmount, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const stripe = await getStripe();
    
    if (!stripe) {
      return res.status(500).json({ error: true, message: 'Stripe not configured' });
    }
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return res.status(200).json({
      error: false,
      success: true,
      status: paymentIntent.status,
      paymentIntent,
    });
  } catch (error) {
    console.error('Stripe confirm-payment error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message
    });
  }
});

// Webhook endpoint
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const config = await getStripeKeys();
  const sig = req.headers['stripe-signature'];
  const webhookSecret = config.webhookSecret;
  const OWNER_EMAIL = process.env.OWNER_EMAIL || 'mdhamala2000@gmail.com';

  try {
    if (!webhookSecret) {
      console.error('SECURITY: Stripe webhook secret not configured');
      return res.status(400).json({ error: true, message: 'Webhook not properly configured' });
    }

    if (!sig) {
      console.error('SECURITY: Missing stripe signature on webhook');
      return res.status(401).json({ error: true, message: 'Missing signature' });
    }

    let event;
    const stripe = await getStripe();

    if (!stripe) {
      return res.status(500).json({ error: true, message: 'Stripe not configured' });
    }

    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      console.error('SECURITY: Webhook received without valid signature verification');
      return res.status(401).json({ error: true, message: 'Invalid webhook signature' });
    }

    const eventId = event.id;

    const alreadyProcessed = await ProcessedWebhookEvent.findOne({ eventId, source: 'stripe' });
    if (alreadyProcessed) {
      return res.status(200).json({ received: true, duplicate: true });
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        try {
          const paymentIntent = event.data.object;
          let order = await OrderModel.findOne({ paymentId: paymentIntent.id });
          
          if (!order && paymentIntent.metadata?.orderData) {
            try {
              const orderData = JSON.parse(paymentIntent.metadata.orderData);
              const productIds = (orderData.products || []).map(p => p.productId).filter(Boolean);
              const variantIds = (orderData.products || []).map(p => p.variantId).filter(Boolean);
              
              const [dbProducts, dbVariants] = await Promise.all([
                productIds.length > 0 ? ProductModel.find({ _id: { $in: productIds } }).lean() : [],
                variantIds.length > 0 ? VariantModel.find({ _id: { $in: variantIds } }).lean() : []
              ]);
              
              const priceMap = {};
              for (const p of dbProducts) {
                priceMap[p._id.toString()] = p.price;
              }
              const variantPriceMap = {};
              for (const v of dbVariants) {
                variantPriceMap[v._id.toString()] = v.price;
              }

              const syncedProducts = (orderData.products || []).map(item => {
                const quantity = parseInt(item.quantity) || 1;
                let unitPrice;
                if (item.variantId) {
                  unitPrice = variantPriceMap[item.variantId];
                }
                if (unitPrice === undefined) {
                  unitPrice = priceMap[item.productId];
                }
                unitPrice = unitPrice !== undefined ? unitPrice : (parseFloat(item.price) || 0);
                return {
                  ...item,
                  perUnit: unitPrice,
                  price: unitPrice * quantity,
                  subTotal: unitPrice * quantity
                };
              });

              const computedSubTotal = syncedProducts.reduce((sum, p) => sum + (p.price || 0), 0);
              const computedShipping = parseFloat(orderData.shippingCost) || 0;
              const computedDiscount = parseFloat(orderData.discountAmount) || 0;
              const computedTotal = computedSubTotal + computedShipping - computedDiscount;
              
              order = new OrderModel({
                userId: orderData.userId || null,
                products: syncedProducts,
                paymentId: paymentIntent.id,
                payment_method: 'stripe',
                payment_status: 'PAID',
                delivery_address: orderData.delivery_address,
                totalAmt: computedTotal,
                subTotal: computedSubTotal,
                shippingCost: computedShipping,
                currency: 'USD',
                discountCode: orderData.discountCode || null,
                discountAmount: computedDiscount
              });
              await order.save();
            } catch (createError) {
              console.error('Error creating order from webhook:', createError);
            }
          }
          
          if (order) {
            await OrderModel.findByIdAndUpdate(order._id, { payment_status: 'PAID' });

            for (const item of order.products || []) {
              const qty = parseInt(item.quantity) || 1;
              if (item.variantId) {
                await VariantModel.findOneAndUpdate(
                  { _id: item.variantId, stock: { $gte: qty } },
                  { $inc: { stock: -qty } }
                );
              } else {
                await ProductModel.findOneAndUpdate(
                  { _id: item.productId, countInStock: { $gte: qty } },
                  { $inc: { countInStock: -qty, sale: qty } }
                );
              }
            }
            
            const customerEmail = order.delivery_address?.email;
            const orderId = order._id.toString().slice(-8).toUpperCase();
            
            if (customerEmail) {
              await sendEmailFun({
                sendTo: [customerEmail],
                subject: `Order Confirmed - #${orderId} | Yak Pashmina`,
                text: '',
                html: OrderConfirmationEmail(order.delivery_address?.firstName || 'Customer', order)
              });
            }
            
            await sendEmailFun({
              sendTo: [OWNER_EMAIL],
              subject: `New Stripe Payment - #${orderId} - USD ${paymentIntent.amount / 100}`,
              text: '',
              html: OrderConfirmationEmail(order.delivery_address?.firstName || 'Customer', order, true)
            });
          }
        } catch (emailError) {
          console.error('Error processing successful payment:', emailError);
        }
        break;
      case 'payment_intent.payment_failed':
        try {
          const paymentIntent = event.data.object;
          const order = await OrderModel.findOne({ paymentId: paymentIntent.id });
          if (order) {
            await OrderModel.findByIdAndUpdate(order._id, {
              payment_status: 'FAILED',
              order_status: 'cancelled'
            });
            console.log(`Payment failed for order ${order._id}: ${paymentIntent.last_payment_error?.message}`);
          }
        } catch (failError) {
          console.error('Error handling failed payment:', failError);
        }
        break;
      default:
        break;
    }

    await ProcessedWebhookEvent.create({ eventId, source: 'stripe' }).catch(() => {});
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(400).json({ error: error.message });
  }
});

export default router;