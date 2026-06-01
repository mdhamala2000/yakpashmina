import HomeSliderModel from "../models/homeSlider.modal.js";
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

export async function addHomeSlide(request, response) {
    try {
        let slide = new HomeSliderModel({
            images: request.body.images || [],
        });
        slide = await slide.save();
        return response.status(200).json({ message: "Slide created", error: false, success: true, slide: slide });
    } catch (error) {
        return response.status(500).json({ message: error.message || error, error: true, success: false });
    }
}

export async function getHomeSlides(request, response) {
    try {
        const slides = await HomeSliderModel.find();
        return response.status(200).json({ error: false, success: true, data: slides });
    } catch (error) {
        return response.status(500).json({ message: error.message || error, error: true, success: false });
    }
}

export async function getSlide(request, response) {
    try {
        const slide = await HomeSliderModel.findById(request.params.id);
        if (!slide) {
            return response.status(404).json({ message: "The slide with the given ID was not found.", error: true, success: false });
        }
        return response.status(200).json({ error: false, success: true, slide: slide });
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

export async function deleteSlide(request, response) {
    try {
        const slide = await HomeSliderModel.findById(request.params.id);
        if (!slide) {
            return response.status(404).json({ message: "Slide not found!", success: false, error: true });
        }
        const images = slide.images || [];
        for (const img of images) {
            const urlArr = img.split("/");
            const imageName = urlArr[urlArr.length - 1].split(".")[0];
            if (imageName) {
                cloudinary.uploader.destroy(imageName, () => {});
            }
        }
        await HomeSliderModel.findByIdAndDelete(request.params.id);
        return response.status(200).json({ success: true, error: false, message: "Slide Deleted!" });
    } catch (error) {
        return response.status(500).json({ message: error.message || error, error: true, success: false });
    }
}

export async function updatedSlide(request, response) {
    try {
        const slide = await HomeSliderModel.findByIdAndUpdate(
            request.params.id,
            { ...request.body },
            { new: true }
        );
        if (!slide) {
            return response.status(500).json({ message: "slide cannot be updated!", success: false, error: true });
        }
        return response.status(200).json({ error: false, success: true, slide: slide, message: "slide updated successfully" });
    } catch (error) {
        return response.status(500).json({ message: error.message || error, error: true, success: false });
    }
}

export async function deleteMultipleSlides(request, response) {
    try {
        const { ids } = request.body;
        if (!ids || !Array.isArray(ids)) {
            return response.status(400).json({ error: true, success: false, message: 'Invalid input' });
        }
        for (const id of ids) {
            const slide = await HomeSliderModel.findById(id);
            if (slide) {
                const images = slide.images || [];
                for (const img of images) {
                    const urlArr = img.split("/");
                    const imageName = urlArr[urlArr.length - 1].split(".")[0];
                    if (imageName) {
                        cloudinary.uploader.destroy(imageName, () => {});
                    }
                }
            }
        }
        await HomeSliderModel.deleteMany({ _id: { $in: ids } });
        return response.status(200).json({ message: "slides deleted successfully", error: false, success: true });
    } catch (error) {
        return response.status(500).json({ message: error.message || error, error: true, success: false });
    }
}
