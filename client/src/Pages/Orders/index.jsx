import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";
import { FaBoxOpen, FaSearch, FaFilter, FaAngleDown, FaAngleUp, FaClock, FaMapMarkerAlt, FaCheckCircle, FaTimesCircle, FaShippingFast } from "react-icons/fa";
import { fetchDataFromApi } from "../../utils/api";
import Pagination from "@mui/material/Pagination";
import { useCurrency } from "../../context/CurrencyContext";
import Rating from "@mui/material/Rating";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const { CURRENCIES, currency } = useCurrency();

  const getSymbolForOrder = (orderCurrency) => {
    return CURRENCIES[orderCurrency || currency]?.symbol || '$';
  };

  const displayAmount = (amount, orderCurrency) => {
    if (!amount || isNaN(amount)) return `${getSymbolForOrder(orderCurrency)}0.00`;
    return `${getSymbolForOrder(orderCurrency)}${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: <FaClock className="text-xs" /> },
      'Processing': { bg: 'bg-blue-100', text: 'text-blue-700', icon: <FaClock className="text-xs" /> },
      'Shipped': { bg: 'bg-purple-100', text: 'text-purple-700', icon: <FaShippingFast className="text-xs" /> },
      'Delivered': { bg: 'bg-green-100', text: 'text-green-700', icon: <FaCheckCircle className="text-xs" /> },
      'Cancelled': { bg: 'bg-red-100', text: 'text-red-700', icon: <FaTimesCircle className="text-xs" /> },
    };
    return statusColors[status] || statusColors['Pending'];
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  useEffect(() => {
    setLoading(true);
    fetchDataFromApi(`/api/order/order-list/orders?page=${page}&limit=10`).then((res) => {
      if (res?.error === false) {
        setOrders(res);
      }
      setLoading(false);
    });
  }, [page]);

  const filteredOrders = orders?.data?.filter(order => {
    const matchesSearch = !searchTerm || 
      order?._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order?.products?.some(p => p?.productTitle?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || order?.order_status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const toggleExpand = (index) => {
    setExpandedOrder(expandedOrder === index ? null : index);
  };

  return (
    <section className="py-6 lg:py-10 w-full bg-gray-50 min-h-screen">
      <div className="container max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">My Orders</h2>
          <p className="text-gray-500 mt-1">
            Track and manage your orders
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm mb-6 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <FormControl size="small" className="w-full md:w-48">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Processing">Processing</MenuItem>
                <MenuItem value="Shipped">Shipped</MenuItem>
                <MenuItem value="Delivered">Delivered</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredOrders?.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <FaBoxOpen className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No orders found</h3>
            <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
            <Link to="/products">
              <Button className="btn-org">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders?.map((order, index) => {
              const statusStyle = getStatusColor(order?.order_status);
              return (
                <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {/* Order Header */}
                  <div 
                    className="p-4 lg:p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleExpand(index)}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                          <span className="text-sm font-mono text-gray-500">Order #{order?._id?.slice(-8).toUpperCase()}</span>
                          <span className="text-xs text-gray-400">{formatDate(order?.createdAt)}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                            {statusStyle.icon}
                            {order?.order_status || 'Pending'}
                          </span>
                          <span className="text-lg font-bold text-primary">
                            {displayAmount(order?.totalAmt, order?.currency)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between lg:justify-end gap-3">
                        <span className="text-sm text-gray-500">
                          {order?.products?.length} {order?.products?.length === 1 ? 'item' : 'items'}
                        </span>
                        {expandedOrder === index ? (
                          <FaAngleUp className="text-gray-400" />
                        ) : (
                          <FaAngleDown className="text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Order Details */}
                  {expandedOrder === index && (
                    <div className="border-t border-gray-100">
                      {/* Order Items */}
                      <div className="p-4 lg:p-5">
                        <h4 className="text-sm font-semibold text-gray-700 mb-4">Order Items</h4>
                        <div className="space-y-3">
                          {order?.products?.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                              <img 
                                src={item?.image} 
                                alt={item?.productTitle}
                                className="w-16 h-16 lg:w-20 lg:h-20 object-cover rounded-lg"
                              />
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-gray-800 truncate">{item?.productTitle}</h5>
                                <p className="text-sm text-gray-500">Qty: {item?.quantity}</p>
                                <p className="text-xs text-gray-400">{displayAmount(item?.perUnit || item?.price / item?.quantity, order?.currency)} per unit</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-800">{displayAmount(item?.subTotal || item?.price, order?.currency)}</p>
                                <p className="text-xs text-gray-500">{displayAmount(item?.perUnit || item?.price / item?.quantity, order?.currency)} each</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="border-t border-gray-100 p-4 lg:p-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Delivery Address */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                              <FaMapMarkerAlt className="text-primary" />
                              Delivery Address
                            </h4>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <p className="font-medium text-gray-800">{order?.delivery_address?.addressType}</p>
                              <p className="text-gray-600 text-sm mt-1">
                                {order?.delivery_address?.address_line1}<br />
                                {order?.delivery_address?.city}, {order?.delivery_address?.state} {order?.delivery_address?.pincode}<br />
                                {order?.delivery_address?.country}
                              </p>
                              <p className="text-gray-500 text-sm mt-2">Phone: {order?.delivery_address?.mobile}</p>
                            </div>
                          </div>

                          {/* Payment Info */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Payment Summary</h4>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">{displayAmount(order?.subTotal, order?.currency)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Shipping</span>
                                <span className="font-medium">{displayAmount(order?.shippingCost, order?.currency)}</span>
                              </div>
                              {order?.discountAmount > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                  <span>Discount ({order?.discountCode})</span>
                                  <span>-{displayAmount(order?.discountAmount, order?.currency)}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2">
                                <span>Total</span>
                                <span className="text-primary">{displayAmount(order?.totalAmt, order?.currency)}</span>
                              </div>
                              <div className="text-xs text-gray-500 pt-2">
                                Paid via: {order?.payment_status}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="border-t border-gray-100 p-4 lg:p-5 bg-gray-50">
                        <div className="flex flex-wrap gap-3">
                          <Link to="/" className="flex-1">
                            <Button variant="outlined" className="w-full btn-border">
                              Buy Again
                            </Button>
                          </Link>
                          <Button variant="outlined" className="flex-1 btn-border">
                            Need Help
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {orders?.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <Pagination
              siblingCount={1}
              boundaryCount={1}
              count={orders?.totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              className="pagination"
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default Orders;