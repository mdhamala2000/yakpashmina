import React, { useEffect, useState } from 'react';
import { fetchDataFromApi, postData, deleteData, putData } from '../../utils/api';
import { Link } from 'react-router-dom';
import { FaStar, FaEdit, FaTrash, FaCheck, FaTimes, FaExternalLinkAlt } from 'react-icons/fa';
import Rating from '@mui/material/Rating';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';

const ManageReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = () => {
    fetchDataFromApi("/api/user/getAllReviewsAdmin").then((res) => {
      if (res?.success) {
        setReviews(res?.reviews || []);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  };

  const handleApprove = (reviewId) => {
    setActionLoading(reviewId);
    putData("/api/user/approveReview/" + reviewId, { isApproved: true }).then((res) => {
      if (res?.success) {
        fetchReviews();
      }
      setActionLoading(null);
    });
  };

  const handleUnapprove = (reviewId) => {
    setActionLoading(reviewId);
    putData("/api/user/approveReview/" + reviewId, { isApproved: false }).then((res) => {
      if (res?.success) {
        fetchReviews();
      }
      setActionLoading(null);
    });
  };

  const handleDelete = (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      setActionLoading(reviewId);
      deleteData("/api/user/deleteReview/" + reviewId).then((res) => {
        if (res?.success) {
          fetchReviews();
        }
        setActionLoading(null);
      });
    }
  };

  const filteredReviews = reviews.filter(review => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'approved') return review.isApproved === true;
    if (filterStatus === 'pending') return review.isApproved === false;
    return true;
  });

  const pendingCount = reviews.filter(r => r.isApproved === false).length;
  const approvedCount = reviews.filter(r => r.isApproved === true).length;

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-[20px] font-[600]">Manage Reviews</h2>
          <p className="text-[14px] text-gray-500">Review and approve customer reviews</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <Box className="bg-white p-4 rounded-lg shadow-sm border">
          <Typography className="!text-[14px] !text-gray-500">Total Reviews</Typography>
          <Typography className="!text-[28px] !font-[700] !text-[#2bbef9]">{reviews.length}</Typography>
        </Box>
        <Box className="bg-white p-4 rounded-lg shadow-sm border">
          <Typography className="!text-[14px] !text-gray-500">Approved</Typography>
          <Typography className="!text-[28px] !font-[700] !text-green-600">{approvedCount}</Typography>
        </Box>
        <Box className="bg-white p-4 rounded-lg shadow-sm border">
          <Typography className="!text-[14px] !text-gray-500">Pending Approval</Typography>
          <Typography className="!text-[28px] !font-[700] !text-orange-500">{pendingCount}</Typography>
        </Box>
      </div>

      {/* Filter */}
      <Box className="flex gap-2 mb-5 flex-wrap">
        <Chip 
          label={`All (${reviews.length})`}
          onClick={() => setFilterStatus('all')}
          className={filterStatus === 'all' ? '!bg-[#2bbef9] !text-white' : '!bg-gray-100'}
        />
        <Chip 
          label={`Approved (${approvedCount})`}
          onClick={() => setFilterStatus('approved')}
          className={filterStatus === 'approved' ? '!bg-green-500 !text-white' : '!bg-gray-100'}
        />
        <Chip 
          label={`Pending (${pendingCount})`}
          onClick={() => setFilterStatus('pending')}
          className={filterStatus === 'pending' ? '!bg-orange-500 !text-white' : '!bg-gray-100'}
        />
      </Box>

      {/* Reviews Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-10">
            <CircularProgress />
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center p-10">
            <Typography className="!text-gray-500">No reviews found</Typography>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-left text-[13px] font-[600] text-gray-600">User</th>
                  <th className="p-4 text-left text-[13px] font-[600] text-gray-600">Rating</th>
                  <th className="p-4 text-left text-[13px] font-[600] text-gray-600">Review</th>
                  <th className="p-4 text-left text-[13px] font-[600] text-gray-600">Product</th>
                  <th className="p-4 text-left text-[13px] font-[600] text-gray-600">Images</th>
                  <th className="p-4 text-left text-[13px] font-[600] text-gray-600">Status</th>
                  <th className="p-4 text-left text-[13px] font-[600] text-gray-600">Date</th>
                  <th className="p-4 text-left text-[13px] font-[600] text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map((review) => (
                  <tr key={review._id} className="border-t hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-[40px] h-[40px] rounded-full bg-gray-200 flex items-center justify-center">
                          {review?.image ? (
                            <img src={review.image} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-[14px] font-[600]">{review?.userName?.charAt(0) || 'G'}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-[14px] font-[500]">{review?.userName || 'Anonymous'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Rating value={review?.rating || 5} size="small" readOnly />
                    </td>
                    <td className="p-4">
                      <p className="text-[13px] max-w-[200px] truncate">{review?.review}</p>
                    </td>
                    <td className="p-4">
                      {review?.productId ? (
                        <Link 
                          to={`/product/${review.productId}`}
                          target="_blank"
                          className="text-[13px] text-[#2bbef9] hover:underline flex items-center gap-1"
                        >
                          {review?.productName || 'View Product'} <FaExternalLinkAlt className="text-[10px]" />
                        </Link>
                      ) : (
                        <span className="text-[13px] text-gray-500">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      {review?.reviewImages?.length > 0 ? (
                        <div className="flex gap-1">
                          {review.reviewImages.slice(0, 2).map((img, i) => (
                            <img 
                              key={i} 
                              src={img} 
                              alt="" 
                              className="w-[40px] h-[40px] rounded object-cover cursor-pointer"
                              onClick={() => window.open(img, '_blank')}
                            />
                          ))}
                          {review.reviewImages.length > 2 && (
                            <span className="text-[12px] text-gray-500">+{review.reviewImages.length - 2}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[12px] text-gray-400">No images</span>
                      )}
                    </td>
                    <td className="p-4">
                      <Chip 
                        label={review?.isApproved ? 'Approved' : 'Pending'}
                        size="small"
                        className={review?.isApproved ? '!bg-green-100 !text-green-700' : '!bg-orange-100 !text-orange-700'}
                      />
                    </td>
                    <td className="p-4">
                      <p className="text-[12px] text-gray-500">
                        {review?.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                      </p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {review?.isApproved ? (
                          <IconButton 
                            size="small"
                            className="!bg-orange-100 !text-orange-600"
                            onClick={() => handleUnapprove(review._id)}
                            disabled={actionLoading === review._id}
                            title="Unapprove"
                          >
                            {actionLoading === review._id ? <CircularProgress size={16} /> : <FaTimes />}
                          </IconButton>
                        ) : (
                          <IconButton 
                            size="small"
                            className="!bg-green-100 !text-green-600"
                            onClick={() => handleApprove(review._id)}
                            disabled={actionLoading === review._id}
                            title="Approve"
                          >
                            {actionLoading === review._id ? <CircularProgress size={16} /> : <FaCheck />}
                          </IconButton>
                        )}
                        <IconButton 
                          size="small"
                          className="!bg-red-100 !text-red-600"
                          onClick={() => handleDelete(review._id)}
                          disabled={actionLoading === review._id}
                          title="Delete"
                        >
                          <FaTrash className="text-[14px]" />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageReviews;