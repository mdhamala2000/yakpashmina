import React, { useContext, useEffect, useState, memo } from "react";
import "../ProductItem/style.css";
import { Link, useNavigate } from "react-router-dom";
import Rating from "@mui/material/Rating";
import Button from "@mui/material/Button";
import { FaRegHeart, FaShoppingCart } from "react-icons/fa";
import { IoGitCompareOutline } from "react-icons/io5";
import { MdZoomOutMap } from "react-icons/md";
import { MyContext } from "../../App";
import { FaMinus, FaPlus, FaStar } from "react-icons/fa6";
import { deleteData, editData, postData } from "../../utils/api";
import CircularProgress from '@mui/material/CircularProgress';
import { IoMdHeart } from "react-icons/io";
import { useCurrency } from "../../context/CurrencyContext";

const ProductItem = memo((props) => {
  const { hideAddToCart } = props;
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isAddedInMyList, setIsAddedInMyList] = useState(false);
  const [cartItem, setCartItem] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInCompare, setIsInCompare] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const context = useContext(MyContext);
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  useEffect(() => {
    const inCompare = context?.compareList?.some(p => p._id === props?.item?._id);
    setIsInCompare(inCompare);
  }, [context?.compareList]);

  const handleToggleCompare = (product) => {
    const isInList = context?.compareList?.some(p => p._id === product._id);
    if (isInList) {
      context.setCompareList(context.compareList.filter(p => p._id !== product._id));
    } else {
      if (context.compareList.length >= 3) {
        context.alertBox("error", "You can compare up to 3 products only");
        return;
      }
      context.setCompareList([...context.compareList, product]);
    }
  }

  const handleAddToCart = async (product) => {
    if (!context?.isLogin || !context?.userData?._id) {
      localStorage.setItem('pendingCartItem', JSON.stringify({
        productId: product?._id,
        productTitle: product?.name,
        image: product?.images[0],
        rating: product?.rating,
        price: product?.price,
        oldPrice: product?.oldPrice,
        discount: product?.discount,
        quantity: quantity,
        countInStock: product?.countInStock,
        brand: product?.brand,
        color: product?.color?.length !== 0 ? (product?.color?.[0] || '') : '',
        materials: product?.materials || ''
      }));
      context?.alertBox("info", "Please login to add items to cart");
      navigate('/login');
      return false;
    }

    if (product?.countInStock <= 0) {
      context?.alertBox("error", "Sorry, this item is currently out of stock!");
      return false;
    }

    if (product?.countInStock < quantity) {
      context?.alertBox("error", `Only ${product?.countInStock} items available in stock!`);
      return false;
    }

    const productItem = {
      _id: product?._id,
      productTitle: product?.name,
      image: product?.images[0],
      rating: product?.rating,
      price: product?.price,
      oldPrice: product?.oldPrice,
      discount: product?.discount,
      quantity: quantity,
      subTotal: parseInt(product?.price * quantity),
      productId: product?._id,
      countInStock: product?.countInStock,
      brand: product?.brand,
      size: '',
      weight: '',
      ram: '',
      color: product?.color?.length !== 0 ? (product?.color?.[0] || '') : '',
      materials: product?.materials || ''
    }

    setIsLoading(true);

    try {
      const res = await postData("/api/cart/add", productItem);
      if (res?.error === false) {
        context?.alertBox("success", "Item added to cart!");
        context?.getCartItems();
        context?.setOpenCartPanel(true);
        setIsAdded(true);
      } else {
        context?.alertBox("error", res?.message || "Failed to add to cart");
      }
    } catch (error) {
      context?.alertBox("error", "Failed to add to cart");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const item = context?.cartData?.filter((cartItem) =>
      cartItem.productId.includes(props?.item?._id)
    )

    const myListItem = context?.myListData?.filter((item) =>
      item.productId.includes(props?.item?._id)
    )

    if (item?.length !== 0) {
      setCartItem(item)
      setIsAdded(true);
      setQuantity(item[0]?.quantity)
    } else {
      setQuantity(1)
    }

    if (myListItem?.length !== 0) {
      setIsAddedInMyList(true);
    } else {
      setIsAddedInMyList(false)
    }

  }, [context?.cartData]);

  const minusQty = () => {
    if (quantity !== 1 && quantity > 1) {
      setQuantity(quantity - 1)
    } else {
      setQuantity(1)
    }

    if (quantity === 1) {
      deleteData(`/api/cart/delete-cart-item/${cartItem[0]?._id}`).then((res) => {
        setIsAdded(false);
        context.alertBox("success", "Item Removed ");
        context?.getCartItems();
      })
    } else {
      const obj = {
        _id: cartItem[0]?._id,
        qty: quantity - 1,
        subTotal: props?.item?.price * (quantity - 1)
      }

      editData(`/api/cart/update-qty`, obj).then((res) => {
        context.alertBox("success", res?.data?.message);
        context?.getCartItems();
      })
    }
  }

  const addQty = () => {
    setQuantity(quantity + 1);

    const obj = {
      _id: cartItem[0]?._id,
      qty: quantity + 1,
      subTotal: props?.item?.price * (quantity + 1)
    }

    editData(`/api/cart/update-qty`, obj).then((res) => {
      context.alertBox("success", res?.data?.message);
      context?.getCartItems();
    })
  }

  const handleAddToMyList = (item) => {
    if (context?.userData === null) {
      context?.alertBox("error", "you are not login please login first");
      return false
    } else {
      const obj = {
        productId: item?._id,
        userId: context?.userData?._id,
        productTitle: item?.name,
        image: item?.images[0],
        rating: item?.rating,
        price: item?.price,
        oldPrice: item?.oldPrice,
        brand: item?.brand,
        discount: item?.discount
      }

      postData("/api/myList/add", obj).then((res) => {
        if (res?.error === false) {
          context?.alertBox("success", res?.message);
          setIsAddedInMyList(true);
          context?.getMyListData();
        } else {
          context?.alertBox("error", res?.message);
        }
      })
    }
  }

  const isVariant = props?.item?.hasVariants;
  const effectivePrice = props?.item?.effectivePrice;
  const effectiveOldPrice = props?.item?.effectiveOldPrice;
  const stockForDisplay = props?.item?.effectiveStock != null ? props?.item?.effectiveStock : props?.item?.countInStock;

  const displayOldPrice = isVariant && effectiveOldPrice != null ? effectiveOldPrice : props?.item?.oldPrice;
  const displayPrice = isVariant && effectivePrice != null && effectivePrice > 0 ? effectivePrice : (props?.item?.price || 0);

  const discountAmount = displayOldPrice && displayPrice && displayOldPrice > displayPrice
    ? (displayOldPrice - displayPrice)
    : 0;

  const discountPercent = displayOldPrice > 0 && displayOldPrice > displayPrice
    ? Math.round(((displayOldPrice - displayPrice) / displayOldPrice) * 100)
    : 0;

  return (
    <div className="productItem bg-white rounded-xl overflow-hidden border border-gray-200 h-full hover:shadow-lg hover:border-gray-300 transition-all duration-200 group">
      {/* Image Section */}
      <div className="relative overflow-hidden">
        <Link to={`/product/${props?.item?._id}`}>
          <div className="aspect-[4/5] overflow-hidden relative bg-gray-50">
            <img
              src={props?.item?.images[0]}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              alt={props?.item?.name}
              title={props?.item?.name}
              loading="lazy"
            />

            {props?.item?.images?.length > 1 && (
              <img
                src={props?.item?.images[1]}
                className="w-full h-full object-cover transition-all duration-700 absolute top-0 left-0 opacity-0 group-hover:opacity-100 group-hover:scale-105"
                alt={props?.item?.name}
                loading="lazy"
              />
            )}
          </div>
        </Link>

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-col items-center justify-center bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-md shadow-md px-1.5 py-0.5">
            <span className="text-[10px] sm:text-xs font-bold leading-none">-{discountPercent}%</span>
          </div>
        )}

        {/* Stock Badge */}
        {stockForDisplay <= 5 && stockForDisplay > 0 && (
          <div className="absolute top-3 right-3 z-10 bg-amber-50 text-amber-700 text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-full border border-amber-200">
            Only {stockForDisplay} left
          </div>
        )}

        {/* Out of Stock */}
        {stockForDisplay <= 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
            <span className="bg-white/90 text-gray-700 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full">
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick Actions */}
        <div 
          className="absolute top-3 right-3 z-20 flex flex-col gap-2 transition-all duration-300"
          onMouseEnter={() => setShowQuickActions(true)}
        >
          <div className={`flex flex-col gap-1.5 transition-all duration-300 ${showQuickActions ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
            <button 
              onClick={() => navigate(`/product/${props?.item?._id}`)}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-600 hover:text-white transition-all group"
            >
              <MdZoomOutMap className="text-base sm:text-lg text-gray-700 group-hover:text-white" />
            </button>

            <button 
              onClick={() => handleToggleCompare(props?.item)}
              className={`w-9 h-9 sm:w-10 sm:h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all ${
                isInCompare 
                  ? 'bg-indigo-600 text-white' 
                  : 'hover:bg-indigo-600 hover:text-white text-gray-700'
              }`}
            >
              <IoGitCompareOutline className="text-base sm:text-lg" />
            </button>

            <button 
              onClick={() => handleAddToMyList(props?.item)}
              className={`w-9 h-9 sm:w-10 sm:h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all ${
                isAddedInMyList 
                  ? 'bg-red-500 text-white' 
                  : 'hover:bg-red-500 hover:text-white text-gray-700'
              }`}
            >
              {isAddedInMyList ? (
                <IoMdHeart className="text-base sm:text-lg" />
              ) : (
                <FaRegHeart className="text-base sm:text-lg" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className={`relative flex flex-col flex-1 ${hideAddToCart ? 'p-2 sm:p-2.5' : 'p-2.5 sm:p-3'}`}>
        {/* Brand */}
        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-0.5">
          {props?.item?.brand}
        </p>

        {/* Title */}
        <h3 className="text-xs sm:text-sm font-semibold text-gray-800 mb-1.5 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
          <Link to={`/product/${props?.item?._id}`}>
            {props?.item?.name?.length > 40 ? props?.item?.name?.substr(0, 40) + '...' : props?.item?.name}
          </Link>
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <FaStar 
                key={i} 
                className={`text-[10px] ${i < Math.floor(props?.item?.rating || 0) ? 'text-amber-400' : 'text-gray-300'}`} 
              />
            ))}
          </div>
          <span className="text-[10px] text-gray-500">({props?.item?.rating || 0})</span>
        </div>

        {/* Price */}
        <div className="mb-2">
          {isVariant && effectivePrice > 0 ? (
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-sm sm:text-base font-bold text-purple-600">
                From {formatPrice(effectivePrice)}
              </span>
              {effectiveOldPrice > effectivePrice ? (
                <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 text-[9px] sm:text-[10px] font-bold rounded-full">
                  -{Math.round(((effectiveOldPrice - effectivePrice) / effectiveOldPrice) * 100)}%
                </span>
              ) : (
                <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 text-[9px] sm:text-[10px] font-bold rounded-full">
                  Options
                </span>
              )}
            </div>
          ) : displayOldPrice > 0 && displayOldPrice > displayPrice ? (
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-sm sm:text-base font-bold text-gray-900">
                {formatPrice(displayPrice)}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                {formatPrice(displayOldPrice)}
              </span>
              {discountPercent > 0 && (
                <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 text-[9px] sm:text-[10px] font-bold rounded-full">
                  -{discountPercent}%
                </span>
              )}
            </div>
          ) : (
            <span className="text-sm sm:text-base font-bold text-gray-900">
              {formatPrice(displayPrice)}
            </span>
          )}
        </div>

        {!hideAddToCart && (
          <div className="mt-auto">
            {isVariant ? (
              <Link to={`/product/${props?.item?._id}`}>
                <button className="w-full py-2 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5">
                  <MdZoomOutMap className="text-xs" />
                  Choose Options
                </button>
              </Link>
            ) : isAdded === false ? (
              (props?.item?.effectiveStock != null ? props?.item?.effectiveStock : props?.item?.countInStock) <= 0 ? (
                <button className="w-full py-2 bg-gray-50 text-gray-400 text-xs font-medium rounded-lg cursor-not-allowed border border-gray-200">
                  Out of Stock
                </button>
              ) : (
                <button 
                  onClick={() => handleAddToCart(props?.item)}
                  className="w-full py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                >
                  {isLoading ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : (
                    <>
                      <FaShoppingCart className="text-xs" />
                      Add to Cart
                    </>
                  )}
                </button>
              )
            ) : (
              <div className="flex items-center justify-between overflow-hidden rounded-lg border border-gray-200">
                <button 
                  onClick={minusQty}
                  className="w-9 h-9 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                >
                  <FaMinus className="text-[10px]" />
                </button>
                <span className="text-xs font-semibold text-gray-800 px-2">{quantity}</span>
                <button 
                  onClick={addQty}
                  className="w-9 h-9 flex items-center justify-center bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                >
                  <FaPlus className="text-[10px]" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default ProductItem;