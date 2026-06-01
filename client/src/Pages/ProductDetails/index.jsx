import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ProductDetailsComponent } from "../../components/ProductDetails";

import { fetchDataFromApi } from "../../utils/api";
import { useRecentlyViewed } from "../../hooks/useRecentlyViewed";
import CircularProgress from "@mui/material/CircularProgress";
import SEO from "../../components/SEO";
import YouMayAlsoLike from "../../components/YouMayAlsoLike";
import RecentlyViewed from "../../components/RecentlyViewed";
import { FiChevronRight, FiPackage } from "react-icons/fi";

const ProductDetails = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [rating, setRating] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const { id } = useParams();
  const { items: recentlyViewed, addProduct } = useRecentlyViewed(id);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setErrorMsg("");
    fetchDataFromApi(`/api/product/${id}`)
      .then((res) => {
        if (res?.error === false && res?.product) {
          setData(res.product);
          addProduct(res.product);
          fetchDataFromApi(`/api/user/getReviews?productId=${id}`)
            .then((rRes) => {
              if (rRes?.error === false) {
                setRating(rRes.avgRating || 0);
                setReviewsCount(rRes.totalReviews || 0);
              }
            });
          if (res.product.subCatId) {
            fetchDataFromApi(`/api/product/getAllProductsBySubCatId/${res.product.subCatId}`)
              .then((relRes) => {
                if (relRes?.error === false) {
                  const filtered = (relRes.products || []).filter((p) => p._id !== id);
                  setRelatedProducts(filtered);
                }
              });
          }
        } else {
          setErrorMsg("Product not found");
        }
      })
      .catch(() => setErrorMsg("Failed to load product"))
      .finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <CircularProgress size={36} />
          <p className="text-gray-400 text-sm mt-4">Loading product...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FiPackage className="text-gray-300 text-4xl mx-auto mb-3" />
          <p className="text-gray-500 text-sm">{errorMsg || "Product not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={data?.name || "Product"}
        description={data?.description?.substring(0, 160) || "Product from Yak Pashmina"}
        image={data?.images?.[0]}
        url={`/product/${id}`}
        type="product"
      />

      <div className="bg-gray-50/80 min-h-screen pb-10">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 py-2.5 text-sm text-gray-400 overflow-x-auto">
              <Link to="/" className="hover:text-gray-700 transition-colors shrink-0">Home</Link>
              <FiChevronRight className="text-gray-300 shrink-0 text-xs" />
              <Link to="/products" className="hover:text-gray-700 transition-colors shrink-0">Products</Link>
              <FiChevronRight className="text-gray-300 shrink-0 text-xs" />
              <span className="text-gray-800 font-medium truncate">{data?.name}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8">
          <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm">
            <ProductDetailsComponent
              item={data}
              reviewsCount={reviewsCount}
              liveRating={rating}
              setReviewsCount={setReviewsCount}
            />
          </div>

          {relatedProducts.length > 0 && (
            <YouMayAlsoLike data={relatedProducts} title="You May Also Like" />
          )}

          <RecentlyViewed data={recentlyViewed} />
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
