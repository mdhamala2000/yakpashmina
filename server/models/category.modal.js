import mongoose from "mongoose";

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
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
    // Category description
    description: {
        type: String,
        default: ''
    },
    // SEO: Canonical URL (auto-generated)
    canonicalUrl: {
        type: String,
        default: ''
    },
    images: [{
        type: String,
    }],
    parentCatName: {
        type: String,
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    // For tracking subcategories
    subCategoryCount: {
        type: Number,
        default: 0
    },
    // For tracking products
    productCount: {
        type: Number,
        default: 0
    },
    // Soft delete - mark as deleted but keep for referential integrity
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// ===========================================
// UNIQUE INDEXES FOR DUPLICATE PREVENTION
// ===========================================

// 1. Unique composite index: name + parentId (case-insensitive, excludes deleted)
categorySchema.index(
    { name: 1, parentId: 1 },
    { 
        unique: true, 
        partialFilterExpression: { isDeleted: false },
        name: 'unique_category_name_per_parent'
    }
);

// 2. Unique index on slug (excludes deleted)
categorySchema.index(
    { slug: 1 },
    { 
        unique: true, 
        partialFilterExpression: { isDeleted: false },
        name: 'unique_category_slug'
    }
);

// Pre-save hook to auto-generate slug
categorySchema.pre('save', function(next) {
    if (this.isModified('name') || !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '') // Remove special chars except hyphens
            .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with hyphens
            .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
        
        // If slug already exists, add unique suffix
        this.slug = this.slug + '-' + Date.now().toString(36);
    }
    
    // Auto-generate meta title if not set
    if (!this.metaTitle) {
        this.metaTitle = this.name + ' | ' + process.env.STORE_NAME || 'Yak Pashmina';
    }
    
    // Auto-generate canonical URL
    this.canonicalUrl = `/category/${this.slug}`;
    
    next();
});

// Static method to find by slug
categorySchema.statics.findBySlug = function(slug) {
    return this.findOne({ slug: slug, isDeleted: false });
};

// Static method to check slug uniqueness
categorySchema.statics.isSlugUnique = async function(slug, excludeId = null) {
    const query = { slug: slug.toLowerCase(), isDeleted: false };
    if (excludeId) {
        query._id = { $ne: excludeId };
    }
    const count = await this.countDocuments(query);
    return count === 0;
};

// ===========================================
// DUPLICATE CHECK METHODS
// ===========================================

// Check for duplicate category name under same parent
categorySchema.statics.checkDuplicateName = async function(name, parentId = null, excludeId = null) {
    const query = {
        name: { $regex: new RegExp(`^${name}$`, 'i') }, // Case-insensitive exact match
        isDeleted: false
    };
    
    // Handle parentId (null means root level)
    if (parentId === null || parentId === undefined || parentId === '') {
        query.parentId = { $in: [null, undefined, ''] };
    } else {
        query.parentId = parentId;
    }
    
    // Exclude current document when checking for updates
    if (excludeId) {
        query._id = { $ne: excludeId };
    }
    
    const existing = await this.findOne(query);
    
    if (existing) {
        // Get parent name for better error message
        let parentName = 'Root';
        if (parentId) {
            const parent = await this.findById(parentId);
            parentName = parent?.name || 'Unknown';
        }
        return {
            isDuplicate: true,
            message: `Category "${name}" already exists under "${parentName}"`,
            existingId: existing._id,
            existingName: existing.name
        };
    }
    
    return { isDuplicate: false, message: 'OK' };
};

// Check for duplicate slug
categorySchema.statics.checkDuplicateSlug = async function(slug, excludeId = null) {
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

const CategoryModel = mongoose.model('Category', categorySchema);

export default CategoryModel;