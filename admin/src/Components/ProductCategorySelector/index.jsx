import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronRight, ChevronDown, X, Loader2 } from 'lucide-react';

const ProductCategorySelector = ({ 
  categories = [], 
  selectedMain, 
  selectedSub, 
  selectedThird,
  onMainChange, 
  onSubChange, 
  onThirdChange,
  showThirdLevel = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCats, setExpandedCats] = useState(new Set());
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset expanded categories when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setExpandedCats(new Set());
    }
  }, [isOpen]);

  // Get main categories (root level - no parent)
  const mainCategories = useMemo(() => {
    return categories.filter(cat => !cat.parentId);
  }, [categories]);

  // Flatten categories for easier search
  const flattenedCategories = useMemo(() => {
    const result = [];
    const flatten = (cats, parentName = '') => {
      cats.forEach(cat => {
        result.push({
          _id: cat._id,
          name: cat.name,
          parentId: cat.parentId,
          parentName: parentName,
          children: cat.children || []
        });
        if (cat.children?.length) {
          flatten(cat.children, cat.name);
        }
      });
    };
    flatten(categories);
    return result;
  }, [categories]);

  // Get subcategories for selected main category
  const subCategories = useMemo(() => {
    if (!selectedMain) return [];
    const mainCat = flattenedCategories.find(c => c._id === selectedMain);
    return mainCat?.children || [];
  }, [selectedMain, flattenedCategories]);

  // Get third level categories for selected subcategory
  const thirdCategories = useMemo(() => {
    if (!selectedSub) return [];
    const subCat = flattenedCategories.find(c => c._id === selectedSub);
    return subCat?.children || [];
  }, [selectedSub, flattenedCategories]);

  // Get category name by ID
  const getCategoryName = (id) => {
    if (!id) return 'Select Category';
    const cat = flattenedCategories.find(c => c._id === id);
    return cat?.name || 'Unknown';
  };

  const toggleExpand = (catId) => {
    setExpandedCats(prev => {
      const newSet = new Set(prev);
      if (newSet.has(catId)) {
        newSet.delete(catId);
      } else {
        newSet.add(catId);
      }
      return newSet;
    });
  };

  const handleCloseDropdown = () => {
    setIsOpen(false);
  };

  return (
    <div className="space-y-3">
      {/* Main Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category <span className="text-red-500">*</span>
        </label>
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            onBlur={(e) => {
              // Delay closing to allow click events on options
              setTimeout(() => {
                if (!e.relatedTarget?.closest('[data-dropdown]')) {
                  setIsOpen(false);
                }
              }, 200);
            }}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <span className={selectedMain ? 'text-gray-900' : 'text-gray-400'}>
              {getCategoryName(selectedMain) || 'Select Category'}
            </span>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[300px] overflow-y-auto">
              {mainCategories.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No categories available
                </div>
              ) : (
                mainCategories.map(cat => (
                  <div key={cat._id}>
                    <button
                      type="button"
                      onClick={() => {
                        onMainChange(cat._id);
                        onSubChange('');
                        onThirdChange('');
                        setIsOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors ${
                        selectedMain === cat._id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      <span className="font-medium">{cat.name}</span>
                      {cat.children?.length > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(cat._id);
                          }}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          {expandedCats.has(cat._id) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </button>
                    
                    {/* Subcategories */}
                    {expandedCats.has(cat._id) && cat.children?.map(subCat => (
                      <button
                        key={subCat._id}
                        type="button"
                        onClick={() => {
                          onMainChange(cat._id);
                          onSubChange(subCat._id);
                          onThirdChange('');
                          setIsOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left pl-8 hover:bg-gray-50 transition-colors ${
                          selectedSub === subCat._id ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
                        }`}
                      >
                        <span className="text-sm">{subCat.name}</span>
                        {subCat.children?.length > 0 && showThirdLevel && (
                          <span className="ml-2 text-xs text-gray-400">
                            ({subCat.children.length})
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sub Category */}
      {selectedMain && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sub Category
          </label>
          <select
            value={selectedSub}
            onChange={(e) => {
              onSubChange(e.target.value);
              onThirdChange('');
              handleCloseDropdown();
            }}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
          >
            <option value="">Select Sub Category (Optional)</option>
            {subCategories.map(sub => (
              <option key={sub._id} value={sub._id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Third Level Category */}
      {showThirdLevel && selectedSub && thirdCategories.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sub Sub Category
          </label>
          <select
            value={selectedThird}
            onChange={(e) => onThirdChange(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
          >
            <option value="">Select Sub Sub Category (Optional)</option>
            {thirdCategories.map(third => (
              <option key={third._id} value={third._id}>
                {third.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Selected Category Display */}
      {(selectedMain || selectedSub || selectedThird) && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Selected:</span>{' '}
            {getCategoryName(selectedMain)}
            {selectedSub && (
              <span className="text-blue-500"> › {getCategoryName(selectedSub)}</span>
            )}
            {selectedThird && showThirdLevel && (
              <span className="text-blue-500"> › {getCategoryName(selectedThird)}</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductCategorySelector;