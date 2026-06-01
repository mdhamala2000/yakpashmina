import React, { useContext } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import 'swiper/css/free-mode';

import { Navigation, FreeMode } from "swiper/modules";
import ProductItem from "../ProductItem";
import HomeProductItem from "../HomeProductItem";
import { MyContext } from "../../App";

const ProductsSlider = (props) => {

  const context = useContext(MyContext);
  const ItemComponent = props.ItemComponent || ProductItem;
  const totalSlides = props?.data?.length || 0;

  return (
    <div className="productsSlider pt-1 lg:pt-3 pb-0 w-full max-w-full overflow-hidden">
      <Swiper
        slidesPerView={props.items || 4}
        spaceBetween={15}
        slidesPerGroup={1}
        navigation={context?.windowWidth<992 ? false : true}
        modules={[Navigation, FreeMode]}
        freeMode={true}
        loop={false}
        breakpoints={{
          320: {
            slidesPerView: 2,
            spaceBetween: 10,
            slidesPerGroup: 2,
          },
          640: {
            slidesPerView: 2,
            spaceBetween: 12,
            slidesPerGroup: 2,
          },
          768: {
            slidesPerView: 3,
            spaceBetween: 15,
            slidesPerGroup: 3,
          },
          1024: {
            slidesPerView: 4,
            spaceBetween: 15,
            slidesPerGroup: 4,
          },
          1280: {
            slidesPerView: 4,
            spaceBetween: 15,
            slidesPerGroup: 4,
          },
          1536: {
            slidesPerView: 4,
            spaceBetween: 15,
            slidesPerGroup: 4,
          },
        }}
        className="mySwiper !overflow-visible"
      >
        {
          props?.data?.map((item, index) => {
            return (
              <SwiperSlide key={index}>
                <ItemComponent item={item} />
              </SwiperSlide>
            )
          })
        }


      </Swiper>
    </div>
  );
};

export default ProductsSlider;
