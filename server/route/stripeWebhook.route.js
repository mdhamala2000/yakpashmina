import express from 'express';
import { stripe, STRIPE_WEBHOOK_SECRET } from '../config/stripe.js';

const router = express.Router();

// Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  let event;
  
  try {
    // Verify webhook signature
    if (STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    } else {
      // For development without webhook secret
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err?.message || err);
    return res.status(400).send(`Webhook Error: ${err?.message || err}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('✅ Payment succeeded:', paymentIntent.id);
      console.log('   Amount:', paymentIntent.amount / 100, paymentIntent.currency);
      console.log('   Customer:', paymentIntent.receipt_email);
      
      // TODO: Update database order status to "PAID"
      // TODO: Send confirmation email to customer
      // TODO: Update inventory/stock
      // await updateOrderPaymentStatus(paymentIntent.id, 'PAID');
      
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('❌ Payment failed:', failedPayment.id);
      console.log('   Error:', failedPayment.last_payment_error?.message);
      
      // TODO: Update database order status to "FAILED"
      // TODO: Send failure notification to customer
      // await updateOrderPaymentStatus(failedPayment.id, 'FAILED');
      
      break;

    case 'charge.refunded':
      const refund = event.data.object;
      console.log('🔄 Payment refunded:', refund.id);
      console.log('   Amount refunded:', refund.amount / 100, refund.currency);
      
      // TODO: Update database order status to "REFUNDED"
      // TODO: Restore inventory
      // await updateOrderPaymentStatus(refund.payment_intent, 'REFUNDED');
      
      break;

    case 'charge.refund.updated':
      const refundUpdate = event.data.object;
      console.log('📝 Refund updated:', refundUpdate.id);
      console.log('   Status:', refundUpdate.status);
      
      break;

    case 'payment_method.attached':
      const paymentMethod = event.data.object;
      console.log('💳 Payment method attached:', paymentMethod.id);
      
      break;

    case 'customer.created':
      const customer = event.data.object;
      console.log('👤 Customer created:', customer.id);
      
      break;

    case 'invoice.paid':
      const invoice = event.data.object;
      console.log('📄 Invoice paid:', invoice.id);
      
      break;

    default:
      console.log('Unhandled event type:', event.type);
  }

  // Return 200 to acknowledge receipt
  res.status(200).json({ received: true });
});

// Health check for webhook endpoint
router.get('/webhook/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    webhookSecret: STRIPE_WEBHOOK_SECRET ? 'configured' : 'not configured'
  });
});

export default router;