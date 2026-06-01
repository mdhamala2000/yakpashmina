import React, { useState } from 'react';
import { AlertTriangle, Trash2, ArrowUp, Loader2, X } from 'lucide-react';
import Modal from '../ui/Modal';
import { useDeleteCategory, flattenCategories } from '../../hooks/useCategories';

const DeleteConfirmDialog = ({ 
  open, 
  onClose, 
  category, 
  categories = [],
  onSuccess 
}) => {
  const [strategy, setStrategy] = useState('cascade');
  const [reassignToId, setReassignToId] = useState('');

  const deleteMutation = useDeleteCategory();
  const isLoading = deleteMutation.isPending;

  const hasChildren = category?.children?.length > 0;
  const flattenedCategories = flattenCategories(categories)
    .filter(cat => cat._id !== category?._id);

  const handleConfirm = async () => {
    try {
      await deleteMutation.mutateAsync({
        id: category._id,
        strategy,
        reassignToId: strategy === 'reassign' ? reassignToId : null,
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      // Error is handled by React Query mutation
    }
  };

  const handleClose = () => {
    setStrategy('cascade');
    setReassignToId('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Delete Category"
      size="sm"
    >
      <div className="space-y-4">
        {/* Warning Icon */}
        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
          <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-700">
              Delete "{category?.name}"?
            </p>
            <p className="text-sm text-red-600">
              This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Category Info */}
        {hasChildren && (
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-800 font-medium mb-3">
              This category has {category.children.length} subcategory(s):
            </p>
            <ul className="text-sm text-amber-700 space-y-1">
              {category.children.slice(0, 5).map((child, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                  {child.name}
                </li>
              ))}
              {category.children.length > 5 && (
                <li className="text-amber-600 italic">
                  +{category.children.length - 5} more...
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Strategy Options */}
        {hasChildren && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              How would you like to handle the subcategories?
            </label>

            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="strategy"
                value="cascade"
                checked={strategy === 'cascade'}
                onChange={(e) => setStrategy(e.target.value)}
                className="mt-1"
              />
              <div>
                <span className="font-medium text-gray-900 flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-red-500" />
                  Delete with children
                </span>
                <p className="text-sm text-gray-500">
                  Remove this category and all its subcategories
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="strategy"
                value="reassign"
                checked={strategy === 'reassign'}
                onChange={(e) => setStrategy(e.target.value)}
                className="mt-1"
              />
              <div className="flex-1">
                <span className="font-medium text-gray-900 flex items-center gap-2">
                  <ArrowUp className="w-4 h-4 text-blue-500" />
                  Move children to parent
                </span>
                <p className="text-sm text-gray-500 mb-2">
                  Move subcategories to another category
                </p>
                
                {strategy === 'reassign' && (
                  <select
                    value={reassignToId}
                    onChange={(e) => setReassignToId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Select a category</option>
                    {flattenedCategories.map(cat => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </label>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || (strategy === 'reassign' && !reassignToId)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Delete Category
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmDialog;