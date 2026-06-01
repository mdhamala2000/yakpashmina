import React, { useContext, useEffect, useState, useRef } from "react";
import { Button } from "@mui/material";
import { BsFillBagCheckFill, BsShieldCheck, BsCreditCard, BsPaypal } from "react-icons/bs";
import { FaLock, FaShippingFast, FaCreditCard, FaCheckCircle, FaChevronDown, FaChevronUp, FaUniversity, FaWallet } from "react-icons/fa";
import { MyContext } from '../../App';
import Radio from '@mui/material/Radio';
import { fetchDataFromApi, postData, deleteData, editData } from "../../utils/api";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import CircularProgress from '@mui/material/CircularProgress';
import { useCurrency } from "../../context/CurrencyContext";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
const VITE_APP_PAYPAL_CLIENT_ID = import.meta.env.VITE_APP_PAYPAL_CLIENT_ID;
const VITE_API_URL = import.meta.env.VITE_API_URL;

let stripePromise = null;
const getStripe = (key) => {
  if (!stripePromise && key) {
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1a1a1a',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      '::placeholder': { color: '#a1a1a1' }
    },
    invalid: { color: '#ef4444' }
  }
};

const StripeCardForm = ({ onError, onComplete, selectedAddressData, onPaymentMethodReady }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardholderName, setCardholderName] = useState('');

  const countryNameToCode = (name) => {
    if (!name) return '';
    const codes = {
      'nepal': 'NP', 'india': 'IN', 'united states': 'US', 'usa': 'US', 'united states of america': 'US',
      'united kingdom': 'GB', 'uk': 'GB', 'great britain': 'GB', 'britain': 'GB',
      'australia': 'AU', 'canada': 'CA', 'germany': 'DE', 'france': 'FR',
      'japan': 'JP', 'china': 'CN', 'brazil': 'BR', 'south korea': 'KR', 'korea': 'KR',
      'spain': 'ES', 'italy': 'IT', 'netherlands': 'NL', 'belgium': 'BE',
      'switzerland': 'CH', 'austria': 'AT', 'sweden': 'SE', 'norway': 'NO',
      'denmark': 'DK', 'finland': 'FI', 'poland': 'PL', 'portugal': 'PT',
      'ireland': 'IE', 'czech republic': 'CZ', 'czechia': 'CZ', 'hungary': 'HU', 'romania': 'RO',
      'greece': 'GR', 'bulgaria': 'BG', 'croatia': 'HR', 'slovakia': 'SK',
      'slovenia': 'SI', 'luxembourg': 'LU', 'iceland': 'IS', 'estonia': 'EE',
      'latvia': 'LV', 'lithuania': 'LT', 'malta': 'MT', 'cyprus': 'CY',
      'united arab emirates': 'AE', 'uae': 'AE', 'saudi arabia': 'SA',
      'qatar': 'QA', 'kuwait': 'KW', 'oman': 'OM', 'bahrain': 'BH',
      'singapore': 'SG', 'malaysia': 'MY', 'thailand': 'TH', 'vietnam': 'VN',
      'philippines': 'PH', 'indonesia': 'ID', 'pakistan': 'PK', 'bangladesh': 'BD',
      'sri lanka': 'LK', 'hong kong': 'HK', 'hk': 'HK', 'taiwan': 'TW', 'new zealand': 'NZ',
      'mexico': 'MX', 'south africa': 'ZA', 'egypt': 'EG', 'nigeria': 'NG',
      'kenya': 'KE', 'morocco': 'MA', 'ghana': 'GH', 'turkey': 'TR',
      'russia': 'RU', 'ukraine': 'UA', 'israel': 'IL', 'jordan': 'LO',
      'lebanon': 'LB', 'iraq': 'IQ', 'iran': 'IR', 'syria': 'SY',
      'argentina': 'AR', 'chile': 'CL', 'colombia': 'CO', 'peru': 'PE',
      'venezuela': 'VE', 'ecuador': 'EC', 'uruguay': 'UY', 'paraguay': 'PY', 'bolivia': 'BO',
      'cameroon': 'CM', 'ethiopia': 'ET', 'tanzania': 'TZ', 'tunisia': 'TN', 'algeria': 'DZ',
      'zimbabwe': 'ZW', 'zambia': 'ZM', 'uganda': 'UG', 'senegal': 'SN',
      'macau': 'MO', 'macao': 'MO'
    };
    return codes[name.toLowerCase().trim()] || name.toUpperCase().substring(0, 2);
  };

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    setProcessing(true);
    onError('');

    const cardElement = elements.getElement(CardElement);

    if (!cardholderName.trim()) {
      onError('Please enter cardholder name');
      setProcessing(false);
      return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: {
        name: cardholderName,
        address: {
          line1: selectedAddressData?.address_line1 || '',
          city: selectedAddressData?.city || '',
          state: selectedAddressData?.state || '',
          postal_code: selectedAddressData?.pincode || '',
          country: countryNameToCode(selectedAddressData?.country) || ''
        }
      }
    });

    if (error) {
      onError(error.message);
      setProcessing(false);
    } else {
      onComplete(true);
      if (onPaymentMethodReady) onPaymentMethodReady(paymentMethod.id);
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-2.5 lg:space-y-3">
      <input
        type="text"
        placeholder="Cardholder Name"
        value={cardholderName}
        onChange={(e) => setCardholderName(e.target.value)}
        className="w-full p-2.5 lg:p-3 border border-gray-200 rounded-lg text-xs lg:text-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none"
      />
      <CardElement options={cardElementOptions} onChange={(e) => {
        if (e.error) onError(e.error.message);
        else onError('');
        onComplete(e.complete);
      }} />
      <button
        onClick={handleSubmit}
        disabled={!stripe || processing}
        className="w-full bg-slate-800 text-white py-2 lg:py-2.5 rounded-lg font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors text-xs lg:text-sm flex items-center justify-center gap-2"
      >
        {processing ? <CircularProgress size={18} color="inherit" /> : <FaLock />}
        {processing ? 'Processing...' : 'Validate Card'}
      </button>
    </div>
  );
};

const Checkout = () => {
  const [userData, setUserData] = useState(null);
  const [isChecked, setIsChecked] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedAddressData, setSelectedAddressData] = useState(null);
  const [totalAmountUSD, setTotalAmountUSD] = useState(0);
  const [isLoading, setIsloading] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountCodeInput, setDiscountCodeInput] = useState("");
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountError, setDiscountError] = useState("");
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingInfo, setShippingInfo] = useState(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('stripe');
  const [activeStep, setActiveStep] = useState(0);
  const [showPayPalMessage, setShowPayPalMessage] = useState(false);
  const [paymentGateways, setPaymentGateways] = useState([]);
  const [bankDepositInstructions, setBankDepositInstructions] = useState("");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [stripeElements, setStripeElements] = useState(null);
  const [stripeCard, setStripeCard] = useState(null);
  const [stripeConfig, setStripeConfig] = useState({ publishableKey: '' });
  const [paypalConfig, setPaypalConfig] = useState({ clientId: '' });
  const [cardError, setCardError] = useState('');
  const [cardComplete, setCardComplete] = useState(false);
  const [paymentMethodId, setPaymentMethodId] = useState(null);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paypalError, setPaypalError] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);
  const paypalClientId = "AQ3Qb-BP7ilZ3b1Kvdh34A1LbsZngYcrdnQKVSwNrofa55buPRA0aa8UDS9CACKybQ48vaPNczgzmz5T";
  const paypalRef = useRef(null);
  const [addressForm, setAddressForm] = useState({
    address_line1: '', city: '', state: '', pincode: '', country: '', mobile: '', addressType: 'Home', landmark: ''
  });

  const context = useContext(MyContext);
  const { convertPrice, currency, CURRENCIES, exchangeRates } = useCurrency();
  const history = useNavigate();

  const steps = ['Address', 'Payment', 'Confirm'];

  const displayPrice = (priceUSD) => {
    if (!priceUSD || isNaN(priceUSD)) return `${CURRENCIES[currency]?.symbol || '$'}0.00`;
    const converted = convertPrice(priceUSD);
    return `${CURRENCIES[currency]?.symbol || '$'}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const fetchPaymentGateways = async () => {
    try {
      const res = await fetchDataFromApi("/api/payment-gateway");
      if (res && res.data && Array.isArray(res.data)) {
        const activeGateways = res.data.filter(g => g.isActive);
        if (activeGateways.length > 0) {
          setPaymentGateways(activeGateways);
          
          // Check for Stripe and fetch config
          const stripeGateway = activeGateways.find(g => g.gatewayType === 'stripe');
          if (stripeGateway) {
            try {
              const stripeRes = await fetchDataFromApi("/api/stripe/public-config");
              if (stripeRes && stripeRes.publishableKey) {
                setStripeConfig({ publishableKey: stripeRes.publishableKey });
              }
            } catch (e) {
              console.error("Error fetching Stripe config:", e);
            }
          }
          
          const bankGateway = activeGateways.find(g => g.gatewayType === 'bank_deposit');
          if (bankGateway && bankGateway.instructions) {
            setBankDepositInstructions(bankGateway.instructions);
          }

          // Check for PayPal and fetch config
          const paypalGateway = activeGateways.find(g => g.gatewayType === 'paypal');
          if (paypalGateway && paypalGateway.isActive) {
            try {
              const paypalRes = await fetchDataFromApi("/api/stripe/paypal-config");
              if (paypalRes && paypalRes.clientId) {
                setPaypalConfig({ clientId: paypalRes.clientId });
              }
            } catch (e) {
              console.error("Error fetching PayPal config:", e);
            }
          }
          return;
        }
      }
    } catch (error) {
      console.error("Error fetching payment gateways:", error);
    }
    
    setPaymentGateways([
      { _id: "default-stripe", gatewayType: "stripe", isActive: true },
      { _id: "default-paypal", gatewayType: "paypal", isActive: true },
      { _id: "default-bank_deposit", gatewayType: "bank_deposit", isActive: true },
      { _id: "default-airwallex", gatewayType: "airwallex", isActive: true }
    ]);
  };

  const handleBankDeposit = async () => {
    if (!context?.cartData || context.cartData.length === 0) { context.alertBox('error', 'Your cart is empty!'); return; }
    if (!userData || userData?.address_details?.length === 0) { context.alertBox("error", "Please add address"); return; }
    if (!selectedAddress) { context.alertBox("error", "Please select address"); return; }
    setIsloading(true);
    try {
      const finalTotalUSD = calculateFinalTotal();
      const selectedCurrency = currency || 'USD';
      const rate = exchangeRates[selectedCurrency] || 1;
      const productsInCurrency = context?.cartData?.map(item => ({ ...item }));
      const payLoad = { userId: userData._id, products: productsInCurrency, payment_method: "bank_deposit", delivery_address: selectedAddressData, totalAmt: parseFloat(finalTotalUSD), subTotal: parseFloat(totalAmountUSD), shippingCost: parseFloat(shippingCost), discountCode: appliedDiscount?.code || null, discountAmount: parseFloat(calculateDiscountAmount()), currency: selectedCurrency, currencyRate: rate };
      const res = await postData("/api/order/create", payLoad);
      if (res?.success) {
        if (appliedDiscount) await postData("/api/discountCode/apply", { code: appliedDiscount.code });
        await deleteData(`/api/cart/emptyCart/${userData._id}`);
        context?.getCartItems();
        localStorage.removeItem('appliedDiscount');
        context.alertBox("success", "Order placed! Please transfer payment to bank details provided.");
        history("/order/success");
      } else { context.alertBox("error", res?.message); setIsloading(false); }
    } catch (error) { context.alertBox("error", "Error"); setIsloading(false); }
  };

  const handleStripePayment = async () => {
    if (!context?.cartData || context.cartData.length === 0) { context.alertBox('error', 'Your cart is empty!'); return; }
    if (!userData || userData?.address_details?.length === 0) { context.alertBox("error", "Please add address"); return; }
    if (!selectedAddress) { context.alertBox("error", "Please select address"); return; }
    if (!cardComplete) { context.alertBox("error", "Please validate card details first"); return; }
    if (!paymentMethodId) { context.alertBox("error", "Please validate card details first"); return; }
    
    setProcessingPayment(true);
    setIsloading(true);
    
    try {
      const finalTotalUSD = calculateFinalTotal();
      const selectedCurrency = currency || 'USD';
      const rate = exchangeRates[selectedCurrency] || 1;
      const finalTotalConverted = convertPrice(finalTotalUSD);
      
      // Create payment intent in selected currency
      const intentRes = await axios.post(`${VITE_API_URL}/api/stripe/create-payment-intent`, {
        amount: parseFloat(finalTotalConverted),
        currency: selectedCurrency.toLowerCase()
      }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
        withCredentials: true
      });
      
      if (!intentRes.data?.success) {
        context.alertBox("error", "Failed to initiate payment. Please try again.");
        setProcessingPayment(false);
        setIsloading(false);
        return;
      }
      
      const clientSecret = intentRes.data.clientSecret;
      const paymentIntentId = intentRes.data.paymentIntentId;
      
      // Confirm the card payment - this actually charges the card
      const stripe = await getStripe(stripeConfig.publishableKey);
      if (!stripe) {
        context.alertBox("error", "Stripe not initialized. Please refresh.");
        setProcessingPayment(false);
        setIsloading(false);
        return;
      }
      
      const { error: confirmError, paymentIntent: confirmedIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethodId
      });
      
      if (confirmError) {
        context.alertBox("error", confirmError.message || "Payment failed. Please try again.");
        setProcessingPayment(false);
        setIsloading(false);
        return;
      }
      
      if (confirmedIntent.status !== 'succeeded' && confirmedIntent.status !== 'processing') {
        context.alertBox("error", `Payment ${confirmedIntent.status}. Please try again.`);
        setProcessingPayment(false);
        setIsloading(false);
        return;
      }
      
      // Payment confirmed - create order (send USD amounts + selected currency + rate)
      const productsInCurrency = context?.cartData?.map(item => ({ ...item }));
      
      const payLoad = { 
        userId: userData._id, 
        products: productsInCurrency, 
        payment_method: "stripe",
        paymentId: paymentIntentId,
        payment_status: "PAID",
        delivery_address: selectedAddressData, 
        totalAmt: parseFloat(finalTotalUSD),
        subTotal: parseFloat(totalAmountUSD), 
        shippingCost: parseFloat(shippingCost), 
        discountCode: appliedDiscount?.code || null, 
        discountAmount: parseFloat(calculateDiscountAmount()), 
        currency: selectedCurrency,
        currencyRate: rate
      };
      
      const res = await postData("/api/order/create", payLoad);
      if (res?.success) {
        if (appliedDiscount) await postData("/api/discountCode/apply", { code: appliedDiscount.code });
        await deleteData(`/api/cart/emptyCart/${userData._id}`);
        context?.getCartItems();
        localStorage.removeItem('appliedDiscount');
        context.alertBox("success", "Payment successful! Order placed.");
        history("/order/success");
      } else { 
        context.alertBox("error", res?.message || "Failed to create order"); 
        setProcessingPayment(false);
        setIsloading(false);
      }
    } catch (error) {
      console.error("Stripe payment error:", error);
      context.alertBox("error", error.response?.data?.message || error.message || "Payment failed. Please try again.");
      setProcessingPayment(false);
      setIsloading(false);
    }
  };

  const handleAirwallexPayment = async () => {
    if (!context?.cartData || context.cartData.length === 0) { context.alertBox('error', 'Your cart is empty!'); return; }
    if (!userData || userData?.address_details?.length === 0) { context.alertBox("error", "Please add address"); return; }
    if (!selectedAddress) { context.alertBox("error", "Please select address"); return; }
    setProcessingPayment(true);
    try {
      const finalTotalUSD = calculateFinalTotal();
      const selectedCurrency = currency || 'USD';
      const rate = exchangeRates[selectedCurrency] || 1;
      const finalTotalConverted = convertPrice(finalTotalUSD);
      const res = await postData('/api/airwallex/create-intent', {
        amount: parseFloat(finalTotalConverted),
        currency: selectedCurrency
      });
      if (!res?.success) {
        context.alertBox("error", res?.message || "Failed to initiate Airwallex payment.");
        setProcessingPayment(false);
        return;
      }
      const { intentId, clientSecret } = res.data;
      if (!intentId || !clientSecret) {
        context.alertBox("error", "Airwallex configuration error. Please try again.");
        setProcessingPayment(false);
        return;
      }
      const successUrl = `${window.location.origin}/order/airwallex-return`;
      const env = 'demo';
      const orderPayload = {
        userId: userData._id,
        products: context?.cartData?.map(item => ({ ...item })),
        delivery_address: selectedAddressData,
        totalAmt: parseFloat(finalTotalUSD),
        subTotal: parseFloat(totalAmountUSD),
        shippingCost: parseFloat(shippingCost),
        discountCode: appliedDiscount?.code || null,
        discountAmount: parseFloat(calculateDiscountAmount()),
        currency: selectedCurrency,
        currencyRate: rate
      };
      const cancelUrl = `${window.location.origin}/checkout`;
      sessionStorage.setItem('airwallex_order_data', JSON.stringify(orderPayload));
      sessionStorage.setItem('airwallex_intent_id', intentId);
      const doRedirect = async () => {
        const { payments } = await window.AirwallexComponentsSDK.init({
          env,
          enabledElements: ['payments']
        });
        payments.redirectToCheckout({
          intent_id: intentId,
          client_secret: clientSecret,
          currency: selectedCurrency,
          successUrl,
          cancelUrl
        });
      };
      if (window.AirwallexComponentsSDK) {
        doRedirect();
      } else {
        const script = document.createElement('script');
        script.src = 'https://static.airwallex.com/components/sdk/v1/index.js';
        script.async = true;
        script.onload = doRedirect;
        script.onerror = () => {
          context.alertBox("error", "Failed to load Airwallex SDK. Please try again.");
          setProcessingPayment(false);
        };
        document.head.appendChild(script);
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Failed to initiate Airwallex payment.";
      context.alertBox("error", msg);
      setProcessingPayment(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchPaymentGateways();
    
    const timer = setTimeout(() => {
      if (!context?.cartData || context.cartData.length === 0) {
        context?.alertBox('error', 'Your cart is empty! Please add some products.');
        history('/products');
        return;
      }
      setUserData(context?.userData);
      if (context?.userData?.address_details?.[0]) {
        setSelectedAddress(context.userData.address_details[0]._id);
        setSelectedAddressData(context.userData.address_details[0]);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const cartItems = context?.cartData || [];
      const totalInUSD = cartItems.length !== 0 ?
        cartItems?.map(item => parseFloat(item.price) * (item.quantity || 1)).reduce((total, value) => total + value, 0) : 0;
      setTotalAmountUSD(totalInUSD);
    }, 100);
    return () => clearTimeout(timer);
  }, [context?.cartData, currency]);

  useEffect(() => {
    if (!context?.cartData) return;
    const savedDiscount = localStorage.getItem('appliedDiscount');
    if (savedDiscount) {
      try {
        setAppliedDiscount(JSON.parse(savedDiscount));
      } catch (e) {
        localStorage.removeItem('appliedDiscount');
      }
    }
  }, [context?.cartData]);

  const calculateDiscountAmount = () => {
    if (!appliedDiscount) return 0;
    if (appliedDiscount.discountType === 'percentage') {
      return (totalAmountUSD * appliedDiscount.discountValue) / 100;
    }
    return appliedDiscount.discountAmount || 0;
  };

  const calculateFinalTotal = () => {
    return Math.max(0, totalAmountUSD + shippingCost - calculateDiscountAmount());
  };

  const fetchShippingCost = async (countryCode) => {
    setLoadingShipping(true);
    setShippingCost(0);
    setShippingInfo(null);
    try {
      const res = await fetchDataFromApi(`/api/shippingRate/lookup/country?countryCode=${countryCode}`);
      
      if (res?.success && res?.data) {
        const rate = res.data;
        const rateValue = parseFloat(rate.flatRate) || 0;
        
        if (rate.pricingType === 'free') {
          if (!rate.freeShippingThreshold || totalAmountUSD >= rate.freeShippingThreshold) {
            setShippingCost(0);
            setShippingInfo({ type: 'free', label: 'FREE Shipping' });
          } else {
            setShippingCost(rateValue);
            setShippingInfo({ type: 'flat', label: `${rate.currency || 'USD'} ${rateValue}`, delivery: rate.estimatedDeliveryDays });
          }
        } else {
          if (rateValue > 0) {
            setShippingCost(rateValue);
            setShippingInfo({ type: 'flat', label: `${rate.currency || 'USD'} ${rateValue}`, delivery: rate.estimatedDeliveryDays });
          } else {
            setShippingCost(0);
            setShippingInfo({ type: 'free', label: 'FREE Shipping' });
          }
        }
      } else {
        setDefaultShipping();
      }
    } catch (error) {
      console.error('Shipping fetch error:', error);
      setDefaultShipping();
    } finally {
      setLoadingShipping(false);
    }
  };

  const setDefaultShipping = () => {
    let defaultShipping = 0;
    if (totalAmountUSD < 50) defaultShipping = 15;
    else if (totalAmountUSD < 100) defaultShipping = 10;
    else if (totalAmountUSD < 200) defaultShipping = 5;
    setShippingCost(defaultShipping);
    setShippingInfo({ type: 'flat', label: `USD ${defaultShipping}`, delivery: '5-7 business days' });
  };

  useEffect(() => {
    if (selectedAddressData?.country) {
      const countryInput = selectedAddressData.country.toLowerCase().trim();
      const codes = {
        'nepal': 'NP', 'india': 'IN', 'united states': 'US', 'united states of america': 'US', 'usa': 'US',
        'united kingdom': 'GB', 'uk': 'GB', 'great britain': 'GB', 'britain': 'GB',
        'australia': 'AU', 'canada': 'CA', 'germany': 'DE', 'france': 'FR',
        'japan': 'JP', 'china': 'CN', 'brazil': 'BR', 'south korea': 'KR', 'korea': 'KR',
        'spain': 'ES', 'italy': 'IT', 'netherlands': 'NL', 'belgium': 'BE',
        'switzerland': 'CH', 'austria': 'AT', 'sweden': 'SE', 'norway': 'NO',
        'denmark': 'DK', 'finland': 'FI', 'poland': 'PL', 'portugal': 'PT',
        'ireland': 'IE', 'czech republic': 'CZ', 'czechia': 'CZ', 'hungary': 'HU', 'romania': 'RO',
        'greece': 'GR', 'bulgaria': 'BG', 'croatia': 'HR', 'slovakia': 'SK',
        'slovenia': 'SI', 'luxembourg': 'LU', 'iceland': 'IS', 'estonia': 'EE',
        'latvia': 'LV', 'lithuania': 'LT', 'malta': 'MT', 'cyprus': 'CY',
        'united arab emirates': 'AE', 'uae': 'AE', 'saudi arabia': 'SA',
        'qatar': 'QA', 'kuwait': 'KW', 'oman': 'OM', 'bahrain': 'BH',
        'singapore': 'SG', 'malaysia': 'MY', 'thailand': 'TH', 'vietnam': 'VN',
        'philippines': 'PH', 'indonesia': 'ID', 'pakistan': 'PK', 'bangladesh': 'BD',
        'sri lanka': 'LK', 'hong kong': 'HK', 'hk': 'HK', 'taiwan': 'TW', 'new zealand': 'NZ',
        'mexico': 'MX', 'south africa': 'ZA', 'egypt': 'EG', 'nigeria': 'NG',
        'kenya': 'KE', 'morocco': 'MA', 'ghana': 'GH', 'turkey': 'TR',
        'russia': 'RU', 'ukraine': 'UA', 'israel': 'IL', 'jordan': 'JO',
        'lebanon': 'LB', 'iraq': 'IQ', 'iran': 'IR', 'syria': 'SY',
        'argentina': 'AR', 'chile': 'CL', 'colombia': 'CO', 'peru': 'PE',
        'venezuela': 'VE', 'ecuador': 'EC', 'uruguay': 'UY', 'paraguay': 'PY', 'bolivia': 'BO',
        'cameroon': 'CM', 'ethiopia': 'ET', 'tanzania': 'TZ', 'tunisia': 'TN', 'algeria': 'DZ',
        'zimbabwe': 'ZW', 'zambia': 'ZM', 'uganda': 'UG', 'senegal': 'SN',
        'macau': 'MO', 'macao': 'MO'
      };
      
      const countryCode = codes[countryInput] || codes[selectedAddressData.country];
      
      if (countryCode) {
        fetchShippingCost(countryCode);
      } else {
        setDefaultShipping();
        setShippingInfo({ type: 'flat', label: `Standard Shipping`, delivery: '5-7 business days' });
      }
    }
  }, [selectedAddress, totalAmountUSD]);

  useEffect(() => {
    // PayPal SDK is loaded via PayPalScriptProvider, no need for manual loading
    return;
  }, []);

  // Removed - using PayPalButtons component instead
  // const renderPayPalButton = () => { ... }

  const handlePayPalSuccess = async (data) => {
    setIsloading(true);
    try {
      const finalTotalUSD = calculateFinalTotal();
      const selectedCurrency = currency || 'USD';
      const rate = exchangeRates[selectedCurrency] || 1;
      const productsInCurrency = context?.cartData?.map(item => ({ ...item }));
      const payLoad = {
        userId: context?.userData?._id, products: productsInCurrency, paymentId: data.orderID,
        payment_status: "COMPLETE", delivery_address: selectedAddressData,
        totalAmt: parseFloat(finalTotalUSD),
        subTotal: parseFloat(totalAmountUSD),
        shippingCost: parseFloat(shippingCost),
        discountCode: appliedDiscount?.code || null,
        discountAmount: parseFloat(calculateDiscountAmount()),
        currency: selectedCurrency,
        currencyRate: rate,
        date: new Date().toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric" })
      };
      const res = await axios.post(`${VITE_API_URL}/api/order/capture-order-paypal`, payLoad, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, 'Content-Type': 'application/json' }
      });
      if (res?.data?.success !== false) {
        if (appliedDiscount) await postData("/api/discountCode/apply", { code: appliedDiscount.code });
        await deleteData(`/api/cart/emptyCart/${context?.userData?._id}`);
        context?.getCartItems();
        localStorage.removeItem('appliedDiscount');
        context.alertBox("success", "Payment successful!");
        history("/order/success");
      }
    } catch (error) {
      console.error("PayPal capture error:", error);
      context.alertBox("error", "Payment processing failed");
    } finally {
      setIsloading(false);
    }
  };

  const handleChange = (e, index, address) => {
    setIsChecked(index);
    setSelectedAddress(address._id);
    setSelectedAddressData(address);
  };

  const editAddress = (id) => {
    context?.setOpenAddressPanel(true);
    context?.setAddressMode("edit");
    context?.setEditAddressId(id);
  };

  const handleApplyDiscountCode = async () => {
    if (!discountCodeInput.trim()) { setDiscountError("Please enter a discount code"); return; }
    setDiscountLoading(true);
    setDiscountError("");
    try {
      const res = await postData("/api/discountCode/validate", { code: discountCodeInput, cartTotal: totalAmountUSD, cartItems: context.cartData });
      if (res?.success === false) {
        setDiscountError(res?.message || "Invalid discount code");
        setAppliedDiscount(null);
        localStorage.removeItem('appliedDiscount');
      } else {
        setAppliedDiscount(res?.data);
        setDiscountCodeInput("");
        localStorage.setItem('appliedDiscount', JSON.stringify(res?.data));
      }
    } catch (error) {
      setDiscountError("Failed to apply discount code");
    }
    setDiscountLoading(false);
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    localStorage.removeItem('appliedDiscount');
  };

  const countryCodes = {
    'Nepal': 'NP', 'India': 'IN', 'United States': 'US', 'United Kingdom': 'GB',
    'Australia': 'AU', 'Canada': 'CA', 'Germany': 'DE', 'France': 'FR',
    'Japan': 'JP', 'China': 'CN', 'South Korea': 'KR', 'Singapore': 'SG',
    'Malaysia': 'MY', 'Thailand': 'TH', 'Vietnam': 'VN', 'Philippines': 'PH',
    'Indonesia': 'ID', 'Pakistan': 'PK', 'Bangladesh': 'BD', 'Sri Lanka': 'LK',
    'Hong Kong': 'HK', 'Taiwan': 'TW', 'New Zealand': 'NZ', 'Mexico': 'MX',
    'South Africa': 'ZA', 'Egypt': 'EG', 'Nigeria': 'NG', 'Kenya': 'KE',
    'Morocco': 'MA', 'Ghana': 'GH', 'Turkey': 'TR', 'UAE': 'AE',
    'Saudi Arabia': 'SA', 'Qatar': 'QA', 'Kuwait': 'KW', 'Oman': 'OM',
    'Bahrain': 'BH', 'Russia': 'RU', 'Ukraine': 'UA'
  };

  const handlePaymentMethodChange = (method) => {
    setSelectedPaymentMethod(method);
    setCardComplete(false);
    setCardError('');
    setPaymentMethodId(null);
  };

  const handlePlaceOrder = () => {
    if (!context?.cartData || context.cartData.length === 0) { context.alertBox('error', 'Your cart is empty!'); return; }
    if (!userData || userData?.address_details?.length === 0) { context.alertBox("error", "Please add address"); return; }
    if (!selectedAddress) { context.alertBox("error", "Please select address"); return; }

    if (selectedPaymentMethod === 'paypal') {
      context.alertBox('info', 'Please click the PayPal button to complete payment');
    } else if (selectedPaymentMethod === 'bank_deposit') {
      handleBankDeposit();
    } else if (selectedPaymentMethod === 'stripe') {
      if (!cardComplete) { context.alertBox("error", "Please validate card details first"); return; }
      handleStripePayment();
    } else if (selectedPaymentMethod === 'airwallex') {
      handleAirwallexPayment();
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20 lg:pb-8">
      <div className="container px-2 py-3 lg:py-6">
        <Box sx={{ width: '100%', mb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ 
            '& .MuiStepLabel-label': { fontSize: '0.75rem', mt: 0.5 },
            '& .MuiStepIcon-root': { fontSize: '1.5rem' }
          }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <div className="flex flex-col lg:flex-row gap-3 lg:gap-6">
          <div className="w-full lg:w-[65%]">
            {/* Delivery Address Section - Clean & Elegant */}
            <div className="bg-white rounded-lg lg:rounded-xl shadow-sm overflow-hidden mb-3 lg:mb-6">
              <div className="bg-slate-800 py-2.5 lg:py-3 px-4 lg:px-5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FaShippingFast className="text-white text-base lg:text-lg" />
                  <h2 className="text-sm lg:text-lg font-semibold text-white">Delivery Address</h2>
                </div>
                <button 
                  onClick={() => { setEditingAddress(null); setAddressForm({ address_line1: '', city: '', state: '', pincode: '', country: '', mobile: '', addressType: 'Home', landmark: '' }); setShowAddressModal(true); }}
                  className="text-xs bg-white/20 hover:bg-white/30 text-white px-2 lg:px-3 py-1 rounded-full transition-colors"
                >
                  + Add New
                </button>
              </div>
              
              <div className="p-3 lg:p-4">
                {userData?.address_details?.length !== 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 lg:gap-3">
                    {userData?.address_details?.map((address, index) => (
                      <div 
                        key={index}
                        onClick={(e) => handleChange(e, index, address)}
                        className={`cursor-pointer p-2.5 lg:p-3 rounded-lg border-2 transition-all ${
                          isChecked === index 
                            ? 'border-slate-800 bg-slate-50 shadow-sm' 
                            : 'border-gray-100 hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${isChecked === index ? 'border-slate-800' : 'border-gray-300'}`}>
                              {isChecked === index && <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />}
                            </div>
                            <span className={`text-[10px] lg:text-xs font-medium px-1.5 py-0.5 rounded-full ${address?.addressType === 'Home' ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-100 text-violet-700'}`}>
                              {address?.addressType}
                            </span>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setEditingAddress(address); setAddressForm({ address_line1: address.address_line1 || '', city: address.city || '', state: address.state || '', pincode: address.pincode || '', country: address.country || '', mobile: address.mobile || '', addressType: address.addressType || 'Home', landmark: address.landmark || '' }); setShowAddressModal(true); }}
                            className="text-slate-600 hover:text-slate-800 text-xs font-medium"
                          >
                            Edit
                          </button>
                        </div>
                        <div className="pl-5">
                          <p className="text-xs lg:text-sm text-gray-800 font-medium">{userData?.name}</p>
                          <p className="text-[10px] lg:text-xs text-gray-500 mt-0.5 leading-relaxed">
                            {address?.address_line1}{address?.landmark ? `, ${address.landmark}` : ''}, {address?.city}
                          </p>
                          <p className="text-[10px] lg:text-xs text-gray-500">
                            {address?.state}, {address?.country} {address?.pincode}
                          </p>
                          <p className="text-[10px] lg:text-xs text-gray-600 mt-1 font-medium flex items-center gap-1">
                            <span className="text-slate-800">+</span> {address?.mobile || userData?.mobile}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 lg:py-6">
                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 lg:mb-3">
                      <FaShippingFast className="text-gray-400 text-xl lg:text-2xl" />
                    </div>
                    <p className="text-gray-500 text-xs lg:text-sm mb-2 lg:mb-3">No delivery address added yet</p>
                    <button 
                      onClick={() => { setEditingAddress(null); setAddressForm({ address_line1: '', city: '', state: '', pincode: '', country: '', mobile: '', addressType: 'Home', landmark: '' }); setShowAddressModal(true); }}
                      className="bg-slate-800 text-white px-4 lg:px-5 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-medium hover:bg-slate-700 transition-colors"
                    >
                      + Add Delivery Address
                    </button>
                  </div>
                )}
              </div>

              {/* Inline Address Form Modal */}
              {showAddressModal && (
                <div className="fixed inset-0 bg-black/50 flex items-end lg:items-center justify-center z-50 p-0 lg:p-4">
                  <div className="bg-white rounded-t-2xl lg:rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
                    <div className="sticky top-0 bg-slate-800 p-3 lg:p-4 flex justify-between items-center">
                      <h3 className="text-base lg:text-lg font-semibold text-white">{editingAddress ? 'Edit' : 'Add'} Address</h3>
                      <button onClick={() => setShowAddressModal(false)} className="text-white/80 hover:text-white text-xl">
                        ✕
                      </button>
                    </div>
                    
                    <div className="p-3 lg:p-4 space-y-3">
                      {/* Address Type */}
                      <div className="flex gap-2">
                        {['Home', 'Office'].map(type => (
                          <button
                            key={type}
                            onClick={() => setAddressForm({...addressForm, addressType: type})}
                            className={`flex-1 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                              addressForm.addressType === type 
                                ? 'bg-slate-800 text-white' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>

                      <input
                        type="text"
                        placeholder="Full Address *"
                        value={addressForm.address_line1}
                        onChange={(e) => setAddressForm({...addressForm, address_line1: e.target.value})}
                        className="w-full p-2.5 lg:p-3 border border-gray-200 rounded-lg text-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none"
                      />

                      <input
                        type="text"
                        placeholder="Landmark (optional)"
                        value={addressForm.landmark}
                        onChange={(e) => setAddressForm({...addressForm, landmark: e.target.value})}
                        className="w-full p-2.5 lg:p-3 border border-gray-200 rounded-lg text-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none"
                      />

                      <div className="grid grid-cols-2 gap-2 lg:gap-3">
                        <input
                          type="text"
                          placeholder="City *"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                          className="w-full p-2.5 lg:p-3 border border-gray-200 rounded-lg text-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none"
                        />
                        <input
                          type="text"
                          placeholder="State *"
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                          className="w-full p-2.5 lg:p-3 border border-gray-200 rounded-lg text-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 lg:gap-3">
                        <input
                          type="text"
                          placeholder="Pincode *"
                          value={addressForm.pincode}
                          onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value})}
                          className="w-full p-2.5 lg:p-3 border border-gray-200 rounded-lg text-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Country *"
                          value={addressForm.country}
                          onChange={(e) => setAddressForm({...addressForm, country: e.target.value})}
                          className="w-full p-2.5 lg:p-3 border border-gray-200 rounded-lg text-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none"
                        />
                      </div>

                      <input
                        type="tel"
                        placeholder="Mobile Number *"
                        value={addressForm.mobile}
                        onChange={(e) => setAddressForm({...addressForm, mobile: e.target.value})}
                        className="w-full p-2.5 lg:p-3 border border-gray-200 rounded-lg text-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none"
                      />

                      <button
                        onClick={async () => {
                          const noPincodeCountries = ['Hong Kong', 'hong kong', 'HK', 'Singapore', 'singapore', 'SG', 'Macau', 'macau', 'MO'];
                          const needsPincode = !noPincodeCountries.includes(addressForm.country);
                          
                          const missingFields = [];
                          if (!addressForm.address_line1) missingFields.push('Address');
                          if (!addressForm.city) missingFields.push('City');
                          if (!addressForm.state) missingFields.push('State/Province');
                          if (needsPincode && !addressForm.pincode) missingFields.push('Pincode');
                          if (!addressForm.country) missingFields.push('Country');
                          if (!addressForm.mobile) missingFields.push('Mobile');
                          
                          if (missingFields.length > 0) {
                            context.alertBox("error", "Please fill: " + missingFields.join(', '));
                            return;
                          }
                          setIsloading(true);
                          try {
                            if (editingAddress) {
                              await editData(`/api/address/${editingAddress._id}`, {...addressForm, userId: userData._id});
                              context.alertBox("success", "Address updated!");
                            } else {
                              await postData("/api/address/add", {...addressForm, userId: userData._id});
                              context.alertBox("success", "Address added!");
                            }
                            await context.getUserDetails();
                            setShowAddressModal(false);
                          } catch (error) {
                            context.alertBox("error", "Failed to save address");
                          } finally {
                            setIsloading(false);
                          }
                        }}
                        disabled={isLoading}
                        className="w-full bg-slate-800 text-white py-2.5 lg:py-3 rounded-lg text-sm font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors"
                      >
                        {isLoading ? 'Saving...' : (editingAddress ? 'Update Address' : 'Save Address')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {selectedAddressData && (
              <div className="bg-white rounded-lg lg:rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-slate-700 to-slate-600 py-2.5 lg:py-3 px-4 lg:px-5">
                  <div className="flex items-center gap-2">
                    <BsShieldCheck className="text-white text-base lg:text-lg" />
                    <h2 className="text-sm lg:text-lg font-semibold text-white">Payment Method</h2>
                    <span className="ml-auto text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full">
                      Secure Checkout
                    </span>
                  </div>
                </div>
                <div className="p-4 lg:p-5">
                  <div className="space-y-3">
                    {paymentGateways.length > 0 && (
                      <p className="text-xs lg:text-sm text-gray-500 mb-3 font-medium">Choose your preferred payment method</p>
                    )}

                    {paymentGateways.some(g => g.gatewayType === 'bank_deposit') && (
                      <div
                        onClick={() => handlePaymentMethodChange('bank_deposit')}
                        className={`cursor-pointer p-3 lg:p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${
                          selectedPaymentMethod === 'bank_deposit'
                            ? 'border-indigo-500 bg-indigo-50 shadow-md'
                            : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
                        }`}
                      >
                        <Radio checked={selectedPaymentMethod === 'bank_deposit'} sx={{ p: 0 }} />
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                          <FaUniversity className="text-white text-lg lg:text-xl" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm lg:text-base">Bank Transfer</h3>
                          <p className="text-xs text-gray-500 hidden lg:block">Direct bank transfer payment</p>
                        </div>
                        <span className="text-[10px] font-medium bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full shrink-0">
                          Offline
                        </span>
                      </div>
                    )}

                    {paymentGateways.some(g => g.gatewayType === 'stripe') && (
                      <div
                        onClick={() => handlePaymentMethodChange('stripe')}
                        className={`cursor-pointer p-3 lg:p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${
                          selectedPaymentMethod === 'stripe'
                            ? 'border-violet-500 bg-violet-50 shadow-md'
                            : 'border-gray-200 hover:border-violet-300 hover:shadow-md'
                        }`}
                      >
                        <Radio checked={selectedPaymentMethod === 'stripe'} sx={{ p: 0 }} />
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.969l.89-2.151c-1.829-1.265-3.708-1.564-5.348-1.564-3.619 0-5.756 1.786-5.756 4.763 0 2.534 1.258 3.935 3.346 4.763 2.167.86 3.498 1.44 3.498 2.941 0 .933-.742 1.519-2.04 1.519-1.875 0-4.965-.921-6.99-2.109l-.9 2.15c1.792 1.321 4.16 1.996 6.25 1.996 3.072 0 5.77-1.575 5.77-4.297 0-2.381-1.38-3.757-3.346-4.678z"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm lg:text-base">Credit / Debit Card</h3>
                          <p className="text-xs text-gray-500 hidden lg:block">Secure payment via Stripe</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <img src="/visa.png" alt="Visa" className="h-5 lg:h-6" />
                          <img src="/master_card.png" alt="Mastercard" className="h-5 lg:h-6" />
                          <img src="/american_express.png" alt="Amex" className="h-5 lg:h-6" />
                        </div>
                      </div>
                    )}

                    {paymentGateways.some(g => g.gatewayType === 'paypal') && (
                      <div
                        onClick={() => handlePaymentMethodChange('paypal')}
                        className={`cursor-pointer p-3 lg:p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${
                          selectedPaymentMethod === 'paypal'
                            ? 'border-blue-600 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-blue-400 hover:shadow-md'
                        }`}
                      >
                        <Radio checked={selectedPaymentMethod === 'paypal'} sx={{ p: 0 }} />
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-600 to-[#003087] rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                          <BsPaypal className="text-white text-lg lg:text-xl" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm lg:text-base">PayPal</h3>
                          <p className="text-xs text-gray-500 hidden lg:block">Fast & secure payment with PayPal</p>
                        </div>
                      </div>
                    )}

                    {paymentGateways.some(g => g.gatewayType === 'airwallex') && (
                      <div
                        onClick={() => handlePaymentMethodChange('airwallex')}
                        className={`cursor-pointer p-3 lg:p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${
                          selectedPaymentMethod === 'airwallex'
                            ? 'border-teal-500 bg-teal-50 shadow-md'
                            : 'border-gray-200 hover:border-teal-300 hover:shadow-md'
                        }`}
                      >
                        <Radio checked={selectedPaymentMethod === 'airwallex'} sx={{ p: 0 }} />
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm lg:text-base">Airwallex</h3>
                          <p className="text-xs text-gray-500 hidden lg:block">Global payments – cards & local methods</p>
                        </div>
                        <span className="text-[10px] font-medium bg-teal-100 text-teal-700 px-2 py-1 rounded-full shrink-0">
                          Secure
                        </span>
                      </div>
                    )}

                    {selectedPaymentMethod === 'bank_deposit' && (
                      <div className="mt-4 p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <FaUniversity className="text-indigo-600" />
                          <h4 className="font-semibold text-indigo-900 text-sm">Bank Transfer Details</h4>
                        </div>
                        <div className="space-y-2">
                          {paymentGateways.find(g => g.gatewayType === 'bank_deposit')?.bankName && (
                            <div className="flex justify-between">
                              <span className="text-xs text-indigo-600">Bank Name:</span>
                              <span className="text-xs text-indigo-900 font-medium">{paymentGateways.find(g => g.gatewayType === 'bank_deposit')?.bankName}</span>
                            </div>
                          )}
                          {paymentGateways.find(g => g.gatewayType === 'bank_deposit')?.accountName && (
                            <div className="flex justify-between">
                              <span className="text-xs text-indigo-600">Account Name:</span>
                              <span className="text-xs text-indigo-900 font-medium">{paymentGateways.find(g => g.gatewayType === 'bank_deposit')?.accountName}</span>
                            </div>
                          )}
                          {paymentGateways.find(g => g.gatewayType === 'bank_deposit')?.accountNumber && (
                            <div className="flex justify-between">
                              <span className="text-xs text-indigo-600">Account Number:</span>
                              <span className="text-xs text-indigo-900 font-medium">{paymentGateways.find(g => g.gatewayType === 'bank_deposit')?.accountNumber}</span>
                            </div>
                          )}
                          {paymentGateways.find(g => g.gatewayType === 'bank_deposit')?.bankCode && (
                            <div className="flex justify-between">
                              <span className="text-xs text-indigo-600">Bank Code:</span>
                              <span className="text-xs text-indigo-900 font-medium">{paymentGateways.find(g => g.gatewayType === 'bank_deposit')?.bankCode}</span>
                            </div>
                          )}
                          {paymentGateways.find(g => g.gatewayType === 'bank_deposit')?.branchCode && (
                            <div className="flex justify-between">
                              <span className="text-xs text-indigo-600">Branch Code:</span>
                              <span className="text-xs text-indigo-900 font-medium">{paymentGateways.find(g => g.gatewayType === 'bank_deposit')?.branchCode}</span>
                            </div>
                          )}
                          {paymentGateways.find(g => g.gatewayType === 'bank_deposit')?.swift && (
                            <div className="flex justify-between">
                              <span className="text-xs text-indigo-600">SWIFT Code:</span>
                              <span className="text-xs text-indigo-900 font-medium">{paymentGateways.find(g => g.gatewayType === 'bank_deposit')?.swift}</span>
                            </div>
                          )}
                          {paymentGateways.find(g => g.gatewayType === 'bank_deposit')?.accountType && (
                            <div className="flex justify-between">
                              <span className="text-xs text-indigo-600">Account Type:</span>
                              <span className="text-xs text-indigo-900 font-medium">{paymentGateways.find(g => g.gatewayType === 'bank_deposit')?.accountType}</span>
                            </div>
                          )}
                          {paymentGateways.find(g => g.gatewayType === 'bank_deposit')?.location && (
                            <div className="flex justify-between">
                              <span className="text-xs text-indigo-600">Location:</span>
                              <span className="text-xs text-indigo-900 font-medium">{paymentGateways.find(g => g.gatewayType === 'bank_deposit')?.location}</span>
                            </div>
                          )}
                          {paymentGateways.find(g => g.gatewayType === 'bank_deposit')?.city && (
                            <div className="flex justify-between">
                              <span className="text-xs text-indigo-600">City:</span>
                              <span className="text-xs text-indigo-900 font-medium">{paymentGateways.find(g => g.gatewayType === 'bank_deposit')?.city}</span>
                            </div>
                          )}
                          {paymentGateways.find(g => g.gatewayType === 'bank_deposit')?.bankAddress && (
                            <div className="flex flex-col mt-2">
                              <span className="text-xs text-indigo-600">Bank Address:</span>
                              <span className="text-xs text-indigo-900 font-medium">{paymentGateways.find(g => g.gatewayType === 'bank_deposit')?.bankAddress}</span>
                            </div>
                          )}
                          {paymentGateways.find(g => g.gatewayType === 'bank_deposit')?.instructions && (
                            <div className="mt-3 pt-3 border-t border-indigo-200">
                              <span className="text-xs text-indigo-600">Instructions:</span>
                              <p className="text-xs text-indigo-800 leading-relaxed">{paymentGateways.find(g => g.gatewayType === 'bank_deposit')?.instructions}</p>
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] text-indigo-600 mt-3 flex items-center gap-1">
                          <FaLock className="text-[10px]" />
                          Your bank details are secured and encrypted
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 lg:mt-5">
                    {/* Stripe Card Input */}
                    {selectedPaymentMethod === 'stripe' && (
                      <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <FaLock className="text-emerald-600 text-xs" />
                            <span className="text-xs font-medium text-gray-600">Secure Card Payment</span>
                          </div>
                          <div className="flex gap-1">
                            <img src="/visa.png" alt="Visa" className="h-4 opacity-80" />
                            <img src="/master_card.png" alt="Mastercard" className="h-4 opacity-80" />
                            <img src="/american_express.png" alt="Amex" className="h-4 opacity-80" />
                          </div>
                        </div>
                        {stripeConfig.publishableKey ? (
                          <>
                            <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                              <Elements stripe={getStripe(stripeConfig.publishableKey)}>
                                <StripeCardForm
                                  onError={setCardError}
                                  onComplete={setCardComplete}
                                  onPaymentMethodReady={setPaymentMethodId}
                                  selectedAddressData={selectedAddressData}
                                />
                              </Elements>
                            </div>
                            {cardError && <p className="text-red-500 text-xs mt-2">{cardError}</p>}
                          </>
                        ) : (
                          <div className="p-4 bg-white rounded-lg border border-gray-200 text-center">
                            <div className="animate-pulse">
                              <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto mb-3"></div>
                              <div className="h-10 bg-gray-100 rounded w-full mb-3"></div>
                              <p className="text-xs text-gray-500">Loading secure payment form...</p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center justify-center gap-2 mt-3 text-[10px] text-gray-400">
                          <FaLock />
                          <span>256-bit SSL encryption protection</span>
                        </div>
                      </div>
                    )}

                    {/* PayPal */}
                    {selectedPaymentMethod === 'paypal' && (
                      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-[#003087] rounded-lg flex items-center justify-center shrink-0">
                              <BsPaypal className="text-white text-sm" />
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-gray-900 leading-tight">PayPal</h3>
                              <p className="text-[11px] text-gray-500 leading-tight">Fast & secure checkout</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full shrink-0">Quick</span>
                        </div>
                        <div className="px-4 py-3.5 space-y-3">
                          <div className="flex items-center gap-3 text-[11px] text-gray-500">
                            <span className="flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 text-[#003087]" viewBox="0 0 24 24" fill="currentColor"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z"/></svg>
                              PayPal
                            </span>
                            <span className="flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 text-[#003087]" viewBox="0 0 24 24" fill="currentColor"><path d="M20.067 8.478c.493 0 .917.374.917.874 0 .5-.424.874-.917.874H11.48c-.493 0-.917-.374-.917-.874 0-.5.424-.874.917-.874h8.587zM20.067 12.412c.493 0 .917.374.917.874 0 .5-.424.874-.917.874H11.48c-.493 0-.917-.374-.917-.874 0-.5.424-.874.917-.874h8.587z"/></svg>
                              PayPal Credit
                            </span>
                            <span className="flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 text-[#003087]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                              Pay Later
                            </span>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2 min-h-[90px] flex items-center justify-center">
                            <PayPalScriptProvider 
                              options={{
                                "client-id": paypalClientId,
                                currency: currency || 'USD',
                                intent: "capture"
                              }}
                            >
                              <PayPalButtons
                                style={{ layout: "vertical", color: "gold", shape: "pill", label: "paypal" }}
                                disabled={processingPayment || !selectedAddress}
                                createOrder={(data, actions) => {
                                  const amount = calculateFinalTotal();
                                  if (!amount || amount <= 0) {
                                    context.alertBox("error", "Invalid amount");
                                    return Promise.reject("Invalid amount");
                                  }
                                  const selectedCurrency = currency || 'USD';
                                  const converted = convertPrice(amount);
                                  const items = (context.cartData || []).map(item => ({
                                    name: item.productTitle || 'Product',
                                    sku: item.productId || '',
                                    quantity: String(item.quantity || 1),
                                    unit_amount: {
                                      currency_code: selectedCurrency,
                                      value: convertPrice(parseFloat(item.price)).toFixed(2)
                                    }
                                  }));
                                  const itemTotal = items.reduce(
                                    (sum, item) => sum + parseFloat(item.unit_amount.value) * parseInt(item.quantity),
                                    0
                                  );
                                  const amountPayload = {
                                    currency_code: selectedCurrency,
                                    value: converted.toFixed(2),
                                    breakdown: {
                                      item_total: {
                                        currency_code: selectedCurrency,
                                        value: itemTotal.toFixed(2)
                                      }
                                    }
                                  };
                                  if (shippingCost > 0) {
                                    amountPayload.breakdown.shipping = {
                                      currency_code: selectedCurrency,
                                      value: convertPrice(shippingCost).toFixed(2)
                                    };
                                  }
                                  const discountVal = calculateDiscountAmount();
                                  if (discountVal > 0) {
                                    amountPayload.breakdown.discount = {
                                      currency_code: selectedCurrency,
                                      value: convertPrice(discountVal).toFixed(2)
                                    };
                                  }
                                  return actions.order.create({
                                    purchase_units: [{
                                      amount: amountPayload,
                                      items: items
                                    }]
                                  });
                                }}
                                onApprove={async (data, actions) => {
                                  setProcessingPayment(true);
                                  try {
                                    await actions.order.capture();
                                    const finalTotalUSD = calculateFinalTotal();
                                    const selectedCurrency = currency || 'USD';
                                    const rate = exchangeRates[selectedCurrency] || 1;
                                    const productsInCurrency = context?.cartData?.map(item => ({ ...item }));
                                    const payLoad = { userId: userData._id, products: productsInCurrency, payment_method: "paypal", paymentId: data.orderID, delivery_address: selectedAddressData, totalAmt: parseFloat(finalTotalUSD), subTotal: parseFloat(totalAmountUSD), shippingCost: parseFloat(shippingCost), discountCode: appliedDiscount?.code || null, discountAmount: parseFloat(calculateDiscountAmount()), currency: selectedCurrency, currencyRate: rate };
                                    const res = await postData("/api/order/create", payLoad);
                                    if (res?.success) {
                                      if (appliedDiscount) await postData("/api/discountCode/apply", { code: appliedDiscount.code });
                                      await deleteData(`/api/cart/emptyCart/${userData._id}`);
                                      context?.getCartItems();
                                      localStorage.removeItem('appliedDiscount');
                                      context.alertBox("success", "Order placed successfully!");
                                      history("/order/success");
                                    } else {
                                      context.alertBox("error", res?.message);
                                    }
                                  } catch (error) {
                                    console.error('PayPal order error:', error);
                                    context.alertBox("error", "Payment failed. Please try again.");
                                  } finally {
                                    setProcessingPayment(false);
                                  }
                                }}
                                onError={(err) => {
                                  console.error('PayPal Error:', err);
                                  if (err?.message?.includes('No such order')) {
                                    context.alertBox("error", "Order creation failed. Please refresh and try again.");
                                  } else if (err?.message?.includes('INVALID')) {
                                    context.alertBox("error", "Invalid PayPal configuration. Using Bank Transfer instead.");
                                  } else {
                                    context.alertBox("error", "PayPal payment failed. Please try again or use Bank Transfer.");
                                  }
                                }}
                              />
                            </PayPalScriptProvider>
                          </div>
                          <p className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1.5">
                            <svg className="w-3 h-3 text-emerald-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                            Protected by PayPal Buyer Protection
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedPaymentMethod === 'airwallex' && (
                      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z"/>
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-gray-900 leading-tight">Airwallex</h3>
                              <p className="text-[11px] text-gray-500 leading-tight">Global payment gateway</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full shrink-0">Secure</span>
                        </div>
                        <div className="px-4 py-3.5">
                          <div className="flex flex-wrap items-center gap-2 mb-3 text-[11px] text-gray-600">
                            <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md">
                              <svg className="w-3.5 h-3.5 text-teal-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-8 8z"/></svg>
                              Credit & Debit Cards
                            </span>
                            <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md">
                              <svg className="w-3.5 h-3.5 text-teal-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-8 8z"/></svg>
                              Local Payment Methods
                            </span>
                            <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md">
                              <svg className="w-3.5 h-3.5 text-teal-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-8 8z"/></svg>
                              Global Coverage
                            </span>
                          </div>
                          <button
                            onClick={handleAirwallexPayment}
                            disabled={processingPayment || !selectedAddress}
                            className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-sm font-medium rounded-xl hover:from-teal-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                          >
                            {processingPayment ? (
                              <>
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                </svg>
                                Processing...
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                                Pay with Airwallex
                              </>
                            )}
                          </button>
                          <p className="text-[10px] text-gray-400 text-center mt-3 flex items-center justify-center gap-1.5">
                            <svg className="w-3 h-3 text-teal-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-8 8z"/></svg>
                            You will be redirected to Airwallex's secure payment page
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rightCol w-full lg:w-[35%]">
            <div className="bg-white rounded-lg lg:rounded-xl shadow-sm overflow-hidden sticky top-20">
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 py-2.5 lg:py-3 px-4 lg:px-5 flex items-center justify-between">
                <h2 className="text-sm lg:text-lg font-semibold text-white">Order Summary</h2>
                <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full">
                  {context?.cartData?.length || 0} items
                </span>
              </div>
              <div className="p-3 lg:p-5">
                <div className="space-y-3 max-h-[250px] lg:max-h-[300px] overflow-y-auto mb-3 lg:mb-4 pr-1">
                  {context?.cartData?.map((item, index) => (
                    <div key={index} className="flex gap-2.5 pb-2.5 border-b border-gray-100 last:border-0">
                      <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                        <img src={item?.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs lg:text-sm font-medium line-clamp-2">{item?.productTitle}</h4>
                        <p className="text-[10px] lg:text-xs text-gray-500 mt-0.5">Qty: {item?.quantity || 1}</p>
                        <p className="text-xs lg:text-sm font-semibold text-slate-800 mt-0.5">{displayPrice(item?.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5 text-xs lg:text-sm border-t border-gray-200 pt-3 lg:pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{displayPrice(totalAmountUSD)}</span>
                  </div>
                  {appliedDiscount && (
                    <div className="flex justify-between text-emerald-600">
                      <span className="flex items-center gap-1">
                        <FaCheckCircle className="text-[10px]" />
                        Discount ({appliedDiscount.code})
                      </span>
                      <span className="font-medium">-{displayPrice(calculateDiscountAmount())}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <FaShippingFast className="text-xs" />
                      Shipping
                    </span>
                    {loadingShipping ? (
                      <span className="text-gray-400 text-[10px] lg:text-xs">Calculating...</span>
                    ) : shippingInfo?.type === 'free' ? (
                      <span className="text-emerald-600 font-medium text-xs lg:text-sm">FREE</span>
                    ) : (
                      <span className="font-medium text-xs lg:text-sm">{displayPrice(shippingCost)}</span>
                    )}
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-medium text-sm lg:text-base">Total</span>
                    <div className="text-right">
                      <span className="text-base lg:text-xl font-bold text-slate-800">{displayPrice(calculateFinalTotal())}</span>
                      <p className="text-[10px] text-gray-400">{currency}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 lg:mt-4">
                  <div className="flex gap-1.5 lg:gap-2">
                    <input 
                      type="text" 
                      placeholder="Discount code" 
                      value={discountCodeInput} 
                      onChange={(e) => setDiscountCodeInput(e.target.value.toUpperCase())}
                      className="flex-1 px-2.5 lg:px-3 py-2 text-xs lg:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                    />
                    <Button 
                      onClick={handleApplyDiscountCode} 
                      disabled={discountLoading}
                      className="btn-org !px-3 lg:!px-4 !text-xs lg:!text-sm"
                    >
                      {discountLoading ? '...' : 'Apply'}
                    </Button>
                  </div>
                  {discountError && <p className="text-red-500 text-[10px] lg:text-xs mt-1.5">{discountError}</p>}
                  {appliedDiscount && (
                    <div className="mt-2 flex items-center justify-between bg-emerald-50 p-1.5 lg:p-2 rounded-lg">
                      <span className="text-emerald-700 text-xs">{appliedDiscount.code} applied</span>
                      <button onClick={handleRemoveDiscount} className="text-red-500 text-xs hover:underline">Remove</button>
                    </div>
                  )}
                </div>

                <div className="mt-4 lg:mt-5 space-y-2.5 lg:space-y-3">
                  <Button
                    variant="contained"
                    fullWidth
                    size="medium"
                    onClick={handlePlaceOrder}
                    disabled={isLoading || processingPayment || !selectedAddress}
                    className="btn-org !py-2.5 lg:!py-3 !text-xs lg:!text-sm"
                  >
                    {isLoading || processingPayment ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <span className="flex items-center gap-1.5 lg:gap-2">
                        <BsShieldCheck className="text-sm lg:text-base" />
                        {selectedPaymentMethod === 'bank_deposit' 
                          ? `Place Order (${displayPrice(calculateFinalTotal())})` 
                          : `Pay ${displayPrice(calculateFinalTotal())}`
                        }
                      </span>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-[10px] lg:text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                      <FaLock className="text-[10px]" />
                      <span className="font-medium">SSL Secured</span>
                    </div>
                    <span className="text-[10px] text-gray-400">|</span>
                    <span className="text-[10px] text-gray-400">PCI Compliant</span>
                    <span className="text-[10px] text-gray-400">|</span>
                    <span className="text-[10px] text-gray-400">256-bit Encryption</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;