import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const categoryService = {
  /**
   * Get all categories (nested tree structure)
   * @returns {Promise<Array>} Array of category objects with children
   */
  getCategories: async () => {
    const response = await api.get('/category');
    return response.data?.data || [];
  },

  /**
   * Get single category by ID
   * @param {string} id - Category ID
   * @returns {Promise<Object>} Category object
   */
  getCategoryById: async (id) => {
    const response = await api.get(`/category/${id}`);
    return response.data?.category;
  },

  /**
   * Check for duplicate category name
   * @param {string} name - Category name to check
   * @param {string|null} parentId - Parent category ID
   * @param {string|null} excludeId - ID to exclude from check (for editing)
   * @returns {Promise<{isDuplicate: boolean, message: string}>}
   */
  checkDuplicate: async (name, parentId = null, excludeId = null) => {
    const params = new URLSearchParams();
    params.append('name', name);
    if (parentId) params.append('parentId', parentId);
    if (excludeId) params.append('excludeId', excludeId);
    
    const response = await api.get(`/duplicates/category?${params.toString()}`);
    return response.data;
  },

  /**
   * Upload category images and return URLs
   * @param {File[]|string[]} files - Image files or data URLs to upload
   * @returns {Promise<string[]>} Array of uploaded image URLs
   */
  uploadImages: async (files) => {
    // If files are already URLs (data URLs), return them directly
    if (files.length > 0 && files[0].startsWith('data:')) {
      return { images: files };
    }
    
    // Otherwise upload as files
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    
    const response = await api.post('/category/uploadImages', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  /**
   * Create a new category
   * @param {Object} category - Category data
   * @returns {Promise<Object>} Created category
   */
  createCategory: async (category) => {
    // If images are data URLs, include them in the body
    // The backend will handle them
    const response = await api.post('/category/create', category, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  /**
   * Update an existing category
   * @param {string} id - Category ID
   * @param {Object} category - Updated category data
   * @returns {Promise<Object>} Updated category
   */
  updateCategory: async (id, category) => {
    const response = await api.put(`/category/${id}`, category);
    return response.data;
  },

  /**
   * Delete a category with options
   * @param {string} id - Category ID
   * @param {string} strategy - 'cascade' or 'reassign'
   * @param {string|null} reassignToId - ID of category to reassign children to
   * @returns {Promise<Object>} Deletion result
   */
  deleteCategory: async (id, strategy = 'cascade', reassignToId = null) => {
    if (strategy === 'reassign' && reassignToId) {
      const response = await api.delete(`/category/${id}/delete-with-options`, {
        data: { mode: 'reassign', reassignToCategoryId: reassignToId }
      });
      return response.data;
    }
    
    const response = await api.delete(`/category/${id}/delete-with-options`, {
      data: { mode: 'cascade' }
    });
    return response.data;
  },
};

export default categoryService;