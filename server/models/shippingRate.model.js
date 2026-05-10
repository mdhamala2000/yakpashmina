import mongoose from 'mongoose';

const shippingRateSchema = new mongoose.Schema({
    country: {
        type: String,
        required: true,
        trim: true
    },
    countryCode: {
        type: String,
        trim: true,
        uppercase: true
    },
    regions: [{
        name: {
            type: String,
            trim: true
        },
        rate: {
            type: Number,
            default: 0
        },
        estimatedDays: {
            type: String,
            trim: true
        }
    }],
    pricingType: {
        type: String,
        enum: ['flat', 'free'],
        default: 'flat'
    },
    flatRate: {
        type: Number,
        default: 0
    },
    freeShippingThreshold: {
        type: Number,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    estimatedDeliveryDays: {
        type: String,
        trim: true
    },
    currency: {
        type: String,
        default: 'USD'
    },
    displayOrder: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

shippingRateSchema.index({ country: 1 });
shippingRateSchema.index({ countryCode: 1 });

const ShippingRateModel = mongoose.model('ShippingRate', shippingRateSchema);

export default ShippingRateModel;