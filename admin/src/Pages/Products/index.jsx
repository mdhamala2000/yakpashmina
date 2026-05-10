import React, { useContext, useEffect, useState } from 'react';
import { Button, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Slide, Box, Chip, Drawer, Pagination as MuiPagination } from "@mui/material";
import { FaAngleDown, FaAngleUp, FaSearch, FaEye, FaTrash, FaCheck, FaClock, FaBox, FaTruck, FaTimes, FaFilter, FaMapMarkerAlt, FaCreditCard, FaList, FaMoneyBill, FaShoppingBag, FaChevronRight, FaWindowClose, FaChevronLeft, FaEdit, FaPlus, FaUndo, FaImages, FaChevronDown, FaSortAmountDown, FaThLarge, FaThList, FaRegImage } from "react-icons/fa";
import Rating from '@mui/material/Rating';
import { Link, useSearchParams } from "react-router-dom";
import { MyContext } from '../../App';
import { fetchDataFromApi, deleteData, deleteMultipleData } from '../../utils/api';
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import CircularProgress from '@mui/material/CircularProgress';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const statusConfig = {
  inStock: { label: 'In Stock', color: '#10b981', bg: '#ecfdf5', icon: '✓' },
  lowStock: { label: 'Low Stock', color: '#f59e0b', bg: '#fffbeb', icon: '!' },
  outOfStock: { label: 'Out of Stock', color: '#ef4444', bg: '#fef2f2', icon: '✕' }
};

export const Products = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(24);
  const [productData, setProductData] = useState([]);
  const [productTotalData, setProductTotalData] = useState([]);
  const [productSubCat, setProductSubCat] = useState('');
  const [productThirdLavelCat, setProductThirdLavelCat] = useState('');
  const [sortedIds, setSortedIds] = useState([]);
  const [isLoading, setIsloading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [photos, setPhotos] = useState([]);
  const [open, setOpen] = useState(false);
  const [productCat, setProductCat] = useState('');
  const [openFilterDrawer, setOpenFilterDrawer] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tempCategoryFilter, setTempCategoryFilter] = useState('all');
  const [tempSubcategoryFilter, setTempSubcategoryFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');

  const context = useContext(MyContext);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (context?.catData) {
      setCategories(context.catData);
    }
  }, [context?.catData]);

  useEffect(() => {
    const catId = searchParams.get('catId');
    const subCatId = searchParams.get('subCatId');
    
    if (catId) {
      setProductCat(catId);
      setCategoryFilter(catId);
      setIsloading(true);
      fetchDataFromApi(`/api/product/getAllProductsByCatId/${catId}`).then((res) => {
        if (res?.error === false) {
          setProductData({
            error: false,
            success: true,
            products: res?.products,
            total: res?.products?.length,
            page: 0,
            totalPages: 1,
            totalCount: res?.products?.length
          });
          setTimeout(() => setIsloading(false), 300);
        }
      });
      searchParams.delete('catId');
      setSearchParams(searchParams);
    } else if (subCatId) {
      setProductSubCat(subCatId);
      setSubcategoryFilter(subCatId);
      setIsloading(true);
      fetchDataFromApi(`/api/product/getAllProductsBySubCatId/${subCatId}`).then((res) => {
        if (res?.error === false) {
          setProductData({
            error: false,
            success: true,
            products: res?.products,
            total: res?.products?.length,
            page: 0,
            totalPages: 1,
            totalCount: res?.products?.length
          });
          setTimeout(() => setIsloading(false), 300);
        }
      });
      searchParams.delete('subCatId');
      setSearchParams(searchParams);
    } else {
      getProducts(page, rowsPerPage);
    }
  }, [searchParams]);

  useEffect(() => {
    if (searchQuery !== "") {
      const filteredProducts = productTotalData?.totalProducts?.filter((product) =>
        product._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product?.catName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setProductData({
        error: false,
        success: true,
        products: filteredProducts,
        total: filteredProducts?.length,
        page: 0,
        totalPages: Math.ceil(filteredProducts?.length / rowsPerPage),
        totalCount: productData?.totalCount
      });
    } else {
      getProducts(page, rowsPerPage);
    }
  }, [searchQuery]);

  const getProducts = async (page, limit) => {
    setIsloading(true);
    const catParam = categoryFilter !== 'all' ? `&catId=${categoryFilter}` : '';
    const subCatParam = subcategoryFilter !== 'all' ? `&subCatId=${subcategoryFilter}` : '';
    fetchDataFromApi(`/api/product/getAllProducts?page=${page + 1}&limit=${limit}${catParam}${subCatParam}`).then((res) => {
      let products = res?.products || [];
      if (sortBy === 'price-low') {
        products = [...products].sort((a, b) => (a.oldPrice || 0) - (b.oldPrice || 0));
      } else if (sortBy === 'price-high') {
        products = [...products].sort((a, b) => (b.oldPrice || 0) - (a.oldPrice || 0));
      } else if (sortBy === 'name') {
        products = [...products].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      }
      setProductData({ ...res, products });
      setProductTotalData({ ...res, products });
      setIsloading(false);
      let arr = [];
      for (let i = 0; i < products.length; i++) {
        arr.push({ src: products[i]?.images[0] });
      }
      setPhotos(arr);
    });
  };

  const handleCategoryChange = (catId) => {
    if (catId) {
      setProductCat(catId);
      setProductSubCat('');
      setProductThirdLavelCat('');
      setIsloading(true);
      fetchDataFromApi(`/api/product/getAllProductsByCatId/${catId}`).then((res) => {
        if (res?.error === false) {
          setProductData({
            error: false,
            success: true,
            products: res?.products,
            total: res?.products?.length,
            page: 0,
            totalPages: 1,
            totalCount: res?.products?.length
          });
          setTimeout(() => setIsloading(false), 300);
        }
      });
    } else {
      getProducts(0, 10);
      setProductSubCat('');
      setProductCat('');
      setProductThirdLavelCat('');
    }
  };

  const handleSubCategoryChange = (subCatId) => {
    if (subCatId) {
      setProductSubCat(subCatId);
      setProductCat('');
      setProductThirdLavelCat('');
      setIsloading(true);
      fetchDataFromApi(`/api/product/getAllProductsBySubCatId/${subCatId}`).then((res) => {
        if (res?.error === false) {
          setProductData({
            error: false,
            success: true,
            products: res?.products,
            total: res?.products?.length,
            page: 0,
            totalPages: 1,
            totalCount: res?.products?.length
          });
          setTimeout(() => setIsloading(false), 300);
        }
      });
    } else {
      setProductSubCat(subCatId);
      getProducts(0, 10);
      setProductCat('');
      setProductThirdLavelCat('');
    }
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
    getProducts(0, +event.target.value);
  };

  const deleteProduct = (id) => {
    if (context?.userData?.role === "ADMIN") {
      setProductToDelete(id);
      setOpenDeleteDialog(true);
    } else {
      context.alertBox("error", "Only admin can delete data");
    }
  };

  const handleDeleteProduct = () => {
    if (productToDelete) {
      deleteData(`/api/product/${productToDelete}`).then((res) => {
        getProducts(page, rowsPerPage);
        context.alertBox("success", "Product deleted");
        setSortedIds([]);
      });
    }
    setOpenDeleteDialog(false);
    setProductToDelete(null);
  };

  const deleteMultipleProduct = () => {
    if (sortedIds.length === 0) {
      context.alertBox('error', 'Please select items to delete.');
      return;
    }
    try {
      deleteMultipleData(`/api/product/deleteMultiple`, {
        data: { ids: sortedIds },
      }).then((res) => {
        getProducts();
        context.alertBox("success", "Products deleted");
        setSortedIds([]);
      });
    } catch (error) {
      context.alertBox('error', 'Error deleting items.');
    }
  };

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    const updatedItems = productData?.products?.map((item) => ({
      ...item,
      checked: isChecked,
    }));
    setProductData({
      error: false,
      success: true,
      products: updatedItems,
      total: updatedItems?.length,
      page: parseInt(page),
      totalPages: Math.ceil(updatedItems?.length / rowsPerPage),
      totalCount: productData?.totalCount
    });
    if (isChecked) {
      const ids = updatedItems.map((item) => item._id);
      setSortedIds(ids);
    } else {
      setSortedIds([]);
    }
  };

  const handleCheckboxChange = (e, id) => {
    const updatedItems = productData?.products?.map((item) =>
      item._id === id ? { ...item, checked: !item.checked } : item
    );
    setProductData({
      error: false,
      success: true,
      products: updatedItems,
      total: updatedItems?.length,
      page: parseInt(page),
      totalPages: Math.ceil(updatedItems?.length / rowsPerPage),
      totalCount: productData?.totalCount
    });
    const selectedIds = updatedItems
      .filter((item) => item.checked)
      .map((item) => item._id);
    setSortedIds(selectedIds);
  };

  const handleChangePage = (event, newPage) => {
    getProducts(newPage, rowsPerPage);
    setPage(newPage);
  };

  const openProductDetail = (product) => {
    setSelectedProduct(product);
    setOpenDetailModal(true);
  };

  const handleCategoryExpand = (catId) => {
    setExpandedCategory(expandedCategory === catId ? null : catId);
  };

  const applyFilter = () => {
    setCategoryFilter(tempCategoryFilter);
    setSubcategoryFilter(tempSubcategoryFilter);
    if (tempCategoryFilter !== 'all') {
      handleCategoryChange(tempCategoryFilter);
    } else if (tempSubcategoryFilter !== 'all') {
      handleSubCategoryChange(tempSubcategoryFilter);
    } else {
      getProducts(0, 10);
    }
    setOpenFilterDrawer(false);
  };

  const resetFilter = () => {
    setTempCategoryFilter('all');
    setTempSubcategoryFilter('all');
    setCategoryFilter('all');
    setSubcategoryFilter('all');
    setProductCat('');
    setProductSubCat('');
    setProductThirdLavelCat('');
    getProducts(0, 10);
    setOpenFilterDrawer(false);
  };

  const formatPrice = (price) => {
    return price?.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  const getStockStatus = (count) => {
    if (count === 0) return statusConfig.outOfStock;
    if (count < 10) return statusConfig.lowStock;
    return statusConfig.inStock;
  };

  const getSubcategories = (parentId) => {
    const parent = categories.find(c => c._id === parentId);
    return parent?.children || [];
  };

  const activeFilterCount = (categoryFilter !== 'all' ? 1 : 0) + (subcategoryFilter !== 'all' ? 1 : 0);

  const selectedCategoryName = () => {
    if (categoryFilter !== 'all') {
      const cat = categories.find(c => c._id === categoryFilter);
      return cat?.name;
    }
    if (subcategoryFilter !== 'all') {
      for (const cat of categories) {
        const sub = cat?.children?.find(s => s._id === subcategoryFilter);
        if (sub) return sub.name;
      }
    }
    return null;
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
                <FaShoppingBag className="text-white text-base" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Products</h2>
                <span className="text-sm text-gray-500">{productData?.products?.length || 0} products</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FaSearch />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-gray-50/50 transition-all"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); getProducts(0, rowsPerPage); }}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none text-sm bg-white flex items-center"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name</option>
                </select>
                
                <button
                  onClick={() => { setTempCategoryFilter(categoryFilter); setTempSubcategoryFilter(subcategoryFilter); setOpenFilterDrawer(true); }}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-all"
                >
                  <FaFilter className="text-gray-500 text-xs" />
                  <span className="text-sm text-gray-600">Filter</span>
                  {activeFilterCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-medium">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3">
            {sortedIds?.length > 0 && (
              <>
                <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                  {sortedIds.length} selected
                </span>
                <Button 
                  variant="outlined" 
                  color="error" 
                  size="small"
                  onClick={deleteMultipleProduct}
                  startIcon={<FaTrash />}
                  sx={{ borderRadius: '8px', textTransform: 'none' }}
                >
                  Delete
                </Button>
              </>
            )}
          </div>
          <Button
            variant="contained"
            startIcon={<FaPlus />}
            onClick={() => context.setIsOpenFullScreenPanel({
              open: true,
              model: 'Add Product'
            })}
            sx={{ 
              borderRadius: '10px',
              textTransform: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 15px 0 rgba(102, 126, 234, 0.4)',
              padding: '8px 20px',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
              }
            }}
          >
            Add Product
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="text-center">
              <CircularProgress sx={{ color: '#667eea' }} />
              <p className="text-gray-500 mt-4">Loading products...</p>
            </div>
          </div>
        ) : productData?.products?.length === 0 ? (
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="text-center p-8">
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <FaRegImage className="text-gray-400 text-4xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                {searchQuery || categoryFilter !== 'all' || subcategoryFilter !== 'all'
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Get started by adding your first product to the catalog."}
              </p>
              <div className="flex gap-3 justify-center">
                {(searchQuery || categoryFilter !== 'all') && (
                  <Button
                    variant="outlined"
                    startIcon={<FaUndo />}
                    onClick={() => { setSearchQuery(''); setCategoryFilter('all'); setSubcategoryFilter('all'); getProducts(0, 10); }}
                    sx={{ borderRadius: '10px', textTransform: 'none' }}
                  >
                    Clear Filters
                  </Button>
                )}
                <Button
                  variant="contained"
                  startIcon={<FaPlus />}
                  onClick={() => context.setIsOpenFullScreenPanel({ open: true, model: 'Add Product' })}
                  sx={{ 
                    borderRadius: '10px', 
                    textTransform: 'none',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  Add Product
                </Button>
              </div>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="p-2 md:p-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3">
              {productData?.products?.map((product, index) => {
                const stockStatus = getStockStatus(product?.countInStock);
                return (
                  <div 
                    key={product._id || index} 
                    className="group bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md hover:border-gray-200 transition-all duration-200"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                      <input
                        type="checkbox"
                        checked={product.checked === true}
                        onChange={(e) => handleCheckboxChange(e, product._id)}
                        className="absolute top-2 left-2 w-4 h-4 rounded border-gray-300 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        style={{ opacity: product.checked ? 1 : undefined }}
                      />
                      <LazyLoadImage
                        alt={product?.name}
                        effect="blur"
                        src={product?.images[0]}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <Tooltip title="Quick View">
                          <IconButton 
                            size="small" 
                            onClick={() => openProductDetail(product)}
                            sx={{ 
                              bgcolor: 'white', 
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                              width: 28,
                              height: 28,
                              '&:hover': { bgcolor: 'white' }
                            }}
                          >
                            <FaEye className="text-gray-600 text-xs" />
                          </IconButton>
                        </Tooltip>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <div className="flex gap-1">
                          <Tooltip title="Edit">
                            <IconButton 
                              size="small"
                              onClick={() => context.setIsOpenFullScreenPanel({
                                open: true,
                                model: 'Edit Product',
                                id: product?._id
                              })}
                              sx={{ 
                                bgcolor: 'white', 
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                width: 28,
                                height: 28,
                                '&:hover': { bgcolor: 'white' }
                              }}
                            >
                              <FaEdit className="text-primary text-xs" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              size="small"
                              onClick={() => deleteProduct(product._id)}
                              sx={{ 
                                bgcolor: 'white', 
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                width: 28,
                                height: 28,
                                '&:hover': { bgcolor: '#fef2f2' }
                              }}
                            >
                              <FaTrash className="text-red-500 text-xs" />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-2">
                      <Link to={`/product/${product?._id}`} className="text-xs font-semibold text-gray-900 line-clamp-2 hover:text-primary transition-colors">
                        {product?.name}
                      </Link>
                      
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[10px] text-gray-400 line-through">{formatPrice(product?.price)}</span>
                        <span className="text-sm font-bold text-gray-900">{formatPrice(product?.oldPrice)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-gray-500">{product?.sale} sales</span>
                        <Chip 
                          label={stockStatus?.label}
                          size="small"
                          sx={{ 
                            bgcolor: stockStatus?.bg, 
                            color: stockStatus?.color,
                            fontWeight: 600,
                            fontSize: '0.55rem',
                            height: 18,
                            borderRadius: '4px',
                            paddingX: 1
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-2 md:p-3">
            <div className="grid grid-cols-1 gap-2">
              {productData?.products?.map((product, index) => {
                const stockStatus = getStockStatus(product?.countInStock);
                return (
                  <div 
                    key={product._id || index} 
                    className="group bg-white rounded-lg border border-gray-100 p-3 hover:shadow-md hover:border-gray-200 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={product.checked === true}
                        onChange={(e) => handleCheckboxChange(e, product._id)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <div 
                        className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                        onClick={() => { setPhotos([{ src: product?.images[0] }]); setOpen(true); }}
                      >
                        <LazyLoadImage
                          alt={product?.name}
                          effect="blur"
                          src={product?.images[0]}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <Link to={`/product/${product?._id}`} className="text-sm font-semibold text-gray-900 line-clamp-1 hover:text-primary transition-colors">
                              {product?.name}
                            </Link>
                            <p className="text-xs text-gray-500 mt-0.5">{product?.brand}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Chip 
                                label={product?.catName}
                                size="small"
                                variant="outlined"
                                sx={{ borderRadius: '4px', fontSize: '0.65rem', height: 18 }}
                              />
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-400 line-through">{formatPrice(product?.price)}</span>
                              <span className="text-base font-bold text-gray-900">{formatPrice(product?.oldPrice)}</span>
                            </div>
                            <Chip 
                              label={`${stockStatus?.label} (${product?.countInStock})`}
                              size="small"
                              sx={{ 
                                bgcolor: stockStatus?.bg, 
                                color: stockStatus?.color,
                                fontWeight: 600,
                                fontSize: '0.65rem',
                                height: 20,
                                borderRadius: '4px'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Tooltip title="Edit">
                          <IconButton 
                            size="small"
                            onClick={() => context.setIsOpenFullScreenPanel({
                              open: true,
                              model: 'Edit Product',
                              id: product?._id
                            })}
                            className="hover:bg-primary/10"
                          >
                            <FaEdit className="text-primary text-xs" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View">
                          <IconButton 
                            size="small"
                            onClick={() => openProductDetail(product)}
                            className="hover:bg-gray-100"
                          >
                            <FaEye className="text-gray-500 text-xs" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            size="small"
                            onClick={() => deleteProduct(product._id)}
                            className="hover:bg-red-50"
                          >
                            <FaTrash className="text-red-500 text-xs" />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {productData?.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-100">
            <select
              value={rowsPerPage}
              onChange={handleChangeRowsPerPage}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value={12}>12 per page</option>
              <option value={24}>24 per page</option>
              <option value={48}>48 per page</option>
              <option value={96}>96 per page</option>
            </select>
            <MuiPagination
              count={productData?.totalPages}
              page={page + 1}
              onChange={handleChangePage}
              shape="rounded"
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: '8px',
                  '&.Mui-selected': {
                    bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                  }
                }
              }}
            />
          </div>
        )}
      </div>

      <Dialog 
        open={openDetailModal} 
        onClose={() => setOpenDetailModal(false)} 
        fullScreen 
        TransitionComponent={Transition}
      >
        <div className="h-full flex flex-col bg-gray-50">
          <div className="bg-white px-6 py-4 shadow-sm flex items-center justify-between">
            <button 
              onClick={() => setOpenDetailModal(false)} 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FaWindowClose /> 
              <span className="font-medium">Back to Products</span>
            </button>
            <h3 className="font-bold text-gray-900 text-lg">Product Details</h3>
            <div className="flex gap-3">
              <Button
                size="small"
                variant="outlined"
                startIcon={<FaEdit />}
                onClick={() => {
                  setOpenDetailModal(false);
                  context.setIsOpenFullScreenPanel({
                    open: true,
                    model: 'Edit Product',
                    id: selectedProduct?._id
                  });
                }}
                sx={{ borderRadius: '8px', textTransform: 'none' }}
              >
                Edit Product
              </Button>
            </div>
          </div>

          {selectedProduct && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {selectedProduct?.images?.slice(0, 6).map((img, idx) => (
                        <div 
                          key={idx}
                          className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => { setPhotos(selectedProduct?.images?.map(i => ({ src: i }))); setOpen(true); }}
                        >
                          <LazyLoadImage
                            alt={`Image ${idx + 1}`}
                            effect="blur"
                            src={img}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900">{selectedProduct?.name}</h3>
                    <p className="text-gray-500 mt-2">{selectedProduct?.brand}</p>
                    <div className="flex items-center gap-3 mt-4">
                      <Rating name="rating" size="small" defaultValue={selectedProduct?.rating} readOnly />
                      <span className="text-sm text-gray-500">({selectedProduct?.rating})</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                        <FaBox className="text-green-600 text-xl" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Price</p>
                        <p className="text-3xl font-bold text-gray-900">{formatPrice(selectedProduct?.oldPrice)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-500 line-through">MRP: {formatPrice(selectedProduct?.price)}</span>
                      {selectedProduct?.price > selectedProduct?.oldPrice && (
                        <span className="text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-lg">
                          -{Math.round((1 - selectedProduct?.oldPrice/selectedProduct?.price) * 100)}% OFF
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                        <FaTruck className="text-blue-600 text-xl" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Stock</p>
                        <p className="text-2xl font-bold text-gray-900">{selectedProduct?.countInStock} units</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">{selectedProduct?.sale} total sales</p>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-3">Category</p>
                    <div className="flex flex-wrap gap-2">
                      <Chip 
                        label={selectedProduct?.catName} 
                        sx={{ borderRadius: '8px', bgcolor: '#f3f4f6' }}
                      />
                      {selectedProduct?.subCat && (
                        <Chip 
                          label={selectedProduct?.subCat} 
                          variant="outlined"
                          sx={{ borderRadius: '8px' }}
                        />
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-3">Description</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedProduct?.description}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Dialog>

      <Drawer
        anchor="bottom"
        open={openFilterDrawer}
        onClose={() => setOpenFilterDrawer(false)}
        PaperProps={{
          className: 'rounded-t-2xl',
          style: { maxHeight: '85vh' }
        }}
      >
        <div className="p-6 overflow-y-auto" style={{ maxHeight: '85vh' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Filter Products</h3>
            <button 
              onClick={() => setOpenFilterDrawer(false)} 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <FaWindowClose />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-600 mb-3">Category</p>
            <div className="space-y-2">
              <button
                onClick={() => { setTempCategoryFilter('all'); setTempSubcategoryFilter('all'); }}
                className={`w-full p-4 rounded-xl font-medium text-left transition-all ${
                  tempCategoryFilter === 'all' 
                    ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Categories
              </button>
              
              {categories?.map((category) => (
                <div key={category._id}>
                  <button
                    onClick={() => handleCategoryExpand(category._id)}
                    className={`w-full p-4 rounded-xl font-medium text-left flex items-center justify-between transition-all ${
                      tempCategoryFilter === category._id 
                        ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span 
                      onClick={(e) => { e.stopPropagation(); setTempCategoryFilter(category._id); setTempSubcategoryFilter('all'); }}
                      className="flex-1"
                    >
                      {category.name}
                    </span>
                    {category?.children?.length > 0 && (
                      <FaChevronDown className={`transition-transform ${expandedCategory === category._id ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  
                  {expandedCategory === category._id && category?.children?.length > 0 && (
                    <div className="mt-2 ml-4 space-y-2">
                      <button
                        onClick={() => setTempSubcategoryFilter('all')}
                        className={`w-full p-3 rounded-lg font-medium text-left transition-all ${
                          tempSubcategoryFilter === 'all' 
                            ? 'bg-primary/20 text-primary border-2 border-primary' 
                            : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:border-gray-200'
                        }`}
                      >
                        All Subcategories
                      </button>
                      {category.children.map((sub) => (
                        <button
                          key={sub._id}
                          onClick={() => setTempSubcategoryFilter(sub._id)}
                          className={`w-full p-3 rounded-lg font-medium text-left transition-all ${
                            tempSubcategoryFilter === sub._id 
                              ? 'bg-primary/20 text-primary border-2 border-primary' 
                              : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:border-gray-200'
                          }`}
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={resetFilter}
              className="flex-1 py-4 bg-gray-100 rounded-xl font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={applyFilter}
              className="flex-1 py-4 bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl font-medium shadow-lg shadow-primary/25 hover:shadow-xl transition-all"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </Drawer>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="text-center font-bold">Confirm Delete</DialogTitle>
        <DialogContent>
          <p className="text-center text-gray-600 py-4">
            Are you sure you want to delete this product? This action cannot be undone.
          </p>
        </DialogContent>
        <DialogActions className="p-4 gap-3">
          <Button 
            onClick={() => setOpenDeleteDialog(false)} 
            variant="outlined"
            sx={{ borderRadius: '10px', textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteProduct} 
            variant="contained" 
            color="error"
            sx={{ borderRadius: '10px', textTransform: 'none' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={photos}
      />
    </div>
  );
};

export default Products;