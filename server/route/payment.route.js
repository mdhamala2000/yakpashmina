import express from 'express';
import { createPaymentIntent, confirmPayment, getPaymentStatus, createStripePaymentIntent } from '../controllers/payment.controller.js';

const router = express.Router();

router.post('/create-payment-intent', createPaymentIntent);
router.post('/create-stripe-intent', createStripePaymentIntent);
router.post('/confirm', confirmPayment);
router.get('/status/:paymentIntentId', getPaymentStatus);

export default router;