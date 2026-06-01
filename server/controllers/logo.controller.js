import LogoModel from '../models/logo.model.js';
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

export async function addLogo(request, response) {
    try {
        const images = request.body.images || [];
        let logoItem = new LogoModel({
            logo: images[0] || '',
        });
        logoItem = await logoItem.save();
        return response.status(200).json({ message: "logo added", error: false, success: true, logo: logoItem });
    } catch (error) {
        return response.status(500).json({ message: error.message || error, error: true, success: false });
    }
}

export async function getLogo(request, response) {
    try {
        const logo = await LogoModel.find();
        return response.status(200).json({ error: false, success: true, logo: logo });
    } catch (error) {
        return response.status(500).json({ message: error.message || error, error: true, success: false });
    }
}

export async function getLogoById(request, response) {
    try {
        const logo = await LogoModel.findById(request.params.id);
        if (!logo) {
            return response.status(404).json({ message: "The logo with the given ID was not found.", error: true, success: false });
        }
        return response.status(200).json({ error: false, success: true, logo: logo });
    } catch (error) {
        return response.status(500).json({ message: error.message || error, error: true, success: false });
    }
}

export async function updatedLogo(request, response) {
    try {
        const logo = await LogoModel.findByIdAndUpdate(
            request.params.id,
            { ...request.body },
            { new: true }
        );
        if (!logo) {
            return response.status(500).json({ message: "logo cannot be updated!", success: false, error: true });
        }
        return response.status(200).json({ error: false, success: true, logo: logo, message: "logo updated successfully" });
    } catch (error) {
        return response.status(500).json({ message: error.message || error, error: true, success: false });
    }
}

export async function removeImageFromCloudinary(request, response) {
    try {
        const imgUrl = request.query.img;
        if (!imgUrl) {
            return response.status(400).json({ error: true, message: "Image URL is required" });
        }
        const urlArr = imgUrl.split("/");
        const imageName = urlArr[urlArr.length - 1].split(".")[0];
        if (!imageName) {
            return response.status(400).json({ error: true, message: "Invalid image URL" });
        }
        const res = await cloudinary.uploader.destroy(imageName);
        return response.status(200).send(res);
    } catch (error) {
        return response.status(500).json({ message: error.message || error, error: true, success: false });
    }
}
