import mongoose from 'mongoose';

const variantSchema = mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        index: true
    },
    sku: {
        type: String,
        required: true,
        trim: true
    },
    name: {
        type: String,
        default: ''
    },
    options: {
        type: Map,
        of: String,
        default: {}
    },
    price: {
        type: Number,
        default: 0
    },
    oldPrice: {
        type: Number,
        default: 0
    },
    stock: {
        type: Number,
        default: 0,
        min: 0
    },
    weight: {
        type: String,
        default: ''
    },
    dimensions: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

variantSchema.index({ product: 1, isDeleted: 1 });
variantSchema.index({ sku: 1 }, { unique: true, partialFilterExpression: { isDeleted: false, sku: { $exists: true, $ne: '' } } });

variantSchema.pre('save', async function(next) {
    if (!this.name && this.options) {
        const optValues = Array.from(this.options.values()).join(' / ');
        this.name = optValues || `Variant ${this.sku}`;
    }
    next();
});

variantSchema.statics.findBySku = function(sku) {
    return this.findOne({ sku: sku, isDeleted: false });
};

variantSchema.statics.findByProduct = function(productId) {
    return this.find({ product: productId, isDeleted: false }).sort({ createdAt: 1 });
};

variantSchema.statics.findByOptions = async function(productId, options) {
    const query = { product: productId, isDeleted: true };
    if (options) {
        for (const [key, value] of Object.entries(options)) {
            query[`options.${key}`] = value;
        }
    }
    return this.findOne(query);
};

const VariantModel = mongoose.model('Variant', variantSchema);

export default VariantModel;
