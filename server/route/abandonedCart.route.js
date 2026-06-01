import express from 'express';
import auth, { requireAdmin } from '../middlewares/auth.js';
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

router.get('/all-carts', auth, requireAdmin, getAllCartsAdmin);
router.get('/all', auth, requireAdmin, getAllAbandonedCarts);
router.get('/stats', auth, requireAdmin, getAbandonedCartStats);
router.post('/reminder/bulk', auth, requireAdmin, sendBulkReminders);
router.post('/reminder/automated', auth, requireAdmin, sendAutomatedReminders);
router.post('/reminder/:cartId', auth, requireAdmin, sendAbandonedCartReminder);
router.delete('/:id', auth, requireAdmin, deleteAbandonedCart);
router.put('/:id/status', auth, requireAdmin, updateCartStatus);
router.put('/:id/recover', auth, requireAdmin, updateCartStatus);
router.get('/wishlist/old', auth, requireAdmin, getLongTimeWishlistItems);
router.post('/detect', auth, requireAdmin, runAbandonedCartDetection);

export default router;