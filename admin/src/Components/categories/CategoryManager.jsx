import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  RotateCcw, 
  X, 
  LayoutGrid,
  Loader2,
  AlertCircle,
} from 'lucide-react';

import { useCategories } from '../../hooks/useCategories';
import CategoryTree from './CategoryTree';
import CategoryForm from './CategoryForm';
import DeleteConfirmDialog from './DeleteConfirmDialog';

/**
 * Main Category Manager Component
 */
const CategoryManager = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // React Query - fetch categories
  const { 
    data: categories = [], 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useCategories();

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Handle URL params for navigation
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catId = params.get('catId');
    const subCatId = params.get('subCatId');
    
    if (catId || subCatId) {
      const timer = setTimeout(() => {
        navigate('/products', { replace: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);

  // Toggle expand/collapse
  const handleToggle = useCallback((id) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  // Auto-expand parents when searching
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return null;
    
    const term = searchTerm.toLowerCase().trim();
    const matchedIds = new Set();
    
    // Find matching IDs
    const findMatches = (cats) => {
      cats.forEach(cat => {
        if (cat.name.toLowerCase().includes(term)) {
          matchedIds.add(cat._id);
        }
        if (cat.children?.length) {
          findMatches(cat.children);
        }
      });
    };
    findMatches(categories);
    
    // Find parent IDs
    const findParents = (cats) => {
      cats.forEach(cat => {
        if (matchedIds.has(cat._id)) return;
        
        if (cat.children?.some(child => matchedIds.has(child._id))) {
          matchedIds.add(cat._id);
        }
        
        if (cat.children?.length) {
          findParents(cat.children);
        }
      });
    };
    findParents(categories);
    
    return matchedIds;
  }, [categories, searchTerm]);

  // Auto-expand on search
  useEffect(() => {
    if (searchResults && searchResults.size > 0) {
      setExpandedIds(prev => {
        const newSet = new Set(prev);
        searchResults.forEach(id => newSet.add(id));
        return newSet;
      });
    }
  }, [searchResults]);

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Open add modal
  const handleAddCategory = () => {
    setEditCategory(null);
    setFormModalOpen(true);
  };

  // Open edit modal
  const handleEdit = (category) => {
    setEditCategory(category);
    setFormModalOpen(true);
  };

  // Open delete dialog
  const handleDelete = (category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  // Navigate to products
  const handleViewProducts = (category) => {
    if (category?.parentId) {
      navigate(`/products?subCatId=${category._id}&subCatName=${encodeURIComponent(category.name)}`);
    } else {
      navigate(`/products?catId=${category._id}&catName=${encodeURIComponent(category.name)}`);
    }
  };

  // Handle form success
  const handleFormSuccess = () => {
    refetch();
  };

  // Handle delete success
  const handleDeleteSuccess = () => {
    refetch();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-500">Loading categories...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Failed to load categories
          </h3>
          <p className="text-gray-500 mb-4">
            {error?.message || 'Something went wrong. Please try again.'}
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <LayoutGrid className="w-6 h-6 text-blue-600" />
            Category Management
          </h1>
          <p className="text-gray-500 mt-1">
            Organize your products with categories and subcategories
          </p>
        </div>

        <button
          onClick={handleAddCategory}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
        
        {searchTerm && searchResults && (
          <p className="text-sm text-gray-500 mt-2">
            Found {searchResults.size} matching category{searchResults.size !== 1 ? 'ies' : ''}
          </p>
        )}
      </div>

      {/* Category Tree */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <CategoryTree
          categories={categories}
          expandedIds={expandedIds}
          onToggle={handleToggle}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewProducts={handleViewProducts}
          searchTerm={searchTerm}
        />
      </div>

      {/* Add/Edit Form Modal */}
      <CategoryForm
        open={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditCategory(null);
        }}
        editCategory={editCategory}
        categories={categories}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setCategoryToDelete(null);
        }}
        category={categoryToDelete}
        categories={categories}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default CategoryManager;