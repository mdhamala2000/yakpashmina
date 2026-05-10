import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { MdClose } from "react-icons/md";
import { FaShoppingBag, FaArrowRight, FaMinus, FaPlus } from "react-icons/fa";
import { useCurrency } from "../../context/CurrencyContext";
import { MyContext } from "../../App";
import { deleteData, editData } from "../../utils/api";

const CartPanel = (props) => {
  const context = useContext(MyContext);
  const { convertPrice, CURRENCIES, currency } = useCurrency();

  // Convert USD price to selected currency
  const displayPrice = (priceUSD) => {
    if (!priceUSD || isNaN(priceUSD)) return `${CURRENCIES[currency]?.symbol || '$'}0.00`;
    const converted = convertPrice(priceUSD);
    return `${CURRENCIES[currency]?.symbol || '$'}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const calculateTotal = () => {
    if (!context.cartData?.length) return 0;
    return context.cartData?.reduce((total, item) => total + parseFloat(item.price), 0);
  };

  const calculateSavings = () => {
    if (!context.cartData?.length) return 0;
    return context.cartData?.reduce((total, item) => {
      const original = (item.oldPrice || item.price) * item.quantity;
      const discounted = item.price;
      return total + (original - discounted);
    }, 0);
  };

  const removeItem = (id) => {
    deleteData(`/api/cart/delete-cart-item/${id}`).then((res) => {
      context.alertBox("success", "Item removed");
      context?.getCartItems();
    })
  };

  const updateQty = (item, change) => {
    const newQty = item.quantity + change;
    if (newQty < 1) {
      removeItem(item._id);
      return;
    }
    editData(`/api/cart/update-qty`, {
      _id: item._id,
      qty: newQty,
      subTotal: item.price
    }).then(() => context?.getCartItems());
  };

  const total = calculateTotal();
  const savings = calculateSavings();
  const symbol = CURRENCIES[currency]?.symbol || '$';

  return (
    <div className="h-full flex flex-col bg-white font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-2">
          <FaShoppingBag className="text-gray-800 text-xl" />
          <span className="font-bold text-gray-900 text-lg">
            Your Cart
          </span>
        </div>
        <button onClick={context.toggleCartPanel(false)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
          <MdClose className="text-2xl text-gray-500" />
        </button>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto">
        {(!context.cartData || context.cartData.length === 0) ? (
          <div className="flex flex-col items-center justify-center h-full py-16 px-6">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5">
              <FaShoppingBag className="text-gray-400 text-3xl" />
            </div>
            <p className="text-gray-600 text-base font-medium mb-1">Your cart is empty</p>
            <p className="text-gray-400 text-sm mb-4">Add something to get started</p>
            <Link to="/products" onClick={context.toggleCartPanel(false)} className="text-gray-900 text-sm font-semibold underline underline-offset-4 hover:no-underline">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {props?.data?.map((item, index) => {
              const itemOriginal = item.oldPrice || item.price;
              const itemSavings = (itemOriginal - item.price);
              const itemTotal = item.price;
              const itemQty = item.quantity || 1;
              
              return (
                <div key={index} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                  {/* Image */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 shadow-sm">
                    <Link to={`/product/${item?.productId}`} onClick={context.toggleCartPanel(false)}>
                      <img src={item?.image} alt="" className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
                    </Link>
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item?.productId}`} onClick={context.toggleCartPanel(false)} className="block">
                      <h4 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 mb-1.5">
                        {item?.productTitle}
                      </h4>
                    </Link>
                    
                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => updateQty(item, -1)} 
                          className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                        >
                          <FaMinus className="text-xs text-gray-600" />
                        </button>
                        <span className="text-sm font-medium text-gray-700 px-3 min-w-[28px] text-center">{itemQty}</span>
                        <button 
                          onClick={() => updateQty(item, 1)} 
                          className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                        >
                          <FaPlus className="text-xs text-gray-600" />
                        </button>
                      </div>
                      
                      {/* Price */}
                      <div className="text-right">
                        <p className="text-base font-bold text-gray-900">
                          {displayPrice(itemTotal)}
                        </p>
                        {item.oldPrice && item.oldPrice > itemTotal && (
                          <p className="text-xs text-gray-400 line-through">
                            {displayPrice(item.oldPrice)}
                          </p>
                        )}
                      </div>
                    </div>

                    {itemSavings > 0 && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-semibold">
                          {item.discount || Math.round(itemSavings / itemOriginal * 100)}% OFF
                        </span>
                        <span className="text-xs text-green-600 font-medium">
                          Save {displayPrice(itemSavings)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Remove */}
                  <button onClick={() => removeItem(item._id)} className="text-gray-300 hover:text-red-500 self-start p-1 transition-colors">
                    <MdClose className="text-xl" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {context.cartData && context.cartData.length > 0 && (
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          {/* Savings */}
          {savings > 0 && (
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-green-600 font-medium">You save</span>
                <span className="text-sm font-bold text-green-600">{displayPrice(savings)}</span>
              </div>
            </div>
          )}
          
          {/* Subtotal */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-600 font-medium">Subtotal</span>
            <span className="text-xl font-bold text-gray-900">{displayPrice(total)}</span>
          </div>
          
          <p className="text-xs text-gray-400 text-right mb-4">Shipping & taxes calculated at checkout</p>
          
          {/* Buttons */}
          <div className="flex gap-3">
            <Link to="/cart" onClick={context.toggleCartPanel(false)} className="flex-1">
              <button className="w-full py-3.5 bg-white border-2 border-gray-200 text-gray-900 rounded-xl font-semibold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2">
                View Cart <FaArrowRight className="text-xs" />
              </button>
            </Link>
            <Link to="/checkout" onClick={context.toggleCartPanel(false)} className="flex-1">
              <button className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20">
                Checkout
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPanel;