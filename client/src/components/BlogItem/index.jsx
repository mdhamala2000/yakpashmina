import React from "react";
import { IoMdTime } from "react-icons/io";
import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { CalendarToday } from "@mui/icons-material";


const BlogItem = (props) => {
  const blogId = props?.item?._id;
  
  return (
    <Link to={`/blog/${blogId}`} className="blogItem group block no-underline">
      <div className="imgWrapper w-full overflow-hidden rounded-xl cursor-pointer relative">
          <LazyLoadImage
            alt={props?.item?.title}
            effect="blur"
            className="w-full h-[200px] lg:h-[240px] object-cover transition-all duration-500 group-hover:scale-105"
            src={props?.item?.images?.[0] || '/blog-placeholder.jpg'}
          />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      <div className="info py-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] text-gray-500 flex items-center gap-1">
            <CalendarToday className="!text-[10px]" />
            {props?.item?.createdAt?.split("T")[0] || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          {props?.item?.category && (
            <span className="text-[10px] bg-[#1a1a2e] text-white px-2 py-0.5 rounded-full">
              {props.item.category}
            </span>
          )}
        </div>

        <h2 className="text-[15px] lg:text-[16px] font-[700] text-gray-900 mb-2 line-clamp-2 group-hover:!text-[#e94560] transition-colors">
          {props?.item?.title}
        </h2>

        <p className="text-[13px] lg:text-[14px] text-gray-600 line-clamp-2 mb-3">
          {props?.item?.excerpt || props?.item?.description?.replace(/<[^>]*>/g, '').substr(0, 80) + '...'}
        </p>


        <span className="link font-[600] text-[13px] flex items-center gap-1 text-[#1a1a2e] group-hover:!text-[#e94560] transition-colors">
          Read More <IoIosArrowForward className="!text-[14px]" />
        </span>

      </div>
    </Link>
  );
};

export default BlogItem;