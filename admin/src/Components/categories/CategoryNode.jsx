import React from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Edit2, 
  Trash2, 
  Eye,
  Folder,
  FolderOpen,
} from 'lucide-react';

/**
 * Single category node component
 */
const CategoryNode = ({ 
  category,
  depth = 0,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onViewProducts,
  searchTerm = '',
  isHighlighted = false,
}) => {
  const hasChildren = category?.children?.length > 0;
  const childCount = category?.children?.length || 0;
  const productCount = category?.productCount || 0;

  // Highlight matching text
  const highlightText = (text) => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark 
          key={index} 
          className="bg-yellow-200 text-yellow-900 px-0.5 rounded"
        >
          {part}
        </mark>
      ) : part
    );
  };

  // Indentation style
  const indentStyle = {
    paddingLeft: `${depth * 24 + 12}px`,
  };

  return (
    <div className="w-full">
      {/* Node Row */}
      <div 
        className={`
          flex items-center w-full px-3 py-2.5 rounded-lg mb-1
          transition-all duration-200 group
          ${depth === 0 
            ? 'bg-gradient-to-r from-white to-gray-50 border border-gray-200 hover:border-gray-300' 
            : 'bg-white border-l-3 border-blue-300 ml-4'
          }
          ${isHighlighted ? 'ring-2 ring-blue-400 bg-blue-50' : 'hover:bg-gray-50'}
        `}
        style={indentStyle}
      >
        {/* Toggle Button */}
        {hasChildren ? (
          <button
            onClick={() => onToggle(category._id)}
            className="mr-2 p-1 hover:bg-blue-100 rounded text-gray-500 hover:text-blue-600 transition-colors flex-shrink-0"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        ) : (
          <div className="w-6 mr-2 flex-shrink-0" />
        )}

        {/* Category Icon */}
        <div className="mr-3 flex-shrink-0">
          {isExpanded && hasChildren ? (
            <FolderOpen className="w-5 h-5 text-blue-500" />
          ) : (
            <Folder className={`w-5 h-5 ${depth === 0 ? 'text-amber-500' : 'text-gray-400'}`} />
          )}
        </div>

        {/* Category Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800 truncate">
              {highlightText(category.name)}
            </span>
            
            {/* Child Count Badge */}
            {hasChildren && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {childCount} {childCount === 1 ? 'sub' : 'subs'}
              </span>
            )}
          </div>
          
          <div className="text-xs text-gray-500 mt-0.5">
            <span>{productCount} product{productCount !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* View Products */}
          <button
            onClick={() => onViewProducts(category)}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="View Products"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Edit */}
          <button
            onClick={() => onEdit(category)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(category)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Render Children */}
      {isExpanded && hasChildren && (
        <div className="w-full">
          {category.children.map((child, index) => (
            <CategoryNode
              key={child._id || index}
              category={child}
              depth={depth + 1}
              isExpanded={isExpanded}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewProducts={onViewProducts}
              searchTerm={searchTerm}
              isHighlighted={isHighlighted}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryNode;