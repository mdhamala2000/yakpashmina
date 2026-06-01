import BlogModel from '../models/blog.model.js';
import cloudinary from '../config/cloudinaryConfig.js';
import fs from 'fs';

export async function uploadImages(request, response) {
    try {
        const image = request.files;
        if (!image || image.length === 0) {
            return response.status(400).json({ message: "No files uploaded", error: true, success: false });
        }
        const options = { use_filename: true, unique_filename: false, overwrite: false };
        const results = await Promise.all(image.map(async (file) => {
            const result = await cloudinary.uploader.upload(file.path, options);
            try { fs.unlinkSync(file.path); } catch (e) { /* ignore */ }
            return result.secure_url;
        }));
        return response.status(200).json({ images: results });
    } catch (error) {
        return response.status(500).json({ message: error.message || error, error: true, success: false });
    }
}

export async function addBlog(request, response) {
    try {
        let blog = new BlogModel({
            title: request.body.title,
            images: request.body.images || [],
            description: request.body.description,
            category: request.body.category || 'General',
            excerpt: request.body.excerpt || '',
            author: request.body.author || 'Admin',
            authorBio: request.body.authorBio || '',
            authorAvatar: request.body.authorAvatar || '',
            featured: request.body.featured || false,
            tags: request.body.tags || [],
            readTime: request.body.readTime || '5 min read',
            likes: 0
        });
        blog = await blog.save();
        return response.status(200).json({ message: "blog created", error: false, success: true, blog: blog });
    } catch (error) {
        return response.status(500).json({ message: error.message || error, error: true, success: false });
    }
}

export async function getBlogs(request, response) {
    try {
        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 100;
        const totalPosts = await BlogModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);
        if (page > totalPages) {
            return response.status(404).json({ message: "Page not found", success: false, error: true });
        }
        const blogs = await BlogModel.find()
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();
        return response.status(200).json({
            error: false, success: true, blogs: blogs,
            totalPages: totalPages, page: page,
        });
    } catch (error) {
        return response.status(500).json({ message: error.message || error, error: true, success: false });
    }
}

export async function getBlog(request, response) {
    try {
        const blog = await BlogModel.findById(request.params.id);
        if (!blog) {
            return response.status(404).json({ message: "The blog with the given ID was not found.", error: true, success: false });
        }
        return response.status(200).json({ error: false, success: true, blog: blog });
    } catch (error) {
        return response.status(500).json({ message: error.message || error, error: true, success: false });
    }
}

export async function deleteBlog(request, response) {
    try {
        const blog = await BlogModel.findById(request.params.id);
        if (!blog) {
            return response.status(404).json({ message: "blog not found!", success: false, error: true });
        }
        const images = blog.images || [];
        for (const img of images) {
            const urlArr = img.split("/");
            const imageName = urlArr[urlArr.length - 1].split(".")[0];
            if (imageName) {
                cloudinary.uploader.destroy(imageName, () => {});
            }
        }
        await BlogModel.findByIdAndDelete(request.params.id);
        return response.status(200).json({ success: true, error: false, message: "Blog Deleted!" });
    } catch (error) {
        return response.status(500).json({ message: error.message || error, error: true, success: false });
    }
}

export async function updateBlog(request, response) {
    try {
        const updateData = { ...request.body };
        const blog = await BlogModel.findByIdAndUpdate(
            request.params.id,
            updateData,
            { new: true }
        );
        if (!blog) {
            return response.status(500).json({ message: "Blog cannot be updated!", success: false, error: true });
        }
        return response.status(200).json({ error: false, success: true, blog: blog, message: "blog updated successfully" });
    } catch (error) {
        return response.status(500).json({ message: error.message || error, error: true, success: false });
    }
}
