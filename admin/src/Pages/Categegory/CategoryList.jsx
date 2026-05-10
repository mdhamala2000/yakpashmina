import React, { useState, useContext, useEffect } from 'react';
import { Button } from "@mui/material";
import { MyContext } from '../../App';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaAngleRight, FaAngleDown, FaPlus, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { deleteData } from '../../utils/api';
import toast from 'react-hot-toast';

const TreeItem = ({ category, depth = 0, onDelete, expandedIds, toggleExpand, onViewProducts }) => {
    const hasChildren = category?.children && category?.children.length > 0;
    const isExpanded = expandedIds.has(category?._id);
    const context = useContext(MyContext);

    return (
        <div className="w-full">
            <div 
                className={`flex items-center w-full p-3 rounded-lg mb-1 hover:bg-gray-50 transition-all duration-200 ${depth === 0 ? 'bg-gradient-to-r from-[#f8f9fa] to-[#fff] border border-gray-200' : 'bg-white border-l-2 border-blue-300'}`}
                style={{ paddingLeft: `${depth * 24 + 12}px` }}
            >
                {hasChildren && (
                    <button 
                        onClick={() => toggleExpand(category?._id)}
                        className="mr-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 p-1 rounded transition-all"
                    >
                        {isExpanded ? <FaAngleDown className="text-sm" /> : <FaAngleRight className="text-sm" />}
                    </button>
                )}
                {!hasChildren && <div className="w-[22px] mr-2"></div>}
                
                <div className="flex-1">
                    <span className="font-[600] text-[15px] text-gray-800 block">
                        {category?.name}
                    </span>
                    <span className="text-[11px] text-gray-500">
                        {category?.productCount || 0} products
                    </span>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                    <button 
                        onClick={() => onViewProducts(category)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all border border-transparent hover:border-green-200 flex items-center gap-1"
                        title="View Products"
                    >
                        <FaEye className="text-[14px]" />
                        <span className="text-[11px]">View</span>
                    </button>
                    <button 
                        onClick={() => context.setIsOpenFullScreenPanel({
                            open: true,
                            model: 'Edit Category',
                            id: category._id
                        })}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-200"
                        title="Edit"
                    >
                        <FaEdit className="text-[14px]" />
                    </button>
                    <button 
                        onClick={() => onDelete(category?._id, category?.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-200"
                        title="Delete"
                    >
                        <FaTrash className="text-[14px]" />
                    </button>
                </div>
            </div>

            {isExpanded && hasChildren && (
                <div className="w-full">
                    {category?.children.map((child, index) => (
                        <TreeItem 
                            key={child._id || index} 
                            category={child} 
                            depth={depth + 1}
                            onDelete={onDelete}
                            expandedIds={expandedIds}
                            toggleExpand={toggleExpand}
                            onViewProducts={onViewProducts}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export const CategoryList = () => {
    const context = useContext(MyContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [expandedIds, setExpandedIds] = useState(new Set());

    useEffect(() => {
        if (!context?.catData || context?.catData?.length === 0) {
            context?.getCat();
        }
    }, [context]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const catId = params.get('catId');
        const subCatId = params.get('subCatId');
        
        if (catId || subCatId) {
            const timer = setTimeout(() => {
                navigate('/products', { replace: true });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [location, navigate]);

    const toggleExpand = (id) => {
        setExpandedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleDelete = (id, name) => {
        if (window.confirm(`Are you sure you want to delete "${name}"? This will also delete all subcategories.`)) {
            deleteData(`/api/category/${id}`).then((res) => {
                if (res?.success === false) {
                    toast.error(res?.message || "Cannot delete this category. It may contain products.");
                } else {
                    toast.success('Category deleted successfully!');
                    context?.getCat();
                }
            }).catch((err) => {
                toast.error("Failed to delete category. Please try again.");
            });
        }
    };

    const handleViewProducts = (category) => {
        if (category?.parentId) {
            navigate(`/products?subCatId=${category._id}&subCatName=${encodeURIComponent(category.name)}`);
        } else {
            navigate(`/products?catId=${category._id}&catName=${encodeURIComponent(category.name)}`);
        }
    };

    const handleAddCategory = () => {
        context.setIsOpenFullScreenPanel({
            open: true,
            model: 'Add New Category'
        });
    };

    const handleAddSubCategory = () => {
        context.setIsOpenFullScreenPanel({
            open: true,
            model: 'Add New Sub Category'
        });
    };

    return (
        <>
            <div className="flex items-center flex-col md:flex-row justify-start md:justify-between px-2 py-0 mt-3">
                <h2 className="text-[22px] font-[700] w-full md:w-[50%] mb-1 md:mb-0 text-gray-800">
                    Category Management
                </h2>

                <div className="col mr-auto md:mr-0 md:ml-auto flex items-center justify-end gap-3">
                    <Button 
                        className="btn-blue !text-white !bg-[#1976d2] !hover:bg-[#1565c0] !px-4 !py-2 !rounded-md !font-[500] !text-[13px] !shadow-sm flex gap-2 items-center" 
                        onClick={handleAddCategory}
                    >
                        <FaPlus className="text-[12px]" /> Add Category
                    </Button>
                    <Button 
                        className="btn-green !text-white !bg-[#2e7d32] !hover:bg-[#1b5e20] !px-4 !py-2 !rounded-md !font-[500] !text-[13px] !shadow-sm flex gap-2 items-center" 
                        onClick={handleAddSubCategory}
                    >
                        <FaPlus className="text-[12px]" /> Add Sub Category
                    </Button>
                </div>
            </div>

            <div className="card my-4 pt-5 pb-5 px-5 shadow-md sm:rounded-lg bg-white">
                <div className="mb-4 pb-3 border-b border-gray-200">
                    <h3 className="text-[18px] font-[600] text-gray-700">Category Tree</h3>
                    <p className="text-[13px] text-gray-500 mt-1">Manage your categories and subcategories</p>
                </div>

                {context?.catData?.length !== 0 ? (
                    <div className="category-tree">
                        {context?.catData?.map((category, index) => (
                            <TreeItem 
                                key={category._id || index} 
                                category={category}
                                onDelete={handleDelete}
                                expandedIds={expandedIds}
                                toggleExpand={toggleExpand}
                                onViewProducts={handleViewProducts}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-500">
                        <div className="mb-2">
                            <FaPlus className="text-4xl text-gray-300 mx-auto" />
                        </div>
                        <p className="text-[15px]">No categories found. Add your first category!</p>
                    </div>
                )}
            </div>
        </>
    )
}

export default CategoryList;