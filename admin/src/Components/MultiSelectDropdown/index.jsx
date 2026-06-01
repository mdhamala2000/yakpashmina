import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, X, Check } from 'lucide-react';

const MultiSelectDropdown = ({
  label,
  options = [],
  selected = [],
  onChange,
  onAddNew,
  placeholder = 'Select options',
  allowAddNew = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newOption, setNewOption] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowAddInput(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setShowAddInput(false);
    }
  };

  const handleSelect = (option) => {
    const newSelected = selected.includes(option)
      ? selected.filter(s => s !== option)
      : [...selected, option];
    onChange(newSelected);
  };

  const handleAddNew = () => {
    if (newOption.trim()) {
      console.log('Adding new option:', newOption.trim());
      onAddNew(newOption.trim());
      setNewOption('');
      setShowAddInput(false);
    }
  };

  const removeSelected = (option) => {
    onChange(selected.filter(s => s !== option));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      {/* Selected Tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {selected.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs"
            >
              {item}
              <button
                type="button"
                onClick={() => removeSelected(item)}
                className="hover:bg-blue-200 rounded p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown Button */}
      <button
        type="button"
        onClick={handleToggle}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
      >
        <span className={selected.length > 0 ? 'text-gray-900' : 'text-gray-400'}>
          {selected.length > 0 ? `${selected.length} selected` : placeholder}
        </span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[250px] overflow-y-auto">
          {/* Options List */}
          <div className="py-1">
            {options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No options available
              </div>
            ) : (
              options.map((option, index) => {
                const isSelected = selected.includes(option);
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors ${
                      isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    <span className="text-sm">{option}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Add New Option */}
          {allowAddNew && (
            <div className="border-t border-gray-200 p-2">
              {showAddInput ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder="Enter new option"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddNew();
                      if (e.key === 'Escape') setShowAddInput(false);
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddNew}
                    disabled={!newOption.trim()}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddInput(false);
                      setNewOption('');
                    }}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddInput(true)}
                  className="w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2 rounded-md"
                >
                  <Plus className="w-4 h-4" />
                  Add New Option
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;