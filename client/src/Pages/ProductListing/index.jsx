import React, { useContext, useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import ProductItem from "../../components/ProductItem";
import ProductItemListView from "../../components/ProductItemListView";
import { IoGridSharp } from "react-icons/io5";
import { LuMenu } from "react-icons/lu";
import { FaAngleLeft, FaAngleRight, FaAngleDown } from "react-icons/fa6";
import { FaFilter, FaSort, FaTimes, FaCheck, FaCompressAlt } from "react-icons/fa";
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { fetchDataFromApi, postData } from "../../utils/api";
import { MyContext } from "../../App";
import SEO from "../../components/SEO";
import { IoMdClose } from "react-icons/io";
import { FiHome, FiChevronRight } from "react-icons/fi";

const ProductListing = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [itemView, setItemView] = useState("grid");
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(24);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [selectedSortVal, setSelectedSortVal] = useState("Best selling");
  const [error, setError] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileSort, setShowMobileSort] = useState(false);

  const context = useContext(MyContext);
  const debounceTimeoutRef = useRef(null);

  useEffect(() => {
    if (context?.openFilter) {
      setShowMobileFilters(true);
      context?.setOpenFilter(false);
    }
  }, [context?.openFilter]);

  const [filters, setFilters] = useState({
    catId: id ? [id] : [],
    subCatId: [],
    thirdsubCatId: [],
    minPrice: 0,
    maxPrice: 60000,
    rating: [],
    brand: [],
    size: [],
    color: [],
    page: 1,
    limit: 20
  });

  const [debouncedFilters, setDebouncedFilters] = useState(null);

  useEffect(() => {
    const catIdParam = searchParams.get('catId');
    const subCatIdParam = searchParams.get('subCatId');
    const thirdLavelCatIdParam = searchParams.get('thirdLavelCatId');

    if (catIdParam) {
      setFilters({ catId: [catIdParam], subCatId: [], thirdsubCatId: [], minPrice: 0, maxPrice: 60000, rating: [], brand: [], size: [], color: [], page: 1, limit: 20 });
      setPage(1);
    } else if (subCatIdParam) {
      setFilters({ catId: [], subCatId: [subCatIdParam], thirdsubCatId: [], minPrice: 0, maxPrice: 60000, rating: [], brand: [], size: [], color: [], page: 1, limit: 20 });
      setPage(1);
    } else if (thirdLavelCatIdParam) {
      setFilters({ catId: [], subCatId: [], thirdsubCatId: [thirdLavelCatIdParam], minPrice: 0, maxPrice: 60000, rating: [], brand: [], size: [], color: [], page: 1, limit: 20 });
      setPage(1);
    } else if (!id) {
      setFilters({ catId: [], subCatId: [], thirdsubCatId: [], minPrice: 0, maxPrice: 60000, rating: [], brand: [], size: [], color: [], page: 1, limit: 20 });
      setPage(1);
    }
  }, [searchParams, id]);

  useEffect(() => {
    const detectAndFetchCategory = async () => {
      if (!id) return;
      window.scrollTo(0, 0);
      setIsLoading(true);
      setError(null);
      try {
        const catRes = await fetchDataFromApi(`/api/category/${id}`);
        if (catRes?.category) {
          const category = catRes.category;
          setCategoryName(category.name || "");

          if (category.parentId) {
            const parentRes = await fetchDataFromApi(`/api/category/${category.parentId}`);
            const parentCat = parentRes?.category;
            if (parentCat?.parentId) {
              setFilters({ catId: [], subCatId: [], thirdsubCatId: [id], minPrice: 0, maxPrice: 60000, rating: [], brand: [], size: [], color: [], page: 1, limit: 20 });
            } else {
              setFilters({ catId: [], subCatId: [id], thirdsubCatId: [], minPrice: 0, maxPrice: 60000, rating: [], brand: [], size: [], color: [], page: 1, limit: 20 });
            }
          } else {
            setFilters({ catId: [id], subCatId: [], thirdsubCatId: [], minPrice: 0, maxPrice: 60000, rating: [], brand: [], size: [], color: [], page: 1, limit: 20 });
          }
          setPage(1);
        }
      } catch (err) {
        console.error("Error detecting category:", err);
        setError("Error loading category");
      }
    };
    detectAndFetchCategory();
  }, [id]);

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 300);
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [filters]);

  useEffect(() => {
    if (!debouncedFilters) return;
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let res;
        const hasPriceFilter = debouncedFilters.minPrice > 0 || debouncedFilters.maxPrice < 60000;
        const hasOtherFilters = debouncedFilters.rating.length > 0 || debouncedFilters.brand?.length > 0 || debouncedFilters.size?.length > 0 || debouncedFilters.color?.length > 0;
        const hasCategoryFilter = debouncedFilters.catId.length > 0 || debouncedFilters.subCatId.length > 0 || debouncedFilters.thirdsubCatId.length > 0;
        const hasFilters = hasCategoryFilter || hasPriceFilter || hasOtherFilters;

        if (hasFilters) {
          res = await postData(`/api/product/filters`, {
            catId: debouncedFilters.catId.length > 0 ? debouncedFilters.catId : null,
            subCatId: debouncedFilters.subCatId.length > 0 ? debouncedFilters.subCatId : null,
            thirdsubCatId: debouncedFilters.thirdsubCatId.length > 0 ? debouncedFilters.thirdsubCatId : null,
            minPrice: hasPriceFilter ? debouncedFilters.minPrice : null,
            maxPrice: hasPriceFilter ? debouncedFilters.maxPrice : null,
            rating: debouncedFilters.rating.length > 0 ? debouncedFilters.rating : null,
            brand: debouncedFilters.brand?.length > 0 ? debouncedFilters.brand : null,
            size: debouncedFilters.size?.length > 0 ? debouncedFilters.size : null,
            color: debouncedFilters.color?.length > 0 ? debouncedFilters.color : null,
            page,
            limit: rowsPerPage
          });
        } else {
          res = await fetchDataFromApi(`/api/product/getAllProducts?page=${page}&limit=${rowsPerPage}`);
        }

        if (res && res.products) {
          setProducts(res.products);
          setTotalPages(res.totalPages || 1);
          setTotalProducts(res.total || res.products.length);
        } else if (res && Array.isArray(res)) {
          setProducts(res);
          setTotalPages(1);
          setTotalProducts(res.length);
        } else {
          setProducts([]);
          setTotalProducts(0);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Error loading products");
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [page, rowsPerPage, debouncedFilters, searchParams]);

  useEffect(() => {
    let sortedProducts = [...products];
    switch (selectedSortVal) {
      case "Name, A to Z":
        sortedProducts.sort((a, b) => a.name?.localeCompare(b.name || ""));
        break;
      case "Name, Z to A":
        sortedProducts.sort((a, b) => b.name?.localeCompare(a.name || ""));
        break;
      case "Price, low to high":
        sortedProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "Price, high to low":
        sortedProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "Newest":
        sortedProducts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      default:
        break;
    }
    setProducts(sortedProducts);
  }, [selectedSortVal]);

  const handleSortChange = (value) => {
    setSelectedSortVal(value);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const sortOptions = [
    { value: "Best selling", label: "Best Selling" },
    { value: "Name, A to Z", label: "Name (A-Z)" },
    { value: "Name, Z to A", label: "Name (Z-A)" },
    { value: "Price, low to high", label: "Price: Low to High" },
    { value: "Price, high to low", label: "Price: High to Low" },
    { value: "Newest", label: "Newest First" },
  ];

  const startItem = (page - 1) * rowsPerPage + 1;
  const endItem = Math.min(page * rowsPerPage, totalProducts);

  return (
    <>
      <SEO 
        title={categoryName || "All Products"}
        description={`Shop our collection of ${categoryName || 'premium Pashmina products'}. ${totalProducts} products available.`}
        url={id ? `/category/${id}` : "/products"}
      />
      
      <section className="pb-0 productListingPage bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white py-3 sm:py-4 px-4">
          <div className="container">
            <div className="flex items-center gap-2 text-xs mb-1">
              <Link to="/" className="text-gray-300 hover:text-white flex items-center gap-1">
                <FiHome className="text-[10px]" /> Home
              </Link>
              <FiChevronRight className="text-gray-500 text-[10px]" />
              <span className="text-gray-400">Products</span>
              {categoryName && (
                <>
                  <FiChevronRight className="text-gray-500 text-[10px]" />
                  <span className="text-white font-medium">{categoryName}</span>
                </>
              )}
            </div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
              {categoryName || (id ? "Loading..." : "All Products")}
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-0.5">
              {totalProducts} {totalProducts === 1 ? 'product' : 'products'} found
            </p>
          </div>
        </div>

        <div className="container py-3 sm:py-4">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            <div className="hidden lg:block w-[260px] shrink-0">
              <div className="sticky top-20">
                <Sidebar productsData={{ products }} setProductsData={setProducts} isLoading={isLoading} setIsLoading={setIsLoading} page={page} setTotalPages={setTotalPages} categoryId={id} filters={filters} setFilters={handleFilterChange} />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 mb-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowMobileFilters(true)} className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs font-medium text-gray-600 transition-colors border border-gray-200">
                      <FaFilter className="text-[10px]" />
                      <span>Filters</span>
                    </button>
                    <button onClick={() => setShowMobileSort(true)} className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs font-medium text-gray-600 transition-colors border border-gray-200">
                      <FaSort className="text-[10px]" />
                      <span>Sort</span>
                    </button>
                    <span className="hidden lg:inline text-xs text-gray-500">
                      Showing <span className="font-semibold text-gray-700">{startItem}-{endItem}</span> of <span className="font-semibold text-gray-700">{totalProducts}</span>
                    </span>
                    <span className="lg:hidden text-xs text-gray-500">
                      {startItem}-{endItem} of {totalProducts}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2">
                      <span className="text-xs text-gray-500">Show:</span>
                      <Select value={rowsPerPage} onChange={(e) => { setRowsPerPage(e.target.value); setPage(1); }} size="small" className="!text-xs !w-[70px] !h-[32px]">
                        <MenuItem value={12}>12</MenuItem>
                        <MenuItem value={24}>24</MenuItem>
                        <MenuItem value={48}>48</MenuItem>
                      </Select>
                    </div>

                    <div className="hidden md:flex items-center gap-2">
                      <span className="text-xs text-gray-500">Sort:</span>
                      <Select value={selectedSortVal} onChange={(e) => handleSortChange(e.target.value)} size="small" className="!text-xs !min-w-[140px] !h-[32px]">
                        {sortOptions.map(opt => (
                          <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                        ))}
                      </Select>
                    </div>

                    <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg">
                      <button onClick={() => setItemView("grid")} className={`p-1.5 rounded-md transition-all ${itemView === "grid" ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
                        <IoGridSharp className="text-sm" />
                      </button>
                      <button onClick={() => setItemView("list")} className={`p-1.5 rounded-md transition-all ${itemView === "list" ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
                        <LuMenu className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-white rounded-xl overflow-hidden">
                      <div className="bg-gray-200 aspect-[4/5]"></div>
                      <div className="p-3 space-y-2">
                        <div className="bg-gray-200 h-3 w-3/4 rounded"></div>
                        <div className="bg-gray-200 h-3 w-1/2 rounded"></div>
                        <div className="bg-gray-200 h-4 w-1/3 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
                  <p className="text-gray-600 font-medium">{error}</p>
                  <button onClick={() => window.location.reload()} className="mt-4 text-sm text-indigo-600 hover:underline">Try again</button>
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No products found</h3>
                  <p className="text-gray-500 text-sm mb-4">Try adjusting your filters or search criteria</p>
                  <button onClick={() => handleFilterChange({ catId: [], subCatId: [], thirdsubCatId: [], minPrice: 0, maxPrice: 60000, rating: [], brand: [], size: [], color: [], page: 1, limit: 20 })} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className={`grid ${itemView === "grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"} gap-2 sm:gap-3`}>
                  {products.map((item, index) => (
                    itemView === "grid" ? <ProductItem key={index} item={item} /> : <ProductItemListView key={index} item={item} />
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center">
                  <div className="flex items-center gap-1 sm:gap-2 bg-white rounded-xl shadow-sm border border-gray-100 p-1 sm:p-2">
                    <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className={`p-2 sm:px-3 sm:py-1.5 text-xs sm:text-sm rounded-lg flex items-center gap-1 transition-all ${page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-indigo-50 text-gray-600 border border-gray-200 hover:text-indigo-600'}`}>
                      <FaAngleLeft className="text-[10px] sm:text-xs" />
                      <span className="hidden sm:inline">Prev</span>
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (page <= 3) pageNum = i + 1;
                      else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = page - 2 + i;
                      return (
                        <button key={pageNum} onClick={() => setPage(pageNum)} className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg text-xs sm:text-sm font-medium transition-all ${page === pageNum ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md' : 'bg-white hover:bg-indigo-50 text-gray-600 border border-gray-200 hover:text-indigo-600'}`}>
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className={`p-2 sm:px-3 sm:py-1.5 text-xs sm:text-sm rounded-lg flex items-center gap-1 transition-all ${page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-indigo-50 text-gray-600 border border-gray-200 hover:text-indigo-600'}`}>
                      <span className="hidden sm:inline">Next</span>
                      <FaAngleRight className="text-[10px] sm:text-xs" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {showMobileFilters && (
          <div className="fixed inset-0 z-[9999] lg:hidden">
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn" 
              onClick={() => setShowMobileFilters(false)}
            ></div>
            <div className="absolute right-0 top-0 bottom-0 w-[88%] max-w-[380px] bg-white shadow-[-8px_0_30px_rgba(0,0,0,0.15)] flex flex-col animate-slideInRight">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-white sticky top-0 z-10">
                <h3 className="font-bold text-lg text-gray-900 tracking-tight">Filters</h3>
                <button 
                  onClick={() => setShowMobileFilters(false)} 
                  className="w-10 h-10 bg-slate-700 hover:bg-slate-800 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 shadow-md"
                  aria-label="Close filters"
                >
                  <FaTimes className="text-white text-lg" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4 overscroll-contain" style={{ WebkitOverflowScrolling: 'touch', paddingBottom: 'env(safe-area-inset-bottom, 20px)' }}>
                <Sidebar 
                  productsData={{ products }} 
                  setProductsData={setProducts} 
                  isLoading={isLoading} 
                  setIsLoading={setIsLoading} 
                  page={page} 
                  setTotalPages={setTotalPages} 
                  categoryId={id} 
                  filters={filters} 
                  setFilters={handleFilterChange} 
                />
              </div>
              <div className="flex items-center gap-3 px-4 py-4 border-t border-gray-200 bg-gray-50" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom, 16px))' }}>
                <button 
                  onClick={() => { 
                    handleFilterChange({ catId: [], subCatId: [], thirdsubCatId: [], minPrice: 0, maxPrice: 60000, rating: [], brand: [], size: [], color: [], page: 1, limit: 20 }); 
                    setShowMobileFilters(false); 
                    navigate('/products'); 
                  }} 
                  className="flex-1 py-3.5 border-2 border-gray-300 rounded-xl text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors active:scale-[0.98]"
                >
                  Clear All
                </button>
                <button 
                  onClick={() => setShowMobileFilters(false)} 
                  className="flex-1 py-3.5 bg-slate-700 text-white rounded-xl text-sm font-bold active:scale-[0.98] transition-all"
                >
                  View {products.length} Results
                </button>
              </div>
            </div>
            <style>{`
              @keyframes slideInRight {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
              }
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              .animate-slideInRight {
                animation: slideInRight 0.3s cubic-bezier(0.32, 0.72, 0, 1);
              }
              .animate-fadeIn {
                animation: fadeIn 0.2s ease-out;
              }
              .overscroll-contain {
                overscroll-behavior: contain;
              }
            `}</style>
          </div>
        )}

        {showMobileSort && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileSort(false)}></div>
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-base text-gray-900">Sort By</h3>
                <button onClick={() => setShowMobileSort(false)} className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                  <FaTimes className="text-gray-500 text-sm" />
                </button>
              </div>
              <div className="py-2 max-h-[65vh] overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                {sortOptions.map(option => (
                  <button 
                    key={option.value} 
                    onClick={() => { handleSortChange(option.value); setShowMobileSort(false); }} 
                    className={`w-full px-5 py-4 flex items-center justify-between text-left transition-colors active:bg-gray-50 ${selectedSortVal === option.value ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                  >
                    <span className="text-sm font-medium text-gray-800">{option.label}</span>
                    {selectedSortVal === option.value && (
                      <div className="w-6 h-6 bg-[#1a1a2e] rounded-full flex items-center justify-center">
                        <FaCheck className="text-white text-[10px]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {context?.compareList?.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl py-3 px-4 sm:px-6">
            <div className="container flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 overflow-x-auto flex-1 pb-1">
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Compare ({context.compareList.length}/3):</span>
                {context.compareList.map((product) => (
                  <div key={product._id} className="relative group flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50 hover:border-indigo-400 transition-colors">
                      <img src={product.images?.[0]} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <button onClick={() => context.setCompareList(context.compareList.filter(p => p._id !== product._id))} className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600">
                      <IoMdClose />
                    </button>
                  </div>
                ))}
                {context.compareList.length < 3 && (
                  <div className="w-12 h-12 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-400 text-lg">+</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button onClick={() => context.setCompareList([])} className="hidden sm:block px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-500 transition-colors">Clear All</button>
                <button onClick={() => context.setOpenCompareModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-full shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all">
                  <FaCompressAlt className="text-sm" /> Compare Now
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default ProductListing;