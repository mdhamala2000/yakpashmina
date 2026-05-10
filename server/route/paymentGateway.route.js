import express from 'express';
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
router.get('/', getPaymentGateways);
router.post('/', createPaymentGateway);
router.get('/credentials', getCredentials);
router.post('/test', testPaymentGateway);
router.get('/:id', getPaymentGateway);
router.put('/:id', updatePaymentGateway);
router.delete('/:id', deletePaymentGateway);
router.post('/:id/toggle', togglePaymentGateway);

export default router;