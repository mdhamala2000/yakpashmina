import React, { useState, useEffect } from 'react';
import { Button, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Slide, Box, Chip, Drawer, Radio, RadioGroup, FormControlLabel, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { FaAngleDown, FaAngleUp, FaSearch, FaEye, FaTrash, FaCheck, FaClock, FaBox, FaTruck, FaTimes, FaFilter, FaMapMarkerAlt, FaCreditCard, FaList, FaMoneyBill, FaShoppingBag, FaChevronRight, FaWindowClose, FaChevronDown } from "react-icons/fa";
import { deleteData, editData, fetchDataFromApi } from '../../utils/api';
import Pagination from "@mui/material/Pagination";

import { useContext } from 'react';
import { MyContext } from "../../App.jsx";

const statusConfig = {
  pending: { label: 'Pending', color: '#f59e0b', bg: '#fef3c7', icon: FaClock },
  confirm: { label: 'Confirmed', color: '#3b82f6', bg: '#dbeafe', icon: FaCheck },
  delivered: { label: 'Delivered', color: '#10b981', bg: '#d1fae5', icon: FaTruck },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: '#fee2e2', icon: FaTimes }
};

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const Orders = () => {
  const [isOpenOrderdProduct, setIsOpenOrderdProduct] = useState(null);
  const [orderStatus, setOrderStatus] = useState('');
  const [ordersData, setOrdersData] = useState([]);
  const [orders, setOrders] = useState([]);
  const [pageOrder, setPageOrder] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalOrdersData, setTotalOrdersData] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);
  const [openFilterDrawer, setOpenFilterDrawer] = useState(false);
  const [tempStatusFilter, setTempStatusFilter] = useState('all');
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState('all');
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [tempCategoryFilter, setTempCategoryFilter] = useState('all');
  const [tempSubcategoryFilter, setTempSubcategoryFilter] = useState('all');

  const context = useContext(MyContext);

  useEffect(() => {
    fetchDataFromApi("/api/category").then((res) => {
      if (res) {
        setCategories(Array.isArray(res) ? res : res.data || []);
      }
    })
  }, []);

  const isShowOrderdProduct = (index) => {
    if (isOpenOrderdProduct === index) {
      setIsOpenOrderdProduct(null);
    } else {
      setIsOpenOrderdProduct(index);
    }
  };

  const handleChange = (event, id) => {
    setOrderStatus(event.target.value);
    const obj = {
      id: id,
      order_status: event.target.value
    }
    editData(`/api/order/order-status/${id}`, obj).then((res) => {
      if (res?.data?.error === false) {
        context.alertBox("success", res?.data?.message);
      }
    })
  };

  useEffect(() => {
    context?.setProgress(50);
    const statusParam = statusFilter !== 'all' ? `&status=${statusFilter}` : '';
    const catParam = categoryFilter !== 'all' ? `&category=${categoryFilter}` : '';
    const subCatParam = subcategoryFilter !== 'all' ? `&subcategory=${subcategoryFilter}` : '';
    fetchDataFromApi(`/api/order/order-list?page=${pageOrder}&limit=10${statusParam}${catParam}${subCatParam}`).then((res) => {
      if (res?.error === false) {
        setOrdersData(res?.data)
        setOrders(res)
        context?.setProgress(100);
      }
    })
  }, [orderStatus, pageOrder, statusFilter, categoryFilter, subcategoryFilter])

  useEffect(() => {
    if (searchQuery !== "") {
      const filteredOrders = ordersData?.filter((order) =>
        order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order?.userId?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order?.delivery_address?.mobile?.includes(searchQuery)
      );
      setOrdersData(filteredOrders)
    } else {
      fetchDataFromApi(`/api/order/order-list?page=${pageOrder}&limit=10`).then((res) => {
        if (res?.error === false) {
          setOrdersData(res?.data)
        }
      })
    }
  }, [searchQuery])

  const confirmDeleteOrder = (order) => {
    if (context?.userData?.role === "ADMIN") {
      setOrderToDelete(order);
      setOpenDeleteDialog(true);
    } else {
      context.alertBox("error", "Only admin can delete data");
    }
  };

  const handleDeleteOrder = () => {
    if (orderToDelete?._id) {
      deleteData(`/api/order/deleteOrder/${orderToDelete._id}`).then((res) => {
        fetchDataFromApi(`/api/order/order-list?page=${pageOrder}&limit=10`).then((res) => {
          if (res?.error === false) {
            setOrdersData(res?.data)
            context?.setProgress(100);
            context.alertBox("success", "Order deleted successfully!");
          }
        })
      })
    }
    setOpenDeleteDialog(false);
    setOrderToDelete(null);
  };

  const openOrderDetail = (order) => {
    setDetailOrder(order);
    setOpenDetailModal(true);
  };

  const handleCategoryExpand = (catId) => {
    setExpandedCategory(expandedCategory === catId ? null : catId);
  };

  const applyFilter = () => {
    setStatusFilter(tempStatusFilter);
    setCategoryFilter(tempCategoryFilter);
    setSubcategoryFilter(tempSubcategoryFilter);
    setOpenFilterDrawer(false);
  };

  const resetFilter = () => {
    setTempStatusFilter('all');
    setTempCategoryFilter('all');
    setTempSubcategoryFilter('all');
    setStatusFilter('all');
    setCategoryFilter('all');
    setSubcategoryFilter('all');
    setOpenFilterDrawer(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatPrice = (price) => {
    return price?.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  const activeFilterCount = (statusFilter !== 'all' ? 1 : 0) + (categoryFilter !== 'all' ? 1 : 0) + (subcategoryFilter !== 'all' ? 1 : 0);

  const getSubcategories = (parentId) => {
    const parent = categories.find(c => c._id === parentId);
    return parent?.children || [];
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Orders</h2>
              <p className="text-sm text-gray-500 mt-1">{ordersData?.length || 0} orders</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-full sm:w-64 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                />
              </div>
              <div className="relative md:hidden">
                <button
                  onClick={() => { setTempStatusFilter(statusFilter); setTempCategoryFilter(categoryFilter); setTempSubcategoryFilter(subcategoryFilter); setOpenFilterDrawer(true); }}
                  className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg bg-white w-full justify-center"
                >
                  <FaFilter className="text-gray-600" />
                  <span className="text-sm">Filter</span>
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="hidden md:block px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirm">Confirmed</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ordersData?.map((order, index) => {
                const StatusIcon = statusConfig[order?.order_status || 'pending']?.icon || FaClock;
                return (
                  <React.Fragment key={order?._id || index}>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => isShowOrderdProduct(index)}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                        >
                          {isOpenOrderdProduct === index ? 
                            <FaAngleUp className="text-gray-600" /> : 
                            <FaAngleDown className="text-gray-600" />
                          }
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500 font-mono">#{order?._id?.slice(-6)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-medium text-sm">
                            {order?.userId?.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{order?.userId?.name}</p>
                            <p className="text-xs text-gray-500">{order?.delivery_address?.mobile}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <FaBox className="text-gray-400 text-xs" />
                          <span className="text-sm text-gray-600">{order?.products?.length} items</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-gray-800">{formatPrice(order?.totalAmt)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={order?.order_status || 'pending'}
                          onChange={(e) => handleChange(e, order?._id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1`}
                          style={{ 
                            backgroundColor: statusConfig[order?.order_status || 'pending']?.bg,
                            color: statusConfig[order?.order_status || 'pending']?.color
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirm">Confirm</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500">{formatDate(order?.createdAt)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small" 
                              onClick={() => isShowOrderdProduct(index)}
                              className="hover:bg-gray-100"
                            >
                              <FaEye className="text-gray-500 text-xs" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Order">
                            <IconButton 
                              size="small" 
                              onClick={() => confirmDeleteOrder(order)}
                              className="hover:bg-red-50"
                            >
                              <FaTrash className="text-red-500 text-xs" />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>

                    {isOpenOrderdProduct === index && (
                      <tr>
                        <td colSpan="8" className="p-0">
                          <div className="bg-gray-50/50 p-4 md:p-6 border-y border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                              <div>
                                <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Shipping Address</h4>
                                <div className="bg-white rounded-lg p-3 border border-gray-100">
                                  <p className="text-sm text-gray-800 font-medium">{order?.userId?.name}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {order?.delivery_address?.address_line1}<br />
                                    {order?.delivery_address?.city}, {order?.delivery_address?.state} {order?.delivery_address?.pincode}<br />
                                    {order?.delivery_address?.country}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-2">📱 {order?.delivery_address?.mobile}</p>
                                </div>
                              </div>
                              <div>
                                <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Payment Info</h4>
                                <div className="bg-white rounded-lg p-3 border border-gray-100">
                                  <p className="text-xs text-gray-500">Payment ID</p>
                                  <p className="text-xs font-mono text-gray-700 mt-1">{order?.paymentId || 'CASH ON DELIVERY'}</p>
                                  <p className="text-xs text-gray-500 mt-3">Order ID</p>
                                  <p className="text-xs font-mono text-gray-700 mt-1">#{order?._id}</p>
                                </div>
                              </div>
                              <div>
                                <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Order Summary</h4>
                                <div className="bg-white rounded-lg p-3 border border-gray-100 space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-xs text-gray-500">Subtotal</span>
                                    <span className="text-xs font-medium text-gray-700">{formatPrice(order?.totalAmt - (order?.deliveryCharge || 0))}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-xs text-gray-500">Shipping</span>
                                    <span className="text-xs font-medium text-gray-700">{formatPrice(order?.deliveryCharge || 0)}</span>
                                  </div>
                                  <div className="border-t border-gray-100 pt-2 flex justify-between">
                                    <span className="text-sm font-medium text-gray-800">Total</span>
                                    <span className="text-sm font-bold text-gray-800">{formatPrice(order?.totalAmt)}</span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Products</h4>
                                <div className="bg-white rounded-lg border border-gray-100 max-h-48 overflow-y-auto">
                                  {order?.products?.map((item, idx) => (
                                    <div key={idx} className="p-3 border-b border-gray-50 last:border-b-0">
                                      <div className="flex gap-3">
                                        <img 
                                          src={item?.image} 
                                          alt={item?.productTitle}
                                          className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                                        />
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs font-medium text-gray-800 truncate">{item?.productTitle}</p>
                                          <p className="text-xs text-gray-500 mt-1">Qty: {item?.quantity} × {formatPrice(item?.price)}</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="md:hidden">
          {ordersData?.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {ordersData?.map((order, index) => {
                const StatusIcon = statusConfig[order?.order_status || 'pending']?.icon || FaClock;
                return (
                  <div key={order?._id || index} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-semibold text-lg">
                          {order?.userId?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{order?.userId?.name}</p>
                          <p className="text-xs text-gray-500">Order #{order?._id?.slice(-8)}</p>
                        </div>
                      </div>
                      <select
                        value={order?.order_status || 'pending'}
                        onChange={(e) => handleChange(e, order?._id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border-0 cursor-pointer`}
                        style={{ 
                          backgroundColor: statusConfig[order?.order_status || 'pending']?.bg,
                          color: statusConfig[order?.order_status || 'pending']?.color
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirm">Confirm</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 mb-3">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="font-bold text-gray-800 text-lg">{formatPrice(order?.totalAmt)}</p>
                      </div>
                      <div className="h-8 w-px bg-gray-200"></div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Items</p>
                        <p className="font-semibold text-gray-800">{order?.products?.length}</p>
                      </div>
                      <div className="h-8 w-px bg-gray-200"></div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="font-semibold text-gray-800 text-sm">{formatDate(order?.createdAt)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openOrderDetail(order)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-medium"
                      >
                        <FaEye />
                        View Details
                      </button>
                      <button
                        onClick={() => confirmDeleteOrder(order)}
                        className="w-12 h-12 flex items-center justify-center bg-red-50 rounded-xl text-red-500"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <FaBox className="text-gray-400 text-3xl" />
              </div>
              <p className="text-gray-600 font-medium">No orders found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
            </div>
          )}
        </div>

        {orders?.totalPages > 1 && (
          <div className="flex items-center justify-center p-6 border-t border-gray-100">
            <Pagination
              showFirstButton
              showLastButton
              count={orders?.totalPages}
              page={pageOrder}
              onChange={(e, value) => setPageOrder(value)}
              size="small"
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: '8px',
                  margin: '0 2px',
                },
              }}
            />
          </div>
        )}
      </div>

      <Dialog 
        open={openDetailModal} 
        onClose={() => setOpenDetailModal(false)} 
        fullScreen 
        TransitionComponent={Transition}
      >
        <div className="h-full flex flex-col bg-gray-50">
          <div className="bg-white px-4 py-3 shadow-sm flex items-center justify-between">
            <button onClick={() => setOpenDetailModal(false)} className="flex items-center gap-2 text-gray-600">
              <FaWindowClose /> Back
            </button>
            <h3 className="font-semibold text-gray-800">Order Details</h3>
            <div className="w-12"></div>
          </div>

          {detailOrder && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold text-xl">
                    {detailOrder?.userId?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-lg">{detailOrder?.userId?.name}</p>
                    <p className="text-sm text-gray-500">#{detailOrder?._id?.slice(-8)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={detailOrder?.order_status || 'pending'}
                    onChange={(e) => handleChange(e, detailOrder?._id)}
                    className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold border-0 cursor-pointer`}
                    style={{ 
                      backgroundColor: statusConfig[detailOrder?.order_status || 'pending']?.bg,
                      color: statusConfig[detailOrder?.order_status || 'pending']?.color
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirm">Confirm</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FaMoneyBill className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Order Total</p>
                    <p className="text-2xl font-bold text-gray-800">{formatPrice(detailOrder?.totalAmt)}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium">{formatPrice(detailOrder?.totalAmt - (detailOrder?.deliveryCharge || 0))}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Shipping</span>
                    <span className="font-medium">{formatPrice(detailOrder?.deliveryCharge || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                    <FaMapMarkerAlt className="text-green-600" />
                  </div>
                  <p className="font-semibold text-gray-800">Shipping Address</p>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-gray-800">{detailOrder?.userId?.name}</p>
                  <p className="text-gray-600">{detailOrder?.delivery_address?.address_line1}</p>
                  <p className="text-gray-600">{detailOrder?.delivery_address?.city}, {detailOrder?.delivery_address?.state} {detailOrder?.delivery_address?.pincode}</p>
                  <p className="text-gray-600">{detailOrder?.delivery_address?.country}</p>
                  <p className="text-gray-500 mt-2">📱 {detailOrder?.delivery_address?.mobile}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <FaCreditCard className="text-blue-600" />
                  </div>
                  <p className="font-semibold text-gray-800">Payment</p>
                </div>
                <p className="text-sm text-gray-600">Method</p>
                <p className="font-medium text-gray-800">{detailOrder?.paymentId || 'Cash on Delivery'}</p>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                    <FaShoppingBag className="text-purple-600" />
                  </div>
                  <p className="font-semibold text-gray-800">Products ({detailOrder?.products?.length})</p>
                </div>
                <div className="space-y-3">
                  {detailOrder?.products?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <img 
                        src={item?.image} 
                        alt={item?.productTitle}
                        className="w-20 h-20 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm line-clamp-2">{item?.productTitle}</p>
                        <p className="text-sm text-gray-500 mt-1">Qty: {item?.quantity} × {formatPrice(item?.price)}</p>
                        <p className="font-semibold text-gray-800 mt-1">{formatPrice(item?.price * item?.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Ordered on</span>
                  <span className="font-medium">{formatDate(detailOrder?.createdAt)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Dialog>

      <Drawer
        anchor="bottom"
        open={openFilterDrawer}
        onClose={() => setOpenFilterDrawer(false)}
        PaperProps={{
          className: 'rounded-t-2xl',
          style: { maxHeight: '85vh' }
        }}
      >
        <div className="p-4 overflow-y-auto" style={{ maxHeight: '85vh' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Filter Orders</h3>
            <button onClick={() => setOpenFilterDrawer(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100">
              <FaWindowClose />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-sm font-medium text-gray-600 mb-3">Order Status</p>
            <div className="grid grid-cols-2 gap-3">
              {['all', 'pending', 'confirm', 'delivered'].map((status) => (
                <button
                  key={status}
                  onClick={() => setTempStatusFilter(status)}
                  className={`p-4 rounded-xl font-medium text-center transition-all ${
                    tempStatusFilter === status 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {status === 'all' ? 'All Orders' : statusConfig[status]?.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm font-medium text-gray-600 mb-3">Category</p>
            <div className="space-y-2">
              <button
                onClick={() => { setTempCategoryFilter('all'); setTempSubcategoryFilter('all'); }}
                className={`w-full p-4 rounded-xl font-medium text-left transition-all ${
                  tempCategoryFilter === 'all' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                All Categories
              </button>
              
              {categories?.map((category) => (
                <div key={category._id}>
                  <button
                    onClick={() => handleCategoryExpand(category._id)}
                    className={`w-full p-4 rounded-xl font-medium text-left flex items-center justify-between transition-all ${
                      tempCategoryFilter === category._id 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <span 
                      onClick={(e) => { e.stopPropagation(); setTempCategoryFilter(category._id); setTempSubcategoryFilter('all'); }}
                      className="flex-1"
                    >
                      {category.name}
                    </span>
                    {category?.children?.length > 0 && (
                      <FaChevronDown className={`transition-transform ${expandedCategory === category._id ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  
                  {expandedCategory === category._id && category?.children?.length > 0 && (
                    <div className="mt-2 ml-4 space-y-2">
                      <button
                        onClick={() => setTempSubcategoryFilter('all')}
                        className={`w-full p-3 rounded-lg font-medium text-left transition-all ${
                          tempSubcategoryFilter === 'all' 
                            ? 'bg-primary/20 text-primary border border-primary' 
                            : 'bg-gray-50 text-gray-600 border border-gray-200'
                        }`}
                      >
                        All Subcategories
                      </button>
                      {category.children.map((sub) => (
                        <button
                          key={sub._id}
                          onClick={() => setTempSubcategoryFilter(sub._id)}
                          className={`w-full p-3 rounded-lg font-medium text-left transition-all ${
                            tempSubcategoryFilter === sub._id 
                              ? 'bg-primary/20 text-primary border border-primary' 
                              : 'bg-gray-50 text-gray-600 border border-gray-200'
                          }`}
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={resetFilter}
              className="flex-1 py-4 bg-gray-100 rounded-xl font-medium text-gray-700"
            >
              Reset
            </button>
            <button
              onClick={applyFilter}
              className="flex-1 py-4 bg-primary rounded-xl font-medium text-white"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </Drawer>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="text-center">Confirm Delete</DialogTitle>
        <DialogContent>
          <p className="text-center text-gray-600 py-4">
            Are you sure you want to delete this order? This action cannot be undone.
          </p>
        </DialogContent>
        <DialogActions className="p-4">
          <Button onClick={() => setOpenDeleteDialog(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleDeleteOrder} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Orders;