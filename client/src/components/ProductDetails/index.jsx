import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MyContext } from "../../App";
import { postData, getData } from "../../utils/api";
import { useCurrency } from "../../context/CurrencyContext";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";
import { ProductZoom } from "../ProductZoom";
import {
  Star, Truck, RotateCcw, Shield, MessageCircle,
  Minus, Plus, Heart, Check, AlertCircle,
  FileText, Layers, GitCompare, MessageSquare
} from "lucide-react";
import { Reviews } from "../../Pages/ProductDetails/reviews";

const TabsSection = ({ activeTab, setActiveTab, showFullDesc, setShowFullDesc, description, specifications, reviewsCount, productId, productName, setReviewsCount }) => {
  const tabs = [
    { id: "description", label: "Description", icon: FileText },
    { id: "specifications", label: "Specifications", icon: Layers },
    { id: "reviews", label: "Reviews", icon: MessageSquare },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
      <div className="flex gap-1 p-1.5 bg-gray-100/50 border-b border-gray-200/50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setShowFullDesc(false); }}
              className={`relative flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] sm:text-xs font-bold tracking-[0.02em] rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-white text-gray-900 shadow-[0_1px_4px_rgba(0,0,0,0.08)] border border-gray-300/60"
                  : "text-gray-500 hover:text-gray-800 hover:bg-white/60"
              }`}
            >
              <Icon size={13} className={isActive ? "text-indigo-500" : "text-gray-300"} />
              {tab.label}
              {tab.id === "reviews" && reviewsCount > 0 && (
                <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-full ml-1">{reviewsCount}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-4 sm:p-5">
        {activeTab === "description" && (
          description ? (
            <div className="text-gray-700 text-sm sm:text-[15px] leading-[1.8] tracking-[0.01em] whitespace-pre-line font-[450]">
              {showFullDesc || description.length <= 300
                ? description
                : description.substring(0, 300) + '...'}
              {description.length > 300 && (
                <button
                  onClick={() => setShowFullDesc(!showFullDesc)}
                  className="inline-flex items-center gap-1 mt-2 text-indigo-600 hover:text-indigo-700 font-bold text-xs transition-all"
                >
                  {showFullDesc ? (
                    <>− Show less</>
                  ) : (
                    <><span className="text-base leading-none">+</span> Read more</>
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-10 h-10 mx-auto mb-2.5 rounded-full bg-gray-50 flex items-center justify-center">
                <FileText size={16} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-400">No description available.</p>
            </div>
          )
        )}
        {activeTab === "specifications" && (
          specifications.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {specifications.map((spec, i) => (
                <div key={spec.label} className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50/80 border border-gray-200/70 hover:border-indigo-300/60 hover:bg-indigo-50/40 transition-all duration-200">
                  <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-indigo-600">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-gray-500 uppercase tracking-[0.08em] font-bold block">{spec.label}</span>
                    <p className="text-sm font-semibold text-gray-700 mt-0.5">{spec.value}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-10 h-10 mx-auto mb-2.5 rounded-full bg-gray-50 flex items-center justify-center">
                <Layers size={16} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-400">No specifications available.</p>
            </div>
          )
        )}
        {activeTab === "reviews" && (
          <Reviews
            productId={productId}
            setReviewsCount={setReviewsCount}
            itemName={productName}
          />
        )}
      </div>
    </div>
  );
};

export const ProductDetailsComponent = ({ item, reviewsCount = 0, liveRating = 0, setReviewsCount }) => {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isAddedInMyList, setIsAddedInMyList] = useState(false);
  const [isInCompare, setIsInCompare] = useState(false);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [showFullDesc, setShowFullDesc] = useState(false);

  const [variants, setVariants] = useState([]);
  const [variantLoading, setVariantLoading] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [variantAttributes, setVariantAttributes] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({});
  const [variantImages, setVariantImages] = useState([]);

  const context = useContext(MyContext);
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const name = item?.name || "";
  const brand = item?.brand || "";
  const description = item?.description || "";
  const images = item?.images || [];
  const price = selectedVariant?.price ?? item?.effectivePrice ?? item?.price ?? 0;
  const oldPrice = selectedVariant?.oldPrice ?? item?.effectiveOldPrice ?? item?.oldPrice ?? 0;
  const discount = oldPrice > 0 ? Math.round(((oldPrice - price) / oldPrice) * 100) : (item?.effectiveDiscount ?? item?.discount ?? 0);
  const countInStock = selectedVariant?.stock ?? item?.effectiveStock ?? item?.countInStock ?? 0;
  const colors = item?.color || [];
  const sizes = item?.size || [];
  const materials = item?.materials || "";
  const hasVariants = item?.hasVariants;
  const cap = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : str;

  const getSpecifications = () => {
    const specs = [];
    if (sizes.length > 0 && !hasVariants) specs.push({ label: 'Size', value: sizes.join(', ') });
    if (item?.productWeight?.length > 0) specs.push({ label: 'Weight', value: item.productWeight.join(', ') });
    if (colors.length > 0 && !hasVariants) specs.push({ label: 'Colors', value: `${colors.length} Options` });
    if (materials) specs.push({ label: 'Material', value: materials });
    if (item?.productMaterials?.length > 0) specs.push({ label: 'Materials', value: item.productMaterials.join(', ') });
    if (brand) specs.push({ label: 'Brand', value: brand });
    if (item?.clothType) specs.push({ label: 'Type', value: item.clothType });
    if (item?.countryOfOrigin) specs.push({ label: 'Origin', value: item.countryOfOrigin });
    if (item?.productRam?.length > 0) specs.push({ label: 'RAM', value: item.productRam.join(', ') });
    if (item?.storage) specs.push({ label: 'Storage', value: item.storage });
    if (item?.dimensions) specs.push({ label: 'Dimensions', value: item.dimensions });
    if (item?.warranty) specs.push({ label: 'Warranty', value: item.warranty });
    if (currentSku) specs.push({ label: 'SKU', value: currentSku });
    return specs;
  };

  const [openInquiryModal, setOpenInquiryModal] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({ name: "", email: "", phone: "", message: "" });

  const discountPercent = discount;

  const selectedColorOption = selectedOptions?.Color || selectedOptions?.color || selectedColor || '';
  const colorImagesMap = {};
  variantImages.forEach(img => {
    if (img.color) {
      if (!colorImagesMap[img.color]) colorImagesMap[img.color] = [];
      colorImagesMap[img.color].push(img);
    }
  });
  const imagesForColor = selectedColorOption ? (colorImagesMap[selectedColorOption] || []) : [];
  const displayImages = imagesForColor.length > 0
    ? imagesForColor.map(img => img.url)
    : images;

  const currentSku = selectedVariant?.sku || item?.sku || "";
  const sizeOptions = selectedVariant?.size || sizes;
  const colorOptions = selectedVariant?.color || colors;
  const specifications = getSpecifications();

  const isVariantProduct = hasVariants;
  const isVariantUnselected = isVariantProduct && !selectedVariant && variants.length > 0;
  const isOutOfStock = countInStock <= 0;

  const findMatchingVariant = (options, allVariants) => {
    const match = allVariants?.find(v =>
      Object.keys(options).every(key => v.options?.[key] === options[key])
    );
    if (match) {
      setSelectedVariant(match);
      if (match.options?.Color) setSelectedColor(match.options.Color);
    }
  };

  const getDisabledOptions = (attrName) => {
    const otherSelections = { ...selectedOptions };
    delete otherSelections[attrName];
    const availableValues = new Set();
    variants.forEach(v => {
      const matchesOther = Object.keys(otherSelections).every(key =>
        v.options?.[key] === otherSelections[key]
      );
      if (matchesOther && v.options?.[attrName] && v.isActive !== false) {
        availableValues.add(v.options[attrName]);
      }
    });
    return availableValues;
  };

  const handleOptionChange = (attrName, value) => {
    const newSelection = { ...selectedOptions, [attrName]: value };
    setSelectedOptions(newSelection);
    findMatchingVariant(newSelection, variants);
  };

  useEffect(() => {
    if (!item?._id || !hasVariants) return;
    const fetchVariantsData = async () => {
      setVariantLoading(true);
      try {
        const [variantRes, imagesRes] = await Promise.all([
          getData(`/api/variant/product/${item._id}`),
          getData(`/api/variant/images/${item._id}`)
        ]);
        if (variantRes?.success && variantRes?.variants?.length) {
          setVariants(variantRes.variants);
          const attrOptions = {};
          variantRes.variants.forEach(v => {
            if (v.options) {
              Object.keys(v.options).forEach(key => {
                if (!attrOptions[key]) attrOptions[key] = new Set();
                attrOptions[key].add(v.options[key]);
              });
            }
          });
          const formattedAttrs = {};
          Object.keys(attrOptions).forEach(key => {
            formattedAttrs[key] = Array.from(attrOptions[key]);
          });
          setVariantAttributes(formattedAttrs);
          if (Object.keys(formattedAttrs).length > 0) {
            const initialSelection = {};
            Object.keys(formattedAttrs).forEach(key => {
              initialSelection[key] = formattedAttrs[key][0];
            });
            setSelectedOptions(initialSelection);
            findMatchingVariant(initialSelection, variantRes.variants);
          }
        }
        if (imagesRes?.success) {
          setVariantImages(imagesRes.images || []);
        }
      } catch {
        setVariants([]);
      } finally {
        setVariantLoading(false);
      }
    };
    fetchVariantsData();
  }, [item?._id, hasVariants]);

  useEffect(() => {
    const cartItem = context?.cartData?.filter((cartItem) =>
      cartItem.productId === item?._id
    );
    setIsAdded(cartItem?.length !== 0);
  }, [isAdded, item?._id, context?.cartData]);

  useEffect(() => {
    const myListItem = context?.myListData?.filter((listItem) =>
      listItem.productId === item?._id
    );
    setIsAddedInMyList(myListItem?.length !== 0);
  }, [context?.myListData, item?._id]);

  useEffect(() => {
    const inCompare = context?.compareList?.some(p => p._id === item?._id);
    setIsInCompare(inCompare);
  }, [context?.compareList, item?._id]);

  const handleToggleCompare = () => {
    const isInList = context?.compareList?.some(p => p._id === item?._id);
    if (isInList) {
      context.setOpenCompareModal(true);
    } else {
      if (context.compareList.length >= 3) {
        context.alertBox("error", "You can compare up to 3 products only");
        return;
      }
      context.setCompareList([...context.compareList, item]);
      context.setOpenCompareModal(true);
    }
  };

  const handleAddToCart = async () => {
    if (!context?.isLogin || !context?.userData?._id) {
      localStorage.setItem("pendingCartItem", JSON.stringify({
        productId: item?._id,
        productName: name,
        image: displayImages[0] || images[0],
        rating: item?.rating,
        price,
        oldPrice,
        discount,
        quantity,
        countInStock,
        brand,
        color: selectedColor || selectedVariant?.options?.Color || "",
        materials,
        variantId: selectedVariant?._id,
        variantSku: selectedVariant?.sku,
      }));
      context?.alertBox("info", "Please login to add items to cart");
      navigate("/login");
      return false;
    }

    const productItem = {
      _id: item?._id,
      productTitle: name,
      image: displayImages[0] || images[0],
      rating: item?.rating,
      price,
      oldPrice,
      discount,
      quantity,
      subTotal: parseFloat((price * quantity).toFixed(2)),
      productId: item?._id,
      countInStock,
      brand,
      size: selectedSize,
      color: selectedColor || selectedVariant?.options?.Color || "",
      materials,
      variantId: selectedVariant?._id,
      variantSku: selectedVariant?.sku,
    };

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
    } catch {
      context?.alertBox("error", "Failed to add to cart");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToMyList = () => {
    if (!context?.userData) {
      context?.alertBox("error", "Please login first");
      return;
    }
    const obj = {
      productId: item?._id,
      userId: context?.userData?._id,
      productTitle: name,
      image: displayImages[0] || images[0],
      rating: item?.rating,
      price,
      oldPrice,
      brand,
      discount,
    };
    postData("/api/myList/add", obj).then((res) => {
      if (res?.error === false) {
        context?.alertBox("success", res?.message);
        setIsAddedInMyList(true);
        context?.getMyListData();
      } else {
        context?.alertBox("error", res?.message);
      }
    });
  };

  const handleInquiryChange = (e) => {
    setInquiryForm({ ...inquiryForm, [e.target.name]: e.target.value });
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!inquiryForm.name || !inquiryForm.email || !inquiryForm.message) {
      context?.alertBox("error", "Please fill in required fields");
      return;
    }
    const payload = {
      ...inquiryForm,
      productId: item?._id,
      productName: name,
      toEmail: "Mdhamala2000@gmail.com"
    };
    try {
      const res = await postData("/api/user/sendInquiry", payload);
      if (res?.error === false) {
        context?.alertBox("success", "Inquiry sent successfully!");
        setOpenInquiryModal(false);
        setInquiryForm({ name: "", email: "", phone: "", message: "" });
      } else {
        context?.alertBox("error", res?.message || "Failed to send inquiry");
      }
    } catch {
      context?.alertBox("error", "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-start gap-8 lg:gap-12">
      {/* LEFT: Product Images + Desktop Tabs */}
      <div className="md:w-[60%] order-1 md:order-none">
        <div className="relative">
          <ProductZoom key={selectedColorOption || "default"} images={displayImages} />
          {discountPercent > 0 && (
            <span className="absolute top-4 left-4 z-10 bg-gradient-to-r from-emerald-600 to-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-green-600/30">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Desktop: Tabs below images */}
        <div className="hidden md:block mt-10">
            <TabsSection
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              showFullDesc={showFullDesc}
              setShowFullDesc={setShowFullDesc}
              description={description}
              specifications={specifications}
              reviewsCount={reviewsCount}
              productId={item?._id}
              productName={name}
              setReviewsCount={setReviewsCount}
            />
        </div>
      </div>

      {/* RIGHT: Product Info Panel (sticky on desktop) */}
      <div className="md:w-[40%] md:sticky md:top-6 md:self-start order-2 md:order-none">
        <div className="space-y-4">
          {/* Brand & Title */}
          <div>
            {brand && <span className="text-[11px] text-indigo-600 font-bold uppercase tracking-[0.08em]">{brand}</span>}
            <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 leading-tight mt-0.5 capitalize tracking-tight">{name}</h1>
          </div>

          {/* Rating + Price row */}
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="flex items-baseline gap-2.5">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-0.5">Price</span>
                <span className="text-2xl font-bold text-gray-900 tracking-tight font-roboto">{formatPrice(price)}</span>
                {oldPrice > price && (
                  <span className="text-sm text-red-400 line-through font-semibold">{formatPrice(oldPrice)}</span>
                )}
                {oldPrice > price && discountPercent > 0 && (
                  <span className="text-xs font-bold text-white bg-rose-600 px-2 py-0.5 rounded-full shadow-sm">-{discountPercent}%</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={12} className={star <= Math.round(liveRating || item?.rating || 0) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
                  ))}
                </div>
                <span className="text-xs font-bold text-gray-800">{(liveRating || item?.rating || 0).toFixed(1)}</span>
                <span className="text-xs text-gray-500">({reviewsCount || 0})</span>
              </div>
            </div>
          </div>

          {/* Variant Selection */}
          {variantLoading ? (
            <div className="flex items-center gap-2 text-xs text-gray-500 py-2">
              <CircularProgress size={14} />
              <span>Loading options...</span>
            </div>
          ) : (
            <>
              {/* Variant Attributes */}
              {Object.keys(variantAttributes).length > 0 && (
                <div className="space-y-3 border-t border-gray-200/70 pt-3">
                  {Object.entries(variantAttributes).map(([attrName, options]) => {
                    const disabledOptions = getDisabledOptions(attrName);
                    const isColorAttr = attrName.toLowerCase() === 'color';
                    const selected = selectedOptions[attrName];
                    const isSingleOption = options.length === 1;
                    return (
                      <div key={attrName}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-bold text-gray-800 capitalize tracking-[0.02em]">{attrName}</span>
                          {isSingleOption ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                              <Check size={12} /> {cap(selected)}
                            </span>
                          ) : (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${selected ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                              {selected || 'Select'}
                            </span>
                          )}
                        </div>
                        {isSingleOption ? (
                          isColorAttr ? (
                            <div className="flex items-center gap-2 py-1">
                              <span className="w-7 h-7 rounded-full border-2 border-indigo-300 shadow-sm ring-1 ring-indigo-100"
                                style={{ backgroundColor: options[0].toLowerCase() }} title={options[0]} />
                              <span className="text-xs font-semibold text-indigo-700 capitalize">{options[0]}</span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-300 capitalize">
                              <Check size={12} className="text-indigo-600 shrink-0" />
                              {options[0]}
                            </span>
                          )
                        ) : (
                          <div className="flex gap-1.5 flex-wrap">
                            {options.map((option) => {
                              const isSelected = selectedOptions[attrName] === option;
                              const isDisabled = !disabledOptions.has(option) && disabledOptions.size > 0;
                              if (isColorAttr) {
                                return (
                                  <button key={option} onClick={() => !isDisabled && handleOptionChange(attrName, option)} disabled={isDisabled}
                                    className={`w-9 h-9 rounded-full border-2 transition-all ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110' : isDisabled ? 'opacity-30 cursor-not-allowed' : 'border-gray-300 hover:border-indigo-400'}`}
                                    style={{ backgroundColor: option.toLowerCase() }} title={option} />
                                );
                              }
                              return (
                                <button key={option} onClick={() => !isDisabled && handleOptionChange(attrName, option)} disabled={isDisabled}
                                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all capitalize ${isSelected ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : isDisabled ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed line-through' : 'bg-white text-gray-800 border-gray-300 hover:border-indigo-500 hover:text-indigo-600'}`}>
                                  {option}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Colors - static info for non-variant */}
              {!hasVariants && colors.length > 0 && (
                <div className="border-t border-gray-200/70 pt-3">
                  <span className="text-xs font-bold text-gray-800 capitalize tracking-[0.02em]">Colors</span>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {colors.map((color) => (
                      <div key={color} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-100/50 border border-gray-200/60">
                        <span className="w-5 h-5 rounded-full border border-gray-300 shrink-0"
                          style={{ backgroundColor: color.toLowerCase() }} title={color} />
                        <span className="text-xs font-semibold text-gray-800 capitalize">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes - static info for non-variant */}
              {!hasVariants && sizes.length > 0 && (
                <div className="border-t border-gray-200/70 pt-3">
                  <span className="text-xs font-bold text-gray-800 capitalize tracking-[0.02em]">Sizes</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {sizes.map((s) => (
                      <span key={s}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-300 capitalize">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Materials (non-variant) */}
          {materials && !hasVariants && (
            <div className="border-t border-gray-200/70 pt-3">
              <span className="text-xs font-bold text-gray-800 capitalize tracking-[0.02em]">Materials</span>
              <p className="text-sm text-gray-800 capitalize mt-0.5 font-[450]">{materials}</p>
            </div>
          )}

          {/* Short Description */}
          {item?.shortDescription && (
            <p className="text-sm text-gray-700 bg-amber-50/70 border-l-2 border-amber-400 pl-3 py-1.5 leading-relaxed capitalize font-[450]">{item.shortDescription}</p>
          )}

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {isVariantUnselected ? (
              <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Select options to check stock
              </span>
            ) : isOutOfStock ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200/70">
                <AlertCircle size={16} className="text-amber-500 shrink-0" />
                <p className="text-xs font-medium text-amber-800 leading-snug">
                  Out of stock. Please <button onClick={() => setOpenInquiryModal(true)} className="font-semibold text-amber-900 underline decoration-amber-400/60 hover:decoration-amber-500 transition-all">contact us</button> for availability or send an inquiry.
                </p>
              </div>
            ) : (
              <span className={`text-xs font-semibold flex items-center gap-1.5 ${countInStock > 10 ? 'text-emerald-600' : 'text-amber-600'}`}>
                <span className={`w-2 h-2 rounded-full ${countInStock > 10 ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                {countInStock > 10 ? 'In Stock' : `Only ${countInStock} Left`}
              </span>
            )}
          </div>

          {/* Quantity + Add to Cart */}
          <div className="flex gap-2">
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shrink-0">
              <button onClick={() => quantity > 1 && setQuantity(quantity - 1)} disabled={quantity <= 1}
                className="p-1.5 hover:bg-gray-50 transition-colors disabled:cursor-not-allowed">
                <Minus size={13} className={quantity <= 1 ? "text-gray-300" : "text-gray-600"} />
              </button>
                <span className="px-2.5 font-bold text-gray-900 min-w-[1.75rem] text-center text-sm">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}
                className="p-1.5 hover:bg-gray-50 transition-colors">
                <Plus size={13} className="text-gray-600" />
              </button>
            </div>
            <button onClick={() => handleAddToCart()}
              disabled={isOutOfStock || isVariantUnselected || isLoading}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isOutOfStock || isVariantUnselected
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : isLoading ? "bg-indigo-600 text-white opacity-70 cursor-wait"
                  : isAdded ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm active:scale-[0.98]"
              }`}>
              {isLoading ? <CircularProgress size={15} className="!text-white" />
              : isAdded ? <><Check size={14} /> Added</>
              : isOutOfStock ? 'Unavailable'
              : isVariantUnselected ? (variantLoading ? 'Loading...' : 'Select Options')
              : 'Add To Cart'}
            </button>
            <button onClick={() => setOpenInquiryModal(true)}
              className="px-2.5 py-2.5 rounded-xl text-xs font-bold border-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50 transition-all shrink-0">
              Inquiry
            </button>
          </div>

          {/* Wishlist + Compare */}
          <div className="flex items-center gap-2">
            <button onClick={() => handleAddToMyList()}
              className={`flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-xs font-bold border transition-all ${isAddedInMyList ? 'border-rose-300 text-rose-600 bg-rose-50' : 'border-gray-300 text-gray-700 hover:border-gray-900'}`}>
              <Heart size={13} className={isAddedInMyList ? "fill-rose-500 text-rose-500" : ""} />
              {isAddedInMyList ? 'Saved' : 'Wishlist'}
            </button>
            <button onClick={handleToggleCompare}
              className={`flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-xs font-bold border transition-all ${isInCompare ? 'border-indigo-300 text-indigo-600 bg-indigo-50' : 'border-gray-300 text-gray-700 hover:border-gray-900'}`}>
              <GitCompare size={13} className={isInCompare ? "text-indigo-600" : ""} />
              {isInCompare ? 'Comparing' : 'Compare'}
            </button>
          </div>

          {/* Feature Strip */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl bg-gradient-to-b from-sky-100 to-blue-100/80 border border-sky-300/60 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-sm">
                <Truck size={15} className="text-white" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-gray-900 leading-tight text-center tracking-tight">Free<br className="sm:hidden" /> Shipping</span>
            </div>
            <div className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl bg-gradient-to-b from-emerald-100 to-green-100/80 border border-emerald-300/60 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-sm">
                <RotateCcw size={15} className="text-white" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-gray-900 leading-tight text-center tracking-tight">14-Day<br className="sm:hidden" /> Returns</span>
            </div>
            <div className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl bg-gradient-to-b from-violet-100 to-purple-100/80 border border-violet-300/60 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
                <Shield size={15} className="text-white" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-gray-900 leading-tight text-center tracking-tight">Secure</span>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-gray-100/60 rounded-xl p-3 border border-gray-200/70">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-indigo-200/70 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">?</div>
              <p className="text-xs font-bold text-gray-900">Need Help? We're Here For You</p>
            </div>
            <div className="flex gap-1.5">
              <a href="https://wa.me/85265492201" target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white rounded-lg py-1.5 text-xs font-bold transition-all shadow-sm">
                <MessageCircle size={13} /> WhatsApp 1
              </a>
              <a href="https://wa.me/9779841321802" target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white rounded-lg py-1.5 text-xs font-bold transition-all shadow-sm">
                <MessageCircle size={13} /> WhatsApp 2
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Tabs at bottom */}
      <div className="md:hidden order-3 mt-8">
        <TabsSection
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          showFullDesc={showFullDesc}
          setShowFullDesc={setShowFullDesc}
          description={description}
          specifications={specifications}
          reviewsCount={reviewsCount}
          productId={item?._id}
          productName={name}
          setReviewsCount={setReviewsCount}
        />
      </div>

      {/* Inquiry Modal */}
      <Dialog
        open={openInquiryModal}
        onClose={() => setOpenInquiryModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <div className="relative">
            <button
              onClick={() => setOpenInquiryModal(false)}
              className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-lg font-extrabold text-gray-900 mb-1">Product Inquiry</h3>
            <p className="text-xs text-gray-500 mb-4">Ask us anything about <span className="font-bold text-gray-800 capitalize">{name}</span></p>
            <form onSubmit={handleInquirySubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                  <input type="text" name="name" value={inquiryForm.name} onChange={handleInquiryChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none transition-colors"
                    placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                  <input type="email" name="email" value={inquiryForm.email} onChange={handleInquiryChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none transition-colors"
                    placeholder="Your email" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
                <input type="tel" name="phone" value={inquiryForm.phone} onChange={handleInquiryChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none transition-colors"
                  placeholder="Your phone number" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Message <span className="text-red-500">*</span></label>
                <textarea name="message" value={inquiryForm.message} onChange={handleInquiryChange} rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none transition-colors resize-none"
                  placeholder="Your message" />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button type="submit"
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                  Send Inquiry
                </button>
                <button type="button" onClick={() => setOpenInquiryModal(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
