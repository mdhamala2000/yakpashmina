import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import { Navigation, FreeMode } from "swiper/modules";
import { MyContext } from "../../App";
import { FaChevronRight } from "react-icons/fa";

const ModernHomeCat = () => {
  const context = useContext(MyContext);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (context?.catData?.length > 0) {
      const catsWithProducts = context.catData.filter(cat => cat.productCount > 0);
      setCategories(catsWithProducts);
    }
  }, [context?.catData]);

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-3 lg:py-4 border-b border-gray-100">
      <div className="container">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[14px] sm:text-[16px] lg:text-[18px] font-[600] text-gray-900">
            Categories
          </h2>
        </div>

        <Swiper
          slidesPerView={8}
          spaceBetween={8}
          navigation={true}
          modules={[Navigation, FreeMode]}
          freeMode={true}
          breakpoints={{
            300: {
              slidesPerView: 3,
              spaceBetween: 6,
            },
            400: {
              slidesPerView: 4,
              spaceBetween: 8,
            },
            550: {
              slidesPerView: 5,
              spaceBetween: 8,
            },
            768: {
              slidesPerView: 6,
              spaceBetween: 10,
            },
            1024: {
              slidesPerView: 7,
              spaceBetween: 12,
            },
            1280: {
              slidesPerView: 8,
              spaceBetween: 12,
            },
          }}
          className="categoryCarousel"
        >
          {categories.map((cat, index) => (
            <SwiperSlide key={index}>
              <Link
                to={`/category/${cat?._id}`}
                className="group flex flex-col items-center"
              >
                <div className="w-full aspect-square bg-gray-50 rounded-lg border border-gray-200 p-2 sm:p-2.5 flex items-center justify-center transition-all group-hover:border-orange-400 group-hover:shadow-md">
                  <img
                    src={cat?.images?.[0] || "/placeholder.jpg"}
                    alt={cat?.name}
                    className="w-full h-full object-contain transition-transform group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = "/placeholder.jpg";
                    }}
                  />
                </div>
                <div className="mt-1 text-center">
                  <h3 className="text-[9px] sm:text-[10px] lg:text-[11px] font-[500] text-gray-700 line-clamp-1 group-hover:text-orange-600 transition-colors">
                    {cat?.name}
                  </h3>
                  <p className="text-[8px] sm:text-[9px] text-gray-400 mt-0.5">
                    {cat?.productCount || 0} products
                  </p>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default ModernHomeCat;