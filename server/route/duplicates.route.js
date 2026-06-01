import express from 'express';
import CategoryModel from '../models/category.modal.js';
import ProductModel from '../models/product.modal.js';

const router = express.Router();

// ===========================================
// REAL-TIME DUPLICATE CHECK ENDPOINTS
// ===========================================

// Check duplicate category
// Usage: GET /api/duplicates/category?name=Women&parentId=abc123
router.get('/category', async (req, res) => {
    try {
        const { name, parentId, excludeId } = req.query;
        
        if (!name) {
            return res.status(400).json({
                error: true,
                message: 'Name is required'
            });
        }
        
        const result = await CategoryModel.checkDuplicateName(name, parentId || null, excludeId || null);
        
        return res.status(200).json({
            isDuplicate: result.isDuplicate,
            message: result.message,
            existingId: result.existingId,
            success: !result.isDuplicate
        });
        
    } catch (error) {
        console.error('Category duplicate check error:', error);
        return res.status(500).json({
            error: true,
            message: error.message
        });
    }
});

// Check duplicate subcategory (same as category - it's hierarchical)
router.get('/subcategory', async (req, res) => {
    try {
        const { name, parentId, excludeId } = req.query;
        
        if (!name) {
            return res.status(400).json({
                error: true,
                message: 'Name is required'
            });
        }
        
        const result = await CategoryModel.checkDuplicateName(name, parentId || null, excludeId || null);
        
        return res.status(200).json({
            isDuplicate: result.isDuplicate,
            message: result.message,
            existingId: result.existingId,
            success: !result.isDuplicate
        });
        
    } catch (error) {
        console.error('Subcategory duplicate check error:', error);
        return res.status(500).json({
            error: true,
            message: error.message
        });
    }
});

// Check duplicate product
// Usage: GET /api/duplicates/product?sku=ABC123&name=ProductName&categoryId=abc123
router.get('/product', async (req, res) => {
    try {
        const { sku, name, categoryId, excludeId } = req.query;
        
        let skuResult = { isDuplicate: false };
        let nameResult = { isDuplicate: false };
        
        // Check SKU if provided
        if (sku && sku.trim() !== '') {
            skuResult = await ProductModel.checkDuplicateSku(sku, excludeId || null);
        }
        
        // Check name in category if provided
        if (name && categoryId) {
            nameResult = await ProductModel.checkDuplicateNameInCategory(name, categoryId, excludeId || null);
        }
        
        // Return the first duplicate found (SKU has priority)
        if (skuResult.isDuplicate) {
            return res.status(200).json({
                isDuplicate: true,
                type: 'sku',
                message: skuResult.message,
                existingId: skuResult.existingId,
                success: false
            });
        }
        
        if (nameResult.isDuplicate) {
            return res.status(200).json({
                isDuplicate: true,
                type: 'name',
                message: nameResult.message,
                existingId: nameResult.existingId,
                success: false
            });
        }
        
        return res.status(200).json({
            isDuplicate: false,
            message: 'No duplicates found',
            success: true
        });
        
    } catch (error) {
        console.error('Product duplicate check error:', error);
        return res.status(500).json({
            error: true,
            message: error.message
        });
    }
});

// Check duplicate slug (for categories, subcategories, or products)
router.get('/slug', async (req, res) => {
    try {
        const { slug, type, excludeId } = req.query;
        
        if (!slug || !type) {
            return res.status(400).json({
                error: true,
                message: 'Slug and type are required'
            });
        }
        
        let result;
        
        if (type === 'category' || type === 'subcategory') {
            result = await CategoryModel.checkDuplicateSlug(slug, excludeId || null);
        } else if (type === 'product') {
            result = await ProductModel.checkDuplicateProductSlug(slug, excludeId || null);
        } else {
            return res.status(400).json({
                error: true,
                message: 'Invalid type. Use: category, subcategory, or product'
            });
        }
        
        return res.status(200).json({
            isDuplicate: result.isDuplicate,
            message: result.message,
            existingId: result.existingId,
            success: !result.isDuplicate
        });
        
    } catch (error) {
        console.error('Slug duplicate check error:', error);
        return res.status(500).json({
            error: true,
            message: error.message
        });
    }
});

export default router;