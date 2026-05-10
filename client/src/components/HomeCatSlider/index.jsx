import React, { useContext } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import 'swiper/css/free-mode';

import { Navigation,FreeMode } from "swiper/modules";
import { Link } from "react-router-dom";
import { MyContext } from "../../App";

const HomeCatSlider = (props) => {

  const context = useContext(MyContext);

  return (
    <div className="homeCatSlider pt-2 lg:pt-4 pb-2 lg:py-4">
      <div className="container">
        <Swiper
          slidesPerView={8}
          spaceBetween={8}
          navigation={context?.windowWidth < 992 ? false : true}
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
              spaceBetween: 10,
            },
          }}
          className="mySwiper"
        >
          {
            props?.data?.map((cat, index) => {
              return (
                <SwiperSlide key={index}>
                  <Link to={`/category/${cat?._id}`}>
                    <div className="item py-3 lg:py-5 px-2 lg:px-3 bg-white rounded-xl text-center flex items-center justify-center flex-col hover:shadow-xl transition-all cursor-pointer h-full border border-gray-200 hover:border-gray-300">
                      <div className="w-[55px] h-[55px] sm:w-[65px] sm:h-[65px] lg:w-[75px] lg:h-[75px] flex items-center justify-center p-2">
                        <img
                          src={cat?.images[0]}
                          className="max-w-full max-h-full object-contain transition-all hover:scale-110"
                          alt={cat?.name}
                        />
                      </div>
                      <h3 className="text-[10px] sm:text-[11px] lg:text-[13px] font-[500] mt-2 lg:mt-3 leading-tight text-center line-clamp-2">{cat?.name}</h3>
                    </div>
                  </Link>
                </SwiperSlide>
              )
            })
          }


        </Swiper>
      </div>
    </div>
  );
};

export default HomeCatSlider;
