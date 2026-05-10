import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const AIRWALLEX_API_KEY = process.env.AIRWALLEX_API_KEY;
const AIRWALLEX_CLIENT_ID = process.env.AIRWALLEX_CLIENT_ID;
const AIRWALLEX_API_URL = process.env.AIRWALLEX_API_URL || 'https://api-demo.airwallex.com';

// Get Airwallex config (safe to expose to frontend)
router.get('/config', (req, res) => {
    return res.status(200).json({
        error: false,
        clientId: AIRWALLEX_CLIENT_ID || '',
        environment: process.env.AIRWALLEX_ENV || 'demo'
    });
});

// Create Payment Intent
router.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency = 'USD', customerId } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: true, message: 'Invalid amount' });
        }

        console.log('=== AIRWALLEX CREATE PAYMENT INTENT ===');
        console.log('API URL:', AIRWALLEX_API_URL);
        
        // Get access token
        const tokenResponse = await axios.post(
            `${AIRWALLEX_API_URL}/api/v1/authentication/login`,
            {},
            {
                headers: { 
                    'Content-Type': 'application/json',
                    'x-api-key': AIRWALLEX_API_KEY,
                    'x-client-id': AIRWALLEX_CLIENT_ID
                }
            }
        );

        const accessToken = tokenResponse.data.token;
        console.log('Token obtained');

        // Create payment intent - amount in minor units (cents for USD)
        const intentResponse = await axios.post(
            `${AIRWALLEX_API_URL}/api/v1/pa/payment_intents/create`,
            {
                amount: parseFloat(amount),
                currency: currency.toUpperCase(),
                request_id: `req_${Date.now()}`,
                merchant_order_id: `order_${Date.now()}`,
                return_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/order/success`
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'Airwallex-Client-Id': AIRWALLEX_CLIENT_ID
                }
            }
        );

        return res.status(200).json({
            error: false,
            success: true,
            clientSecret: intentResponse.data.client_secret,
            id: intentResponse.data.id,
            paymentIntent: intentResponse.data
        });
    } catch (error) {
        console.error('Airwallex create-payment-intent error:', error.response?.data || error.message);
        return res.status(500).json({
            error: true,
            success: false,
            message: error.response?.data?.message || error.message || 'Failed to create payment intent'
        });
    }
});

// Confirm Payment
router.post('/confirm-payment', async (req, res) => {
    try {
        const { paymentIntentId, paymentMethodId } = req.body;

        // Get access token
        const tokenResponse = await axios.post(
            'https://api.airwallex.com/api/v1/authentication/login',
            {
                client_id: AIRWALLEX_CLIENT_ID,
                secret_key: AIRWALLEX_API_KEY
            },
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );

        const accessToken = tokenResponse.data.token;

        // Confirm payment
        const confirmResponse = await axios.post(
            `https://api.airwallex.com/api/v1/payment_intents/${paymentIntentId}/confirm`,
            {
                payment_method: {
                    type: 'card',
                    card: {
                        payment_method_id: paymentMethodId
                    }
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );

        return res.status(200).json({
            error: false,
            success: true,
            status: confirmResponse.data.status,
            paymentIntent: confirmResponse.data
        });
    } catch (error) {
        console.error('Airwallex confirm-payment error:', error.response?.data || error.message);
        return res.status(500).json({
            error: true,
            success: false,
            message: error.response?.data?.message || error.message || 'Failed to confirm payment'
        });
    }
});

// Get Payment Intent Status
router.get('/payment-intent/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Get access token
        const tokenResponse = await axios.post(
            'https://api.airwallex.com/api/v1/authentication/login',
            {
                client_id: AIRWALLEX_CLIENT_ID,
                secret_key: AIRWALLEX_API_KEY
            },
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );

        const accessToken = tokenResponse.data.token;

        // Get payment intent
        const intentResponse = await axios.get(
            `https://api.airwallex.com/api/v1/payment_intents/${id}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );

        return res.status(200).json({
            error: false,
            success: true,
            paymentIntent: intentResponse.data
        });
    } catch (error) {
        console.error('Airwallex get-payment-intent error:', error.response?.data || error.message);
        return res.status(500).json({
            error: true,
            success: false,
            message: error.message
        });
    }
});

export default router;