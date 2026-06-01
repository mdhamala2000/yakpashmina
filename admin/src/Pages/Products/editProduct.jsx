import React, { useContext, useEffect, useState } from 'react'
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import UploadBox from '../../Components/UploadBox';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { IoMdClose } from "react-icons/io";
import { Button } from '@mui/material';
import { FaCloudUploadAlt, FaStar } from "react-icons/fa";
import { MyContext } from '../../App';
import { deleteImages, editData, fetchDataFromApi, postData } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Switch from '@mui/material/Switch';
import ProductCategorySelector from '../../Components/ProductCategorySelector';
import MultiSelectDropdown from '../../Components/MultiSelectDropdown';
import VariantManager from '../../Components/VariantManager';
import ProductImagesByColor from '../../Components/ProductImagesByColor';

const label = { inputProps: { 'aria-label': 'Switch demo' } };



const EditProduct = () => {

    const [formFields, setFormFields] = useState({
        name: "",
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
        bannerTitleName: '',
        bannerimages: [],
        isDisplayOnHomeBanner: false,
        // SEO Fields
        slug: "",
        metaTitle: "",
        metaDescription: "",
        keywords: "",
        productType: "simple"

    })


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
    const [hasVariants, setHasVariants] = useState(false);
    const [productId, setProductId] = useState(null);
    const [variantImages, setVariantImages] = useState([]);
    const [variantColorOptions, setVariantColorOptions] = useState([]);

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

        fetchDataFromApi(`/api/product/${context?.isOpenFullScreenPanel?.id}`).then((res) => {

            const product = res?.product;
            setProductId(product?._id);
            setHasVariants(product?.hasVariants || false);

            const isVariant = product?.hasVariants === true;
            setFormFields({
                name: product?.name,
                description: product?.description,
                images: product?.images,
                brand: product?.brand,
                price: isVariant ? 0 : (product?.price || ''),
                oldPrice: isVariant ? 0 : (product?.oldPrice || ''),
                category: product?.category,
                catName: product?.catName,
                catId: product?.catId,
                subCatId: product?.subCatId,
                subCat: product?.subCat,
                thirdsubCat: product?.thirdsubCat,
                thirdsubCatId: product?.thirdsubCatId,
                countInStock: isVariant ? 0 : (product?.countInStock || ''),
                isFeatured: product?.isFeatured,
                discount: product?.discount || 0,
                shortDescription: product?.shortDescription || '',
                productRam: product?.productRam,
                size: product?.size,
                productWeight: product?.productWeight,
                color: product?.color || [],
                materials: product?.materials || '',
                productMaterials: product?.productMaterials || [],
                bannerTitleName: product?.bannerTitleName,
                bannerimages: product?.bannerimages,
                isDisplayOnHomeBanner: product?.isDisplayOnHomeBanner,
                sku: product?.sku || '',
                slug: product?.slug || '',
                metaTitle: product?.metaTitle || '',
                metaDescription: product?.metaDescription || '',
                keywords: product?.keywords || '',
                productType: isVariant ? 'variant' : 'simple'
            })


            setProductCat(product?.catId);
            setProductSubCat(product?.subCatId);
            setProductThirdLavelCat(product?.thirdsubCatId);
            setProductFeatured(product?.isFeatured)
            setProductRams(product?.productRam ? product?.productRam : [])
            setProductSize(product?.size ? product?.size : [])
            setProductWeight(product?.productWeight ? product?.productWeight : []);
            setProductColor(Array.isArray(product?.color) ? product?.color : []);
            setProductMaterials(Array.isArray(product?.productMaterials) ? product?.productMaterials : []);
            setCheckedSwitch(product?.isDisplayOnHomeBanner)

            setPreviews(product?.images);
            setPrimaryIndex(0);
            setBannerPreviews(product?.bannerimages);

            // Fetch variant images & color options for variant products
            if (product?.hasVariants && product?._id) {
                fetchDataFromApi(`/api/variant/images/${product._id}`).then(res => {
                    if (res?.success) setVariantImages(res.images || []);
                }).catch(() => {});

                fetchDataFromApi(`/api/variant/product/${product._id}`).then(res => {
                    if (res?.success && res?.variants?.length) {
                        const colors = new Set();
                        res.variants.forEach(v => {
                            if (v.options) {
                                Object.entries(v.options).forEach(([key, val]) => {
                                    if (key.toLowerCase() === 'color') colors.add(val);
                                });
                            }
                        });
                        setVariantColorOptions(Array.from(colors));
                    }
                }).catch(() => {});
            }

        })
    }, []);

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
        const { target: { value } } = event;
        const ramValue = typeof value === "string" ? value.split(",") : value;
        setProductRams(ramValue);
        setFormFields(prev => ({ ...prev, productRam: ramValue }));
    };

    const handleChangeProductWeight = (event) => {
        const { target: { value } } = event;
        const weightValue = typeof value === "string" ? value.split(",") : value;
        setProductWeight(weightValue);
        setFormFields(prev => ({ ...prev, productWeight: weightValue }));
    };

    const handleChangeProductSize = (event) => {
        const { target: { value } } = event;
        const sizeValue = typeof value === "string" ? value.split(",") : value;
        setProductSize(sizeValue);
        setFormFields(prev => ({ ...prev, size: sizeValue }));
    };

    const handleChangeProductColor = (value) => {
        setProductColor(value);
        setFormFields(prev => ({ ...prev, color: value }));
    };

    const handleChangeProductMaterials = (value) => {
        setProductMaterials(value);
        setFormFields(prev => ({ ...prev, productMaterials: value }));
    };

    const onChangeInput = (e) => {
        const { name, value } = e.target;
        setFormFields(() => {
            return {
                ...formFields,
                [name]: value
            }
        })
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



        if (formFields.productType !== 'variant') {
            if (formFields?.price === "") {
                context.alertBox("error", "Please enter a sale price");
                return false;
            }

            if (formFields?.oldPrice && formFields?.price && Number(formFields.price) > Number(formFields.oldPrice)) {
                context.alertBox("error", "Sale price cannot be higher than regular price");
                return false;
            }

            if (formFields?.countInStock === "") {
                context.alertBox("error", "Please enter  product stock");
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

        const submitImages = [...previews];
        const primaryImg = submitImages.splice(primaryIndex, 1)[0];
        submitImages.unshift(primaryImg);

        const submitData = {
            ...formFields,
            images: submitImages,
            hasVariants: formFields.productType === 'variant',
            countInStock: formFields.productType === 'variant' ? 0 : formFields.countInStock,
            price: formFields.productType === 'variant' ? 0 : formFields.price,
            oldPrice: formFields.productType === 'variant' ? 0 : formFields.oldPrice,
        };

        editData(`/api/product/updateProduct/${context?.isOpenFullScreenPanel?.id}`, submitData).then((res) => {

            console.log(res)
            if (res?.error === false) {
                context.alertBox("success", res?.message);
                setTimeout(() => {
                    setIsLoading(false);
                    context.setIsOpenFullScreenPanel({
                        open: false,
                    })
                    history("/products");
                }, 1000);
            } else {
                setIsLoading(false);
                context.alertBox("error", res?.message);
            }
        })
    }

return (
        <section className='p-4 md:p-6 bg-gray-50 min-h-screen'>
            <form onSubmit={handleSubmitg}>
                <div className='max-h-[85vh] overflow-y-auto pr-2 pb-32 space-y-5'>

                    {/* Section 1: Basic Info - Enhanced */}
                    <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5'>
                        <div className='flex items-center gap-2.5 mb-4'>
                            <div className='w-9 h-9 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-sm'>
                                <span className='text-lg'>📦</span>
                            </div>
                            <div>
                                <h2 className='text-base font-semibold text-gray-800'>Basic Information</h2>
                                <p className='text-xs text-gray-500'>Name and description</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className='text-xs font-medium text-gray-700 mb-1 block'>Product Name <span className='text-red-500'>*</span></label>
                                <input type="text" className='w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500' name="name" value={formFields.name} onChange={onChangeInput} placeholder="Enter product name" />
                            </div>
                            <div>
                                <label className='text-xs font-medium text-gray-700 mb-1 block'>Brand</label>
                                <input type="text" className='w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500' name="brand" value={formFields.brand} onChange={onChangeInput} placeholder="Brand name" />
                            </div>
                            <div className="md:col-span-2">
                                <label className='text-xs font-medium text-gray-700 mb-1 block'>Short Description</label>
                                <input type="text" className='w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500' name="shortDescription" value={formFields.shortDescription} onChange={onChangeInput} placeholder="Brief summary..." />
                            </div>
                            <div className="md:col-span-2">
                                <label className='text-xs font-medium text-gray-700 mb-1 block'>Full Description</label>
                                <textarea className='w-full h-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none' name="description" value={formFields.description} onChange={onChangeInput} placeholder="Detailed description..." />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Product Type - Enhanced */}
                    <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5'>
                        <div className='flex items-center gap-2.5 mb-4'>
                            <div className='w-9 h-9 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center shadow-sm'>
                                <span className='text-lg'>🏷️</span>
                            </div>
                            <div>
                                <h2 className='text-base font-semibold text-gray-800'>Product Type</h2>
                                <p className='text-xs text-gray-500'>Select product type</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormFields(prev => ({ ...prev, productType: 'simple' }))}
                                className={`p-4 rounded-xl border-2 text-center transition-all ${formFields.productType === 'simple' ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                            >
                                <div className='w-12 h-12 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center'>
                                    <span className='text-xl'>📦</span>
                                </div>
                                <h3 className='font-semibold text-sm text-gray-800'>Simple</h3>
                                <p className='text-xs text-gray-500 mt-0.5'>One price, one SKU</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormFields(prev => ({ ...prev, productType: 'variant' }))}
                                className={`p-4 rounded-xl border-2 text-center transition-all ${formFields.productType === 'variant' ? 'border-purple-500 bg-purple-50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                            >
                                <div className='w-12 h-12 mx-auto mb-2 rounded-full bg-purple-100 flex items-center justify-center'>
                                    <span className='text-xl'>🎨</span>
                                </div>
                                <h3 className='font-semibold text-sm text-gray-800'>Variant</h3>
                                <p className='text-xs text-gray-500 mt-0.5'>Multiple options</p>
                            </button>
                        </div>
                    </div>

                    {/* Section 3: Category - Enhanced */}
                    <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5'>
                        <div className='flex items-center gap-2.5 mb-4'>
                            <div className='w-9 h-9 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center shadow-sm'>
                                <span className='text-lg'>📂</span>
                            </div>
                            <div>
                                <h2 className='text-base font-semibold text-gray-800'>Category</h2>
                                <p className='text-xs text-gray-500'>Select category</p>
                            </div>
                        </div>
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

{/* Section 4: Pricing & Stock - Enhanced */}
                    <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5'>
                        <div className='flex items-center gap-2.5 mb-4'>
                            <div className='w-9 h-9 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center shadow-sm'>
                                <span className='text-lg'>💰</span>
                            </div>
                            <div>
                                <h2 className='text-base font-semibold text-gray-800'>Pricing & Stock</h2>
                                <p className='text-xs text-gray-500'>Price and inventory</p>
                            </div>
                        </div>
                        
                        {formFields.productType === 'simple' ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label className='text-xs font-medium text-gray-700 mb-1 block'>Sale Price <span className='text-red-500'>*</span></label>
                                    <input type="number" className='w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500' name="price" value={formFields.price} onChange={onChangeInput} placeholder="0.00" />
                                </div>
                                <div>
                                    <label className='text-xs font-medium text-gray-700 mb-1 block'>Regular Price</label>
                                    <input type="number" className='w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500' name="oldPrice" value={formFields.oldPrice} onChange={onChangeInput} placeholder="0.00" />
                                </div>
                                <div>
                                    <label className='text-xs font-medium text-gray-700 mb-1 block'>Stock <span className='text-red-500'>*</span></label>
                                    <input type="number" className='w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500' name="countInStock" value={formFields.countInStock} onChange={onChangeInput} placeholder="0" />
                                </div>
                            </div>
                        ) : (
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                <span className='text-xs text-purple-700'>Variant product - prices and stock managed per variant</span>
                            </div>
                        )}
                        
                        <div className="mt-3">
                            <label className='text-xs font-medium text-gray-700 mb-1 block'>Featured?</label>
                            <Select size="small" className='w-full md:w-1/2 h-10' value={productFeatured} onChange={handleChangeProductFeatured}>
                                <MenuItem value={true}>Yes - Show on Home</MenuItem>
                                <MenuItem value={false}>No</MenuItem>
                            </Select>
                        </div>
                    </div>

                    {/* Section 5: Product Options - Enhanced */}
                    <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5'>
                        <div className='flex items-center gap-2.5 mb-4'>
                            <div className='w-9 h-9 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center shadow-sm'>
                                <span className='text-lg'>⚙️</span>
                            </div>
                            <div>
                                <h2 className='text-base font-semibold text-gray-800'>Product Options</h2>
                                <p className='text-xs text-gray-500'>RAM, size, color, materials</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            <div>
                                <label className='text-xs font-medium text-gray-700 mb-1 block'>RAM</label>
                                <Select size="small" className='w-full h-10' value={productRams[0] || ''} onChange={(e) => { setProductRams([e.target.value]); setFormFields(prev => ({ ...prev, productRam: [e.target.value] })); }} displayEmpty>
                                    <MenuItem value=""><em>Select</em></MenuItem>
                                    {productRamsData?.map((item, index) => <MenuItem key={index} value={item?.name}>{item.name}</MenuItem>)}
                                </Select>
                            </div>
                            <div>
                                <label className='text-xs font-medium text-gray-700 mb-1 block'>Size</label>
                                <MultiSelectDropdown label="" options={productSizeData.map(item => item?.name)} selected={productSize} onChange={(val) => { setProductSize(val); setFormFields(prev => ({ ...prev, size: val })); }} onAddNew={handleAddSize} placeholder="Select size" />
                            </div>
                            <div>
                                <label className='text-xs font-medium text-gray-700 mb-1 block'>Color</label>
                                <MultiSelectDropdown label="" options={productColorData.map(item => item?.name)} selected={productColor} onChange={(val) => { setProductColor(val); setFormFields(prev => ({ ...prev, color: val })); }} onAddNew={handleAddColor} placeholder="Select color" />
                            </div>
                            <div>
                                <label className='text-xs font-medium text-gray-700 mb-1 block'>Weight</label>
                                <MultiSelectDropdown label="" options={productWeightData.map(item => item?.name)} selected={productWeight} onChange={(val) => { setProductWeight(val); setFormFields(prev => ({ ...prev, productWeight: val })); }} onAddNew={handleAddWeight} placeholder="Select weight" />
                            </div>
                            <div>
                                <label className='text-xs font-medium text-gray-700 mb-1 block'>Material</label>
                                <MultiSelectDropdown label="" options={productMaterialsData.map(item => item?.name)} selected={productMaterials} onChange={(val) => { setProductMaterials(val); setFormFields(prev => ({ ...prev, productMaterials: val })); }} onAddNew={handleAddMaterial} placeholder="Select material" />
                            </div>
                        </div>
                    </div>

                    {/* Section 6: Images - Enhanced */}
                    <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5'>
                        <div className='flex items-center gap-2.5 mb-4'>
                            <div className='w-9 h-9 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center shadow-sm'>
                                <span className='text-lg'>🖼️</span>
                            </div>
                            <div className='flex-1'>
                                <h2 className='text-base font-semibold text-gray-800'>Product Images</h2>
                                <p className='text-xs text-gray-500'>Upload photos and click the star to set primary image.</p>
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

                    {/* Product Images by Color (for variant products) */}
                    {(hasVariants || formFields.productType === 'variant') && productId && (
                        <ProductImagesByColor
                            productId={productId}
                            images={variantImages}
                            productImageUrls={previews || []}
                            colorOptions={variantColorOptions}
                            onRefresh={() => {
                                fetchDataFromApi(`/api/variant/images/${productId}`).then(res => {
                                    if (res?.success) setVariantImages(res.images || []);
                                }).catch(() => {});
                                fetchDataFromApi(`/api/variant/product/${productId}`).then(res => {
                                    if (res?.success && res?.variants?.length) {
                                        const colors = new Set();
                                        res.variants.forEach(v => {
                                            if (v.options) {
                                                Object.entries(v.options).forEach(([key, val]) => {
                                                    if (key.toLowerCase() === 'color') colors.add(val);
                                                });
                                            }
                                        });
                                        setVariantColorOptions(Array.from(colors));
                                    }
                                }).catch(() => {});
                            }}
                            onSetPrimary={async (imageId, color) => {
                                try {
                                    await postData(`/api/variant/images/set-primary/${productId}`, { imageId });
                                    const data = await fetchDataFromApi(`/api/variant/images/${productId}`);
                                    if (data?.success) {
                                        setVariantImages(data.images || []);
                                        const primaryImg = data.images?.find(i => i.isPrimary);
                                        if (primaryImg && previews) {
                                            const reordered = [primaryImg.url, ...previews.filter(u => u !== primaryImg.url)];
                                            setPreviews(reordered);
                                            formFields.images = reordered;
                                        }
                                    }
                                } catch (err) {
                                    console.error(err);
                                }
                            }}
                            onAddToProductImages={(urls) => {
                                if (urls?.length) {
                                    const updated = [...(previews || []), ...urls];
                                    setPreviews(updated);
                                    formFields.images = updated;
                                }
                            }}
                        />
                    )}

                    {/* Section 7: Banner - Enhanced */}
                    <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5'>
                        <div className='flex items-center justify-between mb-4'>
                            <div className='flex items-center gap-2.5'>
                                <div className='w-9 h-9 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl flex items-center justify-center shadow-sm'>
                                    <span className='text-lg'>🎯</span>
                                </div>
                                <div>
                                    <h2 className='text-base font-semibold text-gray-800'>Banner Images</h2>
                                    <p className='text-xs text-gray-500'>Display on home banner</p>
                                </div>
                            </div>
                            <Switch {...label} onChange={handleChangeSwitch} checked={checkedSwitch} />
                        </div>
                        {checkedSwitch && (
                            <>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-3">
                                    {bannerPreviews?.map((image, index) => (
                                        <div className="relative group" key={index}>
                                            <span className='absolute w-5 h-5 rounded-full bg-red-600 -top-1 -right-1 z-40 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity shadow-md' onClick={() => removeBannerImg(image, index)}>
                                                <IoMdClose className='text-white text-xs' />
                                            </span>
                                            <div className='h-24 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50'>
                                                <img src={image} className='w-full h-full object-cover' />
                                            </div>
                                        </div>
                                    ))}
                                    <UploadBox multiple={true} name="bannerimages" url="/api/product/uploadBannerImages" setPreviewsFun={setBannerImagesFun} />
                                </div>
                                <div>
                                    <label className='text-xs font-medium text-gray-700 mb-1 block'>Banner Title</label>
                                    <input type="text" className='w-full h-10 border border-gray-300 rounded-lg text-sm px-3 focus:outline-none focus:ring-2 focus:ring-teal-500' name="bannerTitleName" value={formFields.bannerTitleName} onChange={onChangeInput} placeholder="Enter banner title..." />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Submit Button - Enhanced */}
                    <div className='sticky bottom-0 bg-white py-3 -mx-4 md:-mx-6 px-4 md:px-6 -mb-4 md:-mb-6 border-t border-gray-200 shadow-lg'>
                        <div className="flex gap-3">
                            {(hasVariants || formFields.productType === 'variant') && (
                                <Button variant="outlined" onClick={() => setShowVariantManager(true)} className="!border-indigo-500 !text-indigo-600 !h-12 !text-sm !font-semibold !rounded-xl">
                                    Manage Variants
                                </Button>
                            )}
                            <Button type="submit" className="flex-1 !h-12 !text-sm !font-semibold !rounded-xl !bg-gradient-to-r !from-blue-600 !to-indigo-600 !text-white !shadow-md" disabled={isLoading}>
                                {isLoading ? <CircularProgress color="inherit" size={20} /> : (
                                    <>
                                        <FaCloudUploadAlt className='text-lg mr-2' />
                                        Update Product
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>

            {showVariantManager && productId && (
                <VariantManager 
                    productId={productId} 
                    onClose={() => setShowVariantManager(false)}
                />
            )}
        </section>
    )
}

export default EditProduct;
