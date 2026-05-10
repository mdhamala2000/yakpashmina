import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, TextField, Box, Typography, Paper, CircularProgress, Stepper, Step, StepLabel, StepContent } from "@mui/material";
import { FaSearch, FaCheckCircle, FaShippingFast, FaBox, FaHome, FaTimesCircle } from "react-icons/fa";
import { fetchDataFromApi } from "../../utils/api";
import SEO from "../../components/SEO";
import toast from "react-hot-toast";

const OrderTracking = () => {
  const navigate = useNavigate();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      toast.error("Please enter your tracking number");
      return;
    }

    setLoading(true);
    setError(false);
    setOrderData(null);

    try {
      const res = await fetchDataFromApi(`/api/order/track/${trackingNumber.trim()}`);
      if (res?.order) {
        setOrderData(res.order);
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const getStatusSteps = () => {
    if (!orderData?.status) return [];
    
    const steps = [
      { label: "Order Placed", date: orderData?.createdAt, icon: FaBox, completed: true },
      { label: "Processing", date: orderData?.processedAt, icon: FaBox, completed: ["processing", "shipped", "delivered"].includes(orderData.status) },
      { label: "Shipped", date: orderData?.shippedAt, icon: FaShippingFast, completed: ["shipped", "delivered"].includes(orderData.status) },
      { label: "Out for Delivery", date: orderData?.outForDeliveryAt, icon: FaShippingFast, completed: orderData?.status === "out_for_delivery" },
      { label: "Delivered", date: orderData?.deliveredAt, icon: FaHome, completed: orderData?.status === "delivered" }
    ];

    return steps;
  };

  return (
    <>
      <SEO title="Track Order" description="Track your Pashmina order status and delivery updates" url="/order-tracking" />
      
      <div className="bg-gray-50 min-h-screen py-6 sm:py-10">
        <div className="container">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-[20px] sm:text-[24px] lg:text-[28px] font-[600] text-gray-900 mb-2">
              Track Your Order
            </h1>
            <p className="text-[13px] sm:text-[14px] text-gray-600">
              Enter your tracking number to check the status of your order
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Search Form */}
            <Paper className="p-4 sm:p-6 rounded-xl shadow-sm mb-6">
              <form onSubmit={handleTrack}>
                <div className="flex flex-col sm:flex-row gap-3">
                  <TextField
                    fullWidth
                    placeholder="Enter your tracking number / Order ID"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    InputProps={{
                      startAdornment: <FaSearch className="text-gray-400 mr-2" />
                    }}
                    size="small"
                  />
                  <Button 
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    className="!bg-orange-500 !hover:bg-orange-600 !px-6 !py-2.5 !capitalize"
                  >
                    {loading ? <CircularProgress size={20} className="!text-white" /> : "Track Order"}
                  </Button>
                </div>
              </form>
            </Paper>

            {/* Error State */}
            {error && (
              <Paper className="p-6 sm:p-8 rounded-xl shadow-sm text-center">
                <FaTimesCircle className="text-[48px] text-red-400 mb-4 mx-auto" />
                <h3 className="text-[16px] sm:text-[18px] font-[600] text-gray-900 mb-2">
                  Order Not Found
                </h3>
                <p className="text-[13px] sm:text-[14px] text-gray-600 mb-4">
                  We couldn't find an order with this tracking number. Please check your tracking number and try again.
                </p>
                <div className="text-left bg-gray-50 p-3 rounded-lg">
                  <p className="text-[12px] text-gray-500 mb-2">Tips:</p>
                  <ul className="text-[12px] text-gray-600 list-disc list-inside space-y-1">
                    <li>Make sure you've entered the correct tracking number</li>
                    <li>Tracking numbers are usually in your confirmation email</li>
                    <li>Allow 24-48 hours for the tracking to be activated</li>
                  </ul>
                </div>
              </Paper>
            )}

            {/* Order Found */}
            {orderData && (
              <div className="space-y-4">
                {/* Order Info */}
                <Paper className="p-4 sm:p-5 rounded-xl shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
                    <div>
                      <p className="text-[11px] text-gray-500 mb-0.5">Order ID</p>
                      <h3 className="text-[14px] sm:text-[16px] font-[600] text-gray-900">
                        #{orderData?.orderId || orderData?._id}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-gray-500 mb-0.5">Tracking Number</p>
                      <h3 className="text-[14px] sm:text-[16px] font-[600] text-orange-600">
                        {orderData?.trackingNumber}
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <p className="text-[11px] text-gray-500 mb-0.5">Order Date</p>
                      <p className="text-[13px] font-[500] text-gray-800">
                        {orderData?.createdAt ? new Date(orderData.createdAt).toLocaleDateString() : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-500 mb-0.5">Shipping Method</p>
                      <p className="text-[13px] font-[500] text-gray-800">
                        {orderData?.shippingMethod || 'Standard'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-500 mb-0.5">Estimated Delivery</p>
                      <p className="text-[13px] font-[500] text-gray-800">
                        {orderData?.estimatedDelivery ? new Date(orderData.estimatedDelivery).toLocaleDateString() : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-500 mb-0.5">Status</p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-[500] ${
                        orderData?.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        orderData?.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                        orderData?.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {orderData?.status?.charAt(0).toUpperCase() + orderData?.status?.slice(1) || 'Pending'}
                      </span>
                    </div>
                  </div>
                </Paper>

                {/* Tracking Timeline */}
                <Paper className="p-4 sm:p-6 rounded-xl shadow-sm">
                  <h3 className="text-[14px] sm:text-[16px] font-[600] text-gray-900 mb-4">
                    Order Progress
                  </h3>
                  
                  <div className="relative">
                    {getStatusSteps().map((step, index) => (
                      <div key={index} className="flex gap-4 pb-6 last:pb-0 relative">
                        {index < getStatusSteps().length - 1 && (
                          <div className={`absolute left-[15px] top-[30px] bottom-0 w-0.5 ${step.completed ? 'bg-orange-500' : 'bg-gray-200'}`} />
                        )}
                        <div className={`relative z-10 w-[30px] h-[30px] rounded-full flex items-center justify-center ${
                          step.completed ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                          <step.icon className="text-[12px]" />
                        </div>
                        <div className="flex-1 pt-1">
                          <p className={`text-[13px] sm:text-[14px] font-[500] ${
                            step.completed ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {step.label}
                          </p>
                          {step.date && (
                            <p className="text-[11px] sm:text-[12px] text-gray-500">
                              {new Date(step.date).toLocaleDateString('en-US', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Paper>

                {/* Shipping Address */}
                {orderData?.shippingAddress && (
                  <Paper className="p-4 sm:p-5 rounded-xl shadow-sm">
                    <h3 className="text-[14px] sm:text-[16px] font-[600] text-gray-900 mb-3">
                      Shipping Address
                    </h3>
                    <div className="text-[13px] sm:text-[14px] text-gray-600 leading-relaxed">
                      <p className="font-[500] text-gray-800">{orderData.shippingAddress.name}</p>
                      <p>{orderData.shippingAddress.address}</p>
                      <p>{orderData.shippingAddress.city}, {orderData.shippingAddress.state} {orderData.shippingAddress.zipCode}</p>
                      <p>{orderData.shippingAddress.country}</p>
                    </div>
                  </Paper>
                )}

                {/* Order Items */}
                {orderData?.items && orderData.items.length > 0 && (
                  <Paper className="p-4 sm:p-5 rounded-xl shadow-sm">
                    <h3 className="text-[14px] sm:text-[16px] font-[600] text-gray-900 mb-3">
                      Order Items
                    </h3>
                    <div className="space-y-3">
                      {orderData.items.map((item, index) => (
                        <div key={index} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                          <div className="w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] bg-gray-50 rounded-lg flex items-center justify-center p-2">
                            <img 
                              src={item?.image?.[0] || '/placeholder.jpg'} 
                              alt={item?.productTitle}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-[12px] sm:text-[13px] font-[500] text-gray-800 line-clamp-2">
                              {item?.productTitle}
                            </p>
                            <p className="text-[11px] text-gray-500 mt-1">
                              Qty: {item?.quantity} × ${item?.price}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[12px] sm:text-[13px] font-[500] text-gray-800">
                              ${item?.price * item?.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Paper>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderTracking;