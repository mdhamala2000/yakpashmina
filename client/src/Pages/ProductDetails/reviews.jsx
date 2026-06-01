import React, { useContext, useEffect, useState, useRef } from 'react'
import { MyContext } from '../../App';
import { fetchDataFromApi, postData } from '../../utils/api';
import CircularProgress from '@mui/material/CircularProgress';
import Avatar from "@mui/material/Avatar";
import { FaUserCircle, FaRegStar, FaCamera, FaTimes } from "react-icons/fa";
import { IoSend } from "react-icons/io5";

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
    const [showForm, setShowForm] = useState(false);
    const [visibleCount, setVisibleCount] = useState(4);
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

    const getReviews = () => {
        if (!props?.productId) return;
        fetchDataFromApi(`/api/user/getReviews?productId=${props?.productId}`)
            .then((res) => {
                if (res?.error === false) {
                    const approvedReviews = res.reviews?.filter(r => r.isApproved === true) || [];
                    setReviewsData(approvedReviews);
                    props.setReviewsCount?.(approvedReviews.length);
                }
            })
            .catch((err) => {
                setReviewsData([]);
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

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + previewImages.length > 5) {
            context?.alertBox("error", "Max 5 images allowed");
            return;
        }
        const newPreviews = files.map(file => ({ file, url: URL.createObjectURL(file) }));
        setPreviewImages((prev) => [...prev, ...newPreviews]);
    };

    const removePreviewImage = (index) => {
        setPreviewImages((prev) => {
            if (prev[index]?.url) URL.revokeObjectURL(prev[index].url);
            return prev.filter((_, i) => i !== index);
        });
    };

    const uploadReviewImages = async () => {
        const uploadedUrls = [];
        for (const preview of previewImages) {
            const formData = new FormData();
            formData.append('images', preview.file);
            try {
                const VITE_API_URL = import.meta.env.VITE_API_URL || '';
    const res = await fetch(`${VITE_API_URL}/api/user/uploadReviewImages`, { method: 'POST', body: formData });
                const data = await res.json();
                if (data?.images?.[0]) uploadedUrls.push(data.images[0]);
            } catch (error) {}
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
            let reviewImages = previewImages.length > 0 ? await uploadReviewImages() : [];
            const reviewData = {
                ...reviews,
                reviewImages,
                userName: reviews.userName || 'Guest User',
                productName: props?.itemName || ''
            };
            postData("/api/user/addReview", reviewData).then((res) => {
                if (res?.error === false) {
                    context?.alertBox("success", "Review submitted!");
                    setReviews((prev) => ({ ...prev, review: '', rating: 5 }));
                    setPreviewImages([]);
                    setShowForm(false);
                    getReviews();
                } else {
                    context?.alertBox("error", res?.message || "Failed to submit");
                }
                setLoading(false);
            });
        } catch (error) {
            context?.alertBox("error", "Something went wrong");
            setLoading(false);
        }
    };

    const ratingCounts = getRatingCounts();
    const avgRating = getAverageRating();
    const totalReviews = reviewsData.length;

    return (
        <div className="w-full space-y-5">
            {/* Rating Summary */}
            {totalReviews > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-8">
                        <div className="flex flex-col items-center shrink-0">
                            <div className="text-4xl font-bold text-gray-900 tracking-tight">{avgRating}</div>
                            <div className="flex items-center gap-0.5 mt-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <svg key={star} className={`w-3.5 h-3.5 ${star <= Math.round(parseFloat(avgRating)) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <div className="text-xs text-gray-600 mt-1 font-medium">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</div>
                        </div>
                        <div className="flex-1 w-full space-y-1.5">
                            {[5, 4, 3, 2, 1].map((star) => {
                                const pct = totalReviews > 0 ? ((ratingCounts[star] || 0) / totalReviews) * 100 : 0;
                                return (
                                    <div key={star} className="flex items-center gap-3 text-sm">
                                        <span className="w-5 text-right text-gray-700 font-bold text-sm">{star}</span>
                                        <div className="flex-1 h-[7px] bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-amber-400 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
                                        </div>
                                        <span className="w-5 text-right text-gray-600 tabular-nums font-semibold text-sm">{ratingCounts[star] || 0}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Review Form Card */}
            <div className={`bg-white rounded-xl border transition-all duration-200 ${showForm ? 'border-indigo-200 shadow-md' : 'border-gray-100 hover:border-gray-200'}`}>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 text-sm font-semibold tracking-wide transition-all ${
                        showForm 
                            ? 'text-gray-600 border-b border-gray-100' 
                            : 'text-indigo-600 hover:text-indigo-700'
                    }`}
                >
                    {showForm ? (
                        <>Cancel</>
                    ) : (
                        <><FaRegStar className="text-sm" /> Write a Review</>
                    )}
                </button>
                
                {showForm && (
                    <form onSubmit={addReview} className="p-5 sm:p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Avatar src={context?.userData?.avatar || ''} className="!w-10 !h-10 ring-2 ring-gray-100">
                                <FaUserCircle className="!text-2xl text-gray-300" />
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <input
                                    type="text"
                                    placeholder="Your name"
                                    value={reviews.userName}
                                    onChange={(e) => setReviews((prev) => ({ ...prev, userName: e.target.value }))}
                                    className="w-full text-sm text-gray-700 bg-transparent border-b border-gray-200 pb-1.5 focus:outline-none focus:border-indigo-400 transition-colors placeholder:text-gray-400"
                                />
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button key={star} type="button" onClick={() => setReviews((prev) => ({ ...prev, rating: star }))} className="p-0.5 transition-transform hover:scale-110">
                                        <svg className={`w-6 h-6 ${star <= reviews.rating ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <textarea
                            placeholder="Share your experience with this product..."
                            rows={3}
                            value={reviews.review}
                            onChange={(e) => setReviews((prev) => ({ ...prev, review: e.target.value }))}
                            className="w-full text-sm text-gray-700 bg-gray-50 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-300 focus:bg-white transition-all resize-none placeholder:text-gray-400"
                        />
                        
                        <div className="flex items-center justify-between gap-3 mt-4">
                            <div className="flex items-center gap-2">
                                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" multiple className="hidden" />
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 border border-gray-200 hover:border-gray-300 rounded-lg transition-all bg-white">
                                    <FaCamera className="text-xs" />
                                    {previewImages.length > 0 ? `${previewImages.length} photo${previewImages.length !== 1 ? 's' : ''}` : 'Add photos'}
                                </button>
                                {previewImages.length > 0 && (
                                    <div className="flex gap-1.5">
                                        {previewImages.map((preview, index) => (
                                            <div key={index} className="relative w-9 h-9 rounded-lg overflow-hidden border border-gray-200 group">
                                                <img src={preview.url} alt="" className="w-full h-full object-cover" />
                                                <button type="button" onClick={() => removePreviewImage(index)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <FaTimes className="text-white text-[10px]" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-40 transition-all flex items-center gap-2 shadow-sm"
                            >
                                {loading ? (
                                    <><CircularProgress size={14} color="inherit" /> Submitting</>
                                ) : (
                                    <><IoSend className="text-sm" /> Submit Review</>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Reviews List */}
            {totalReviews > 0 ? (
                <div className="space-y-3">
                    {reviewsData.slice(0, visibleCount).map((review, index) => (
                        <div key={index} className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 hover:border-gray-200 transition-all">
                            <div className="flex items-start gap-3.5">
                                <Avatar src={review?.image || ''} className="!w-10 !h-10 sm:!w-11 sm:!h-11 ring-2 ring-gray-100 shrink-0">
                                    <FaUserCircle className="!text-2xl sm:!text-3xl text-gray-200" />
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-3 mb-1">
                                        <div>
                                            <span className="text-sm font-bold text-gray-800">{review?.userName || 'Anonymous'}</span>
                                            <div className="flex items-center gap-1 mt-0.5">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <svg key={star} className={`w-3.5 h-3.5 ${star <= (review?.rating || 5) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-500 whitespace-nowrap font-medium">
                                            {review?.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed mt-2">{review?.review}</p>
                                    {review?.reviewImages?.length > 0 && (
                                        <div className="flex gap-2 mt-3">
                                            {review.reviewImages.map((img, imgIndex) => (
                                                <div key={imgIndex} className="w-[68px] h-[68px] sm:w-[76px] sm:h-[76px] rounded-lg overflow-hidden border border-gray-100 cursor-pointer group shadow-sm">
                                                    <img 
                                                        src={img} 
                                                        alt="" 
                                                        className="w-full h-full object-cover transition-opacity group-hover:opacity-80"
                                                        onClick={() => window.open(img, '_blank')}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {totalReviews > visibleCount && (
                        <div className="text-center pt-2">
                            <button
                                onClick={() => setVisibleCount(visibleCount === totalReviews ? 4 : totalReviews)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-full transition-all"
                            >
                                {visibleCount >= totalReviews ? (
                                    <>Show Less</>
                                ) : (
                                    <>View All {totalReviews} Reviews</>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            ) : !showForm && (
                <div className="text-center py-14 sm:py-18">
                    <div className="w-18 h-18 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl bg-gray-50 flex items-center justify-center rotate-12">
                        <FaRegStar className="text-3xl text-gray-300" />
                    </div>
                    <p className="text-base font-bold text-gray-700 mb-1">No reviews yet</p>
                    <p className="text-sm text-gray-500">Be the first to share your experience with this product.</p>
                </div>
            )}
        </div>
    );
};