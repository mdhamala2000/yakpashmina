import React, { useContext, useEffect, useState } from "react";
import HomeSlider from "../../components/HomeSlider";
import CatSubCatSlider from "../../components/CatSubCatSlider";
import ProductItem from "../../components/ProductItem";
import HomeProductSlider from "../../components/HomeProductSlider";
import ReviewsSlider from "../../components/ReviewsSlider";
import BlogSlider from "../../components/BlogSlider";
import { fetchDataFromApi } from "../../utils/api";
import { MyContext } from "../../App";
import BannerLoading from "../../components/LoadingSkeleton/bannerLoading";
import { Button } from "@mui/material";


import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { FaTh, FaAngleRight, FaFire, FaStar, FaClock } from "react-icons/fa";
import SEO from "../../components/SEO";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

const Home = () => {
  const [homeSlidesData, setHomeSlidesData] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [blogData, setBlogData] = useState([]);
  const [catWithProducts, setCatWithProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState(0);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const context = useContext(MyContext);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchAllData = async () => {
      try {
        const [slidesRes, featuredRes, blogRes, reviewsRes, recentRes] = await Promise.all([
          fetchDataFromApi("/api/homeSlides"),
          fetchDataFromApi("/api/product/getAllFeaturedProducts"),
          fetchDataFromApi("/api/blog"),
          fetchDataFromApi("/api/user/getAllReviews"),
          fetchDataFromApi("/api/product/getAllProducts?page=1&limit=12&sort=newest")
        ]);

        setHomeSlidesData(slidesRes?.data || []);
        setFeaturedProducts(featuredRes?.products || []);
        setBlogData(blogRes?.blogs || []);
        setRecentProducts(recentRes?.products || []);
        if (reviewsRes?.success) {
          setAllReviews(reviewsRes?.reviews || []);
        }
      } catch (error) {
        console.error("Error fetching home data:", error);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    const processCategories = async () => {
      if (!context?.catData?.length) {
        setLoading(false);
        return;
      }

      const validCats = context.catData.filter(cat => cat.productCount > 0);
      setCatWithProducts(validCats);

      if (validCats.length > 0) {
        setSelectedCat(0);
        await fetchProductsByCat(validCats[0]._id);
        
        const popRes = await fetchDataFromApi(`/api/product/getAllProducts?page=1&limit=12&sort=best_selling`);
        setPopularProducts(popRes?.products || []);
      }
      setLoading(false);
    };

    processCategories();
  }, [context?.catData]);

  const fetchProductsByCat = async (catId) => {
    setLoadingProducts(true);
    try {
      const res = await fetchDataFromApi(`/api/product/getAllProductsByCatId/${catId}?page=1&limit=12`);
      if (res?.error === false) {
        setProducts(res?.products || []);
      } else {
        setProducts([]);
      }
    } catch (e) {
      console.error("Error fetching products:", e);
      setProducts([]);
    }
    setLoadingProducts(false);
  }

  const handleTabChange = async (event, newValue) => {
    setSelectedCat(newValue);
    const cat = catWithProducts[newValue];
    if (cat) {
      await fetchProductsByCat(cat._id);
    }
  };

  const handleCatChipClick = (cat) => {
    const idx = catWithProducts.findIndex((c) => c._id === cat._id);
    if (idx !== -1 && idx !== selectedCat) {
      handleTabChange(null, idx);
    }
    document.getElementById("shop-collection-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const SectionHeader = ({ icon, title, subtitle, linkTo }) => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-700 rounded-xl flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      {linkTo && (
        <Link to={linkTo}>
          <Button className="!text-slate-700 !text-sm !font-medium" endIcon={<FaAngleRight />}>
            View All
          </Button>
        </Link>
      )}
    </div>
  );

  const ProductGrid = ({ data, loading, cols = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" }) => {
    if (loading) {
      return (
        <div className={`grid ${cols} gap-3 sm:gap-4`}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-xl aspect-[4/5]"></div>
              <div className="p-3 space-y-2">
                <div className="bg-gray-200 h-3 w-3/4 rounded"></div>
                <div className="bg-gray-200 h-3 w-1/2 rounded"></div>
                <div className="bg-gray-200 h-4 w-1/3 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTh className="text-3xl text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No products found</h3>
          <p className="text-sm text-gray-500">Try again later</p>
        </div>
      );
    }

    return (
      <div className={`grid ${cols} gap-3 sm:gap-4`}>
        {data.map((item, index) => (
          <ProductItem key={index} item={item} />
        ))}
      </div>
    );
  };

  return (
    <>
      <SEO 
        title="Home"
        description="Discover premium handwoven Pashmina shawls, scarves, and blankets from Nepal. Authentic cashmere products crafted by skilled artisans. Free worldwide shipping."
        url="/"
      />
      
      {homeSlidesData?.length === 0 && <BannerLoading />}
      {homeSlidesData?.length !== 0 && <HomeSlider data={homeSlidesData} />}

      {!loading && context?.catData?.length !== 0 && (
        <section className="bg-white py-4 lg:py-6 border-b border-gray-100">
          <div className="container">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] sm:text-[22px] lg:text-[26px] font-[700] text-gray-900">
                Categories
              </h2>
            </div>
            <CatSubCatSlider data={context?.catData || []} onCategoryClick={handleCatChipClick} />
          </div>
        </section>
      )}

      <section className="bg-white border-y border-gray-100 py-6 sm:py-8 lg:py-10">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center px-2 sm:px-4">
            <h2 className="text-[16px] sm:text-[20px] lg:text-[24px] font-[600] text-gray-800 mb-3 sm:mb-4 leading-tight">
              Fine Handmade Pashmina from the Looms of Nepal
            </h2>
            <p className="text-[12px] sm:text-[13px] lg:text-[14px] text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Handwoven in the quiet workshops of Nepal's Kathmandu Valley, each piece in our pashmina collection begins with the soft underdown of Himalayan Chyangra goats. Skilled artisans spin, dye, and weave every shawl entirely by hand using techniques passed down through generations.
            </p>
          </div>
        </div>
      </section>

      <section className="py-6 lg:py-10 bg-gray-50">
        <div className="container">
          <SectionHeader 
            icon={<FaFire className="text-white text-lg sm:text-xl" />}
            title="Popular Products"
            subtitle="Our best-selling handpicked items"
            linkTo="/products"
          />

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-3 sm:px-5 py-5 sm:py-6">
            <HomeProductSlider data={popularProducts} />
          </div>
        </div>
      </section>

      <section id="shop-collection-section" className="py-6 lg:py-10 bg-white">
        <div className="container">
          <SectionHeader 
            icon={<FaStar className="text-white text-lg sm:text-xl" />}
            title="Shop Our Collection"
            subtitle="Explore by category"
          />

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-100 overflow-x-auto scrollbar-hide">
              <Tabs
                value={selectedCat}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="category tabs"
                className="!px-2 sm:!px-4"
                TabIndicatorProps={{ style: { backgroundColor: '#475569' } }}
              >
                {catWithProducts.map((cat, index) => (
                  <Tab 
                    key={index} 
                    label={cat?.name} 
                    className="!text-sm !font-medium !min-w-fit !px-4 !py-3"
                    sx={{
                      color: '#6b7280',
                      '&.Mui-selected': { color: '#475569' }
                    }}
                  />
                ))}
              </Tabs>
            </div>

            <div className="px-3 sm:px-5 py-4 sm:py-6">
              {loadingProducts ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 rounded-xl aspect-[4/5]"></div>
                      <div className="p-3 space-y-2">
                        <div className="bg-gray-200 h-3 w-3/4 rounded"></div>
                        <div className="bg-gray-200 h-3 w-1/2 rounded"></div>
                        <div className="bg-gray-200 h-4 w-1/3 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaTh className="text-3xl text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No products found</h3>
                  <p className="text-sm text-gray-500">Try again later</p>
                </div>
              ) : (
                <HomeProductSlider data={products} />
              )}
              
              <div className="mt-6 text-center">
                <Link to="/products">
                  <Button 
                    variant="outlined" 
                    className="!border-slate-300 !text-slate-700 hover:!border-slate-500 !px-6 !py-2 !rounded-lg !font-medium"
                    endIcon={<FaAngleRight />}
                  >
                    View All Products
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 lg:py-8 bg-white">
        <div className="container">
          <Box className="bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded-2xl px-5 sm:px-8 lg:px-12 py-6 lg:py-8 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <Box className="flex items-center gap-4 sm:gap-5">
                <Box className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-700 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                  <span className="text-2xl sm:text-3xl">✈️</span>
                </Box>
                <Box>
                  <Typography className="!text-slate-800 !font-bold !text-[16px] sm:!text-[18px] lg:!text-[20px]">
                    Free Shipping Worldwide
                  </Typography>
                  <Typography className="!text-gray-500 !text-[12px] sm:!text-[13px] lg:!text-[14px]">
                    Nepal's Finest Handwoven Pashmina
                  </Typography>
                </Box>
              </Box>
              <Box className="hidden sm:block">
                <Typography className="!text-gray-600 !text-[13px] lg:!text-[15px] text-right !font-[500]">
                  Authentic craftsmanship<br/>
                  <span className="!text-gray-400">delivered to your door</span>
                </Typography>
              </Box>
            </div>
          </Box>
        </div>
      </section>

      <section className="py-6 lg:py-10 bg-gray-50">
        <div className="container">
          <SectionHeader 
            icon={<FaClock className="text-white text-lg sm:text-xl" />}
            title="Recently Added"
            subtitle="Fresh arrivals in our collection"
            linkTo="/products?sort=newest"
          />

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-3 sm:px-5 py-5 sm:py-6">
            <HomeProductSlider data={recentProducts} />
          </div>
        </div>
      </section>

      {featuredProducts?.length > 0 && (
        <section className="py-6 lg:py-10 bg-white">
          <div className="container">
            <SectionHeader 
              icon={<FaStar className="text-white text-lg sm:text-xl" />}
              title="Featured Products"
              subtitle="Our exclusive premium picks"
              linkTo="/products?featured=true"
            />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <ProductGrid data={featuredProducts} loading={loading} />
            </div>
          </div>
        </section>
      )}

      {allReviews?.length > 0 && (
        <section className="py-6 sm:py-8 bg-gray-50">
          <div className="container">
            <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-3">
              <div>
                <h2 className="text-[16px] sm:text-[18px] lg:text-[20px] font-[600]">Customer Reviews</h2>
                <p className="text-[12px] sm:text-[13px] text-gray-500 mt-1">See what our customers say</p>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/products">
                  <Button className="!bg-white !text-slate-700 !font-[500] !px-4 !py-1.5 !rounded-lg !text-sm !border !border-gray-300 hover:!bg-gray-50">
                    View Products
                  </Button>
                </Link>
                <Link to="/all-reviews">
                  <Button className="!bg-slate-700 !text-white !font-[500] !px-4 !py-1.5 !rounded-lg !text-sm">
                    View All
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-3 sm:px-5 py-5 sm:py-6">
              <ReviewsSlider data={allReviews} />
            </div>
          </div>
        </section>
      )}

      {blogData?.length > 0 && (
        <section className="py-6 sm:py-8 bg-white">
          <div className="container">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <h2 className="text-[16px] sm:text-[18px] lg:text-[20px] font-[600]">Latest Blog</h2>
              <Link to="/blog">
                <Button className="!bg-slate-700 !text-white !font-[500] !px-4 !py-1.5 !rounded-lg !text-sm">
                  View All
                </Button>
              </Link>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-3 sm:px-5 py-5 sm:py-6">
              <BlogSlider data={blogData} />
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default Home;