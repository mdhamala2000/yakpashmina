import React, { useContext, useEffect, useState } from 'react';
import { Button } from "@mui/material";
import { FaExclamationTriangle, FaBox, FaCheck, FaEye, FaEdit, FaSync } from "react-icons/fa";
import { MyContext } from '../../App';
import { fetchDataFromApi } from '../../utils/api';
import CircularProgress from '@mui/material/CircularProgress';
import { LazyLoadImage } from "react-lazy-load-image-component";

const LOW_STOCK_THRESHOLD = 5;

const InventoryAlerts = () => {
    const [products, setProducts] = useState([]);
    const [variants, setVariants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const context = useContext(MyContext);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await fetchDataFromApi('/api/product/getAllProducts?limit=1000');
            if (res?.error === false && res?.products) {
                const lowStockProducts = res.products.filter(
                    p => !p.hasVariants && p.countInStock <= LOW_STOCK_THRESHOLD && !p.isDeleted
                );
                setProducts(lowStockProducts);

                const variantProducts = res.products.filter(p => p.hasVariants && !p.isDeleted);
                const allVariants = [];
                for (const prod of variantProducts) {
                    try {
                        const vRes = await fetchDataFromApi(`/api/variant/product/${prod._id}`);
                        if (vRes?.success && vRes?.variants) {
                            vRes.variants.forEach(v => {
                                if (v.stock <= LOW_STOCK_THRESHOLD) {
                                    allVariants.push({ ...v, productName: prod.name, productId: prod._id, productImage: prod.images?.[0] });
                                }
                            });
                        }
                    } catch (e) {
                        // skip
                    }
                }
                setVariants(allVariants);
            }
        } catch (error) {
            console.error('Failed to fetch inventory data:', error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getStockBadge = (count) => {
        if (count === 0) return { label: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
        return { label: 'Low Stock', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
    };

    const totalAlerts = products.length + variants.length;

    return (
        <div className="w-full h-full">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
                <div className="p-4 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center">
                                <FaExclamationTriangle className="text-white text-lg" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Inventory Alerts</h2>
                                <p className="text-xs text-gray-500">
                                    Products and variants with stock ≤ {LOW_STOCK_THRESHOLD}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {totalAlerts > 0 && (
                                <span className="px-3 py-1 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold rounded-lg">
                                    {totalAlerts} alert{totalAlerts > 1 ? 's' : ''}
                                </span>
                            )}
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<FaSync />}
                                onClick={fetchData}
                                className="!text-xs"
                            >
                                Refresh
                            </Button>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <CircularProgress size={32} />
                            <p className="text-gray-400 text-sm mt-3">Checking inventory...</p>
                        </div>
                    </div>
                ) : totalAlerts === 0 ? (
                    <div className="flex-1 flex items-center justify-center p-8">
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
                                <FaCheck className="text-green-500 text-3xl" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-1">All Stocked Up</h3>
                            <p className="text-sm text-gray-400">
                                No products or variants with low stock (≤ {LOW_STOCK_THRESHOLD})
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-auto p-4 space-y-6">
                        {products.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <FaBox className="text-blue-500" />
                                    Simple Products ({products.length})
                                </h3>
                                <div className="space-y-2">
                                    {products.map(product => {
                                        const badge = getStockBadge(product.countInStock);
                                        return (
                                            <div key={product._id} className={`flex items-center gap-4 p-3 rounded-lg border ${badge.bg} ${badge.border}`}>
                                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                    <LazyLoadImage
                                                        src={product.images?.[0]}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                                                    <p className="text-xs text-gray-500">SKU: {product.sku || 'N/A'}</p>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className={`text-lg font-bold ${badge.color}`}>{product.countInStock}</p>
                                                    <p className="text-[10px] text-gray-400">in stock</p>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => context.setIsOpenFullScreenPanel({ open: true, model: 'Edit Product', id: product._id })}
                                                        className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-blue-50 cursor-pointer"
                                                    >
                                                        <FaEdit className="text-blue-500 text-xs" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {variants.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <FaExclamationTriangle className="text-amber-500" />
                                    Variant Products ({variants.length})
                                </h3>
                                <div className="space-y-2">
                                    {variants.map(variant => {
                                        const badge = getStockBadge(variant.stock);
                                        return (
                                            <div key={variant._id} className={`flex items-center gap-4 p-3 rounded-lg border ${badge.bg} ${badge.border}`}>
                                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                    <LazyLoadImage
                                                        src={variant.productImage}
                                                        alt={variant.productName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-800 truncate">{variant.productName}</p>
                                                    <p className="text-xs text-gray-500">
                                                        SKU: {variant.sku} |
                                                        {Object.entries(variant.options || {}).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                                    </p>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className={`text-lg font-bold ${badge.color}`}>{variant.stock}</p>
                                                    <p className="text-[10px] text-gray-400">in stock</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InventoryAlerts;
