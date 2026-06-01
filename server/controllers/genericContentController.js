import { deleteImages } from '../services/imageService.js';

/**
 * Generic Image-Based Content Controller
 * Replaces: bannerV1, bannerList2, homeSlider, logo controllers
 * Eliminates: 900+ lines of duplicate code, global variable bug
 */

// Create generic content item
export async function createContent(Model) {
  return async (request, response) => {
    try {
      const { images = [], ...data } = request.body;

      // Validate required fields
      if (!Object.keys(data).length) {
        return response.status(400).json({
          error: true,
          message: 'Missing required fields'
        });
      }

      const content = new Model({
        ...data,
        images: images // Images come from req.body (uploaded separately)
      });

      const savedContent = await content.save();

      return response.status(201).json({
        error: false,
        success: true,
        message: 'Content created successfully',
        data: savedContent
      });
    } catch (error) {
      return response.status(500).json({
        error: true,
        message: error.message || 'Failed to create content'
      });
    }
  };
}

// Get all content
export async function getContent(Model) {
  return async (request, response) => {
    try {
      const content = await Model.find().lean();

      return response.status(200).json({
        error: false,
        success: true,
        data: content
      });
    } catch (error) {
      return response.status(500).json({
        error: true,
        message: error.message || 'Failed to fetch content'
      });
    }
  };
}

// Get single content
export async function getSingleContent(Model) {
  return async (request, response) => {
    try {
      const { id } = request.params;

      if (!id) {
        return response.status(400).json({
          error: true,
          message: 'ID is required'
        });
      }

      const content = await Model.findById(id).lean();

      if (!content) {
        return response.status(404).json({
          error: true,
          message: 'Content not found'
        });
      }

      return response.status(200).json({
        error: false,
        success: true,
        data: content
      });
    } catch (error) {
      return response.status(500).json({
        error: true,
        message: error.message || 'Failed to fetch content'
      });
    }
  };
}

// Update content
export async function updateContent(Model) {
  return async (request, response) => {
    try {
      const { id } = request.params;
      const { images = [], ...updateData } = request.body;

      if (!id) {
        return response.status(400).json({
          error: true,
          message: 'ID is required'
        });
      }

      // Get old images to delete from Cloudinary
      const oldContent = await Model.findById(id);
      if (oldContent?.images?.length) {
        await deleteImages(oldContent.images).catch(err => {
          console.error('Failed to delete old images:', err);
        });
      }

      const updatedContent = await Model.findByIdAndUpdate(
        id,
        { ...updateData, images },
        { new: true, runValidators: true }
      );

      if (!updatedContent) {
        return response.status(404).json({
          error: true,
          message: 'Content not found'
        });
      }

      return response.status(200).json({
        error: false,
        success: true,
        message: 'Content updated successfully',
        data: updatedContent
      });
    } catch (error) {
      return response.status(500).json({
        error: true,
        message: error.message || 'Failed to update content'
      });
    }
  };
}

// Delete content
export async function deleteContent(Model) {
  return async (request, response) => {
    try {
      const { id } = request.params;

      if (!id) {
        return response.status(400).json({
          error: true,
          message: 'ID is required'
        });
      }

      const content = await Model.findById(id);

      if (!content) {
        return response.status(404).json({
          error: true,
          message: 'Content not found'
        });
      }

      // Delete images from Cloudinary
      if (content.images?.length) {
        await deleteImages(content.images).catch(err => {
          console.error('Failed to delete images:', err);
        });
      }

      await Model.findByIdAndDelete(id);

      return response.status(200).json({
        error: false,
        success: true,
        message: 'Content deleted successfully'
      });
    } catch (error) {
      return response.status(500).json({
        error: true,
        message: error.message || 'Failed to delete content'
      });
    }
  };
}

// Delete multiple items (for batch operations)
export async function deleteMultiple(Model) {
  return async (request, response) => {
    try {
      const { ids = [] } = request.body;

      if (!ids.length) {
        return response.status(400).json({
          error: true,
          message: 'No IDs provided'
        });
      }

      // Get all items to delete their images
      const items = await Model.find({ _id: { $in: ids } });

      // Delete all images from Cloudinary
      const allImages = items.flatMap(item => item.images || []);
      if (allImages.length) {
        await deleteImages(allImages).catch(err => {
          console.error('Failed to delete images:', err);
        });
      }

      // Delete database records
      const result = await Model.deleteMany({ _id: { $in: ids } });

      return response.status(200).json({
        error: false,
        success: true,
        message: `${result.deletedCount} items deleted`,
        deletedCount: result.deletedCount
      });
    } catch (error) {
      return response.status(500).json({
        error: true,
        message: error.message || 'Failed to delete items'
      });
    }
  };
}