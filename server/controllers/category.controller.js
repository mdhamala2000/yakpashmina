import CategoryModel from '../models/category.modal.js';
import ProductModel from '../models/product.modal.js';
import mongoose from 'mongoose';

// SlugRedirectModel - commented out due to import issue
// import SlugRedirectModel from '../models/slugRedirect.model.js';

import cloudinary from '../config/cloudinaryConfig.js';
import fs from 'fs';


export async function uploadImages(request, response) {
    try {
        const image = request.files;

        if (!image || image.length === 0) {
            return response.status(400).json({
                message: "No files uploaded",
                error: true,
                success: false
            });
        }

        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: false,
        };

        const results = await Promise.all(image.map(async (file) => {
            const result = await cloudinary.uploader.upload(file.path, options);
            try { fs.unlinkSync(file.path); } catch (e) { /* ignore */ }
            return result.secure_url;
        }));

        return response.status(200).json({
            images: results
        });

    } catch (error) {
        console.error('Upload error:', error);
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}



//create category
export async function createCategory(request, response) {
    try {
        let categoryImages = [];
        if (request.body.images) {
            if (Array.isArray(request.body.images)) {
                categoryImages = request.body.images.filter(img => img && typeof img === 'string' && img.trim() !== '');
            } else if (typeof request.body.images === 'string' && request.body.images.trim()) {
                categoryImages = [request.body.images];
            }
        }
        
        console.log('Creating category - images:', categoryImages);

        // Handle parentId - convert to null for empty/undefined
        let parentId = null;
        if (request.body.parentId && request.body.parentId !== 'undefined' && request.body.parentId !== '') {
            parentId = request.body.parentId;
        }

        // Get parent category name if parentId exists
        let parentCatName = '';
        if (parentId) {
            try {
                const parentCategory = await CategoryModel.findById(parentId);
                if (parentCategory) {
                    parentCatName = parentCategory.name;
                }
            } catch (e) {
                console.log('Parent category not found:', e);
            }
        }

        // Handle description - if not provided, use empty string
        const description = request.body.description || '';

        let category = new CategoryModel({
            name: request.body.name,
            images: categoryImages,
            parentId: parentId,
            parentCatName: parentCatName,
            description: description,
            metaTitle: request.body.metaTitle || '',
            metaDescription: request.body.metaDescription || '',
            slug: request.body.slug || ''
        });

        if (!category) {
            return response.status(500).json({
                message: "Category not created",
                error: true,
                success: false
            })
        }

        category = await category.save();

        return response.status(200).json({
            message: "Category created",
            error: false,
            success: true,
            category: category
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


//get Categories
export async function getCategories(request, response) {
    try {
        const categories = await CategoryModel.find();
        
        const categoriesWithCount = await Promise.all(
            categories.map(async (cat) => {
                const productCount = await ProductModel.countDocuments({ 
                    $or: [
                        { category: cat._id },
                        { catId: cat._id.toString() },
                        { subCatId: cat._id.toString() },
                        { thirdsubCatId: cat._id.toString() },
                        { parentCatName: cat.name }
                    ]
                });
                return {
                    ...cat._doc,
                    productCount: productCount
                };
            })
        );
        
        const categoryMap = {};

        categoriesWithCount.forEach(cat => {
            categoryMap[cat._id] = { ...cat, children: [] };
        });

        const rootCategories = [];

        categoriesWithCount.forEach(cat => {
            if (cat.parentId) {
                if (categoryMap[cat.parentId]) {
                    categoryMap[cat.parentId].children.push(categoryMap[cat._id]);
                }
            } else {
                rootCategories.push(categoryMap[cat._id]);
            }
        });

        return response.status(200).json({
            error: false,
            success: true,
            data: rootCategories
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


//get category count
export async function getCategoriesCount(request, response) {
    try {
        const categoryCount = await CategoryModel.countDocuments({ parentId: undefined });
        if (!categoryCount) {
            return response.status(500).json({ success: false, error: true });
        }
        return response.send({
            categoryCount: categoryCount,
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}



//get sub category count
export async function getSubCategoriesCount(request, response) {
    try {
        const categories = await CategoryModel.find();
        if (!categories) {
            return response.status(500).json({ success: false, error: true });
        }

        const subCatList = [];
        for (let cat of categories) {
            if (cat.parentId !== undefined) {
                subCatList.push(cat);
            }
        }

        return response.send({
            SubCategoryCount: subCatList.length,
        });


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


//get single category
 
export async function getCategory(request, response) {
    try {
        const category = await CategoryModel.findById(request.params.id);


        if (!category) {
            return response.status(500)
                .json(
                    {
                        message: "The category with the given ID was not found.",
                        error: true,
                        success: false
                    }
                );
        }


        return response.status(200).json({
            error: false,
            success: true,
            category: category
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}



export async function removeImageFromCloudinary(request, response) {
    try {
        const imgUrl = request.query.img;
        if (!imgUrl) {
            return response.status(400).json({ error: true, message: "Image URL is required" });
        }
        const urlArr = imgUrl.split("/");
        const imageName = urlArr[urlArr.length - 1].split(".")[0];
        if (!imageName) {
            return response.status(400).json({ error: true, message: "Invalid image URL" });
        }
        const res = await cloudinary.uploader.destroy(imageName);
        return response.status(200).send(res);
    } catch (error) {
        return response.status(500).json({ message: error.message || error, error: true, success: false });
    }
}


export async function deleteCategory(request, response) {
    try {
        const categoryId = request.params.id;

        const getAllSubcategoryIds = async (catId) => {
            const children = await CategoryModel.find({ parentId: catId });
            let ids = [catId.toString()];
            for (const child of children) {
                const childIds = await getAllSubcategoryIds(child._id);
                ids = [...ids, ...childIds];
            }
            return ids;
        };

        const allCategoryIds = await getAllSubcategoryIds(categoryId);

        const productCount = await ProductModel.countDocuments({
            $or: [
                { catId: { $in: allCategoryIds } },
                { subCatId: { $in: allCategoryIds } },
                { thirdsubCatId: { $in: allCategoryIds } },
                { category: { $in: allCategoryIds } }
            ]
        });

        if (productCount > 0) {
            return response.status(400).json({
                message: `Cannot delete this category as it contains ${productCount} product(s). Please remove all products first.`,
                error: true,
                success: false
            });
        }

        const category = await CategoryModel.findById(request.params.id);
        const images = category.images || [];
        for (const img of images) {
            const urlArr = img.split("/");
            const imageName = urlArr[urlArr.length - 1].split(".")[0];
            if (imageName) {
                cloudinary.uploader.destroy(imageName, () => {});
            }
        }

        const subCategory = await CategoryModel.find({ parentId: request.params.id });
        for (let i = 0; i < subCategory.length; i++) {
            const thirdsubCategory = await CategoryModel.find({ parentId: subCategory[i]._id });
            for (let j = 0; j < thirdsubCategory.length; j++) {
                await CategoryModel.findByIdAndDelete(thirdsubCategory[j]._id);
            }
            await CategoryModel.findByIdAndDelete(subCategory[i]._id);
        }

        const deletedCat = await CategoryModel.findByIdAndDelete(request.params.id);
        if (!deletedCat) {
            return response.status(404).json({
                message: "Category not found!",
                success: false,
                error: true
            });
        }

        return response.status(200).json({
            success: true,
            error: false,
            message: "Category Deleted!",
        });
    } catch (error) {
        return response.status(500).json({ message: error.message || error, error: true, success: false });
    }
}

export async function updatedCategory(request, response){
    const oldCategory = await CategoryModel.findById(request.params.id);

    if (!oldCategory) {
        return response.status(404).json({
            message: "Category not found!",
            success: false,
            error: true
        });
    }

    let updateImages = oldCategory.images;
    if (request.body.images) {
        if (Array.isArray(request.body.images)) {
            updateImages = request.body.images;
        } else {
            updateImages = [request.body.images];
        }
    }

    // Handle parentId properly - convert to null for empty/undefined
    let newParentId = oldCategory.parentId;
    if (request.body.parentId !== undefined) {
        if (request.body.parentId && request.body.parentId !== 'undefined' && request.body.parentId !== '') {
            newParentId = request.body.parentId;
        } else {
            newParentId = null;
        }
    }

    // Get parent category name if parentId changed
    let parentCatName = oldCategory.parentCatName;
    if (newParentId !== oldCategory.parentId) {
        if (newParentId) {
            try {
                const parentCategory = await CategoryModel.findById(newParentId);
                parentCatName = parentCategory?.name || '';
            } catch (e) {
                parentCatName = '';
            }
        } else {
            parentCatName = '';
        }
    }

    const updates = {
        name: request.body.name,
        images: updateImages,
        parentId: newParentId,
        parentCatName: parentCatName,
        description: request.body.description || '',
    };

    // Handle SEO fields
    if (request.body.slug !== undefined) updates.slug = request.body.slug;
    if (request.body.metaTitle !== undefined) updates.metaTitle = request.body.metaTitle;
    if (request.body.metaDescription !== undefined) updates.metaDescription = request.body.metaDescription;

    // Create slug redirect if slug changed (disabled - import issue)
    // if (request.body.slug && request.body.slug !== oldCategory.slug) {
    //     const existingRedirect = await SlugRedirectModel.findOne({
    //         oldSlug: oldCategory.slug,
    //         entityType: 'category'
    //     });
    //     if (!existingRedirect) {
    //         await SlugRedirectModel.create({
    //             oldSlug: oldCategory.slug,
    //             newSlug: request.body.slug,
    //             entityType: 'category',
    //             entityId: oldCategory._id,
    //             httpStatus: 301
    //         });
    //     }
    // }

    const category = await CategoryModel.findByIdAndUpdate(
        request.params.id,
        updates,
        { new: true }
    );

    if (!category) {
        return response.status(500).json({
            message: "Category cannot be updated!",
            success: false,
            error: true
        });
    }

    return response.status(200).json({
        error: false,
        success: true,
        category: category,
        message: "Category updated successfully",
        slugChanged: request.body.slug !== oldCategory.slug
    });
}

// =======================
// NEW SEO & SYNC FUNCTIONS
// =======================

// Get category by slug (for SEO-friendly URLs)
export async function getCategoryBySlug(request, response) {
    try {
        const { slug } = request.params;
        const category = await CategoryModel.findOne({ 
            slug: slug, 
            isDeleted: false 
        }).populate('parentId', 'name slug');
        
        if (!category) {
            return response.status(404).json({
                message: "Category not found",
                error: true,
                success: false
            });
        }
        
        // Get product count
        const productCount = await ProductModel.countDocuments({
            $or: [
                { category: category._id },
                { catId: category._id.toString() },
                { subCatId: category._id.toString() }
            ],
            isDeleted: false
        });
        
        return response.status(200).json({
            error: false,
            success: true,
            data: { ...category._doc, productCount }
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message,
            error: true,
            success: false
        });
    }
}

// Delete category with options (cascade or reassign)
export async function deleteCategoryWithOptions(request, response) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { id } = request.params;
        const { mode, reassignToCategoryId } = request.body; // 'cascade' or 'reassign'
        
        const category = await CategoryModel.findById(id);
        if (!category) {
            return response.status(404).json({
                message: "Category not found",
                error: true,
                success: false
            });
        }
        
        // Get all subcategory IDs recursively
        const getAllSubcategoryIds = async (catId) => {
            const children = await CategoryModel.find({ parentId: catId });
            let ids = [catId.toString()];
            for (const child of children) {
                const childIds = await getAllSubcategoryIds(child._id);
                ids = [...ids, ...childIds];
            }
            return ids;
        };
        
        const allCategoryIds = await getAllSubcategoryIds(id);
        
        if (mode === 'cascade') {
            // Delete all subcategories
            await CategoryModel.updateMany(
                { parentId: { $in: allCategoryIds } },
                { $set: { isDeleted: true } },
                { session }
            );
            
            // Delete all products in these categories
            await ProductModel.updateMany(
                { 
                    $or: [
                        { category: { $in: allCategoryIds } },
                        { catId: { $in: allCategoryIds } },
                        { subCatId: { $in: allCategoryIds } }
                    ]
                },
                { $set: { isDeleted: true } },
                { session }
            );
            
            // Delete the main category
            await CategoryModel.findByIdAndUpdate(id, 
                { $set: { isDeleted: true } },
                { session }
            );
            
        } else if (mode === 'reassign' && reassignToCategoryId) {
            const newCategory = await CategoryModel.findById(reassignToCategoryId);
            if (!newCategory) {
                throw new Error('Reassign category not found');
            }
            
            // Get new category info
            const newCatName = newCategory.name;
            const newCatSlug = newCategory.slug;
            
            // Reassign subcategories to new parent (or make them root)
            await CategoryModel.updateMany(
                { parentId: { $in: allCategoryIds } },
                { 
                    $set: { 
                        parentId: reassignToCategoryId,
                        parentCatName: newCatName
                    }
                },
                { session }
            );
            
            // Reassign products
            await ProductModel.updateMany(
                { 
                    $or: [
                        { category: { $in: allCategoryIds } },
                        { catId: { $in: allCategoryIds } },
                        { subCatId: { $in: allCategoryIds } }
                    ]
                },
                { 
                    $set: { 
                        category: reassignToCategoryId,
                        catId: reassignToCategoryId.toString(),
                        catName: newCatName,
                        categorySlug: newCatSlug
                    }
                },
                { session }
            );
            
            // Soft delete the category
            await CategoryModel.findByIdAndUpdate(id,
                { $set: { isDeleted: true } },
                { session }
            );
        } else {
            throw new Error('Invalid mode. Use "cascade" or "reassign"');
        }
        
        await session.commitTransaction();
        session.endSession();
        
        return response.status(200).json({
            message: "Category deleted successfully",
            error: false,
            success: true
        });
        
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        
        return response.status(500).json({
            message: error.message,
            error: true,
            success: false
        });
    }
}

// Check slug uniqueness
export async function checkSlugUniqueness(request, response) {
    try {
        const { slug, type, excludeId } = request.query;
        
        let isUnique = false;
        
        if (type === 'category') {
            isUnique = await CategoryModel.isSlugUnique(slug, excludeId);
        } else if (type === 'product') {
            isUnique = await ProductModel.isSlugUnique(slug, excludeId);
        }
        
        return response.status(200).json({
            unique: isUnique,
            error: false,
            success: true
        });
        
    } catch (error) {
        return response.status(500).json({
            message: error.message,
            error: true,
            success: false
        });
    }
}

// Get categories for sitemap
export async function getCategoriesForSitemap(request, response) {
    try {
        const categories = await CategoryModel.find({ 
            isDeleted: false 
        })
        .select('slug updatedAt')
        .lean();
        
        return response.status(200).json({
            data: categories,
            error: false,
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message,
            error: true,
            success: false
        });
    }
}