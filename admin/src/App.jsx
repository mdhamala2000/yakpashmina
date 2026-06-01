import "./App.css";
import "./responsive.css";
import React from 'react';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from "./Pages/Dashboard";
import Header from "./Components/Header";
import Sidebar from "./Components/Sidebar";
import { createContext, useState } from "react";
import AdminRoute from "./Components/AdminRoute";
import Login from "./Pages/Login";
import SignUp from "./Pages/SignUp";
import Products from "./Pages/Products";

import HomeSliderBanners from "./Pages/HomeSliderBanners";
import CategoryManager from "./Pages/Category/CategoryList";
import Users from "./Pages/Users";
import Orders from "./Pages/Orders";
import ForgotPassword from "./Pages/ForgotPassword";
import VerifyAccount from "./Pages/VerifyAccount";
import ChangePassword from "./Pages/ChangePassword";

import toast, { Toaster } from 'react-hot-toast';
import { fetchDataFromApi } from "./utils/api";
import { useEffect } from "react";
import Profile from "./Pages/Profile";
import ProductDetails from "./Pages/Products/productDetails";
import AddRAMS from "./Pages/Products/addRAMS.JSX";
import AddWeight from "./Pages/Products/addWeight";
import AddSize from "./Pages/Products/addSize";
import AddProductColor from "./Pages/Products/addProductColor";
import AddProductMaterials from "./Pages/Products/addProductMaterials";
import BannerV1List from "./Pages/Banners/bannerV1List";
import { BannerList2 } from "./Pages/Banners/bannerList2";
import { BlogList } from "./Pages/Blog";
import ManageLogo from "./Pages/ManageLogo";
import ManageReviews from "./Pages/ManageReviews";
import DiscountCodes from "./Pages/DiscountCodes";
import Shipping from "./Pages/Shipping";
import PaymentSettings from "./Pages/PaymentSettings";
import AbandonedCarts from "./Pages/AbandonedCarts";
import InventoryAlerts from "./Pages/InventoryAlerts";
import LoadingBar from "react-top-loading-bar";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const MyContext = createContext();
function App() {
  const [isSidebarOpen, setisSidebarOpen] = useState(true);
  const [isLogin, setIsLogin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [address, setAddress] = useState([]);
  const [catData, setCatData] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [sidebarWidth, setSidebarWidth] = useState(18);

  const [progress, setProgress] = useState(0);


  const [isOpenFullScreenPanel, setIsOpenFullScreenPanel] = useState({
    open: false,
    id: ""
  });

  const [productsRefreshTrigger, setProductsRefreshTrigger] = useState(0);


  useEffect(() => {
    localStorage.removeItem("userEmail")
    if (windowWidth < 992) {
      setisSidebarOpen(false);
      setSidebarWidth(100)
    } else {
      setSidebarWidth(18)
    }
  }, [windowWidth])


  useEffect(() => {
    if (userData?.role !== "ADMIN") {
      const handleContextmenu = e => {
        e.preventDefault()
      }
      document.addEventListener('contextmenu', handleContextmenu)
      return function cleanup() {
        document.removeEventListener('contextmenu', handleContextmenu)
      }
    }
  }, [userData])

  const router = createBrowserRouter([
    {
      path: "/",
      exact: true,
      element: (
        <AdminRoute>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />

              </div>
              <div
                className={`contentRight overflow-hidden py-4 px-5 ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <Dashboard />
              </div>
            </div>
          </section>
        </AdminRoute>
      ),
    },
    {
      path: "/login",
      exact: true,
      element: (
        <>
          <Login />
        </>
      ),
    },
    {
      path: "/sign-up",
      exact: true,
      element: (
        <>
          <SignUp />
        </>
      ),
    },
    {
      path: "/forgot-password",
      exact: true,
      element: (
        <>
          <ForgotPassword />
        </>
      ),
    },
    {
      path: "/verify-account",
      exact: true,
      element: (
        <>
          <VerifyAccount />
        </>
      ),
    },
    {
      path: "/change-password",
      exact: true,
      element: (
        <>
          <ChangePassword />
        </>
      ),
    },
    {
      path: "/products",
      exact: true,
      element: (
        <AdminRoute>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden py-4 px-5 ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <Products />
              </div>
            </div>
          </section>
        </AdminRoute>
      ),
    },
    {
      path: "/homeSlider/list",
      exact: true,
      element: (
        <AdminRoute>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden py-4 px-5 ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '82%' }}
              >
                <HomeSliderBanners />
              </div>
            </div>
          </section>
        </AdminRoute>
      ),
    },
    {
      path: "/category",
      exact: true,
      element: (
        <AdminRoute>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden py-4 px-5 ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '82%' }}
              >
                <CategoryManager />
              </div>
            </div>
          </section>
        </AdminRoute>
      ),
    },
    {
      path: "/users",
      exact: true,
      element: (
        <AdminRoute>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden py-4 px-5 ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <Users />
              </div>
            </div>
          </section>
        </AdminRoute>
      ),
    },
    {
      path: "/orders",
      exact: true,
      element: (
        <AdminRoute>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden py-4 px-5 ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <Orders />
              </div>
            </div>
          </section>
        </AdminRoute>
      ),
    },
    {
      path: "/profile",
      exact: true,
      element: (
        <AdminRoute>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden py-4 px-5 ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <Profile />
              </div>
            </div>
          </section>
        </AdminRoute>
      ),
    },
    {
      path: "/product/:id",
      exact: true,
      element: (
        <AdminRoute>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden py-4 px-5 ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <ProductDetails />
              </div>
            </div>
          </section>
        </AdminRoute>
      ),
    },

    {
      path: "/product/addRams",
      exact: true,
      element: (
        <AdminRoute>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden py-4 px-5 ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <AddRAMS />
              </div>
            </div>
          </section>
        </AdminRoute>
      ),
    },
    {
      path: "/product/addWeight",
      exact: true,
      element: (
        <AdminRoute>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden py-4 px-5 ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <AddWeight />
              </div>
            </div>
          </section>
        </AdminRoute>
      ),
    },
    {
      path: "/product/addSize",
      exact: true,
      element: (
        <AdminRoute>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden py-4 px-5 ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <AddSize />
              </div>
            </div>
          </section>
        </AdminRoute>
      ),
    },
    {
      path: "/product/addColor",
      exact: true,
      element: (
        <AdminRoute>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden py-4 px-5 ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <AddProductColor />
              </div>
            </div>
          </section>
        </AdminRoute>
      ),
    },
    {
      path: "/product/addMaterials",
      exact: true,
      element: (
        <AdminRoute>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden py-4 px-5 ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <AddProductMaterials />
              </div>
            </div>
          </section>
        </AdminRoute>
      ),
    },
    {
      path: "/bannerV1/list",
      exact: true,
      element: (
        <AdminRoute>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden py-4 px-5 ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <BannerV1List />
              </div>
            </div>
          </section>
        </AdminRoute>
      ),
    },
    {
      path: "/bannerlist2/List",
      exact: true,
      element: (
        <AdminRoute>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden py-4 px-5 ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <BannerList2 />
              </div>
            </div>
          </section>
        </AdminRoute>
      ),
    },
    {
      path: "/blog/List",
      exact: true,
      element: (
        <AdminRoute>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden py-4 px-5 ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <BlogList />
              </div>
            </div>
          </section>
        </AdminRoute>
      ),
    },
    {
      path: "/logo/manage",
      exact: true,
      element: (
        <AdminRoute>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden py-4 px-5 ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <ManageLogo />
              </div>
            </div>
          </section>
        </AdminRoute>
      ),
    },
    {
      path: "/reviews/manage",
      exact: true,
      element: (
        <AdminRoute>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden py-4 px-5 ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <ManageReviews />
              </div>
            </div>
          </section>
        </AdminRoute>
      ),
    },
    {
      path: "/discountCodes",
      exact: true,
      element: (
        <AdminRoute>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden py-4 px-5 ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <DiscountCodes />
              </div>
            </div>
          </section>
        </AdminRoute>
      ),
    },
    {
      path: "/shipping",
      exact: true,
      element: (
        <AdminRoute>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden py-4 px-5 ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <Shipping />
              </div>
            </div>
          </section>
        </AdminRoute>
      ),
    },
    {
      path: "/payment-settings",
      exact: true,
      element: (
        <AdminRoute>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden py-4 px-5 ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <PaymentSettings />
              </div>
            </div>
          </section>
        </AdminRoute>
      ),
    },
    {
      path: "/inventory-alerts",
      exact: true,
      element: (
        <AdminRoute>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden py-4 px-5 ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <InventoryAlerts />
              </div>
            </div>
          </section>
        </AdminRoute>
      ),
    },
    {
      path: "/abandoned-carts",
      exact: true,
      element: (
        <AdminRoute>
          <section className="main">
            <Header />
            <div className="contentMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? windowWidth < 992 ? `w-[${sidebarWidth / 1.5}%]` : `w-[20%]` : "w-[0px] opacity-0 invisible"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight overflow-hidden py-4 px-5 ${isSidebarOpen === true && windowWidth < 992 && 'opacity-0'}  transition-all`}
                style={{ width: isSidebarOpen === false ? "100%" : '80%' }}
              >
                <AbandonedCarts />
              </div>
            </div>
          </section>
        </AdminRoute>
      ),
    },
  ]);

  const alertBox = (type, msg) => {
    if (type === "success") {
      toast.success(msg)
    }
    if (type === "error") {
      toast.error(msg)
    }
  }


  useEffect(() => {

    fetchDataFromApi(`/api/user/user-details`).then((res) => {
      if (res && res.data) {
        setIsLogin(true);
        setUserData(res.data);
      } else {
        setIsLogin(false);
      }
    }).catch(() => {
      setIsLogin(false);
    })

  }, [])


  useEffect(() => {
    getCat();

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };

  }, [])


  const getCat = () => {
    fetchDataFromApi("/api/category").then((res) => {
      setCatData(res?.data)
    })
  }


  const values = {
    isSidebarOpen,
    setisSidebarOpen,
    isLogin,
    setIsLogin,
    isOpenFullScreenPanel,
    setIsOpenFullScreenPanel,
    alertBox,
    setUserData,
    userData,
    setAddress,
    address,
    catData,
    setCatData,
    getCat,
    windowWidth,
    setSidebarWidth,
    sidebarWidth,
    setProgress,
    progress,
    productsRefreshTrigger,
    setProductsRefreshTrigger
  };

  return (
    <QueryClientProvider client={queryClient}>
      <MyContext.Provider value={values}>
        <RouterProvider router={router} />
        <LoadingBar
          color="#1565c0"
          progress={progress}
          onLoaderFinished={() => setProgress(0)}
          className="topLoadingBar"
          height={3}
        />
        <Toaster />
      </MyContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
export { MyContext };
