import React, { useContext, useEffect, useState } from "react";
import HomeSlider from "../../components/HomeSlider";
import ModernHomeCat from "../../components/ModernHomeCat";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import ProductsSlider from "../../components/ProductsSlider";
import HomeProductItem from "../../components/HomeProductItem";
import BlogItem from "../../components/BlogItem";
import { fetchDataFromApi } from "../../utils/api";
import { MyContext } from "../../App";
import ProductLoading from "../../components/ProductLoading";
import BannerLoading from "../../components/LoadingSkeleton/bannerLoading";
import { Button } from "@mui/material";
import { MdArrowRightAlt } from "react-icons/md";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import { FaUserCircle } from "react-icons/fa";
import Chip from "@mui/material/Chip";
import SEO from "../../components/SEO";

const Home = () => {
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [homeSlidesData, setHomeSlidesData] = useState([]);
  const [popularProductsData, setPopularProductsData] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recentlyAddedProducts, setRecentlyAddedProducts] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [blogData, setBlogData] = useState([]);
  const [catWithProducts, setCatWithProducts] = useState([]);

  const context = useContext(MyContext);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchAllData = async () => {
      try {
        const [slidesRes, featuredRes, blogRes, recentRes, reviewsRes] = await Promise.all([
          fetchDataFromApi("/api/homeSlides"),
          fetchDataFromApi("/api/product/getAllFeaturedProducts"),
          fetchDataFromApi("/api/blog"),
          fetchDataFromApi("/api/product/getAllProducts?page=1&limit=12&sort=newest"),
          fetchDataFromApi("/api/user/getAllReviews")
        ]);

        setHomeSlidesData(slidesRes?.data || []);
        setFeaturedProducts(featuredRes?.products || []);
        setBlogData(blogRes?.blogs || []);
        setRecentlyAddedProducts(recentRes?.products || []);
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
        setValue(0);
        try {
          const res = await fetchDataFromApi(`/api/product/getAllProductsByCatId/${validCats[0]._id}?page=1&limit=6`);
          if (res?.error === false) {
            setPopularProductsData(res?.products || []);
          }
        } catch (e) {
          console.error("Error fetching products:", e);
        }
      }
      setLoading(false);
    };

    processCategories();
  }, [context?.catData]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const filterByCatId = (id) => {
    fetchDataFromApi(`/api/product/getAllProductsByCatId/${id}?page=1&limit=6`).then((res) => {
      if (res?.error === false) {
        setPopularProductsData(res?.products || [])
      }
    })
  }

  return (
    <>
      <SEO 
        title="Home"
        description="Discover premium handwoven Pashmina shawls, scarves, and blankets from Nepal. Authentic cashmere products crafted by skilled artisans. Free worldwide shipping."
        url="/"
      />
      <SEO 
        type="website"
        schema={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Yak Pashmina",
          "url": "https://yakpashamina.com",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://yakpashamina.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }}
      />
      <SEO 
        type="organization"
        schema={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Yak Pashmina",
          "url": "https://yakpashamina.com",
          "logo": "https://yakpashamina.com/logo.jpg",
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+977-9841321806",
            "contactType": "customer service"
          },
          "sameAs": [
            "https://wa.me/9779841321806",
            "https://wa.me/85265492201"
          ]
        }}
      />
      {homeSlidesData?.length === 0 && <BannerLoading />}
      {homeSlidesData?.length !== 0 && <HomeSlider data={homeSlidesData} />}

      {!loading && catWithProducts?.length !== 0 && <ModernHomeCat />}

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

      <section className="bg-white py-4 lg:py-8">
        <div className="container">
          <div className="flex items-center justify-between flex-col lg:flex-row mb-4">
            <div className="leftSec w-full lg:w-[40%]">
              <h2 className="text-[16px] sm:text-[18px] lg:text-[20px] font-[600]">Popular Products</h2>
              <p className="text-[12px] text-gray-500 mt-1">Explore our handpicked selection of premium items</p>
            </div>
            <div className="rightSec w-full lg:w-[60%]">
              {catWithProducts?.length > 0 && (
                <Tabs
                  value={value}
                  onChange={handleChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  aria-label="category tabs"
                >
                  {catWithProducts.map((cat, index) => (
                    <Tab key={index} label={cat?.name} onClick={() => filterByCatId(cat?._id)} />
                  ))}
                </Tabs>
              )}
            </div>
          </div>
          <div className="min-h-[300px]">
            {loading ? (
              <ProductLoading />
            ) : popularProductsData?.length === 0 ? (
              <p className="text-center py-10 text-gray-500">No products available</p>
            ) : (
              <ProductsSlider items={6} data={popularProductsData} ItemComponent={HomeProductItem} />
            )}
          </div>
        </div>
      </section>

      {featuredProducts?.length > 0 && (
        <section className="bg-white py-4 lg:py-6">
          <div className="container">
            <div className="mb-4">
              <h2 className="text-[18px] lg:text-[20px] font-[600]">Featured Products</h2>
              <p className="text-[12px] text-gray-500 mt-1">Discover our exclusive collection of premium picks</p>
            </div>
            <ProductsSlider items={6} data={featuredProducts} ItemComponent={HomeProductItem} />
          </div>
        </section>
      )}

      <section className="py-3 lg:py-4">
        <div className="container">
          <Box className="bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded-2xl px-5 sm:px-8 lg:px-12 py-6 lg:py-8 border border-gray-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <Box className="flex items-center gap-4 sm:gap-5">
                <Box className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                  <span className="text-2xl sm:text-3xl">✈️</span>
                </Box>
                <Box>
                  <Typography className="!text-gray-900 !font-[600] !text-[16px] sm:!text-[18px] lg:!text-[20px]">
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

      {recentlyAddedProducts?.length > 0 && (
        <section className="py-6 lg:py-8 bg-white">
          <div className="container">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[18px] sm:text-[20px] lg:text-[22px] font-[600] text-gray-800">Recently Added</h2>
                <p className="text-[12px] sm:text-[13px] text-gray-500 mt-1">Fresh arrivals in our collection</p>
              </div>
              <Link to="/products">
                <Button className="!text-gray-600 !text-sm !font-[500]" size="small">
                  View All <MdArrowRightAlt className="!text-lg" />
                </Button>
              </Link>
            </div>
            <ProductsSlider items={6} data={recentlyAddedProducts} ItemComponent={HomeProductItem} />
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
              <Link to="/all-reviews">
                <Button className="!bg-[#2bbef9] !text-white !font-[500] !px-4 !py-1.5 !rounded-full">
                  View All
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {allReviews?.slice(0, 8).map((review, index) => (
                <Box key={index} className="bg-white rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-lg transition-shadow flex flex-col">
                  <Box className="flex items-center gap-3 mb-3">
                    <Avatar src={review?.image || '/user.jpg'} className="!w-[40px] sm:!w-[48px] !h-[40px] sm:!h-[48px]">
                      <FaUserCircle className="!text-[40px] sm:!text-[48px] !text-gray-400" />
                    </Avatar>
                    <Box>
                      <Typography className="!font-[600] !text-[12px] sm:!text-[14px]">
                        {review?.userName || 'Anonymous'}
                      </Typography>
                      <Rating value={review?.rating || 5} size="small" readOnly />
                    </Box>
                  </Box>
                  <Typography className="!text-[11px] sm:!text-[13px] !text-gray-600 leading-relaxed mb-3 flex-grow line-clamp-3">
                    {review?.review}
                  </Typography>
                  
                  {review?.reviewImages?.length > 0 && (
                    <Box className="flex gap-2 mb-3">
                      {review.reviewImages.slice(0, 3).map((img, imgIndex) => (
                        <Box key={imgIndex} className="w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] rounded-lg overflow-hidden border border-gray-200">
                          <img src={img} alt="Review" className="w-full h-full object-cover" />
                        </Box>
                      ))}
                    </Box>
                  )}
                  
                  <Box className="mt-auto flex items-center justify-between">
                    {(review?.productId || review?.productName) && (
                      <Chip 
                        label={review?.productName || 'Product'} 
                        size="small"
                        component={Link}
                        to={review?.productId ? `/product/${review.productId}` : '#'}
                        clickable
                        className="!bg-green-50 !text-green-700 !text-[10px] !font-[500]"
                      />
                    )}
                    <Link to="/all-reviews" className="!text-[#2bbef9] !text-[11px] sm:!text-[12px] !font-[500] hover:!underline">
                      Read More →
                    </Link>
                  </Box>
                </Box>
              ))}
            </div>
          </div>
        </section>
      )}

      {blogData?.length > 0 && (
        <section className="py-6 sm:py-8 bg-white">
          <div className="container">
            <h2 className="text-[16px] sm:text-[18px] lg:text-[20px] font-[600] mb-4 sm:mb-5">Latest Blog</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {blogData?.slice(0, 4)?.map((item, index) => (
                <BlogItem key={index} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default Home;