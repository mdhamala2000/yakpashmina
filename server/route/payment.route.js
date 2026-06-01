import express from 'express';
import auth from '../middlewares/auth.js';
import { createStripePaymentIntent } from '../controllers/payment.controller.js';

const router = express.Router();

router.post('/create-stripe-intent', auth, createStripePaymentIntent);

export default router;