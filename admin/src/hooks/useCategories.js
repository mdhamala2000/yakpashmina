import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../services/categoryService';
import toast from 'react-hot-toast';

const CATEGORY_KEY = ['categories'];

// Query keys for React Query
export const categoryKeys = {
  all: CATEGORY_KEY,
  lists: () => [...CATEGORY_KEY, 'list'],
  list: (filters) => [...CATEGORY_KEY, 'list', filters],
  details: () => [...CATEGORY_KEY, 'detail'],
  detail: (id) => [...CATEGORY_KEY, 'detail', id],
};

/**
 * Hook to fetch all categories (nested tree)
 */
export const useCategories = () => {
  return useQuery({
    queryKey: CATEGORY_KEY,
    queryFn: () => categoryService.getCategories(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (error) => {
      toast.error(error?.message || 'Failed to load categories');
    },
  });
};

/**
 * Hook to fetch single category by ID
 */
export const useCategory = (id) => {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoryService.getCategoryById(id),
    enabled: !!id,
  });
};

/**
 * Hook to check for duplicate category name
 */
export const useCheckDuplicate = () => {
  return useMutation({
    mutationFn: ({ name, parentId, excludeId }) =>
      categoryService.checkDuplicate(name, parentId, excludeId),
  });
};

/**
 * Hook to create a new category
 */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (category) => categoryService.createCategory(category),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEY });
      toast.success(data?.message || 'Category created successfully!');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to create category');
    },
  });
};

/**
 * Hook to update an existing category
 */
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, category }) => categoryService.updateCategory(id, category),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEY });
      toast.success(data?.message || 'Category updated successfully!');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to update category');
    },
  });
};

/**
 * Hook to delete a category
 */
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, strategy, reassignToId }) =>
      categoryService.deleteCategory(id, strategy, reassignToId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEY });
      toast.success(data?.message || 'Category deleted successfully!');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to delete category');
    },
  });
};

/**
 * Hook to upload category images
 */
export const useUploadImages = () => {
  return useMutation({
    mutationFn: (files) => categoryService.uploadImages(files),
  });
};

/**
 * Helper function to flatten categories for dropdown selection
 */
export const flattenCategories = (categories, prefix = '') => {
  let result = [];
  categories.forEach(cat => {
    result.push({
      _id: cat._id,
      name: prefix + cat.name,
      parentId: cat.parentId,
    });
    if (cat.children && cat.children.length > 0) {
      result = result.concat(flattenCategories(cat.children, prefix + '— '));
    }
  });
  return result;
};

/**
 * Helper function to check for duplicates locally in the tree
 */
export const checkDuplicateLocally = (categories, name, parentId, excludeId = null) => {
  const normalizedName = name.trim().toLowerCase();

  const searchInTree = (cats, targetParentId) => {
    for (const cat of cats) {
      // Skip the category being edited
      if (excludeId && cat._id === excludeId) continue;

      // Check for duplicate name under same parent
      if (cat.name?.toLowerCase().trim() === normalizedName) {
        if (targetParentId === null || targetParentId === '') {
          // Top level - check if this is also top level
          if (!cat.parentId) return true;
        } else if (cat.parentId === targetParentId) {
          // Same parent
          return true;
        }
      }

      // Recurse into children
      if (cat.children?.length && searchInTree(cat.children, targetParentId)) {
        return true;
      }
    }
    return false;
  };

  return searchInTree(categories, parentId || null);
};

export default useCategories;