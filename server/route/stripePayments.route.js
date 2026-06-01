import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import auth, { requireAdmin } from '../middlewares/auth.js';
import { stripe, STRIPE_WEBHOOK_SECRET, formatAmountForStripe, mapStripeStatus, formatAmountFromStripe } from '../config/stripe.js';

dotenv.config();

const router = express.Router();

// Get all payments from Stripe
router.get('/payments', auth, requireAdmin, async (req, res) => {
  try {
    const { limit = 25, starting_after, status, created_gte, created_lte } = req.query;

    const params = {
      limit: parseInt(limit) || 25,
    };

    if (starting_after) {
      params.starting_after = starting_after;
    }

    if (created_gte) {
      params.created = { gte: parseInt(created_gte) };
    }
    if (created_lte) {
      if (params.created) {
        params.created.lte = parseInt(created_lte);
      } else {
        params.created = { lte: parseInt(created_lte) };
      }
    }

    const paymentIntents = await stripe.paymentIntents.list(params);

    const payments = paymentIntents.data.map(pi => ({
      id: pi.id,
      amount: formatAmountFromStripe(pi.amount, pi.currency),
      amount_raw: pi.amount,
      currency: pi.currency,
      status: mapStripeStatus(pi.status),
      created: pi.created,
      payment_method: pi.payment_method_types ? pi.payment_method_types[0] : 'card',
      customer_email: pi.receipt_email || (pi.metadata ? pi.metadata.customer_email : null),
      description: pi.description || (pi.metadata ? pi.metadata.description : null),
      captured: pi.captured,
      refunded: pi.status === 'refunded',
      settlement_merchant: pi.transfer_data && pi.transfer_data.destination ? 'Yes' : '-',
      transferred_to: pi.transfer_data && pi.transfer_data.destination ? pi.transfer_data.destination : '-',
      metadata: pi.metadata,
      customer: pi.customer,
      latest_charge: pi.latest_charge,
    }));

    res.status(200).json({
      success: true,
      data: payments,
      has_more: paymentIntents.has_more,
      url: paymentIntents.url,
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch payments',
    });
  }
});

router.get('/payments/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const paymentIntent = await stripe.paymentIntents.retrieve(id);

    res.status(200).json({
      success: true,
      data: {
        id: paymentIntent.id,
        amount: formatAmountFromStripe(paymentIntent.amount, paymentIntent.currency),
        amount_raw: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: mapStripeStatus(paymentIntent.status),
        created: paymentIntent.created,
        payment_method: paymentIntent.payment_method_types ? paymentIntent.payment_method_types[0] : null,
        customer_email: paymentIntent.receipt_email,
        description: paymentIntent.description,
        captured: paymentIntent.captured,
        refunded: paymentIntent.status === 'refunded',
        client_secret: paymentIntent.client_secret,
        metadata: paymentIntent.metadata,
      },
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch payment',
    });
  }
});

router.post('/create-payment', auth, requireAdmin, async (req, res) => {
  try {
    const { amount, currency = 'usd', customerEmail, description, customerId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount',
      });
    }

    const amountInCents = formatAmountForStripe(amount, currency);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      receipt_email: customerEmail,
      description: description,
      customer: customerId || undefined,
      metadata: {
        customer_email: customerEmail || '',
        description: description || '',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create payment',
    });
  }
});

router.post('/confirm-payment', auth, requireAdmin, async (req, res) => {
  try {
    const { paymentIntentId, paymentMethodId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: 'Payment intent ID is required',
      });
    }

    if (paymentMethodId) {
      const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
        customer: undefined,
      });

      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
      });

      return res.status(200).json({
        success: true,
        status: mapStripeStatus(paymentIntent.status),
        data: paymentIntent,
      });
    }

    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);

    res.status(200).json({
      success: true,
      status: mapStripeStatus(paymentIntent.status),
      data: paymentIntent,
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to confirm payment',
    });
  }
});

router.post('/capture-payment', auth, requireAdmin, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: 'Payment intent ID is required',
      });
    }

    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);

    res.status(200).json({
      success: true,
      status: mapStripeStatus(paymentIntent.status),
      amount_captured: formatAmountFromStripe(paymentIntent.amount, paymentIntent.currency),
    });
  } catch (error) {
    console.error('Error capturing payment:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to capture payment',
    });
  }
});

router.post('/cancel-payment', auth, requireAdmin, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: 'Payment intent ID is required',
      });
    }

    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);

    res.status(200).json({
      success: true,
      status: mapStripeStatus(paymentIntent.status),
    });
  } catch (error) {
    console.error('Error canceling payment:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to cancel payment',
    });
  }
});

router.post('/refund-payment', auth, requireAdmin, async (req, res) => {
  try {
    const { paymentIntentId, amount, reason } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: 'Payment intent ID is required',
      });
    }

    const refundParams = {
      payment_intent: paymentIntentId,
    };

    if (amount) {
      refundParams.amount = formatAmountForStripe(amount, 'usd');
    }

    if (reason) {
      refundParams.reason = reason;
    }

    const refund = await stripe.refunds.create(refundParams);

    res.status(200).json({
      success: true,
      refund_id: refund.id,
      amount: formatAmountFromStripe(refund.amount, refund.currency),
      status: refund.status,
    });
  } catch (error) {
    console.error('Error refunding payment:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to refund payment',
    });
  }
});

router.get('/payment-methods/:customerId', auth, requireAdmin, async (req, res) => {
  try {
    const { customerId } = req.params;

    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    res.status(200).json({
      success: true,
      data: paymentMethods.data.map(pm => ({
        id: pm.id,
        brand: pm.card ? pm.card.brand : null,
        last4: pm.card ? pm.card.last4 : null,
        exp_month: pm.card ? pm.card.exp_month : null,
        exp_year: pm.card ? pm.card.exp_year : null,
      })),
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch payment methods',
    });
  }
});

router.get('/analytics', auth, requireAdmin, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const now = Math.floor(Date.now() / 1000);
    const startDate = now - (parseInt(days) * 24 * 60 * 60);

    const paymentIntents = await stripe.paymentIntents.list({
      limit: 100,
      created: { gte: startDate },
    });

    let totalRevenue = 0;
    let succeededCount = 0;
    let failedCount = 0;
    let refundedAmount = 0;
    const dailyData = {};

    let hasMore = true;
    let lastId = paymentIntents.data[paymentIntents.data.length - 1] ? paymentIntents.data[paymentIntents.data.length - 1].id : null;

    while (hasMore) {
      for (const pi of paymentIntents.data) {
        const date = new Date(pi.created * 1000).toISOString().split('T')[0];

        if (!dailyData[date]) {
          dailyData[date] = { amount: 0, count: 0 };
        }

        if (pi.status === 'succeeded') {
          totalRevenue += formatAmountFromStripe(pi.amount, pi.currency);
          succeededCount++;
          dailyData[date].amount += formatAmountFromStripe(pi.amount, pi.currency);
          dailyData[date].count++;
        } else if (pi.status === 'canceled' || pi.status === 'payment_failed') {
          failedCount++;
        }
      }

      if (paymentIntents.has_more && lastId) {
        const nextPage = await stripe.paymentIntents.list({
          limit: 100,
          starting_after: lastId,
          created: { gte: startDate },
        });
        lastId = nextPage.data[nextPage.data.length - 1] ? nextPage.data[nextPage.data.length - 1].id : null;
        if (nextPage.has_more && lastId) {
          paymentIntents.data = nextPage.data;
        } else {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    }

    const refunds = await stripe.refunds.list({
      limit: 100,
      created: { gte: startDate },
    });
    refunds.data.forEach(r => {
      refundedAmount += formatAmountFromStripe(r.amount, r.currency);
    });

    const chartData = Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        amount: Math.round(data.amount * 100) / 100,
        count: data.count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalTransactions: succeededCount + failedCount,
        successRate: succeededCount + failedCount > 0
          ? Math.round((succeededCount / (succeededCount + failedCount)) * 100)
          : 0,
        refundRate: totalRevenue > 0
          ? Math.round((refundedAmount / totalRevenue) * 100)
          : 0,
        chartData,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch analytics',
    });
  }
});

router.post('/create-customer', auth, requireAdmin, async (req, res) => {
  try {
    const { email, name } = req.body;

    const customer = await stripe.customers.create({
      email,
      name,
    });

    res.status(200).json({
      success: true,
      customerId: customer.id,
      email: customer.email,
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create customer',
    });
  }
});

export default router;