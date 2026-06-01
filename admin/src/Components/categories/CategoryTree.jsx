import React, { useMemo } from 'react';
import CategoryNode from './CategoryNode';
import { FolderOpen } from 'lucide-react';

/**
 * CategoryTree component - renders the hierarchical tree
 */
const CategoryTree = ({ 
  categories = [],
  expandedIds = new Set(),
  onToggle,
  onEdit,
  onDelete,
  onViewProducts,
  searchTerm = '',
}) => {
  // Calculate search results
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return null;
    
    const term = searchTerm.toLowerCase().trim();
    const matchedIds = new Set();
    
    // Find all matching category IDs
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
    
    // Get all parent IDs (to auto-expand)
    const getParentIds = (cats) => {
      cats.forEach(cat => {
        if (matchedIds.has(cat._id)) return;
        
        if (cat.children?.some(child => matchedIds.has(child._id))) {
          matchedIds.add(cat._id);
        }
        
        if (cat.children?.length) {
          getParentIds(cat.children);
        }
      });
    };
    getParentIds(categories);
    
    return matchedIds;
  }, [categories, searchTerm]);

  // Check if a category should be highlighted
  const isHighlighted = (categoryId) => {
    return searchResults?.has(categoryId) || false;
  };

  // Count total categories
  const countCategories = (cats) => {
    let count = cats.length;
    cats.forEach(cat => {
      if (cat.children?.length) {
        count += countCategories(cat.children);
      }
    });
    return count;
  };

  const totalCategories = countCategories(categories);

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <FolderOpen className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          No categories yet
        </h3>
        <p className="text-gray-500 max-w-sm">
          Start by adding your first category to organize your products.
        </p>
      </div>
    );
  }

  return (
    <div className="category-tree">
      {/* Tree Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-t-lg border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">
            Category Tree
          </span>
          <span className="text-xs text-gray-400">
            ({totalCategories} {totalCategories === 1 ? 'category' : 'categories'})
          </span>
        </div>
        
        {searchTerm && searchResults && (
          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
            {searchResults.size} match{searchResults.size !== 1 ? 'es' : ''}
          </span>
        )}
      </div>

      {/* Tree Content */}
      <div className="max-h-[70vh] overflow-y-auto p-2">
        {categories.map((category, index) => (
          <CategoryNode
            key={category._id || index}
            category={category}
            depth={0}
            isExpanded={expandedIds.has(category._id)}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewProducts={onViewProducts}
            searchTerm={searchTerm}
            isHighlighted={isHighlighted}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryTree;