import mongoose from 'mongoose';

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    // SKU for duplicate prevention
    sku: {
        type: String,
        default: '',
        unique: true,
        index: true
    },
    // SEO: Auto-generated slug from name
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        index: true
    },
    // SEO: Meta title (defaults to name if not set)
    metaTitle: {
        type: String,
        default: ''
    },
    // SEO: Meta description
    metaDescription: {
        type: String,
        default: ''
    },
    // SEO: Canonical URL (auto-generated)
    canonicalUrl: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        required: true
    },
    // SEO: Short description for listings
    shortDescription: {
        type: String,
        default: ''
    },
    images: [
        {
            type: String,
            required: true
        }
    ],
    brand: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        default: 0
    },
    oldPrice: {
        type: Number,
        default: 0
    },
    catName: {
        type: String,
        default: ''
    },
    catId: {
        type: String,
        default: ''
    },
    // Category reference for SEO-friendly queries
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    // Category slug for breadcrumb/SEO
    categorySlug: {
        type: String,
        default: ''
    },
    subCatId: {
        type: String,
        default: ''
    },
    subCat: {
        type: String,
        default: ''
    },
    // Subcategory reference
    subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    // Subcategory slug for breadcrumb/SEO
    subCategorySlug: {
        type: String,
        default: ''
    },
    thirdsubCat: {
        type: String,
        default: ''
    },
    thirdsubCatId: {
        type: String,
        default: ''
    },
    countInStock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviewsCount: {
        type: Number,
        default: 0
    },
    // Product attributes - keeping existing fields
    productRam: [String],
    productWeight: [String],
    size: [String],
    color: [String],
    materials: {
        type: String,
        default: ''
    },
    clothType: {
        type: String,
        default: ''
    },
    productMaterials: [String],
    countryOfOrigin: {
        type: String,
        default: ''
    },
    dimensions: {
        type: String,
        default: ''
    },
    warranty: {
        type: String,
        default: ''
    },
    storage: {
        type: String,
        default: ''
    },
    // SEO: Additional keywords
    keywords: {
        type: String,
        default: ''
    },
    // Soft delete
    isDeleted: {
        type: Boolean,
        default: false
    },
    // Track original category for redirect purposes
    previousCategorySlug: {
        type: String,
        default: ''
    },
    previousSubCategorySlug: {
        type: String,
        default: ''
    },
    variantAttributeNames: {
        type: [String],
        default: []
    },
    hasVariants: {
        type: Boolean,
        default: false
    },
    // Track total units sold
    sale: {
        type: Number,
        default: 0,
        min: 0
    }
}, { timestamps: true });

// Index for efficient queries
productSchema.index({ category: 1, isDeleted: 1 });
productSchema.index({ subCategory: 1, isDeleted: 1 });
productSchema.index({ slug: 1, isDeleted: 1 });
productSchema.index({ catId: 1, subCatId: 1, isDeleted: 1 });

// ===========================================
// UNIQUE INDEXES FOR DUPLICATE PREVENTION
// ===========================================

// 1. Unique index on SKU (globally unique, excludes deleted)
productSchema.index(
    { sku: 1 },
    { 
        unique: true, 
        partialFilterExpression: { isDeleted: false, sku: { $exists: true, $ne: '' } },
        name: 'unique_product_sku'
    }
);

// 2. Unique composite index: name + category (within same category)
productSchema.index(
    { name: 1, category: 1 },
    { 
        unique: true, 
        partialFilterExpression: { isDeleted: false },
        name: 'unique_product_name_per_category'
    }
);

// 3. Unique index on slug
productSchema.index(
    { slug: 1 },
    { 
        unique: true, 
        partialFilterExpression: { isDeleted: false },
        name: 'unique_product_slug'
    }
);

// Pre-save hook to auto-generate slug
productSchema.pre('save', async function(next) {
    if (this.isModified('name') || !this.slug) {
        let baseSlug = this.name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
        
        // Check for uniqueness and add suffix if needed
        let slug = baseSlug;
        let counter = 1;
        
        while (await this.constructor.findOne({ 
            slug: slug, 
            _id: { $ne: this._id },
            isDeleted: false 
        })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
        
        this.slug = slug;
    }
    
    // Auto-generate meta title if not set
    if (!this.metaTitle) {
        this.metaTitle = this.name + ' | ' + process.env.STORE_NAME || 'Yak Pashmina';
    }
    
    // Auto-generate canonical URL
    this.canonicalUrl = `/product/${this.slug}`;
    
    next();
});

// Static method to find by slug
productSchema.statics.findBySlug = function(slug) {
    return this.findOne({ slug: slug, isDeleted: false });
};

// Static method to get products by category slug
productSchema.statics.findByCategorySlug = function(categorySlug, options = {}) {
    const { page = 1, limit = 20, sort = '-createdAt' } = options;
    return this.find({ 
        categorySlug: categorySlug, 
        isDeleted: false 
    })
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);
};

// Static method to get products by subcategory slug
productSchema.statics.findBySubCategorySlug = function(categorySlug, subCategorySlug, options = {}) {
    const { page = 1, limit = 20, sort = '-createdAt' } = options;
    return this.find({ 
        categorySlug: categorySlug,
        subCategorySlug: subCategorySlug, 
        isDeleted: false 
    })
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);
};

// ===========================================
// DUPLICATE CHECK METHODS
// ===========================================

// Check for duplicate SKU (globally unique)
productSchema.statics.checkDuplicateSku = async function(sku, excludeId = null) {
    if (!sku || sku.trim() === '') {
        return { isDuplicate: false, message: 'OK' };
    }
    
    const query = { 
        sku: { $regex: new RegExp(`^${sku}$`, 'i') },
        isDeleted: false
    };
    
    if (excludeId) {
        query._id = { $ne: excludeId };
    }
    
    const existing = await this.findOne(query);
    
    if (existing) {
        return {
            isDuplicate: true,
            message: `A product with SKU "${sku}" already exists`,
            existingId: existing._id,
            existingName: existing.name
        };
    }
    
    return { isDuplicate: false, message: 'OK' };
};

// Check for duplicate product name within same category
productSchema.statics.checkDuplicateNameInCategory = async function(name, categoryId, excludeId = null) {
    const query = {
        name: { $regex: new RegExp(`^${name}$`, 'i') }, // Case-insensitive exact match
        isDeleted: false
    };
    
    // Filter by category or subcategory
    if (categoryId) {
        query.$or = [
            { category: categoryId },
            { catId: categoryId.toString() }
        ];
    }
    
    if (excludeId) {
        query._id = { $ne: excludeId };
    }
    
    const existing = await this.findOne(query);
    
    if (existing) {
        return {
            isDuplicate: true,
            message: `A product with name "${name}" already exists in this category`,
            existingId: existing._id,
            existingName: existing.name,
            existingSku: existing.sku
        };
    }
    
    return { isDuplicate: false, message: 'OK' };
};

// Check for duplicate slug
productSchema.statics.checkDuplicateProductSlug = async function(slug, excludeId = null) {
    const query = { 
        slug: slug.toLowerCase(),
        isDeleted: false 
    };
    
    if (excludeId) {
        query._id = { $ne: excludeId };
    }
    
    const existing = await this.findOne(query);
    
    if (existing) {
        return {
            isDuplicate: true,
            message: `URL slug "${slug}" is already in use`,
            existingId: existing._id
        };
    }
    
    return { isDuplicate: false, message: 'OK' };
};

const ProductModel = mongoose.model('Product', productSchema);

export default ProductModel;