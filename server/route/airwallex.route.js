import express from 'express';
import auth from '../middlewares/auth.js';
import airwallexService from '../config/airwallex.js';

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

router.post('/create-intent', auth, validateAmount, async (req, res) => {
  try {
    const { amount, currency, metadata } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: true, message: 'Invalid amount' });
    }
    const returnUrl = `${process.env.CLIENT_URL}/order/airwallex-return`;
    const cancelUrl = `${process.env.CLIENT_URL}/checkout`;
    const merchantOrderId = `ORDER-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    const intent = await airwallexService.createPaymentIntent({
      amount,
      currency: currency || 'USD',
      merchantOrderId,
      returnUrl,
      cancelUrl,
      metadata: { ...metadata, merchant_order_id: merchantOrderId }
    });
    res.json({
      success: true,
      error: false,
      data: {
        intentId: intent.id,
        clientSecret: intent.clientSecret,
        merchantOrderId
      }
    });
  } catch (error) {
    console.error('Airwallex create intent error:', error);
    res.status(500).json({ error: true, message: error.message || 'Failed to create payment intent' });
  }
});

router.get('/intent/:id', async (req, res) => {
  try {
    const intent = await airwallexService.getPaymentIntent(req.params.id);
    res.json({
      success: true,
      error: false,
      data: {
        id: intent.id,
        status: intent.status,
        amount: intent.amount,
        currency: intent.currency
      }
    });
  } catch (error) {
    console.error('Airwallex get intent error:', error);
    res.status(500).json({ error: true, message: error.message || 'Failed to get payment intent' });
  }
});

router.post('/webhook', async (req, res) => {
  try {
    const event = req.body;
    console.log('Airwallex webhook:', event.event_type, event.data?.id);
    if (event.event_type === 'payment_intent.succeeded') {
      console.log('Payment succeeded for intent:', event.data?.id);
    }
    res.json({ received: true });
  } catch (error) {
    console.error('Airwallex webhook error:', error);
    res.status(500).json({ error: true, message: 'Webhook processing failed' });
  }
});

export default router;
