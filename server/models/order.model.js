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
            },
            color: {
                type: String,
                default: ''
            },
            size: {
                type: String,
                default: ''
            },
            weight: {
                type: String,
                default: ''
            },
            ram: {
                type: String,
                default: ''
            },
            materials: {
                type: String,
                default: ''
            },
            variantId: {
                type: String,
                default: ''
            },
            variantSku: {
                type: String,
                default: ''
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
    currencyRate: {
        type: Number,
        default: 1
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
    },
    paymentExpiresAt: {
        type: Date,
        default: null
    },
    adminNote: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
})

const OrderModel = mongoose.model('order', orderSchema)

export default OrderModel