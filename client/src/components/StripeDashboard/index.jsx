import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { 
  FaSearch, FaFilter, FaDownload, FaPlus, FaChartLine, 
  FaCheck, FaTimes, FaClock, FaUndo, FaCreditCard,
  FaArrowUp, FaArrowDown, FaExternalLinkAlt
} from 'react-icons/fa';

const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const VITE_STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

const stripePromise = VITE_STRIPE_PUBLISHABLE_KEY ? loadStripe(VITE_STRIPE_PUBLISHABLE_KEY) : null;

// Status badge component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    succeeded: { label: 'Succeeded', color: 'text-green-600', bgColor: 'bg-green-100', icon: <FaCheck className="text-xs" /> },
    refunded: { label: 'Refunded', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: <FaUndo className="text-xs" /> },
    partially_refunded: { label: 'Partial', color: 'text-purple-500', bgColor: 'bg-purple-50', icon: <FaUndo className="text-xs" /> },
    requires_payment_method: { label: 'Incomplete', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: <FaClock className="text-xs" /> },
    requires_confirmation: { label: 'Pending', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: <FaClock className="text-xs" /> },
    requires_action: { label: 'Action Required', color: 'text-orange-600', bgColor: 'bg-orange-100', icon: <FaExternalLinkAlt className="text-xs" /> },
    processing: { label: 'Processing', color: 'text-blue-500', bgColor: 'bg-blue-50', icon: <FaClock className="text-xs" /> },
    canceled: { label: 'Canceled', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: <FaTimes className="text-xs" /> },
    failed: { label: 'Failed', color: 'text-red-600', bgColor: 'bg-red-100', icon: <FaTimes className="text-xs" /> },
  };

  const config = statusConfig[status] || { label: status, color: 'text-gray-600', bgColor: 'bg-gray-100', icon: null };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color} ${config.bgColor}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

// Format currency
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
};

// Format date
const formatDate = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Stats Cards Component
const StatsCards = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
      <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue || 0)}</p>
      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
        <FaArrowUp className="text-xs" /> Last 30 days
      </p>
    </div>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <p className="text-sm text-gray-500 mb-1">Transactions</p>
      <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions || 0}</p>
      <p className="text-xs text-gray-500 mt-1">All time</p>
    </div>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <p className="text-sm text-gray-500 mb-1">Success Rate</p>
      <p className="text-2xl font-bold text-gray-900">{stats.successRate || 0}%</p>
      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
        <FaArrowUp className="text-xs" /> vs last period
      </p>
    </div>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <p className="text-sm text-gray-500 mb-1">Refund Rate</p>
      <p className="text-2xl font-bold text-gray-900">{stats.refundRate || 0}%</p>
      <p className="text-xs text-gray-500 mt-1">Of total revenue</p>
    </div>
  </div>
);

// Transaction Table Component
// Payment type is inferred from API response
const TransactionTable = ({ 
  payments, 
  loading, 
  onRefresh, 
  onCompletePayment,
  onCapture,
  onRefund,
  onViewDetails 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = !searchTerm || 
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-100 border-b"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 border-b border-gray-100 px-4 py-3">
              <div className="flex gap-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Table Header with Filters */}
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID, email, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="succeeded">Succeeded</option>
            <option value="requires_payment_method">Incomplete</option>
            <option value="requires_confirmation">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ref</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  No payments found. Try adjusting your filters.
                </td>
              </tr>
            ) : (
              filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {formatCurrency(payment.amount, payment.currency)}
                      </span>
                      {payment.refunded && (
                        <span className="text-xs text-purple-600">Refunded</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-600 capitalize">{payment.payment_method}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-600 truncate max-w-[150px] block">
                      {payment.description || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-600">{payment.customer_email || '-'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-500 text-sm">{formatDate(payment.created)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={payment.status} />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onViewDetails(payment)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-mono"
                    >
                      {payment.id.slice(-8)}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {payment.status === 'requires_payment_method' && (
                        <button
                          onClick={() => onCompletePayment(payment)}
                          className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                        >
                          Complete
                        </button>
                      )}
                      {payment.status === 'requires_confirmation' && !payment.captured && (
                        <button
                          onClick={() => onCapture(payment)}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Capture
                        </button>
                      )}
                      {payment.status === 'succeeded' && !payment.refunded && (
                        <button
                          onClick={() => onRefund(payment)}
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Refund
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Info */}
      <div className="px-4 py-3 border-t border-gray-200 text-sm text-gray-500">
        Showing {filteredPayments.length} payments
      </div>
    </div>
  );
};

// Payment Form Component for completing incomplete payments
const PaymentFormContent = ({ 
  clientSecret, 
  onSuccess, 
  onCancel 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      setError('Stripe not loaded. Please refresh and try again.');
      return;
    }

    setProcessing(true);
    setError(null);

    // Payment Element handles 3D Secure automatically!
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/order/success',
      },
      redirect: 'if_required', // Don't redirect if not needed
    });

    if (error) {
      setError(error.message || 'Payment failed');
      setProcessing(false);
    } else if (paymentIntent?.status === 'succeeded') {
      // ✅ Payment complete!
      onSuccess();
    } else if (paymentIntent?.status === 'processing') {
      // Processing - will succeed via webhook
      onSuccess();
    } else {
      setError(`Payment status: ${paymentIntent?.status}`);
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Payment Details
        </label>
        <div className="p-4 border border-gray-300 rounded-lg bg-white">
          <PaymentElement options={{
            layout: 'tabs',
          }} />
        </div>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {processing ? 'Processing...' : 'Pay Now'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

// Create Payment Modal
const CreatePaymentModal = ({ 
  open, 
  onClose, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    customerEmail: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${VITE_API_URL}/api/stripe-payments/create-payment`, {
        amount: parseFloat(formData.amount),
        currency: formData.currency.toLowerCase(),
        customerEmail: formData.customerEmail,
        description: formData.description,
      });

      if (response.data.success) {
        setClientSecret(response.data.clientSecret);
        setPaymentIntentId(response.data.paymentIntentId);
      } else {
        setError(response.data.error || 'Failed to create payment');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    onSuccess();
    handleClose();
  };

  const handleClose = () => {
    setFormData({ amount: '', currency: 'USD', customerEmail: '', description: '' });
    setClientSecret(null);
    setPaymentIntentId(null);
    setError(null);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {clientSecret ? 'Complete Payment' : 'Create Payment'}
          </h2>
        </div>

        <div className="p-6">
          {!clientSecret ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.50"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="INR">INR - Indian Rupee</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Email</label>
                <input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="customer@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Payment description"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Payment'}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentFormContent
                clientSecret={clientSecret}
                onSuccess={handlePaymentSuccess}
                onCancel={handleClose}
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
};

// Complete Payment Modal (for incomplete payments)
const CompletePaymentModal = ({
  open,
  payment,
  onClose,
  onSuccess
}) => {
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && payment) {
      fetchClientSecret();
    }
  }, [open, payment]);

  const fetchClientSecret = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${VITE_API_URL}/api/stripe-payments/payments/${payment?.id}`);
      if (response.data.data?.client_secret) {
        setClientSecret(response.data.data.client_secret);
      }
    } catch (err) {
      console.error('Error fetching client secret:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!open || !payment) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Complete Payment</h2>
          <p className="text-sm text-gray-500 mt-1">
            Amount: {formatCurrency(payment.amount, payment.currency)}
          </p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentFormContent
                clientSecret={clientSecret}
                onSuccess={onSuccess}
                onCancel={onClose}
              />
            </Elements>
          ) : (
            <p className="text-center text-gray-500">Unable to retrieve payment details</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Analyse Chart Component
const AnalyseChart = ({ data, open, onClose }) => {
  if (!open) return null;

  const maxAmount = Math.max(...(data?.chartData || []).map((d) => d.amount), 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Payment Analytics</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Daily Transaction Volume (Last 30 Days)</h3>
            <div className="h-64 flex items-end gap-1">
              {data?.chartData?.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                    style={{ height: `${maxAmount > 0 ? (day.amount / maxAmount) * 100 : 0}%` }}
                    title={`${day.date}: ${formatCurrency(day.amount)}`}
                  ></div>
                  <span className="text-[8px] text-gray-400 mt-1 transform -rotate-45 origin-left whitespace-nowrap">
                    {day.date.slice(5)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(data?.totalRevenue || 0)}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">Transactions</p>
              <p className="text-2xl font-bold text-blue-700">{data?.totalTransactions || 0}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-600">Success Rate</p>
              <p className="text-2xl font-bold text-purple-700">{data?.successRate || 0}%</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">Refund Rate</p>
              <p className="text-2xl font-bold text-red-700">{data?.refundRate || 0}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
export const StripeDashboard = () => {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, totalTransactions: 0, successRate: 0, refundRate: 0 });
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showAnalyseModal, setShowAnalyseModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${VITE_API_URL}/api/stripe-payments/payments?limit=50`);
      if (response.data.success) {
        setPayments(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${VITE_API_URL}/api/stripe-payments/analytics?days=30`);
      if (response.data.success) {
        setStats(response.data.data);
        setAnalyticsData(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchAnalytics();
  }, []);

  const handleCompletePayment = (payment) => {
    setSelectedPayment(payment);
    setShowCompleteModal(true);
  };

  const handleCapture = async (payment) => {
    try {
      await axios.post(`${VITE_API_URL}/api/stripe-payments/capture-payment`, {
        paymentIntentId: payment.id,
      });
      fetchPayments();
      fetchAnalytics();
    } catch (err) {
      console.error('Error capturing payment:', err);
    }
  };

  const handleRefund = async (payment) => {
    if (!confirm(`Refund ${formatCurrency(payment.amount, payment.currency)}?`)) return;
    
    try {
      await axios.post(`${VITE_API_URL}/api/stripe-payments/refund-payment`, {
        paymentIntentId: payment.id,
      });
      fetchPayments();
      fetchAnalytics();
    } catch (err) {
      console.error('Error refunding payment:', err);
    }
  };

  const handleViewDetails = (payment) => {
    alert(`Payment ID: ${payment.id}\nStatus: ${payment.status}\nAmount: ${formatCurrency(payment.amount, payment.currency)}\nCreated: ${formatDate(payment.created)}`);
  };

  const handlePaymentSuccess = () => {
    fetchPayments();
    fetchAnalytics();
    setShowCreateModal(false);
    setShowCompleteModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-500">Manage and track your Stripe payments</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAnalyseModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FaChartLine />
              Analyze
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaPlus />
              Create Payment
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Transaction Table */}
        <TransactionTable
          payments={payments}
          loading={loading}
          onRefresh={() => { fetchPayments(); fetchAnalytics(); }}
          onCompletePayment={handleCompletePayment}
          onCapture={handleCapture}
          onRefund={handleRefund}
          onViewDetails={handleViewDetails}
        />

        {/* Modals */}
        <CreatePaymentModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handlePaymentSuccess}
        />

        <CompletePaymentModal
          open={showCompleteModal}
          payment={selectedPayment}
          onClose={() => { setShowCompleteModal(false); setSelectedPayment(null); }}
          onSuccess={handlePaymentSuccess}
        />

        <AnalyseChart
          data={analyticsData}
          open={showAnalyseModal}
          onClose={() => setShowAnalyseModal(false)}
        />
      </div>
    </div>
  );
};

export default StripeDashboard;