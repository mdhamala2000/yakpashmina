import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from 'axios';
import { fetchDataFromApi } from "../../utils/api";
import { useRecentlyViewed } from "../../hooks/useRecentlyViewed";
import CircularProgress from '@mui/material/CircularProgress';
import { Reviews } from "../ProductDetails/reviews";
import SEO from "../../components/SEO";
import RelatedProducts from "../../components/RelatedProducts";
import RecentlyViewed from "../../components/RecentlyViewed";
import { sanitizeHtml } from "../../utils/sanitize";
import { ProductZoom } from "../../components/ProductZoom";

const ProductDetails = () => {
  const [productData, setProductData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [relatedProductData, setRelatedProductData] = useState([]);
  const [liveRating, setLiveRating] = useState(0);

  const { productSlug } = useParams();
  const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const { items: recentlyViewed, addProduct } = useRecentlyViewed(null);

  useEffect(() => {
    fetchProductData();
  }, [productSlug]);

  const fetchProductData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${VITE_API_URL}/product/slug/${productSlug}`);
      
      if (res.data?.success && res.data.product) {
        setProductData(res.data.product);
        addProduct(res.data.product);
        
        const reviewsRes = await fetchDataFromApi(`/api/user/getReviews?productId=${res.data.product._id}`);
        if (reviewsRes?.error === false) {
          setLiveRating(reviewsRes.avgRating || 0);
          setReviewsCount(reviewsRes.totalReviews || 0);
        }
        
        const relatedRes = await axios.get(
          `${VITE_API_URL}/product/by-category-slug?categorySlug=${res.data.product.categorySlug}&limit=12`
        );
        if (relatedRes.data?.success) {
          const filtered = (relatedRes.data.products || []).filter(
            item => item._id !== res.data.product._id
          );
          setRelatedProductData(filtered);
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <CircularProgress />
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Product Not Found</h2>
        <p className="text-gray-500 mt-2">The product you're looking for doesn't exist or has been removed.</p>
        <Link to="/products" className="text-primary hover:underline mt-4 inline-block">
          Browse all products
        </Link>
      </div>
    );
  }

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
    { name: productData.categoryName || 'Category', url: `/category/${productData.categorySlug}` }
  ];
  
  if (productData.subCategorySlug) {
    breadcrumbs.push({ 
      name: productData.subCategoryName, 
      url: `/category/${productData.categorySlug}/${productData.subCategorySlug}` 
    });
  }
  breadcrumbs.push({ name: productData.name, url: null });

  return (
    <>
      <SEO 
        title={productData.metaTitle || productData.name}
        description={productData.metaDescription || productData.shortDescription || productData.description?.substring(0, 160)}
        image={productData.images?.[0]}
        url={`/product/${productSlug}`}
        type="product"
        schema={{
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
            "priceCurrency": productData.currency || "USD",
            "availability": productData.countInStock > 0 
              ? "https://schema.org/InStock" 
              : "https://schema.org/OutOfStock"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": liveRating || productData.rating || 0,
            "reviewCount": reviewsCount || 0
          }
        }}
      />

      <div className="bg-gray-50 py-3 mb-5">
        <div className="container">
          <nav className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="text-gray-400">/</span>}
                {crumb.url ? (
                  <Link to={crumb.url} className="text-gray-500 hover:text-gray-700">
                    {crumb.name}
                  </Link>
                ) : (
                  <span className="text-gray-900 font-medium truncate">
                    {crumb.name}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>
      </div>

      <section className="pb-10">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="productZoomContainer">
              <ProductZoom images={productData.images || []} />
            </div>

            <div className="product-info">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                {productData.name}
              </h1>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-bold text-gray-900">${productData.price}</span>
                {productData.oldPrice > 0 && (
                  <span className="text-xl text-gray-400 line-through">${productData.oldPrice}</span>
                )}
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-yellow-500">★ {liveRating.toFixed(1)}</span>
                <span className="text-gray-500">({reviewsCount} reviews)</span>
              </div>

              <div className="text-gray-600 mb-6">
                {productData.shortDescription || productData.description?.substring(0, 200)}
              </div>

              <div className="add-to-cart-section">
              </div>
            </div>
          </div>

          {productData.description && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-12">
              <h2 className="text-xl font-bold mb-4">Description</h2>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(productData.description) }}
              />
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-12">
            <h2 className="text-xl font-bold mb-4">Reviews ({reviewsCount})</h2>
            {productData._id && <Reviews productId={productData._id} setReviewsCount={setReviewsCount} />}
          </div>

          {relatedProductData?.length > 0 && (
            <RelatedProducts data={relatedProductData} />
          )}

          <RecentlyViewed data={recentlyViewed} />
        </div>
      </section>
    </>
  );
};

export default ProductDetails;
