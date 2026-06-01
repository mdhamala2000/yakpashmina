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
    if (context?.productsRefreshTrigger > 0) {
      getProducts(page, rowsPerPage);
    }
  }, [context?.productsRefreshTrigger]);

  useEffect(() => {
    const catId = searchParams.get('catId');
    const subCatId = searchParams.get('subCatId');

    console.log('Products page - catId:', catId, 'subCatId:', subCatId);

    if (catId) {
      console.log('Fetching products for category:', catId);
      setProductCat(catId);
      setCategoryFilter(catId);
      setIsloading(true);
      fetchDataFromApi(`/api/product/getAllProductsByCatId/${catId}`).then((res) => {
        console.log('API Response for catId:', res);
        if (res?.error === false && res?.products) {
          setProductData({
            error: false,
            success: true,
            products: res.products,
            total: res.products.length,
            page: 0,
            totalPages: 1,
            totalCount: res.products.length
          });
          setTimeout(() => setIsloading(false), 300);
        } else {
          console.log('No products found or error:', res);
          setIsloading(false);
        }
      }).catch((err) => {
        console.error('API Error:', err);
        setIsloading(false);
      });
      searchParams.delete('catId');
      setSearchParams(searchParams);
    } else if (subCatId) {
      console.log('Fetching products for subcategory:', subCatId);
      setProductSubCat(subCatId);
      setSubcategoryFilter(subCatId);
      setIsloading(true);
      fetchDataFromApi(`/api/product/getAllProductsBySubCatId/${subCatId}`).then((res) => {
        console.log('API Response for subCatId:', res);
        if (res?.error === false && res?.products) {
          setProductData({
            error: false,
            success: true,
            products: res.products,
            total: res.products.length,
            page: 0,
            totalPages: 1,
            totalCount: res.products.length
          });
          setTimeout(() => setIsloading(false), 300);
        } else {
          console.log('No products found or error:', res);
          setIsloading(false);
        }
      }).catch((err) => {
        console.error('API Error:', err);
        setIsloading(false);
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
    if (count <= 5) return statusConfig.lowStock;
    return statusConfig.inStock;
  };

  const getProductPrice = (product) => {
    if (product.hasVariants) {
      if (product.effectivePrice != null) {
        return `From ${formatPrice(product.effectivePrice)}`;
      }
      return 'Variant';
    }
    if (product?.oldPrice > 0 && product?.oldPrice > product?.price) {
      return (
        <>{formatPrice(product?.oldPrice)} <span className="text-gray-400 line-through text-[9px]">{formatPrice(product?.price)}</span></>
      );
    }
    return formatPrice(product?.price);
  };

  const getProductStock = (product) => {
    if (product.hasVariants) {
      return product.effectiveStock ?? product.variantCount ?? 0;
    }
    return product.countInStock;
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
    <div className="w-full h-full">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
        {/* Compact Header */}
        <div className="p-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <FaShoppingBag className="text-white text-sm" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Products</h2>
                <span className="text-xs text-gray-500">{productData?.products?.length || 0} items</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 w-40 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); getProducts(0, rowsPerPage); }}
                className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-white"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price ↑</option>
                <option value="price-high">Price ↓</option>
                <option value="name">Name</option>
              </select>
              
              <button
                onClick={() => { setTempCategoryFilter(categoryFilter); setTempSubcategoryFilter(subcategoryFilter); setOpenFilterDrawer(true); }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 border rounded-lg text-xs transition-all ${activeFilterCount > 0 ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                <FaFilter className="text-[10px]" />
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-primary text-white text-[9px] flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <FaThLarge className="text-xs" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <FaThList className="text-xs" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            {sortedIds?.length > 0 && (
              <>
                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {sortedIds.length} selected
                </span>
                <Button 
                  variant="outlined" 
                  color="error" 
                  size="small"
                  onClick={deleteMultipleProduct}
                  startIcon={<FaTrash />}
                  className="!text-xs !py-0.5 !px-2"
                >
                  Delete
                </Button>
              </>
            )}
          </div>
          <Button
            variant="contained"
            size="small"
            startIcon={<FaPlus />}
            onClick={() => context.setIsOpenFullScreenPanel({
              open: true,
              model: 'Add Product'
            })}
            className="!bg-gradient-to-r !from-blue-600 !to-indigo-600 !text-xs !py-1 !px-3 !normal-case"
          >
            Add Product
          </Button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <CircularProgress size={24} sx={{ color: '#667eea' }} />
              <p className="text-gray-400 text-xs mt-2">Loading...</p>
            </div>
          </div>
        ) : (!productData?.products || productData?.products?.length === 0) ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gray-100 flex items-center justify-center">
                <FaRegImage className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">No products</h3>
              <p className="text-xs text-gray-400 mb-4 max-w-[200px]">
                {searchQuery || categoryFilter !== 'all' || subcategoryFilter !== 'all'
                  ? "No results found"
                  : "Add your first product"}
              </p>
              <div className="flex gap-2 justify-center">
                {(searchQuery || categoryFilter !== 'all') && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => { setSearchQuery(''); setCategoryFilter('all'); setSubcategoryFilter('all'); getProducts(0, 10); }}
                    className="!text-xs !py-1"
                  >
                    Clear
                  </Button>
                )}
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<FaPlus />}
                  onClick={() => context.setIsOpenFullScreenPanel({ open: true, model: 'Add Product' })}
                  className="!text-xs !py-1 !bg-gradient-to-r !from-blue-600 !to-indigo-600"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="p-2 flex-1 overflow-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {productData?.products?.map((product, index) => {
                const stockCount = getProductStock(product);
                const stockStatus = getStockStatus(stockCount);
                return (
                  <div 
                    key={product._id || index} 
                    className="group bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md hover:border-gray-200 transition-all"
                  >
                    <div className="relative aspect-square overflow-hidden bg-gray-50">
                      <input
                        type="checkbox"
                        checked={product.checked === true}
                        onChange={(e) => handleCheckboxChange(e, product._id)}
                        className="absolute top-1.5 left-1.5 w-3.5 h-3.5 rounded border-gray-300 z-10 opacity-0 group-hover:opacity-100 cursor-pointer"
                        style={{ opacity: product.checked ? 1 : undefined }}
                      />
                      <LazyLoadImage
                        alt={product?.name}
                        effect="blur"
                        src={product?.images[0]}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute top-1.5 left-1.5 flex flex-col gap-0.5">
                        <div className={`text-[8px] px-1.5 py-0.5 rounded font-medium text-white ${product?.hasVariants ? 'bg-purple-500' : 'bg-blue-500'}`}>
                          {product?.hasVariants ? 'Variant' : 'Simple'}
                        </div>
                        {product?.hasVariants && product?.variantCount && (
                          <div className="bg-indigo-500 text-white text-[8px] px-1.5 py-0.5 rounded font-medium">
                            {product.variantCount} options
                          </div>
                        )}
                        {!product?.hasVariants && product?.discount > 0 && (
                          <div className="bg-rose-500 text-white text-[8px] px-1.5 py-0.5 rounded font-medium">
                            -{product?.discount}%
                          </div>
                        )}
                      </div>
                      <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => openProductDetail(product)}
                          className="w-6 h-6 rounded bg-white shadow flex items-center justify-center hover:bg-gray-50"
                        >
                          <FaEye className="text-gray-500 text-[10px]" />
                        </button>
                      </div>
                      <div className="absolute bottom-1.5 left-1.5 right-1.5 flex justify-center gap-1 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => context.setIsOpenFullScreenPanel({ open: true, model: 'Edit Product', id: product?._id })}
                          className="w-6 h-6 rounded bg-white shadow flex items-center justify-center hover:bg-blue-50"
                        >
                          <FaEdit className="text-primary text-[10px]" />
                        </button>
                        <button
                          onClick={() => deleteProduct(product._id)}
                          className="w-6 h-6 rounded bg-white shadow flex items-center justify-center hover:bg-red-50"
                        >
                          <FaTrash className="text-red-500 text-[10px]" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-1.5">
                      <Link to={`/product/${product?._id}`} className="text-[11px] font-medium text-gray-800 line-clamp-2 hover:text-primary">
                        {product?.name}
                      </Link>
                      
                      <div className="flex items-center gap-1 mt-1">
                        {product?.hasVariants ? (
                          <span className="text-xs font-semibold text-purple-600">
                            {getProductPrice(product)}
                          </span>
                        ) : product?.oldPrice > 0 && product?.oldPrice > product?.price ? (
                          <>
                            <span className="text-[10px] text-gray-400 line-through">{formatPrice(product?.price)}</span>
                            <span className="text-xs font-bold text-red-600">{formatPrice(product?.oldPrice)}</span>
                          </>
                        ) : (
                          <span className="text-xs font-semibold text-gray-900">{formatPrice(product?.price)}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[9px] text-gray-400">{product?.sale || 0} sold</span>
                        <span 
                          className="text-[9px] font-medium px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: stockStatus?.bg, color: stockStatus?.color }}
                        >
                          {stockStatus?.label}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
) : (
          <div className="p-2 flex-1 overflow-auto">
            <div className="space-y-1">
              {productData?.products?.map((product, index) => {
                const stockCount = getProductStock(product);
                const stockStatus = getStockStatus(stockCount);
                return (
                  <div 
                    key={product._id || index} 
                    className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={product.checked === true}
                      onChange={(e) => handleCheckboxChange(e, product._id)}
                      className="w-3.5 h-3.5 rounded border-gray-300"
                    />
                    <div 
                      className="w-10 h-10 rounded overflow-hidden flex-shrink-0 cursor-pointer"
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
                      <Link to={`/product/${product?._id}`} className="text-xs font-medium text-gray-800 line-clamp-1 hover:text-primary">
                        {product?.name}
                      </Link>
                      <p className="text-[10px] text-gray-500">{product?.brand || product?.catName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {product?.hasVariants ? (
                        <span className="text-xs font-semibold text-purple-600">
                          {getProductPrice(product)}
                        </span>
                      ) : product?.oldPrice > 0 && product?.oldPrice > product?.price ? (
                        <>
                          <span className="text-[10px] text-gray-400 line-through">{formatPrice(product?.price)}</span>
                          <span className="text-xs font-bold text-red-600">{formatPrice(product?.oldPrice)}</span>
                        </>
                      ) : (
                        <span className="text-xs font-semibold text-gray-900">{formatPrice(product?.price)}</span>
                      )}
                    </div>
                    <span 
                      className={`text-[9px] font-medium px-1.5 py-0.5 rounded whitespace-nowrap ${product?.hasVariants ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}
                    >
                      {product?.hasVariants ? 'Variant' : 'Simple'}
                    </span>
                    <span 
                      className="text-[9px] font-medium px-1.5 py-0.5 rounded whitespace-nowrap"
                      style={{ backgroundColor: stockStatus?.bg, color: stockStatus?.color }}
                    >
                      {stockStatus?.label}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => openProductDetail(product)}
                        className="w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center"
                      >
                        <FaEye className="text-gray-400 text-[10px]" />
                      </button>
                      <button
                        onClick={() => context.setIsOpenFullScreenPanel({ open: true, model: 'Edit Product', id: product?._id })}
                        className="w-6 h-6 rounded hover:bg-blue-50 flex items-center justify-center"
                      >
                        <FaEdit className="text-primary text-[10px]" />
                      </button>
                      <button
                        onClick={() => deleteProduct(product._id)}
                        className="w-6 h-6 rounded hover:bg-red-50 flex items-center justify-center"
                      >
                        <FaTrash className="text-red-400 text-[10px]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {productData?.totalPages > 1 && (
          <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100 flex-shrink-0">
            <select
              value={rowsPerPage}
              onChange={handleChangeRowsPerPage}
              className="px-2 py-1 border border-gray-200 rounded text-xs bg-white"
            >
              <option value={12}>12/page</option>
              <option value={24}>24/page</option>
              <option value={48}>48/page</option>
            </select>
            <MuiPagination
              count={productData?.totalPages}
              page={page + 1}
              onChange={handleChangePage}
              size="small"
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  minWidth: 24,
                  height: 24,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
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
        maxWidth="md"
        fullWidth
        TransitionComponent={Transition}
      >
        <div className="bg-gray-50">
          <div className="bg-white px-4 py-3 border-b flex items-center justify-between">
            <button 
              onClick={() => setOpenDetailModal(false)} 
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-xs"
            >
              <FaWindowClose /> 
              <span>Close</span>
            </button>
            <h3 className="font-semibold text-gray-900 text-sm">Product Details</h3>
            <Button
              size="small"
              variant="contained"
              startIcon={<FaEdit />}
              onClick={() => {
                setOpenDetailModal(false);
                context.setIsOpenFullScreenPanel({
                  open: true,
                  model: 'Edit Product',
                  id: selectedProduct?._id
                });
              }}
              className="!text-xs !py-1"
            >
              Edit
            </Button>
          </div>

          {selectedProduct && (
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="bg-white rounded-xl p-3 shadow-sm">
                    <div className="grid grid-cols-3 gap-2">
                      {selectedProduct?.images?.slice(0, 6).map((img, idx) => (
                        <div 
                          key={idx}
                          className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90"
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

                <div className="space-y-3">
                  <div className="bg-white rounded-xl p-3 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900">{selectedProduct?.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{selectedProduct?.brand}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Rating name="rating" size="small" defaultValue={selectedProduct?.rating} readOnly />
                      <span className="text-xs text-gray-400">({selectedProduct?.rating})</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-3 shadow-sm">
                    <p className="text-xs text-gray-500">Price</p>
                    <p className="text-xl font-bold text-gray-900">{formatPrice(selectedProduct?.oldPrice)}</p>
                    {selectedProduct?.price > selectedProduct?.oldPrice && (
                      <span className="text-xs text-green-600 font-medium">
                        {Math.round((1 - selectedProduct?.oldPrice/selectedProduct?.price) * 100)}% OFF
                      </span>
                    )}
                  </div>

                  <div className="bg-white rounded-xl p-3 shadow-sm">
                    <p className="text-xs text-gray-500">Stock</p>
                    <p className="text-lg font-bold text-gray-900">{selectedProduct?.countInStock} units</p>
                    <p className="text-xs text-gray-400">{selectedProduct?.sale || 0} sales</p>
                  </div>

                  <div className="bg-white rounded-xl p-3 shadow-sm">
                    <p className="text-xs text-gray-500 mb-2">Category</p>
                    <div className="flex flex-wrap gap-1">
                      <Chip 
                        label={selectedProduct?.catName} 
                        size="small"
                        className="!text-xs"
                      />
                      {selectedProduct?.subCat && (
                        <Chip 
                          label={selectedProduct?.subCat} 
                          size="small"
                          variant="outlined"
                          className="!text-xs"
                        />
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-3 shadow-sm">
                    <p className="text-xs text-gray-500 mb-2">Description</p>
                    <p className="text-xs text-gray-700 line-clamp-3">{selectedProduct?.description}</p>
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
          className: 'rounded-t-xl',
          style: { maxHeight: '70vh' }
        }}
      >
        <div className="p-4 overflow-y-auto" style={{ maxHeight: '70vh' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900">Filter</h3>
            <button 
              onClick={() => setOpenFilterDrawer(false)} 
              className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <FaWindowClose className="text-xs" />
            </button>
          </div>

          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 mb-2">Category</p>
            <div className="space-y-1 max-h-[40vh] overflow-y-auto">
              <button
                onClick={() => { setTempCategoryFilter('all'); setTempSubcategoryFilter('all'); }}
                className={`w-full p-2 rounded-lg text-left text-xs transition-all ${
                  tempCategoryFilter === 'all' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                All Categories
              </button>
              
              {categories?.map((category) => (
                <div key={category._id}>
                  <button
                    onClick={() => handleCategoryExpand(category._id)}
                    className={`w-full p-2 rounded-lg text-left text-xs flex items-center justify-between transition-all ${
                      tempCategoryFilter === category._id 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span 
                      onClick={(e) => { e.stopPropagation(); setTempCategoryFilter(category._id); setTempSubcategoryFilter('all'); }}
                      className="flex-1"
                    >
                      {category.name}
                    </span>
                    {category?.children?.length > 0 && (
                      <FaChevronDown className={`text-[10px] transition-transform ${expandedCategory === category._id ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  
                  {expandedCategory === category._id && category?.children?.length > 0 && (
                    <div className="mt-1 ml-3 space-y-1">
                      <button
                        onClick={() => setTempSubcategoryFilter('all')}
                        className={`w-full p-1.5 rounded text-left text-xs transition-all ${
                          tempSubcategoryFilter === 'all' 
                            ? 'bg-primary/20 text-primary border border-primary' 
                            : 'bg-white text-gray-500 border border-transparent'
                        }`}
                      >
                        All
                      </button>
                      {category.children.map((sub) => (
                        <button
                          key={sub._id}
                          onClick={() => setTempSubcategoryFilter(sub._id)}
                          className={`w-full p-1.5 rounded text-left text-xs transition-all ${
                            tempSubcategoryFilter === sub._id 
                              ? 'bg-primary/20 text-primary border border-primary' 
                              : 'bg-white text-gray-500 border border-transparent'
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

          <div className="flex gap-2">
            <button
              onClick={resetFilter}
              className="flex-1 py-2 bg-gray-100 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-200"
            >
              Reset
            </button>
            <button
              onClick={applyFilter}
              className="flex-1 py-2 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90"
            >
              Apply
            </button>
          </div>
        </div>
      </Drawer>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle className="text-sm font-bold text-center">Delete Product?</DialogTitle>
        <DialogContent>
          <p className="text-xs text-gray-500 text-center py-2">
            This action cannot be undone.
          </p>
        </DialogContent>
        <DialogActions className="p-2 gap-2">
          <Button 
            onClick={() => setOpenDeleteDialog(false)} 
            variant="outlined"
            size="small"
            className="!text-xs"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteProduct} 
            variant="contained" 
            color="error"
            size="small"
            className="!text-xs"
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