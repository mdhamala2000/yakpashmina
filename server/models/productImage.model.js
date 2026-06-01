import mongoose from 'mongoose';

const productImageSchema = mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        index: true
    },
    url: {
        type: String,
        required: true
    },
    alt: {
        type: String,
        default: ''
    },
    color: {
        type: String,
        default: ''
    },
    colorHex: {
        type: String,
        default: ''
    },
    isPrimary: {
        type: Boolean,
        default: false
    },
    sortOrder: {
        type: Number,
        default: 0
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

productImageSchema.index({ product: 1, isDeleted: 1 });
productImageSchema.index({ product: 1, color: 1, isDeleted: 1 });
productImageSchema.index({ product: 1, isPrimary: 1, isDeleted: 1 });

productImageSchema.statics.findByProduct = function(productId) {
    return this.find({ product: productId, isDeleted: false }).sort({ sortOrder: 1, createdAt: 1 });
};

productImageSchema.statics.findByColor = function(productId, color) {
    return this.find({ product: productId, color: color, isDeleted: false }).sort({ sortOrder: 1 });
};

productImageSchema.statics.getPrimaryImage = function(productId) {
    return this.findOne({ product: productId, isPrimary: true, isDeleted: false });
};

const ProductImageModel = mongoose.model('ProductImage', productImageSchema);

export default ProductImageModel;
