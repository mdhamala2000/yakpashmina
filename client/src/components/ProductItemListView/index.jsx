import React,{useContext,useEffect, useState, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaRegHeart } from "react-icons/fa";
import { IoGitCompareOutline } from "react-icons/io5";
import { MdZoomOutMap, MdOutlineShoppingCart } from "react-icons/md";
import { FaMinus, FaPlus, FaStar } from "react-icons/fa6";
import { IoMdHeart } from "react-icons/io";
import { MyContext } from "../../App";
import { deleteData, editData, postData } from "../../utils/api";
import CircularProgress from '@mui/material/CircularProgress';
import { useCurrency } from "../../context/CurrencyContext";

const ProductItem = memo((props) => {

    const [quantity, setQuantity] = useState(1);
    const { formatPrice } = useCurrency();
    const [isAdded, setIsAdded] = useState(false);
    const [isAddedInMyList, setIsAddedInMyList] = useState(false);
    const [cartItem, setCartItem] = useState([]);
    const navigate = useNavigate();
  
    const [isLoading, setIsLoading] = useState(false);
  
  
    const context = useContext(MyContext);
  
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
      }
  
      else {
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

  return (
    <div className="productItem bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition-all duration-200">
      <div className="group imgWrapper w-full sm:w-[160px] lg:w-[200px] shrink-0 overflow-hidden relative">
        <Link to={`/product/${props?.item?._id}`}>
          <div className="aspect-[4/3] sm:aspect-[1/1] overflow-hidden relative bg-gray-50">
            <img
              src={props?.item?.images[0]}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              alt={props?.item?.name}
            />

            {props?.item?.images?.length > 1 && (
              <img
                src={props?.item?.images[1]}
                className="w-full h-full object-cover transition-all duration-700 absolute top-0 left-0 opacity-0 group-hover:opacity-100 group-hover:scale-105"
                alt={props?.item?.name}
              />
            )}
          </div>
        </Link>

        {props?.item?.discount > 0 && (
          <div className="absolute top-2 left-2 z-[70] bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded leading-none">
            -{props?.item?.discount}%
          </div>
        )}

        <div className="absolute top-2 right-2 z-50 flex items-center gap-1 transition-all duration-200 opacity-0 group-hover:opacity-100">
          <button onClick={() => navigate(`/product/${props?.item?._id}`)}
            className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow hover:bg-gray-900 hover:text-white transition-all">
            <MdZoomOutMap className="text-sm" />
          </button>
          <button className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow hover:bg-gray-900 hover:text-white transition-all">
            <IoGitCompareOutline className="text-sm" />
          </button>
          <button onClick={() => handleAddToMyList(props?.item)}
            className={`w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow hover:bg-red-500 hover:text-white transition-all ${isAddedInMyList ? 'bg-red-500 text-white' : ''}`}>
            {isAddedInMyList ? <IoMdHeart className="text-sm" /> : <FaRegHeart className="text-sm" />}
          </button>
        </div>
      </div>

      <div className="flex-1 p-3 sm:p-4 flex flex-col gap-2 sm:gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-0.5">
            {props?.item?.brand}
          </p>
          <h3 className="text-sm font-semibold text-gray-800 mb-1 leading-snug line-clamp-2 sm:line-clamp-1">
            <Link to={`/product/${props?.item?._id}`} className="hover:text-indigo-600 transition-colors">
             {props?.item?.name}
            </Link>
          </h3>

          <p className="text-xs text-gray-500 mb-2 line-clamp-2 sm:line-clamp-1">
           {props?.item?.description?.substr(0, 100)}...
          </p>

          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className={`text-[10px] ${i < Math.floor(props?.item?.rating || 0) ? 'text-amber-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-[10px] text-gray-500">({props?.item?.rating || 0})</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {props?.item?.hasVariants && props?.item?.effectivePrice > 0 ? (
              <>
                <span className="text-base font-bold text-purple-600">
                  From {formatPrice(props?.item?.effectivePrice)}
                </span>
                <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 text-[10px] font-bold rounded-full">
                  Options
                </span>
              </>
            ) : props?.item?.oldPrice > 0 && props?.item?.oldPrice > props?.item?.price ? (
              <>
                <span className="text-base font-bold text-gray-900">
                  {formatPrice(props?.item?.price)}
                </span>
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(props?.item?.oldPrice)}
                </span>
                {props?.item?.discount > 0 && (
                  <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-full">
                    -{props?.item?.discount}%
                  </span>
                )}
              </>
            ) : (
              <span className="text-base font-bold text-gray-900">
                {formatPrice(props?.item?.price)}
              </span>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-2 sm:pt-3 flex items-center justify-between sm:justify-end gap-3">
          <div className="sm:hidden">
            {props?.item?.hasVariants && props?.item?.effectivePrice > 0 ? (
              <span className="text-sm font-bold text-purple-600">
                From {formatPrice(props?.item?.effectivePrice)}
              </span>
            ) : (
              <>
                <span className="text-sm font-bold text-gray-900">
                  {formatPrice(props?.item?.price)}
                </span>
                {props?.item?.oldPrice > 0 && props?.item?.oldPrice > props?.item?.price && (
                  <span className="text-xs text-gray-400 line-through ml-1">
                    {formatPrice(props?.item?.oldPrice)}
                  </span>
                )}
              </>
            )}
          </div>

          <div className="w-full sm:max-w-[160px] lg:max-w-[180px]">
            {props?.item?.hasVariants ? (
              <Link to={`/product/${props?.item?._id}`}>
                <button className="flex w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-all active:scale-[0.98] items-center justify-center gap-1.5">
                  <MdZoomOutMap className="text-sm" /> Choose Options
                </button>
              </Link>
            ) : isAdded === false ? (
              (props?.item?.effectiveStock != null ? props?.item?.effectiveStock : props?.item?.countInStock) <= 0 ? (
                <span className="flex w-full px-3 py-2 bg-gray-50 text-gray-400 text-xs font-medium rounded-lg text-center border border-gray-200 cursor-not-allowed">
                  Out of Stock
                </span>
              ) : (
                <button className="flex w-full px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-lg transition-all active:scale-[0.98] items-center justify-center gap-1.5"
                  onClick={() => handleAddToCart(props?.item)}>
                  <MdOutlineShoppingCart className="text-sm" /> Add to Cart
                </button>
              )
            ) : isLoading === true ? (
              <span className="flex w-full px-4 py-2 bg-gray-50 text-gray-400 text-xs font-medium rounded-lg text-center border border-gray-200 items-center justify-center">
                <CircularProgress size={16} />
              </span>
            ) : (
              <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden">
                <button className="w-9 h-9 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors" onClick={minusQty}>
                  <FaMinus className="text-[10px]" />
                </button>
                <span className="flex-1 text-xs font-semibold text-gray-800 text-center min-w-[32px]">{quantity}</span>
                <button className="w-9 h-9 flex items-center justify-center bg-gray-900 text-white hover:bg-gray-800 transition-colors" onClick={addQty}>
                  <FaPlus className="text-[10px]" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default ProductItem;
