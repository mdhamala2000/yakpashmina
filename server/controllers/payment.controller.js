import airwallexService from "../config/airwallex.js";
import Stripe from 'stripe';
import PaymentGateway from "../models/paymentGateway.model.js";

let stripeInstance = null;

const getStripeInstance = async () => {
  if (!stripeInstance) {
    try {
      const gateway = await PaymentGateway.findOne({ gatewayType: 'stripe' });
      const dbKey = gateway?.apiSecret;
      const envKey = process.env.STRIPE_SECRET_KEY;
      
      const validKey = (dbKey && dbKey.startsWith('sk_') && dbKey.length > 20) 
        ? dbKey 
        : (envKey && envKey.startsWith('sk_') && envKey.length > 20) 
          ? envKey 
          : null;
      
      if (validKey) {
        stripeInstance = new Stripe(validKey);
        console.log('Stripe initialized from payment controller');
      }
    } catch (e) {
      console.error('Error initializing Stripe:', e);
    }
  }
  return stripeInstance;
};

export const createStripePaymentIntent = async (request, response) => {
    try {
        const { amount, currency } = request.body;

        if (!amount || amount <= 0) {
            return response.status(400).json({
                error: true,
                success: false,
                message: "Invalid amount"
            });
        }

        const stripe = await getStripeInstance();
        if (!stripe) {
            return response.status(500).json({
                error: true,
                success: false,
                message: "Stripe not configured"
            });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: currency || 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return response.status(200).json({
            error: false,
            success: true,
            clientSecret: paymentIntent.client_secret,
            id: paymentIntent.id
        });

    } catch (error) {
        console.error('Create Stripe payment intent error:', error);
        return response.status(500).json({
            error: true,
            success: false,
            message: error.message || "Failed to create payment intent"
        });
    }
};

export const createPaymentIntent = async (request, response) => {
    try {
        const { amount, currency, customerId } = request.body;

        if (!amount || amount <= 0) {
            return response.status(400).json({
                error: true,
                success: false,
                message: "Invalid amount"
            });
        }

        const paymentIntent = await airwallexService.createPaymentIntent(
            amount,
            currency || 'USD',
            customerId
        );

        return response.status(200).json({
            error: false,
            success: true,
            clientSecret: paymentIntent.client_secret,
            id: paymentIntent.id
        });

    } catch (error) {
        console.error('Create payment intent error:', error);
        return response.status(500).json({
            error: true,
            success: false,
            message: error.message || "Failed to create payment intent"
        });
    }
};

export const confirmPayment = async (request, response) => {
    try {
        const { paymentIntentId, paymentMethodId } = request.body;

        const result = await airwallexService.confirmPaymentIntent(
            paymentIntentId,
            { type: 'card', card: { payment_method_id: paymentMethodId } }
        );

        return response.status(200).json({
            error: false,
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Confirm payment error:', error);
        return response.status(500).json({
            error: true,
            success: false,
            message: error.message || "Failed to confirm payment"
        });
    }
};

export const getPaymentStatus = async (request, response) => {
    try {
        const { paymentIntentId } = request.params;

        const paymentIntent = await airwallexService.getPaymentIntent(paymentIntentId);

        return response.status(200).json({
            error: false,
            success: true,
            data: {
                status: paymentIntent.status,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency
            }
        });

    } catch (error) {
        console.error('Get payment status error:', error);
        return response.status(500).json({
            error: true,
            success: false,
            message: error.message || "Failed to get payment status"
        });
    }
};