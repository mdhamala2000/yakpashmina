import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    images:[
        {
            type:String,
        }
    ],
    title : {
        type : String,
        default : '',
    },
    description : {
        type : String,
        default : '',
    },
    category : {
        type : String,
        default : 'General',
    },
    author : {
        type : String,
        default : 'Admin',
    },
    authorBio : {
        type : String,
        default : '',
    },
    authorAvatar : {
        type : String,
        default : '',
    },
    excerpt : {
        type : String,
        default : '',
    },
    featured : {
        type : Boolean,
        default : false,
    },
    tags : [{
        type : String,
    }],
    readTime : {
        type : String,
        default : '5 min read',
    },
    likes : {
        type : Number,
        default : 0,
    },
},{
    timestamps : true
});

const BlogModel = mongoose.model('blog',blogSchema)

export default BlogModel