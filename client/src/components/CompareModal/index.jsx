import { useContext } from "react";
import { MyContext } from "../../App";
import { useCurrency } from "../../context/CurrencyContext";
import { IoMdClose } from "react-icons/io";
import Rating from "@mui/material/Rating";
import { Link } from "react-router-dom";

const CompareModal = () => {
  const context = useContext(MyContext);
  const { formatPrice } = useCurrency();

  if (!context.openCompareModal) return null;

  const removeFromCompare = (productId) => {
    const updated = context.compareList.filter((p) => p._id !== productId);
    context.setCompareList(updated);
    if (updated.length === 0) context.setOpenCompareModal(false);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => context.setOpenCompareModal(false)}>
      <div className="w-full max-w-6xl max-h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Compare Products</h2>
              <p className="text-xs text-gray-400 mt-0.5">{context.compareList.length} product{context.compareList.length > 1 ? "s" : ""}</p>
            </div>
          </div>
          <button onClick={() => context.setOpenCompareModal(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
            <IoMdClose className="text-base text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto px-6 py-5">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Product Header Row */}
            <div className="flex divide-x divide-gray-50">
              <div className="w-28 shrink-0" />
              {context.compareList.map((product) => (
                <div key={product._id} className="flex-1 px-4 pt-4 pb-2 relative group">
                  <button onClick={() => removeFromCompare(product._id)}
                    className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-300 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-400 hover:border-red-200">
                    <IoMdClose className="text-xs" />
                  </button>
                  <div className="w-20 h-20 mx-auto rounded-lg bg-gray-50 overflow-hidden mb-2 border border-gray-100">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    {product.brand && (
                      <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-1.5 py-0.5 rounded-full">{product.brand}</span>
                    )}
                    <Link to={"/product/" + product._id} onClick={() => context.setOpenCompareModal(false)}
                      className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 hover:text-indigo-600 transition-colors block mt-1">
                      {product.name}
                    </Link>
                  </div>
                </div>
              ))}
              {Array.from({ length: 3 - context.compareList.length }).map((_, i) => (
                <div key={"empty-" + i} className="flex-1 px-4 pt-4 pb-2">
                  <div className="w-20 h-20 mx-auto rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <p className="text-[11px] text-gray-400 text-center mt-2 font-medium">Add product</p>
                </div>
              ))}
            </div>

            {/* Spec Rows */}
            <div className="divide-y divide-gray-50">
              <RenderRow label="Price" products={context.compareList} max={3}>
                {(product) => {
                  const stock = product.effectiveStock != null ? product.effectiveStock : product.countInStock;
                  return (
                    <div className="flex items-center justify-between gap-2 w-full">
                      <div>
                        <div className="text-lg font-bold text-gray-900">{formatPrice(product.effectivePrice ?? product.price ?? 0)}</div>
                        {(product.effectiveOldPrice ?? product.oldPrice ?? 0) > 0 && (
                          <div className="text-xs text-gray-400 line-through">{formatPrice(product.effectiveOldPrice ?? product.oldPrice ?? 0)}</div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {(product.effectiveDiscount ?? product.discount ?? 0) > 0 && (
                          <span className="text-[10px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded">-{(product.effectiveDiscount ?? product.discount ?? 0)}%</span>
                        )}
                        <div className={"flex items-center gap-1 text-xs font-medium " + (stock > 0 ? "text-emerald-600" : "text-red-500")}>
                          <span className={"w-1.5 h-1.5 rounded-full " + (stock > 0 ? "bg-emerald-500" : "bg-red-400")} />
                          {stock > 0 ? "In Stock (" + stock + ")" : "Out of Stock"}
                        </div>
                      </div>
                    </div>
                  );
                }}
              </RenderRow>

              <RenderRow label="Rating" products={context.compareList} max={3}>
                {(product) => (
                  <div className="flex items-center gap-2">
                    <Rating value={product.rating || 0} precision={0.1} size="small" readOnly />
                    <span className="text-xs text-gray-400">({product.reviewsCount || 0})</span>
                  </div>
                )}
              </RenderRow>

              <RenderRow label="Category" products={context.compareList} max={3}>
                {(product) => <span className="text-sm text-gray-700">{product.catName || "-"}</span>}
              </RenderRow>

              <RenderRow label="SKU" products={context.compareList} max={3}>
                {(product) => <span className="text-sm text-gray-700 font-mono">{product.sku || "-"}</span>}
              </RenderRow>

              <RenderRow label="Material" products={context.compareList} max={3}>
                {(product) => <span className="text-sm text-gray-700 capitalize">{product.materials || "-"}</span>}
              </RenderRow>

              <RenderRow label="Dimensions" products={context.compareList} max={3}>
                {(product) => <span className="text-sm text-gray-700">{product.dimensions || "-"}</span>}
              </RenderRow>

              <RenderRow label="Weight" products={context.compareList} max={3}>
                {(product) => <span className="text-sm text-gray-700">{product.productWeight ? product.productWeight.join(", ") : "-"}</span>}
              </RenderRow>

              <RenderRow label="Warranty" products={context.compareList} max={3}>
                {(product) => <span className="text-sm text-gray-700">{product.warranty || "-"}</span>}
              </RenderRow>

              <RenderRow label="Origin" products={context.compareList} max={3}>
                {(product) => <span className="text-sm text-gray-700 capitalize">{product.countryOfOrigin || "-"}</span>}
              </RenderRow>

              <RenderRow label="Description" products={context.compareList} max={3}>
                {(product) => <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{product.description || "-"}</p>}
              </RenderRow>

              <RenderRow label="" products={context.compareList} max={3}>
                {(product) => (
                  <Link to={"/product/" + product._id} onClick={() => context.setOpenCompareModal(false)}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                    View Product
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                )}
              </RenderRow>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t border-gray-100 flex items-center justify-between shrink-0">
          <button onClick={() => { context.setCompareList([]); context.setOpenCompareModal(false); }}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors font-medium">
            Clear all
          </button>
          <button onClick={() => context.setOpenCompareModal(false)}
            className="px-5 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

function RenderRow({ label, products, max, children }) {
  return (
    <div className="flex divide-x divide-gray-50">
      <div className="w-28 shrink-0 px-5 py-3 flex items-center">
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
      </div>
      {products.map((product) => (
        <div key={product._id} className="flex-1 px-5 py-3 flex items-center">
          {children(product)}
        </div>
      ))}
      {Array.from({ length: max - products.length }).map((_, i) => (
        <div key={"empty-" + i} className="flex-1 px-5 py-3 flex items-center">
          <span className="text-sm text-gray-200">-</span>
        </div>
      ))}
    </div>
  );
}

export default CompareModal;
