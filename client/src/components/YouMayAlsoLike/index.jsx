import { useMemo } from "react";
import { Link } from "react-router-dom";
import "./style.css";
import { FiClock, FiThumbsUp } from "react-icons/fi";

const YouMayAlsoLike = ({ data = [], title = "You May Also Like", limit = 6, simple = false }) => {
  const items = useMemo(() => data.slice(0, limit), [data, limit]);

  if (items.length === 0) return null;

  const isRecentlyViewed = title?.toLowerCase().includes("recently");

  const grid = (
    <div className="youMayAlsoLike-grid">
      {items.map((item, index) => (
        <Link
          key={item._id || index}
          to={`/product/${item._id}`}
          className="youMayAlsoLike-card"
        >
          <div className="image-wrapper">
            <img
              src={item.images?.[0]}
              alt={item.name}
              loading="lazy"
            />
          </div>
          <div className="card-body">
            <p className="product-name">{item.name}</p>
            <div className="price-row">
              <span className="price-current">
                ${item.effectivePrice ?? item.price}
              </span>
              {(item.effectiveOldPrice ?? item.oldPrice) > 0 && (
                <span className="price-old">
                  ${item.effectiveOldPrice ?? item.oldPrice}
                </span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );

  if (simple) return grid;

  return (
    <section className="youMayAlsoLikeSection py-6 lg:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <div className="section-header-wrapper mb-5 lg:mb-7">
            <div className="flex items-center gap-3">
              <span className={`section-icon ${isRecentlyViewed ? "icon-recent" : "icon-like"}`}>
                {isRecentlyViewed ? <FiClock /> : <FiThumbsUp />}
              </span>
              <h2 className="section-title text-base sm:text-lg lg:text-xl font-bold text-gray-900">
                {title}
              </h2>
            </div>
            <div className="section-accent-line mt-2" />
          </div>
        )}
        {grid}
      </div>
    </section>
  );
};

export default YouMayAlsoLike;
