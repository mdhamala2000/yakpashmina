import BannerList2Model from '../models/bannerList2.model.js';
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

export async function addBanner(request, response) {
    try {
        let banner = new BannerList2Model({
            images: request.body.images || [],
            catId: request.body.catId,
            subCatId: request.body.subCatId,
            thirdsubCatId: request.body.thirdsubCatId,
        });
        banner = await banner.save();
        return response.status(200).json({ message: "banner created", error: false, success: true, banner: banner });
    } catch (error) {
        return response.status(500).json({ message: error.message || error, error: true, success: false });
    }
}

export async function getBanners(request, response) {
    try {
        const banners = await BannerList2Model.find();
        return response.status(200).json({ error: false, success: true, data: banners });
    } catch (error) {
        return response.status(500).json({ message: error.message || error, error: true, success: false });
    }
}

export async function getBanner(request, response) {
    try {
        const banner = await BannerList2Model.findById(request.params.id);
        if (!banner) {
            return response.status(404).json({ message: "The banner with the given ID was not found.", error: true, success: false });
        }
        return response.status(200).json({ error: false, success: true, banner: banner });
    } catch (error) {
        return response.status(500).json({ message: error.message || error, error: true, success: false });
    }
}

export async function deleteBanner(request, response) {
    try {
        const banner = await BannerList2Model.findById(request.params.id);
        if (!banner) {
            return response.status(404).json({ message: "Banner not found!", success: false, error: true });
        }
        const images = banner.images || [];
        for (const img of images) {
            const urlArr = img.split("/");
            const imageName = urlArr[urlArr.length - 1].split(".")[0];
            if (imageName) {
                cloudinary.uploader.destroy(imageName, () => {});
            }
        }
        await BannerList2Model.findByIdAndDelete(request.params.id);
        return response.status(200).json({ success: true, error: false, message: "Banner Deleted!" });
    } catch (error) {
        return response.status(500).json({ message: error.message || error, error: true, success: false });
    }
}

export async function updatedBanner(request, response) {
    try {
        const banner = await BannerList2Model.findByIdAndUpdate(
            request.params.id,
            { ...request.body },
            { new: true }
        );
        if (!banner) {
            return response.status(500).json({ message: "banner cannot be updated!", success: false, error: true });
        }
        return response.status(200).json({ error: false, success: true, banner: banner, message: "banner updated successfully" });
    } catch (error) {
        return response.status(500).json({ message: error.message || error, error: true, success: false });
    }
}
