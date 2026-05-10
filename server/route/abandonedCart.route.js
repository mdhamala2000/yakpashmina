import express from 'express';
import { 
    getAllCartsAdmin,
    getAllAbandonedCarts,
    getAbandonedCartStats,
    sendAbandonedCartReminder,
    sendBulkReminders,
    sendAutomatedReminders,
    deleteAbandonedCart,
    getLongTimeWishlistItems,
    runAbandonedCartDetection,
    updateCartStatus
} from '../controllers/abandonedCart.controller.js';

const router = express.Router();

router.get('/all-carts', getAllCartsAdmin);
router.get('/all', getAllAbandonedCarts);
router.get('/stats', getAbandonedCartStats);
router.post('/reminder/bulk', sendBulkReminders);
router.post('/reminder/automated', sendAutomatedReminders);
router.post('/reminder/:cartId', sendAbandonedCartReminder);
router.delete('/:id', deleteAbandonedCart);
router.put('/:id/status', updateCartStatus);
router.put('/:id/recover', updateCartStatus);
router.get('/wishlist/old', getLongTimeWishlistItems);
router.post('/detect', runAbandonedCartDetection);

export default router;