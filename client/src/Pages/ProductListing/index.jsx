import React, { useContext, useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import ProductItem from "../../components/ProductItem";
import ProductItemListView from "../../components/ProductItemListView";
import Button from "@mui/material/Button";
import { IoGridSharp } from "react-icons/io5";
import { LuMenu } from "react-icons/lu";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { FaFilter, FaSort, FaTimes, FaCheck, FaList } from "react-icons/fa";
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { fetchDataFromApi, postData } from "../../utils/api";
import { MyContext } from "../../App";
import SEO from "../../components/SEO";

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

  const [priceRange, setPriceRange] = useState({ min: 0, max: 60000 });
  const [debouncedFilters, setDebouncedFilters] = useState(null);
  const debounceTimeoutRef = useRef(null);

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

  // Debounce filters for API call
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
        const hasOtherFilters = debouncedFilters.rating.length > 0 ||
          debouncedFilters.brand?.length > 0 || debouncedFilters.size?.length > 0 || debouncedFilters.color?.length > 0;
        const hasCategoryFilter = debouncedFilters.catId.length > 0 || debouncedFilters.subCatId.length > 0 || debouncedFilters.thirdsubCatId.length > 0;
        const hasFilters = hasCategoryFilter || hasPriceFilter || hasOtherFilters;

        // Use filter API for all cases to ensure all filters are applied
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
      case "Best selling":
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

  const handleCategoryToggle = (catId) => {
    if (filters.catId.includes(catId)) {
      setFilters({ ...filters, catId: [], subCatId: [], thirdsubCatId: [] });
      navigate('/products');
    } else {
      setFilters({ ...filters, catId: [catId], subCatId: [], thirdsubCatId: [] });
      navigate(`/category/${catId}`);
    }
    setShowMobileFilters(false);
  };

  const getCategoryHierarchy = () => {
    const cats = context?.catData || [];
    return cats.slice(0, 6);
  };

  const sortOptions = [
    { value: "Best selling", label: "Best Selling" },
    { value: "Name, A to Z", label: "Name (A-Z)" },
    { value: "Name, Z to A", label: "Name (Z-A)" },
    { value: "Price, low to high", label: "Price: Low to High" },
    { value: "Price, high to low", label: "Price: High to Low" },
    { value: "Newest", label: "Newest First" },
  ];

  return (
    <>
      <SEO 
        title={categoryName || "All Products"}
        description={`Shop our collection of ${categoryName || 'premium Pashmina products'}. ${totalProducts} products available. Handwoven cashmere from Nepal.`}
        url={id ? `/category/${id}` : "/products"}
        schema={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://yakpashamina.com/" },
            { "@type": "ListItem", "position": 2, "name": categoryName || "All Products", "item": `https://yakpashamina.com${id ? `/category/${id}` : '/products'}` }
          ]
        }}
      />
    <section className="pb-0 productListingPage">
      <div className="bg-gray-100 px-3 py-2 sm:py-3 mb-1">
        <div className="container">
          <h1 className="text-[16px] sm:text-[20px] md:text-[24px] lg:text-[28px] font-[600] text-gray-800 leading-tight">
            {categoryName || (id ? "Loading..." : "All Products")}
          </h1>
          <p className="text-[11px] sm:text-[13px] md:text-[14px] text-gray-500 mt-0.5">
            {totalProducts} {totalProducts === 1 ? 'product' : 'products'}
          </p>
        </div>
      </div>

      <div className="bg-white pb-3">
        <div className="container flex gap-2">
          <div className={`sidebarWrapper w-[20%] hidden lg:block`}>
            <Sidebar productsData={{ products }} setProductsData={setProducts} isLoading={isLoading} setIsLoading={setIsLoading} page={page} setTotalPages={setTotalPages} categoryId={id} filters={filters} setFilters={handleFilterChange} />
          </div>

          <div className="rightContent w-full lg:w-[80%] py-2">
            <div className="bg-white border-b border-gray-200 px-2 py-2 w-full mb-2 flex items-center justify-between gap-1 md:gap-4">
              <div className="col1 flex items-center gap-1 md:gap-3 lg:hidden">
                <button onClick={() => setShowMobileFilters(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                  <FaFilter className="text-[10px]" />
                  <span>Filter</span>
                </button>
                <button onClick={() => setShowMobileSort(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                  <FaSort className="text-[10px]" />
                  <span>Sort</span>
                </button>
              </div>

              <div className="col1 flex items-center gap-1 md:gap-3 hidden lg:flex">
                <span className="text-[11px] md:text-[14px] lg:text-[15px] font-semibold text-gray-700">
                  {((page - 1) * rowsPerPage) + 1}-{Math.min(page * rowsPerPage, totalProducts)} of {totalProducts} products
                </span>
              </div>

              <div className="col2 flex items-center gap-1 md:gap-3">
                <div className="hidden lg:flex items-center gap-1">
                  <span className="text-[10px] md:text-[12px] lg:text-[13px] text-gray-500">Show:</span>
                  <Select value={rowsPerPage} onChange={(e) => { setRowsPerPage(e.target.value); setPage(1); }} size="small" className="!text-[11px] !w-[60px] md:!w-auto !min-w-[70px] md:!min-w-[90px] !h-[30px] md:!h-[34px] lg:!h-[36px]">
                    <MenuItem value={12} sx={{ fontSize: '11px' }}>12</MenuItem>
                    <MenuItem value={24} sx={{ fontSize: '11px' }}>24</MenuItem>
                    <MenuItem value={48} sx={{ fontSize: '11px' }}>48</MenuItem>
                  </Select>
                </div>

                <div className="hidden lg:flex items-center gap-1">
                  <span className="text-[10px] md:text-[12px] lg:text-[13px] text-gray-500">Sort:</span>
                  <Select value={selectedSortVal} onChange={(e) => handleSortChange(e.target.value)} size="small" className="!text-[11px] !w-[80px] md:!w-auto !min-w-[90px] md:!min-w-[150px] !h-[30px] md:!h-[34px] lg:!h-[36px]">
                    {sortOptions.map(opt => <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '11px' }}>{opt.label}</MenuItem>)}
                  </Select>
                </div>

                <div className="flex items-center gap-0.5">
                  <button onClick={() => setItemView("list")} className={`w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded ${itemView === "list" ? 'bg-orange-100 text-orange-600' : 'hover:bg-gray-100 text-gray-600'}`}>
                    <LuMenu className="text-xs md:text-sm" />
                  </button>
                  <button onClick={() => setItemView("grid")} className={`w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded ${itemView === "grid" ? 'bg-orange-100 text-orange-600' : 'hover:bg-gray-100 text-gray-600'}`}>
                    <IoGridSharp className="text-xs md:text-sm" />
                  </button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 h-48 rounded-lg mb-2"></div>
                    <div className="bg-gray-200 h-4 w-3/4 rounded mb-1"></div>
                    <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-10"><p className="text-red-500">{error}</p></div>
            ) : products.length === 0 ? (
              <div className="text-center py-10"><p className="text-gray-500">No products found</p></div>
            ) : (
              <div className={`grid ${itemView === "grid" ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4" : "grid-cols-1 sm:grid-cols-2"} gap-2 sm:gap-3 md:gap-4`}>
                {products.map((item, index) => (
                  itemView === "grid" ? <ProductItem key={index} item={item} /> : <ProductItemListView key={index} item={item} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-1">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className={`px-2 py-1.5 text-[11px] rounded border flex items-center gap-1 ${page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-orange-50 text-gray-600 border-gray-200'}`}>
                  <FaAngleLeft className="text-[10px]" /> Prev
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (page <= 3) pageNum = i + 1;
                  else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = page - 2 + i;
                  return (
                    <button key={pageNum} onClick={() => setPage(pageNum)} className={`w-7 h-7 flex items-center justify-center rounded text-[11px] border ${page === pageNum ? 'bg-orange-500 text-white border-orange-500' : 'bg-white hover:bg-orange-50 text-gray-600'}`}>
                      {pageNum}
                    </button>
                  );
                })}
                <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className={`px-2 py-1.5 text-[11px] rounded border flex items-center gap-1 ${page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-orange-50 text-gray-600 border-gray-200'}`}>
                  Next <FaAngleRight className="text-[10px]" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)}></div>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] overflow-hidden flex flex-col animate-slide-up">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-gray-800">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)} className="p-1"><FaTimes className="text-lg text-gray-500" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <Sidebar productsData={{ products }} setProductsData={setProducts} isLoading={isLoading} setIsLoading={setIsLoading} page={page} setTotalPages={setTotalPages} categoryId={id} filters={filters} setFilters={handleFilterChange} />
            </div>
            <div className="flex items-center gap-2 px-4 py-3 border-t bg-gray-50">
              <button onClick={() => { setFilters({ catId: [], subCatId: [], thirdsubCatId: [], minPrice: 0, maxPrice: 60000, rating: [], brand: [], size: [], color: [], page: 1, limit: 20 }); navigate('/products'); }} className="flex-1 py-2.5 border border-gray-300 rounded-full text-xs font-medium text-gray-700">Clear All</button>
              <button onClick={() => setShowMobileFilters(false)} className="flex-1 py-2.5 bg-gray-800 text-white rounded-full text-xs font-medium">{products.length} Results</button>
            </div>
          </div>
        </div>
      )}

      {showMobileSort && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileSort(false)}></div>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl animate-slide-up">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-gray-800">Sort By</h3>
              <button onClick={() => setShowMobileSort(false)} className="p-1"><FaTimes className="text-lg text-gray-500" /></button>
            </div>
            <div className="py-2 max-h-[60vh] overflow-y-auto">
              {sortOptions.map(option => (
                <button key={option.value} onClick={() => { handleSortChange(option.value); setShowMobileSort(false); }} className={`w-full px-4 py-3 flex items-center justify-between text-left ${selectedSortVal === option.value ? 'text-orange-600' : 'text-gray-700'}`}>
                  <span className="text-sm">{option.label}</span>
                  {selectedSortVal === option.value && <FaCheck className="text-xs" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slide-up { animation: slideUp 0.3s ease-out; }
      `}</style>
    </section>
    </>
  );
};

export default ProductListing;