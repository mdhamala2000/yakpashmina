import { Link } from "react-router-dom";
import { FiEye } from "react-icons/fi";

const RelatedProducts = ({ data = [], title = "Related Products" }) => {
  if (!data?.length) return null;

  return (
    <section className="py-6 lg:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <div className="flex items-center gap-3 mb-5 lg:mb-7">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm shadow-md shadow-indigo-200">
              <FiEye />
            </span>
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
              {title}
            </h2>
          </div>
        )}

        {/* Mobile: horizontal scroll-snap */}
        <div className="related-scroll lg:hidden">
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-4 px-4 pb-2">
            {data.map((item) => (
              <Link
                key={item._id}
                to={`/product/${item._id}`}
                className="snap-start shrink-0 w-[200px] bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group yoyo-card"
              >
                <div className="aspect-[4/5] bg-gray-50 overflow-hidden">
                  <img
                    src={item.images?.[0]}
                    alt={item.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-medium text-gray-800 truncate">
                    {item.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-sm font-bold text-gray-900">
                      ${item.effectivePrice ?? item.price}
                    </span>
                    {(item.effectiveOldPrice ?? item.oldPrice) > 0 && (
                      <span className="text-[10px] text-gray-400 line-through">
                        ${item.effectiveOldPrice ?? item.oldPrice}
                      </span>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full group-hover:bg-indigo-100 transition-colors">
                    <FiEye size={10} />
                    View
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop: 4-column grid */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-4 xl:gap-5">
          {data.map((item) => (
            <Link
              key={item._id}
              to={`/product/${item._id}`}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group yoyo-card"
            >
              <div className="aspect-[4/5] bg-gray-50 overflow-hidden">
                <img
                  src={item.images?.[0]}
                  alt={item.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-3">
                <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                  {item.name}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-sm sm:text-base font-bold text-gray-900">
                    ${item.effectivePrice ?? item.price}
                  </span>
                  {(item.effectiveOldPrice ?? item.oldPrice) > 0 && (
                    <span className="text-xs text-gray-400 line-through">
                      ${item.effectiveOldPrice ?? item.oldPrice}
                    </span>
                  )}
                </div>
                <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full group-hover:bg-indigo-100 transition-colors">
                  <FiEye size={12} />
                  View
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedProducts;
