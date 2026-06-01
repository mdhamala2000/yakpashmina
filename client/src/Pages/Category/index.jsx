import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import Sidebar from "../../components/Sidebar";
import ProductItem from "../../components/ProductItem";
import ProductItemListView from "../../components/ProductItemListView";
import axios from 'axios';
import { MyContext } from '../../App';
import { useCurrency } from '../../context/CurrencyContext';
import SEO from "../../components/SEO";
import { FaFilter, FaSort, FaTimes, FaCheck, FaAngleLeft, FaAngleRight, FaTh, FaList } from "react-icons/fa";
import { IoGridSharp } from "react-icons/io5";
import { FiHome, FiChevronRight } from "react-icons/fi";
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

const CategoryPage = () => {
    const { categorySlug, subCategorySlug } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const pageParam = parseInt(searchParams.get('page') || '1');
    
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState(null);
    const [subCategory, setSubCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [itemView, setItemView] = useState("grid");
    const [selectedSortVal, setSelectedSortVal] = useState("Newest First");
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [showMobileSort, setShowMobileSort] = useState(false);
    const [filters, setFilters] = useState({
        minPrice: 0,
        maxPrice: 60000,
        rating: [],
        brand: [],
        size: [],
        color: []
    });

    const context = useContext(MyContext);
    const { convertPrice, currency } = useCurrency();
    const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchCategoryData();
    }, [categorySlug, subCategorySlug, pageParam]);

    const fetchCategoryData = async () => {
        setLoading(true);
        try {
            let url = `${VITE_API_URL}/product/`;
            
            if (subCategorySlug) {
                url += `by-subcategory-slug?categorySlug=${categorySlug}&subCategorySlug=${subCategorySlug}`;
            } else {
                url += `by-category-slug?categorySlug=${categorySlug}`;
            }
            
            url += `&page=${pageParam}&limit=12&sort=${sortByToParam(selectedSortVal)}`;
            
            const res = await axios.get(url);
            
            if (res.data?.success) {
                setProducts(res.data.products || []);
                setTotalPages(Math.ceil((res.data.totalProducts || 0) / 12));
                setTotalProducts(res.data.totalProducts || 0);
            }
            
            const catRes = await axios.get(`${VITE_API_URL}/category/slug/${categorySlug}`);
            if (catRes.data?.success) {
                setCategory(catRes.data.data);
                
                if (subCategorySlug) {
                    const subCatRes = await axios.get(`${VITE_API_URL}/category/slug/${subCategorySlug}`);
                    if (subCatRes.data?.success) {
                        setSubCategory(subCatRes.data.data);
                    }
                }
            }
            
        } catch (error) {
            console.error('Error fetching category:', error);
        } finally {
            setLoading(false);
        }
    };

    const sortByToParam = (sortVal) => {
        switch(sortVal) {
            case "Newest First": return "newest";
            case "Price: Low to High": return "price-low";
            case "Price: High to Low": return "price-high";
            case "Most Popular": return "popular";
            default: return "newest";
        }
    };

    const handleSortChange = (value) => {
        setSelectedSortVal(value);
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const handlePageChange = (value) => {
        setSearchParams({ page: value.toString() });
        window.scrollTo(0, 0);
    };

    const breadcrumbs = [
        { name: 'Home', url: '/' },
        { name: category?.name || 'Category', url: `/category/${categorySlug}` }
    ];
    if (subCategory) {
        breadcrumbs.push({ name: subCategory.name, url: null });
    }

    const metaTitle = category?.metaTitle || (subCategory 
        ? `${subCategory.name} - ${category?.name} | Yak Pashmina`
        : `${category?.name} | Yak Pashmina`);
    
    const metaDescription = category?.metaDescription || 
        `Shop our collection of ${category?.name || 'products'} at Yak Pashmina. Free shipping on orders over $100.`;

    const sortOptions = [
        { value: "Newest First", label: "Newest First" },
        { value: "Price: Low to High", label: "Price: Low to High" },
        { value: "Price: High to Low", label: "Price: High to Low" },
        { value: "Most Popular", label: "Most Popular" },
    ];

    const startItem = (pageParam - 1) * 12 + 1;
    const endItem = Math.min(pageParam * 12, totalProducts);

    return (
        <>
            <SEO 
                title={metaTitle}
                description={metaDescription}
                canonicalUrl={`${window.location.origin}/category/${categorySlug}${subCategorySlug ? `/${subCategorySlug}` : ''}`}
            />

            <section className="pb-0 bg-gradient-to-b from-gray-50 to-white min-h-screen">
                <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white py-3 sm:py-4 px-4">
                    <div className="container">
                        <div className="flex items-center gap-2 text-xs mb-1">
                            <Link to="/" className="text-gray-300 hover:text-white flex items-center gap-1">
                                <FiHome className="text-[10px]" /> Home
                            </Link>
                            <FiChevronRight className="text-gray-500 text-[10px]" />
                            <span className="text-gray-400">Category</span>
                            {category && (
                                <>
                                    <FiChevronRight className="text-gray-500 text-[10px]" />
                                    <span className="text-white font-medium">{subCategory?.name || category?.name}</span>
                                </>
                            )}
                        </div>
                        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                            {subCategory?.name || category?.name || "Category"}
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
                                    isLoading={loading} 
                                    setIsLoading={setLoading} 
                                    page={pageParam} 
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
                                                <FaList className="text-sm sm:text-base" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {loading ? (
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
                                    <p className="text-gray-500 text-sm mb-4">Try selecting a different category</p>
                                    <Link to="/products">
                                        <button className="px-4 py-2 bg-slate-700 text-white text-sm font-medium rounded-lg hover:bg-slate-800">
                                            Browse All Products
                                        </button>
                                    </Link>
                                </div>
                            ) : (
                                <div className={`grid ${itemView === "grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-2"} gap-3 sm:gap-4`}>
                                    {products.map((item) => (
                                        itemView === "grid" ? <ProductItem key={item._id} item={item} /> : <ProductItemListView key={item._id} item={item} />
                                    ))}
                                </div>
                            )}

                            {totalPages > 1 && (
                                <div className="mt-8 flex items-center justify-center">
                                    <div className="flex items-center gap-1 sm:gap-2 bg-white rounded-xl shadow-sm border border-gray-100 p-1 sm:p-2">
                                        <button onClick={() => handlePageChange(Math.max(1, pageParam - 1))} disabled={pageParam === 1} className={`p-2 sm:px-3 sm:py-1.5 text-xs sm:text-sm rounded-lg flex items-center gap-1 transition-all ${pageParam === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 hover:text-slate-700'}`}>
                                            <FaAngleLeft className="text-[10px] sm:text-xs" />
                                            <span className="hidden sm:inline">Prev</span>
                                        </button>
                                        
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) pageNum = i + 1;
                                            else if (pageParam <= 3) pageNum = i + 1;
                                            else if (pageParam >= totalPages - 2) pageNum = totalPages - 4 + i;
                                            else pageNum = pageParam - 2 + i;
                                            return (
                                                <button key={pageNum} onClick={() => handlePageChange(pageNum)} className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg text-xs sm:text-sm font-medium transition-all ${pageParam === pageNum ? 'bg-slate-700 text-white shadow-md' : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 hover:text-slate-700'}`}>
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                        
                                        <button onClick={() => handlePageChange(Math.min(totalPages, pageParam + 1))} disabled={pageParam === totalPages} className={`p-2 sm:px-3 sm:py-1.5 text-xs sm:text-sm rounded-lg flex items-center gap-1 transition-all ${pageParam === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 hover:text-slate-700'}`}>
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
                                <button onClick={() => setShowMobileFilters(false)} className="w-10 h-10 bg-slate-700 hover:bg-slate-800 rounded-full flex items-center justify-center transition-all">
                                    <FaTimes className="text-white text-lg" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto px-4 py-4" style={{ WebkitOverflowScrolling: 'touch' }}>
                                <Sidebar 
                                    productsData={{ products }} 
                                    setProductsData={setProducts} 
                                    isLoading={loading} 
                                    setIsLoading={setLoading} 
                                    page={pageParam} 
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

export default CategoryPage;