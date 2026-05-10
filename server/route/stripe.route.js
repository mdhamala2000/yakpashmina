import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import PaymentGateway from '../models/paymentGateway.model.js';

dotenv.config();

const router = express.Router();

// PRIORITY: .env → Database → Fallback (most secure)
const getStripeKeys = async () => {
  const envSecretKey = process.env.STRIPE_SECRET_KEY;
  const envPublishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  
  const envHasValidKey = envSecretKey && envSecretKey.startsWith('sk_') && envSecretKey.length > 20;
  
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
        publishableKey: gateway.publishableKey || '',
        webhookSecret: gateway.webhookSecret || '',
        environment: gateway.environment,
        source: 'database'
      };
    }
  } catch (e) {
    console.error('Error fetching Stripe from DB:', e);
  }
  
  return { secretKey: '', publishableKey: '', webhookSecret: '', environment: 'test', source: 'none' };
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
router.get('/config', async (req, res) => {
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
router.post('/create-payment-intent', async (req, res) => {
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
router.get('/payment-intent/:id', async (req, res) => {
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
router.post('/confirm-payment', async (req, res) => {
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

  try {
    let event;
    const stripe = await getStripe();
    
    if (!stripe) {
      return res.status(500).json({ error: true, message: 'Stripe not configured' });
    }

    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      event = JSON.parse(req.body);
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('Payment succeeded:', event.data.object.id);
        break;
      case 'payment_intent.payment_failed':
        console.log('Payment failed:', event.data.object.id);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(400).json({ error: error.message });
  }
});

export default router;