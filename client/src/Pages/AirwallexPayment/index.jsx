import { useEffect, useState, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MyContext } from '../../App';
import { postData, deleteData, fetchDataFromApi } from '../../utils/api';
import { FaShieldAlt, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const AirwallexPayment = () => {
  const [searchParams] = useSearchParams();
  const context = useContext(MyContext);
  const history = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        let intentId = searchParams.get('intent_id') || searchParams.get('payment_intent_id') || searchParams.get('id');
        if (!intentId) {
          const hash = window.location.hash;
          if (hash) {
            const hashParams = new URLSearchParams(hash.replace('#', '?'));
            intentId = hashParams.get('intent_id') || hashParams.get('payment_intent_id') || hashParams.get('id');
          }
        }
        if (!intentId) {
          intentId = sessionStorage.getItem('airwallex_intent_id');
          if (intentId) sessionStorage.removeItem('airwallex_intent_id');
        }
        const rawStatus = searchParams.get('status');

        if (!intentId) {
          setStatus('failed');
          setMessage('No payment reference found.');
          return;
        }

        const intentRes = await fetchDataFromApi(`/api/airwallex/intent/${intentId}`);
        const intentStatus = intentRes?.data?.status || rawStatus || '';

        if (intentStatus === 'SUCCEEDED' || intentStatus === 'APPROVED') {
          const orderData = sessionStorage.getItem('airwallex_order_data');
          if (!orderData) {
            setStatus('failed');
            setMessage('Session expired. Please try again.');
            return;
          }
          const parsed = JSON.parse(orderData);
          const payLoad = {
            userId: parsed.userId,
            products: parsed.products,
            payment_method: 'airwallex',
            paymentId: intentId,
            payment_status: 'PAID',
            delivery_address: parsed.delivery_address,
            totalAmt: parsed.totalAmt,
            subTotal: parsed.subTotal,
            shippingCost: parsed.shippingCost,
            discountCode: parsed.discountCode || null,
            discountAmount: parsed.discountAmount || 0,
            currency: parsed.currency || 'USD',
            currencyRate: parsed.currencyRate || 1
          };
          const res = await postData('/api/order/create', payLoad);
          if (res?.success) {
            if (parsed.discountCode) {
              await postData('/api/discountCode/apply', { code: parsed.discountCode });
            }
            await deleteData(`/api/cart/emptyCart/${parsed.userId}`);
            context?.getCartItems();
            localStorage.removeItem('appliedDiscount');
            sessionStorage.removeItem('airwallex_order_data');
            setStatus('success');
            setMessage('Payment successful! Redirecting...');
            setTimeout(() => history('/order/success'), 1500);
          } else {
            setStatus('failed');
            setMessage(res?.message || 'Failed to create order');
          }
        } else if (intentStatus === 'CANCELLED' || rawStatus === 'cancelled') {
          setStatus('failed');
          setMessage('Payment was cancelled.');
          sessionStorage.removeItem('airwallex_order_data');
          setTimeout(() => history('/checkout'), 2000);
        } else {
          setStatus('failed');
          setMessage('Payment verification failed. Please try again.');
          setTimeout(() => history('/checkout'), 2000);
        }
      } catch (error) {
        console.error('Airwallex verification error:', error);
        setStatus('failed');
        setMessage('An error occurred while verifying your payment.');
      }
    };
    verifyPayment();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-md w-full text-center">
        <div className="mb-6">
          {status === 'verifying' && (
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
              <FaSpinner className="text-blue-600 text-2xl animate-spin" />
            </div>
          )}
          {status === 'success' && (
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
              <FaCheckCircle className="text-emerald-500 text-2xl" />
            </div>
          )}
          {status === 'failed' && (
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <FaTimesCircle className="text-red-500 text-2xl" />
            </div>
          )}
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          {status === 'verifying' ? 'Verifying Payment' : status === 'success' ? 'Payment Successful!' : 'Payment Failed'}
        </h2>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400">
          <FaShieldAlt className="text-emerald-500" />
          <span>Secured by Airwallex</span>
        </div>
        {(status === 'failed' || status === 'success') && (
          <button
            onClick={() => history(status === 'success' ? '/order/success' : '/checkout')}
            className="mt-6 w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all"
          >
            {status === 'success' ? 'View Order' : 'Back to Checkout'}
          </button>
        )}
      </div>
    </div>
  );
};

export default AirwallexPayment;
