import { useState, useEffect } from "react";

const STORAGE_KEY = "recentlyViewedProducts";
const MAX_ITEMS = 4;

export function useRecentlyViewed(currentProductId = null) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const filtered = stored.filter((p) => p._id !== currentProductId);
    setItems(filtered);
  }, [currentProductId]);

  const addProduct = (product) => {
    if (!product?._id) return;
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const filtered = stored.filter((p) => p._id !== product._id);
    const entry = {
      _id: product._id,
      name: product.name,
      images: product.images,
      price: product.price,
      oldPrice: product.oldPrice,
      effectivePrice: product.effectivePrice,
      effectiveOldPrice: product.effectiveOldPrice,
      discount: product.discount,
      rating: product.rating,
      brand: product.brand,
      hasVariants: product.hasVariants,
      countInStock: product.countInStock,
    };
    const updated = [entry, ...filtered].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setItems(updated.filter((p) => p._id !== currentProductId));
  };

  return { items, addProduct };
}
