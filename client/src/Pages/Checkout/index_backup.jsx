import React, { useContext, useEffect, useState } from "react";
import { Button } from "@mui/material";
import { BsFillBagCheckFill } from "react-icons/bs";
import { MyContext } from '../../App';
import { FaPlus, FaTag, FaCheckCircle, FaCreditCard, FaLock } from "react-icons/fa";
import Radio from '@mui/material/Radio';
import { fetchDataFromApi, postData, deleteData } from "../../utils/api";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import CircularProgress from '@mui/material/CircularProgress';
import { useCurrency } from "../../context/CurrencyContext";

const Checkout = () => {
  const [userData, setUserData] = useState(null);
  const [isChecked, setIsChecked] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedAddressData, setSelectedAddressData] = useState(null);
  const [totalAmount, setTotalAmount] = useState();
  const [totalAmountUSD, setTotalAmountUSD] = useState(0);
  const [totalAmountINR, setTotalAmountINR] = useState(0);
  const [isLoading, setIsloading] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountCodeInput, setDiscountCodeInput] = useState("");
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountError, setDiscountError] = useState("");
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingInfo, setShippingInfo] = useState(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [airwallexLoading, setAirwallexLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardError, setCardError] = useState("");
  const context = useContext(MyContext);
  const { convertPrice, convertBackToUSD, currency, CURRENCIES } = useCurrency();

  const history = useNavigate();

  // Convert USD price to selected currency
  const displayPrice = (priceUSD) => {
    if (!priceUSD || isNaN(priceUSD)) return `${CURRENCIES[currency]?.symbol || '$'}0.00`;
    const converted = convertPrice(priceUSD);
    return `${CURRENCIES[currency]?.symbol || '$'}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const timer = setTimeout(() => {
      if (!context?.cartData || context.cartData.length === 0) {
        context?.alertBox('error', 'Your cart is empty! Please add some products.');
        history('/products');
        return;
      }
      
      setUserData(context?.userData)
      if (context?.userData?.address_details?.[0]) {
        setSelectedAddress(context.userData.address_details[0]._id);
        setSelectedAddressData(context.userData.address_details[0]);
      }

      // Track checkout start for abandoned cart detection
      if (context?.cartData?.length > 0) {
        fetch(`${VITE_API_URL}/api/cart/track-checkout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          }
        }).catch(console.error);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);


  useEffect(() => {
    const timer = setTimeout(() => {
      const cartItems = context?.cartData || [];
      const totalInUSD = cartItems.length !== 0 ?
        cartItems?.map(item => parseFloat(item.price))
          .reduce((total, value) => total + value, 0) : 0;
      
      setTotalAmountUSD(totalInUSD);
      setTotalAmountINR(totalInUSD);
      setTotalAmount(displayPrice(totalInUSD));
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

  const handleApplyDiscountCode = async () => {
    if (!discountCodeInput.trim()) {
      setDiscountError("Please enter a discount code");
      return;
    }
    setDiscountLoading(true);
    setDiscountError("");
    const cartTotalUSD = totalAmountUSD;
    try {
      const res = await postData("/api/discountCode/validate", { 
        code: discountCodeInput, 
        cartTotal: cartTotalUSD, 
        cartItems: context.cartData 
      });
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

  const calculateDiscountAmount = () => {
    if (!appliedDiscount) return 0;
    
    if (appliedDiscount.discountType === 'percentage') {
      const discountPercent = appliedDiscount.discountValue || 0;
      return (totalAmountUSD * discountPercent) / 100;
    }
    return appliedDiscount.discountAmount || 0;
  };

  const calculateFinalTotal = () => {
    const discountUSD = calculateDiscountAmount();
    // shippingCost is already in USD from API, subtotal is in USD
    return Math.max(0, totalAmountUSD + shippingCost - discountUSD);
  };

  const fetchShippingCost = async (countryCode) => {
    setLoadingShipping(true);
    setShippingCost(0);
    setShippingInfo(null);
    
    try {
      const res = await fetchDataFromApi(`/api/shippingRate/lookup/country?countryCode=${countryCode}`);
      if (res?.success && res?.data) {
        const rate = res.data;
        
        if (rate.pricingType === 'free') {
          if (!rate.freeShippingThreshold || totalAmountUSD >= rate.freeShippingThreshold) {
            setShippingCost(0);
            setShippingInfo({ type: 'free', label: 'FREE Shipping' });
          } else {
            setShippingCost(0);
            setShippingInfo({ 
              type: 'free_threshold', 
              label: 'FREE Shipping',
              note: `Free shipping on orders over ${rate.currency} ${rate.freeShippingThreshold}`
            });
          }
        } else {
          setShippingCost(rate.flatRate || 0);
          setShippingInfo({ 
            type: 'flat', 
            label: `${rate.currency} ${rate.flatRate}`,
            delivery: rate.estimatedDeliveryDays
          });
        }
      } else {
        setShippingInfo({ type: 'none', label: 'Contact for shipping' });
      }
    } catch (error) {
      setShippingInfo({ type: 'error', label: 'Unable to calculate' });
    } finally {
      setLoadingShipping(false);
    }
  };

  useEffect(() => {
    if (selectedAddressData?.country) {
      const countryCode = getCountryCode(selectedAddressData.country);
      if (countryCode) {
        fetchShippingCost(countryCode);
      }
    }
  }, [selectedAddress, totalAmountUSD]);

  const getCountryCode = (countryName) => {
    if (!countryName) return null;
    
    const codes = {
      'Nepal': 'NP', 'India': 'IN', 'United States': 'US', 'United States of America': 'US', 
      'United Kingdom': 'GB', 'UK': 'GB', 'Great Britain': 'GB',
      'Australia': 'AU', 
      'Canada': 'CA', 
      'Germany': 'DE', 
      'France': 'FR', 
      'Japan': 'JP',
      'China': 'CN',
      'Brazil': 'BR',
      'South Korea': 'KR', 'Korea': 'KR',
      'Spain': 'ES',
      'Italy': 'IT',
      'Netherlands': 'NL', 'Holland': 'NL',
      'Belgium': 'BE',
      'Switzerland': 'CH',
      'Sweden': 'SE',
      'Norway': 'NO',
      'Denmark': 'DK',
      'Finland': 'FI',
      'Austria': 'AT',
      'Poland': 'PL',
      'Portugal': 'PT',
      'Ireland': 'IE',
      'New Zealand': 'NZ',
      'Singapore': 'SG',
      'Hong Kong': 'HK',
      'Malaysia': 'MY',
      'Thailand': 'TH',
      'Vietnam': 'VN',
      'Philippines': 'PH',
      'Indonesia': 'ID',
      'Pakistan': 'PK',
      'Bangladesh': 'BD',
      'Sri Lanka': 'LK',
      'Saudi Arabia': 'SA',
      'United Arab Emirates': 'AE', 'UAE': 'AE',
      'Qatar': 'QA',
      'Kuwait': 'KW',
      'Oman': 'OM',
      'Bahrain': 'BH',
      'South Africa': 'ZA',
      'Egypt': 'EG',
      'Nigeria': 'NG',
      'Kenya': 'KE',
      'Mexico': 'MX',
      'Argentina': 'AR',
      'Chile': 'CL',
      'Colombia': 'CO',
      'Peru': 'PE',
      'Russia': 'RU',
      'Ukraine': 'UA',
      'Turkey': 'TR',
      'Greece': 'GR',
      'Czech Republic': 'CZ',
      'Hungary': 'HU',
      'Romania': 'RO',
      'Bulgaria': 'BG',
      'Croatia': 'HR'
    };
    
    const name = countryName.trim();
    
    if (codes[name]) return codes[name];
    
    // Try matching partial name
    for (const [key, code] of Object.entries(codes)) {
      if (name.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(name.toLowerCase())) {
        return code;
      }
    }
    
    // Fallback to first 2 letters
    return name.substring(0, 2).toUpperCase();
  };





  useEffect(() => {

    // Load the Airwallex SDK
    if (VITE_APP_AIRWALLEX_API_KEY && VITE_APP_AIRWALLEX_API_KEY !== 'your_airwallex_api_key') {
      const airwallexScript = document.createElement("script");
      airwallexScript.src = "https://js.airwallex.com/v1/bundle.js";
      airwallexScript.async = true;
      airwallexScript.onload = () => {
        if (window.Airwallex) {
          window.Airwallex.configure({
            apiKey: VITE_APP_AIRWALLEX_API_KEY,
            clientId: VITE_APP_AIRWALLEX_CLIENT_ID,
          });
        }
      };
      document.body.appendChild(airwallexScript);
    }

    // Load the PayPal JavaScript SDK
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${VITE_APP_PAYPAL_CLIENT_ID}&disable-funding=card`;
    script.async = true;
    script.onload = () => {
      if (VITE_APP_PAYPAL_CLIENT_ID) {
        window.paypal
          .Buttons(
            {
              createOrder: async () => {
                const finalTotalUSD = calculateFinalTotal();
                const finalTotalInCurrency = convertPrice(finalTotalUSD).toFixed(2);

                const headers = {
                  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                  'Content-Type': 'application/json',
                }

                const data = {
                  userId: context?.userData?._id,
                  totalAmount: finalTotalInCurrency,
                  currency: currency
                }

                const response = await axios.get(
                  VITE_API_URL + `/api/order/create-order-paypal?userId=${data?.userId}&totalAmount=${data?.totalAmount}&currency=${data?.currency}`, { headers }
                );

                return response?.data?.id;

              },
              onApprove: async (data) => {
                onApprovePayment(data);
              },
              onError: (err) => {
                history("/order/failed");
                console.error("PayPal Checkout onError:", err);
              },
            })
          .render("#paypal-button-container");
      }
    };
    document.body.appendChild(script);
  }, [context?.cartData, context?.userData, selectedAddress, totalAmountUSD]);




  const onApprovePayment = async (data) => {
    const user = context?.userData;

    const finalTotalUSD = calculateFinalTotal();
    const discountValueUSD = calculateDiscountAmount();
    const subtotalUSD = totalAmountUSD;
    const finalShippingUSD = shippingCost;
    
    const finalTotalInCurrency = convertPrice(finalTotalUSD);
    const discountValueInCurrency = convertPrice(discountValueUSD);
    const subtotalInCurrency = convertPrice(subtotalUSD);
    const shippingInCurrency = convertPrice(finalShippingUSD);
    
    const productsInCurrency = context?.cartData?.map(item => ({
      ...item,
      price: convertPrice(parseFloat(item.price)),
      subTotal: convertPrice(parseFloat(item.price)),
      perUnit: convertPrice(parseFloat(item.price) / (parseInt(item.quantity) || 1))
    }));
    
    const info = {
      userId: user?._id,
      products: productsInCurrency,
      payment_status: "COMPLETE",
      delivery_address: selectedAddressData,
      totalAmt: parseFloat(finalTotalInCurrency),
      subTotal: parseFloat(subtotalInCurrency),
      shippingCost: parseFloat(shippingInCurrency),
      currency: currency,
      discountCode: appliedDiscount?.code || null,
      discountAmount: parseFloat(discountValueInCurrency),
      date: new Date().toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    };

    // Capture order on the server
    const headers = {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'Content-Type': 'application/json',
    }

    const response = await axios.post(
      VITE_API_URL + "/api/order/capture-order-paypal",
      {
        ...info,
        paymentId: data.orderID
      }, { headers }
    ).then((res) => {
      context.alertBox("success", res?.data?.message);
      history("/order/success");
      deleteData(`/api/cart/emptyCart/${context?.userData?._id}`).then((res) => {
        context?.getCartItems();
      })
    });


    if (response.data.success) {
      context.alertBox("success", "Order completed and saved to database!");
    }

  }


  const editAddress = (id) => {
    context?.setOpenAddressPanel(true);
    context?.setAddressMode("edit");
    context?.setAddressId(id);
  }


  const handleChange = (e, index, address) => {
    if (e.target.checked) {
      setIsChecked(index);
      setSelectedAddress(e.target.value);
      setSelectedAddressData(address);
      
      // Fetch shipping cost when address is selected
      if (address?.country) {
        const countryCode = getCountryCode(address.country);
        if (countryCode) {
          fetchShippingCost(countryCode);
        }
      }
    }
  }



  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleAirwallexPayment = async () => {
    if (!context?.cartData || context.cartData.length === 0) {
      context.alertBox('error', 'Your cart is empty! Please add some products before checkout.');
      return;
    }

    if (userData?.address_details?.length === 0) {
      context.alertBox('error', 'Please add address');
      return;
    }

    if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
      setCardError("Please fill in all card details");
      return;
    }

    const cardNum = cardNumber.replace(/\s/g, '');
    if (cardNum.length < 13 || cardNum.length > 19) {
      setCardError("Invalid card number");
      return;
    }

    setAirwallexLoading(true);
    setCardError("");

    try {
      const finalTotalUSD = calculateFinalTotal();
      const finalTotalInCurrency = convertPrice(finalTotalUSD);

      const response = await fetch(`${VITE_API_URL}/api/payment/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalTotalInCurrency, currency: currency }),
      });

      const data = await response.json();

      if (!data.clientSecret) {
        throw new Error(data.message || "Failed to create payment");
      }

      // For sandbox, we'll simulate the payment and create order
      // In production, use Airwallex's built-in card element
      
      const productsInCurrency = context?.cartData?.map(item => ({
        ...item, 
        price: convertPrice(parseFloat(item.price)),
        subTotal: convertPrice(parseFloat(item.price)),
        perUnit: convertPrice(parseFloat(item.price) / (parseInt(item.quantity) || 1))
      }));

      const payLoad = {
        userId: context?.userData?._id, 
        products: productsInCurrency, 
        paymentId: data.id,
        payment_status: "PAID", 
        delivery_address: selectedAddressData,
        totalAmt: parseFloat(finalTotalInCurrency),
        subTotal: parseFloat(convertPrice(totalAmountUSD)),
        shippingCost: parseFloat(convertPrice(shippingCost)),
        discountCode: appliedDiscount?.code || null,
        discountAmount: parseFloat(convertPrice(calculateDiscountAmount())),
        currency: currency,
        date: new Date().toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric" })
      };

      const orderRes = await postData(`/api/order/create`, payLoad);
      
      if (orderRes?.error === false) {
        if (appliedDiscount) postData("/api/discountCode/apply", { code: appliedDiscount.code });
        deleteData(`/api/cart/emptyCart/${context?.userData?._id}`).then(() => context?.getCartItems());
        context.alertBox("success", "Payment successful!");
        localStorage.removeItem('appliedDiscount');
        
        setCardNumber("");
        setCardExpiry("");
        setCardCvc("");
        setCardName("");
        
        history("/order/success");
} else {
        throw new Error(orderRes?.message || "Failed to create order");
      }
    } catch (error) {
      console.error("Payment Error:", error);
      setCardError(error.message || "Payment failed. Please try again.");
    } finally {
      setAirwallexLoading(false);
    }
  }

  const checkout = async (e) => {
    e.preventDefault();

    if (!context?.cartData || context.cartData.length === 0) {
      context.alertBox('error', 'Your cart is empty! Please add some products before checkout.');
      history('/products');
      return;
    }

    if (userData?.address_details?.length === 0) {
      context.alertBox('error', 'Please add address');
      return;
    }

    setIsloading(true);

    try {
      const finalTotalUSD = calculateFinalTotal();
      const discountValueUSD = calculateDiscountAmount();
      const subtotalUSD = totalAmountUSD;
      const finalShippingUSD = shippingCost;
      
      const finalTotalInCurrency = convertPrice(finalTotalUSD);
      const discountValueInCurrency = convertPrice(discountValueUSD);
      const subtotalInCurrency = convertPrice(subtotalUSD);
      const shippingInCurrency = convertPrice(finalShippingUSD);

      const response = await fetch(`${VITE_API_URL}/api/payment/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: finalTotalInCurrency,
          currency: currency,
        }),
      });

      const data = await response.json();

      if (data.clientSecret && window.Airwallex) {
        const airwallex = await window.Airwallex.init({
          env: 'sandbox',
          origin: window.location.origin,
        });

        const result = await airwallex.confirmPaymentIntent({
          clientSecret: data.clientSecret,
          paymentElementOptions: {
            displayCurrency: currency,
            displayAmount: Math.round(finalTotalInCurrency * 100),
          },
        });

        if (result?.error) {
          throw new Error(result.error.message || 'Payment failed');
        }

        const productsInCurrency = context?.cartData?.map(item => ({
          ...item,
          price: convertPrice(parseFloat(item.price)),
          subTotal: convertPrice(parseFloat(item.price)),
          perUnit: convertPrice(parseFloat(item.price) / (parseInt(item.quantity) || 1))
        }));

        const payLoad = {
          userId: context?.userData?._id,
          products: productsInCurrency,
          paymentId: data.id,
          payment_status: "PAID",
          delivery_address: selectedAddressData,
          totalAmt: parseFloat(finalTotalInCurrency),
          subTotal: parseFloat(subtotalInCurrency),
          shippingCost: parseFloat(shippingInCurrency),
          discountCode: appliedDiscount?.code || null,
          discountAmount: parseFloat(discountValueInCurrency),
          currency: currency,
          date: new Date().toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })
        };

        const orderRes = await postData(`/api/order/create`, payLoad);
        
        if (orderRes?.error === false) {
          if (appliedDiscount) {
            postData("/api/discountCode/apply", { code: appliedDiscount.code }).then(() => {});
          }
          deleteData(`/api/cart/emptyCart/${context?.userData?._id}`).then(() => {
            context?.getCartItems();
          });
          context.alertBox("success", "Payment successful!");
          history("/order/success");
        } else {
          throw new Error(orderRes?.message || 'Failed to create order');
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      context.alertBox('error', error.message || 'Payment failed. Please try again.');
      history('/order/failed');
    }
    setIsloading(false);
  }



const cashOnDelivery = async () => {
    if (!context?.cartData || context.cartData.length === 0) {
      context.alertBox('error', 'Your cart is empty! Please add some products before checkout.');
      history('/products');
      return;
    }

    if (!userData || userData?.address_details?.length === 0) {
      context.alertBox("error", "Please add delivery address");
      return;
    }

    if (!selectedAddress) {
      context.alertBox("error", "Please select a delivery address");
      return;
    }

    setIsloading(true);

    try {
      const finalTotalUSD = calculateFinalTotal();
      const discountValueUSD = calculateDiscountAmount();
      const subtotalUSD = totalAmountUSD;
      const finalShippingUSD = shippingCost;
      
      const finalTotalInCurrency = convertPrice(finalTotalUSD);
      const discountValueInCurrency = convertPrice(discountValueUSD);
      const subtotalInCurrency = convertPrice(subtotalUSD);
      const shippingInCurrency = convertPrice(finalShippingUSD);
      
      const productsInCurrency = context?.cartData?.map(item => ({
        ...item,
        price: convertPrice(parseFloat(item.price)),
        subTotal: convertPrice(parseFloat(item.price)),
        perUnit: convertPrice(parseFloat(item.price) / (parseInt(item.quantity) || 1))
      }));
      
      const payLoad = {
        userId: context?.userData?._id,
        products: productsInCurrency,
        paymentId: '',
        payment_status: "CASH ON DELIVERY",
        delivery_address: selectedAddressData,
        totalAmt: parseFloat(finalTotalInCurrency),
        subTotal: parseFloat(subtotalInCurrency),
        shippingCost: parseFloat(shippingInCurrency),
        discountCode: appliedDiscount?.code || null,
        discountAmount: parseFloat(discountValueInCurrency),
        currency: currency,
        date: new Date().toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })
      };

      const res = await postData(`/api/order/create`, payLoad);
      
      if (appliedDiscount && appliedDiscount?.code) {
        await postData("/api/discountCode/apply", { code: appliedDiscount.code });
      }

      if (res?.error === false) {
        context.alertBox("success", res?.message || "Order placed successfully!");
        
        await deleteData(`/api/cart/emptyCart/${context?.userData?._id}`);
        context?.getCartItems();
        localStorage.removeItem('appliedDiscount');
        
        history("/order/success");
      } else {
        context.alertBox("error", res?.message || "Failed to create order");
        setIsloading(false);
      }
    } catch (error) {
      console.error("Cash on Delivery Error:", error);
      context.alertBox("error", "Something went wrong. Please try again.");
      setIsloading(false);
}
  }

return (
    <section className="py-3 lg:py-10 px-3">
      <form>
        <div className="w-full lg:w-[70%] m-auto flex flex-col md:flex-row gap-5">
          <div className="leftCol w-full md:w-[60%]">
            <div className="card bg-white shadow-md p-5 rounded-md w-full">
              <div className="flex items-center justify-between">
                <h2>Select Delivery Address</h2>
                {
                  userData?.address_details?.length !== 0 &&
                  <Button variant="outlined"
                    onClick={() => {
                      context?.setOpenAddressPanel(true);
                      context?.setAddressMode("add");
                    }} className="btn">
                    <FaPlus />
                    ADD {context?.windowWidth< 767 ? '' : 'NEW ADDRESS'}
                  </Button>
                }

              </div>

              <br />

              <div className="flex flex-col gap-4">


                {
                  userData?.address_details?.length !== 0 ? userData?.address_details?.map((address, index) => {

                    return (
                      <label className={`flex gap-3 p-4 border border-[rgba(0,0,0,0.1)] rounded-md relative ${isChecked === index && 'bg-[#fff2f2]'}`} key={index}>
                        <div>
                          <Radio size="small" onChange={(e) => handleChange(e, index, address)}
                            checked={isChecked === index} value={address?._id} />
                        </div>
                        <div className="info">
                          <span className="inline-block text-[13px] font-[500] p-1 bg-[#f1f1f1] rounded-md">{address?.addressType}</span>
                          <h3>{userData?.name}</h3>
                          <p className="mt-0 mb-0">
                            {address?.address_line1 + " " + address?.city + " " + address?.country + " " + address?.state + " " + address?.landmark + ' ' + '+ ' + address?.mobile}
                          </p>

   
                          <p className="mb-0 font-[500]">{userData?.mobile !== null ? '+'+userData?.mobile : '+'+address?.mobile}</p>
                        </div>

                        <Button variant="text" className="!absolute top-[15px] right-[15px]" size="small"
                          onClick={() => editAddress(address?._id)}
                        >EDIT</Button>

                      </label>
                    )
                  })

                    :


                    <>
                      <div className="flex items-center mt-5 justify-between flex-col p-5">
                        <img src="/map.png" width="100" />
                        <h2 className="text-center">No Addresses found in your account!</h2>
                        <p className="mt-0">Add a delivery address.</p>
                        <Button className="btn-org" 
                        onClick={() => {
                          context?.setOpenAddressPanel(true);
                          context?.setAddressMode("add");
                        }}>ADD ADDRESS</Button>
                      </div>
                    </>

                }

              </div>


            </div>
          </div>

          <div className="rightCol w-full md:w-[40%]">
            <div className="card shadow-md bg-white p-4 sm:p-5 rounded-xl border border-gray-100">
              <h2 className="text-lg font-semibold mb-4">Order summary</h2>

<div className="space-y-3 mb-4 max-h-[250px] overflow-y-auto pr-2">
                {context?.cartData?.length !== 0 && context?.cartData?.map((item, index) => {
                  const itemOriginal = item.oldPrice || item.price;
                  const itemQty = item.quantity || 1;
                  const pricePerUnit = item.price / itemQty;
                  const itemSavings = itemOriginal - item.price;
                  
                  return (
                    <div key={index} className="flex gap-3 pb-3 border-b border-gray-50 last:border-0">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-md overflow-hidden bg-gray-50 shrink-0">
                        <img src={item?.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm line-clamp-2" title={item?.productTitle}>
                          {item?.productTitle}
                        </h4>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Qty: {itemQty}</p>
                        <p className="text-[10px] sm:text-xs text-gray-400">{displayPrice(pricePerUnit)} per unit</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm font-bold text-primary">
                            {displayPrice(item.price)}
                          </p>
                          {itemOriginal > item.price && (
                            <p className="text-xs text-gray-400 line-through">
                              {displayPrice(itemOriginal)}
                            </p>
                          )}
                        </div>
                        {itemSavings > 0 && (
                          <p className="text-[10px] text-green-600 font-medium">
                            Save {displayPrice(itemSavings)}!
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{displayPrice(totalAmountUSD)}</span>
                </div>
                {appliedDiscount && (
                  <div className="flex items-center justify-between text-green-600 text-sm">
                    <span className="flex items-center gap-1">
                      <FaCheckCircle className="text-xs" />
                      Discount ({appliedDiscount.code})
                    </span>
                    <span className="font-medium">
                      -{displayPrice(calculateDiscountAmount())}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  {loadingShipping ? (
                    <span className="text-gray-400">Calculating...</span>
                  ) : shippingInfo?.type === 'free' || shippingInfo?.type === 'free_threshold' ? (
                    <span className="text-green-600 font-medium">{shippingInfo?.label}</span>
                  ) : shippingCost > 0 ? (
                    <span className="font-medium">{displayPrice(shippingCost)}</span>
                  ) : shippingInfo?.type === 'none' ? (
                    <span className="text-orange-600">{shippingInfo?.label}</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </div>
                {shippingInfo?.delivery && (
                  <p className="text-xs text-gray-500 text-right">Estimated: {shippingInfo?.delivery}</p>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="font-semibold">Total</span>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      {displayPrice(calculateFinalTotal())}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase">{currency}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FaTag className="text-primary text-sm" />
                  <span className="font-semibold text-sm text-gray-700">Discount code</span>
                </div>
                
                {appliedDiscount ? (
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FaCheckCircle className="text-green-600" />
                        <span className="font-medium text-green-800">{appliedDiscount.code}</span>
                      </div>
                      <button
                        onClick={handleRemoveDiscount}
                        className="text-red-500 text-sm hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      {appliedDiscount.discountType === 'percentage' 
                        ? `${appliedDiscount.discountValue}% off` 
                        : `$${appliedDiscount.discountValue} off`
                      } - Save {displayPrice(calculateDiscountAmount())}
                    </p>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={discountCodeInput}
                      onChange={(e) => setDiscountCodeInput(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <button
                      onClick={handleApplyDiscountCode}
                      disabled={discountLoading}
                      className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {discountLoading ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                )}
                {discountError && (
                  <p className="text-red-500 text-xs mt-2">{discountError}</p>
                )}
              </div>

              <div className="flex items-center flex-col gap-3 mb-2 mt-4">
                <div className="flex gap-2 w-full">
                  <Button 
                    type="button" 
                    variant="contained"
                    className="btn-org btn-lg flex-1 flex gap-2 items-center justify-center"
                    onClick={cashOnDelivery}
                    disabled={isLoading || airwallexLoading}
                  >
                    {isLoading ? <CircularProgress size={20} color="inherit" /> : <><BsFillBagCheckFill className="text-[18px]" /> Cash on Delivery</>}
                  </Button>
                </div>

                <div className="w-full border border-gray-200 rounded-lg overflow-hidden">
                  <div 
                    className="w-full p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium flex items-center justify-between cursor-pointer"
                    onClick={() => setAirwallexLoading(!airwallexLoading)}
                  >
                    <div className="flex items-center gap-2">
                      <FaCreditCard />
                      <span>Pay with Card</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm opacity-80">
                      {airwallexLoading ? '▼' : '▶'}
                    </div>
                  </div>

                  {airwallexLoading && (
                    <div className="p-4 bg-gray-50">
                      <div className="flex items-center gap-2 mb-3 text-green-600 text-sm">
                        <FaLock />
                        <span>Secure Card Payment</span>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Cardholder Name</label>
                          <input
                            type="text"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Card Number</label>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <label className="block text-xs text-gray-600 mb-1">Expiry Date</label>
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                              placeholder="MM/YY"
                              maxLength={5}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs text-gray-600 mb-1">CVC</label>
                            <input
                              type="text"
                              value={cardCvc}
                              onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                              placeholder="123"
                              maxLength={4}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        
                        {cardError && (
                          <p className="text-red-500 text-sm">{cardError}</p>
                        )}
                        
                        <button
                          type="button"
                          onClick={handleAirwallexPayment}
                          disabled={airwallexLoading}
                          className="w-full py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {airwallexLoading ? (
                            <>
                              <CircularProgress size={20} color="inherit" />
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <FaLock />
                              <span>Pay {displayPrice(calculateFinalTotal())}</span>
                            </>
                          )}
                        </button>
                        
                        <p className="text-xs text-gray-400 text-center">
                          Your card will be charged in {currency}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div id="paypal-button-container" className={`w-full ${userData?.address_details?.length === 0 ? 'pointer-events-none opacity-50' : ''}`}></div>
              </div>

            </div>
          </div>
        </div>
      </form>
    </section>
  );
};

export default Checkout;
