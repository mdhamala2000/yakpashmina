import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { FiShoppingBag, FiX, FiPlus, FiMinus, FiTrash2, FiArrowRight } from "react-icons/fi";
import { useCurrency } from "../../context/CurrencyContext";
import { MyContext } from "../../App";
import { deleteData, editData } from "../../utils/api";

const CartPanel = (props) => {
  const context = useContext(MyContext);
  const { convertPrice, CURRENCIES, currency } = useCurrency();

  const displayPrice = (priceUSD) => {
    if (!priceUSD || isNaN(priceUSD)) return `${CURRENCIES[currency]?.symbol || '$'}0.00`;
    const converted = convertPrice(priceUSD);
    return `${CURRENCIES[currency]?.symbol || '$'}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const calculateTotal = () => {
    if (!context.cartData?.length) return 0;
    return context.cartData.reduce((total, item) => total + parseFloat(item.price), 0);
  };

  const calculateSavings = () => {
    if (!context.cartData?.length) return 0;
    return context.cartData.reduce((total, item) => {
      const original = (item.oldPrice || item.price) * item.quantity;
      return total + (original - item.price);
    }, 0);
  };

  const removeItem = (id) => {
    deleteData(`/api/cart/delete-cart-item/${id}`).then(() => {
      context.alertBox("success", "Item removed");
      context?.getCartItems();
    });
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
  const itemCount = context.cartData?.length || 0;

  if (!context.cartData || context.cartData.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8 bg-white">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center mb-6 ring-1 ring-gray-200/50">
          <FiShoppingBag className="text-gray-300 text-3xl" />
        </div>
        <p className="text-gray-500 text-base font-medium mb-1">Your cart is empty</p>
        <p className="text-gray-400 text-sm mb-8">Looks like you haven't added anything yet</p>
        <Link
          to="/products"
          onClick={context.toggleCartPanel(false)}
          className="inline-flex items-center gap-2.5 px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10"
        >
          <FiShoppingBag className="text-base" />
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="relative">
            <FiShoppingBag className="text-gray-800 text-xl" />
            <span className="absolute -top-2 -right-2 w-4.5 h-4.5 bg-gray-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] min-h-[18px]">
              {itemCount}
            </span>
          </div>
          <span className="text-base font-semibold text-gray-900 tracking-tight">Shopping Cart</span>
        </div>
        <button
          onClick={context.toggleCartPanel(false)}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <FiX className="text-gray-500 text-lg" />
        </button>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="divide-y divide-gray-50">
          {props?.data?.map((item, index) => {
            const itemOriginal = item.oldPrice || item.price;
            const itemSavings = itemOriginal - item.price;
            const itemQty = item.quantity || 1;

            return (
              <div key={index} className="flex gap-4 px-5 py-4 hover:bg-gray-50/40 transition-colors">
                {/* Image */}
                <Link to={`/product/${item?.productId}`} onClick={context.toggleCartPanel(false)} className="shrink-0">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 ring-1 ring-gray-200/60 shadow-sm">
                    <img
                      src={item?.image || 'https://via.placeholder.com/80x80?text=Product'}
                      alt=""
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/product/${item?.productId}`} onClick={context.toggleCartPanel(false)} className="block min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                        {item?.productTitle || 'Product'}
                      </h4>
                      {item?.variantSku && (
                        <p className="text-xs text-gray-400 mt-0.5">{item?.variantSku}</p>
                      )}
                    </Link>
                    <button
                      onClick={() => removeItem(item._id)}
                      className="shrink-0 p-1.5 -mr-1 -mt-1 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <FiTrash2 className="text-gray-400 hover:text-red-500 text-base transition-colors" />
                    </button>
                  </div>

                  {/* Price row */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg px-2 py-1.5">
                      <button
                        onClick={() => updateQty(item, -1)}
                        className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white transition-colors"
                      >
                        <FiMinus className="text-gray-600 text-xs" />
                      </button>
                      <span className="text-sm font-semibold text-gray-800 min-w-[26px] text-center">{itemQty}</span>
                      <button
                        onClick={() => updateQty(item, 1)}
                        className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white transition-colors"
                      >
                        <FiPlus className="text-gray-600 text-xs" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-gray-900">{displayPrice(item.price)}</p>
                      {item.oldPrice && item.oldPrice > item.price && (
                        <p className="text-xs text-gray-400 line-through">{displayPrice(item.oldPrice)}</p>
                      )}
                    </div>
                  </div>

                  {itemSavings > 0 && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 font-semibold px-1.5 py-0.5 rounded leading-none">
                        {item.discount || Math.round(itemSavings / itemOriginal * 100)}% OFF
                      </span>
                      <span className="text-xs text-emerald-600 font-medium">Save {displayPrice(itemSavings)}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 px-5 py-4 space-y-3.5">
        {savings > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-emerald-600 font-medium">Total savings</span>
            <span className="text-sm font-semibold text-emerald-600">{displayPrice(savings)}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 font-medium">Subtotal</span>
          <span className="text-lg font-bold text-gray-900">{displayPrice(total)}</span>
        </div>

        <p className="text-xs text-gray-400 text-right -mt-1">Shipping & taxes calculated at checkout</p>

        <Link
          to="/checkout"
          onClick={context.toggleCartPanel(false)}
          className="block w-full py-3.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-all text-center tracking-tight"
        >
          Checkout — {displayPrice(total)}
        </Link>

        <Link
          to="/cart"
          onClick={context.toggleCartPanel(false)}
          className="block w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          View full cart <FiArrowRight className="inline text-xs" />
        </Link>
      </div>
    </div>
  );
};

export default CartPanel;