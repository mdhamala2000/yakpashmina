import React, { useContext, useEffect, useState } from 'react'
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import UploadBox from '../../Components/UploadBox';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { IoMdClose, IoMdStar, IoMdStarOutline } from "react-icons/io";
import { Button } from '@mui/material';
import { FaCloudUploadAlt, FaStar, FaRegStar } from "react-icons/fa";
import { MyContext } from '../../App';
import { deleteImages, fetchDataFromApi, postData, getData } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Switch from '@mui/material/Switch';
import Alert from '@mui/material/Alert';
import ProductCategorySelector from '../../Components/ProductCategorySelector';
import MultiSelectDropdown from '../../Components/MultiSelectDropdown';
import VariantManager from '../../Components/VariantManager';
import ManageAttributeModal from '../../Components/ManageAttributeModal';

const label = { inputProps: { 'aria-label': 'Switch demo' } };


const AddProduct = () => {

    const [formFields, setFormFields] = useState({
        name: "",
        sku: "",
        description: "",
        images: [],
        brand: "",
        price: "",
        oldPrice: "",
        category: "",
        catName: "",
        catId: "",
        subCatId: "",
        subCat: "",
        thirdsubCat: "",
        thirdsubCatId: "",
        countInStock: "",
        isFeatured: false,
        discount: 0,
        shortDescription: "",
        productRam: [],
        size: [],
        productWeight: [],
        color: [],
        materials: "",
        productMaterials: [],
        bannerTitleName: '',
        bannerimages: [],
        isDisplayOnHomeBanner:false,
        // SEO Fields
        slug: "",
        metaTitle: "",
        metaDescription: "",
        keywords: "",
        productType: "simple",
    })

    const autoGenerateSku = () => {
        const prefix = formFields.name ? formFields.name.substring(0, 3).toUpperCase() : 'PRD';
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 5).toUpperCase();
        const sku = `${prefix}-${timestamp}-${random}`;
        setFormFields(prev => ({ ...prev, sku }));
    }

    const discountPercent = formFields.oldPrice > 0 && formFields.price > 0 && Number(formFields.oldPrice) > Number(formFields.price)
        ? Math.round(((Number(formFields.oldPrice) - Number(formFields.price)) / Number(formFields.oldPrice)) * 100)
        : 0;

    const [duplicateWarning, setDuplicateWarning] = useState({ isDuplicate: false, message: '', type: '' })
    const [checkingDuplicate, setCheckingDuplicate] = useState(false)


    const [productCat, setProductCat] = React.useState('');
    const [productSubCat, setProductSubCat] = React.useState('');
    const [productFeatured, setProductFeatured] = React.useState('');
    const [productRams, setProductRams] = React.useState([]);
    const [productRamsData, setProductRamsData] = React.useState([]);
    const [productWeight, setProductWeight] = React.useState([]);
    const [productWeightData, setProductWeightData] = React.useState([]);
    const [productSize, setProductSize] = React.useState([]);
    const [productSizeData, setProductSizeData] = React.useState([]);
    const [productColor, setProductColor] = React.useState([]);
    const [productColorData, setProductColorData] = React.useState([]);
    const [productMaterials, setProductMaterials] = React.useState([]);
    const [productMaterialsData, setProductMaterialsData] = React.useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [productThirdLavelCat, setProductThirdLavelCat] = useState('');

    const [previews, setPreviews] = useState([]);
    const [primaryIndex, setPrimaryIndex] = useState(0);
    const [bannerPreviews, setBannerPreviews] = useState([]);

    const [checkedSwitch, setCheckedSwitch] = useState(false);
    const [showVariantManager, setShowVariantManager] = useState(false);
    const [createdProductId, setCreatedProductId] = useState(null);
    const [manageModal, setManageModal] = useState(null);


    const history = useNavigate();

    const context = useContext(MyContext);


    useEffect(() => {
        fetchDataFromApi("/api/product/productRAMS/get").then((res) => {
            if (res?.error === false) {
                setProductRamsData(res?.data);
            }
        })

        fetchDataFromApi("/api/product/productWeight/get").then((res) => {
            if (res?.error === false) {
                setProductWeightData(res?.data);
            }
        })

        fetchDataFromApi("/api/product/productSize/get").then((res) => {
            if (res?.error === false) {
                setProductSizeData(res?.data);
            }
        })

        fetchDataFromApi("/api/product/productColor/get").then((res) => {
            if (res?.error === false) {
                setProductColorData(res?.data);
            }
        })

        fetchDataFromApi("/api/product/productMaterials/get").then((res) => {
            if (res?.error === false) {
                setProductMaterialsData(res?.data);
            }
        })
    }, [])

    // Add new option handlers
    const handleAddWeight = (name) => {
        postData("/api/product/productWeight/create", { name }).then((res) => {
            if (res?.error === false) {
                setProductWeightData([...productWeightData, res?.data]);
            }
        });
    };

    const handleAddSize = (name) => {
        postData("/api/product/productSize/create", { name }).then((res) => {
            if (res?.error === false) {
                setProductSizeData([...productSizeData, res?.data]);
            }
        });
    };

    const handleAddColor = (name) => {
        postData("/api/product/productColor/create", { name }).then((res) => {
            if (res?.error === false) {
                setProductColorData([...productColorData, res?.data]);
            }
        });
    };

    const handleAddMaterial = (name) => {
        postData("/api/product/productMaterials/create", { name }).then((res) => {
            if (res?.error === false) {
                setProductMaterialsData([...productMaterialsData, res?.data]);
            }
        });
    };

    const handleChangeProductCat = (event) => {
        setProductCat(event.target.value);
        formFields.catId = event.target.value
        formFields.category = event.target.value

    };

    const selectCatByName = (name) => {
        formFields.catName = name
    }

    const handleChangeProductSubCat = (event) => {
        setProductSubCat(event.target.value);
        formFields.subCatId = event.target.value
    };

    const selectSubCatByName = (name) => {
        formFields.subCat = name
    }

    const handleChangeProductThirdLavelCat = (event) => {
        setProductThirdLavelCat(event.target.value);
        formFields.thirdsubCatId = event.target.value
    };

    const selectSubCatByThirdLavel = (name) => {
        formFields.thirdsubCat = name
    }


    const handleChangeProductFeatured = (event) => {
        setProductFeatured(event.target.value);
        formFields.isFeatured = event.target.value
    };

    const handleChangeProductRams = (event) => {
        const {
            target: { value },
        } = event;
        const ramValue = typeof value === "string" ? value.split(",") : value;
        setProductRams(ramValue);
        setFormFields(prev => ({ ...prev, productRam: ramValue }));
    };

    const handleChangeProductWeight = (event) => {

        const {
            target: { value },
        } = event;
        setProductWeight(
            // On autofill we get a stringified value.
            typeof value === "string" ? value.split(",") : value
        );

        formFields.productWeight = value;
    };

    const handleChangeProductSize = (event) => {

        const {
            target: { value },
        } = event;
        setProductSize(
            // On autofill we get a stringified value.
            typeof value === "string" ? value.split(",") : value
        );

        formFields.size = value;
    };

    const handleChangeProductColor = (event) => {
        const {
            target: { value },
        } = event;
        setProductColor(
            typeof value === "string" ? value.split(",") : value
        );

        formFields.color = value;
    };

    const handleChangeProductMaterials = (event) => {
        const {
            target: { value },
        } = event;
        setProductMaterials(
            typeof value === "string" ? value.split(",") : value
        );

        formFields.materials = value;
    };

    const onChangeInput = (e) => {
        const { name, value } = e.target;
        setFormFields(() => {
            return {
                ...formFields,
                [name]: value
            }
        })

        // Real-time duplicate checks
        if (name === 'sku' && value.trim().length >= 2) {
            checkDuplicateProduct(value, null, formFields.catId);
        } else if (name === 'sku' && value.trim().length === 0) {
            setDuplicateWarning(prev => ({ ...prev, type: 'sku', isDuplicate: false, message: '' }));
        }

        if (name === 'name' && value.trim().length >= 2 && formFields.catId) {
            checkDuplicateProduct(null, value, formFields.catId);
        } else if (name === 'name' && value.trim().length === 0) {
            setDuplicateWarning(prev => ({ ...prev, type: 'name', isDuplicate: false, message: '' }));
        }

        // Auto-generate slug from name if slug is empty
        if (name === 'name' && !formFields.slug) {
            const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            setFormFields(prev => ({ ...prev, slug }));
        }
    }

    // Check for duplicate SKU or name in category
    const checkDuplicateProduct = async (sku = null, name = null, categoryId = null) => {
        if (!sku && !name) return;
        
        setCheckingDuplicate(true);
        try {
            const params = new URLSearchParams();
            if (sku) params.append('sku', sku);
            if (name) params.append('name', name);
            if (categoryId) params.append('categoryId', categoryId);
            
            const res = await getData(`/api/duplicates/product?${params.toString()}`);
            setDuplicateWarning({
                isDuplicate: res.isDuplicate,
                message: res.message,
                type: res.type || (sku ? 'sku' : 'name')
            });
        } catch (error) {
            console.error('Duplicate check error:', error);
        }
        setCheckingDuplicate(false);
    }

    const onChangeRating = (e) => {
        setFormFields((formFields) => (
            {
                ...formFields,
                rating: e.target.value
            }
        ))
    }


    const setPreviewsFun = (previewsArr) => {
        const imgArr = previews;
        for (let i = 0; i < previewsArr.length; i++) {
            imgArr.push(previewsArr[i])
        }

        setPreviews([])
        setTimeout(() => {
            setPreviews(imgArr)
            formFields.images = imgArr
        }, 10);

        if (previewsArr.length > 0 && previews.length === 0) {
            setPrimaryIndex(0);
        }
    }


    const setBannerImagesFun = (previewsArr) => {
        const imgArr = bannerPreviews;
        for (let i = 0; i < previewsArr.length; i++) {
            imgArr.push(previewsArr[i])
        }

        setBannerPreviews([])
        setTimeout(() => {
            setBannerPreviews(imgArr)
            formFields.bannerimages = imgArr
        }, 10);
    }



   const removeImg = (image, index) => {
        var imageArr = [];
        imageArr = previews;
        deleteImages(`/api/category/deteleImage?img=${image}`).then((res) => {
            imageArr.splice(index, 1);

            setPreviews([]);
            setTimeout(() => {
                setPreviews(imageArr);
                formFields.images = imageArr
            }, 100);

            if (primaryIndex === index) {
                setPrimaryIndex(0);
            } else if (index < primaryIndex) {
                setPrimaryIndex(prev => prev - 1);
            }

        })
    }

    const setAsFirstImage = (index) => {
        if (index === primaryIndex) return;
        setPrimaryIndex(index);
    }


    const removeBannerImg = (image, index) => {
        var imageArr = [];
        imageArr = bannerPreviews;
        deleteImages(`/api/category/deteleImage?img=${image}`).then((res) => {
            imageArr.splice(index, 1);

            setBannerPreviews([]);
            setTimeout(() => {
                setBannerPreviews(imageArr);
                formFields.bannerimages = imageArr
            }, 100);

        })
    }


    const handleChangeSwitch=(event)=>{
        setCheckedSwitch(event.target.checked);
        formFields.isDisplayOnHomeBanner = event.target.checked;
    }


    const handleSubmitg = (e) => {
        e.preventDefault(0);

        console.log(formFields)

        // Check for duplicates first
        if (duplicateWarning.isDuplicate) {
            context.alertBox("error", duplicateWarning.message);
            return false;
        }

        if (formFields.name === "") {
            context.alertBox("error", "Please enter product name");
            return false;
        }

        if (formFields.description === "") {
            context.alertBox("error", "Please enter product description");
            return false;
        }



        if (formFields?.catId === "") {
            context.alertBox("error", "Please select product category");
            return false;
        }



        if (formFields.productType === 'simple') {
            if (formFields?.price === "") {
                context.alertBox("error", "Please enter a sale price");
                return false;
            }

            if (formFields?.oldPrice && formFields?.price && Number(formFields.price) > Number(formFields.oldPrice)) {
                context.alertBox("error", "Sale price cannot be higher than regular price");
                return false;
            }

            if (formFields?.countInStock === "" || formFields?.countInStock === 0) {
                context.alertBox("error", "Please enter product stock");
                return false;
            }
        }


if (formFields?.brand === "") {
            context.alertBox("error", "Please enter product brand");
            return false;
        }


        if (previews?.length === 0) {
            context.alertBox("error", "Please select product images");
            return false;
        }


        setIsLoading(true);

        const submitData = {
            ...formFields,
            hasVariants: formFields.productType === 'variant',
        };

        if (formFields.productType === 'variant') {
            submitData.countInStock = 0;
            submitData.price = 0;
            submitData.oldPrice = 0;
        }

        const submitImages = [...previews];
        const primaryImg = submitImages.splice(primaryIndex, 1)[0];
        submitImages.unshift(primaryImg);

        postData("/api/product/create", { ...submitData, images: submitImages }).then((res) => {

            if (res?.error === false) {
                context.alertBox("success", res?.message);
                context.setProductsRefreshTrigger(prev => prev + 1);
                const productId = res?.product?._id;
                setCreatedProductId(productId);
                setIsLoading(false);

                if (formFields.productType === 'variant') {
                    setShowVariantManager(true);
                } else {
                    setTimeout(() => {
                        context.setIsOpenFullScreenPanel({ open: false });
                        history("/products");
                    }, 1000);
                }
            } else {
                setIsLoading(false);
                context.alertBox("error", res?.message);
            }
        })
    }

return (
        <section className='p-4 md:p-6 bg-gray-50 min-h-screen'>
            <form onSubmit={handleSubmitg}>
                <div className='max-h-[85vh] overflow-y-auto pr-2 pb-32 space-y-4'>

                    {/* Product Type Selection */}
                    <div className='bg-white rounded-xl border border-gray-200 p-4 sm:p-5'>
                        <div className="mb-4 pb-2 border-b border-gray-100">
                            <h2 className='text-sm font-semibold text-gray-900'>Product Type</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormFields(prev => ({ ...prev, productType: 'simple' }))}
                                className={`p-3.5 rounded-lg border text-center transition-all ${formFields.productType === 'simple' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                            >
                                <h3 className='font-semibold text-sm text-gray-900'>Simple</h3>
                                <p className='text-xs text-gray-500 mt-0.5'>One price, one SKU</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormFields(prev => ({ ...prev, productType: 'variant' }))}
                                className={`p-3.5 rounded-lg border text-center transition-all ${formFields.productType === 'variant' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                            >
                                <h3 className='font-semibold text-sm text-gray-900'>Variant</h3>
                                <p className='text-xs text-gray-500 mt-0.5'>Multiple options</p>
                            </button>
                        </div>
                    </div>

                    {/* Basic Information */}
                    <div className='bg-white rounded-xl border border-gray-200 p-4 sm:p-5'>
                        <div className="mb-4 pb-2 border-b border-gray-100">
                            <h2 className='text-sm font-semibold text-gray-900'>Basic Information</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className='text-xs font-medium text-gray-700 mb-1.5 block'>Product Name <span className='text-red-500'>*</span></label>
                                <input 
                                    type="text" 
                                    className={`w-full h-9 border rounded-lg px-3 text-sm focus:outline-none focus:ring-1 transition-shadow ${duplicateWarning.isDuplicate && duplicateWarning.type === 'name' ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-gray-400'}`} 
                                    name="name" 
                                    value={formFields.name} 
                                    onChange={onChangeInput} 
                                    placeholder="Enter product name"
                                />
                            </div>
                            <div>
                                <label className='text-xs font-medium text-gray-700 mb-1.5 block'>SKU</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        className={`flex-1 h-9 border rounded-lg px-3 text-sm focus:outline-none focus:ring-1 transition-shadow ${duplicateWarning.isDuplicate && duplicateWarning.type === 'sku' ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-gray-400'}`} 
                                        name="sku" 
                                        value={formFields.sku} 
                                        onChange={onChangeInput}
                                        placeholder="YAK-001" 
                                    />
                                    <button
                                        type="button"
                                        onClick={autoGenerateSku}
                                        className="px-3 h-9 bg-gray-100 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-200 whitespace-nowrap cursor-pointer font-medium"
                                    >
                                        Auto
                                    </button>
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className='text-xs font-medium text-gray-700 mb-1.5 block'>Short Description</label>
                                <input type="text" className='w-full h-9 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 transition-shadow' name="shortDescription" value={formFields.shortDescription} onChange={onChangeInput} placeholder="Brief summary shown below price..." />
                            </div>
                            <div className="md:col-span-2">
                                <label className='text-xs font-medium text-gray-700 mb-1.5 block'>Full Description</label>
                                <textarea className='w-full h-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 transition-shadow resize-none' name="description" value={formFields.description} onChange={onChangeInput} placeholder="Detailed product description..." />
                            </div>
                        </div>
                    </div>

                    {/* Category & Pricing */}
                    <div className='bg-white rounded-xl border border-gray-200 p-4 sm:p-5'>
                        <div className="mb-4 pb-2 border-b border-gray-100">
                            <h2 className='text-sm font-semibold text-gray-900'>Category & Pricing</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            <div className="lg:col-span-3">
                                <label className='text-xs font-medium text-gray-700 mb-1.5 block'>Category <span className='text-red-500'>*</span></label>
                                <ProductCategorySelector
                                    categories={context?.catData || []}
                                    selectedMain={productCat}
                                    selectedSub={productSubCat}
                                    selectedThird={productThirdLavelCat}
                                    onMainChange={(id) => {
                                        const cat = context?.catData?.find(c => c._id === id);
                                        setProductCat(id);
                                        formFields.catId = id;
                                        formFields.category = id;
                                        formFields.catName = cat?.name || '';
                                        setProductSubCat('');
                                        formFields.subCatId = '';
                                        formFields.subCat = '';
                                        setProductThirdLavelCat('');
                                        formFields.thirdsubCatId = '';
                                        formFields.thirdsubCat = '';
                                    }}
                                    onSubChange={(id) => {
                                        const mainCat = context?.catData?.find(c => c._id === productCat);
                                        const subCat = mainCat?.children?.find(s => s._id === id);
                                        setProductSubCat(id);
                                        formFields.subCatId = id;
                                        formFields.subCat = subCat?.name || '';
                                        setProductThirdLavelCat('');
                                        formFields.thirdsubCatId = '';
                                        formFields.thirdsubCat = '';
                                    }}
                                    onThirdChange={(id) => {
                                        const mainCat = context?.catData?.find(c => c._id === productCat);
                                        const subCat = mainCat?.children?.find(s => s._id === productSubCat);
                                        const thirdCat = subCat?.children?.find(t => t._id === id);
                                        setProductThirdLavelCat(id);
                                        formFields.thirdsubCatId = id;
                                        formFields.thirdsubCat = thirdCat?.name || '';
                                    }}
                                    showThirdLevel={false}
                                />
                            </div>

                            {formFields.productType === 'simple' && (
                                <>
                                    <div>
                                        <label className='text-xs font-medium text-gray-700 mb-1.5 block'>Sale Price <span className='text-red-500'>*</span></label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">$</span>
                                            <input type="number" className='w-full h-9 border border-gray-300 rounded-lg pl-7 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 transition-shadow' name="price" value={formFields.price} onChange={onChangeInput} placeholder="0.00" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className='text-xs font-medium text-gray-700 mb-1.5 block'>Regular Price</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">$</span>
                                            <input type="number" className='w-full h-9 border border-gray-300 rounded-lg pl-7 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 transition-shadow' name="oldPrice" value={formFields.oldPrice} onChange={onChangeInput} placeholder="0.00" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className='text-xs font-medium text-gray-700 mb-1.5 block'>Stock <span className='text-red-500'>*</span></label>
                                        <input type="number" className='w-full h-9 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 transition-shadow' name="countInStock" value={formFields.countInStock} onChange={onChangeInput} placeholder="0" />
                                    </div>
                                    {discountPercent > 0 && (
                                        <div className='lg:col-span-3 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2'>
                                            <span className='text-green-700 font-medium text-xs'>
                                                {discountPercent}% OFF &mdash; Save ${Number(formFields.oldPrice - formFields.price).toFixed(2)}
                                            </span>
                                        </div>
                                    )}
                                </>
                            )}

                            {formFields.productType === 'variant' && (
                                <div className="lg:col-span-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                                    <span className='text-xs text-gray-600'>Variant product: Set prices per variant after saving.</span>
                                </div>
                            )}

                            <div>
                                <label className='text-xs font-medium text-gray-700 mb-1.5 block'>Brand</label>
                                <input type="text" className='w-full h-9 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 transition-shadow' name="brand" value={formFields.brand} onChange={onChangeInput} placeholder="Brand name" />
                            </div>
                            <div>
                                <label className='text-xs font-medium text-gray-700 mb-1.5 block'>Featured</label>
                                <Select size="small" className='w-full h-9 [&_.MuiSelect-select]:!py-1.5' value={productFeatured} onChange={handleChangeProductFeatured}>
                                    <MenuItem value={true}>Yes</MenuItem>
                                    <MenuItem value={false}>No</MenuItem>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Product Options */}
                    <div className='bg-white rounded-xl border border-gray-200 p-4 sm:p-5'>
                        <div className="mb-4 pb-2 border-b border-gray-100">
                            <h2 className='text-sm font-semibold text-gray-900'>Product Options</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            <div>
                                <div className='flex items-center justify-between mb-1.5'>
                                    <label className='text-xs font-medium text-gray-700'>RAM</label>
                                    <button
                                        type="button"
                                        onClick={() => setManageModal('rams')}
                                        className='text-[10px] text-gray-500 hover:text-gray-800 font-medium'
                                    >
                                        Manage
                                    </button>
                                </div>
                                <Select
                                    size="small"
                                    className='w-full h-9 [&_.MuiSelect-select]:!py-1.5'
                                    value={productRams[0] || ''}
                                    onChange={(e) => {
                                        setProductRams([e.target.value]);
                                        setFormFields(prev => ({ ...prev, productRam: [e.target.value] }));
                                    }}
                                    displayEmpty
                                >
                                    <MenuItem value=""><em>Select</em></MenuItem>
                                    {productRamsData?.map((item, index) => (
                                        <MenuItem key={index} value={item?.name}>{item.name}</MenuItem>
                                    ))}
                                </Select>
                            </div>
                            <div>
                                <div className='flex items-center justify-between mb-1.5'>
                                    <label className='text-xs font-medium text-gray-700'>Weight</label>
                                    <button
                                        type="button"
                                        onClick={() => setManageModal('weight')}
                                        className='text-[10px] text-gray-500 hover:text-gray-800 font-medium'
                                    >
                                        Manage
                                    </button>
                                </div>
                                <Select
                                    size="small"
                                    className='w-full h-9 [&_.MuiSelect-select]:!py-1.5'
                                    value={productWeight[0] || ''}
                                    onChange={(e) => {
                                        setProductWeight([e.target.value]);
                                        setFormFields(prev => ({ ...prev, productWeight: [e.target.value] }));
                                    }}
                                    displayEmpty
                                >
                                    <MenuItem value=""><em>Select</em></MenuItem>
                                    {productWeightData?.map((item, index) => (
                                        <MenuItem key={index} value={item?.name}>{item.name}</MenuItem>
                                    ))}
                                </Select>
                            </div>
                            <div>
                                <div className='flex items-center justify-between mb-1.5'>
                                    <label className='text-xs font-medium text-gray-700'>Size</label>
                                    <button
                                        type="button"
                                        onClick={() => setManageModal('size')}
                                        className='text-[10px] text-gray-500 hover:text-gray-800 font-medium'
                                    >
                                        Manage
                                    </button>
                                </div>
                                <Select
                                    size="small"
                                    className='w-full h-9 [&_.MuiSelect-select]:!py-1.5'
                                    value={productSize[0] || ''}
                                    onChange={(e) => {
                                        setProductSize([e.target.value]);
                                        setFormFields(prev => ({ ...prev, size: [e.target.value] }));
                                    }}
                                    displayEmpty
                                >
                                    <MenuItem value=""><em>Select</em></MenuItem>
                                    {productSizeData?.map((item, index) => (
                                        <MenuItem key={index} value={item?.name}>{item.name}</MenuItem>
                                    ))}
                                </Select>
                            </div>
                            <div>
                                <div className='flex items-center justify-between mb-1.5'>
                                    <label className='text-xs font-medium text-gray-700'>Color</label>
                                    <button
                                        type="button"
                                        onClick={() => setManageModal('color')}
                                        className='text-[10px] text-gray-500 hover:text-gray-800 font-medium'
                                    >
                                        Manage
                                    </button>
                                </div>
                                <Select
                                    size="small"
                                    className='w-full h-9 [&_.MuiSelect-select]:!py-1.5'
                                    value={productColor[0] || ''}
                                    onChange={(e) => {
                                        setProductColor([e.target.value]);
                                        setFormFields(prev => ({ ...prev, color: [e.target.value] }));
                                    }}
                                    displayEmpty
                                >
                                    <MenuItem value=""><em>Select</em></MenuItem>
                                    {productColorData?.map((item, index) => (
                                        <MenuItem key={index} value={item?.name}>{item.name}</MenuItem>
                                    ))}
                                </Select>
                            </div>
                            <div>
                                <div className='flex items-center justify-between mb-1.5'>
                                    <label className='text-xs font-medium text-gray-700'>Material</label>
                                    <button
                                        type="button"
                                        onClick={() => setManageModal('materials')}
                                        className='text-[10px] text-gray-500 hover:text-gray-800 font-medium'
                                    >
                                        Manage
                                    </button>
                                </div>
                                <Select
                                    size="small"
                                    className='w-full h-9 [&_.MuiSelect-select]:!py-1.5'
                                    value={productMaterials[0] || ''}
                                    onChange={(e) => {
                                        setProductMaterials([e.target.value]);
                                        setFormFields(prev => ({ ...prev, productMaterials: [e.target.value] }));
                                    }}
                                    displayEmpty
                                >
                                    <MenuItem value=""><em>Select</em></MenuItem>
                                    {productMaterialsData?.map((item, index) => (
                                        <MenuItem key={index} value={item?.name}>{item.name}</MenuItem>
                                    ))}
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* SEO Settings */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
                        <div className="mb-4 pb-2 border-b border-gray-100">
                            <h2 className='text-sm font-semibold text-gray-900'>SEO Settings</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className='text-xs font-medium text-gray-700 mb-1.5 block'>URL Slug</label>
                                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-gray-400">
                                    <span className="bg-gray-100 text-gray-500 text-xs px-2.5 h-9 flex items-center border-r border-gray-300">/product/</span>
                                    <input 
                                        type="text" 
                                        className='flex-1 h-9 border-0 text-sm px-3 focus:outline-none' 
                                        name="slug" 
                                        value={formFields.slug} 
                                        onChange={onChangeInput}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className='text-xs font-medium text-gray-700 mb-1.5 block'>Meta Title</label>
                                <input 
                                    type="text" 
                                    className='w-full h-9 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 transition-shadow' 
                                    name="metaTitle" 
                                    value={formFields.metaTitle} 
                                    onChange={onChangeInput}
                                />
                            </div>
                            <div>
                                <label className='text-xs font-medium text-gray-700 mb-1.5 block'>Meta Description <span className='text-gray-400 font-normal'>({formFields.metaDescription?.length || 0}/160)</span></label>
                                <textarea 
                                    className='w-full h-16 border border-gray-300 rounded-lg text-sm p-2.5 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-shadow resize-none' 
                                    name="metaDescription" 
                                    value={formFields.metaDescription} 
                                    onChange={onChangeInput}
                                    maxLength={160}
                                />
                            </div>
                            <div>
                                <label className='text-xs font-medium text-gray-700 mb-1.5 block'>Keywords</label>
                                <textarea 
                                    className='w-full h-16 border border-gray-300 rounded-lg text-sm p-2.5 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-shadow resize-none' 
                                    name="keywords" 
                                    value={formFields.keywords} 
                                    onChange={onChangeInput}
                                    placeholder="keyword1, keyword2"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Product Images */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                            <div>
                                <h2 className='text-sm font-semibold text-gray-900'>Product Images</h2>
                                <p className='text-xs text-gray-500 mt-0.5'>Upload photos and click the star to set primary image.</p>
                            </div>
                            {previews.length > 0 && (
                                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                                    {previews.length} image{previews.length > 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {previews?.map((image, index) => (
                                <div className="relative group" key={index}>
                                    <div className={`relative aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 transition-all duration-300 ${index === primaryIndex ? 'border-amber-400 shadow-lg shadow-amber-100' : 'border-gray-200 group-hover:border-gray-300'}`}>
                                        <img src={image} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                                            <button
                                                type="button"
                                                onClick={() => setAsFirstImage(index)}
                                                className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 ${index === primaryIndex ? 'bg-amber-400 text-white' : 'bg-white/90 text-gray-600 hover:bg-amber-50'}`}
                                                title={index === primaryIndex ? 'Primary image' : 'Set as primary'}
                                            >
                                                <FaStar className="text-[11px]" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeImg(image, index)}
                                                className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:bg-red-50 transition-all duration-200 hover:scale-110"
                                                title="Remove"
                                            >
                                                <IoMdClose className="text-[13px] text-red-500" />
                                            </button>
                                        </div>
                                        {index === primaryIndex && (
                                            <div className="absolute top-2 left-2 bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                                                <FaStar className="text-[9px]" />
                                                Primary
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <UploadBox multiple={true} name="images" url="/api/product/uploadImages" setPreviewsFun={setPreviewsFun} />
                        </div>
                    </div>

                    {/* Banner Images */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                            <div>
                                <h2 className='text-sm font-semibold text-gray-900'>Banner Images</h2>
                                <p className='text-xs text-gray-500 mt-0.5'>Display on home banner</p>
                            </div>
                            <Switch {...label} onChange={handleChangeSwitch} checked={checkedSwitch} size="small" />
                        </div>
                        {checkedSwitch && (
                            <>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 mb-3">
                                    {bannerPreviews?.map((image, index) => (
                                        <div className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200" key={index}>
                                            <img src={image} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeBannerImg(image, index)}
                                                    className="w-7 h-7 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow hover:scale-110 transform"
                                                    title="Remove"
                                                >
                                                    <IoMdClose className="w-3.5 h-3.5 text-red-600" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <UploadBox multiple={true} name="bannerimages" url="/api/product/uploadBannerImages" setPreviewsFun={setBannerImagesFun} />
                                </div>
                                <div>
                                    <label className='text-xs font-medium text-gray-700 mb-1.5 block'>Banner Title</label>
                                    <input type="text" className='w-full h-9 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 transition-shadow' name="bannerTitleName" value={formFields.bannerTitleName} onChange={onChangeInput} placeholder="Enter banner title..." />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <div className='sticky bottom-0 bg-white py-3 -mx-4 md:-mx-6 px-4 md:px-6 -mb-4 md:-mb-6 border-t border-gray-200 shadow-sm'>
                    <Button 
                        type="submit" 
                        className="w-full !h-10 !text-sm !font-semibold !rounded-lg !bg-gray-900 !text-white hover:!bg-gray-800 transition-colors"
                        disabled={isLoading}
                    >
                        {isLoading ? <CircularProgress color="inherit" size={18} /> : (
                            <>
                                <FaCloudUploadAlt className='text-base mr-2' />
                                Add Product
                            </>
                        )}
                    </Button>
                </div>
            </form>

            {showVariantManager && createdProductId && (
                <VariantManager 
                    productId={createdProductId} 
                    onClose={() => {
                        setShowVariantManager(false);
                        setCreatedProductId(null);
                        context.setIsOpenFullScreenPanel({ open: false });
                        history("/products");
                    }}
                />
            )}

            <ManageAttributeModal
                open={manageModal === 'rams'}
                onClose={() => setManageModal(null)}
                title="Manage RAM Options"
                options={productRamsData}
                onDataUpdate={setProductRamsData}
                baseApiPath="/api/product/productRAMS"
            />
            <ManageAttributeModal
                open={manageModal === 'weight'}
                onClose={() => setManageModal(null)}
                title="Manage Weight Options"
                options={productWeightData}
                onDataUpdate={setProductWeightData}
                baseApiPath="/api/product/productWeight"
            />
            <ManageAttributeModal
                open={manageModal === 'size'}
                onClose={() => setManageModal(null)}
                title="Manage Size Options"
                options={productSizeData}
                onDataUpdate={setProductSizeData}
                baseApiPath="/api/product/productSize"
            />
            <ManageAttributeModal
                open={manageModal === 'color'}
                onClose={() => setManageModal(null)}
                title="Manage Color Options"
                options={productColorData}
                onDataUpdate={setProductColorData}
                baseApiPath="/api/product/productColor"
            />
            <ManageAttributeModal
                open={manageModal === 'materials'}
                onClose={() => setManageModal(null)}
                title="Manage Material Options"
                options={productMaterialsData}
                onDataUpdate={setProductMaterialsData}
                baseApiPath="/api/product/productMaterials"
            />
        </section>
    )
}

export default AddProduct;
