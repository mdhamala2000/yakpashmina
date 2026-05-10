import React from "react";
import { Link } from "react-router-dom";
import Rating from "@mui/material/Rating";
import { useCurrency } from "../../context/CurrencyContext";

const HomeProductItem = (props) => {
  const { formatPrice } = useCurrency();

  return (
    <div className="productItem homeProductItem shadow-lg rounded-md overflow-hidden border border-gray-100 bg-white h-full flex flex-col">
      <div className="group imgWrapper w-full overflow-hidden rounded-t-md relative">
        <Link to={`/product/${props?.item?._id}`}>
          <div className="img w-full h-[160px] sm:h-[180px] md:h-[220px] lg:h-[260px] xl:h-[300px] overflow-hidden relative flex items-center justify-center bg-gray-50">
            <img
              src={props?.item?.images[0]}
              className="max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-500 hover:scale-105"
              alt={props?.item?.name}
              title={props?.item?.name}
              loading="lazy"
              width="300"
              height="300"
            />

            {props?.item?.images?.length > 1 && (
              <img
                src={props?.item?.images[1]}
                className="max-w-full max-h-full w-auto h-auto object-contain transition-all duration-500 absolute inset-0 m-auto opacity-0 group-hover:opacity-100"
                alt={props?.item?.name}
                title={props?.item?.name}
                loading="lazy"
              />
            )}
          </div>
        </Link>

        {props?.item?.discount > 0 && (
          <span className="discount flex items-center absolute top-3 left-3 z-50 bg-primary text-white rounded-md px-2 py-1 text-[11px] font-semibold">
            -{props?.item?.discount}%
          </span>
        )}
      </div>

      <div className="info p-3 flex flex-col flex-grow">
        <h6 className="text-[11px] uppercase tracking-wider text-gray-400 mb-1">
          {props?.item?.brand}
        </h6>
        <h3 className="text-[13px] lg:text-[14px] title font-medium mb-2 text-gray-800 line-clamp-2">
          <Link to={`/product/${props?.item?._id}`} className="hover:text-primary transition-colors">
            {props?.item?.name}
          </Link>
        </h3>

        <Rating name="size-small" defaultValue={props?.item?.rating} size="small" readOnly className="mb-2" />

        <div className="flex items-center gap-2 mt-auto">
          {props?.item?.oldPrice > 0 && (
            <span className="oldPrice line-through text-gray-400 text-[12px]">
              {formatPrice(props?.item?.oldPrice)}
            </span>
          )}
          <span className="price text-primary text-[14px] lg:text-[15px] font-semibold">
            {formatPrice(props?.item?.price)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HomeProductItem;