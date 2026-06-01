import React, { useState, useRef } from 'react';
import { Button, Chip, CircularProgress } from '@mui/material';
import { IoMdTrash, IoMdCloudUpload, IoMdAdd } from 'react-icons/io';
import { FaStar } from 'react-icons/fa';
import { uploadImages, postData, putData, deleteData } from '../../utils/api';

const MAX_DIM = 1920;
const QUALITY = 0.82;

function compressImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const { width, height } = img;
            let newWidth = width, newHeight = height;
            if (width > MAX_DIM || height > MAX_DIM) {
                const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
                newWidth = Math.round(width * ratio);
                newHeight = Math.round(height * ratio);
            }
            const canvas = document.createElement('canvas');
            canvas.width = newWidth;
            canvas.height = newHeight;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, newWidth, newHeight);
            canvas.toBlob((blob) => {
                if (!blob) return reject(new Error('Canvas toBlob failed'));
                const compressed = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
                    type: 'image/jpeg',
                    lastModified: Date.now()
                });
                resolve(compressed);
            }, 'image/jpeg', QUALITY);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

const ProductImagesByColor = ({ productId, images, productImageUrls = [], onRefresh, colorOptions, onSetPrimary, onAddToProductImages }) => {
    const [uploading, setUploading] = useState(false);
    const [importing, setImporting] = useState(null);
    const fileInputRef = useRef(null);

    const existingUrls = new Set(images.map(img => img.url));

    const unimportedUrls = productImageUrls.filter(url => !existingUrls.has(url));

    const handleUpload = async (e) => {
        const rawFiles = e.target.files;
        if (!rawFiles?.length) return;
        setUploading(true);
        try {
            const formdata = new FormData();
            for (let i = 0; i < rawFiles.length; i++) {
                const file = rawFiles[i];
                const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"];
                if (!validTypes.includes(file.type)) continue;
                const compressed = file.type === 'image/svg+xml' ? file : await compressImage(file);
                formdata.append('images', compressed);
            }
            const res = await uploadImages('/api/product/uploadImages', formdata);
            const urls = res?.data?.images || res?.images || [];
            for (const url of urls) {
                await postData('/api/variant/images/add', { product: productId, url });
                if (onAddToProductImages) onAddToProductImages([url]);
            }
            if (onRefresh) onRefresh();
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleImportProductImage = async (url) => {
        setImporting(url);
        try {
            await postData('/api/variant/images/add', { product: productId, url });
            if (onRefresh) onRefresh();
        } catch (err) {
            console.error('Import failed:', err);
        } finally {
            setImporting(null);
        }
    };

    const handleColorAssign = async (imageId, color) => {
        try {
            await putData(`/api/variant/images/${imageId}`, { color });
            if (onRefresh) onRefresh();
        } catch (err) {
            console.error('Color assign failed:', err);
        }
    };

    const handleDelete = async (imageId) => {
        if (!confirm('Delete this image?')) return;
        try {
            await deleteData(`/api/variant/images/${imageId}`);
            if (onRefresh) onRefresh();
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const handleSetPrimary = async (imageId, color) => {
        if (onSetPrimary) onSetPrimary(imageId, color);
    };

    const colorImagesMap = {};
    const unassigned = [];
    images.forEach(img => {
        if (img.color) {
            if (!colorImagesMap[img.color]) colorImagesMap[img.color] = [];
            colorImagesMap[img.color].push(img);
        } else {
            unassigned.push(img);
        }
    });

    const allColors = [...new Set([...Object.keys(colorImagesMap), ...colorOptions])];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center shadow-sm">
                        <span className="text-lg">🎨</span>
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-gray-800">Product Images by Color</h2>
                        <p className="text-xs text-gray-500">{images.length} image(s) linked to variant system</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleUpload}
                    />
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={uploading ? <CircularProgress size={14} className="!text-white" /> : <IoMdCloudUpload />}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="!bg-indigo-600 !text-white !text-xs !rounded-xl"
                    >
                        {uploading ? 'Uploading...' : 'Upload Images'}
                    </Button>
                </div>
            </div>

            {/* Import existing product images */}
            {unimportedUrls.length > 0 && (
                <div className="mb-4 bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-blue-700">📸 Sync from Product Images</span>
                        <Chip label={`${unimportedUrls.length} available`} size="small" className="!text-xs !bg-blue-100 !text-blue-700" />
                        <span className="text-xs text-blue-500">Import product photos to assign them to colors</span>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                        {unimportedUrls.map((url, idx) => (
                            <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-blue-200 bg-white">
                                <img src={url} alt="" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        onClick={() => handleImportProductImage(url)}
                                        disabled={importing === url}
                                        className="flex items-center gap-1 px-2 py-1 bg-white text-blue-700 rounded-lg text-[10px] font-semibold hover:bg-blue-50 transition-colors"
                                    >
                                        {importing === url ? (
                                            <CircularProgress size={10} />
                                        ) : (
                                            <><IoMdAdd size={12} /> Import</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {images.length === 0 ? (
                <div className="text-center py-10">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gray-50 flex items-center justify-center">
                        <IoMdCloudUpload className="text-3xl text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-400 font-medium">No variant images yet.</p>
                    <p className="text-xs text-gray-300 mt-1">
                        Upload new images or import from the "Product Images" section above.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {allColors.map(color => {
                        const imgs = colorImagesMap[color] || [];
                        return (
                            <div key={color} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0" style={{ backgroundColor: color.toLowerCase() }} />
                                    <span className="text-sm font-semibold text-gray-700 capitalize">{color}</span>
                                    <Chip label={`${imgs.length}`} size="small" className="!text-[11px] !bg-indigo-100 !text-indigo-700 !h-5" />
                                </div>
                                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                                    {imgs.map(img => (
                                        <ImageCard
                                            key={img._id}
                                            img={img}
                                            colorOptions={colorOptions}
                                            onColorAssign={handleColorAssign}
                                            onDelete={handleDelete}
                                            onSetPrimary={handleSetPrimary}
                                        />
                                    ))}
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="aspect-square rounded-lg border-2 border-dashed border-gray-300 bg-white hover:bg-gray-100 hover:border-indigo-400 transition-all flex items-center justify-center"
                                        title={`Add image for ${color}`}
                                    >
                                        <span className="text-2xl text-gray-400 leading-none">+</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {unassigned.length > 0 && (
                        <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-semibold text-amber-700">Unassigned</span>
                                <Chip label={`${unassigned.length}`} size="small" className="!text-[11px] !bg-amber-100 !text-amber-700 !h-5" />
                                <span className="text-xs text-amber-500">Select a color below to tag each image</span>
                            </div>
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                                {unassigned.map(img => (
                                    <ImageCard
                                        key={img._id}
                                        img={img}
                                        colorOptions={colorOptions}
                                        onColorAssign={handleColorAssign}
                                        onDelete={handleDelete}
                                        onSetPrimary={handleSetPrimary}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const ImageCard = ({ img, colorOptions, onColorAssign, onDelete, onSetPrimary }) => {
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
                            onClick={() => onSetPrimary(img._id, localColor)}
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

export default ProductImagesByColor;
