import React, { useContext, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import { BsFillBagCheckFill } from "react-icons/bs";
import CartItems from "./cartItems";
import { MyContext } from "../../App";
import { fetchDataFromApi, postData } from "../../utils/api";
import { Link } from "react-router-dom";
import { useCurrency } from "../../context/CurrencyContext";
import ProductsSlider from "../../components/ProductsSlider";
import Rating from "@mui/material/Rating";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import { FaUserCircle } from "react-icons/fa";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import { FaTag, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const CartPage = () => {
  const [productSizeData, setProductSizeData] = useState([]);
  const [productRamsData, setProductRamsData] = useState([]);
  const [productWeightData, setProductWeightData] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountError, setDiscountError] = useState("");
  const context = useContext(MyContext);
  const { formatPrice, convertPrice, convertBackToUSD } = useCurrency();

  useEffect(() => {
    window.scrollTo(0, 0);
    const savedDiscount = localStorage.getItem('appliedDiscount');
    if (savedDiscount) {
      try {
        setAppliedDiscount(JSON.parse(savedDiscount));
      } catch (e) {
        localStorage.removeItem('appliedDiscount');
      }
    }
    fetchDataFromApi("/api/product/productSize/get").then((res) => {
      if (res?.error === false) setProductSizeData(res?.data)
    })
    fetchDataFromApi("/api/product/productRAMS/get").then((res) => {
      if (res?.error === false) setProductRamsData(res?.data)
    })
    fetchDataFromApi("/api/product/productWeight/get").then((res) => {
      if (res?.error === false) setProductWeightData(res?.data)
    })
    fetchDataFromApi("/api/product/getAllProducts?page=1&limit=10").then((res) => {
      if (res?.success) setRecommendedProducts(res?.products || [])
    })
    fetchDataFromApi("/api/user/getAllReviews").then((res) => {
      if (res?.success) setAllReviews(res?.reviews || [])
    })
  }, [])

  const calculateSubtotal = () => {
    if (context.cartData?.length === 0) return 0;
    const total = context.cartData?.reduce((total, item) => total + parseFloat(item.price), 0);
    return total;
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError("Please enter a discount code");
      return;
    }
    setDiscountLoading(true);
    setDiscountError("");
    const cartTotalUSD = calculateSubtotal();
    try {
      const res = await postData("/api/discountCode/validate", { code: discountCode, cartTotal: cartTotalUSD, cartItems: context.cartData });
      if (res?.success === false) {
        setDiscountError(res?.message || "Invalid discount code");
        setAppliedDiscount(null);
        localStorage.removeItem('appliedDiscount');
      } else {
        setAppliedDiscount(res?.data);
        localStorage.setItem('appliedDiscount', JSON.stringify(res?.data));
      }
    } catch (error) {
      setDiscountError("Failed to apply discount code");
    }
    setDiscountLoading(false);
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode("");
    localStorage.removeItem('appliedDiscount');
  };

  const calculateDiscount = () => {
    if (!appliedDiscount) return 0;
    const subtotal = calculateSubtotal();
    if (appliedDiscount.discountType === 'percentage') {
      const discountPercent = appliedDiscount.discountValue || 0;
      return (subtotal * discountPercent) / 100;
    }
    return appliedDiscount.discountAmount || 0;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    if (!appliedDiscount) return subtotal;
    return Math.max(0, subtotal - (appliedDiscount.discountAmount || calculateDiscount()));
  };

// Mobile vs Desktop Layout
  return (
    <section className="bg-gray-50 py-6 lg:py-10">
      <div className="container">
        
        {/* Mobile: Stacked Layout */}
        <div className="lg:hidden space-y-4">
          <CartItemsSection 
            productSizeData={productSizeData} 
            productRamsData={productRamsData} 
            productWeightData={productWeightData} 
          />
          
          <MobileCartView 
            calculateSubtotal={calculateSubtotal}
            appliedDiscount={appliedDiscount}
            calculateDiscount={calculateDiscount}
            calculateTotal={calculateTotal}
          />
          
          {context?.cartData?.length !== 0 && <YouMayAlsoLikeSection recommendedProducts={recommendedProducts} />}
          <CustomerReviewsSection allReviews={allReviews} />
        </div>

        {/* Desktop: Two Column Professional Layout */}
        <div className="hidden lg:block">
          <div className="flex gap-8">
            {/* Left - Cart Items */}
            <div className="flex-1">
              <CartItemsSection 
                productSizeData={productSizeData} 
                productRamsData={productRamsData} 
                productWeightData={productWeightData} 
              />
              
              {context?.cartData?.length !== 0 && (
                <div className="mt-6">
                  <YouMayAlsoLikeSection recommendedProducts={recommendedProducts} />
                </div>
              )}
              
              <div className="mt-6">
                <CustomerReviewsSection allReviews={allReviews} />
              </div>
            </div>

            {/* Right - Sticky Cart Totals */}
            <div className="w-[380px] flex-shrink-0">
              <div className="sticky top-24">
                <CartTotalsSection 
                  calculateSubtotal={calculateSubtotal} 
                  appliedDiscount={appliedDiscount} 
                  calculateDiscount={calculateDiscount} 
                  calculateTotal={calculateTotal} 
                  discountCode={discountCode} 
                  setDiscountCode={setDiscountCode} 
                  discountLoading={discountLoading} 
                  discountError={discountError} 
                  handleApplyDiscount={handleApplyDiscount} 
                  handleRemoveDiscount={handleRemoveDiscount} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Cart Items Section Component
const CartItemsSection = ({ productSizeData, productRamsData, productWeightData }) => {
  const context = useContext(MyContext);

  return (
    <div className="shadow-lg rounded-2xl bg-white overflow-hidden mb-4 lg:mb-6">
      <div className="py-4 px-4 lg:py-6 lg:px-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-800">Your Cart</h2>
        <p className="mt-1 text-sm lg:text-base text-gray-500">
          There are <span className="font-bold text-primary">{context?.cartData?.length}</span>{" "}
          {context?.cartData?.length === 1 ? 'product' : 'products'} in your cart
        </p>
      </div>

      {context?.cartData?.length !== 0 ? (
        context?.cartData?.map((item, index) => (
          <CartItems key={index} qty={item?.quantity} item={item} productSizeData={productSizeData} productRamsData={productRamsData} productWeightData={productWeightData} />
        ))
      ) : (
        <div className="flex items-center justify-center flex-col py-12 lg:py-16 gap-4">
          <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 lg:w-16 lg:h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h4 className="text-lg lg:text-xl font-semibold text-gray-700">Your Cart is currently empty</h4>
          <p className="text-gray-500 text-sm text-center px-4">Looks like you haven't added anything to your cart yet.</p>
          <Link to="/">
            <Button className="btn-org px-6 lg:px-8 py-2 lg:py-2.5 rounded-full font-semibold text-sm lg:text-base">Continue Shopping</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

// Mobile Cart Summary (Simple - just totals and checkout)
const MobileCartView = ({ calculateSubtotal, appliedDiscount, calculateDiscount, calculateTotal }) => {
  const context = useContext(MyContext);
  const { convertPrice, currency } = useCurrency();
  
  const symbol = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'AUD' ? 'A$' : currency === 'CAD' ? 'C$' : currency === 'AED' ? 'د.إ' : '$';

  if (context?.cartData?.length === 0) return null;

  const subtotal = convertPrice(calculateSubtotal());
  const total = convertPrice(calculateTotal());

  return (
    <div className="shadow-lg rounded-2xl bg-white overflow-hidden">
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-3">Cart Summary</h3>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold">{symbol}{subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          {appliedDiscount && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-{symbol}{convertPrice(calculateDiscount()).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>
            <span className="text-orange-600 text-sm">Calculated at checkout</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between">
            <span className="font-semibold">Total</span>
            <span className="text-primary font-bold text-lg">{symbol}{total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <Link to="/checkout" className="block mt-4">
          <Button className="btn-org w-full py-3 rounded-xl font-semibold">
            Proceed to Checkout
          </Button>
        </Link>
      </div>
    </div>
  );
};

// Cart Totals Section Component
const CartTotalsSection = ({ calculateSubtotal, appliedDiscount, calculateDiscount, calculateTotal, discountCode, setDiscountCode, discountLoading, discountError, handleApplyDiscount, handleRemoveDiscount }) => {
  const context = useContext(MyContext);
  const { formatPrice, convertPrice, currency } = useCurrency();
  
  if (context?.cartData?.length === 0) return null;

  const subtotalUSD = calculateSubtotal();
  const totalUSD = calculateTotal();
  const discountUSD = calculateDiscount();

  const convertedSubtotal = convertPrice(subtotalUSD);
  const convertedTotal = convertPrice(totalUSD);
  const convertedDiscount = convertPrice(discountUSD);
  
  const symbol = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'AUD' ? 'A$' : currency === 'CAD' ? 'C$' : currency === 'AED' ? 'د.إ' : '$';
  
  return (
    <div className="shadow-lg rounded-2xl bg-white overflow-hidden mb-4 lg:mb-0 sticky top-[100px]">
      <div className="p-4 lg:p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Cart Totals</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold text-gray-800">{symbol}{convertedSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          {appliedDiscount && (
            <div className="flex items-center justify-between text-green-600">
              <span>Discount</span>
              <span className="font-semibold">-{symbol}{convertedDiscount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Shipping</span>
            <span className="text-orange-600 text-sm">Calculated at checkout</span>
          </div>
          <hr className="border-gray-100" />
          <div className="flex items-center justify-between">
            <span className="text-gray-800 font-semibold text-lg">Total</span>
            <span className="text-primary font-bold text-xl lg:text-2xl">{symbol}{convertedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="mt-4 lg:mt-5 p-3 lg:p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <FaTag className="text-primary text-sm" />
            <span className="font-semibold text-sm text-gray-700">Discount Code</span>
          </div>
          {!appliedDiscount ? (
            <div className="flex gap-2">
              <TextField fullWidth size="small" placeholder="Enter code" value={discountCode} onChange={(e) => setDiscountCode(e.target.value.toUpperCase())} className="!bg-white !text-sm" />
              <Button variant="contained" onClick={handleApplyDiscount} disabled={discountLoading} className="!bg-primary !normal-case !px-3 !text-sm">
                {discountLoading ? <CircularProgress size={18} color="inherit" /> : "Apply"}
              </Button>
            </div>
          ) : (
            <div className="bg-green-50 rounded-lg p-2 lg:p-3 border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-600 text-sm" />
                  <span className="font-medium text-green-800 text-sm">{appliedDiscount.code}</span>
                </div>
                <button onClick={handleRemoveDiscount} className="text-red-500 text-xs hover:text-red-700 font-medium">Remove</button>
              </div>
            </div>
          )}
          {discountError && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><FaTimesCircle className="text-xs" />{discountError}</p>}
        </div>

        <Link to={context?.cartData?.length > 0 ? "/checkout" : "/products"} className="block mt-4">
          <Button className="btn-org btn-lg w-full flex gap-2 items-center justify-center py-3 lg:py-3.5 rounded-xl font-semibold text-base lg:text-lg shadow-lg hover:shadow-xl transition-shadow">
            <BsFillBagCheckFill className="text-lg lg:text-xl" /> Proceed to Checkout
          </Button>
        </Link>

        <div className="mt-3 flex items-center justify-center gap-2 text-gray-500 text-xs">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Secure checkout
        </div>
      </div>
    </div>
  );
};

// You May Also Like Section Component
const YouMayAlsoLikeSection = ({ recommendedProducts }) => {
  if (recommendedProducts?.length === 0) return null;
  
  return (
    <div className="shadow-lg rounded-2xl bg-white overflow-hidden mb-4 lg:mb-6">
      <div className="py-4 px-4 lg:py-5 lg:px-5 border-b border-gray-100">
        <h3 className="text-lg lg:text-xl font-bold text-gray-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
            <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.105.777V17a1 1 0 001.447.894l4 2zM13.447 11.894l4-2A1 1 0 0017 9.236V6.764a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.105.777V9.236a1 1 0 001.447.894l4 2z" />
          </svg>
          You May Also Like
        </h3>
      </div>
      <div className="p-4 lg:p-5">
        <ProductsSlider items={4} data={recommendedProducts} />
      </div>
    </div>
  );
};

// Customer Reviews Section Component - Same as Home page
const CustomerReviewsSection = ({ allReviews }) => {
  if (!allReviews || allReviews?.length === 0) return null;
  
  return (
    <div className="shadow-lg rounded-2xl bg-white overflow-hidden">
      <div className="py-4 px-4 lg:py-5 lg:px-5 border-b border-gray-100">
        <h3 className="text-lg lg:text-xl font-bold text-gray-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-3A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
          </svg>
          Customer Reviews
        </h3>
      </div>
      <div className="p-4 lg:p-5">
        <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2">
          {allReviews.slice(0, 5).map((review, index) => (
            <Box key={index} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
              <Avatar src={review?.userName ? `https://ui-avatars.com/api/?name=${review.userName}&background=random` : ''} className="!w-10 !h-10">
                <FaUserCircle className="!text-2xl text-gray-400" />
              </Avatar>
              <Box className="flex-1">
                <Box className="flex items-center justify-between mb-1">
                  <Typography className="!font-[600] !text-sm !text-gray-800">
                    {review?.userName || 'Anonymous'}
                  </Typography>
                  <Typography className="!text-[11px] !text-gray-500">
                    {review?.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                  </Typography>
                </Box>
                <Rating value={review?.rating || 5} size="small" readOnly className="!mb-1" />
                <Typography className="!text-[13px] !text-gray-600">
                  {review?.review}
                </Typography>
              </Box>
            </Box>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CartPage;