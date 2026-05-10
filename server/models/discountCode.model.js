import mongoose from "mongoose";

const discountCodeSchema = mongoose.Schema({
    code: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    discountType: {
        type: String,
        required: true,
        enum: ['percentage', 'fixed'],
        default: 'percentage'
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0
    },
    minPurchaseAmount: {
        type: Number,
        default: 0
    },
    maxDiscountAmount: {
        type: Number,
        default: null
    },
    description: {
        type: String,
        default: ''
    },
    startDate: {
        type: Date,
        default: null
    },
    endDate: {
        type: Date,
        default: null
    },
    usageLimit: {
        type: Number,
        default: null
    },
    usageCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    applicableCategories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: []
    }],
    applicableProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        default: []
    }]
}, { timestamps: true });

const DiscountCodeModel = mongoose.model('DiscountCode', discountCodeSchema);

export default DiscountCodeModel;