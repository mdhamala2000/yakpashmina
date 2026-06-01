import VariantModel from '../models/variant.model.js';
import ProductModel from '../models/product.modal.js';
import ProductImageModel from '../models/productImage.model.js';

export async function createVariant(req, res) {
    try {
        const { productId, ...variantData } = req.body;

        if (!productId) {
            return res.status(400).json({
                error: true,
                success: false,
                message: 'Product ID is required'
            });
        }

        const product = await ProductModel.findById(productId);
        if (!product) {
            return res.status(404).json({
                error: true,
                success: false,
                message: 'Product not found'
            });
        }

        if (!variantData.options || Object.keys(variantData.options).length === 0) {
            return res.status(400).json({
                error: true,
                success: false,
                message: 'Variant options are required'
            });
        }

        if (variantData.sku) {
            const existing = await VariantModel.findOne({
                sku: variantData.sku,
                isDeleted: false
            });
            if (existing) {
                return res.status(400).json({
                    error: true,
                    success: false,
                    message: 'A variant with this SKU already exists'
                });
            }
        }

        const variant = new VariantModel({
            product: productId,
            ...variantData
        });

        await variant.save();

        if (!product.hasVariants) {
            product.hasVariants = true;
            await product.save();
        }

        return res.status(201).json({
            error: false,
            success: true,
            message: 'Variant created successfully',
            variant
        });

    } catch (error) {
        return res.status(500).json({
            error: true,
            success: false,
            message: error.message || error
        });
    }
}

export async function updateVariant(req, res) {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const variant = await VariantModel.findById(id);
        if (!variant || variant.isDeleted) {
            return res.status(404).json({
                error: true,
                success: false,
                message: 'Variant not found'
            });
        }

        if (updateData.sku && updateData.sku !== variant.sku) {
            const existing = await VariantModel.findOne({
                sku: updateData.sku,
                isDeleted: false,
                _id: { $ne: id }
            });
            if (existing) {
                return res.status(400).json({
                    error: true,
                    success: false,
                    message: 'A variant with this SKU already exists'
                });
            }
        }

        Object.keys(updateData).forEach(key => {
            if (key !== 'product' && key !== '_id') {
                variant[key] = updateData[key];
            }
        });

        await variant.save();

        return res.status(200).json({
            error: false,
            success: true,
            message: 'Variant updated successfully',
            variant
        });

    } catch (error) {
        return res.status(500).json({
            error: true,
            success: false,
            message: error.message || error
        });
    }
}

export async function deleteVariant(req, res) {
    try {
        const { id } = req.params;

        const variant = await VariantModel.findById(id);
        if (!variant) {
            return res.status(404).json({
                error: true,
                success: false,
                message: 'Variant not found'
            });
        }

        variant.isDeleted = true;
        await variant.save();

        const remainingActive = await VariantModel.countDocuments({
            product: variant.product,
            isDeleted: false
        });

        if (remainingActive === 0) {
            await ProductModel.findByIdAndUpdate(variant.product, { hasVariants: false });
        }

        return res.status(200).json({
            error: false,
            success: true,
            message: 'Variant deleted successfully',
            remainingActive
        });

    } catch (error) {
        return res.status(500).json({
            error: true,
            success: false,
            message: error.message || error
        });
    }
}

export async function getVariantsByProduct(req, res) {
    try {
        const { productId } = req.params;

        const variants = await VariantModel.find({ 
            product: productId, 
            isDeleted: false,
            isActive: true
        }).sort({ createdAt: 1 });

        const images = await ProductImageModel.find({ 
            product: productId, 
            isDeleted: false 
        }).sort({ sortOrder: 1 });

        return res.status(200).json({
            error: false,
            success: true,
            variants,
            images,
            variantCount: variants.length
        });

    } catch (error) {
        return res.status(500).json({
            error: true,
            success: false,
            message: error.message || error
        });
    }
}

export async function getVariantById(req, res) {
    try {
        const { id } = req.params;

        const variant = await VariantModel.findById(id);

        if (!variant || variant.isDeleted) {
            return res.status(404).json({
                error: true,
                success: false,
                message: 'Variant not found'
            });
        }

        return res.status(200).json({
            error: false,
            success: true,
            variant
        });

    } catch (error) {
        return res.status(500).json({
            error: true,
            success: false,
            message: error.message || error
        });
    }
}

export async function getVariantBySku(req, res) {
    try {
        const { sku } = req.params;

        const variant = await VariantModel.findOne({ sku, isDeleted: false });

        if (!variant) {
            return res.status(404).json({
                error: true,
                success: false,
                message: 'Variant not found'
            });
        }

        return res.status(200).json({
            error: false,
            success: true,
            variant
        });

    } catch (error) {
        return res.status(500).json({
            error: true,
            success: false,
            message: error.message || error
        });
    }
}

export async function getAllVariants(req, res) {
    try {
        const { page = 1, limit = 20, product, isActive } = req.query;
        const query = { isDeleted: false };
        
        if (product) query.product = product;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const variants = await VariantModel.find(query)
            .populate('product', 'name sku images')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await VariantModel.countDocuments(query);

        return res.status(200).json({
            error: false,
            success: true,
            variants,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });

    } catch (error) {
        return res.status(500).json({
            error: true,
            success: false,
            message: error.message || error
        });
    }
}

export async function findVariantByOptions(req, res) {
    try {
        const { productId } = req.params;
        const { options } = req.body;

        if (!options || Object.keys(options).length === 0) {
            return res.status(400).json({
                error: true,
                success: false,
                message: 'Options are required'
            });
        }

        const query = { product: productId, isDeleted: false, isActive: true };
        
        for (const [key, value] of Object.entries(options)) {
            query[`options.${key}`] = value;
        }

        const variant = await VariantModel.findOne(query);

        if (!variant) {
            return res.status(404).json({
                error: true,
                success: false,
                message: 'Variant not found for selected options'
            });
        }

        return res.status(200).json({
            error: false,
            success: true,
            variant
        });

    } catch (error) {
        return res.status(500).json({
            error: true,
            success: false,
            message: error.message || error
        });
    }
}

export async function toggleVariantActive(req, res) {
    try {
        const { id } = req.params;

        const variant = await VariantModel.findById(id);
        if (!variant || variant.isDeleted) {
            return res.status(404).json({
                error: true,
                success: false,
                message: 'Variant not found'
            });
        }

        variant.isActive = !variant.isActive;
        await variant.save();

        return res.status(200).json({
            error: false,
            success: true,
            message: `Variant ${variant.isActive ? 'activated' : 'deactivated'} successfully`,
            variant
        });

    } catch (error) {
        return res.status(500).json({
            error: true,
            success: false,
            message: error.message || error
        });
    }
}

export async function bulkUpdateVariants(req, res) {
    try {
        const { variants } = req.body;

        if (!Array.isArray(variants) || variants.length === 0) {
            return res.status(400).json({
                error: true,
                success: false,
                message: 'Variants array is required'
            });
        }

        const results = await Promise.all(variants.map(async (v) => {
            const { _id, ...updateData } = v;
            if (!_id) return null;
            
            const updated = await VariantModel.findByIdAndUpdate(
                _id,
                { $set: updateData },
                { new: true, runValidators: true }
            );
            return updated;
        }));

        return res.status(200).json({
            error: false,
            success: true,
            message: 'Variants updated successfully',
            variants: results.filter(Boolean)
        });

    } catch (error) {
        return res.status(500).json({
            error: true,
            success: false,
            message: error.message || error
        });
    }
}

export async function createBulkVariants(req, res) {
    try {
        const { product: productId, variants } = req.body;
        if (!productId || !Array.isArray(variants) || variants.length === 0) {
            return res.status(400).json({
                error: true, success: false,
                message: 'Product ID and variants array are required'
            });
        }

        const product = await ProductModel.findById(productId);
        if (!product) {
            return res.status(404).json({
                error: true, success: false,
                message: 'Product not found'
            });
        }

        const toInsert = variants.map(v => ({
            product: productId,
            sku: v.sku,
            name: v.name || '',
            options: v.options || {},
            price: Number(v.price) || 0,
            oldPrice: Number(v.oldPrice) || 0,
            stock: Number(v.stock) || 0,
            weight: v.weight || '',
            dimensions: v.dimensions || '',
            isActive: true,
            isDeleted: false
        }));

        const created = await VariantModel.insertMany(toInsert);

        if (!product.hasVariants) {
            product.hasVariants = true;
            await product.save();
        }

        return res.status(201).json({
            error: false, success: true,
            message: 'Variants created successfully',
            variants: created
        });
    } catch (error) {
        return res.status(500).json({
            error: true, success: false,
            message: error.message || error
        });
    }
}

export async function deleteBulkVariants(req, res) {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                error: true, success: false,
                message: 'Variant IDs array is required'
            });
        }

        const result = await VariantModel.updateMany(
            { _id: { $in: ids } },
            { $set: { isDeleted: true } }
        );

        const affectedProducts = await VariantModel.distinct('product', { _id: { $in: ids } });
        for (const pid of affectedProducts) {
            const count = await VariantModel.countDocuments({ product: pid, isDeleted: false });
            if (count === 0) {
                await ProductModel.findByIdAndUpdate(pid, { hasVariants: false });
            }
        }

        return res.status(200).json({
            error: false, success: true,
            message: `${result.modifiedCount} variant(s) deleted`,
            deletedCount: result.modifiedCount
        });
    } catch (error) {
        return res.status(500).json({
            error: true, success: false,
            message: error.message || error
        });
    }
}

export async function getVariantCombinations(req, res) {
    try {
        const { productId } = req.params;
        const variants = await VariantModel.find({
            product: productId,
            isDeleted: false,
            isActive: true,
            stock: { $gt: 0 }
        }).sort({ createdAt: 1 });

        const combinations = variants.map(v => ({
            _id: v._id,
            options: v.options,
            name: v.name,
            sku: v.sku,
            price: v.price,
            stock: v.stock
        }));

        return res.status(200).json({
            error: false, success: true,
            combinations
        });
    } catch (error) {
        return res.status(500).json({
            error: true, success: false,
            message: error.message || error
        });
    }
}

export async function updateVariantStock(req, res) {
    try {
        const { id } = req.params;
        const { stock } = req.body;

        if (stock === undefined || stock === null) {
            return res.status(400).json({
                error: true, success: false,
                message: 'Stock value is required'
            });
        }

        const variant = await VariantModel.findByIdAndUpdate(
            id,
            { $set: { stock: Number(stock) } },
            { new: true }
        );

        if (!variant || variant.isDeleted) {
            return res.status(404).json({
                error: true, success: false,
                message: 'Variant not found'
            });
        }

        return res.status(200).json({
            error: false, success: true,
            message: 'Stock updated',
            variant
        });
    } catch (error) {
        return res.status(500).json({
            error: true, success: false,
            message: error.message || error
        });
    }
}

export async function renameAttribute(req, res) {
    try {
        const { productId } = req.params;
        const { oldName, newName } = req.body;

        if (!oldName || !newName) {
            return res.status(400).json({
                error: true, success: false,
                message: 'oldName and newName are required'
            });
        }

        const variants = await VariantModel.find({
            product: productId,
            isDeleted: false
        });

        for (const variant of variants) {
            if (variant.options && variant.options[oldName] !== undefined) {
                variant.options[newName] = variant.options[oldName];
                delete variant.options[oldName];
                await variant.save();
            }
        }

        return res.status(200).json({
            error: false, success: true,
            message: 'Attribute renamed',
            modifiedCount: variants.length
        });
    } catch (error) {
        return res.status(500).json({
            error: true, success: false,
            message: error.message || error
        });
    }
}

export async function updateAttributeNames(req, res) {
    try {
        const { productId } = req.params;
        const { attributeNames } = req.body;

        if (!Array.isArray(attributeNames)) {
            return res.status(400).json({
                error: true, success: false,
                message: 'attributeNames array is required'
            });
        }

        await ProductModel.findByIdAndUpdate(productId, {
            variantAttributeNames: attributeNames
        });

        return res.status(200).json({
            error: false, success: true,
            message: 'Attribute names updated'
        });
    } catch (error) {
        return res.status(500).json({
            error: true, success: false,
            message: error.message || error
        });
    }
}

export async function getVariantImages(req, res) {
    try {
        const { productId } = req.params;
        const images = await ProductImageModel.find({
            product: productId,
            isDeleted: false
        }).sort({ sortOrder: 1 });

        return res.status(200).json({
            error: false, success: true,
            images
        });
    } catch (error) {
        return res.status(500).json({
            error: true, success: false,
            message: error.message || error
        });
    }
}

export async function addVariantImage(req, res) {
    try {
        const { product, url, alt, color, colorHex, isPrimary, sortOrder } = req.body;

        if (!product || !url) {
            return res.status(400).json({
                error: true, success: false,
                message: 'Product ID and image URL are required'
            });
        }

        const image = new ProductImageModel({
            product,
            url,
            alt: alt || '',
            color: color || '',
            colorHex: colorHex || '',
            isPrimary: isPrimary || false,
            sortOrder: sortOrder || 0
        });

        await image.save();

        return res.status(201).json({
            error: false, success: true,
            message: 'Image added',
            image
        });
    } catch (error) {
        return res.status(500).json({
            error: true, success: false,
            message: error.message || error
        });
    }
}

export async function updateVariantImage(req, res) {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const image = await ProductImageModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        if (!image || image.isDeleted) {
            return res.status(404).json({
                error: true, success: false,
                message: 'Image not found'
            });
        }

        return res.status(200).json({
            error: false, success: true,
            message: 'Image updated',
            image
        });
    } catch (error) {
        return res.status(500).json({
            error: true, success: false,
            message: error.message || error
        });
    }
}

export async function setPrimaryVariantImage(req, res) {
    try {
        const { productId } = req.params;
        const { imageId } = req.body;

        if (!imageId) {
            return res.status(400).json({
                error: true, success: false,
                message: 'Image ID is required'
            });
        }

        await ProductImageModel.updateMany(
            { product: productId, isDeleted: false },
            { $set: { isPrimary: false } }
        );

        const image = await ProductImageModel.findByIdAndUpdate(
            imageId,
            { $set: { isPrimary: true } },
            { new: true }
        );

        if (!image || image.isDeleted) {
            return res.status(404).json({
                error: true, success: false,
                message: 'Image not found'
            });
        }

        return res.status(200).json({
            error: false, success: true,
            message: 'Primary image updated',
            image
        });
    } catch (error) {
        return res.status(500).json({
            error: true, success: false,
            message: error.message || error
        });
    }
}

export async function deleteVariantImage(req, res) {
    try {
        const { id } = req.params;

        const image = await ProductImageModel.findByIdAndUpdate(
            id,
            { $set: { isDeleted: true } },
            { new: true }
        );

        if (!image) {
            return res.status(404).json({
                error: true, success: false,
                message: 'Image not found'
            });
        }

        return res.status(200).json({
            error: false, success: true,
            message: 'Image deleted'
        });
    } catch (error) {
        return res.status(500).json({
            error: true, success: false,
            message: error.message || error
        });
    }
}
