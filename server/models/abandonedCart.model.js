import mongoose from "mongoose";

const abandonedCartSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    userEmail: {
        type: String,
        required: true
    },
    userName: {
        type: String
    },
    products: [{
        productTitle: String,
        image: String,
        price: Number,
        quantity: Number,
        subTotal: Number,
        productId: String
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['not_recovered', 'recovered', 'lost'],
        default: 'not_recovered'
    },
    abandonedAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    reminderSent: {
        type: Boolean,
        default: false
    },
    reminderSentAt: Date,
    recoveredAt: Date,
    convertedToOrderId: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

abandonedCartSchema.index({ abandonedAt: 1, status: 1 });

const AbandonedCartModel = mongoose.model('AbandonedCart', abandonedCartSchema);

export default AbandonedCartModel;