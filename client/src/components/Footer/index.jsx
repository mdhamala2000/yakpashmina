import React, { useContext, useState } from "react";
import { LiaShippingFastSolid } from "react-icons/lia";
import { PiKeyReturnLight } from "react-icons/pi";
import { BsWallet2 } from "react-icons/bs";
import { LiaGiftSolid } from "react-icons/lia";
import { BiSupport } from "react-icons/bi";
import { Link } from "react-router-dom";
import { IoChatboxOutline } from "react-icons/io5";

import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { FaFacebookF } from "react-icons/fa";
import { AiOutlineYoutube } from "react-icons/ai";
import { FaPinterestP } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa";
import { FaCcVisa } from "react-icons/fa";
import { FaCcMastercard } from "react-icons/fa";
import { FaCcAmex } from "react-icons/fa";
import { FaCcPaypal } from "react-icons/fa";

import Drawer from "@mui/material/Drawer";
import CartPanel from "../CartPanel";
import { MyContext } from "../../App";
import { postData } from "../../utils/api";


import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { ProductZoom } from "../ProductZoom";
import { IoCloseSharp } from "react-icons/io5";
import { ProductDetailsComponent } from "../ProductDetails";
import AddAddress from "../../Pages/MyAccount/addAddress";


const Footer = () => {
  const context = useContext(MyContext);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!newsletterEmail) {
      context.alertBox("error", "Please enter your email address");
      return;
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(newsletterEmail)) {
      context.alertBox("error", "Please enter a valid email address");
      return;
    }

    setIsSubscribing(true);

    try {
      const res = await postData("/api/user/subscribe-newsletter", { email: newsletterEmail });
      
      if (res?.error === false) {
        context.alertBox("success", res?.message || "Successfully subscribed to newsletter!");
        setNewsletterEmail("");
      } else {
        context.alertBox("error", res?.message || "Failed to subscribe");
      }
    } catch (error) {
      context.alertBox("error", "Something went wrong. Please try again.");
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <>
      <footer className="py-6 bg-[#fafafa]">
        <div className="container">
          <div className="flex items-center justify-center gap-2 py-3 lg:py-8 pb-0 lg:pb-8 px-0 lg:px-5 scrollableBox footerBoxWrap">
            <div className="col flex items-center justify-center flex-col group w-[15%]">
              <LiaShippingFastSolid className="text-[40px] transition-all duration-300 group-hover:text-primary group-hover:-translate-y-1" />
              <h3 className="text-[16px] font-[600] mt-3">Free Shipping</h3>
              <p className="text-[12px] font-[500]">For all Orders Over $100</p>
            </div>

            <div className="col flex items-center justify-center flex-col group w-[15%]">
              <PiKeyReturnLight className="text-[40px] transition-all duration-300 group-hover:text-primary group-hover:-translate-y-1" />
              <h3 className="text-[16px] font-[600] mt-3">14 Days Returns</h3>
              <p className="text-[12px] font-[500]">For an Exchange Product</p>
            </div>

            <div className="col flex items-center justify-center flex-col group w-[15%]">
              <BsWallet2 className="text-[40px] transition-all duration-300 group-hover:text-primary group-hover:-translate-y-1" />
              <h3 className="text-[16px] font-[600] mt-3">Secured Payment</h3>
              <p className="text-[12px] font-[500]">Payment Cards Accepted</p>
            </div>

            <div className="col flex items-center justify-center flex-col group w-[15%]">
              <LiaGiftSolid className="text-[40px] transition-all duration-300 group-hover:text-primary group-hover:-translate-y-1" />
              <h3 className="text-[16px] font-[600] mt-3">Special Gifts</h3>
              <p className="text-[12px] font-[500]">Our First Product Order</p>
            </div>

            <div className="col flex items-center justify-center flex-col group w-[15%]">
              <BiSupport className="text-[40px] transition-all duration-300 group-hover:text-primary group-hover:-translate-y-1" />
              <h3 className="text-[16px] font-[600] mt-3">Support 24/7</h3>
              <p className="text-[12px] font-[500]">Contact us Anytime</p>
            </div>
          </div>
          <br />

          <hr />

          <div className="footer flex px-3 lg:px-0 flex-col lg:flex-row py-8">
            <div className="part1 w-full lg:w-[25%] border-r border-[rgba(0,0,0,0.1)]">
              <h2 className="text-[18px] font-[600] mb-4">Contact Us</h2>
              <p className="text-[13px] font-[400] pb-4">
                <strong>White Yak Pashmina</strong> - Premium Pashmina Store
                <br />
                Narsingh Chowk Marg, Kathmandu 44600, Nepal
                <br />
                <strong>Representative Office</strong>
                <br />
                Kin Wah Street, Northpoint, Hongkong
              </p>

              <Link
                className="link text-[13px]"
                to="mailto:mdhamala2000@gmail.com"
              >
                mdhamala2000@gmail.com
              </Link>

              <div className="flex flex-col gap-2 mt-3 mb-3">
                <a href="https://wa.me/9779841321806" target="_blank" className="flex items-center gap-2 text-[#25D366] hover:text-[#128C7E] transition">
                  <FaWhatsapp className="text-[20px]" />
                  <span className="text-[14px] font-[500]">+977 9841321806</span>
                </a>
                <a href="https://wa.me/9779851017391" target="_blank" className="flex items-center gap-2 text-[#25D366] hover:text-[#128C7E] transition">
                  <FaWhatsapp className="text-[20px]" />
                  <span className="text-[14px] font-[500]">+977 9851017391</span>
                </a>
                <a href="https://wa.me/85265492201" target="_blank" className="flex items-center gap-2 text-[#25D366] hover:text-[#128C7E] transition">
                  <FaWhatsapp className="text-[20px]" />
                  <span className="text-[14px] font-[500]">+852 65492201</span>
                </a>
              </div>

              <Link to="/contact" className="inline-block mt-2">
                <Button className="btn-org !text-[12px] !py-1 !px-3">Contact Us</Button>
              </Link>
            </div>

            <div className="part2  w-full lg:w-[40%] flex pl-0 lg:pl-8 mt-5 lg:mt-0">
              <div className="part2_col1 w-[50%]">
                <h2 className="text-[18px] font-[600] mb-4">Products</h2>

                <ul className="list">
                  <li className="list-none text-[14px] w-full mb-2">
                    <Link to="/" className="link cursor-pointer inline-block w-full">
                      Prices drop
                    </Link>
                  </li>
                  <li className="list-none text-[14px] w-full mb-2">
                    <Link to="/" className="link cursor-pointer inline-block w-full">
                      New products
                    </Link>
                  </li>
                  <li className="list-none text-[14px] w-full mb-2">
                    <Link to="/" className="link cursor-pointer inline-block w-full">
                      Best sales
                    </Link>
                  </li>
                  <li className="list-none text-[14px] w-full mb-2">
                    <Link to="/contact" className="link cursor-pointer inline-block w-full">
                      Contact us
                    </Link>
                  </li>
                  <li className="list-none text-[14px] w-full mb-2">
                    <Link to="/" className="link cursor-pointer inline-block w-full">
                      Sitemap
                    </Link>
                  </li>
                  <li className="list-none text-[14px] w-full mb-2">
                    <Link to="/" className="link cursor-pointer inline-block w-full">
                      Stores
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="part2_col2 w-[50%]">
                <h2 className="text-[18px] font-[600] mb-4">Our Company</h2>

                <ul className="list">
                  <li className="list-none text-[14px] w-full mb-2">
                    <Link to="/" className="link cursor-pointer inline-block w-full">
                      Home
                    </Link>
                  </li>
                  <li className="list-none text-[14px] w-full mb-2">
                    <Link to="/products" className="link cursor-pointer inline-block w-full">
                      All Products
                    </Link>
                  </li>
                  <li className="list-none text-[14px] w-full mb-2">
                    <Link to="/what-is-pashmina" className="link cursor-pointer inline-block w-full">
                      What is Pashmina
                    </Link>
                  </li>
                  <li className="list-none text-[14px] w-full mb-2">
                    <Link to="/privacy-policy" className="link cursor-pointer inline-block w-full">
                      Privacy Policy
                    </Link>
                  </li>
                  <li className="list-none text-[14px] w-full mb-2">
                    <Link to="/refund-return-policy" className="link cursor-pointer inline-block w-full">
                      Refund and Return Policy
                    </Link>
                  </li>
                  <li className="list-none text-[14px] w-full mb-2">
                    <Link to="/shipping-policy" className="link cursor-pointer inline-block w-full">
                      Shipping Policy
                    </Link>
                  </li>
                  <li className="list-none text-[14px] w-full mb-2">
                    <Link to="/terms-of-service" className="link cursor-pointer inline-block w-full">
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="part2  w-full lg:w-[35%] flex pl-0 lg:pl-8 flex-col pr-8 mt-5 lg:mt-0">
              <h2 className="text-[18px] font-[600] mb-2 lg:mb-4">
                Subscribe to newsletter
              </h2>
              <p className="text-[13px]">
                Subscribe to our latest newsletter to get news about special
                discounts.
              </p>

              <form className="mt-5" onSubmit={handleSubscribe}>
                <input
                  type="text"
                  className="w-full h-[45px] border outline-none pl-4 pr-4 rounded-sm mb-4 focus:border-[rgba(0,0,0,0.3)]"
                  placeholder="Your Email Address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                />

                <Button type="submit" className="btn-org" disabled={isSubscribing}>
                  {isSubscribing ? 'Subscribing...' : 'SUBSCRIBE'}
                </Button>

                <FormControlLabel
                  className="mt-3 lg:mt-0 block w-full"
                  control={<Checkbox />}
                  label=" I agree to the terms and conditions and the privacy policy"
                />
              </form>
            </div>
          </div>
        </div>
      </footer>

      <div className="bottomStrip border-t border-[rgba(0,0,0,0.1)] pt-3 pb-[100px] lg:pb-3 bg-white">
        <div className="container flex items-center justify-between flex-col lg:flex-row gap-4 lg:gap-0">
          <ul className="flex items-center gap-2">
            <li className="list-none">
              <Link
                to="/"
                target="_blank"
                className="w-[35px] h-[35px] rounded-full border border-[rgba(0,0,0,0.1)] flex items-center justify-center group hover:bg-primary transition-all"
              >
                <FaFacebookF className="text-[17px] group-hover:text-white" />
              </Link>
            </li>

            <li className="list-none">
              <Link
                to="/"
                target="_blank"
                className="w-[35px] h-[35px] rounded-full border border-[rgba(0,0,0,0.1)] flex items-center justify-center group hover:bg-primary transition-all"
              >
                <AiOutlineYoutube className="text-[21px] group-hover:text-white" />
              </Link>
            </li>

            <li className="list-none">
              <Link
                to="/"
                target="_blank"
                className="w-[35px] h-[35px] rounded-full border border-[rgba(0,0,0,0.1)] flex items-center justify-center group hover:bg-primary transition-all"
              >
                <FaPinterestP className="text-[17px] group-hover:text-white" />
              </Link>
            </li>

            <li className="list-none">
              <Link
                to="/"
                target="_blank"
                className="w-[35px] h-[35px] rounded-full border border-[rgba(0,0,0,0.1)] flex items-center justify-center group hover:bg-primary transition-all"
              >
                <FaInstagram className="text-[17px] group-hover:text-white" />
              </Link>
            </li>
          </ul>

          <p className="text-[13px] text-center mb-0">
            © 2024 White Yak Pashmina. All rights reserved.
          </p>


          <div className="flex items-center gap-3 text-[30px] text-[rgba(0,0,0,0.4)]">
            <FaCcVisa />
            <FaCcMastercard />
            <FaCcAmex />
            <FaCcPaypal />
          </div>


        </div>
      </div>






      {/* Cart Panel */}
      <Drawer
        open={context.openCartPanel}
        onClose={context.toggleCartPanel(false)}
        anchor={"right"}
        className="cartPanel"
        PaperProps={{ sx: { width: { xs: '100%', sm: 380 }, maxWidth: '100%' } }}
      >
        {context?.cartData?.length !== 0 ? (
          <CartPanel data={context?.cartData} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <img src="/empty-cart.png" className="w-32 mb-4" alt="Empty cart" />
            <h4 className="text-gray-600 mb-2">Your cart is empty</h4>
            <Button className="btn-org btn-sm" onClick={context.toggleCartPanel(false)}>Continue Shopping</Button>
          </div>
)}


      </Drawer>

      {/* Address Panel */}
      <Drawer
        open={context.openAddressPanel}
        onClose={context.toggleAddressPanel(false)}
        anchor={"right"}
        className="addressPanel"
      >
        <div className="flex items-center justify-between py-3 px-4 gap-3 border-b border-[rgba(0,0,0,0.1)] overflow-hidden">
          <h4>{context?.addressMode === "add" ? 'Add' : 'Edit'} Delivery Address </h4>
          <IoCloseSharp className="text-[20px] cursor-pointer" onClick={context.toggleAddressPanel(false)} />
        </div>



        <div className="w-full max-h-[100vh] overflow-auto">
          <AddAddress />
        </div>



      </Drawer>





      <Dialog
        open={context?.openProductDetailsModal.open}
        fullWidth={context?.fullWidth}
        maxWidth={context?.maxWidth}
        onClose={context?.handleCloseProductDetailsModal}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className="productDetailsModal"
      >
        <DialogContent>
          <div className="flex items-center w-full productDetailsModalContainer relative">
            <Button
              className="!w-[40px] !h-[40px] !min-w-[40px] !rounded-full !text-[#000] !absolute top-[15px] right-[15px] !bg-[#f1f1f1]"
              onClick={context?.handleCloseProductDetailsModal}
            >
              <IoCloseSharp className="text-[20px]" />
            </Button>
            {
              context?.openProductDetailsModal?.item?.length !== 0 &&
              <>
                <div className="col1 w-[40%] px-3 py-8">
                  <ProductZoom images={context?.openProductDetailsModal?.item?.images} />
                </div>

                <div className="col2 w-[60%] py-8 px-8 pr-16 productContent ">
                  <ProductDetailsComponent item={context?.openProductDetailsModal?.item} />
                </div>
              </>
            }

          </div>
        </DialogContent>
      </Dialog>



    </>
  );
};

export default Footer;
