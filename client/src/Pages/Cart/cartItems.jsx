import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IoCloseSharp } from "react-icons/io5";
import { deleteData, editData } from "../../utils/api";
import { MyContext } from "../../App";
import { useCurrency } from "../../context/CurrencyContext";
import { FaMinus, FaPlus } from "react-icons/fa6";

const CartItems = (props) => {
  const [quantity, setQuantity] = useState(props.qty || 1);
  const context = useContext(MyContext);
  const { convertPrice, currency } = useCurrency();

  const itemQty = props?.item?.quantity || 1;
  const pricePerUnit = props?.item?.price / itemQty;
  
  // Format price with automatic conversion
  const displayPrice = (priceInUSD) => {
    if (!priceInUSD || isNaN(priceInUSD)) {
      const symbol = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'AUD' ? 'A$' : currency === 'CAD' ? 'C$' : currency === 'AED' ? 'د.إ' : '$';
      return `${symbol}0.00`;
    }
    const converted = convertPrice(priceInUSD);
    const symbol = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'AUD' ? 'A$' : currency === 'CAD' ? 'C$' : currency === 'AED' ? 'د.إ' : '$';
    return `${symbol}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleQuantityChange = (newQty) => {
    if (newQty < 0) return;
    
    setQuantity(newQty);

    const cartObj = {
      _id: props?.item?._id,
      qty: newQty,
      subTotal: props?.item?.price
    }

    editData("/api/cart/update-qty", cartObj).then((res) => {
      if (res?.data?.error === false) {
        context?.getCartItems();
      }
    })
  }

  const removeItem = (id) => {
    deleteData(`/api/cart/delete-cart-item/${id}`).then((res) => {
      context.alertBox("success", "Product removed from cart");
      context?.getCartItems();
    })
  }

  return (
    <div className="cartItem w-full p-4 sm:p-5 flex items-start gap-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <div className="w-[100px] sm:w-[120px] flex-shrink-0">
        <Link to={`/product/${props?.item?.productId}`}>
          <div className="relative overflow-hidden rounded-lg aspect-square">
            <img
              src={props?.item?.image}
              alt={props?.item?.productTitle}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-gray-500 font-medium">{props?.item?.brand}</p>
            <h3 className="text-sm sm:text-base font-semibold text-gray-800 truncate pr-6">
              <Link to={`/product/${props?.item?.productId}`} className="hover:text-primary transition-colors">
                {props?.item?.productTitle?.length > 50 ? props?.item?.productTitle?.substring(0, 50) + '...' : props?.item?.productTitle}
              </Link>
            </h3>

            <div className="flex items-center gap-3 mt-2 flex-wrap">
<span className="text-lg font-bold text-primary">
                {displayPrice(props?.item?.price)}
              </span>
              {props?.item?.oldPrice > 0 && (
                <span className="text-sm text-gray-400 line-through">
                  {displayPrice(props?.item?.oldPrice)}
                </span>
              )}
              {props?.item?.discount > 0 && (
                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                  {props?.item?.discount}% OFF
                </span>
              )}
            </div>
          </div>

          <button 
            onClick={() => removeItem(props?.item?._id)}
            className="p-1 hover:bg-red-50 rounded-full transition-colors"
            title="Remove item"
          >
            <IoCloseSharp className="text-xl text-gray-400 hover:text-red-500" />
          </button>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="quantity-controls">
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button 
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 0}
                className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaMinus className="text-xs text-gray-600" />
              </button>
              <div className="w-14 h-10 flex items-center justify-center bg-white border-x border-gray-200">
                <span className="font-semibold text-gray-800">{quantity}</span>
              </div>
              <button 
                onClick={() => handleQuantityChange(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <FaPlus className="text-xs text-gray-600" />
              </button>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-500">Per unit: {displayPrice(pricePerUnit)}</p>
            <p className="text-xs text-gray-500">Subtotal</p>
            <p className="text-base font-bold text-gray-800">
              {displayPrice(props?.item?.price)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItems;
