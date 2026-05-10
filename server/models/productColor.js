import mongoose from 'mongoose';

const productColorSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
},{
    timestamps : true
});


const ProductColorModel = mongoose.model('ProductColor',productColorSchema)

export default ProductColorModel