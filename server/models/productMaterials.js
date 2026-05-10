import mongoose from 'mongoose';

const productMaterialsSchema = mongoose.Schema({
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


const ProductMaterialsModel = mongoose.model('ProductMaterials',productMaterialsSchema)

export default ProductMaterialsModel