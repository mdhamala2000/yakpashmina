import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const CatEmoji = ({ name }) => {
  if (!name) return "📦";
  const lower = name.toLowerCase();
  const map = {
    women: "👩", men: "👨", kids: "🧒", baby: "👶",
    accessories: "👜", scarves: "🧣", shawls: "🧣", pashmina: "🧣",
    home: "🏠", gift: "🎁", new: "✨", sale: "🏷️",
    winter: "❄️", summer: "☀️", jacket: "🧥", dress: "👗",
    top: "👚", shirt: "👔", pants: "👖", jeans: "👖",
    shoes: "👟", bag: "👜", hat: "🧢", belt: "🎀",
  };
  for (const [key, emoji] of Object.entries(map)) {
    if (lower.includes(key)) return emoji;
  }
  return "📦";
};

const CatSubCatSlider = ({ data = [], onCategoryClick }) => {
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  const items = data.reduce((acc, cat) => {
    if (cat.productCount > 0) {
      acc.push({ ...cat, itemType: "category", parentSlug: cat.slug });
    }
    if (cat.children?.length) {
      cat.children.forEach((sub) => {
        if (sub.productCount > 0) {
          acc.push({ ...sub, itemType: "subcategory", parentSlug: cat.slug, parentId: cat._id });
        }
      });
    }
    return acc;
  }, []);

  if (!items.length) return null;

  const handleClick = (e, item) => {
    const isCat = item.itemType === "category";
    console.log(`Click: ${isCat ? "Category" : "Subcategory"} — ${item.name} (${item._id})`);

    if (onCategoryClick) {
      e.preventDefault();
      const parent = isCat ? item : data.find((c) => c._id === item.parentId);
      if (parent) onCategoryClick(parent);
    }
  };

  return (
    <div className="catSubCatSlider relative group">
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-9 sm:h-9 bg-white shadow-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
        aria-label="Scroll left"
      >
        <FaChevronLeft className="text-xs sm:text-sm text-gray-500" />
      </button>

      <div
        ref={scrollRef}
        className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-1 scroll-smooth no-scrollbar"
      >
        {items.map((item, idx) => {
          const isCat = item.itemType === "category";
          const href = isCat
            ? `/category/${item.slug || item._id}`
            : `/category/${item.parentSlug}/${item.slug || item._id}`;

          return (
<a
               key={`${item._id || idx}-${isCat ? "cat" : "sub"}`}
               href={href}
               onClick={(e) => handleClick(e, item)}
               className={`flex-shrink-0 flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all duration-200 cursor-pointer select-none ${
                 isCat
                   ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 shadow-sm"
                   : "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-800 border border-gray-200"
               }`}
             >
               {item.images?.[0] ? (
                 <span className={`flex-shrink-0 rounded-full overflow-hidden ${isCat ? "w-7 h-7 sm:w-8 sm:h-8" : "w-5 h-5 sm:w-6 sm:h-6"}`}>
                   <img
                     src={item.images[0]}
                     alt=""
                     className="w-full h-full object-cover"
                     onError={(e) => { e.target.style.display = "none" }}
                   />
                 </span>
               ) : (
                 <span className="text-base sm:text-lg leading-none"><CatEmoji name={item.name} /></span>
               )}
               <span className={`whitespace-nowrap ${
                 isCat
                   ? "text-[13px] sm:text-[15px] font-bold tracking-wide"
                   : "text-[12px] sm:text-[14px] font-medium"
               }`}>
                 {isCat ? `All ${item.name}` : item.name}
               </span>
             </a>
          );
        })}
      </div>

      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-9 sm:h-9 bg-white shadow-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
        aria-label="Scroll right"
      >
        <FaChevronRight className="text-xs sm:text-sm text-gray-500" />
      </button>
    </div>
  );
};

export default CatSubCatSlider;
