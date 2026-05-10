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

  return (
    <div className="productsSlider pt-1 lg:pt-3 pb-0 w-full max-w-full overflow-hidden">
      <Swiper
        slidesPerView={props.items}
        spaceBetween={15}
        slidesPerGroup={3}
        navigation={context?.windowWidth<992 ? false : true}
        modules={[Navigation, FreeMode]}
        freeMode={true}
        breakpoints={{
          320: {
            slidesPerView: 2,
            spaceBetween: 10,
          },
          480: {
            slidesPerView: 2.5,
            spaceBetween: 12,
          },
          640: {
            slidesPerView: 3,
            spaceBetween: 15,
          },
          768: {
            slidesPerView: 3.5,
            spaceBetween: 15,
          },
          1024: {
            slidesPerView: 4,
            spaceBetween: 15,
          },
          1280: {
            slidesPerView: 5,
            spaceBetween: 15,
          },
          1536: {
            slidesPerView: 6,
            spaceBetween: 15,
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
