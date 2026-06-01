import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "./style.css";
import BlogItem from "../BlogItem";

const BlogSlider = ({ data = [] }) => {
  if (!data?.length) return null;

  return (
    <div className="blogSlider">
      <Swiper
        modules={[Navigation]}
        navigation={true}
        grabCursor={true}
        breakpoints={{
          320: { slidesPerView: 2, spaceBetween: 10 },
          640: { slidesPerView: 2, spaceBetween: 12 },
          768: { slidesPerView: 3, spaceBetween: 14 },
          1024: { slidesPerView: 4, spaceBetween: 16 },
          1280: { slidesPerView: 5, spaceBetween: 18 },
        }}
      >
        {data.map((item, index) => (
          <SwiperSlide key={item._id || index}>
            <BlogItem item={item} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default BlogSlider;
