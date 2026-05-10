import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    products: [
        {
            productId: {
                type: String
            },
            productTitle: {
                type: String
            },
            quantity: {
                type: Number
            },
            price: {
                type: Number
            },
            perUnit: {
                type: Number
            },
            image: {
                type: String
            },
            subTotal: {
                type: Number
            }
        }
    ],
    paymentId: {
        type: String,
        default: ""
    },
    payment_method: {
        type: String,
        default: ""
    },
    payment_status : {
        type : String,
        default : ""
    },
    order_status : {
        type : String,
        default : "confirm"
    },
    delivery_address: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    totalAmt: {
        type: Number,
        default: 0
    },
    currency: {
        type: String,
        default: "INR"
    },
    discountCode: {
        type: String,
        default: null
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    subTotal: {
        type: Number,
        default: 0
    },
    shippingCost: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
})

const OrderModel = mongoose.model('order', orderSchema)

export default OrderModel