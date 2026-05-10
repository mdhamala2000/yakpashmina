import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Rating,
  Avatar,
  Button,
  TextField,
  IconButton,
  Skeleton,
  Chip,
  Tabs,
  Tab
} from '@mui/material';
import { 
  ArrowBack,
  Search as SearchIcon,
  Star,
  ThumbUp,
  Google,
  Verified
} from '@mui/icons-material';
import { IoSend } from "react-icons/io5";
import { IoImageOutline, IoClose } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import { fetchDataFromApi, postData } from '../utils/api';

const googleReviewsData = [
  {
    id: 1,
    author_name: "Asha Vade",
    profile_photo_url: "",
    rating: 5,
    relative_time_description: "a year ago",
    text: "Loved the collection, colours and the quality of products are amazing. Bought a shawl, a stole and 2 mufflers. Small and quaint store. Pricing is good too.",
    translated: false
  },
  {
    id: 2,
    author_name: "Stam Zaun",
    profile_photo_url: "",
    rating: 5,
    relative_time_description: "2 years ago",
    text: "Best pashmina shop in Kathmandu! Got beautiful yak wool shawl. Staff was very helpful and explained the quality differences. Will definitely come back!",
    translated: false
  }
];

const AllReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [newReview, setNewReview] = useState({
    review: '',
    rating: 5,
    userName: '',
    productId: '',
    productName: ''
  });
  const [previewImages, setPreviewImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [productsList, setProductsList] = useState([]);
  const googleReviews = googleReviewsData;

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAllReviews();
    fetchProducts();
  }, []);

  const fetchAllReviews = () => {
    fetchDataFromApi("/api/user/getAllReviews").then((res) => {
      if (res?.success) {
        setReviews(res?.reviews || []);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  };

  const fetchProducts = () => {
    fetchDataFromApi("/api/product/getAllProducts?page=1&limit=50").then((res) => {
      if (res?.products) {
        setProductsList(res.products);
      }
    });
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review?.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review?.review?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = filterRating === 0 || review?.rating === filterRating;
    return matchesSearch && matchesRating;
  });

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    return (total / reviews.length).toFixed(1);
  };

  const getRatingCounts = () => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      if (counts[r.rating] !== undefined) counts[r.rating]++;
    });
    return counts;
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + previewImages.length > 5) {
      alert("You can upload maximum 5 images");
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
      if (prev[index]?.url) {
        URL.revokeObjectURL(prev[index].url);
      }
      return newPrev;
    });
  };

  const uploadReviewImages = async () => {
    const uploadedUrls = [];
    for (const preview of previewImages) {
      // For now, we'll use the image URL directly as a data URL or use the preview URL
      // Since auth is required for upload, we'll use the blob URL as a workaround
      try {
        // Convert blob URL to base64 and upload
        const response = await fetch(preview.url);
        const blob = await response.blob();
        const formData = new FormData();
        formData.append('images', blob, 'review-image.jpg');
        
        // Try without auth for public uploads
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
        // Fallback: use the preview URL directly if upload fails
        uploadedUrls.push(preview.url);
      }
    }
    return uploadedUrls;
  };

  const submitReview = async () => {
    if (!newReview.review.trim()) {
      alert("Please write a review");
      return;
    }

    setSubmitting(true);
    try {
      let reviewImages = [];
      if (previewImages.length > 0) {
        reviewImages = await uploadReviewImages();
      }

      const reviewData = {
        ...newReview,
        reviewImages: reviewImages,
        userName: newReview.userName || 'Guest User'
      };

      postData("/api/user/addReview", reviewData).then((res) => {
        if (res?.error === false) {
          alert("Review submitted successfully!");
          setNewReview({ review: '', rating: 5, userName: '', productId: '' });
          setPreviewImages([]);
          fetchAllReviews();
          setShowReviewForm(false);
        } else {
          alert(res?.message || "Failed to submit review");
        }
        setSubmitting(false);
      });
    } catch (error) {
      alert("Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <Box className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <Box className="bg-gray-100 py-8 sm:py-10 md:py-12 border-b border-gray-200">
        <Container maxWidth="lg">
          <Box className="flex items-center gap-4 mb-3 sm:mb-4">
            <Link to="/">
              <Button startIcon={<ArrowBack />} className="!text-gray-600 hover:!text-orange-500">
                Back
              </Button>
            </Link>
          </Box>
          <Typography variant="h2" className="!text-gray-900 !font-[700] !text-[24px] sm:!text-[32px] lg:!text-[48px]">
            Customer Reviews
          </Typography>
          <Typography className="!text-gray-500 !text-[14px] sm:!text-[16px] !mt-1 sm:!mt-2">
            See what our customers are saying about us
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" className="py-6 sm:py-8">
        {/* Tabs */}
        <Box className="bg-white rounded-xl mb-6 shadow-sm overflow-hidden">
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            className="!border-b border-gray-200"
            variant="fullWidth"
            TabIndicatorProps={{
              style: {
                backgroundColor: '#2bbef9',
                height: '3px'
              }
            }}
          >
            <Tab 
              label={
                <Box className="flex items-center gap-2">
                  <Star className="!text-[#2bbef9]" />
                  <span>Site Reviews ({reviews.length})</span>
                </Box>
              } 
              className="!text-gray-600 !font-[500]"
            />
            <Tab 
              label={
                <Box className="flex items-center gap-2">
                  <FcGoogle className="!text-[20px]" />
                  <span>Google Reviews ({googleReviews.length})</span>
                </Box>
              } 
              className="!text-gray-600 !font-[500]"
            />
          </Tabs>
        </Box>

        {/* Site Reviews Section */}
        {tabValue === 0 && (
          <>
        {/* Stats Section */}
        <Box className="bg-white rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-sm">
          <Grid container spacing={3} sm:spacing={4}>
            <Grid item xs={12} md={4} className="text-center">
              <Typography variant="h2" className="!text-[36px] sm:!text-[48px] md:!text-[56px] !font-[700] !text-[#2bbef9]">
                {getAverageRating()}
              </Typography>
              <Rating value={parseFloat(getAverageRating())} readOnly precision={0.5} className="!justify-center" />
              <Typography className="!text-gray-500 !text-[12px] sm:!text-[14px] mt-1">
                Based on {reviews.length} reviews
              </Typography>
            </Grid>
            <Grid item xs={12} md={8}>
              {[5, 4, 3, 2, 1].map((star) => (
                <Box key={star} className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2 cursor-pointer" onClick={() => setFilterRating(filterRating === star ? 0 : star)}>
                  <Typography className="!text-[12px] sm:!text-[14px] !w-[35px] sm:!w-[50px] flex items-center gap-1">
                    {star} <Star className="!text-yellow-400 !text-[12px] sm:!text-[16px]" />
                  </Typography>
                    <Box className="flex-grow h-[8px] sm:h-[10px] bg-gray-200 rounded-full overflow-hidden">
                    {(() => {
                      const percentage = reviews.length > 0 ? ((getRatingCounts()[star] || 0) / reviews.length) * 100 : 0;
                      return (
                        <Box 
                          className="h-full rounded-full transition-all bg-[#2bbef9]"
                          style={{ width: `${percentage}%` }}
                        />
                      );
                    })()}
                    </Box>
                  <Typography className="!text-[14px] !text-gray-500 !w-[30px]">
                    {getRatingCounts()[star] || 0}
                  </Typography>
                </Box>
              ))}
              {filterRating > 0 && (
                <Button 
                  size="small" 
                  onClick={() => setFilterRating(0)}
                  className="!mt-2 !text-[#2bbef9]"
                >
                  Clear Filter
                </Button>
              )}
            </Grid>
          </Grid>
        </Box>

        {/* Search and Filter */}
        <Box className="bg-white rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 shadow-sm flex flex-wrap gap-3 sm:gap-4 items-center justify-between">
          <Box className="flex items-center gap-3 flex-grow">
            <SearchIcon className="!text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="!bg-transparent !outline-none !w-full !max-w-[300px]"
            />
          </Box>
          <Button
            variant="contained"
            className="!bg-[#2bbef9] !rounded-full"
            onClick={() => setShowReviewForm(!showReviewForm)}
          >
            Write a Review
          </Button>
        </Box>

        {/* Write Review Form */}
        {showReviewForm && (
          <Box className="bg-white rounded-xl p-6 mb-6 shadow-lg border border-gray-100">
            <Typography variant="h5" className="!font-[600] !mb-5">
              Share Your Experience
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Your Name"
                  value={newReview.userName}
                  onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })}
                  placeholder="Enter your name"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box className="flex items-center gap-3 h-full">
                  <Typography>Rating:</Typography>
                  <Rating 
                    value={newReview.rating} 
                    onChange={(event, newValue) => setNewReview({ ...newReview, rating: newValue || 5 })} 
                    size="large"
                  />
                </Box>
              </Grid>
              {productsList.length > 0 && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Select Product (Optional)"
                    value={newReview.productId}
                    onChange={(e) => {
                      const selectedProduct = productsList.find(p => p._id === e.target.value);
                      setNewReview({ 
                        ...newReview, 
                        productId: e.target.value,
                        productName: selectedProduct?.name || ''
                      });
                    }}
                    SelectProps={{ native: true }}
                  >
                    <option value="">Select a product...</option>
                    {productsList.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name}
                      </option>
                    ))}
                  </TextField>
                </Grid>
              )}
            </Grid>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Your Review"
              value={newReview.review}
              onChange={(e) => setNewReview({ ...newReview, review: e.target.value })}
              placeholder="Share your experience with us..."
              className="!mt-4"
            />
            
            {/* Image Upload */}
            <Box className="mt-4">
              <input
                type="file"
                id="review-images"
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                className="hidden"
              />
              <label htmlFor="review-images">
                <Button
                  variant="outlined"
                  startIcon={<IoImageOutline />}
                  component="span"
                  className="!border-gray-300 !text-gray-600"
                >
                  Add Photos ({previewImages.length}/5)
                </Button>
              </label>
              
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

            <Box className="flex gap-3 mt-4">
              <Button 
                variant="contained"
                className="!bg-[#2bbef9] !text-white !font-[600]"
                onClick={submitReview}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
              <Button 
                variant="outlined"
                onClick={() => setShowReviewForm(false)}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        )}

        {/* Reviews List */}
        {loading ? (
          <Grid container spacing={3} sm:spacing={4}>
            {[1,2,3,4,5,6].map(i => (
              <Grid item xs={12} md={6} key={i}>
                <Box className="bg-white rounded-xl p-5 shadow-sm">
                  <Box className="flex items-center gap-3 mb-3">
                    <Skeleton variant="circular" width={50} height={50} />
                    <Box>
                      <Skeleton variant="text" width={150} />
                      <Skeleton variant="text" width={100} />
                    </Box>
                  </Box>
                  <Skeleton variant="text" width="100%" />
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="60%" />
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : filteredReviews.length > 0 ? (
          <Grid container spacing={4}>
            {filteredReviews.map((review, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Box className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow h-full">
                  <Box className="flex items-start gap-3 mb-3">
                    <Avatar 
                      src={review?.image || '/user.jpg'} 
                      className="!w-[50px] !h-[50px]"
                    >
                      {review?.userName?.charAt(0) || 'G'}
                    </Avatar>
                    <Box className="flex-grow">
                      <Box className="flex items-center justify-between">
                        <Typography className="!font-[600] !text-[16px]">
                          {review?.userName || 'Anonymous'}
                        </Typography>
                        <Typography className="!text-[12px] !text-gray-500">
                          {review?.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                        </Typography>
                      </Box>
                      <Rating value={review?.rating || 5} size="small" readOnly className="!mt-1" />
                    </Box>
                  </Box>
                  
                  <Typography className="!text-[14px] !text-gray-700 !leading-relaxed mb-3">
                    {review?.review}
                  </Typography>
                  
                  {/* Review Images */}
                  {review?.reviewImages?.length > 0 && (
                    <Box className="flex gap-2 flex-wrap mb-3">
                      {review.reviewImages.map((img, imgIndex) => (
                        <Box 
                          key={imgIndex}
                          className="w-[90px] h-[90px] rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => window.open(img, '_blank')}
                        >
                          <img 
                            src={img} 
                            alt="Review" 
                            className="w-full h-full object-cover"
                          />
                        </Box>
                      ))}
                    </Box>
                  )}

                  {/* Product Link */}
                  {(review?.productId || review?.productName) && (
                    <Box className="flex items-center gap-2 mt-2">
                      <Chip 
                        icon={<Star className="!text-[12px] !text-green-600" />}
                        label={review?.productName || 'View Product'} 
                        size="small" 
                        component={Link}
                        to={review?.productId ? `/product/${review.productId}` : '#'}
                        clickable
                        className="!bg-green-50 !text-green-700 !text-[11px] hover:!bg-green-100"
                      />
                    </Box>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box className="text-center py-12 bg-white rounded-xl">
            <Typography className="!text-gray-500 !text-[16px]">
              No reviews found{searchQuery || filterRating ? ' matching your criteria' : ''}
            </Typography>
            {(searchQuery || filterRating) && (
              <Button 
                className="!mt-4 !text-[#2bbef9]"
                onClick={() => { setSearchQuery(''); setFilterRating(0); }}
              >
                Clear Filters
              </Button>
            )}
          </Box>
        )}
          </>
        )}

        {/* Google Reviews Section */}
        {tabValue === 1 && (
          <>
            {/* Shop Location */}
            <Box className="bg-green-50 rounded-xl p-4 mb-6 border border-green-200">
              <Box className="flex items-center gap-2 mb-1">
                <Box className="!w-[24px] !h-[24px] flex items-center justify-center !bg-green-600 !rounded-full">
                  <Typography className="!text-white !text-[12px] !font-bold">W</Typography>
                </Box>
                <Typography className="!font-[600] !text-[16px] !text-green-800">
                  White Yak Pashmina
                </Typography>
              </Box>
              <Typography className="!text-[12px] !text-gray-600 !ml-8">
                P876+W79, Narsingh Chowk Marg, Kathmandu 44600, Nepal
              </Typography>
            </Box>

            {/* Google Reviews Stats */}
            <Box className="bg-white rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-sm border-l-4 border-green-500">
              <Grid container spacing={3} sm:spacing={4}>
                <Grid item xs={12} md={4} className="text-center">
                  <Box className="flex items-center justify-center gap-2 mb-2">
                    <Typography variant="h2" className="!text-[36px] sm:!text-[48px] md:!text-[56px] !font-[700] !text-green-600">
                      5.0
                    </Typography>
                    <Box className="flex flex-col items-start">
                      <FcGoogle className="!text-[24px] sm:!text-[32px]" />
                    </Box>
                  </Box>
                  <Rating value={5} readOnly precision={0.5} className="!justify-center" />
                  <Typography className="!text-gray-500 !text-[12px] sm:!text-[14px] mt-1">
                    Based on {googleReviews.length} Google reviews
                  </Typography>
                </Grid>
                <Grid item xs={12} md={8}>
                  {[
                    { star: 5, count: 2 },
                    { star: 4, count: 0 },
                    { star: 3, count: 0 },
                    { star: 2, count: 0 },
                    { star: 1, count: 0 }
                  ].map((item) => (
                    <Box key={item.star} className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                      <Typography className="!text-[12px] sm:!text-[14px] !w-[35px] sm:!w-[50px] flex items-center gap-1">
                        {item.star} <Star className="!text-yellow-400 !text-[12px] sm:!text-[16px]" />
                      </Typography>
                      <Box className="flex-grow h-[8px] sm:h-[10px] bg-gray-200 rounded-full overflow-hidden">
                        <Box 
                          className="h-full rounded-full transition-all bg-green-500"
                          style={{ width: `${(item.count / googleReviews.length) * 100}%` }}
                        />
                      </Box>
                      <Typography className="!text-[14px] !text-gray-500 !w-[30px]">
                        {item.count}
                      </Typography>
                    </Box>
                  ))}
                </Grid>
              </Grid>
            </Box>

            {/* Google Reviews List */}
            <Grid container spacing={4}>
              {googleReviews.map((review, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Box className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow h-full border border-gray-100 hover:border-green-200">
                    <Box className="flex items-start gap-3 mb-3">
                      <Box className="relative">
                        <Avatar 
                          src={review?.profile_photo_url || '/user.jpg'} 
                          className="!w-[50px] !h-[50px]"
                        >
                          {review?.author_name?.charAt(0) || 'G'}
                        </Avatar>
                        <Box className="absolute -bottom-1 -right-1 !w-[18px] !h-[18px] !bg-white !rounded-full flex items-center justify-center">
                          <FcGoogle className="!text-[14px]" />
                        </Box>
                      </Box>
                      <Box className="flex-grow">
                        <Box className="flex items-center justify-between">
                          <Box className="flex items-center gap-2">
                            <Typography className="!font-[600] !text-[16px]">
                              {review?.author_name || 'Anonymous'}
                            </Typography>
                            <Verified className="!text-blue-500 !text-[16px]" />
                          </Box>
                          <Typography className="!text-[12px] !text-gray-500">
                            {review?.relative_time_description || ''}
                          </Typography>
                        </Box>
                        <Rating value={review?.rating || 5} size="small" readOnly className="!mt-1" />
                      </Box>
                    </Box>
                    
                    <Typography className="!text-[14px] !text-gray-700 !leading-relaxed">
                      {review?.text}
                    </Typography>

                    {/* Google Badge */}
                    <Box className="flex items-center gap-2 mt-3">
                      <Chip 
                        icon={<FcGoogle className="!text-[14px]" />}
                        label="Google Review" 
                        size="small" 
                        className="!bg-green-50 !text-green-700 !text-[11px]"
                      />
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* Button to Leave Google Review */}
            <Box className="mt-8 text-center">
              <Button
                variant="contained"
                size="large"
                startIcon={<FcGoogle className="!text-[24px]" />}
                className="!bg-green-600 !hover:bg-green-700 !text-white !font-[600] !px-8 !py-3 !rounded-full"
                onClick={() => window.open('https://search.google.com/search?q=white+yak+pashmina&ludocid=ngLlabWtLtzg0PEPrsez6AM&placeid=ChIJ2wEBG0tJWTkRlNq2t1JyWKE', '_blank')}
              >
                Write a Google Review
              </Button>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
};

export default AllReviews;