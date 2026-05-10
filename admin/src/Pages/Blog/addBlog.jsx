import React, { useContext, useState, useRef } from 'react'
import { Button, CircularProgress, TextField, Select, MenuItem, FormControl, InputLabel, Checkbox, FormControlLabel, Box, Typography, IconButton } from '@mui/material';
import { FaCloudUploadAlt, FaTrash, FaImage, FaTimes } from "react-icons/fa";
import { deleteImages, postData, uploadImages } from '../../utils/api';
import { MyContext } from '../../App';
import { useNavigate } from 'react-router-dom';
import Editor from 'react-simple-wysiwyg';

const AddBlog = () => {
    const [formFields, setFormFields] = useState({
        title: "",
        images: [],
        description: "",
        category: "General",
        excerpt: "",
        author: "Admin",
        authorBio: "",
        featured: false,
        tags: [],
        readTime: "5 min read"
    });

    const [previews, setPreviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [html, setHtml] = useState('');
    const [errors, setErrors] = useState({});
    const fileInputRef = useRef(null);

    const navigate = useNavigate();
    const context = useContext(MyContext);

    const validate = () => {
        const newErrors = {};
        if (!formFields.title.trim()) {
            newErrors.title = "Title is required";
        }
        if (!html.trim()) {
            newErrors.description = "Description is required";
        }
        if (previews.length === 0) {
            newErrors.images = "At least one image is required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormFields(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleDescriptionChange = (e) => {
        setHtml(e.target.value);
        setFormFields(prev => ({ ...prev, description: e.target.value }));
        if (errors.description) {
            setErrors(prev => ({ ...prev, description: null }));
        }
    };

    const handleImageSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setIsUploading(true);
        
        const formdata = new FormData();
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                formdata.append('images', file);
            }
        });

        try {
            const res = await uploadImages("/api/blog/uploadImages", formdata);
            
            if (res?.data?.images && res.data.images.length > 0) {
                const newPreviews = [...previews, ...res.data.images];
                setPreviews(newPreviews);
                setFormFields(prev => ({ ...prev, images: newPreviews }));
                setErrors(prev => ({ ...prev, images: null }));
            }
        } catch (error) {
            console.error("Upload error:", error);
            context.alertBox("error", "Failed to upload images");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const removeImage = (imageUrl, index) => {
        const newPreviews = previews.filter((_, i) => i !== index);
        setPreviews(newPreviews);
        setFormFields(prev => ({ ...prev, images: newPreviews }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        setIsLoading(true);

        try {
            const res = await postData("/api/blog/add", formFields);
            
            if (res?.success) {
                context.alertBox("success", "Blog published successfully!");
                navigate("/blog/List");
            } else {
                context.alertBox("error", res?.message || "Failed to publish blog");
            }
        } catch (error) {
            console.error("Submit error:", error);
            context.alertBox("error", "Failed to publish blog");
        } finally {
            setIsLoading(false);
        }
    };

    const categories = [
        "General",
        "Fashion",
        "Electronics",
        "Home & Living",
        "Sports",
        "Beauty",
        "Tutorials",
        "News",
        "Lifestyle",
        "Business"
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Create New Blog Post</h1>
                            <p className="text-gray-500 text-sm mt-1">Share your thoughts with the world</p>
                        </div>
                        <Button
                            variant="outlined"
                            onClick={() => navigate("/blog/list")}
                            className="!border-gray-300 !text-gray-600 hover:!border-gray-400"
                        >
                            View All Blogs
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Title */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Content</h3>
                                <TextField
                                    fullWidth
                                    label="Blog Title"
                                    name="title"
                                    value={formFields.title}
                                    onChange={handleInputChange}
                                    error={!!errors.title}
                                    helperText={errors.title}
                                    placeholder="Enter an engaging title..."
                                    className="!bg-gray-50 !rounded-xl"
                                    InputProps={{
                                        className: '!rounded-xl'
                                    }}
                                />
                            </div>

                            {/* Excerpt */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Excerpt</h3>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Short Description"
                                    name="excerpt"
                                    value={formFields.excerpt}
                                    onChange={handleInputChange}
                                    placeholder="Write a brief summary that appears in blog listings..."
                                    className="!bg-gray-50 !rounded-xl"
                                />
                            </div>

                            {/* Description */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Full Description</h3>
                                <div className={errors.description ? '!border-red-500' : ''}>
                                    <Editor 
                                        value={html} 
                                        onChange={handleDescriptionChange}
                                        placeholder="Write your blog content here..."
                                    />
                                </div>
                                {errors.description && (
                                    <Typography color="error" className="!text-xs !mt-1">
                                        {errors.description}
                                    </Typography>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Settings */}
                        <div className="space-y-6">
                            {/* Category & Author */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Settings</h3>
                                <div className="space-y-4">
                                    <FormControl fullWidth error={!!errors.category}>
                                        <InputLabel>Category</InputLabel>
                                        <Select
                                            name="category"
                                            value={formFields.category}
                                            onChange={handleInputChange}
                                            label="Category"
                                            className="!bg-gray-50 !rounded-xl"
                                        >
                                            {categories.map(cat => (
                                                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <TextField
                                        fullWidth
                                        label="Author"
                                        name="author"
                                        value={formFields.author}
                                        onChange={handleInputChange}
                                        className="!bg-gray-50 !rounded-xl"
                                    />

                                    <TextField
                                        fullWidth
                                        label="Read Time"
                                        name="readTime"
                                        value={formFields.readTime}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 5 min read"
                                        className="!bg-gray-50 !rounded-xl"
                                    />

                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="featured"
                                                checked={formFields.featured}
                                                onChange={handleInputChange}
                                                color="primary"
                                            />
                                        }
                                        label="Mark as Featured"
                                        className="!ml-0"
                                    />
                                </div>
                            </div>

                            {/* Publish Button */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    disabled={isLoading}
                                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <FaCloudUploadAlt />}
                                    className="!bg-gradient-to-r !from-indigo-600 !to-purple-600 !hover:!from-indigo-700 !hover:!to-purple-700 !py-3 !text-base !font-semibold !rounded-xl !shadow-lg"
                                >
                                    {isLoading ? 'Publishing...' : 'Publish Blog'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Image Upload Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Featured Images</h3>
                                <p className="text-gray-500 text-sm">Upload high-quality images for your blog</p>
                            </div>
                            <span className="text-sm text-gray-400">{previews.length} images uploaded</span>
                        </div>

                        {errors.images && (
                            <Typography color="error" className="!text-sm !mb-4 !bg-red-50 !p-3 !rounded-lg">
                                {errors.images}
                            </Typography>
                        )}

                        {/* Image Preview Grid */}
                        {previews.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                                {previews.map((image, index) => (
                                    <div key={index} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
                                        <img 
                                            src={image} 
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <IconButton
                                                onClick={() => removeImage(image, index)}
                                                className="!bg-red-500 !text-white hover:!bg-red-600"
                                            >
                                                <FaTrash />
                                            </IconButton>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Upload Box */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageSelect}
                            className="hidden"
                            id="blog-images-upload"
                        />
                        
                        <label
                            htmlFor="blog-images-upload"
                            className={`
                                flex flex-col items-center justify-center w-full h-48 
                                border-2 border-dashed rounded-xl cursor-pointer 
                                transition-all duration-300
                                ${isUploading 
                                    ? '!border-gray-300 !bg-gray-50' 
                                    : '!border-gray-300 !bg-gray-50 hover:!border-indigo-400 hover:!bg-indigo-50'
                                }
                            `}
                        >
                            {isUploading ? (
                                <>
                                    <CircularProgress size={32} className="!text-indigo-600" />
                                    <span className="text-gray-500 mt-2">Uploading...</span>
                                </>
                            ) : (
                                <>
                                    <FaImage className="!text-4xl !text-gray-400" />
                                    <span className="text-gray-500 mt-2 font-medium">Click to upload images</span>
                                    <span className="text-gray-400 text-sm">JPG, PNG, WebP supported</span>
                                </>
                            )}
                        </label>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddBlog;