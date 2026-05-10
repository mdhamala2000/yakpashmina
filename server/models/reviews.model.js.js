import mongoose from "mongoose";

const reviewsSchema = new mongoose.Schema({
    image : {
        type : String,
        default : '',
    },
    userName : {
        type : String,
        default : 'Guest User',
    },
    review : {
        type : String,
        default : '',
    },
    rating : {
        type : Number,
        default : 5,
    },
    userId : {
        type : String,
        default : null,
    },
    productId : {
        type : String,
        default : '',
    },
    productName : {
        type : String,
        default : '',
    },
    reviewImages : [{
        type : String,
    }],
    isApproved : {
        type : Boolean,
        default : false,
    },
},{
    timestamps : true
});

const ReviewModel = mongoose.model('reviews',reviewsSchema)

export default ReviewModel