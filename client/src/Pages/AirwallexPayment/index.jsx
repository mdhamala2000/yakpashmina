import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { init } from '@airwallex/components-sdk';
import { MyContext } from "../../App";
import { useContext } from "react";
import { FaSpinner, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import axios from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const AirwallexPayment = () => {
  const location = useLocation();
  const history = useNavigate();
  const context = useContext(MyContext);
  
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState('');
  
  const params = new URLSearchParams(location.search);
  const paymentIntentId = params.get('paymentIntentId');
  const clientSecret = params.get('clientSecret');
  const amount = params.get('amount');
  const currency = params.get('currency') || 'USD';

  useEffect(() => {
    if (!paymentIntentId || !clientSecret) {
      setError('Missing payment details');
      setLoading(false);
      return;
    }
    initAirwallex();
  }, []);

  const initAirwallex = async () => {
    try {
      await init({
        env: 'demo', // Use 'demo' for sandbox, 'prod' for production
        amount: parseFloat(amount),
        currency: currency,
        clientSecret: clientSecret,
        paymentIntentId: paymentIntentId,
        countryCode: 'US',
        merchantName: 'Mantra Handicrafts',
        showPaymentMethods: ['card'],
        redirect: {
          successUrl: `${window.location.origin}/payment/success?paymentIntentId=${paymentIntentId}`,
          failUrl: `${window.location.origin}/payment/fail?paymentIntentId=${paymentIntentId}`,
        },
      });
      
      // Check payment status after redirect
      checkPaymentStatus();
    } catch (err) {
      console.error('Airwallex init error:', err);
      setError(err.message || 'Failed to initialize payment');
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    try {
      const res = await axios.get(`${VITE_API_URL}/api/payment/status/${paymentIntentId}`);
      
      if (res.data?.data?.status === 'succeeded' || res.data?.data?.status === 'Captured') {
        setStatus('success');
        // Update order status on server
        await axios.post(`${VITE_API_URL}/api/order/update-payment-status`, {
          paymentIntentId: paymentIntentId,
          payment_status: 'PAID'
        });
      } else if (res.data?.data?.status === 'failed') {
        setStatus('failed');
      } else {
        // Check again after 2 seconds
        setTimeout(checkPaymentStatus, 2000);
      }
    } catch (err) {
      console.error('Status check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setError('');
    initAirwallex();
  };

  const handleGoHome = () => {
    history('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Processing Payment...</h2>
          <p className="text-gray-500 mt-2">Please wait while we process your payment</p>
          <p className="text-gray-400 text-sm mt-1">{currency} {amount}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <FaTimesCircle className="text-5xl text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Payment Failed</h2>
          <p className="text-gray-500 mt-2">{error}</p>
          <div className="flex gap-3 mt-6 justify-center">
            <button 
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
            <button 
              onClick={handleGoHome}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800">Payment Successful!</h2>
        <p className="text-gray-500 mt-2">Your payment of {currency} {amount} has been processed.</p>
        <p className="text-gray-400 text-sm mt-1">Payment ID: {paymentIntentId}</p>
        <button 
          onClick={handleGoHome}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default AirwallexPayment;