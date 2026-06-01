import cloudinary from '../config/cloudinaryConfig.js';
import fs from 'fs';

export const uploadImages = async (files) => {
  if (!files || files.length === 0) return [];

  try {
    const uploadPromises = files.map(file =>
      cloudinary.uploader.upload(file.path, {
        resource_type: 'auto',
        folder: 'yakpashamina'
      }).then(result => {
        try { fs.unlinkSync(file.path); } catch (e) { /* ignore */ }
        return result.secure_url;
      })
    );

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Image upload error:', error);
    throw new Error('Failed to upload images');
  }
};

export const deleteImages = async (imageUrls) => {
  if (!imageUrls || imageUrls.length === 0) return true;

  try {
    const deletePromises = imageUrls.map(url => {
      const parts = url.split('/');
      const imageName = parts[parts.length - 1].split('.')[0];
      if (!imageName) return Promise.resolve(null);
      return cloudinary.uploader.destroy(imageName).catch(err => {
        console.error(`Failed to delete image ${imageName}:`, err);
        return null;
      });
    });

    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    console.error('Image deletion error:', error);
    throw error;
  }
};

export const deleteImage = async (imageUrl) => {
  if (!imageUrl) return true;

  try {
    const parts = imageUrl.split('/');
    const imageName = parts[parts.length - 1].split('.')[0];
    if (!imageName) return true;
    await cloudinary.uploader.destroy(imageName);
    return true;
  } catch (error) {
    console.error('Image deletion error:', error);
    throw error;
  }
};

export default cloudinary;
