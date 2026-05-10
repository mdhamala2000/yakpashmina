import mongoose from "mongoose";

const cartProductSchema = new mongoose.Schema({
    productTitle:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    rating:{
        type:Number,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    oldPrice:{
        type:Number,
    },
    discount:{
        type:Number,
    },
    size:{
        type:String,
    },
    weight:{
        type:String,
    },
    ram:{
        type:String,
    },
    color:{
        type:String,
    },
    materials:{
        type:String,
    },
    quantity:{
        type:Number,
        required:true
    },
    subTotal:{
        type:Number,
        required:true
    },
    productId:{
        type:String,
        required:true
    },
    countInStock:{
        type:Number,
        required:true
    },
    userId:{
        type:String,
        required:true
    },
    brand:{
        type:String,
    },
    status:{
        type:String,
        enum: ['active', 'converted', 'abandoned'],
        default: 'active'
    },
    convertedAt:{
        type:Date,
        default: null
    },
    abandonedAt:{
        type:Date,
        default: null
    },
    abandonedEmailSent:{
        type:Boolean,
        default: false
    }
},{
    timestamps : true
});

const CartProductModel = mongoose.model('cart',cartProductSchema)

export default CartProductModel