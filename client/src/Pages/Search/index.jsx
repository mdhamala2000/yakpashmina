import React, { useContext, useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import ProductItem from "../../components/ProductItem";
import ProductItemListView from "../../components/ProductItemListView";
import Button from "@mui/material/Button";
import { IoGridSharp } from "react-icons/io5";
import { LuMenu } from "react-icons/lu";
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Pagination from "@mui/material/Pagination";
import { postData } from "../../utils/api";
import { MyContext } from "../../App";
import SEO from "../../components/SEO";
import { FaFilter, FaSort, FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { FaTimes, FaCheck } from "react-icons/fa";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiHome, FiChevronRight } from "react-icons/fi";

const SearchPage = () => {
  const [itemView, setItemView] = useState("grid");
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [selectedSortVal, setSelectedSortVal] = useState("Best selling");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileSort, setShowMobileSort] = useState(false);
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 60000,
    rating: [],
    brand: [],
    size: [],
    color: []
  });

  const context = useContext(MyContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (context?.openFilter) {
      setShowMobileFilters(true);
      context?.setOpenFilter(false);
    }
  }, [context?.openFilter]);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    window.scrollTo(0, 0);
    const searchData = context?.searchData || [];
    if (searchData?.products) {
      setProducts(searchData.products);
      setTotalProducts(searchData.products.length);
    }
  }, [context?.searchData]);

  const handleSortChange = (value) => {
    setSelectedSortVal(value);
    let sortedProducts = [...products];
    switch (value) {
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

  const startItem = (page - 1) * 20 + 1;
  const endItem = Math.min(page * 20, totalProducts);

  return (
    <>
      <SEO 
        title={searchQuery ? `Search: ${searchQuery}` : "Search Products"}
        description={searchQuery ? `Search results for "${searchQuery}" - ${totalProducts} products found` : "Search our collection of premium Pashmina products"}
        url={searchQuery ? `/search?q=${searchQuery}` : "/search"}
      />

      <section className="pb-0 productListingPage bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white py-3 sm:py-4 px-4">
          <div className="container">
            <div className="flex items-center gap-2 text-xs mb-1">
              <Link to="/" className="text-gray-300 hover:text-white flex items-center gap-1">
                <FiHome className="text-[10px]" /> Home
              </Link>
              <FiChevronRight className="text-gray-500 text-[10px]" />
              <span className="text-gray-400">Search</span>
              {searchQuery && (
                <>
                  <FiChevronRight className="text-gray-500 text-[10px]" />
                  <span className="text-white font-medium">{searchQuery}</span>
                </>
              )}
            </div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
              {searchQuery ? `Results for "${searchQuery}"` : "Search Products"}
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
                <Sidebar 
                  productsData={{ products }} 
                  setProductsData={setProducts} 
                  isLoading={isLoading} 
                  setIsLoading={setIsLoading} 
                  page={page} 
                  setTotalPages={setTotalPages} 
                  filters={filters} 
                  setFilters={handleFilterChange} 
                />
              </div>
            </div>

            <div className="flex-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 mb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button onClick={() => setShowMobileFilters(true)} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-700 transition-colors">
                      <FaFilter className="text-[10px]" />
                      <span>Filters</span>
                    </button>
                    <button onClick={() => setShowMobileSort(true)} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-700 transition-colors">
                      <FaSort className="text-[10px]" />
                      <span>Sort</span>
                    </button>
                    <span className="text-xs text-gray-500 ml-auto sm:hidden">
                      {startItem}-{endItem} of {totalProducts}
                    </span>
                  </div>

                  <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500">
                    <span>Showing <span className="font-semibold text-gray-700">{startItem}-{endItem}</span> of <span className="font-semibold text-gray-700">{totalProducts}</span></span>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="hidden md:flex items-center gap-2">
                      <span className="text-xs text-gray-500">Sort:</span>
                      <Select value={selectedSortVal} onChange={(e) => handleSortChange(e.target.value)} size="small" className="!text-xs !min-w-[140px] !h-[32px]">
                        {sortOptions.map(opt => (
                          <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                        ))}
                      </Select>
                    </div>

                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                      <button onClick={() => setItemView("grid")} className={`p-1.5 sm:p-2 rounded-md transition-all ${itemView === "grid" ? 'bg-white shadow-sm text-slate-700' : 'text-gray-500 hover:text-gray-700'}`}>
                        <IoGridSharp className="text-sm sm:text-base" />
                      </button>
                      <button onClick={() => setItemView("list")} className={`p-1.5 sm:p-2 rounded-md transition-all ${itemView === "list" ? 'bg-white shadow-sm text-slate-700' : 'text-gray-500 hover:text-gray-700'}`}>
                        <LuMenu className="text-sm sm:text-base" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
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
              ) : products.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No products found</h3>
                  <p className="text-gray-500 text-sm mb-4">Try adjusting your search or filters</p>
                  <Link to="/products">
                    <Button className="px-4 py-2 bg-slate-700 text-white text-sm font-medium rounded-lg hover:bg-slate-800">
                      Browse All Products
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className={`grid ${itemView === "grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-2"} gap-3 sm:gap-4`}>
                  {products.map((item, index) => (
                    itemView === "grid" ? <ProductItem key={index} item={item} /> : <ProductItemListView key={index} item={item} />
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center">
                  <div className="flex items-center gap-1 sm:gap-2 bg-white rounded-xl shadow-sm border border-gray-100 p-1 sm:p-2">
                    <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className={`p-2 sm:px-3 sm:py-1.5 text-xs sm:text-sm rounded-lg flex items-center gap-1 transition-all ${page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 hover:text-slate-700'}`}>
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
                        <button key={pageNum} onClick={() => setPage(pageNum)} className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg text-xs sm:text-sm font-medium transition-all ${page === pageNum ? 'bg-slate-700 text-white shadow-md' : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 hover:text-slate-700'}`}>
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className={`p-2 sm:px-3 sm:py-1.5 text-xs sm:text-sm rounded-lg flex items-center gap-1 transition-all ${page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 hover:text-slate-700'}`}>
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
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)}></div>
            <div className="absolute right-0 top-0 bottom-0 w-[88%] max-w-[380px] bg-white shadow-[-8px_0_30px_rgba(0,0,0,0.15)] flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-white sticky top-0 z-10">
                <h3 className="font-bold text-lg text-gray-900">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)} className="w-10 h-10 bg-slate-700 hover:bg-slate-800 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95">
                  <FaTimes className="text-white text-lg" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4" style={{ WebkitOverflowScrolling: 'touch' }}>
                <Sidebar 
                  productsData={{ products }} 
                  setProductsData={setProducts} 
                  isLoading={isLoading} 
                  setIsLoading={setIsLoading} 
                  page={page} 
                  setTotalPages={setTotalPages} 
                  filters={filters} 
                  setFilters={handleFilterChange} 
                />
              </div>
              <div className="flex items-center gap-3 px-4 py-4 border-t border-gray-200 bg-gray-50">
                <button onClick={() => { handleFilterChange({ minPrice: 0, maxPrice: 60000, rating: [], brand: [], size: [], color: [] }); setShowMobileFilters(false); }} className="flex-1 py-3.5 border-2 border-gray-300 rounded-xl text-sm font-bold text-gray-700 bg-white hover:bg-gray-50">
                  Clear All
                </button>
                <button onClick={() => setShowMobileFilters(false)} className="flex-1 py-3.5 bg-slate-700 text-white rounded-xl text-sm font-bold">
                  View Results
                </button>
              </div>
            </div>
          </div>
        )}

        {showMobileSort && (
          <div className="fixed inset-0 z-[9999] lg:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileSort(false)}></div>
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-lg text-gray-900">Sort By</h3>
                <button onClick={() => setShowMobileSort(false)} className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                  <FaTimes className="text-gray-500 text-lg" />
                </button>
              </div>
              <div className="py-2 max-h-[60vh] overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                {sortOptions.map(option => (
                  <button key={option.value} onClick={() => { handleSortChange(option.value); setShowMobileSort(false); }} className={`w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 ${selectedSortVal === option.value ? 'bg-gray-50' : ''}`}>
                    <span className="text-sm font-medium text-gray-800">{option.label}</span>
                    {selectedSortVal === option.value && <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center"><FaCheck className="text-white text-[10px]" /></div>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default SearchPage;