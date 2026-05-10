import React, { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { Collapse } from "react-collapse";
import { FaAngleDown, FaAngleRight } from "react-icons/fa6";
import Button from "@mui/material/Button";
import { FaAngleUp } from "react-icons/fa6";
import Rating from "@mui/material/Rating";
import { MyContext } from "../../App";
import { fetchDataFromApi } from "../../utils/api";
import { useCurrency } from "../../context/CurrencyContext";

const Sidebar = ({ productsData, isLoading, setIsLoading, page, setTotalPages, categoryId, filters, setFilters }) => {
  const [isOpenCategoryFilter, setIsOpenCategoryFilter] = useState(true);
  const [isOpenPriceFilter, setIsOpenPriceFilter] = useState(true);
  const [isOpenRatingFilter, setIsOpenRatingFilter] = useState(true);
  const [isOpenBrandFilter, setIsOpenBrandFilter] = useState(true);
  const [isOpenSizeFilter, setIsOpenSizeFilter] = useState(true);
  const [isOpenColorFilter, setIsOpenColorFilter] = useState(true);

  const [priceRange, setPriceRange] = useState({ min: 0, max: 60000 });
  const [price, setPrice] = useState([0, 60000]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [subCategoryCounts, setSubCategoryCounts] = useState({});
  const [brandCounts, setBrandCounts] = useState({});
  const [sizeCounts, setSizeCounts] = useState({});
  const [colorCounts, setColorCounts] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});

  const context = useContext(MyContext);
  const { formatPrice, convertBackToUSD } = useCurrency();
  const navigate = useNavigate();
  const location = useLocation();
  const { id: paramId } = useParams();

  useEffect(() => {
    fetchCategoryCounts();
    fetchFilterOptions();
  }, []);

useEffect(() => {
    if (productsData?.products && productsData.products.length > 0) {
      const prices = productsData.products
        .map(p => p.price)
        .filter(p => p != null && p !== undefined && !isNaN(p));
      
      if (prices.length > 0) {
        const minPrice = Math.floor(Math.min(...prices));
        const maxPrice = Math.ceil(Math.max(...prices));
        setPriceRange({ min: minPrice, max: maxPrice });
        
        // Only set price if user hasn't set a custom filter
        if (filters.minPrice === 0 && filters.maxPrice === 60000) {
          setPrice([minPrice, maxPrice]);
        }
      }
    }
  }, [productsData]);

  const fetchCategoryCounts = async () => {
    try {
      const res = await fetchDataFromApi("/api/category");
      if (res?.data && Array.isArray(res.data)) {
        const counts = {};
        for (const cat of res.data) {
          counts[cat._id] = cat.productCount || 0;
        }
        setCategoryCounts(counts);
        
        const subCounts = {};
        for (const cat of res.data) {
          if (cat.children && cat.children.length > 0) {
            for (const subCat of cat.children) {
              subCounts[subCat._id] = subCat.productCount || 0;
            }
          }
        }
        setSubCategoryCounts(subCounts);
      }
    } catch (err) {
      console.error("Error fetching category counts:", err);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const res = await fetchDataFromApi("/api/product/getAllProducts?page=1&limit=50");
      if (res?.products && Array.isArray(res.products)) {
        const brands = {};
        const sizes = {};
        const colors = {};
        
        res.products.forEach(product => {
          if (product.brand) {
            brands[product.brand] = (brands[product.brand] || 0) + 1;
          }
          if (product.size && product.size.length > 0) {
            product.size.forEach(size => {
              sizes[size] = (sizes[size] || 0) + 1;
            });
          }
          if (product.color && product.color.length > 0) {
            product.color.forEach(color => {
              colors[color] = (colors[color] || 0) + 1;
            });
          }
        });
        
        setBrandCounts(brands);
        setSizeCounts(sizes);
        setColorCounts(colors);
      }
    } catch (err) {
      console.error("Error fetching filter options:", err);
    }
  };

  const handleCheckboxChange = (field, value) => {
    const currentValues = filters[field] || [];
    const updatedValues = currentValues.includes(value)
      ? currentValues.filter(item => item !== value)
      : [...currentValues, value];
    const newFilters = { ...filters, [field]: updatedValues };
    setFilters(newFilters);
  };

  const isAllSelected = () => {
    const allCatIds = context?.catData?.map(cat => cat._id) || [];
    const selectedCatIds = filters?.catId || [];
    return allCatIds.length > 0 && allCatIds.length === selectedCatIds.length;
  };

  const handleSelectAll = (e) => {
    e.stopPropagation();
    const allCatIds = context?.catData?.map(cat => cat._id) || [];
    if (isAllSelected()) {
      setFilters({ ...filters, catId: [], subCatId: [], thirdsubCatId: [] });
    } else {
      setFilters({ ...filters, catId: allCatIds, subCatId: [], thirdsubCatId: [] });
    }
  };

  const handleCategoryClick = (catId) => {
    const currentCatIds = filters.catId || [];
    if (currentCatIds.includes(catId)) {
      setFilters({ ...filters, catId: currentCatIds.filter(id => id !== catId), subCatId: [], thirdsubCatId: [] });
    } else {
      setFilters({ ...filters, catId: [...currentCatIds, catId], subCatId: [], thirdsubCatId: [] });
    }
  };

  const navigateToCategory = (catId) => {
    if (catId) {
      setFilters({
        catId: [catId],
        subCatId: [],
        thirdsubCatId: [],
        minPrice: 0,
        maxPrice: 60000,
        rating: [],
        page: 1,
        limit: 20
      });
      navigate(`/category/${catId}`);
    }
  };

  const navigateToSubCategory = (subCatId) => {
    if (subCatId) {
      setFilters({
        catId: [],
        subCatId: [subCatId],
        thirdsubCatId: [],
        minPrice: 0,
        maxPrice: 60000,
        rating: [],
        page: 1,
        limit: 20
      });
      navigate(`/products?subCatId=${subCatId}`);
    }
  };

  const navigateToThirdLevel = (thirdCatId) => {
    if (thirdCatId) {
      setFilters({
        catId: [],
        subCatId: [],
        thirdsubCatId: [thirdCatId],
        minPrice: 0,
        maxPrice: 60000,
        rating: [],
        page: 1,
        limit: 20
      });
      navigate(`/products?thirdLavelCatId=${thirdCatId}`);
    }
  };

  const toggleCategoryExpand = (e, catId) => {
    e.stopPropagation();
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const clearFilters = (e) => {
    e?.stopPropagation();
    setPrice([0, 60000]);
    setFilters({
      catId: [],
      subCatId: [],
      thirdsubCatId: [],
      minPrice: 0,
      maxPrice: 60000,
      rating: [],
      brand: [],
      size: [],
      color: []
    });
    navigate('/products');
  };

  const hasActiveFilters = () => {
    return filters?.catId?.length > 0 ||
           filters?.rating?.length > 0 ||
           filters?.brand?.length > 0 ||
           filters?.size?.length > 0 ||
           filters?.color?.length > 0 ||
           filters?.minPrice > 0 ||
           filters?.maxPrice < 60000 ||
           filters?.subCatId?.length > 0 ||
           filters?.thirdsubCatId?.length > 0;
  };

  const getSelectedCategories = () => {
    const selectedIds = filters?.catId || [];
    if (!selectedIds.length || !context?.catData) return [];
    return context.catData.filter(cat => selectedIds.includes(cat._id));
  };

  const getAllSubCategories = () => {
    const selectedCategories = getSelectedCategories();
    let allSubs = [];
    selectedCategories.forEach(cat => {
      if (cat.children && cat.children.length > 0) {
        allSubs = [...allSubs, ...cat.children];
      }
    });
    return allSubs;
  };

  const selectedCategories = getSelectedCategories();
  const allSubCategories = getAllSubCategories();

  return (
    <aside className="sidebar py-3 lg:py-5 sticky top-[130px] z-[50] pr-0 lg:pr-5" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[18px] font-[600] text-gray-800">Filters</h3>
        {(hasActiveFilters() || paramId) && (
          <Button 
            onClick={(e) => clearFilters(e)}
            className="!text-[12px] !text-red-500 !p-0 hover:!underline"
          >
            Clear All
          </Button>
        )}
      </div>

      <div className="max-h-[70vh] overflow-auto space-y-4" onClick={(e) => e.stopPropagation()}>
        {/* Shop by Category */}
        <div className="box border-b pb-3" onClick={(e) => e.stopPropagation()}>
          <h3 
            className="w-full mb-3 text-[15px] font-[600] flex items-center justify-between cursor-pointer"
            onClick={() => setIsOpenCategoryFilter(!isOpenCategoryFilter)}
          >
            <span>Shop by Category</span>
            {isOpenCategoryFilter ? <FaAngleUp /> : <FaAngleDown />}
          </h3>
          <Collapse isOpened={isOpenCategoryFilter}>
            <div className="space-y-1">
              {/* Select All Option */}
              <div 
                className={`flex items-center justify-between py-1.5 px-2 rounded cursor-pointer hover:bg-gray-100 ${isAllSelected() ? 'bg-orange-50 border-l-2 border-orange-500' : ''}`}
                onClick={handleSelectAll}
              >
                <div className="flex items-center">
                  <Checkbox
                    checked={isAllSelected()}
                    onChange={handleSelectAll}
                    onClick={(e) => e.stopPropagation()}
                    size="small"
                  />
                  <span className="text-[13px] font-[600] text-gray-800">Select All</span>
                </div>
              </div>

              {/* All categories with checkboxes */}
              {context?.catData?.map((item, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between py-1 px-2 rounded cursor-pointer hover:bg-gray-100 ${filters?.catId?.includes(item._id) ? 'bg-orange-50 border-l-2 border-orange-500' : ''}`}
                  onClick={() => handleCategoryClick(item._id)}
                >
                  <div className="flex items-center">
                    <Checkbox
                      checked={filters?.catId?.includes(item._id)}
                      onChange={() => handleCategoryClick(item._id)}
                      onClick={(e) => e.stopPropagation()}
                      size="small"
                    />
                    <span className="text-[13px] text-gray-700">{item.name}</span>
                  </div>
                  <span className="text-[11px] text-gray-400">({categoryCounts[item._id] || 0})</span>
                </div>
              ))}
              
              {/* Show all subcategories from selected categories */}
              {selectedCategories.length > 0 && allSubCategories.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <h4 className="text-[13px] font-[600] text-gray-600 mb-2 px-2">Subcategories</h4>
                  <div className="pl-3 space-y-1">
                    {allSubCategories.map((subCat, index) => (
                      <div key={index}>
                        {subCat.children && subCat.children.length > 0 ? (
                          <>
                            <div 
                              className="flex items-center justify-between py-1.5 px-2 rounded cursor-pointer hover:bg-gray-100"
                              onClick={(e) => toggleCategoryExpand(e, subCat._id)}
                            >
                              <div className="flex items-center">
                                <span className="text-[14px] mr-1">
                                  {expandedCategories[subCat._id] ? <FaAngleDown /> : <FaAngleRight />}
                                </span>
                                <Checkbox
                                  checked={filters?.subCatId?.includes(subCat._id)}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleCheckboxChange('subCatId', subCat._id);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  size="small"
                                />
                                <span className="text-[13px] text-gray-700">{subCat.name}</span>
                              </div>
                              <span className="text-[11px] text-gray-400">({subCategoryCounts[subCat._id] || 0})</span>
                            </div>
                            {expandedCategories[subCat._id] && (
                              <div className="pl-6 space-y-1">
                                {subCat.children.map((thirdLevel, idx) => (
                                  <div 
                                    key={idx}
                                    className={`flex items-center justify-between py-1 px-2 rounded cursor-pointer hover:bg-gray-100 ${filters?.thirdsubCatId?.includes(thirdLevel._id) ? 'bg-orange-50' : ''}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const currentThird = filters?.thirdsubCatId || [];
                                      const updatedThird = currentThird.includes(thirdLevel._id)
                                        ? currentThird.filter(id => id !== thirdLevel._id)
                                        : [...currentThird, thirdLevel._id];
                                      setFilters({ ...filters, thirdsubCatId: updatedThird });
                                    }}
                                  >
                                    <div className="flex items-center">
                                      <Checkbox
                                        checked={filters?.thirdsubCatId?.includes(thirdLevel._id)}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          handleCheckboxChange('thirdsubCatId', thirdLevel._id);
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        size="small"
                                      />
                                      <span className="text-[12px] text-gray-600">{thirdLevel.name}</span>
                                    </div>
                                    <span className="text-[10px] text-gray-400">({thirdLevel.productCount || 0})</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <div 
                            className={`flex items-center justify-between py-1.5 px-2 rounded cursor-pointer hover:bg-gray-100 ${filters?.subCatId?.includes(subCat._id) ? 'bg-orange-50 border-l-2 border-orange-500' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCheckboxChange('subCatId', subCat._id);
                            }}
                          >
                            <div className="flex items-center">
                              <Checkbox
                                checked={filters?.subCatId?.includes(subCat._id)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleCheckboxChange('subCatId', subCat._id);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                size="small"
                              />
                              <span className="text-[13px] text-gray-700">{subCat.name}</span>
                            </div>
                            <span className="text-[11px] text-gray-400">({subCategoryCounts[subCat._id] || 0})</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Collapse>
        </div>

        {/* Price Filter */}
        <div className="box border-b pb-3">
          <h3 
            className="w-full mb-3 text-[15px] font-[600] flex items-center justify-between cursor-pointer"
            onClick={() => setIsOpenPriceFilter(!isOpenPriceFilter)}
          >
            <span>Filter By Price</span>
            {isOpenPriceFilter ? <FaAngleUp /> : <FaAngleDown />}
          </h3>
          <Collapse isOpened={isOpenPriceFilter}>
            <div className="px-2">
              <div className="relative h-12">
                <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-gray-200 rounded-full -translate-y-1/2">
                  <div 
                    className="absolute h-full bg-orange-500 rounded-full"
                    style={{
                      left: `${((price[0] - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%`,
                      right: `${100 - ((price[1] - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%`
                    }}
                  />
                </div>
                <input
                  type="range"
                  min={priceRange.min}
                  max={priceRange.max}
                  value={price[0]}
                  onChange={(e) => {
                    const val = Math.min(Number(e.target.value), price[1] - 1);
                    setPrice([val, price[1]]);
                    setFilters({ ...filters, minPrice: val, maxPrice: price[1] });
                  }}
                  className="absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-orange-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:z-10 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-orange-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:z-10"
                />
                <input
                  type="range"
                  min={priceRange.min}
                  max={priceRange.max}
                  value={price[1]}
                  onChange={(e) => {
                    const val = Math.max(Number(e.target.value), price[0] + 1);
                    setPrice([price[0], val]);
                    setFilters({ ...filters, minPrice: price[0], maxPrice: val });
                  }}
                  className="absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-orange-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:z-10 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-orange-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:z-10"
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-700 min-w-[70px] text-center">
                  {formatPrice(price[0])}
                </div>
                <span className="text-gray-400 text-xs">to</span>
                <div className="bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-700 min-w-[70px] text-center">
                  {formatPrice(price[1])}
                </div>
              </div>
            </div>
          </Collapse>
        </div>

        {/* Rating Filter */}
        <div className="box border-b pb-3">
          <h3 
            className="w-full mb-3 text-[15px] font-[600] flex items-center justify-between cursor-pointer"
            onClick={() => setIsOpenRatingFilter(!isOpenRatingFilter)}
          >
            <span>Filter By Rating</span>
            {isOpenRatingFilter ? <FaAngleUp /> : <FaAngleDown />}
          </h3>
          <Collapse isOpened={isOpenRatingFilter}>
            <div className="space-y-1">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div 
                  key={rating}
                  className="flex items-center py-1 px-2 rounded hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleCheckboxChange('rating', rating)}
                >
                  <Checkbox
                    checked={filters?.rating?.includes(rating)}
                    onChange={() => handleCheckboxChange('rating', rating)}
                    size="small"
                  />
                  <Rating value={rating} size="small" readOnly />
                  <span className="text-[11px] text-gray-400 ml-1">& up</span>
                </div>
              ))}
            </div>
          </Collapse>
        </div>

        {/* Brand Filter */}
        {Object.keys(brandCounts).length > 0 && (
          <div className="box border-b pb-3">
            <h3 
              className="w-full mb-3 text-[15px] font-[600] flex items-center justify-between cursor-pointer"
              onClick={() => setIsOpenBrandFilter(!isOpenBrandFilter)}
            >
              <span>Filter By Brand</span>
              {isOpenBrandFilter ? <FaAngleUp /> : <FaAngleDown />}
            </h3>
            <Collapse isOpened={isOpenBrandFilter}>
              <div className="space-y-1">
                {Object.entries(brandCounts).map(([brand, count]) => (
                  <div 
                    key={brand}
                    className="flex items-center justify-between py-1 px-2 rounded hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleCheckboxChange('brand', brand)}
                  >
                    <div className="flex items-center">
                      <Checkbox
                        checked={filters?.brand?.includes(brand)}
                        onChange={() => handleCheckboxChange('brand', brand)}
                        size="small"
                      />
                      <span className="text-[13px] text-gray-700">{brand}</span>
                    </div>
                    <span className="text-[11px] text-gray-400">({count})</span>
                  </div>
                ))}
              </div>
            </Collapse>
          </div>
        )}

        {/* Size Filter */}
        {Object.keys(sizeCounts).length > 0 && (
          <div className="box border-b pb-3">
            <h3 
              className="w-full mb-3 text-[15px] font-[600] flex items-center justify-between cursor-pointer"
              onClick={() => setIsOpenSizeFilter(!isOpenSizeFilter)}
            >
              <span>Filter By Size</span>
              {isOpenSizeFilter ? <FaAngleUp /> : <FaAngleDown />}
            </h3>
            <Collapse isOpened={isOpenSizeFilter}>
              <div className="flex flex-wrap gap-2 px-1">
                {Object.entries(sizeCounts).map(([size, count]) => (
                  <div 
                    key={size}
                    className={`px-3 py-1 rounded-full text-[12px] cursor-pointer border ${
                      filters?.size?.includes(size) 
                        ? 'bg-orange-500 text-white border-orange-500' 
                        : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400'
                    }`}
                    onClick={() => handleCheckboxChange('size', size)}
                  >
                    {size} ({count})
                  </div>
                ))}
              </div>
            </Collapse>
          </div>
        )}

        {/* Color Filter */}
        {Object.keys(colorCounts).length > 0 && (
          <div className="box border-b pb-3">
            <h3 
              className="w-full mb-3 text-[15px] font-[600] flex items-center justify-between cursor-pointer"
              onClick={() => setIsOpenColorFilter(!isOpenColorFilter)}
            >
              <span>Filter By Color</span>
              {isOpenColorFilter ? <FaAngleUp /> : <FaAngleDown />}
            </h3>
            <Collapse isOpened={isOpenColorFilter}>
              <div className="flex flex-wrap gap-2 px-1">
                {Object.entries(colorCounts).map(([color, count]) => (
                  <div 
                    key={color}
                    className="flex items-center gap-2 px-2 py-1 rounded-full text-[12px] cursor-pointer border border-gray-300 hover:border-orange-400 bg-white"
                    onClick={() => handleCheckboxChange('color', color)}
                  >
                    <span 
                      className="w-4 h-4 rounded-full border border-gray-200"
                      style={{ backgroundColor: color.toLowerCase() }}
                    />
                    <span>{color}</span>
                    <span className="text-gray-400">({count})</span>
                  </div>
                ))}
              </div>
            </Collapse>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;