import { Link } from "react-router-dom";
import { FiClock, FiArrowRight } from "react-icons/fi";

const RecentlyViewed = ({ data = [] }) => {
  return (
    <section className="py-6 lg:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-5 lg:mb-7">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white text-sm shadow-md shadow-amber-200">
            <FiClock />
          </span>
          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
            Recently Viewed
          </h2>
        </div>

        {data?.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-4 px-4 pb-2">
            {data.map((item) => (
              <Link
                key={item._id}
                to={`/product/${item._id}`}
                className="snap-start shrink-0 w-[180px] sm:w-[200px] bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
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
                  <span className="text-sm font-bold text-gray-900 mt-1 block">
                    ${item.effectivePrice ?? item.price}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <Link
            to="/products"
            className="flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 sm:p-5 group hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm text-amber-500">
                <FiClock size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-800">No recently viewed items</p>
                <p className="text-xs text-gray-500 mt-0.5">Browse our collection and find your favorites</p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 group-hover:gap-2 transition-all">
              Browse More
              <FiArrowRight size={14} />
            </span>
          </Link>
        )}
      </div>
    </section>
  );
};

export default RecentlyViewed;
