import express from 'express';
import paypal from '@paypal/checkout-server-sdk';
import crypto from 'crypto';
import OrderModel from '../models/order.model.js';
import ProcessedWebhookEvent from '../models/processedWebhookEvent.model.js';
import sendEmailFun from '../config/sendEmail.js';
import OrderConfirmationEmail from '../utils/orderEmailTemplate.js';

const router = express.Router();

const OWNER_EMAIL = process.env.OWNER_EMAIL || 'mdhamala2000@gmail.com';
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;

function getPayPalClient() {
    const environment = process.env.PAYPAL_MODE === 'live'
        ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID_LIVE, process.env.PAYPAL_SECRET_LIVE)
        : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID_TEST, process.env.PAYPAL_SECRET_TEST);
    return new paypal.core.PayPalHttpClient(environment);
}

async function verifyPayPalWebhook(req) {
    if (!PAYPAL_WEBHOOK_ID) return false;
    try {
        const client = getPayPalClient();
        const authHeaders = await client.fetchAccessToken();
        const accessToken = authHeaders.accessToken;

        const verificationData = {
            auth_algo: req.headers['paypal-auth-algo'],
            cert_url: req.headers['paypal-cert-url'],
            transmission_id: req.headers['paypal-transmission-id'],
            transmission_sig: req.headers['paypal-transmission-sig'],
            transmission_time: req.headers['paypal-transmission-time'],
            webhook_id: PAYPAL_WEBHOOK_ID,
            webhook_event: req.body
        };

        const response = await fetch(
            process.env.PAYPAL_MODE === 'live'
                ? 'https://api-m.paypal.com/v1/notifications/verify-webhook-signature'
                : 'https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(verificationData)
            }
        );

        const result = await response.json();
        return result.verification_status === 'SUCCESS';
    } catch {
        return false;
    }
}

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const verified = await verifyPayPalWebhook(req);
        if (!verified) {
            return res.status(401).json({ error: 'Webhook verification failed' });
        }

        const event = req.body;
        const eventId = event.id;

        const alreadyProcessed = await ProcessedWebhookEvent.findOne({ eventId, source: 'paypal' });
        if (alreadyProcessed) {
            return res.status(200).json({ received: true, duplicate: true });
        }

        const resource = event.resource;

        switch (event.event_type) {
            case 'PAYMENT.CAPTURE.COMPLETED': {
                const order = await OrderModel.findOne({ paymentId: resource.id });
                if (order) {
                    await OrderModel.findByIdAndUpdate(order._id, { payment_status: 'PAID' });
                    const customerEmail = order.delivery_address?.email;
                    if (customerEmail) {
                        await sendEmailFun({
                            sendTo: [customerEmail],
                            subject: `Order Confirmed - #${order._id.toString().slice(-8).toUpperCase()} | Yak Pashmina`,
                            text: '',
                            html: OrderConfirmationEmail(order.delivery_address?.firstName || 'Customer', order)
                        });
                    }
                    await sendEmailFun({
                        sendTo: [OWNER_EMAIL],
                        subject: `New PayPal Payment - #${order._id.toString().slice(-8).toUpperCase()}`,
                        text: '',
                        html: OrderConfirmationEmail(order.delivery_address?.firstName || 'Customer', order, true)
                    });
                }
                break;
            }
            case 'PAYMENT.CAPTURE.DENIED': {
                await OrderModel.findOneAndUpdate(
                    { paymentId: resource.id },
                    { payment_status: 'FAILED' }
                );
                break;
            }
            case 'PAYMENT.CAPTURE.REFUNDED': {
                await OrderModel.findOneAndUpdate(
                    { paymentId: resource.id },
                    { payment_status: 'REFUNDED' }
                );
                break;
            }
        }

        await ProcessedWebhookEvent.create({ eventId, source: 'paypal' }).catch(() => {});
        return res.status(200).json({ received: true });
    } catch (error) {
        console.error('PayPal webhook error:', error.message);
        return res.status(200).json({ received: true });
    }
});

router.get('/health', (req, res) => {
    res.json({ status: 'ok', configured: !!PAYPAL_WEBHOOK_ID });
});

export default router;
