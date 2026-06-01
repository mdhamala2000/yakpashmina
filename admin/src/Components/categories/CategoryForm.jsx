import React, { useState, useEffect, useCallback } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import Modal from '../ui/Modal';
import { 
  useCreateCategory, 
  useUpdateCategory, 
  useCheckDuplicate,
  flattenCategories,
  checkDuplicateLocally 
} from '../../hooks/useCategories';

const CategoryForm = ({ 
  open, 
  onClose, 
  editCategory = null, 
  categories = [],
  onSuccess 
}) => {
  const isEdit = !!editCategory;
  const excludeId = editCategory?._id || null;

  const [formData, setFormData] = useState({
    name: '',
    parentId: '',
    description: '',
    metaTitle: '',
    metaDescription: '',
    slug: '',
    images: [],
  });
  
  const [previews, setPreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [duplicateWarning, setDuplicateWarning] = useState({ show: false, message: '' });
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const checkDuplicateMutation = useCheckDuplicate();

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      if (editCategory) {
        const editImages = editCategory.images || [];
        setFormData({
          name: editCategory.name || '',
          parentId: editCategory.parentId || '',
          description: editCategory.description || '',
          metaTitle: editCategory.metaTitle || '',
          metaDescription: editCategory.metaDescription || '',
          slug: editCategory.slug || '',
          images: editImages,
        });
        setPreviews(editImages);
      } else {
        setFormData({
          name: '',
          parentId: '',
          description: '',
          metaTitle: '',
          metaDescription: '',
          slug: '',
          images: [],
        });
        setPreviews([]);
      }
      setErrors({});
      setDuplicateWarning({ show: false, message: '' });
    }
  }, [open, editCategory]);

  // Auto-generate slug from name
  useEffect(() => {
    if (!isEdit || !formData.slug) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));

    // Check duplicate on name change
    if (name === 'name' && value.trim().length >= 2) {
      checkForDuplicate(value, formData.parentId);
    } else if (name === 'name' && !value.trim()) {
      setDuplicateWarning({ show: false, message: '' });
    }
  };

  const checkForDuplicate = useCallback(async (name, parentId) => {
    // First check locally
    const localDuplicate = checkDuplicateLocally(categories, name, parentId, excludeId);
    
    if (localDuplicate) {
      setDuplicateWarning({
        show: true,
        message: 'A category with this name already exists under the same parent (case-insensitive). Please choose a different name.'
      });
      return;
    }

    // Then check via API
    setCheckingDuplicate(true);
    try {
      const { data } = await checkDuplicateMutation.mutateAsync({ 
        name, 
        parentId: parentId || null,
        excludeId 
      });
      
      if (data?.isDuplicate) {
        setDuplicateWarning({
          show: true,
          message: data.message || 'A category with this name already exists under the same parent.'
        });
      } else {
        setDuplicateWarning({ show: false, message: '' });
      }
    } catch (error) {
      // If API fails, fall back to local check result
      console.error('Duplicate check error:', error);
    }
    setCheckingDuplicate(false);
  }, [categories, excludeId, checkDuplicateMutation]);

  const handleParentChange = (e) => {
    const newParentId = e.target.value;
    setFormData(prev => ({ ...prev, parentId: newParentId }));
    
    // Re-check duplicate with new parent
    if (formData.name.trim().length >= 2) {
      checkForDuplicate(formData.name, newParentId);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Create preview URLs (data URLs for local preview)
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
    setFormData(prev => ({ 
      ...prev, 
      images: [...prev.images, ...newPreviews] 
    }));
  };

  const removeImage = (index) => {
    const newPreviews = [...previews];
    // Revoke the URL to avoid memory leaks
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
    setFormData(prev => ({ 
      ...prev, 
      images: newPreviews 
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }
    
    if (duplicateWarning.show) {
      newErrors.name = duplicateWarning.message;
    }
    
    if (!isEdit && previews.length === 0) {
      newErrors.images = 'Category image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const payload = {
        name: formData.name.trim(),
        parentId: formData.parentId || null,
        description: formData.description || '',
        metaTitle: formData.metaTitle || '',
        metaDescription: formData.metaDescription || '',
        slug: formData.slug || '',
        // Send images as array of URLs (data URLs work with the updated backend)
        images: previews,
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ 
          id: editCategory._id, 
          category: payload 
        });
      } else {
        await createMutation.mutateAsync(payload);
      }

      // Clear previews to free memory
      previews.forEach(url => URL.revokeObjectURL(url));
      
      onSuccess?.();
      onClose();
    } catch (error) {
      // Error is handled by React Query mutations
      console.error('Form submission error:', error);
    }
  };

  const flattenedCategories = flattenCategories(categories);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Category' : 'Add New Category'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* Category Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`
              w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              transition-all duration-200 text-sm sm:text-base
              ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'}
            `}
            placeholder="Enter category name"
          />
          {checkingDuplicate && (
            <p className="text-sm text-blue-600 mt-1 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Checking for duplicates...
            </p>
          )}
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        {/* Parent Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Parent Category
          </label>
          <select
            name="parentId"
            value={formData.parentId || ''}
            onChange={handleParentChange}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
          >
            <option value="">None (Top Level)</option>
            {flattenedCategories
              .filter(cat => cat._id !== excludeId)
              .map(cat => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-sm sm:text-base"
            placeholder="Enter category description (optional)"
          />
        </div>

        {/* SEO Settings */}
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-3 sm:space-y-4">
          <h3 className="font-medium text-gray-900 text-sm sm:text-base">SEO Settings</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL Slug
            </label>
            <div className="flex items-center">
              <span className="px-2 sm:px-3 py-2 sm:py-2.5 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                /category/
              </span>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
                placeholder="auto-generated-from-name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Title
            </label>
            <input
              type="text"
              name="metaTitle"
              value={formData.metaTitle}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
              placeholder="Category Name | Your Store"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Description
            </label>
            <textarea
              name="metaDescription"
              value={formData.metaDescription}
              onChange={handleChange}
              rows={2}
              maxLength={160}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-sm sm:text-base"
              placeholder="Enter a brief description for search engines"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.metaDescription?.length || 0}/160 characters
            </p>
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category Image {!isEdit && <span className="text-red-500">*</span>}
          </label>
          
          {errors.images && (
            <p className="text-sm text-red-500 mb-2">{errors.images}</p>
          )}
          
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-md"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
                <div className="h-16 sm:h-20 rounded-lg overflow-hidden border-2 border-dashed border-gray-200">
                  <img 
                    src={preview} 
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ))}
            
            <label className="h-16 sm:h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="text-center">
                <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mx-auto mb-0.5" />
                <span className="text-[10px] sm:text-xs text-gray-500">Upload</span>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || duplicateWarning.show}
            className="px-5 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? 'Update Category' : 'Create Category'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryForm;