import { Router } from 'express';
import auth from '../middlewares/auth.js';
import {
    createVariant,
    createBulkVariants,
    getVariantsByProduct,
    getVariantById,
    updateVariant,
    deleteVariant,
    deleteBulkVariants,
    findVariantByOptions,
    getVariantCombinations,
    updateVariantStock,
    renameAttribute,
    updateAttributeNames,
    getVariantImages,
    addVariantImage,
    updateVariantImage,
    setPrimaryVariantImage,
    deleteVariantImage
} from '../controllers/variant.controller.js';

const variantRouter = Router();

variantRouter.post('/create', auth, createVariant);
variantRouter.post('/createBulk', auth, createBulkVariants);
variantRouter.get('/product/:productId', getVariantsByProduct);
variantRouter.get('/:id', getVariantById);
variantRouter.put('/:id', auth, updateVariant);
variantRouter.delete('/:id', auth, deleteVariant);
variantRouter.post('/deleteBulk', auth, deleteBulkVariants);
variantRouter.post('/findByOptions/:productId', findVariantByOptions);
variantRouter.get('/combinations/:productId', getVariantCombinations);
variantRouter.put('/stock/:id', auth, updateVariantStock);
variantRouter.put('/rename-attribute/:productId', auth, renameAttribute);
variantRouter.put('/attribute-names/:productId', auth, updateAttributeNames);

variantRouter.get('/images/:productId', getVariantImages);
variantRouter.post('/images/add', auth, addVariantImage);
variantRouter.put('/images/:id', auth, updateVariantImage);
variantRouter.post('/images/set-primary/:productId', auth, setPrimaryVariantImage);
variantRouter.delete('/images/:id', auth, deleteVariantImage);

export default variantRouter;