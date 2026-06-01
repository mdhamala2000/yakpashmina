import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCurrency } from "../../context/CurrencyContext";

const HomeProductItem = (props) => {
  const { formatPrice } = useCurrency();
  const [imgError, setImgError] = useState(false);

  const isVariant = props?.item?.hasVariants;
  const effectivePrice = props?.item?.effectivePrice;
  const effectiveOldPrice = props?.item?.effectiveOldPrice;
  const effectiveDiscount = props?.item?.effectiveDiscount || 0;

  const displayDiscount = isVariant ? effectiveDiscount : (props?.item?.discount || 0);
  const displayOldPrice = isVariant && effectiveOldPrice != null ? effectiveOldPrice : props?.item?.oldPrice;
  const displayPrice = isVariant && effectivePrice != null && effectivePrice > 0 ? effectivePrice : (props?.item?.price || 0);

  const productName = props?.item?.name || "";
  const productImage = (props?.item?.images?.[0] && !imgError) ? props?.item?.images[0] : null;

  return (
    <div className="group h-full">
      <Link to={`/product/${props?.item?._id}`} className="block h-full">
        <div className="bg-white rounded-lg overflow-hidden border border-gray-100 h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:border-gray-200">
          <div className="relative bg-gray-50 overflow-hidden">
            <div className="aspect-square">
              {productImage ? (
                <img
                  src={productImage}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt={productName}
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {displayDiscount > 0 && (
              <div className="absolute top-2 right-2 z-10 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                -{displayDiscount}%
              </div>
            )}
          </div>

          <div className="p-2.5 flex flex-col flex-grow gap-0.5">
            <h3 className="text-xs font-medium text-gray-800 line-clamp-2 leading-snug group-hover:text-gray-600 transition-colors">
              {productName}
            </h3>

            <div className="flex items-center gap-1 mt-auto pt-1">
              {displayOldPrice > 0 && displayOldPrice > displayPrice && (
                <span className="text-[10px] text-gray-400 line-through">{formatPrice(displayOldPrice)}</span>
              )}
              <span className={`font-semibold ${displayOldPrice > displayPrice ? 'text-rose-600 text-xs' : 'text-gray-900 text-xs'}`}>
                {formatPrice(displayPrice)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default HomeProductItem;