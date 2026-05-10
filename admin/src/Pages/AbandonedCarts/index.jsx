import React, { useState, useEffect } from "react";
import { fetchDataFromApi, postData, editData, deleteData } from "../../utils/api";
import { FaShoppingCart, FaSearch, FaFilter, FaTrash, FaEnvelope, FaEye, FaDownload, FaCheck, FaTimes, FaUndo, FaExclamationTriangle } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

const AbandonedCarts = () => {
  const [carts, setCarts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("abandoned");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedCart, setSelectedCart] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [sendingBulk, setSendingBulk] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab, dateFilter, pagination.page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "active") {
        const res = await fetchDataFromApi("/api/abandonedCart/all-carts");
        if (res?.data) {
          setCarts(res.data);
          setPagination({ page: 1, pages: 1, total: res.data.length });
        }
      } else if (activeTab === "wishlist") {
        const res = await fetchDataFromApi("/api/abandonedCart/wishlist/old?days=30");
        if (res?.data) {
          setCarts(res.data);
        }
      } else {
        const statusParam = activeTab === "abandoned" ? "" : activeTab;
        const daysParam = dateFilter !== "all" ? `&days=${dateFilter}` : "";
        const res = await fetchDataFromApi(`/api/abandonedCart/all?status=${statusParam}${daysParam}&page=${pagination.page}&limit=10`);
        if (res?.data) {
          setCarts(res.data);
          if (res.pagination) {
            setPagination(res.pagination);
          }
        }
      }
      fetchStats();
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const res = await fetchDataFromApi("/api/abandonedCart/stats");
      if (res?.data) {
        setStats(res.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleSearch = () => {
    if (!searchTerm) {
      fetchData();
      return;
    }
    const filtered = carts.filter(cart => 
      cart.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cart.userName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setCarts(filtered);
  };

  const sendReminder = async (cartId) => {
    try {
      toast.loading("Sending reminder...", { id: "reminder" });
      const res = await postData(`/api/abandonedCart/reminder/${cartId}`, {});
      if (res?.success === true) {
        toast.success("Reminder sent successfully!", { id: "reminder" });
        fetchData();
      } else {
        toast.error(res?.message || "Failed to send reminder", { id: "reminder" });
      }
    } catch (error) {
      console.error("Reminder error:", error);
      toast.error("Error sending reminder", { id: "reminder" });
    }
  };

  const deleteCart = async (cartId) => {
    if (!window.confirm("Are you sure you want to delete this abandoned cart?")) return;
    try {
      toast.loading("Deleting...", { id: "delete" });
      const res = await deleteData(`/api/abandonedCart/${cartId}`);
      if (res?.success === true) {
        toast.success("Cart deleted successfully!", { id: "delete" });
        fetchData();
      } else {
        toast.error(res?.message || "Failed to delete", { id: "delete" });
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting cart", { id: "delete" });
    }
  };

  const markAsRecovered = async (cartId) => {
    try {
      toast.loading("Marking as recovered...", { id: "recover" });
      const res = await editData(`/api/abandonedCart/${cartId}/recover`, { status: "recovered" });
      if (res?.data?.success) {
        toast.success("Cart marked as recovered!", { id: "recover" });
        fetchData();
      } else {
        toast.error(res?.data?.message || "Failed to update", { id: "recover" });
      }
    } catch (error) {
      toast.error("Error updating cart", { id: "recover" });
    }
  };

  const markAsLost = async (cartId) => {
    try {
      toast.loading("Marking as lost...", { id: "lost" });
      const res = await editData(`/api/abandonedCart/${cartId}/recover`, { status: "lost" });
      if (res?.data?.success) {
        toast.success("Cart marked as lost!", { id: "lost" });
        fetchData();
      } else {
        toast.error(res?.data?.message || "Failed to update", { id: "lost" });
      }
    } catch (error) {
      toast.error("Error updating cart", { id: "lost" });
    }
  };

  const sendBulkReminders = async () => {
    if (!window.confirm("Send bulk reminders to all eligible abandoned carts?")) return;
    setSendingBulk(true);
    try {
      toast.loading("Sending bulk reminders...", { id: "bulk" });
      const res = await postData("/api/abandonedCart/reminder/bulk?days=1&limit=50", {});
      if (res?.success === true) {
        toast.success(`Sent ${res.data?.sent || 0} reminders, ${res.data?.failed || 0} failed`, { id: "bulk" });
        fetchData();
      } else {
        toast.error(res?.message || "Failed to send bulk reminders", { id: "bulk" });
      }
    } catch (error) {
      console.error("Bulk reminder error:", error);
      toast.error("Error sending bulk reminders", { id: "bulk" });
    }
    setSendingBulk(false);
  };

  const runDetection = async () => {
    if (!window.confirm("Run abandoned cart detection? This will scan carts older than 24 hours.")) return;
    try {
      toast.loading("Running detection...", { id: "detect" });
      const res = await postData("/api/abandonedCart/detect?hours=24", {});
      if (res?.success === true) {
        toast.success(`Detection complete: ${res.data?.processed || 0} carts processed`, { id: "detect" });
        fetchData();
      } else {
        toast.error(res?.message || "Detection failed", { id: "detect" });
      }
    } catch (error) {
      console.error("Detection error:", error);
      toast.error("Error running detection", { id: "detect" });
    }
  };

  const viewCartDetails = (cart) => {
    setSelectedCart(cart);
    setShowModal(true);
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    const badges = {
      not_recovered: { bg: "bg-red-100", text: "text-red-800", label: "Not Recovered" },
      recovered: { bg: "bg-green-100", text: "text-green-800", label: "Recovered" },
      lost: { bg: "bg-gray-100", text: "text-gray-800", label: "Lost" }
    };
    const badge = badges[status] || badges.not_recovered;
    return (
      <span className={`${badge.bg} ${badge.text} px-3 py-1 rounded-full text-xs font-semibold`}>
        {badge.label}
      </span>
    );
  };

  const filteredCarts = carts.filter(cart => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      cart.userEmail?.toLowerCase().includes(search) ||
      cart.userName?.toLowerCase().includes(search)
    );
  });

  const recoveryRate = stats ? ((stats.recovered / (stats.totalAbandoned + stats.recovered)) * 100).toFixed(1) : 0;

  return (
    <div className="p-4 md:p-6">
      <Toaster />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaShoppingCart className="text-orange-500" />
            Abandoned Carts
          </h1>
          <p className="text-gray-500 mt-1">Track and recover abandoned shopping carts</p>
        </div>
        <button
          onClick={runDetection}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2 font-medium transition-colors"
        >
          <FaFilter />
          Run Detection
        </button>
        <button
          onClick={sendBulkReminders}
          disabled={sendingBulk}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 font-medium transition-colors disabled:opacity-50"
        >
          <FaEnvelope />
          {sendingBulk ? "Sending..." : "Bulk Reminder"}
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white">
            <p className="text-red-100 text-sm font-medium">Not Recovered</p>
            <p className="text-2xl font-bold mt-1">{stats.totalAbandoned}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
            <p className="text-green-100 text-sm font-medium">Recovered</p>
            <p className="text-2xl font-bold mt-1">{stats.recovered}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl p-4 text-white">
            <p className="text-gray-200 text-sm font-medium">Lost</p>
            <p className="text-2xl font-bold mt-1">{stats.lost}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
            <p className="text-orange-100 text-sm font-medium">Potential Revenue</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(stats.potentialRevenue)}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <p className="text-blue-100 text-sm font-medium">Recovery Rate</p>
            <p className="text-2xl font-bold mt-1">{recoveryRate}%</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Time</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            <button
              onClick={() => { setActiveTab("active"); setPagination(p => ({ ...p, page: 1 })); }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "active" 
                  ? "bg-green-500 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Active Carts
            </button>
            <button
              onClick={() => { setActiveTab("abandoned"); setPagination(p => ({ ...p, page: 1 })); }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "abandoned" 
                  ? "bg-red-500 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Abandoned
            </button>
            <button
              onClick={() => { setActiveTab("not_recovered"); setPagination(p => ({ ...p, page: 1 })); }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "not_recovered" 
                  ? "bg-orange-500 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Not Recovered
            </button>
            <button
              onClick={() => { setActiveTab("recovered"); setPagination(p => ({ ...p, page: 1 })); }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "recovered" 
                  ? "bg-green-500 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Recovered
            </button>
            <button
              onClick={() => { setActiveTab("wishlist"); setPagination(p => ({ ...p, page: 1 })); }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "wishlist" 
                  ? "bg-blue-500 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Old Wishlist
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent w-64"
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading...</p>
          </div>
        ) : activeTab === "active" ? (
          <div className="overflow-x-auto">
            {filteredCarts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FaShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No active carts found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Products</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Added</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCarts.map((cart) => (
                    <tr key={cart._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{cart.userName || "Guest"}</p>
                        <p className="text-sm text-gray-500">{cart.userEmail || "No email"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {cart.image && (
                            <img src={cart.image} alt={cart.productTitle} className="w-10 h-10 rounded object-cover" />
                          )}
                          <div>
                            <p className="text-sm font-medium">{cart.productTitle || "Product"}</p>
                            <p className="text-xs text-gray-500">Qty: {cart.quantity || 1}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        {formatCurrency(cart.subTotal || cart.price)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(cart.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => viewCartDetails(cart)}
                          className="text-blue-500 hover:text-blue-700 p-1"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : activeTab === "wishlist" ? (
          <div className="p-4">
            {carts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FaShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No old wishlist items found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {carts.map((item) => (
                  <div key={item._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-800">{item.userName || "Unknown User"}</p>
                        <p className="text-sm text-gray-500">{item.userEmail}</p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        {item.itemCount} items
                      </span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {item.items?.slice(0, 4).map((prod, idx) => (
                        <div key={idx} className="flex-shrink-0">
                          <img 
                            src={prod.image} 
                            alt={prod.productTitle} 
                            className="w-16 h-16 rounded object-cover border border-gray-200" 
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Oldest: {formatDate(item.oldestItemDate)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            {filteredCarts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FaExclamationTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No abandoned carts found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Products</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Abandoned</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCarts.map((cart) => (
                    <tr key={cart._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{cart.userName || "Guest"}</p>
                        <p className="text-sm text-gray-500">{cart.userEmail}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex -space-x-2">
                          {cart.products?.slice(0, 3).map((prod, idx) => (
                            <img 
                              key={idx}
                              src={prod.image} 
                              alt={prod.productTitle} 
                              className="w-10 h-10 rounded object-cover border-2 border-white" 
                            />
                          ))}
                          {cart.products?.length > 3 && (
                            <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-500">
                              +{cart.products.length - 3}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {cart.products?.length} item(s)
                        </p>
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-800">
                        {formatCurrency(cart.totalAmount)}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(cart.status)}
                        {cart.reminderSent && (
                          <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                            <FaEnvelope /> Reminder sent
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(cart.abandonedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => viewCartDetails(cart)}
                            className="text-blue-500 hover:text-blue-700 p-1"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          {cart.status === "not_recovered" && (
                            <>
                              <button
                                onClick={() => sendReminder(cart._id)}
                                className="text-orange-500 hover:text-orange-700 p-1"
                                title="Send Reminder"
                              >
                                <FaEnvelope />
                              </button>
                              <button
                                onClick={() => markAsRecovered(cart._id)}
                                className="text-green-500 hover:text-green-700 p-1"
                                title="Mark Recovered"
                              >
                                <FaCheck />
                              </button>
                            </>
                          )}
                          {cart.status === "not_recovered" && (
                            <button
                              onClick={() => markAsLost(cart._id)}
                              className="text-gray-500 hover:text-gray-700 p-1"
                              title="Mark Lost"
                            >
                              <FaTimes />
                            </button>
                          )}
                          <button
                            onClick={() => deleteCart(cart._id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            
            {pagination.pages > 1 && (
              <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing {carts.length} of {pagination.total} results
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && selectedCart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="p-5 border-b flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold">Cart Details</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>
            
            <div className="p-5">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-800 mb-2">Customer Info</h3>
                <p><span className="text-gray-500">Name:</span> {selectedCart.userName || "Guest"}</p>
                <p><span className="text-gray-500">Email:</span> {selectedCart.userEmail || "N/A"}</p>
                <p><span className="text-gray-500">Status:</span> {getStatusBadge(selectedCart.status)}</p>
              </div>

              <h3 className="font-semibold text-gray-800 mb-3">Products</h3>
              <div className="space-y-3">
                {(selectedCart.products || [selectedCart]).map((prod, idx) => (
                  <div key={idx} className="flex items-center gap-4 border border-gray-200 rounded-lg p-3">
                    <img 
                      src={prod.image} 
                      alt={prod.productTitle} 
                      className="w-16 h-16 rounded object-cover" 
                    />
                    <div className="flex-1">
                      <p className="font-medium">{prod.productTitle || "Product"}</p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(prod.price)} x {prod.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatCurrency(prod.subTotal || prod.price * prod.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(selectedCart.totalAmount || selectedCart.subTotal)}</span>
              </div>

              {selectedCart.abandonedAt && (
                <div className="mt-4 text-sm text-gray-500">
                  <p>Abandoned: {formatDate(selectedCart.abandonedAt)}</p>
                  {selectedCart.reminderSent && (
                    <p>Reminder sent: {formatDate(selectedCart.reminderSentAt)}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AbandonedCarts;