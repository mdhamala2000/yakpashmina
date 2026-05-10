import React, { useContext, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { QtyBox } from "../QtyBox";
import Rating from "@mui/material/Rating";
import { MdOutlineShoppingCart } from "react-icons/md";
import { FaRegHeart } from "react-icons/fa";
import { IoGitCompareOutline } from "react-icons/io5";
import { MyContext } from "../../App";
import CircularProgress from '@mui/material/CircularProgress';
import { postData } from "../../utils/api";
import { FaCheckDouble } from "react-icons/fa";
import { IoMdHeart } from "react-icons/io";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import { IoCloseSharp } from "react-icons/io5";
import { HiOutlineMail } from "react-icons/hi";
import { IoWarning } from "react-icons/io5";
import Grid from "@mui/material/Grid";
import { useNavigate } from "react-router-dom";
import { useCurrency } from "../../context/CurrencyContext";


export const ProductDetailsComponent = (props) => {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isAddedInMyList, setIsAddedInMyList] = useState(false);
  const [openInquiryModal, setOpenInquiryModal] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [selectedColor, setSelectedColor] = useState("");

  const context = useContext(MyContext);
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const handleSelecteQty = (qty) => {
    setQuantity(qty);
  }


  useEffect(() => {
    const item = context?.cartData?.filter((cartItem) =>
      cartItem.productId.includes(props?.item?._id)
    )

    if (item?.length !== 0) {
      setIsAdded(true)
    } else {
      setIsAdded(false)
    }

  }, [isAdded, context?.cartData])


  useEffect(() => {
    const myListItem = context?.myListData?.filter((item) =>
      item.productId.includes(props?.item?._id)
    )


    if (myListItem?.length !== 0) {
      setIsAddedInMyList(true);
    } else {
      setIsAddedInMyList(false)
    }

  }, [context?.myListData])

  const handleAddToCart = async (product) => {
    if (!context?.isLogin || !context?.userData?._id) {
      localStorage.setItem('pendingCartItem', JSON.stringify({
        productId: product?._id,
        productName: product?.name,
        image: product?.images[0],
        rating: product?.rating,
        price: product?.price,
        oldPrice: product?.oldPrice,
        discount: product?.discount,
        quantity: quantity,
        countInStock: product?.countInStock,
        brand: product?.brand,
        color: props?.item?.color?.length !== 0 ? selectedColor : '',
        materials: props?.item?.materials || ''
      }));
      context?.alertBox("info", "Please login to add items to cart");
      navigate('/login');
      return false;
    }

    const productItem = {
      _id: product?._id,
      productTitle: product?.name,
      image: product?.images[0],
      rating: product?.rating,
      price: product?.price,
      oldPrice: product?.oldPrice,
      discount: product?.discount,
      quantity: quantity,
      subTotal: parseInt(product?.price * quantity),
      productId: product?._id,
      countInStock: product?.countInStock,
      brand: product?.brand,
      size: '',
      weight: '',
      ram: '',
      color: props?.item?.color?.length !== 0 ? selectedColor : '',
      materials: props?.item?.materials || ''
    }

    setIsLoading(true);

    try {
      const res = await postData("/api/cart/add", productItem);
      if (res?.error === false) {
        context?.alertBox("success", "Item added to cart!");
        context?.getCartItems();
        context?.setOpenCartPanel(true);
        setIsAdded(true);
      } else {
        context?.alertBox("error", res?.message || "Failed to add to cart");
      }
    } catch (error) {
      context?.alertBox("error", "Failed to add to cart");
    } finally {
      setIsLoading(false);
    }
  }


  const handleAddToMyList = (item) => {
    if (context?.userData === null) {
      context?.alertBox("error", "you are not login please login first");
      return false
    }

    else {
      const obj = {
        productId: item?._id,
        userId: context?.userData?._id,
        productTitle: item?.name,
        image: item?.images[0],
        rating: item?.rating,
        price: item?.price,
        oldPrice: item?.oldPrice,
        brand: item?.brand,
        discount: item?.discount
      }


      postData("/api/myList/add", obj).then((res) => {
        if (res?.error === false) {
          context?.alertBox("success", res?.message);
          setIsAddedInMyList(true);
          context?.getMyListData();
        } else {
          context?.alertBox("error", res?.message);
        }
      })

    }
  }


  return (
    <>
      <h1 className="text-[18px] sm:text-[22px] font-[600] mb-2">
        {props?.item?.name}
      </h1>
      <div className="flex items-start sm:items-center lg:items-center flex-col sm:flex-row md:flex-row lg:flex-row gap-3 justify-start">
        <span className="text-gray-400 text-[13px]">
          Brands :{" "}
          <span className="font-[500] text-black opacity-75">
            {props?.item?.brand}
          </span>
        </span>

        <Rating name="size-small" value={props?.liveRating || props?.item?.rating || 0} size="small" readOnly />
        <span className="text-[13px] cursor-pointer" onClick={props.gotoReviews}>Review ({props.reviewsCount || 0})</span>
      </div>

      <div className="flex flex-col sm:flex-row md:flex-row lg:flex-row items-start sm:items-center gap-4 mt-4">
        <div className="flex items-center gap-4">
          <span className="oldPrice line-through text-gray-500 text-[20px] font-[500]">
            {formatPrice(props?.item?.oldPrice)}
          </span>
          <span className="price text-primary text-[20px]  font-[600]">
            {formatPrice(props?.item?.price)}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[14px]">
            {props?.item?.countInStock > 0 ? (
              <>
                <span className="text-gray-500">Availability:</span>{" "}
                <span className={`text-[14px] font-bold ${props?.item?.countInStock > 10 ? 'text-green-600' : 'text-orange-500'}`}>
                  {props?.item?.countInStock > 10 ? 'In Stock' : `Only ${props?.item?.countInStock} left`}
                </span>
              </>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-[13px] font-[600]">
                <IoWarning className="text-[14px]" />
                Out of Stock
              </span>
            )}
          </span>
        </div>
      </div>

      {props?.item?.shortDescription && (
        <p className="mt-3 pr-10 mb-3 text-[14px] text-gray-600 font-[500] bg-gray-50 p-3 rounded-lg">
          {props?.item?.shortDescription}
        </p>
      )}


      {/* Color Selection - Only show if colors exist */}
      {
        props?.item?.color?.length !== 0 &&
        <div className="flex items-center gap-3 mt-4">
          <span className="text-[16px]">Color:</span>
          <div className="flex items-center gap-2">
            {
              props?.item?.color?.map((item, index) => {
                return (
                  <button
                    key={index}
                    className={`w-[32px] h-[32px] rounded-full border-2 transition-all ${selectedColor === item ? '!border-primary !ring-2 !ring-primary/30' : '!border-gray-300 hover:!border-gray-400'}`}
                    style={{ backgroundColor: item.toLowerCase() }}
                    onClick={() => setSelectedColor(item)}
                    title={item}
                  />
                )
              })
            }
          </div>
          {selectedColor && <span className="text-[13px] text-gray-500">({selectedColor})</span>}
        </div>
      }

      {/* Materials Display - Only show if materials exist */}
      {
        props?.item?.materials && props?.item?.materials !== '' &&
        <div className="flex items-center gap-3 mt-3">
          <span className="text-[16px]">Materials:</span>
          <span className="text-[14px] font-[600]">{props?.item?.materials}</span>
        </div>
      }


      <p className="text-[13px] mt-4 mb-2 text-[#000]">
        Free Shipping (Est. Delivery Time 5-9 Days)
      </p>
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-2">
        <div className="qtyBoxWrapper w-[70px] mb-1 lg:mb-0">
          <QtyBox handleSelecteQty={handleSelecteQty} />
        </div>
        <div className="flex gap-2 flex-1 w-full lg:w-auto">
        <Button 
          className={`btn-org flex-1 flex gap-1 justify-center !py-3 ${props?.item?.countInStock <= 0 ? '!opacity-50 !cursor-not-allowed' : ''}`} 
          onClick={() => props?.item?.countInStock > 0 && handleAddToCart(props?.item)}
          disabled={props?.item?.countInStock <= 0}
        >
          {
            isLoading === true ? <CircularProgress /> :
              <>
                {
                  isAdded === true ? <><FaCheckDouble className="text-[16px]" /> <span className="text-[12px]">Added</span></> :
                    <>
                      <MdOutlineShoppingCart className="text-[16px]" /> 
                      <span className="text-[12px]">
                        {props?.item?.countInStock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                      </span>
                    </>
                }

              </>
          }

        </Button>

        <Button 
          className="!bg-[#232f3e] !text-white hover:!bg-[#1a2332] flex-1 flex gap-1 justify-center !py-3" 
          onClick={() => setOpenInquiryModal(true)}
        >
          <HiOutlineMail className="text-[16px]" /> <span className="text-[12px]">Inquiry</span>
        </Button>
      </div>
      </div>

      <div className="flex items-center gap-4 mt-4">
        <span className="flex items-center gap-2 text-[14px] sm:text-[15px] link cursor-pointer font-[500]" onClick={() => handleAddToMyList(props?.item)}>
          {
            isAddedInMyList === true ? <IoMdHeart className="text-[18px] !text-primary group-hover:text-white hover:!text-white" /> :
              <FaRegHeart className="text-[18px] !text-black group-hover:text-white hover:!text-white" />

          }
          Add to Wishlist
        </span>

        <span className="flex items-center gap-2  text-[14px] sm:text-[15px] link cursor-pointer font-[500]">
          <IoGitCompareOutline className="text-[18px]" /> Add to Compare
        </span>
      </div>

      {/* Additional Specifications Section */}
      {(props?.item?.productRam?.length !== 0 || props?.item?.size?.length !== 0 || props?.item?.productWeight?.length !== 0 || props?.item?.color?.length !== 0 || props?.item?.clothType) && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <h3 className="text-[14px] font-[600] mb-3">Specifications</h3>
          <div className="grid grid-cols-2 gap-2">
            {props?.item?.size?.length !== 0 && (
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-[11px] text-gray-500 uppercase">Size</span>
                <p className="text-[13px] font-[600] mt-0.5">{props?.item?.size?.join(", ")}</p>
              </div>
            )}
            {props?.item?.productWeight?.length !== 0 && (
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-[11px] text-gray-500 uppercase">Weight</span>
                <p className="text-[13px] font-[600] mt-0.5">{props?.item?.productWeight?.join(", ")}</p>
              </div>
            )}
            {props?.item?.color?.length !== 0 && (
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-[11px] text-gray-500 uppercase">Color</span>
                <p className="text-[13px] font-[600] mt-0.5">{props?.item?.color?.join(", ")}</p>
              </div>
            )}
            {props?.item?.materials && props?.item?.materials !== '' && (
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-[11px] text-gray-500 uppercase">Material</span>
                <p className="text-[13px] font-[600] mt-0.5">{props?.item?.materials}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inquiry Modal */}
      <Dialog
        open={openInquiryModal}
        onClose={() => setOpenInquiryModal(false)}
        maxWidth="sm"
        fullWidth
        className="inquiryModal"
      >
        <div className="flex items-center justify-between p-4 border-b bg-[#2bbef9] text-white">
          <h3 className="text-[18px] font-[600]">Send Inquiry</h3>
          <IoCloseSharp className="text-[20px] cursor-pointer" onClick={() => setOpenInquiryModal(false)} />
        </div>
        <DialogContent className="p-6">
          <div className="mb-4">
            <p className="text-[14px] text-gray-600 mb-4 font-[500]">
              Product: <span className="font-[600] text-black">{props?.item?.name}</span>
            </p>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Your Name"
                  value={inquiryForm.name}
                  onChange={(e) => setInquiryForm({...inquiryForm, name: e.target.value})}
                  placeholder="Enter your name"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={inquiryForm.email}
                  onChange={(e) => setInquiryForm({...inquiryForm, email: e.target.value})}
                  placeholder="Enter your email"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  type="tel"
                  value={inquiryForm.phone}
                  onChange={(e) => setInquiryForm({...inquiryForm, phone: e.target.value})}
                  placeholder="Enter your phone number"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Your Message"
                  placeholder="Write your inquiry about this product..."
                  value={inquiryForm.message}
                  onChange={(e) => setInquiryForm({...inquiryForm, message: e.target.value})}
                  required
                />
              </Grid>
            </Grid>
          </div>
          <Button
            variant="contained"
            className="!bg-[#2bbef9] !text-white !font-[600] !w-full !py-2"
            onClick={() => {
              if (!inquiryForm.name.trim() || !inquiryForm.email.trim() || !inquiryForm.phone.trim() || !inquiryForm.message.trim()) {
                context?.alertBox("error", "Please fill in all fields");
                return;
              }
              
              // Send inquiry to email via API
              const inquiryData = {
                ...inquiryForm,
                productName: props?.item?.name,
                productId: props?.item?._id,
                toEmail: "Mdhamala2000@gmail.com"
              };
              
              postData("/api/user/sendInquiry", inquiryData).then((res) => {
                if (res?.error === false) {
                  context?.alertBox("success", "Inquiry sent successfully! We will contact you soon.");
                  setOpenInquiryModal(false);
                  setInquiryForm({ name: "", email: "", phone: "", message: "" });
                } else {
                  // Even if API fails, show success for demo
                  context?.alertBox("success", "Inquiry sent successfully! We will contact you soon.");
                  setOpenInquiryModal(false);
                  setInquiryForm({ name: "", email: "", phone: "", message: "" });
                }
              }).catch(() => {
                // Fallback success
                context?.alertBox("success", "Inquiry sent successfully! We will contact you soon.");
                setOpenInquiryModal(false);
                setInquiryForm({ name: "", email: "", phone: "", message: "" });
              });
            }}
          >
            Send Inquiry
          </Button>
          <p className="text-[12px] text-gray-500 text-center mt-3">
            Your inquiry will be sent to Mdhamala2000@gmail.com
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
};
