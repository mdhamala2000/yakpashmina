import React, { useContext, useEffect, useState, useRef } from 'react'
import Rating from "@mui/material/Rating";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { MyContext } from '../../App';
import { fetchDataFromApi, postData } from '../../utils/api';
import CircularProgress from '@mui/material/CircularProgress';
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import { FaUserCircle } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import { IoImageOutline } from "react-icons/io5";
import { IoClose } from "react-icons/io5";

export const Reviews = (props) => {
    const [reviews, setReviews] = useState({
        image: '',
        userName: '',
        review: '',
        rating: 5,
        userId: '',
        productId: '',
        reviewImages: []
    });

    const [loading, setLoading] = useState(false);
    const [reviewsData, setReviewsData] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);
    const fileInputRef = useRef(null);

    const context = useContext(MyContext);

    useEffect(() => {
        setReviews((prev) => ({
            ...prev,
            image: context?.userData?.avatar || '',
            userName: context?.userData?.name || '',
            userId: context?.userData?._id || '',
            productId: props?.productId
        }));

        getReviews();
    }, [context?.userData, props?.productId]);

    const onChangeInput = (e) => {
        setReviews((prev) => ({
            ...prev,
            review: e.target.value
        }));
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + previewImages.length > 5) {
            context?.alertBox("error", "You can upload maximum 5 images");
            return;
        }

        const newPreviews = files.map(file => ({
            file,
            url: URL.createObjectURL(file)
        }));

        setPreviewImages((prev) => [...prev, ...newPreviews]);
    };

    const removePreviewImage = (index) => {
        setPreviewImages((prev) => {
            const newPrev = prev.filter((_, i) => i !== index);
            // Clean up blob URLs
            if (prev[index]?.url) {
                URL.revokeObjectURL(prev[index].url);
            }
            return newPrev;
        });
    };

    const uploadReviewImages = async () => {
        const uploadedUrls = [];
        
        for (const preview of previewImages) {
            const formData = new FormData();
            formData.append('images', preview.file);
            
            try {
                const res = await fetch('http://localhost:8000/api/blog/uploadImages', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await res.json();
                if (data?.images && data.images.length > 0) {
                    uploadedUrls.push(data.images[0]);
                } else if (data?.images?.[0]) {
                    uploadedUrls.push(data.images[0]);
                }
            } catch (error) {
                console.error("Error uploading image:", error);
            }
        }
        
        return uploadedUrls;
    };

    const addReview = async (e) => {
        e.preventDefault();

        if (reviews?.review?.trim() === "") {
            context?.alertBox("error", "Please write a review");
            return;
        }

        setLoading(true);

        try {
            let reviewImages = [];
            
            if (previewImages.length > 0) {
                reviewImages = await uploadReviewImages();
            }

            const reviewData = {
                ...reviews,
                reviewImages: reviewImages,
                userName: reviews.userName || 'Guest User',
                productName: props?.itemName || ''
            };

            postData("/api/user/addReview", reviewData).then((res) => {
                if (res?.error === false) {
                    context?.alertBox("success", res?.message || "Review submitted successfully!");
                    setReviews((prev) => ({
                        ...prev,
                        review: '',
                        rating: 5,
                        reviewImages: []
                    }));
                    setPreviewImages([]);
                    getReviews();
                } else {
                    context?.alertBox("error", res?.message || "Failed to submit review");
                }
                setLoading(false);
            });
        } catch (error) {
            context?.alertBox("error", "Something went wrong");
            setLoading(false);
        }
    };

    const getReviews = () => {
        fetchDataFromApi(`/api/user/getReviews?productId=${props?.productId}`).then((res) => {
            if (res?.error === false) {
                // Only show approved reviews
                const approvedReviews = res.reviews?.filter(r => r.isApproved === true) || [];
                setReviewsData(approvedReviews);
                props.setReviewsCount?.(approvedReviews.length);
            }
        });
    };

    const getAverageRating = () => {
        if (reviewsData.length === 0) return 0;
        const total = reviewsData.reduce((sum, r) => sum + (r.rating || 0), 0);
        return (total / reviewsData.length).toFixed(1);
    };

    const getRatingCounts = () => {
        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviewsData.forEach(r => {
            if (counts[r.rating] !== undefined) counts[r.rating]++;
        });
        return counts;
    };

    return (
        <div className="w-full productReviewsContainer">
            {/* Rating Summary */}
            {reviewsData?.length > 0 && (
                <Box className="bg-white rounded-xl p-5 mb-6 shadow-sm">
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={4} className="text-center">
                            <Typography variant="h2" className="!text-[48px] !font-[700] !text-[#2bbef9]">
                                {getAverageRating()}
                            </Typography>
                            <Rating value={parseFloat(getAverageRating())} readOnly precision={0.5} className="!justify-center" />
                            <Typography className="!text-gray-500 !text-[14px] mt-1">
                                Based on {reviewsData.length} reviews
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            {[5, 4, 3, 2, 1].map((star) => (
                                <Box key={star} className="flex items-center gap-3 mb-2">
                                    <Typography className="!text-[14px] !w-[50px]">{star} star</Typography>
                                    <Box className="flex-grow h-[8px] bg-gray-200 rounded-full overflow-hidden">
                                        <Box 
                                            className="h-full bg-[#2bbef9] rounded-full" 
                                            style={{ 
                                                width: `${((getRatingCounts()[star] || 0) / reviewsData.length) * 100}%` 
                                            }}
                                        />
                                    </Box>
                                    <Typography className="!text-[14px] !text-gray-500 !w-[30px]">
                                        {getRatingCounts()[star] || 0}
                                    </Typography>
                                </Box>
                            ))}
                        </Grid>
                    </Grid>
                </Box>
            )}

            {/* Reviews List */}
            {reviewsData?.length !== 0 ? (
                <Box className="reviewScroll max-h-[500px] overflow-y-auto pr-2">
                    {reviewsData?.map((review, index) => (
                        <Box key={index} className="bg-white rounded-xl p-5 mb-4 shadow-sm">
                            <Box className="flex items-start gap-4">
                                <Avatar 
                                    src={review?.image || '/user.jpg'} 
                                    className="!w-[50px] !h-[50px]"
                                >
                                    <FaUserCircle className="!text-[50px] !text-gray-400" />
                                </Avatar>
                                <Box className="flex-grow">
                                    <Box className="flex items-center justify-between mb-2">
                                        <Typography className="!font-[600] !text-[16px]">
                                            {review?.userName || 'Anonymous'}
                                        </Typography>
                                        <Typography className="!text-[12px] !text-gray-500">
                                            {review?.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                                        </Typography>
                                    </Box>
                                    <Rating value={review?.rating || 5} readOnly size="small" className="!mb-3" />
                                    <Typography className="!text-[14px] !text-gray-700 !leading-relaxed">
                                        {review?.review}
                                    </Typography>
                                    
                                    {/* Review Images */}
                                    {review?.reviewImages?.length > 0 && (
                                        <Box className="flex gap-2 mt-3 flex-wrap">
                                            {review.reviewImages.map((img, imgIndex) => (
                                                <Box 
                                                    key={imgIndex}
                                                    className="w-[80px] h-[80px] rounded-lg overflow-hidden border border-gray-200"
                                                >
                                                    <img 
                                                        src={img} 
                                                        alt="Review" 
                                                        className="w-full h-full object-cover cursor-pointer hover:opacity-80"
                                                        onClick={() => window.open(img, '_blank')}
                                                    />
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    ))}
                </Box>
            ) : (
                <Box className="text-center py-10 bg-white rounded-xl shadow-sm">
                    <Typography className="!text-gray-500 !text-[16px]">
                        No reviews yet. Be the first to review this product!
                    </Typography>
                </Box>
            )}

            {/* Add Review Form */}
            <Box className="reviewForm bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl mt-6 shadow-lg border border-gray-100">
                <Typography variant="h5" className="!font-[600] !mb-5 !text-[20px]">
                    Write a Review
                </Typography>

                <form className="w-full" onSubmit={addReview}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Your Name"
                                value={reviews.userName}
                                onChange={(e) => setReviews((prev) => ({ ...prev, userName: e.target.value }))}
                                placeholder="Enter your name"
                                className="!bg-white"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Box className="flex items-center gap-3">
                                <Typography className="!text-[14px] !text-gray-600">Your Rating:</Typography>
                                <Rating 
                                    value={reviews.rating} 
                                    onChange={(event, newValue) => {
                                        setReviews((prev) => ({ ...prev, rating: newValue || 5 }));
                                    }} 
                                    size="large"
                                />
                            </Box>
                        </Grid>
                    </Grid>

                    <TextField
                        id="outlined-multiline-flexible"
                        label="Share your experience with this product..."
                        className="w-full !mt-4 !bg-white"
                        onChange={onChangeInput}
                        name="review"
                        multiline
                        rows={5}
                        value={reviews.review}
                        placeholder="What did you like or dislike about this product?"
                    />

                    {/* Image Upload */}
                    <Box className="mt-4">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            multiple
                            className="hidden"
                        />
                        <Button
                            variant="outlined"
                            startIcon={<IoImageOutline />}
                            onClick={() => fileInputRef.current?.click()}
                            className="!border-gray-300 !text-gray-600"
                        >
                            Add Photos ({previewImages.length}/5)
                        </Button>
                        
                        {previewImages.length > 0 && (
                            <Box className="flex gap-2 mt-3 flex-wrap">
                                {previewImages.map((preview, index) => (
                                    <Box key={index} className="relative">
                                        <img 
                                            src={preview.url} 
                                            alt="Preview" 
                                            className="w-[80px] h-[80px] object-cover rounded-lg border"
                                        />
                                        <IconButton 
                                            size="small"
                                            className="absolute -top-2 -right-2 !bg-red-500 !text-white !w-[24px] !h-[24px]"
                                            onClick={() => removePreviewImage(index)}
                                        >
                                            <IoClose className="!text-[12px]" />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>

                    <div className="flex items-center mt-6">
                        <Button 
                            type="submit" 
                            className="!bg-[#2bbef9] !text-white !font-[600] !px-8 !py-2 !rounded-full hover:!bg-[#1a9bd1] flex gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <CircularProgress size={20} className="!text-white" />
                            ) : (
                                <>
                                    <IoSend className="!text-[18px]" /> Submit Review
                                </>
                            )}
                        </Button>
                        <Typography className="!text-[12px] !text-gray-500 !ml-3">
                            *Anyone can review - no login required
                        </Typography>
                    </div>
                </form>
            </Box>
        </div>
    );
};