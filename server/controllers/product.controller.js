import ProductModel from '../models/product.modal.js';
import ProductRAMSModel from '../models/productRAMS.js';
import ProductWEIGHTModel from '../models/productWEIGHT.js';
import ProductSIZEModel from '../models/productSIZE.js';
import ProductColorModel from '../models/productColor.js';
import ProductMaterialsModel from '../models/productMaterials.js';
import CategoryModel from '../models/category.modal.js';
import VariantModel from '../models/variant.model.js';

import cloudinary from '../config/cloudinaryConfig.js';
import fs from 'fs';


// Helper: enrich variant products with aggregated variant data
export async function enrichVariants(products) {
    if (!products || products.length === 0) return products;
    const variantProductIds = products.filter(p => p.hasVariants).map(p => p._id);
    if (variantProductIds.length === 0) return products;

    const variantAggs = await VariantModel.aggregate([
        { $match: { product: { $in: variantProductIds }, isDeleted: false, isActive: true } },
        { $group: {
            _id: '$product',
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' },
            minOldPrice: { $min: '$oldPrice' },
            totalStock: { $sum: '$stock' },
            variantCount: { $sum: 1 }
        }}
    ]);

    const aggMap = {};
    variantAggs.forEach(a => { aggMap[a._id.toString()] = a; });

    return products.map(p => {
        const pObj = p.toObject ? p.toObject() : { ...p };
        if (pObj.hasVariants && aggMap[pObj._id?.toString()]) {
            const agg = aggMap[pObj._id.toString()];
            pObj.effectivePrice = agg.minPrice;
            pObj.effectiveOldPrice = agg.minOldPrice;
            pObj.effectiveStock = agg.totalStock;
            pObj.variantCount = agg.variantCount;
            pObj.effectiveDiscount = agg.minOldPrice > 0
                ? Math.round(((agg.minOldPrice - agg.minPrice) / agg.minOldPrice) * 100)
                : 0;
        }
        return pObj;
    });
}

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
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function uploadBannerImages(request, response) {
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
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


//create product
export async function createProduct(request, response) {
    try {
        // Check for duplicate SKU if provided
        if (request.body.sku && request.body.sku.trim() !== '') {
            const skuCheck = await ProductModel.checkDuplicateSku(request.body.sku.trim());
            if (skuCheck.isDuplicate) {
                return response.status(400).json({
                    error: true,
                    success: false,
                    message: `A product with SKU "${request.body.sku}" already exists. Please use a unique SKU.`
                });
            }
        }

        // Check for duplicate name in same category if both provided
        if (request.body.name && request.body.catId) {
            const nameCheck = await ProductModel.checkDuplicateNameInCategory(request.body.name, request.body.catId);
            if (nameCheck.isDuplicate) {
                return response.status(400).json({
                    error: true,
                    success: false,
                    message: `A product with name "${request.body.name}" already exists in this category.`
                });
            }
        }

        // Handle images - from request body (URLs from frontend)
        let productImages = [];
        if (request.body.images) {
            if (Array.isArray(request.body.images)) {
                productImages = request.body.images.filter(img => img && img.trim() !== '');
            } else if (typeof request.body.images === 'string' && request.body.images.trim()) {
                productImages = [request.body.images];
            }
        }

        // Auto calculate discount - exact percentage with proper rounding
        let discount = 0;
        if (request.body.oldPrice && request.body.price && request.body.oldPrice > 0 && request.body.price > 0 && request.body.oldPrice > request.body.price) {
            const discountAmount = request.body.oldPrice - request.body.price;
            discount = Math.floor((discountAmount / request.body.oldPrice) * 100);
        }

        let product = new ProductModel({
            name: request.body.name,
            sku: request.body.sku || '',
            slug: request.body.slug || request.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            metaTitle: request.body.metaTitle || '',
            metaDescription: request.body.metaDescription || '',
            description: request.body.description,
            shortDescription: request.body.shortDescription || '',
            images: productImages,
            bannerimages: request.body.bannerimages || [],
            bannerTitleName: request.body.bannerTitleName,
            isDisplayOnHomeBanner: request.body.isDisplayOnHomeBanner,
            brand: request.body.brand,
            price: Number(request.body.price) || 0,
            oldPrice: Number(request.body.oldPrice) || 0,
            catName: request.body.catName || '',
            category: request.body.category || null,
            catId: request.body.catId || '',
            subCatId: request.body.subCatId || '',
            subCat: request.body.subCat || '',
            thirdsubCat: request.body.thirdsubCat || '',
            thirdsubCatId: request.body.thirdsubCatId || '',
            countInStock: Number(request.body.countInStock) || 0,
            rating: 0,
            isFeatured: request.body.isFeatured,
            discount: discount,
            productRam: request.body.productRam || [],
            size: request.body.size || [],
            productWeight: request.body.productWeight || [],
            color: request.body.color || [],
            materials: Array.isArray(request.body.materials) ? request.body.materials.join(', ') : (request.body.materials || ''),
            productMaterials: request.body.productMaterials || [],
            hasVariants: request.body.hasVariants === true,
            variantAttributeNames: Array.isArray(request.body.variantAttributeNames) ? request.body.variantAttributeNames : []

        });

        product = await product.save();

        if (!product) {
            return response.status(500).json({
                error: true,
                success: false,
                message: "Product Not created"
            });
        }

        return response.status(200).json({
            message: "Product Created successfully",
            error: false,
            success: true,
            product: product
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}



//get all products
export async function getAllProducts(request, response) {
    try {

        const { page, limit } = request.query;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        
        const totalProducts = await ProductModel.find();
        const total = await ProductModel.countDocuments();

        const products = await ProductModel.find().sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum);

        if (!products) {
            return response.status(400).json({
                error: true,
                success: false
            })
        }

        const enriched = await enrichVariants(products);

        return response.status(200).json({
            error: false,
            success: true,
            products: enriched,
            total: total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
            totalCount: totalProducts?.length,
            totalProducts: await enrichVariants(totalProducts)
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


//get all products by category id (including subcategories)
export async function getAllProductsByCatId(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;

        // Get all subcategory IDs (children) recursively
        const getAllSubcategoryIds = async (catId) => {
            const children = await CategoryModel.find({ parentId: catId });
            let ids = [catId];
            for (const child of children) {
                const childIds = await getAllSubcategoryIds(child._id);
                ids = [...ids, ...childIds];
            }
            return ids;
        };

        const allCategoryIds = await getAllSubcategoryIds(request.params.id);

        // Get products from all categories (main + subcategories)
        const products = await ProductModel.find({
            $or: [
                { catId: { $in: allCategoryIds.map(id => id.toString()) } },
                { category: { $in: allCategoryIds } }
            ]
        }).populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        const totalPosts = products.length;

        const enriched = await enrichVariants(products);

        return response.status(200).json({
            error: false,
            success: true,
            products: enriched,
            data: {
                page,
                perPage,
                totalPosts,
                totalPages: Math.ceil(totalPosts / perPage)
            }
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


//get all products by category name
export async function getAllProductsByCatName(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;


        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return response.status(404).json(
                {
                    message: "Page not found",
                    success: false,
                    error: true
                }
            );
        }


        const products = await ProductModel.find({
            catName: request.query.catName
        }).populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            return response.status(500).json({
                error: true,
                success: false
            })
        }

        const enriched = await enrichVariants(products);

        return response.status(200).json({
            error: false,
            success: true,
            products: enriched,
            totalPages: totalPages,
            page: page,
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}



//get all products by sub category id
export async function getAllProductsBySubCatId(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;


        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return response.status(404).json(
                {
                    message: "Page not found",
                    success: false,
                    error: true
                }
            );
        }

        const products = await ProductModel.find({
            subCatId: request.params.id
        }).populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            return response.status(500).json({
                error: true,
                success: false
            })
        }

        const enriched = await enrichVariants(products);

        return response.status(200).json({
            error: false,
            success: true,
            products: enriched,
            totalPages: totalPages,
            page: page,
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


//get all products by sub category name
export async function getAllProductsBySubCatName(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;


        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return response.status(404).json(
                {
                    message: "Page not found",
                    success: false,
                    error: true
                }
            );
        }


        const products = await ProductModel.find({
            subCat: request.query.subCat
        }).populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            return response.status(500).json({
                error: true,
                success: false
            })
        }

        const enriched = await enrichVariants(products);

        return response.status(200).json({
            error: false,
            success: true,
            products: enriched,
            totalPages: totalPages,
            page: page,
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}




//get all products by sub category id
export async function getAllProductsByThirdLavelCatId(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;


        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return response.status(404).json(
                {
                    message: "Page not found",
                    success: false,
                    error: true
                }
            );
        }

        const products = await ProductModel.find({
            thirdsubCatId: request.params.id
        }).populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            return response.status(500).json({
                error: true,
                success: false
            })
        }

        const enriched = await enrichVariants(products);

        return response.status(200).json({
            error: false,
            success: true,
            products: enriched,
            totalPages: totalPages,
            page: page,
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


//get all products by sub category name
export async function getAllProductsByThirdLavelCatName(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;


        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return response.status(404).json(
                {
                    message: "Page not found",
                    success: false,
                    error: true
                }
            );
        }


        const products = await ProductModel.find({
            thirdsubCat: request.query.thirdsubCat
        }).populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            return response.status(500).json({
                error: true,
                success: false
            })
        }

        const enriched = await enrichVariants(products);

        return response.status(200).json({
            error: false,
            success: true,
            products: enriched,
            totalPages: totalPages,
            page: page,
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


//get all products by price

export async function getAllProductsByPrice(request, response) {
    let productList = [];

    if (request.query.catId !== "" && request.query.catId !== undefined) {
        const productListArr = await ProductModel.find({
            catId: request.query.catId,
        }).populate("category");

        productList = productListArr;
    }

    if (request.query.subCatId !== "" && request.query.subCatId !== undefined) {
        const productListArr = await ProductModel.find({
            subCatId: request.query.subCatId,
        }).populate("category");

        productList = productListArr;
    }


    if (request.query.thirdsubCatId !== "" && request.query.thirdsubCatId !== undefined) {
        const productListArr = await ProductModel.find({
            thirdsubCatId: request.query.thirdsubCatId,
        }).populate("category");

        productList = productListArr;
    }



    const filteredProducts = productList.filter((product) => {
        if (request.query.minPrice && product.price < parseInt(+request.query.minPrice)) {
            return false;
        }
        if (request.query.maxPrice && product.price > parseInt(+request.query.maxPrice)) {
            return false;
        }
        return true;
    });

    const enriched = await enrichVariants(filteredProducts);

    return response.status(200).json({
        error: false,
        success: true,
        products: enriched,
        totalPages: 0,
        page: 0,
    });

}


//get all products by rating
export async function getAllProductsByRating(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;


        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return response.status(404).json(
                {
                    message: "Page not found",
                    success: false,
                    error: true
                }
            );
        }

        console.log(request.query.subCatId)

        let products = [];

        if (request.query.catId !== undefined) {

            products = await ProductModel.find({
                rating: request.query.rating,
                catId: request.query.catId,

            }).populate("category")
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec();
        }

        if (request.query.subCatId !== undefined) {

            products = await ProductModel.find({
                rating: request.query.rating,
                subCatId: request.query.subCatId,

            }).populate("category")
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec();
        }


        if (request.query.thirdsubCatId !== undefined) {

            products = await ProductModel.find({
                rating: request.query.rating,
                thirdsubCatId: request.query.thirdsubCatId,

            }).populate("category")
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec();
        }


        if (!products) {
            return response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            total: total,
            page: pageNum,
            totalPages: totalPages,
            totalCount: totalProducts?.length,
            totalProducts: await enrichVariants(totalProducts)
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


//get all products count

export async function getProductsCount(request, response) {
    try {
        const productsCount = await ProductModel.countDocuments();

        if (!productsCount) {
            return response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            productCount: productsCount
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}



//get all features products
export async function getAllFeaturedProducts(request, response) {
    try {

        const products = await ProductModel.find({
            isFeatured: true
        }).populate("category");

        if (!products) {
            return response.status(500).json({
                error: true,
                success: false
            })
        }

        const enriched = await enrichVariants(products);

        return response.status(200).json({
            error: false,
            success: true,
            products: enriched,
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


//get all features products have banners
export async function getAllProductsBanners(request, response) {
    try {

        const products = await ProductModel.find({
            isDisplayOnHomeBanner: true
        }).populate("category");

        if (!products) {
            return response.status(500).json({
                error: true,
                success: false
            })
        }

        const enriched = await enrichVariants(products);

        return response.status(200).json({
            error: false,
            success: true,
            products: enriched,
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


//delete product
export async function deleteProduct(request, response) {

    const product = await ProductModel.findById(request.params.id).populate("category");

    if (!product) {
        return response.status(404).json({
            message: "Product Not found",
            error: true,
            success: false
        })
    }

    const images = product.images;

    let img = "";
    for (img of images) {
        const imgUrl = img;
        const urlArr = imgUrl.split("/");
        const image = urlArr[urlArr.length - 1];

        const imageName = image.split(".")[0];

        if (imageName) {
            cloudinary.uploader.destroy(imageName, (error, result) => {
                // console.log(error, result);
            });
        }


    }

    const deletedProduct = await ProductModel.findByIdAndDelete(request.params.id);

    if (!deletedProduct) {
        return response.status(404).json({
            message: "Product not deleted!",
            success: false,
            error: true
        });
    }

    return response.status(200).json({
        success: true,
        error: false,
        message: "Product Deleted!",
    });
}


//delete multiple products
export async function deleteMultipleProduct(request, response) {
    const { ids } = request.body;

    if (!ids || !Array.isArray(ids)) {
        return response.status(400).json({ error: true, success: false, message: 'Invalid input' });
    }


    for (let i = 0; i < ids?.length; i++) {
        const product = await ProductModel.findById(ids[i]);

        const images = product.images;

        let img = "";
        for (img of images) {
            const imgUrl = img;
            const urlArr = imgUrl.split("/");
            const image = urlArr[urlArr.length - 1];

            const imageName = image.split(".")[0];

            if (imageName) {
                cloudinary.uploader.destroy(imageName, (error, result) => {
                    // console.log(error, result);
                });
            }


        }

    }

    try {
        await ProductModel.deleteMany({ _id: { $in: ids } });
        return response.status(200).json({
            message: "Product delete successfully",
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }

}

//get single product 
export async function getProduct(request, response) {
    try {
        const product = await ProductModel.findById(request.params.id).populate("category");

        if (!product) {
            return response.status(404).json({
                message: "The product is not found",
                error: true,
                success: false
            })
        }

        const enriched = await enrichVariants([product]);
        const enrichedProduct = enriched[0] || product;

        return response.status(200).json({
            error: false,
            success: true,
            product: enrichedProduct
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//delete images
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


//updated product 
export async function updateProduct(request, response) {
    try {
        // Check for duplicate SKU if provided (excluding current product)
        if (request.body.sku && request.body.sku.trim() !== '') {
            const skuCheck = await ProductModel.checkDuplicateSku(request.body.sku.trim(), request.params.id);
            if (skuCheck.isDuplicate) {
                return response.status(400).json({
                    error: true,
                    success: false,
                    message: `A product with SKU "${request.body.sku}" already exists. Please use a unique SKU.`
                });
            }
        }

        // Check for duplicate name in same category if both provided (excluding current product)
        if (request.body.name && request.body.catId) {
            const nameCheck = await ProductModel.checkDuplicateNameInCategory(request.body.name, request.body.catId, request.params.id);
            if (nameCheck.isDuplicate) {
                return response.status(400).json({
                    error: true,
                    success: false,
                    message: `A product with name "${request.body.name}" already exists in this category.`
                });
            }
        }

        // Auto calculate discount - exact percentage with proper rounding
        let discount = 0;
        if (request.body.oldPrice && request.body.price && request.body.oldPrice > 0 && request.body.price > 0 && request.body.oldPrice > request.body.price) {
            const discountAmount = request.body.oldPrice - request.body.price;
            discount = Math.floor((discountAmount / request.body.oldPrice) * 100);
        }

        const product = await ProductModel.findByIdAndUpdate(
            request.params.id,
            {
                name: request.body.name,
                sku: request.body.sku || '',
                slug: request.body.slug || request.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                metaTitle: request.body.metaTitle || '',
                metaDescription: request.body.metaDescription || '',
                subCat: request.body.subCat,
                description: request.body.description,
                shortDescription: request.body.shortDescription || '',
                bannerimages: request.body.bannerimages,
                bannerTitleName: request.body.bannerTitleName,
                isDisplayOnHomeBanner: request.body.isDisplayOnHomeBanner,
                images: request.body.images,
                brand: request.body.brand,
                price: request.body.price,
                oldPrice: request.body.oldPrice,
                discount: discount,
                catId: request.body.catId,
                catName: request.body.catName,
                subCatId: request.body.subCatId,
                category: request.body.category,
                thirdsubCat: request.body.thirdsubCat,
                thirdsubCatId: request.body.thirdsubCatId,
                countInStock: request.body.countInStock,
                rating: request.body.rating,
                isFeatured: request.body.isFeatured,
                productRam: request.body.productRam,
                size: request.body.size,
                productWeight: request.body.productWeight,
                color: request.body.color,
                materials: Array.isArray(request.body.materials) ? request.body.materials.join(', ') : (request.body.materials || ''),
                productMaterials: request.body.productMaterials || [],
                ...(request.body.hasVariants !== undefined && { hasVariants: request.body.hasVariants === true }),
                ...(request.body.variantAttributeNames !== undefined && { variantAttributeNames: Array.isArray(request.body.variantAttributeNames) ? request.body.variantAttributeNames : [] })
            },
            { new: true }
        );


        if (!product) {
            return response.status(404).json({
                message: "the product can not be updated!",
                status: false,
            });
        }

        return response.status(200).json({
            message: "The product is updated",
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}




export async function createProductRAMS(request, response) {
    try {
        let productRAMS = new ProductRAMSModel({
            name: request.body.name
        })

        productRAMS = await productRAMS.save();

        if (!productRAMS) {
            return response.status(500).json({
                error: true,
                success: false,
                message: "Product RAMS Not created"
            });
        }

        return response.status(200).json({
            message: "Product RAMS Created successfully",
            error: false,
            success: true,
            product: productRAMS
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}



export async function deleteProductRAMS(request, response) {
    const productRams = await ProductRAMSModel.findById(request.params.id);

    if (!productRams) {
        return response.status(404).json({
            message: "Item Not found",
            error: true,
            success: false
        })
    }

    const deletedProductRams = await ProductRAMSModel.findByIdAndDelete(request.params.id);

    if (!deletedProductRams) {
        return response.status(404).json({
            message: "Item not deleted!",
            success: false,
            error: true
        });
    }

    return response.status(200).json({
        success: true,
        error: false,
        message: "Product Ram Deleted!",
    });
}

export async function updateProductRam(request, response) {

    try {

        const productRam = await ProductRAMSModel.findByIdAndUpdate(
            request.params.id,
            {
                name: request.body.name,
            },
            { new: true }
        );


        if (!productRam) {
            return response.status(404).json({
                message: "the product Ram can not be updated!",
                status: false,
            });
        }

        return response.status(200).json({
            message: "The product Ram is updated",
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }

}


export async function getProductRams(request, response) {

    try {

        const productRam = await ProductRAMSModel.find();

        if (!productRam) {
            return response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            data: productRam
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


export async function getProductRamsById(request, response) {

    try {

        const productRam = await ProductRAMSModel.findById(request.params.id);

        if (!productRam) {
            return response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            data: productRam
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}



export async function createProductWEIGHT(request, response) {
    try {
        let productWeight = new ProductWEIGHTModel({
            name: request.body.name
        })

        productWeight = await productWeight.save();

        if (!productWeight) {
            return response.status(500).json({
                error: true,
                success: false,
                message: "Product WEIGHT Not created"
            });
        }

        return response.status(200).json({
            message: "Product WEIGHT Created successfully",
            error: false,
            success: true,
            product: productWeight
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}



export async function deleteProductWEIGHT(request, response) {
    const productWeight = await ProductWEIGHTModel.findById(request.params.id);

    if (!productWeight) {
        return response.status(404).json({
            message: "Item Not found",
            error: true,
            success: false
        })
    }

    const deletedProductWeight = await ProductWEIGHTModel.findByIdAndDelete(request.params.id);

    if (!deletedProductWeight) {
        return response.status(404).json({
            message: "Item not deleted!",
            success: false,
            error: true
        });
    }

    return response.status(200).json({
        success: true,
        error: false,
        message: "Product Weight Deleted!",
    });
}


export async function updateProductWeight(request, response) {

    try {

        const productWeight = await ProductWEIGHTModel.findByIdAndUpdate(
            request.params.id,
            {
                name: request.body.name,
            },
            { new: true }
        );


        if (!productWeight) {
            return response.status(404).json({
                message: "the product weight can not be updated!",
                status: false,
            });
        }

        return response.status(200).json({
            message: "The product weight is updated",
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }

}


export async function getProductWeight(request, response) {

    try {

        const productWeight = await ProductWEIGHTModel.find();

        if (!productWeight) {
            return response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            data: productWeight
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


export async function getProductWeightById(request, response) {

    try {

        const productWeight = await ProductWEIGHTModel.findById(request.params.id);

        if (!productWeight) {
            return response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            data: productWeight
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}



export async function createProductSize(request, response) {
    try {
        let productSize = new ProductSIZEModel({
            name: request.body.name
        })

        productSize = await productSize.save();

        if (!productSize) {
            return response.status(500).json({
                error: true,
                success: false,
                message: "Product size Not created"
            });
        }

        return response.status(200).json({
            message: "Product size Created successfully",
            error: false,
            success: true,
            product: productSize
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}



export async function deleteProductSize(request, response) {
    const productSize = await ProductSIZEModel.findById(request.params.id);

    if (!productSize) {
        return response.status(404).json({
            message: "Item Not found",
            error: true,
            success: false
        })
    }

    const deletedProductSize = await ProductSIZEModel.findByIdAndDelete(request.params.id);

    if (!deletedProductSize) {
        return response.status(404).json({
            message: "Item not deleted!",
            success: false,
            error: true
        });
    }

    return response.status(200).json({
        success: true,
        error: false,
        message: "Product size Deleted!",
    });
}


export async function updateProductSize(request, response) {

    try {

        const productSize = await ProductSIZEModel.findByIdAndUpdate(
            request.params.id,
            {
                name: request.body.name,
            },
            { new: true }
        );


        if (!productSize) {
            return response.status(404).json({
                message: "the product size can not be updated!",
                status: false,
            });
        }

        return response.status(200).json({
            message: "The product size is updated",
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }

}


export async function getProductSize(request, response) {

    try {

        const productSize = await ProductSIZEModel.find();

        if (!productSize) {
            return response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            data: productSize
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


export async function getProductSizeById(request, response) {

    try {

        const productSize = await ProductSIZEModel.findById(request.params.id);

        if (!productSize) {
            return response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            data: productSize
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}



export async function filters(request, response) {
    const { catId, subCatId, thirdsubCatId, minPrice, maxPrice, rating, page, limit, brand, size, color } = request.body;

    const filters = {}

    if (catId?.length) {
        filters.catId = { $in: catId }
    }

    if (subCatId?.length) {
        filters.subCatId = { $in: subCatId }
    }

    if (thirdsubCatId?.length) {
        filters.thirdsubCatId = { $in: thirdsubCatId }
    }

    if (minPrice || maxPrice) {
        filters.price = { $gte: +minPrice || 0, $lte: +maxPrice || Infinity };
    }

    if (rating?.length) {
        filters.rating = { $in: rating }
    }

    if (brand?.length) {
        filters.brand = { $in: brand }
    }

    if (size?.length) {
        filters.size = { $in: size }
    }

    if (color?.length) {
        filters.color = { $in: color }
    }

    try {

        const products = await ProductModel.find(filters).populate("category").skip((page - 1) * limit).limit(parseInt(limit));

        const enriched = await enrichVariants(products);
        const total = await ProductModel.countDocuments(filters);

        return response.status(200).json({
            error: false,
            success: true,
            products: enriched,
            total: total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }


}


// Sort function
const sortItems = (products, sortBy, order) => {
    return products.sort((a, b) => {
        if (sortBy === 'name') {
            return order === 'asc'
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
        }
        if (sortBy === 'price') {
            return order === 'asc' ? a.price - b.price : b.price - a.price;
        }
        return 0; // Default
    });
};


export async function sortBy(request, response) {
    const { products, sortBy, order } = request.body;
    const sortedItems = sortItems([...products?.products], sortBy, order);
    return response.status(200).json({
        error: false,
        success: true,
        products: sortedItems,
        totalPages: 0,
        page: 0,
    });
}




export async function searchProductController(request, response) {
    try {

        const {query, page, limit } = request.body;

        if (!query) {
            return response.status(400).json({
                error: true,
                success: false,
                message: "Query is required"
            });
        }


        const products = await ProductModel.find({
            $or: [
                { name: { $regex: query, $options: "i" } },
                { brand: { $regex: query, $options: "i" } },
                { catName: { $regex: query, $options: "i" } },
                { subCat: { $regex: query, $options: "i" } },
                { thirdsubCat: { $regex: query, $options: "i" } },
            ],
        }).populate("category")

        const enriched = await enrichVariants(products);
        const total = await enriched?.length

        return response.status(200).json({
            error: false,
            success: true,
            products: enriched,
            total: 1,
            page: parseInt(page),
            totalPages: 1
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Product Color CRUD
export async function createProductColor(request, response) {
    try {
        let productColor = new ProductColorModel({
            name: request.body.name
        })

        productColor = await productColor.save();

        if (!productColor) {
            return response.status(500).json({
                error: true,
                success: false,
                message: "Product Color Not created"
            });
        }

        return response.status(200).json({
            message: "Product Color Created successfully",
            error: false,
            success: true,
            data: productColor
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function deleteProductColor(request, response) {
    const productColor = await ProductColorModel.findById(request.params.id);

    if (!productColor) {
        return response.status(404).json({
            message: "Item Not found",
            error: true,
            success: false
        })
    }

    const deletedProductColor = await ProductColorModel.findByIdAndDelete(request.params.id);

    return response.status(200).json({
        message: "Item deleted",
        error: false,
        success: true
    })
}

export async function updateProductColor(request, response) {
    const productColor = await ProductColorModel.findByIdAndUpdate(
        request.params.id,
        { name: request.body.name },
        { new: true }
    );

    if (!productColor) {
        return response.status(404).json({
            message: "Item Not found",
            error: true,
            success: false
        })
    }

    return response.status(200).json({
        message: "Item updated",
        error: false,
        success: true,
        data: productColor
    })
}

export async function getProductColor(request, response) {
    try {
        const productColor = await ProductColorModel.find();

        return response.status(200).json({
            message: "Product Colors",
            error: false,
            success: true,
            data: productColor
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function getProductColorById(request, response) {
    try {
        const productColor = await ProductColorModel.findById(request.params.id);

        return response.status(200).json({
            message: "Product Color",
            error: false,
            success: true,
            data: productColor
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Product Materials CRUD
export async function createProductMaterials(request, response) {
    try {
        let productMaterials = new ProductMaterialsModel({
            name: request.body.name
        })

        productMaterials = await productMaterials.save();

        if (!productMaterials) {
            return response.status(500).json({
                error: true,
                success: false,
                message: "Product Materials Not created"
            });
        }

        return response.status(200).json({
            message: "Product Materials Created successfully",
            error: false,
            success: true,
            data: productMaterials
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function deleteProductMaterials(request, response) {
    const productMaterials = await ProductMaterialsModel.findById(request.params.id);

    if (!productMaterials) {
        return response.status(404).json({
            message: "Item Not found",
            error: true,
            success: false
        })
    }

    const deletedProductMaterials = await ProductMaterialsModel.findByIdAndDelete(request.params.id);

    return response.status(200).json({
        message: "Item deleted",
        error: false,
        success: true
    })
}

export async function updateProductMaterials(request, response) {
    const productMaterials = await ProductMaterialsModel.findByIdAndUpdate(
        request.params.id,
        { name: request.body.name },
        { new: true }
    );

    if (!productMaterials) {
        return response.status(404).json({
            message: "Item Not found",
            error: true,
            success: false
        })
    }

    return response.status(200).json({
        message: "Item updated",
        error: false,
        success: true,
        data: productMaterials
    })
}

export async function getProductMaterials(request, response) {
    try {
        const productMaterials = await ProductMaterialsModel.find();

        return response.status(200).json({
            message: "Product Materials",
            error: false,
            success: true,
            data: productMaterials
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function getProductMaterialsById(request, response) {
    try {
        const productMaterials = await ProductMaterialsModel.findById(request.params.id);

        return response.status(200).json({
            message: "Product Materials",
            error: false,
            success: true,
            data: productMaterials
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}