import React, { useState, useEffect, useRef } from 'react';
import { Button, IconButton, TextField, Chip, Alert, CircularProgress } from '@mui/material';
import { IoMdClose, IoMdAdd, IoMdTrash, IoMdCheckmark } from 'react-icons/io';
import { FaEdit, FaSave, FaTimes, FaStar } from 'react-icons/fa';
import { getData, postData, putData, deleteData } from '../../utils/api';

const VariantManager = ({ productId, onClose }) => {
    const [variants, setVariants] = useState([]);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingVariant, setEditingVariant] = useState(null);
    const [isAddingVariant, setIsAddingVariant] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedImage, setSelectedImage] = useState('');
    const [variantImages, setVariantImages] = useState({});
    const [message, setMessage] = useState({ type: '', text: '' });
    const [manualImageOverrides, setManualImageOverrides] = useState({});
    const [openImagePicker, setOpenImagePicker] = useState(null);
    const [attributes, setAttributes] = useState([
        { name: 'Color', options: [], values: {} },
        { name: 'Size', options: [], values: {} }
    ]);
    const initialAttrsRef = useRef([]);

    const [newOptionInputs, setNewOptionInputs] = useState({});
    const [editingOption, setEditingOption] = useState({ attrIndex: null, optIndex: null, value: '' });

    const [newVariant, setNewVariant] = useState({
        sku: '',
        options: {},
        price: '',
        oldPrice: '',
        stock: '',
        weight: '',
        dimensions: ''
    });

    useEffect(() => {
        if (productId) {
            fetchVariants();
            fetchImages();
        }
    }, [productId]);

    const fetchVariants = async () => {
        try {
            setLoading(true);
            const res = await getData(`/api/variant/product/${productId}`);
            if (res?.success) {
                setVariants(res.variants || []);
                if (res.variants?.length > 0) {
                    const allOptions = {};
                    res.variants.forEach(v => {
                        if (v.options) {
                            Object.keys(v.options).forEach(key => {
                                if (!allOptions[key]) allOptions[key] = new Set();
                                allOptions[key].add(v.options[key]);
                            });
                        }
                    });
                    const derivedAttrs = Object.keys(allOptions).map(key => ({
                        name: key,
                        options: Array.from(allOptions[key]),
                        values: {}
                    }));
                    let finalAttrs = derivedAttrs;
                    try {
                        const productRes = await getData(`/api/product/${productId}`);
                        if (productRes?.success && productRes?.product?.variantAttributeNames?.length > 0) {
                            const storedNames = productRes.product.variantAttributeNames;
                            const merged = [];
                            storedNames.forEach(name => {
                                const existing = derivedAttrs.find(a => a.name === name);
                                merged.push(existing || { name, options: [], values: {} });
                            });
                            derivedAttrs.forEach(a => {
                                if (!storedNames.includes(a.name) && !merged.find(m => m.name === a.name)) {
                                    merged.push(a);
                                }
                            });
                            finalAttrs = merged;
                        }
                    } catch (e) {
                        // ignore
                    }
                    setAttributes(finalAttrs.length > 0 ? finalAttrs : [
                        { name: 'Color', options: [], values: {} },
                        { name: 'Size', options: [], values: {} }
                    ]);
                    initialAttrsRef.current = finalAttrs.map(a => a.name);
                } else {
                    initialAttrsRef.current = [];
                }
            }
        } catch (error) {
            showMessage('error', 'Failed to fetch variants');
        }
        setLoading(false);
    };

    const saveAttributeNames = async () => {
        try {
            const names = attributes.map(a => a.name).filter(n => n.trim());
            if (names.length > 0) {
                await putData(`/api/variant/attribute-names/${productId}`, { attributeNames: names });
            }
        } catch (error) {
            // non-critical
        }
    };

    const handleAttributeNameBlur = async (index) => {
        const newName = attributes[index]?.name?.trim();
        const oldName = initialAttrsRef.current[index] || '';
        if (!newName) {
            if (oldName) {
                const updated = [...attributes];
                updated[index].name = oldName;
                setAttributes(updated);
            }
            showMessage('error', 'Attribute name cannot be empty');
            return;
        }
        if (newName === oldName) return;
        if (oldName && variants.length > 0) {
            const hasOldAttr = variants.some(v => v.options && v.options[oldName] !== undefined);
            if (hasOldAttr) {
                try {
                    const res = await putData(`/api/variant/rename-attribute/${productId}`, { oldName, newName });
                    if (res?.success) {
                        showMessage('success', `Attribute "${oldName}" renamed to "${newName}"`);
                        initialAttrsRef.current = [...attributes.map(a => a.name)];
                        saveAttributeNames();
                        fetchVariants();
                        return;
                    } else {
                        showMessage('error', res?.message || 'Failed to rename attribute');
                        const updated = [...attributes];
                        updated[index].name = oldName;
                        setAttributes(updated);
                        return;
                    }
                } catch (error) {
                    showMessage('error', 'Failed to rename attribute');
                    const updated = [...attributes];
                    updated[index].name = oldName;
                    setAttributes(updated);
                    return;
                }
            }
        }
        if (initialAttrsRef.current.length <= index) {
            initialAttrsRef.current = [...initialAttrsRef.current, ...Array(index - initialAttrsRef.current.length + 1).fill('')];
        }
        initialAttrsRef.current[index] = newName;
        saveAttributeNames();
    };

    const fetchImages = async () => {
        try {
            const res = await getData(`/api/variant/images/${productId}`);
            if (res?.success) {
                setImages(res.images || []);
                const colorImages = {};
                res.images?.forEach(img => {
                    if (img.color) {
                        if (!colorImages[img.color]) colorImages[img.color] = [];
                        colorImages[img.color].push(img);
                    }
                });
                setVariantImages(colorImages);
            }
        } catch (error) {
            console.error('Failed to fetch images');
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleAddAttribute = () => {
        const newIdx = attributes.length;
        setAttributes([...attributes, { name: '', options: [], values: {} }]);
        if (initialAttrsRef.current.length <= newIdx) {
            initialAttrsRef.current = [...initialAttrsRef.current, ''];
        }
    };

    const handleDeleteAttribute = (index) => {
        const attr = attributes[index];
        if (!attr?.name?.trim()) {
            const updated = attributes.filter((_, i) => i !== index);
            setAttributes(updated);
            if (initialAttrsRef.current.length > index) {
                initialAttrsRef.current.splice(index, 1);
            }
            showMessage('success', 'Attribute removed');
            return;
        }
        if (attr.options.length > 0) {
            showMessage('error', 'Remove all options before deleting this attribute');
            return;
        }
        const name = attr.name;
        if (!confirm(`Delete attribute "${name}"? This cannot be undone.`)) return;
        const updated = attributes.filter((_, i) => i !== index);
        setAttributes(updated);
        if (initialAttrsRef.current.length > index) {
            initialAttrsRef.current.splice(index, 1);
        }
        saveAttributeNames();
        showMessage('success', `Attribute "${name}" deleted`);
    };

    const handleAttributeNameChange = (index, name) => {
        const updated = [...attributes];
        updated[index].name = name;
        setAttributes(updated);
    };

    const handleAddOption = (attrIndex) => {
        const value = newOptionInputs[attrIndex];
        if (value && value.trim()) {
            const updated = [...attributes];
            if (!updated[attrIndex].options.includes(value.trim())) {
                updated[attrIndex].options.push(value.trim());
                setAttributes(updated);
                saveAttributeNames();
            }
            setNewOptionInputs({ ...newOptionInputs, [attrIndex]: '' });
        }
    };

    const handleRemoveOption = async (attrIndex, option) => {
        const attrName = attributes[attrIndex]?.name || '';
        const matchingVariants = variants.filter(v =>
            v.options && v.options[attrName] === option
        );

        if (matchingVariants.length > 0) {
            if (!confirm(
                `Remove "${option}" from ${attrName}?\n\n` +
                `${matchingVariants.length} variant(s) using this option will also be deleted.\n` +
                `This cannot be undone.`
            )) {
                return;
            }
            try {
                const ids = matchingVariants.map(v => v._id);
                const res = await postData('/api/variant/deleteBulk', { ids });
                if (!res?.success) {
                    showMessage('error', res?.message || 'Failed to delete associated variants');
                    return;
                }
            } catch (error) {
                showMessage('error', 'Failed to delete associated variants');
                return;
            }
        }

        const updated = [...attributes];
        updated[attrIndex].options = updated[attrIndex].options.filter(o => o !== option);
        setAttributes(updated);
        saveAttributeNames();

        if (matchingVariants.length > 0) {
            fetchVariants();
        }
    };

    const handleStartEditOption = (attrIndex, optIndex, value) => {
        setEditingOption({ attrIndex, optIndex, value });
    };

    const handleSaveOptionEdit = () => {
        const { attrIndex, optIndex, value } = editingOption;
        if (value && value.trim()) {
            const updated = [...attributes];
            updated[attrIndex].options[optIndex] = value.trim();
            setAttributes(updated);
            saveAttributeNames();
        }
        setEditingOption({ attrIndex: null, optIndex: null, value: '' });
    };

    const handleCancelOptionEdit = () => {
        setEditingOption({ attrIndex: null, optIndex: null, value: '' });
    };

    const generateCombinations = () => {
        if (attributes.length === 0) return [];
        
        const activeAttrs = attributes.filter(a => a.options.length > 0);
        if (activeAttrs.length === 0) return [];

        const optionArrays = activeAttrs.map(a => a.options);

        const cartesian = (arrays) => {
            if (arrays.length === 0) return [[]];
            const [first, ...rest] = arrays;
            const withoutFirst = cartesian(rest);
            return first.flatMap(value => withoutFirst.map(combo => [value, ...combo]));
        };

        const rawCombos = cartesian(optionArrays);

        return rawCombos.map(values => {
            const options = {};
            let name = '';
            activeAttrs.forEach((attr, i) => {
                options[attr.name] = values[i];
                name += (name ? ' / ' : '') + values[i];
            });
            return { options, name };
        });
    };

    const handleCreateVariants = async () => {
        const combinations = generateCombinations();
        if (combinations.length === 0) {
            showMessage('error', 'Please add options for at least one attribute');
            return;
        }

        if (!newVariant.price || Number(newVariant.price) <= 0) {
            showMessage('error', 'Please enter a valid sale price');
            return;
        }

        if (newVariant.oldPrice && newVariant.price && Number(newVariant.price) > Number(newVariant.oldPrice)) {
            showMessage('error', 'Sale price cannot be higher than regular price');
            return;
        }

        const makeKey = (obj) => Object.keys(obj).sort().map(k => `${k}:${obj[k]}`).join('|');
        const existingKeys = new Set(variants.map(v => makeKey(v.options || {})));
        const newCombinations = combinations.filter(combo => !existingKeys.has(makeKey(combo.options)));

        if (newCombinations.length === 0) {
            showMessage('error', 'All combinations already exist as variants');
            return;
        }

        const skipped = combinations.length - newCombinations.length;

        setIsCreating(true);
        const basePrice = Number(newVariant.price);
        const baseSku = newVariant.sku?.trim() || '';
        const timestamp = Date.now();
        const variantsToCreate = newCombinations.map((combo, idx) => ({
            product: productId,
            sku: baseSku ? `${baseSku}-${idx + 1}` : `VAR-${timestamp}-${idx + 1}`,
            options: combo.options,
            name: combo.name,
            price: basePrice,
            oldPrice: Number(newVariant.oldPrice) || 0,
            stock: Number(newVariant.stock) || 0,
            weight: newVariant.weight?.trim() || '',
            dimensions: newVariant.dimensions?.trim() || ''
        }));

        try {
            const res = await postData('/api/variant/createBulk', { product: productId, variants: variantsToCreate });
            if (res?.success) {
                showMessage('success', `${res.variants?.length || 0} variants created${skipped > 0 ? ` (${skipped} skipped — already exist)` : ''}`);
                setIsAddingVariant(false);
                resetNewVariant();
                saveAttributeNames();
                fetchVariants();
            } else {
                showMessage('error', res?.message || 'Failed to create variants');
            }
        } catch (error) {
            showMessage('error', error?.message || 'Failed to create variants');
        } finally {
            setIsCreating(false);
        }
    };

    const resetNewVariant = () => {
        setNewVariant({
            sku: '',
            options: {},
            price: '',
            oldPrice: '',
            stock: '',
            weight: '',
            dimensions: ''
        });
    };

    const handleUpdateVariant = async (variant) => {
        try {
            const res = await putData(`/api/variant/${variant._id}`, {
                sku: variant.sku,
                options: variant.options,
                price: variant.price,
                oldPrice: variant.oldPrice,
                stock: variant.stock,
                weight: variant.weight,
                dimensions: variant.dimensions,
                isActive: variant.isActive
            });
            if (res?.success) {
                showMessage('success', 'Variant updated');
                setEditingVariant(null);
                fetchVariants();
            } else {
                showMessage('error', res?.message || 'Failed to update variant');
            }
        } catch (error) {
            showMessage('error', 'Failed to update variant');
        }
    };

    const handleDeleteVariant = async (variantId) => {
        if (!confirm('Are you sure you want to delete this variant?')) return;
        try {
            const res = await deleteData(`/api/variant/${variantId}`);
            if (res?.success) {
                showMessage('success', 'Variant deleted');
                fetchVariants();
            } else {
                showMessage('error', res?.message || 'Failed to delete variant');
            }
        } catch (error) {
            showMessage('error', 'Failed to delete variant');
        }
    };

    const handleImageColorAssign = async (imageId, color) => {
        try {
            const res = await putData(`/api/variant/images/${imageId}`, { color });
            if (res?.success) {
                showMessage('success', 'Color assigned to image');
                fetchImages();
            }
        } catch (error) {
            showMessage('error', 'Failed to assign color');
        }
    };

    const handleSetPrimaryImage = async (imageId) => {
        try {
            const res = await postData(`/api/variant/images/set-primary/${productId}`, { imageId });
            if (res?.success) {
                showMessage('success', 'Primary image updated');
                fetchImages();
            }
        } catch (error) {
            showMessage('error', 'Failed to set primary image');
        }
    };

    const handleDeleteImage = async (imageId) => {
        if (!confirm('Delete this image?')) return;
        try {
            const res = await deleteData(`/api/variant/images/${imageId}`);
            if (res?.success) {
                showMessage('success', 'Image deleted');
                fetchImages();
            }
        } catch (error) {
            showMessage('error', 'Failed to delete image');
        }
    };

    const unassignedImages = images.filter(img => !img.color);

    const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    const activeVariants = variants.filter(v => v.isActive).length;

    const getVariantImage = (variant) => {
        if (manualImageOverrides[variant._id]) {
            return images.find(img => img._id === manualImageOverrides[variant._id]) || null;
        }
        const colorVal = variant.options?.Color || variant.options?.color || '';
        if (colorVal && images.length > 0) {
            const colorImages = images.filter(img => img.color?.toLowerCase() === colorVal.toLowerCase());
            if (colorImages.length > 0) return colorImages[0];
        }
        return null;
    };

    const getColorImages = (variant) => {
        const colorVal = variant.options?.Color || variant.options?.color || '';
        if (!colorVal) return [];
        return images.filter(img => img.color?.toLowerCase() === colorVal.toLowerCase());
    };

    const handleManualImageOverride = (variantId, imageId) => {
        setManualImageOverrides(prev => ({
            ...prev,
            [variantId]: imageId || null
        }));
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold">Variant Manager</h2>
                        <p className="text-sm text-indigo-200">{variants.length} variants | {activeVariants} active | Stock: {totalStock}</p>
                    </div>
                    <IconButton onClick={onClose} className="text-white hover:bg-white/20">
                        <IoMdClose className="text-2xl" />
                    </IconButton>
                </div>

                {message.text && (
                    <Alert severity={message.type} className="m-4" onClose={() => setMessage({ type: '', text: '' })}>
                        {message.text}
                    </Alert>
                )}

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Attributes Configuration */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-800">Product Attributes</h3>
                            <Button startIcon={<IoMdAdd />} onClick={handleAddAttribute} variant="outlined" size="small">
                                Add Attribute
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {attributes.map((attr, attrIndex) => (
                                <div key={attrIndex} className="bg-white rounded-lg p-4 border border-gray-200 relative">
                                    {attributes.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteAttribute(attrIndex)}
                                            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                                            title="Delete attribute"
                                        >
                                            <IoMdTrash size={13} />
                                        </button>
                                    )}
                                    <TextField
                                        label="Attribute Name"
                                        value={attr.name}
                                        onChange={(e) => handleAttributeNameChange(attrIndex, e.target.value)}
                                        onBlur={() => handleAttributeNameBlur(attrIndex)}
                                        size="small"
                                        fullWidth
                                        className="mb-3 !pr-6"
                                        placeholder="e.g., Color, Size"
                                    />
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {attr.options.map((opt, optIdx) => (
                                            editingOption.attrIndex === attrIndex && editingOption.optIndex === optIdx ? (
                                                <div key={optIdx} className="flex items-center gap-1">
                                                    <input
                                                        type="text"
                                                        className="w-20 h-7 border border-indigo-300 rounded px-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                        value={editingOption.value}
                                                        onChange={(e) => setEditingOption({ ...editingOption, value: e.target.value })}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleSaveOptionEdit();
                                                            if (e.key === 'Escape') handleCancelOptionEdit();
                                                        }}
                                                        autoFocus
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleSaveOptionEdit}
                                                        className="w-5 h-5 flex items-center justify-center rounded bg-green-500 text-white hover:bg-green-600"
                                                    >
                                                        <IoMdCheckmark size={12} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleCancelOptionEdit}
                                                        className="w-5 h-5 flex items-center justify-center rounded bg-gray-300 text-gray-700 hover:bg-gray-400"
                                                    >
                                                        <FaTimes size={10} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <Chip
                                                    key={optIdx}
                                                    label={opt}
                                                    size="small"
                                                    onClick={() => handleStartEditOption(attrIndex, optIdx, opt)}
                                                    onDelete={() => handleRemoveOption(attrIndex, opt)}
                                                    className="bg-indigo-100 text-indigo-700 cursor-pointer hover:bg-indigo-200"
                                                />
                                            )
                                        ))}
                                    </div>
                                    <div className="flex gap-1.5">
                                        <input
                                            type="text"
                                            className="flex-1 h-8 border border-gray-300 rounded px-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            placeholder="Add option..."
                                            value={newOptionInputs[attrIndex] || ''}
                                            onChange={(e) => setNewOptionInputs({ ...newOptionInputs, [attrIndex]: e.target.value })}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleAddOption(attrIndex);
                                            }}
                                        />
                                        <Button
                                            size="small"
                                            variant="contained"
                                            className="!min-w-0 !h-8 !bg-indigo-600 !text-white"
                                            onClick={() => handleAddOption(attrIndex)}
                                            disabled={!newOptionInputs[attrIndex]?.trim()}
                                        >
                                            <IoMdAdd size={16} />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Add Variants Button */}
                    {!isAddingVariant && attributes.some(a => a.options.length > 0) && (
                        <Button
                            variant="contained"
                            startIcon={<IoMdAdd />}
                            onClick={() => setIsAddingVariant(true)}
                            className="!bg-gradient-to-r !from-green-500 !to-emerald-600"
                        >
                            Generate Variants from Attributes
                        </Button>
                    )}

                    {/* Add Variant Form */}
                    {isAddingVariant && (
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
                            <h3 className="font-semibold text-indigo-800 mb-4">Create Variants</h3>
                            <p className="text-sm text-indigo-600 mb-4">
                                This will create {generateCombinations().length} variants based on your attributes.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-600 mb-1 block">Base SKU</label>
                                    <input type="text" className="w-full h-9 border border-gray-300 rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        value={newVariant.sku}
                                        onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
                                        placeholder="SKU prefix"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600 mb-1 block">Sale Price</label>
                                    <input type="number" className="w-full h-9 border border-gray-300 rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        value={newVariant.price}
                                        onChange={(e) => setNewVariant({ ...newVariant, price: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600 mb-1 block">Regular Price (Optional)</label>
                                    <input type="number" className="w-full h-9 border border-gray-300 rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        value={newVariant.oldPrice}
                                        onChange={(e) => setNewVariant({ ...newVariant, oldPrice: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600 mb-1 block">Stock</label>
                                    <input type="number" className="w-full h-9 border border-gray-300 rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        value={newVariant.stock}
                                        onChange={(e) => setNewVariant({ ...newVariant, stock: e.target.value })}
                                    />
                                </div>
                            </div>
                            {Number(newVariant.oldPrice) > 0 && Number(newVariant.price) > 0 && Number(newVariant.oldPrice) > Number(newVariant.price) && (
                                <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                                    <span className="text-green-700 font-semibold text-sm">
                                        🎉 {Math.round(((Number(newVariant.oldPrice) - Number(newVariant.price)) / Number(newVariant.oldPrice)) * 100)}% OFF
                                    </span>
                                </div>
                            )}
                            <div className="flex gap-2">
                                <Button
                                    variant="contained"
                                    startIcon={isCreating ? <CircularProgress size={16} className="!text-white" /> : <FaSave />}
                                    onClick={handleCreateVariants}
                                    disabled={isCreating}
                                    className="!bg-green-600"
                                >
                                    {isCreating ? 'Creating...' : 'Create All Variants'}
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<FaTimes />}
                                    onClick={() => { setIsAddingVariant(false); resetNewVariant(); }}
                                    disabled={isCreating}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Variants Table */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="font-semibold text-gray-800">All Variants ({variants.length})</h3>
                        </div>
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">Loading variants...</div>
                        ) : variants.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No variants yet. Configure attributes above and generate variants.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                            <table className="w-full text-xs md:text-sm">
                                <thead className="bg-gray-100">
                                    <tr className="border-b border-gray-200">
                                        <th className="font-semibold text-gray-700 px-2 md:px-3 py-2.5 text-left whitespace-nowrap">SKU</th>
                                        <th className="font-semibold text-gray-700 px-2 md:px-3 py-2.5 text-left whitespace-nowrap">Options</th>
                                        <th className="font-semibold text-gray-700 px-2 md:px-3 py-2.5 text-left whitespace-nowrap">Image</th>
                                        <th className="font-semibold text-gray-700 px-2 md:px-3 py-2.5 text-left whitespace-nowrap">Sale Price</th>
                                        <th className="font-semibold text-gray-700 px-2 md:px-3 py-2.5 text-left whitespace-nowrap">Regular Price</th>
                                        <th className="font-semibold text-gray-700 px-2 md:px-3 py-2.5 text-left whitespace-nowrap">Disc.</th>
                                        <th className="font-semibold text-gray-700 px-2 md:px-3 py-2.5 text-left whitespace-nowrap">Stock</th>
                                        <th className="font-semibold text-gray-700 px-2 md:px-3 py-2.5 text-left whitespace-nowrap">Status</th>
                                        <th className="font-semibold text-gray-700 px-2 md:px-3 py-2.5 text-left whitespace-nowrap">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {variants.map((variant) => (
                                        <tr key={variant._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            {editingVariant === variant._id ? (
                                                <>
                                                    <td className="px-2 md:px-3 py-2">
                                                        <input type="text" className="w-full min-w-[70px] h-8 border border-gray-300 rounded px-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                            value={variant.sku}
                                                            onChange={(e) => setVariants(variants.map(v => v._id === variant._id ? { ...v, sku: e.target.value } : v))}
                                                        />
                                                    </td>
                                                    <td className="px-2 md:px-3 py-2">
                                                        <div className="flex flex-wrap gap-1">
                                                            {Object.entries(variant.options || {}).map(([key, val]) => (
                                                                <span key={key} className="inline-block bg-indigo-100 text-indigo-700 text-[10px] font-medium px-1.5 py-0.5 rounded">{key}: {val}</span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-2 md:px-3 py-2">
                                                        <ImagePreviewCell
                                                            variant={variant}
                                                            images={images}
                                                            getVariantImage={getVariantImage}
                                                            getColorImages={getColorImages}
                                                            onManualOverride={handleManualImageOverride}
                                                            manualImageOverrides={manualImageOverrides}
                                                        />
                                                    </td>
                                                    <td className="px-2 md:px-3 py-2">
                                                        <input type="number" className="w-full min-w-[60px] h-8 border border-gray-300 rounded px-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                            value={variant.price}
                                                            onChange={(e) => setVariants(variants.map(v => v._id === variant._id ? { ...v, price: e.target.value } : v))}
                                                        />
                                                    </td>
                                                    <td className="px-2 md:px-3 py-2">
                                                        <input type="number" className="w-full min-w-[60px] h-8 border border-gray-300 rounded px-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                            value={variant.oldPrice}
                                                            onChange={(e) => setVariants(variants.map(v => v._id === variant._id ? { ...v, oldPrice: e.target.value } : v))}
                                                        />
                                                    </td>
                                                    <td className="px-2 md:px-3 py-2">
                                                        {variant.oldPrice > 0 && variant.price > 0 && Number(variant.oldPrice) > Number(variant.price) ? (
                                                            <span className="text-green-600 font-semibold">-{Math.round(((Number(variant.oldPrice) - Number(variant.price)) / Number(variant.oldPrice)) * 100)}%</span>
                                                        ) : (
                                                            <span className="text-gray-400">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-2 md:px-3 py-2">
                                                        <input type="number" className="w-full min-w-[50px] h-8 border border-gray-300 rounded px-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                            value={variant.stock}
                                                            onChange={(e) => setVariants(variants.map(v => v._id === variant._id ? { ...v, stock: e.target.value } : v))}
                                                        />
                                                    </td>
                                                    <td className="px-2 md:px-3 py-2">
                                                        <button onClick={() => setVariants(variants.map(v => v._id === variant._id ? { ...v, isActive: !v.isActive } : v))}
                                                            className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${variant.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                                            {variant.isActive ? 'Active' : 'Inactive'}
                                                        </button>
                                                    </td>
                                                    <td className="px-2 md:px-3 py-2">
                                                        <div className="flex gap-1">
                                                            <button onClick={() => handleUpdateVariant(variant)} className="w-7 h-7 flex items-center justify-center rounded bg-green-500 hover:bg-green-600 text-white" title="Save">
                                                                <FaSave size={11} />
                                                            </button>
                                                            <button onClick={() => setEditingVariant(null)} className="w-7 h-7 flex items-center justify-center rounded bg-gray-300 hover:bg-gray-400 text-gray-700" title="Cancel">
                                                                <FaTimes size={11} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="px-2 md:px-3 py-2 font-mono text-xs md:text-sm whitespace-nowrap">{variant.sku}</td>
                                                    <td className="px-2 md:px-3 py-2">
                                                        <div className="flex flex-wrap gap-1">
                                                            {Object.entries(variant.options || {}).map(([key, val]) => (
                                                                <span key={key} className="inline-block bg-indigo-100 text-indigo-700 text-[10px] font-medium px-1.5 py-0.5 rounded">{key}: {val}</span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-2 md:px-3 py-2">
                                                        <ImagePreviewCell
                                                            variant={variant}
                                                            images={images}
                                                            getVariantImage={getVariantImage}
                                                            getColorImages={getColorImages}
                                                            onManualOverride={handleManualImageOverride}
                                                            manualImageOverrides={manualImageOverrides}
                                                        />
                                                    </td>
                                                    <td className="px-2 md:px-3 py-2 whitespace-nowrap">
                                                        <span className="font-semibold text-gray-900">${Number(variant.price || 0).toFixed(2)}</span>
                                                    </td>
                                                    <td className="px-2 md:px-3 py-2 whitespace-nowrap">
                                                        {variant.oldPrice > 0 ? (
                                                            variant.oldPrice > variant.price ? (
                                                                <span className="text-gray-400 line-through">${Number(variant.oldPrice || 0).toFixed(2)}</span>
                                                            ) : (
                                                                <span className="font-semibold text-gray-900">${Number(variant.oldPrice || 0).toFixed(2)}</span>
                                                            )
                                                        ) : (
                                                            <span className="text-gray-400">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-2 md:px-3 py-2 whitespace-nowrap">
                                                        {variant.oldPrice > 0 && variant.price > 0 && Number(variant.oldPrice) > Number(variant.price) ? (
                                                            <span className="text-green-600 font-semibold">-{Math.round(((Number(variant.oldPrice) - Number(variant.price)) / Number(variant.oldPrice)) * 100)}%</span>
                                                        ) : (
                                                            <span className="text-gray-400">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-2 md:px-3 py-2 whitespace-nowrap">
                                                        <span className={`font-semibold ${variant.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>{variant.stock}</span>
                                                    </td>
                                                    <td className="px-2 md:px-3 py-2">
                                                        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${variant.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                            {variant.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="px-2 md:px-3 py-2">
                                                        <div className="flex gap-1">
                                                            <button onClick={() => setEditingVariant(variant._id)} className="w-7 h-7 flex items-center justify-center rounded bg-blue-500 hover:bg-blue-600 text-white" title="Edit">
                                                                <FaEdit size={11} />
                                                            </button>
                                                            <button onClick={() => handleDeleteVariant(variant._id)} className="w-7 h-7 flex items-center justify-center rounded bg-red-500 hover:bg-red-600 text-white" title="Delete">
                                                                <IoMdTrash size={11} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        )}
                    </div>

                    {/* Color-Image Association */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="font-semibold text-gray-800">Product Images by Color</h3>
                        </div>
                        <div className="p-4">
                            {images.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No images uploaded yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {Object.entries(variantImages).map(([color, imgs]) => (
                                        <div key={color} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0" style={{ backgroundColor: color.toLowerCase() }} />
                                                <span className="text-sm font-semibold text-gray-700 capitalize">{color}</span>
                                                <Chip label={`${imgs.length}`} size="small" className="!text-[11px] !bg-indigo-100 !text-indigo-700 !h-5" />
                                            </div>
                                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                                                {imgs.map(img => (
                                                    <VariantImageCard
                                                        key={img._id}
                                                        img={img}
                                                        colorOptions={attributes.find(a => a.name.toLowerCase() === 'color')?.options || []}
                                                        onColorAssign={handleImageColorAssign}
                                                        onDelete={handleDeleteImage}
                                                        onSetPrimary={handleSetPrimaryImage}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    {unassignedImages.length > 0 && (
                                        <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs font-semibold text-amber-700">Unassigned</span>
                                                <Chip label={`${unassignedImages.length}`} size="small" className="!text-[11px] !bg-amber-100 !text-amber-700 !h-5" />
                                                <span className="text-xs text-amber-500">Select a color below to tag each image</span>
                                            </div>
                                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                                                {unassignedImages.map(img => (
                                                    <VariantImageCard
                                                        key={img._id}
                                                        img={img}
                                                        colorOptions={attributes.find(a => a.name.toLowerCase() === 'color')?.options || []}
                                                        onColorAssign={handleImageColorAssign}
                                                        onDelete={handleDeleteImage}
                                                        onSetPrimary={handleSetPrimaryImage}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center gap-3 sm:justify-between">
                    <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                        <span className="font-medium">Tip:</span> Adding variants is optional. You can add them later from the product list.
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button onClick={onClose} variant="outlined" className="!border-gray-300 !text-gray-600 !text-xs !w-full sm:!w-auto">
                            Skip Variants
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ImagePreviewCell = ({ variant, images, getVariantImage, getColorImages, onManualOverride, manualImageOverrides }) => {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const btnRef = useRef(null);
    const matchedImage = getVariantImage(variant);
    const colorVal = variant.options?.Color || variant.options?.color || '';
    const colorImages = getColorImages(variant);
    const hasOverride = manualImageOverrides[variant._id] !== undefined;
    const otherImages = images.filter(img => !colorImages.find(ci => ci._id === img._id));

    const handleToggle = (e) => {
        e.stopPropagation();
        if (!open && btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            setPosition({
                top: Math.min(rect.bottom + 4, window.innerHeight - 320),
                left: Math.min(rect.left, window.innerWidth - 290)
            });
        }
        setOpen(prev => !prev);
    };

    const handleSelect = (imageId) => {
        onManualOverride(variant._id, imageId);
        setOpen(false);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onManualOverride(variant._id, null);
        setOpen(false);
    };

    return (
        <div className="inline-flex items-center gap-1.5 min-w-[60px]" ref={btnRef}>
            <div className="relative w-9 h-9 md:w-10 md:h-10 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
                {matchedImage ? (
                    <img src={matchedImage.url} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
                {hasOverride && (
                    <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-400 rounded-full border border-white" title="Manually assigned" />
                )}
            </div>
            <button
                onClick={handleToggle}
                className="text-[10px] md:text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold underline whitespace-nowrap leading-tight"
            >
                {matchedImage ? 'Change' : 'Assign'}
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-[100]" onClick={() => setOpen(false)} />
                    <div className="fixed z-[101] bg-white rounded-xl shadow-xl border border-gray-200 min-w-[200px] max-w-[280px] max-h-[300px] overflow-y-auto"
                        style={{ top: position.top, left: position.left }}
                    >
                        {images.length === 0 ? (
                            <div className="p-4 text-center">
                                <p className="text-xs text-gray-400 mb-1">No images available</p>
                                <p className="text-[10px] text-gray-300">Upload images in "Product Images by Color" section above</p>
                            </div>
                        ) : (
                            <>
                                {colorImages.length > 0 && (
                                    <div>
                                        <div className="sticky top-0 bg-indigo-50 text-indigo-700 text-[10px] font-semibold px-3 py-1.5 border-b border-indigo-100">
                                            Color: {colorVal}
                                        </div>
                                        {colorImages.map(img => (
                                            <button
                                                key={img._id}
                                                onClick={() => handleSelect(img._id)}
                                                className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-b-0 ${matchedImage?._id === img._id && !hasOverride ? 'bg-indigo-50/50' : ''}`}
                                            >
                                                <img src={img.url} alt="" className="w-7 h-7 rounded object-cover border border-gray-200 flex-shrink-0" />
                                                <span className="truncate text-gray-700">{img.color}{img.isPrimary ? ' (Primary)' : ''}</span>
                                                {matchedImage?._id === img._id && !hasOverride && (
                                                    <svg className="w-3.5 h-3.5 text-indigo-600 ml-auto flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {otherImages.length > 0 && (
                                    <div>
                                        <div className="sticky top-0 bg-gray-50 text-gray-500 text-[10px] font-semibold px-3 py-1.5 border-b border-gray-200">
                                            All images
                                        </div>
                                        {otherImages.map(img => (
                                            <button
                                                key={img._id}
                                                onClick={() => handleSelect(img._id)}
                                                className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-b-0 ${matchedImage?._id === img._id ? 'bg-indigo-50/50' : ''}`}
                                            >
                                                <img src={img.url} alt="" className="w-7 h-7 rounded object-cover border border-gray-200 flex-shrink-0" />
                                                <span className="truncate text-gray-700">{img.color || 'No color'}</span>
                                                {matchedImage?._id === img._id && (
                                                    <svg className="w-3.5 h-3.5 text-indigo-600 ml-auto flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {hasOverride && (
                                    <button
                                        onClick={handleClear}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Clear manual override
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

const VariantImageCard = ({ img, colorOptions, onColorAssign, onDelete, onSetPrimary }) => {
    const [localColor, setLocalColor] = useState(img.color || '');

    const handleColorChange = (e) => {
        const val = e.target.value;
        setLocalColor(val);
        onColorAssign(img._id, val);
    };

    return (
        <div className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-white">
            <img src={img.url} alt="" className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                <select
                    value={localColor}
                    onChange={handleColorChange}
                    className="w-full text-[10px] p-0.5 rounded border border-white/30 bg-black/70 text-white cursor-pointer"
                >
                    <option value="">— No Color —</option>
                    {colorOptions.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
                <div className="flex gap-1 mt-0.5">
                    {!img.isPrimary && (
                        <button
                            onClick={() => onSetPrimary(img._id)}
                            className="w-5 h-5 flex items-center justify-center rounded bg-amber-500 hover:bg-amber-600 text-white"
                            title="Set as primary"
                        >
                            <FaStar size={8} />
                        </button>
                    )}
                    <button
                        onClick={() => onDelete(img._id)}
                        className="w-5 h-5 flex items-center justify-center rounded bg-red-500 hover:bg-red-600 text-white"
                        title="Delete this image"
                    >
                        <IoMdTrash size={8} />
                    </button>
                </div>
            </div>
            {img.isPrimary && (
                <div className="absolute top-1 left-1 z-10 bg-amber-500 text-white text-[8px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-md">
                    <FaStar size={7} /> Primary
                </div>
            )}
            {localColor && (
                <div className="absolute bottom-0 left-0 right-0 bg-indigo-600/80 text-white text-[9px] text-center py-0.5 truncate px-1">
                    {localColor}
                </div>
            )}
        </div>
    );
};

export default VariantManager;