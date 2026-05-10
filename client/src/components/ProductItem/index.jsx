import React, { useContext, useEffect, useState } from "react";
import "../ProductItem/style.css";
import { Link } from "react-router-dom";
import Rating from "@mui/material/Rating";
import Button from "@mui/material/Button";
import { FaRegHeart } from "react-icons/fa";
import { IoGitCompareOutline } from "react-icons/io5";
import { MdZoomOutMap } from "react-icons/md";
import { MyContext } from "../../App";
import { MdOutlineShoppingCart } from "react-icons/md";
import { FaMinus } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa6";
import { deleteData, editData, postData } from "../../utils/api";
import CircularProgress from '@mui/material/CircularProgress';
import { IoMdHeart } from "react-icons/io";
import { useCurrency } from "../../context/CurrencyContext";
import { useNavigate } from "react-router-dom";



const ProductItem = (props) => {

  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isAddedInMyList, setIsAddedInMyList] = useState(false);
  const [cartItem, setCartItem] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const context = useContext(MyContext);
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const handleAddToCart = async (product) => {
    if (!context?.isLogin || !context?.userData?._id) {
      localStorage.setItem('pendingCartItem', JSON.stringify({
        productId: product?._id,
        productTitle: product?.name,
        image: product?.images[0],
        rating: product?.rating,
        price: product?.price,
        oldPrice: product?.oldPrice,
        discount: product?.discount,
        quantity: quantity,
        countInStock: product?.countInStock,
        brand: product?.brand,
        color: product?.color?.length !== 0 ? (product?.color?.[0] || '') : '',
        materials: product?.materials || ''
      }));
      context?.alertBox("info", "Please login to add items to cart");
      navigate('/login');
      return false;
    }

    if (product?.countInStock <= 0) {
      context?.alertBox("error", "Sorry, this item is currently out of stock!");
      return false;
    }

    if (product?.countInStock < quantity) {
      context?.alertBox("error", `Only ${product?.countInStock} items available in stock!`);
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
      color: product?.color?.length !== 0 ? (product?.color?.[0] || '') : '',
      materials: product?.materials || ''
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

  useEffect(() => {
    const item = context?.cartData?.filter((cartItem) =>
      cartItem.productId.includes(props?.item?._id)
    )

    const myListItem = context?.myListData?.filter((item) =>
      item.productId.includes(props?.item?._id)
    )

    if (item?.length !== 0) {
      setCartItem(item)
      setIsAdded(true);
      setQuantity(item[0]?.quantity)
    } else {
      setQuantity(1)
    }


    if (myListItem?.length !== 0) {
      setIsAddedInMyList(true);
    } else {
      setIsAddedInMyList(false)
    }

  }, [context?.cartData]);


  const minusQty = () => {
    if (quantity !== 1 && quantity > 1) {
      setQuantity(quantity - 1)
    } else {
      setQuantity(1)
    }


    if (quantity === 1) {
      deleteData(`/api/cart/delete-cart-item/${cartItem[0]?._id}`).then((res) => {
        setIsAdded(false);
        context.alertBox("success", "Item Removed ");
        context?.getCartItems();
      })
    } else {
      const obj = {
        _id: cartItem[0]?._id,
        qty: quantity - 1,
        subTotal: props?.item?.price * (quantity - 1)
      }

      editData(`/api/cart/update-qty`, obj).then((res) => {
        context.alertBox("success", res?.data?.message);
        context?.getCartItems();
      })
    }

  }


  const addQty = () => {

    setQuantity(quantity + 1);

    const obj = {
      _id: cartItem[0]?._id,
      qty: quantity + 1,
      subTotal: props?.item?.price * (quantity + 1)
    }

    editData(`/api/cart/update-qty`, obj).then((res) => {
      context.alertBox("success", res?.data?.message);
      context?.getCartItems();
    })



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
    <div className="productItem shadow-lg rounded-md overflow-hidden border-1 border-[rgba(0,0,0,0.1)] h-full">
      <div className="group imgWrapper w-[100%] overflow-hidden rounded-md rounded-bl-none rounded-br-none relative">
        <Link to={`/product/${props?.item?._id}`}>
          <div className="img w-full aspect-[4/5] overflow-hidden relative max-h-[280px]">
            <img
              src={props?.item?.images[0]}
              className="w-full h-full object-cover"
              alt={props?.item?.name}
              title={props?.item?.name}
              loading="lazy"
              width="300"
              height="375"
            />

            {
              props?.item?.images?.length > 1 &&
              <img
                src={props?.item?.images[1]}
                className="w-full h-full object-cover transition-all duration-700 absolute top-0 left-0 opacity-0 group-hover:opacity-100 group-hover:scale-105"
                alt={props?.item?.name}
                title={props?.item?.name}
                loading="lazy"
              />
            }


          </div>
        </Link>


        <span className="discount flex items-center absolute top-[10px] left-[10px] z-50 bg-primary text-white rounded-lg p-1 text-[12px] font-[500]">
          {props?.item?.discount}%
        </span>

        <div className="actions absolute top-[-20px] right-[5px] z-50 flex items-center gap-2 flex-col w-[50px] transition-all duration-300 group-hover:top-[15px] opacity-0 group-hover:opacity-100">

          <Button className="!w-[35px] !h-[35px] !min-w-[35px] !rounded-full !bg-white  text-black hover:!bg-primary hover:text-white group" onClick={() => navigate(`/product/${props?.item?._id}`)}>
            <MdZoomOutMap className="text-[18px] !text-black group-hover:text-white hover:!text-white" />
          </Button>

          <Button className="!w-[35px] !h-[35px] !min-w-[35px] !rounded-full !bg-white  text-black hover:!bg-primary hover:text-white group">
            <IoGitCompareOutline className="text-[18px] !text-black group-hover:text-white hover:!text-white" />
          </Button>

          <Button className={`!w-[35px] !h-[35px] !min-w-[35px] !rounded-full !bg-white  text-black hover:!bg-primary hover:text-white group`}
            onClick={() => handleAddToMyList(props?.item)}
          >
            {
              isAddedInMyList === true ? <IoMdHeart className="text-[18px] !text-primary group-hover:text-white hover:!text-white" /> :
                <FaRegHeart className="text-[18px] !text-black group-hover:text-white hover:!text-white" />

            }

          </Button>
        </div>
      </div>

      <div className="info p-3 py-5 relative pb-[50px] h-[210px]">
        <h6 className="text-[13px] lg:text-[15px] !font-[400]">
          <span className="link transition-all">
            {props?.item?.brand}
          </span>
        </h6>
        <h3 className="text-[13px] lg:text-[15px] title mt-1 font-[500] mb-1 text-[#000]">
          <Link to={`/product/${props?.item?._id}`} className="link transition-all">
            {props?.item?.name?.substr(0, 30) + '...'}
          </Link>
        </h3>

        <Rating name="size-small" defaultValue={props?.item?.rating} size="small" readOnly />

        <div className="flex items-center gap-4 justify-between">
          <span className="oldPrice line-through text-gray-500 text-[13px] lg:text-[15px] font-[500]">
            {formatPrice(props?.item?.oldPrice)}
          </span>
          <span className="price text-primary text-[13px] lg:text-[15px] font-[600]">
            {formatPrice(props?.item?.price)}
          </span>
        </div>


        <div className="!absolute bottom-[15px] left-0 pl-3 pr-3 w-full">

          {
            isAdded === false ?

              props?.item?.countInStock <= 0 ?
                <Button className="addToCartBtn btn-border flex w-full btn-sm gap-2 !bg-red-100 !text-red-600 !border-red-200 !cursor-not-allowed hover:!bg-red-100" size="small" disabled>
                  Out of Stock
                </Button>
              :
              <Button className="btn-org addToCartBtn btn-border flex w-full btn-sm gap-2 " size="small"
                onClick={() => handleAddToCart(props?.item)}>
                <MdOutlineShoppingCart className="text-[18px]" /> Add to Cart
              </Button>

              :

              <>
                {
                  isLoading === true ?
                    <Button className="addtocart btn-org btn-border flex w-full btn-sm gap-2 " size="small">
                      <CircularProgress />
                    </Button>

                    :


                    <div className="flex items-center justify-between overflow-hidden rounded-full border border-[rgba(0,0,0,0.1)]">
                      <Button className="!min-w-[35px] !w-[35px] !h-[30px] !bg-[#f1f1f1]  !rounded-none" onClick={minusQty}><FaMinus className="text-[rgba(0,0,0,0.7)]" /></Button>
                      <span>{quantity}</span>
                      <Button className="!min-w-[35px] !w-[35px] !h-[30px] !bg-gray-800 !rounded-none"
                        onClick={addQty}>
                        <FaPlus className="text-white" /></Button>
                    </div>

                }
              </>

          }

        </div>



      </div>
    </div>
  );
};

export default ProductItem;
