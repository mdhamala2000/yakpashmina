import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import SEO from "./components/SEO";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [pathname]);
  
  return null;
};

import "./App.css";
import "./responsive.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";
import Home from "./Pages/Home";
import ProductListing from "./Pages/ProductListing";
import ProductDetails from "./Pages/ProductDetails";
import CategoryPage from "./Pages/Category";
import ProductPage from "./Pages/Product";
import { createContext } from "react";
import { FaWhatsapp, FaEnvelope, FaPhone } from "react-icons/fa";

import Login from "./Pages/Login";
import Register from "./Pages/Register";
import CartPage from "./Pages/Cart";
import Verify from "./Pages/Verify";
import ForgotPassword from "./Pages/ForgotPassword";
import Checkout from "./Pages/Checkout";
import MyAccount from "./Pages/MyAccount";
import MyList from "./Pages/MyList";
import Orders from "./Pages/Orders";

import toast, { Toaster } from 'react-hot-toast';
import { fetchDataFromApi, postData } from "./utils/api";
import Address from "./Pages/MyAccount/address";
import { OrderSuccess } from "./Pages/Orders/success";
import { OrderFailed } from "./Pages/Orders/failed";
import AirwallexPayment from "./Pages/AirwallexPayment";
import SearchPage from "./Pages/Search";
import { CurrencyProvider } from "./context/CurrencyContext";
import BlogDetails from "./Pages/Blog/BlogDetails";
import Blog from "./Pages/Blog";
import AllReviews from "./Pages/AllReviews";
import Contact from "./Pages/Contact";
import WhatIsPashmina from "./Pages/WhatIsPashmina";
import PrivacyPolicy from "./Pages/PrivacyPolicy";
import RefundReturnPolicy from "./Pages/RefundReturnPolicy";
import ShippingPolicy from "./Pages/ShippingPolicy";
import TermsOfService from "./Pages/TermsOfService";
import Sitemap from "./Pages/Sitemap";
import NotFound from "./Pages/NotFound";
import OrderTracking from "./Pages/OrderTracking";
import StripeDashboard from "./components/StripeDashboard";
import CompareModal from "./components/CompareModal";


const MyContext = createContext();

function App() {
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [openProductDetailsModal, setOpenProductDetailsModal] = useState({
    open: false,
    item: {}
  });
  const [isLogin, setIsLogin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [catData, setCatData] = useState([]);
  const [cartData, setCartData] = useState([]);
  const [myListData, setMyListData] = useState([]);

  const [openCartPanel, setOpenCartPanel] = useState(false);
  const [openAddressPanel, setOpenAddressPanel] = useState(false);

  const [addressMode, setAddressMode] = useState("add");
  const [addressId, setAddressId] = useState("");
  const [searchData, setSearchData] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const [openFilter, setOpenFilter] = useState(false);
  const [isFilterBtnShow, setisFilterBtnShow] = useState(false);

  const [openSearchPanel, setOpenSearchPanel] = useState(false);
  const [compareList, setCompareList] = useState([]);
  const [openCompareModal, setOpenCompareModal] = useState(false);

  const handleOpenProductDetailsModal = (status, item) => {
    setOpenProductDetailsModal({
      open: status,
      item: item
    });
  }

  const handleCloseProductDetailsModal = () => {
    setOpenProductDetailsModal({
      open: false,
      item: {}
    });
  };

  const toggleCartPanel = (newOpen) => () => {
    setOpenCartPanel(newOpen);
  };

  const toggleAddressPanel = (newOpen) => () => {
    if (newOpen == false) {
      setAddressMode("add");
    }

    setOpenAddressPanel(newOpen);
  };




  useEffect(() => {
    localStorage.removeItem("userEmail")
    
    fetchDataFromApi('/api/user/user-details').then((res) => {
      if (res?.data) {
        setIsLogin(true);
        getCartItems();
        getMyListData();
        setUserData(res.data);
      }
    }).catch(() => {
      setIsLogin(false);
    })


  }, [isLogin])


  const getUserDetails = () => {
    fetchDataFromApi(`/api/user/user-details`).then((res) => {
      setUserData(res.data);
      if (res?.response?.data?.error === true) {
        if (res?.response?.data?.message === "You have not login") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          alertBox("error", "Your session is closed please login again");


          //window.location.href = "/login"

          setIsLogin(false);
        }
      }
    })
  }



  useEffect(() => {
    fetchDataFromApi("/api/category").then((res) => {
      if (res?.error === false) {
        setCatData(res?.data);
      }
    })

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };

  }, []);

  const alertBox = (type, msg) => {
    if (type === "success") {
      toast.success(msg)
    }
    if (type === "error") {
      toast.error(msg)
    }
  }



  const addToCart = (product, userId, quantity) => {

    if (userId === undefined) {
      alertBox("error", "you are not login please login first");
      return false;
    }

    if (product?.countInStock <= 0) {
      alertBox("error", "Sorry, this item is currently out of stock!");
      return false;
    }

    if (product?.countInStock < quantity) {
      alertBox("error", `Only ${product?.countInStock} items available in stock!`);
      return false;
    }

    const data = {
      productTitle: product?.name || product?.productTitle || 'Unnamed Product',
      image: product?.images?.[0] || product?.image || '',
      rating: product?.rating || 0,
      price: product?.price || 0,
      oldPrice: product?.oldPrice || 0,
      discount: product?.discount || 0,
      quantity: quantity,
      subTotal: parseInt((product?.price || 0) * quantity),
      productId: product?._id || product?.productId,
      countInStock: product?.countInStock || 0,
      brand: product?.brand || '',
      size: product?.size || '',
      weight: product?.weight || '',
      ram: product?.ram || '',
      color: product?.color || '',
      materials: product?.materials || ''
    }


    postData("/api/cart/add", data).then((res) => {
      if (res?.error === false) {
        alertBox("success", res?.message);

        getCartItems();


      } else {
        alertBox("error", res?.message);
      }

    })


  }



  const getCartItems = () => {
    fetchDataFromApi(`/api/cart/get`).then((res) => {
      if (res?.error === false) {
        setCartData(res?.data);
      }
    })
  }



  const getMyListData = () => {
    fetchDataFromApi("/api/myList").then((res) => {
      if (res?.error === false) {
        setMyListData(res?.data)
      }
    })
  }

  const values = {
    openProductDetailsModal,
    setOpenProductDetailsModal,
    handleOpenProductDetailsModal,
    handleCloseProductDetailsModal,
    setOpenCartPanel,
    toggleCartPanel,
    openCartPanel,
    setOpenAddressPanel,
    toggleAddressPanel,
    openAddressPanel,
    isLogin,
    setIsLogin,
    alertBox,
    setUserData,
    userData,
    setCatData,
    catData,
    addToCart,
    cartData,
    setCartData,
    getCartItems,
    myListData,
    setMyListData,
    getMyListData,
    getUserDetails,
    setAddressMode,
    addressMode,
    addressId,
    setAddressId,
    setSearchData,
    searchData,
    windowWidth,
    setOpenFilter,
    openFilter,
    setisFilterBtnShow,
    isFilterBtnShow,
    setOpenSearchPanel,
    openSearchPanel,
    compareList,
    setCompareList,
    openCompareModal,
    setOpenCompareModal
  };

  return (
    <>
      <HelmetProvider>
        <SEO 
          title=""
          description="Premium handwoven Pashmina shawls and scarves from Nepal. 100% authentic cashmere, handcrafted by skilled artisans. Free worldwide shipping."
        />
<BrowserRouter>
          <ScrollToTop />
          <CurrencyProvider>
            <MyContext.Provider value={values}>
              <Header />
              <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<ProductListing />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              {/* ID-based route must come before slug routes */}
              <Route path="/category/:id" element={<ProductListing />} />
              {/* SEO-friendly routes */}
              <Route path="/product/slug/:productSlug" element={<ProductPage />} />
              <Route path="/category/:categorySlug" element={<CategoryPage />} />
              <Route path="/category/:categorySlug/:subCategorySlug" element={<CategoryPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
              <Route path="/my-account" element={<PrivateRoute><MyAccount /></PrivateRoute>} />
              <Route path="/my-list" element={<PrivateRoute><MyList /></PrivateRoute>} />
              <Route path="/my-orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
<Route path="/order/success" element={<OrderSuccess />} />
<Route path="/order/failed" element={<OrderFailed />} />
<Route path="/order/airwallex-return" element={<AirwallexPayment />} />
              <Route path="/address" element={<PrivateRoute><Address /></PrivateRoute>} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/blog/:id" element={<BlogDetails />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/all-reviews" element={<AllReviews />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/what-is-pashmina" element={<WhatIsPashmina />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/refund-return-policy" element={<RefundReturnPolicy />} />
              <Route path="/shipping-policy" element={<ShippingPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/sitemap" element={<Sitemap />} />
              <Route path="/order-tracking" element={<OrderTracking />} />
              <Route path="/admin/stripe-dashboard" element={<PrivateRoute><StripeDashboard /></PrivateRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
              <CompareModal />
              
              <div className={`whatsapp-chat-fixed ${values?.openCartPanel ? 'cart-open' : ''}`}>
              <div className="whatsapp-float-container">
                <div 
                  className={`whatsapp-float-main ${whatsappOpen ? 'active' : ''}`}
                  onClick={() => setWhatsappOpen(!whatsappOpen)}
                >
                  <FaWhatsapp className="whatsapp-float-icon" />
                  <span className="whatsapp-float-label">Chat</span>
                </div>
                <div className="whatsapp-float-options">
                  <a href="https://wa.me/9779841321806" target="_blank" rel="noopener noreferrer" className="whatsapp-float-option wa-primary">
                    <FaWhatsapp />
                    <span>Nepal</span>
                  </a>
                  <a href="https://wa.me/85265492201" target="_blank" rel="noopener noreferrer" className="whatsapp-float-option wa-hongkong">
                    <FaWhatsapp />
                    <span>Hong Kong</span>
                  </a>
                  <a href="mailto:mdhamala2000@gmail.com" className="whatsapp-float-option email-option">
                    <FaEnvelope />
                    <span>Email</span>
                  </a>
                  <a href="tel:+9779841321806" className="whatsapp-float-option phone-option">
                    <FaPhone />
                    <span>Call</span>
                  </a>
                </div>
              </div>
            </div>
          </MyContext.Provider>
        </CurrencyProvider>
      </BrowserRouter>
      </HelmetProvider>

      <Toaster />
    </>
  );
}

export default App;

export { MyContext };
