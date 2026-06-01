import { Router } from 'express'
import auth from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';
import {createProduct, createProductRAMS, deleteMultipleProduct, deleteProduct, deleteProductRAMS, getAllFeaturedProducts, getAllProducts, getAllProductsByCatId, getAllProductsByCatName, getAllProductsByPrice, getAllProductsByRating, getAllProductsBySubCatId, getAllProductsBySubCatName, getAllProductsByThirdLavelCatId, getProduct, getProductRams, getProductsCount, updateProduct, updateProductRam, uploadImages, getProductRamsById, createProductWEIGHT, deleteProductWEIGHT, updateProductWeight, getProductWeight, getProductWeightById, createProductSize, deleteProductSize, updateProductSize, getProductSize, getProductSizeById, uploadBannerImages, getAllProductsBanners, filters, sortBy, searchProductController, createProductColor, deleteProductColor, updateProductColor, getProductColor, getProductColorById, createProductMaterials, deleteProductMaterials, updateProductMaterials, getProductMaterials, getProductMaterialsById, enrichVariants} from '../controllers/product.controller.js';

import {removeImageFromCloudinary} from '../controllers/category.controller.js';

const productRouter = Router();

productRouter.post('/uploadImages',auth,upload.array('images'),uploadImages);
productRouter.post('/uploadBannerImages',auth,upload.array('bannerimages'),uploadBannerImages);
productRouter.post('/create',auth,createProduct);
productRouter.get('/getAllProducts',getAllProducts);
productRouter.get('/getAllProductsBanners',getAllProductsBanners);
productRouter.get('/getAllProductsByCatId/:id',getAllProductsByCatId);
productRouter.get('/getAllProductsByCatName',getAllProductsByCatName);
productRouter.get('/getAllProductsBySubCatId/:id',getAllProductsBySubCatId);
productRouter.get('/getAllProductsBySubCatName',getAllProductsBySubCatName);
productRouter.get('/getAllProductsByThirdLavelCat/:id',getAllProductsByThirdLavelCatId);
productRouter.get('/getAllProductsByThirdLavelCatName',getAllProductsBySubCatName);
productRouter.get('/getAllProductsByPrice',getAllProductsByPrice);
productRouter.get('/getAllProductsByRating',getAllProductsByRating);
productRouter.get('/getAllProductsCount',getProductsCount);
productRouter.get('/getAllFeaturedProducts',getAllFeaturedProducts);
productRouter.delete('/deleteMultiple',auth,deleteMultipleProduct);
productRouter.delete('/:id',auth,deleteProduct);
productRouter.get('/:id',getProduct);
productRouter.delete('/deteleImage',auth,removeImageFromCloudinary);
productRouter.put('/updateProduct/:id',auth,updateProduct);

productRouter.post('/productRAMS/create',auth,createProductRAMS);
productRouter.delete('/productRAMS/:id',auth,deleteProductRAMS);
productRouter.put('/productRAMS/:id',auth,updateProductRam);
productRouter.get('/productRAMS/get',getProductRams);
productRouter.get('/productRAMS/:id',getProductRamsById);

productRouter.post('/productWeight/create',auth,createProductWEIGHT);
productRouter.delete('/productWeight/:id',auth,deleteProductWEIGHT);
productRouter.put('/productWeight/:id',auth,updateProductWeight);
productRouter.get('/productWeight/get',getProductWeight);
productRouter.get('/productWeight/:id',getProductWeightById);


productRouter.post('/productSize/create',auth,createProductSize);
productRouter.delete('/productSize/:id',auth,deleteProductSize);
productRouter.put('/productSize/:id',auth,updateProductSize);
productRouter.get('/productSize/get',getProductSize);
productRouter.get('/productSize/:id',getProductSizeById);

productRouter.post('/productColor/create',auth,createProductColor);
productRouter.delete('/productColor/:id',auth,deleteProductColor);
productRouter.put('/productColor/:id',auth,updateProductColor);
productRouter.get('/productColor/get',getProductColor);
productRouter.get('/productColor/:id',getProductColorById);

productRouter.post('/productMaterials/create',auth,createProductMaterials);
productRouter.delete('/productMaterials/:id',auth,deleteProductMaterials);
productRouter.put('/productMaterials/:id',auth,updateProductMaterials);
productRouter.get('/productMaterials/get',getProductMaterials);
productRouter.get('/productMaterials/:id',getProductMaterialsById);

productRouter.post('/filters',filters);
productRouter.post('/sortBy',sortBy);
productRouter.post('/search/get',searchProductController);

// ====================
// SEO SLUG-BASED ROUTES
// ====================

// Get product by slug
productRouter.get('/slug/:slug', async (req, res) => {
    try {
        const ProductModel = (await import('../models/product.modal.js')).default;
        const product = await ProductModel.findOne({ 
            slug: req.params.slug, 
            isDeleted: false 
        });
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        const enriched = await enrichVariants([product]);
        const enrichedProduct = enriched[0] || product;
        
        return res.status(200).json({
            success: true,
            product: enrichedProduct
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get products by category slug
productRouter.get('/by-category-slug', async (req, res) => {
    try {
        const { categorySlug, page = 1, limit = 12, sort = '-createdAt' } = req.query;
        const ProductModel = (await import('../models/product.modal.js')).default;
        
        const query = { 
            categorySlug: categorySlug, 
            isDeleted: false 
        };
        
        // Build sort options
        let sortOptions = {};
        if (sort === 'price-low') sortOptions = { price: 1 };
        else if (sort === 'price-high') sortOptions = { price: -1 };
        else if (sort === 'popular') sortOptions = { rating: -1 };
        else sortOptions = { createdAt: -1 };
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const products = await ProductModel.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));
        
        const enriched = await enrichVariants(products);
        const totalProducts = await ProductModel.countDocuments(query);
        
        return res.status(200).json({
            success: true,
            products: enriched,
            totalProducts,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalProducts / parseInt(limit))
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get products by subcategory slug
productRouter.get('/by-subcategory-slug', async (req, res) => {
    try {
        const { categorySlug, subCategorySlug, page = 1, limit = 12, sort = '-createdAt' } = req.query;
        const ProductModel = (await import('../models/product.modal.js')).default;
        
        const query = { 
            categorySlug: categorySlug,
            subCategorySlug: subCategorySlug, 
            isDeleted: false 
        };
        
        let sortOptions = {};
        if (sort === 'price-low') sortOptions = { price: 1 };
        else if (sort === 'price-high') sortOptions = { price: -1 };
        else if (sort === 'popular') sortOptions = { rating: -1 };
        else sortOptions = { createdAt: -1 };
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const products = await ProductModel.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));
        
        const enriched = await enrichVariants(products);
        const totalProducts = await ProductModel.countDocuments(query);
        
        return res.status(200).json({
            success: true,
            products: enriched,
            totalProducts,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalProducts / parseInt(limit))
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default productRouter;