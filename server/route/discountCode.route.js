import { Router } from 'express';
import auth from '../middlewares/auth.js';
import { createDiscountCode, getDiscountCodes, getDiscountCode, updateDiscountCode, deleteDiscountCode, validateDiscountCode, applyDiscountCode } from '../controllers/discountCode.controller.js';

const discountCodeRouter = Router();

discountCodeRouter.post('/create', auth, createDiscountCode);
discountCodeRouter.get('/', auth, getDiscountCodes);
discountCodeRouter.get('/:id', auth, getDiscountCode);
discountCodeRouter.put('/:id', auth, updateDiscountCode);
discountCodeRouter.delete('/:id', auth, deleteDiscountCode);
discountCodeRouter.post('/validate', validateDiscountCode);
discountCodeRouter.post('/apply', applyDiscountCode);

export default discountCodeRouter;