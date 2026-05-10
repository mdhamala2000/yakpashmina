import React, { useEffect, useRef, useState } from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import { Link, useParams } from "react-router-dom";
import { ProductZoom } from "../../components/ProductZoom";
import ProductsSlider from '../../components/ProductsSlider';
import { ProductDetailsComponent } from "../../components/ProductDetails";

import { fetchDataFromApi } from "../../utils/api";
import CircularProgress from '@mui/material/CircularProgress';
import { Reviews } from "./reviews";
import SEO from "../../components/SEO";

export const ProductDetails = () => {

  const [activeTab, setActiveTab] = useState(0);
  const [productData, setProductData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [relatedProductData, setRelatedProductData] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [liveRating, setLiveRating] = useState(0);

  const { id } = useParams();

  const reviewSec = useRef();

  useEffect(() => {
    fetchDataFromApi(`/api/user/getReviews?productId=${id}`).then((res) => {
      if (res?.error === false) {
        setLiveRating(res.avgRating || 0);
        setReviewsCount(res.totalReviews || 0);
      }
    })

  }, [id])

  useEffect(() => {
    setIsLoading(true);
    fetchDataFromApi(`/api/product/${id}`).then((res) => {
      if (res?.error === false) {
        setProductData(res?.product);

        fetchDataFromApi(`/api/product/getAllProductsBySubCatId/${res?.product?.subCatId}`).then((res) => {
          if (res?.error === false) {
           const filteredData = res?.products?.filter((item) => item._id !== id);
            setRelatedProductData(filteredData)
          }
        })

        setTimeout(() => {
          setIsLoading(false);
        }, 700);
      }
    })

    fetchDataFromApi("/api/product/getAllProducts?page=1&limit=10").then((res) => {
      if (res?.success) setRecommendedProducts(res?.products || [])
    })


    window.scrollTo(0, 0)
}, [id])

  const gotoReviews = () => {
    window.scrollTo({
      top: reviewSec?.current.offsetTop - 170,
      behavior: 'smooth',
    })

    setActiveTab(1)

  }

  return (
    <>
      <SEO 
        title={productData?.name || "Product"}
        description={productData?.description?.substring(0, 160) || "Premium Pashmina product from Yak Pashmina"}
        image={productData?.images?.[0]}
        url={`/product/${id}`}
        type="product"
        schema={productData ? {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": productData.name,
          "image": productData.images,
          "description": productData.description,
          "brand": { "@type": "Brand", "name": productData.brand || "Yak Pashmina" },
          "sku": productData._id,
          "offers": {
            "@type": "Offer",
            "price": productData.price,
            "priceCurrency": "USD",
            "availability": productData.countInStock > 0 
              ? "https://schema.org/InStock" 
              : "https://schema.org/OutOfStock"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": liveRating || productData.rating || 0,
            "reviewCount": reviewsCount || 0
          }
        } : null}
      />
      <SEO 
        url={`/product/${id}`}
        schema={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://yakpashamina.com/" },
            { "@type": "ListItem", "position": 2, "name": "Products", "item": "https://yakpashamina.com/products" },
            { "@type": "ListItem", "position": 3, "name": productData?.name || "Product" }
          ]
        }}
      />
      <div className="py-5 hidden">
        <div className="container">
          <Breadcrumbs aria-label="breadcrumb">
            <Link
              underline="hover"
              color="inherit"
              to="/"
              className="link transition !text-[14px]"
            >
              Home
            </Link>
            <Link
              underline="hover"
              color="inherit"
              to="/"
              className="link transition !text-[14px]"
            >
              Fashion
            </Link>

            <Link
              underline="hover"
              color="inherit"
              className="link transition !text-[14px]"
            >
              Cropped Satin Bomber Jacket
            </Link>
          </Breadcrumbs>
        </div>
      </div>



      <section className="bg-white py-5">
        {
          isLoading === true ?
            <div className="flex items-center justify-center min-h-[300px]">
              <CircularProgress />
            </div>


            :


            <>
              <div className="container flex gap-8 flex-col lg:flex-row items-start lg:items-center">
                <div className="productZoomContainer w-full lg:w-[40%]">
                  <ProductZoom images={productData?.images} />
                </div>

                <div className="productContent w-full lg:w-[60%] pr-2 pl-2 lg:pr-10 lg:pl-10">
                  <ProductDetailsComponent item={productData} reviewsCount={reviewsCount} gotoReviews={gotoReviews} liveRating={liveRating} />
                </div>
              </div>

              <div className="container pt-10">
                <div className="flex items-center gap-8 mb-5">
                  <span
                    className={`link text-[17px] cursor-pointer font-[500] ${activeTab === 0 && "text-primary"
                      }`}
                    onClick={() => setActiveTab(0)}
                  >
                    Description
                  </span>


                  <span
                    className={`link text-[17px] cursor-pointer font-[500] ${activeTab === 1 && "text-primary"
                      }`}
                    onClick={() => setActiveTab(1)}
                    ref={reviewSec}
                  >
                    Reviews ({reviewsCount})
                  </span>
                </div>

                {activeTab === 0 && (
                  <div className="shadow-md w-full py-5 px-8 rounded-md text-[14px]">
                    {
                      productData?.description
                    }
                  </div>
                )}


                {activeTab === 1 && (
                  <div className="shadow-none lg:shadow-md w-full sm:w-[80%] py-0  lg:py-5 px-0 lg:px-8 rounded-md">
                    {
                      productData?.length !== 0 && <Reviews productId={productData?._id} setReviewsCount={setReviewsCount} />
                    }

                  </div>
                )}
              </div>

              {
                relatedProductData?.length !== 0 &&
                <div className="container pt-8">
                  <h2 className="text-[20px] font-[600] pb-0">Related Products</h2>
                  <ProductsSlider items={6} data={relatedProductData}/>
                </div>
              }


              {recommendedProducts?.length !== 0 && (
                <div className="container pt-8">
                  <h2 className="text-[20px] font-[600] pb-4">You May Also Like</h2>
                  <ProductsSlider items={4} data={recommendedProducts}/>
                </div>
              )}


            </>

        }




      </section>
    </>
  );
};
