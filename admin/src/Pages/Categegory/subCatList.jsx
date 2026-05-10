import React, { useEffect, useState, useContext } from 'react';
import { Button } from "@mui/material";
import { MyContext } from '../../App';
import { useNavigate } from 'react-router-dom';
import { FaAngleDown, FaPlus, FaEdit, FaTrash, FaLevelDownAlt, FaEye } from "react-icons/fa";
import { deleteData } from '../../utils/api';
import toast from 'react-hot-toast';

export const SubCategoryList = () => {
    const [isOpen, setIsOpen] = useState({});
    const context = useContext(MyContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!context?.catData || context?.catData?.length === 0) {
            context?.getCat();
        }
    }, [context]);

    const expend = (index) => {
        setIsOpen(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const handleEdit = (category) => {
        context.setIsOpenFullScreenPanel({
            model: 'Edit Category',
            id: category._id
        });
    };

    const handleDelete = (id, name) => {
        if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
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

    const handleAddSubCategory = () => {
        context.setIsOpenFullScreenPanel({
            model: 'Add New Sub Category'
        });
    };

    return (
        <>
            <div className="flex items-center flex-col md:flex-row justify-start md:justify-between px-2 py-0 mt-3">
                <h2 className="text-[22px] font-[700] w-full md:w-[50%] mb-1 md:mb-0 text-gray-800">
                    Sub Category List
                </h2>

                <div className="col mr-auto md:mr-0 md:ml-auto flex items-center justify-end gap-3">
                    <Button 
                        className="btn-blue !text-white !bg-[#1976d2] !hover:bg-[#1565c0] !px-4 !py-2 !rounded-md !font-[500] !text-[13px] !shadow-sm flex gap-2 items-center" 
                        onClick={handleAddSubCategory}
                    >
                        <FaPlus className="text-[12px]" /> Add New Sub Category
                    </Button>
                </div>
            </div>

            <div className="card my-4 pt-5 pb-5 px-5 shadow-md sm:rounded-lg bg-white">
                {context?.catData?.length !== 0 ? (
                    <ul className='w-full'>
                        {context?.catData?.map((firstLavelCat, index) => (
                            <li className='w-full mb-3' key={index}>
                                <div className='flex items-center w-full p-3 bg-gradient-to-r from-[#f8f9fa] to-[#fff] rounded-lg border border-gray-200 px-4 min-h-[50px]'>
                                    <div className="flex items-center gap-3 flex-1">
                                        <span className='font-[600] text-[15px] text-gray-800'>
                                            {firstLavelCat?.name}
                                        </span>
                                        <span className="text-[12px] text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                            {firstLavelCat?.productCount || 0} products
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 ml-auto">
                                        <button 
                                            onClick={() => handleViewProducts(firstLavelCat)}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all border border-transparent hover:border-green-200 flex items-center gap-1"
                                            title="View Products"
                                        >
                                            <FaEye className="text-[14px]" />
                                            <span className="text-[11px]">View</span>
                                        </button>
                                        <button 
                                            onClick={() => handleEdit(firstLavelCat)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-200"
                                            title="Edit Category"
                                        >
                                            <FaEdit className="text-[14px]" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(firstLavelCat._id, firstLavelCat.name)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-200"
                                            title="Delete Category"
                                        >
                                            <FaTrash className="text-[14px]" />
                                        </button>
                                        {firstLavelCat?.children?.length > 0 && (
                                            <Button 
                                                className="!min-w-[35px] !w-[35px] !h-[35px] !rounded-full !text-gray-600 !bg-gray-100 hover:!bg-gray-200" 
                                                onClick={() => expend(index)}
                                            >
                                                <FaAngleDown className={`transition-transform ${isOpen[index] ? 'rotate-180' : ''}`} />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {isOpen[index] && firstLavelCat?.children?.length > 0 && (
                                    <ul className='w-full ml-4 mt-2'>
                                        {firstLavelCat?.children?.map((subCat, subIndex) => (
                                            <li className='w-full py-2' key={subIndex}>
                                                <div className="flex items-center gap-2 pl-4 py-3 bg-white border-l-4 border-blue-400 rounded-r-lg hover:bg-gray-50 transition-colors">
                                                    <FaLevelDownAlt className="text-gray-400 text-sm ml-2" />
                                                    
                                                    <div className="flex-1">
                                                        <span className="font-[500] text-[14px] text-gray-700">{subCat?.name}</span>
                                                        <span className="text-[11px] text-gray-500 ml-2">({subCat?.productCount || 0} products)</span>
                                                    </div>

                                                    <div className="flex items-center gap-2 mr-2">
                                                        <button 
                                                            onClick={() => handleViewProducts(subCat)}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all border border-transparent hover:border-green-200 flex items-center gap-1"
                                                            title="View Products"
                                                        >
                                                            <FaEye className="text-[12px]" />
                                                            <span className="text-[10px]">View</span>
                                                        </button>
                                                        <button 
                                                            onClick={() => handleEdit(subCat)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-200"
                                                            title="Edit Sub Category"
                                                        >
                                                            <FaEdit className="text-[14px]" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(subCat._id, subCat.name)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-200"
                                                            title="Delete Sub Category"
                                                        >
                                                            <FaTrash className="text-[14px]" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {subCat?.children?.length > 0 && (
                                                    <ul className="pl-8 mt-1">
                                                        {subCat?.children?.map((thirdLevel, thirdIndex) => (
                                                            <li
                                                                key={thirdIndex}
                                                                className="w-full py-2 hover:bg-gray-50 flex items-center gap-2 border-l-2 border-gray-300 ml-2"
                                                            >
                                                                <div className="flex-1 flex items-center gap-2">
                                                                    <FaLevelDownAlt className="text-gray-400 text-xs" />
                                                                    <span className="font-[500] text-[13px] text-gray-600">{thirdLevel.name}</span>
                                                                    <span className="text-[11px] text-gray-500">({thirdLevel?.productCount || 0})</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 mr-2">
                                                                    <button 
                                                                        onClick={() => handleViewProducts(thirdLevel)}
                                                                        className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-all"
                                                                        title="View Products"
                                                                    >
                                                                        <FaEye className="text-[11px]" />
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleEdit(thirdLevel)}
                                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-all"
                                                                        title="Edit"
                                                                    >
                                                                        <FaEdit className="text-[12px]" />
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleDelete(thirdLevel._id, thirdLevel.name)}
                                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-all"
                                                                        title="Delete"
                                                                    >
                                                                        <FaTrash className="text-[12px]" />
                                                                    </button>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-10 text-gray-500">
                        <p>No categories found. Add your first category!</p>
                    </div>
                )}
            </div>
        </>
    )
}

export default SubCategoryList;