import express from 'express';
import auth, { requireAdmin } from '../middlewares/auth.js';
import { 
    getPaymentGateways, 
    getPaymentGateway, 
    createPaymentGateway, 
    updatePaymentGateway, 
    deletePaymentGateway,
    togglePaymentGateway,
    getCredentials,
    initializePaymentGateways,
    testPaymentGateway
} from '../controllers/paymentGateway.controller.js';

const router = express.Router();

router.post('/init', initializePaymentGateways);
router.get('/', auth, requireAdmin, getPaymentGateways);
router.post('/', auth, requireAdmin, createPaymentGateway);
router.get('/credentials', auth, requireAdmin, getCredentials);
router.post('/test', auth, requireAdmin, testPaymentGateway);
router.get('/:id', auth, requireAdmin, getPaymentGateway);
router.put('/:id', auth, requireAdmin, updatePaymentGateway);
router.delete('/:id', auth, requireAdmin, deletePaymentGateway);
router.post('/:id/toggle', auth, requireAdmin, togglePaymentGateway);

export default router;