import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { fetchDataFromApi } from "../../utils/api";

const ReviewCard = ({ review, showProductLink }) => {
  const renderStars = (rating = 5) =>
    [1, 2, 3, 4, 5].map((s) => (
      <svg
        key={s}
        className={`w-3.5 h-3.5 ${s <= rating ? "text-amber-400" : "text-gray-200"}`}
        fill="currentColor" viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));

  return (
    <div className="bg-white rounded-xl border border-gray-200/60 p-5 h-full flex flex-col hover:border-gray-300 hover:shadow-sm transition-all duration-200">
      <div className="flex items-start gap-3.5 mb-3">
        <div className="shrink-0 w-[50px] h-[50px]">
          {showProductLink && review?.productId ? (
            <Link to={`/product/${review.productId}`} className="block w-full h-full">
              <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center ring-2 ring-gray-50 hover:ring-indigo-300 transition-all">
                {review?.image ? (
                  <img src={review.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-base font-bold text-indigo-500">
                    {(review?.userName || "A").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </Link>
          ) : (
            <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center ring-2 ring-gray-50">
              {review?.image ? (
                <img src={review.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-base font-bold text-indigo-500">
                  {(review?.userName || "A").charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[16px] font-bold text-gray-900 truncate leading-tight">
              {review?.userName || "Anonymous"}
            </p>
            <span className="text-[12px] text-gray-500 whitespace-nowrap shrink-0 font-medium">
              {review?.createdAt
                ? new Date(review.createdAt).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : ""}
            </span>
          </div>
          <div className="flex items-center gap-0.5 mt-0.5">
            {renderStars(review?.rating || 5)}
          </div>
          {showProductLink && review?.productId && (
            <Link
              to={`/product/${review.productId}`}
              className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-semibold text-green-700 bg-green-50 hover:bg-green-100 rounded-full px-2.5 py-1 transition-colors max-w-full"
            >
              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="truncate">{review?.productName || 'View Product'}</span>
            </Link>
          )}
        </div>
      </div>

      <p className="text-[14px] text-gray-700 leading-relaxed flex-grow line-clamp-4 font-[450]">
        {review?.review}
      </p>

      {review?.reviewImages?.length > 0 && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 flex-wrap">
          {review.reviewImages.slice(0, 4).map((img, imgIndex) => (
            <a
              key={imgIndex}
              href={img}
              target="_blank"
              rel="noopener noreferrer"
              className="w-[72px] h-[72px] rounded-lg overflow-hidden border border-gray-100 hover:opacity-80 transition-opacity"
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </a>
          ))}
          {review.reviewImages.length > 4 && (
            <span className="text-xs text-gray-400 self-center font-semibold ml-1">
              +{review.reviewImages.length - 4}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const ReviewsSlider = ({ data, productId, layout = "carousel", showProductLink = false }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data && Array.isArray(data)) {
      const approved = data.filter((r) => r.isApproved !== false);
      setReviews(approved);
      return;
    }
    if (!productId) {
      setReviews([]);
      return;
    }
    setLoading(true);
    fetchDataFromApi(`/api/user/getReviews?productId=${productId}`)
      .then((res) => {
        if (res?.error === false) {
          const approved = res.reviews?.filter((r) => r.isApproved !== false) || [];
          setReviews(approved);
        }
      })
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [data, productId]);

  if (loading) return null;
  if (!reviews.length) return null;

  if (layout === "vertical") {
    return (
      <div className="space-y-3">
        {reviews.map((review, index) => (
          <ReviewCard key={review._id || index} review={review} showProductLink={showProductLink} />
        ))}
      </div>
    );
  }

  return (
    <div className="reviews-slider-section">
      <Swiper
        modules={[Pagination, Autoplay]}
        pagination={{ clickable: true, dynamicBullets: true }}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        grabCursor={true}
        breakpoints={{
          320: { slidesPerView: 1, spaceBetween: 12 },
          640: { slidesPerView: 2, spaceBetween: 16 },
          1024: { slidesPerView: 3, spaceBetween: 20 },
        }}
        className="pb-10"
      >
        {reviews.map((review, index) => (
          <SwiperSlide key={review._id || index}>
            <ReviewCard review={review} showProductLink={true} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ReviewsSlider;
