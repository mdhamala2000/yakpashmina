import { Router } from 'express'
import auth from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';
import { 
    createCategory, 
    deleteCategory, 
    getCategories, 
    getCategoriesCount, 
    getCategory, 
    getSubCategoriesCount, 
    removeImageFromCloudinary, 
    updatedCategory, 
    uploadImages,
    getCategoryBySlug,
    deleteCategoryWithOptions,
    checkSlugUniqueness,
    getCategoriesForSitemap
} from '../controllers/category.controller.js';

const categoryRouter = Router();

// Public routes (for SEO)
categoryRouter.get('/slug/:slug', getCategoryBySlug);
categoryRouter.get('/sitemap', getCategoriesForSitemap);
categoryRouter.get('/slug-check', checkSlugUniqueness); // ?slug=xxx&type=category

// Protected routes - upload first (separate endpoint), then create/update with URLs
categoryRouter.post('/uploadImages', auth, upload.array('images'), uploadImages);

// Create category - receives image URLs in JSON body (from frontend upload)
categoryRouter.post('/create', auth, createCategory);

categoryRouter.get('/', getCategories);
categoryRouter.get('/get/count', getCategoriesCount);
categoryRouter.get('/get/count/subCat', getSubCategoriesCount);
categoryRouter.get('/:id', getCategory);
categoryRouter.delete('/deteleImage', auth, removeImageFromCloudinary);

// Delete with options (cascade or reassign)
categoryRouter.delete('/:id/delete-with-options', auth, deleteCategoryWithOptions);

// Legacy delete - keep for backward compatibility
categoryRouter.delete('/:id', auth, deleteCategory);

// Update category - receives image URLs in JSON body
categoryRouter.put('/:id', auth, updatedCategory);


export default categoryRouter;