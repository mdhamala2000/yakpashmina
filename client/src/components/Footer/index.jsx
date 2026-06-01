import React, { useContext, useState } from "react";
import { LiaShippingFastSolid, LiaGiftSolid } from "react-icons/lia";
import { PiKeyReturnLight } from "react-icons/pi";
import { BsWallet2 } from "react-icons/bs";
import { BiSupport } from "react-icons/bi";
import { Link } from "react-router-dom";

import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { FaFacebookF, FaPinterestP, FaInstagram, FaWhatsapp, FaCcVisa, FaCcMastercard, FaCcAmex, FaCcPaypal } from "react-icons/fa";
import { AiOutlineYoutube } from "react-icons/ai";
import { HiOutlineHome, HiOutlineShoppingBag, HiOutlineInformationCircle, HiOutlineMap, HiOutlineMail, HiOutlineShieldCheck, HiOutlineRefresh, HiOutlineTruck, HiOutlineDocumentText, HiOutlineChevronDown } from "react-icons/hi";

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
      <footer className="py-4 lg:py-6 bg-[#f8f6f4]">
        <div className="container">
          <div className="flex items-center justify-start lg:justify-center gap-1 lg:gap-2 py-2 lg:py-8 pb-0 lg:pb-8 px-2 lg:px-5 scrollableBox footerBoxWrap">
            <div className="col flex items-center justify-center flex-col group min-w-[130px] lg:min-w-0 lg:w-[15%] px-2 lg:px-1">
              <div className="w-[40px] h-[40px] lg:w-[56px] lg:h-[56px] rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-all duration-500 group-hover:scale-110">
                <LiaShippingFastSolid className="text-[20px] lg:text-[32px] text-primary transition-all duration-500 group-hover:-translate-y-0.5" />
              </div>
              <h3 className="text-[11px] lg:text-[15px] font-[700] mt-2 lg:mt-3 leading-tight text-gray-800">Free Shipping</h3>
              <p className="text-[9px] lg:text-[11px] font-[500] leading-tight text-gray-500">For all Orders Over $100</p>
            </div>

            <div className="col flex items-center justify-center flex-col group min-w-[130px] lg:min-w-0 lg:w-[15%] px-2 lg:px-1">
              <div className="w-[40px] h-[40px] lg:w-[56px] lg:h-[56px] rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-all duration-500 group-hover:scale-110">
                <PiKeyReturnLight className="text-[20px] lg:text-[32px] text-primary transition-all duration-500 group-hover:-translate-y-0.5" />
              </div>
              <h3 className="text-[11px] lg:text-[15px] font-[700] mt-2 lg:mt-3 leading-tight text-gray-800">14 Days Returns</h3>
              <p className="text-[9px] lg:text-[11px] font-[500] leading-tight text-gray-500">For an Exchange Product</p>
            </div>

            <div className="col flex items-center justify-center flex-col group min-w-[130px] lg:min-w-0 lg:w-[15%] px-2 lg:px-1">
              <div className="w-[40px] h-[40px] lg:w-[56px] lg:h-[56px] rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-all duration-500 group-hover:scale-110">
                <BsWallet2 className="text-[20px] lg:text-[32px] text-primary transition-all duration-500 group-hover:-translate-y-0.5" />
              </div>
              <h3 className="text-[11px] lg:text-[15px] font-[700] mt-2 lg:mt-3 leading-tight text-gray-800">Secured Payment</h3>
              <p className="text-[9px] lg:text-[11px] font-[500] leading-tight text-gray-500">Payment Cards Accepted</p>
            </div>

            <div className="col flex items-center justify-center flex-col group min-w-[130px] lg:min-w-0 lg:w-[15%] px-2 lg:px-1">
              <div className="w-[40px] h-[40px] lg:w-[56px] lg:h-[56px] rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-all duration-500 group-hover:scale-110">
                <LiaGiftSolid className="text-[20px] lg:text-[32px] text-primary transition-all duration-500 group-hover:-translate-y-0.5" />
              </div>
              <h3 className="text-[11px] lg:text-[15px] font-[700] mt-2 lg:mt-3 leading-tight text-gray-800">Special Gifts</h3>
              <p className="text-[9px] lg:text-[11px] font-[500] leading-tight text-gray-500">Our First Product Order</p>
            </div>

            <div className="col flex items-center justify-center flex-col group min-w-[130px] lg:min-w-0 lg:w-[15%] px-2 lg:px-1">
              <div className="w-[40px] h-[40px] lg:w-[56px] lg:h-[56px] rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-all duration-500 group-hover:scale-110">
                <BiSupport className="text-[20px] lg:text-[32px] text-primary transition-all duration-500 group-hover:-translate-y-0.5" />
              </div>
              <h3 className="text-[11px] lg:text-[15px] font-[700] mt-2 lg:mt-3 leading-tight text-gray-800">Support 24/7</h3>
              <p className="text-[9px] lg:text-[11px] font-[500] leading-tight text-gray-500">Contact us Anytime</p>
            </div>
          </div>

          <div className="relative my-2 lg:my-4">
            <hr className="border-t border-gray-200" />
          </div>

          <div className="footer flex px-2 lg:px-0 flex-col lg:flex-row py-4 lg:py-8 gap-4 lg:gap-0">
            <div className="part1 w-full lg:w-[25%] lg:border-r border-[rgba(0,0,0,0.08)] lg:pr-6">
              <details className="lg:hidden group" open>
                <summary className="text-[15px] font-[600] py-2 list-none flex items-center justify-between cursor-pointer select-none">
                  <span className="flex items-center gap-2">
                    <span className="w-1 h-4 bg-primary rounded-full inline-block"></span>
                    Contact Us
                  </span>
                  <HiOutlineChevronDown className="transition-transform duration-300 group-open:rotate-180 text-gray-400 text-sm" />
                </summary>
                <div className="mt-2 space-y-2.5">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[12px] text-gray-600 leading-relaxed">
                      <strong className="text-gray-800">White Yak Pashmina</strong><br />
                      Narsingh Chowk Marg, Kathmandu 44600, Nepal
                    </p>
                    <p className="text-[12px] text-gray-600 leading-relaxed mt-1.5">
                      <strong className="text-gray-800">Representative Office</strong><br />
                      Kin Wah Street, Northpoint, Hongkong
                    </p>
                  </div>
                  <a className="link text-[12px] flex items-center gap-1.5 text-gray-600 hover:text-primary transition-colors duration-300" href="mailto:mdhamala2000@gmail.com">
                    <HiOutlineMail className="text-[14px]" />
                    mdhamala2000@gmail.com
                  </a>
                  <div className="flex flex-col gap-1.5">
                    <a href="https://wa.me/9779841321806" target="_blank" className="flex items-center gap-2 text-[#25D366] hover:text-[#128C7E] transition-all duration-300 bg-green-50 rounded-lg px-2.5 py-1.5 hover:bg-green-100">
                      <FaWhatsapp className="text-[15px]" />
                      <span className="text-[12px] font-[500]">+977 9841321806</span>
                    </a>
                    <a href="https://wa.me/9779851017391" target="_blank" className="flex items-center gap-2 text-[#25D366] hover:text-[#128C7E] transition-all duration-300 bg-green-50 rounded-lg px-2.5 py-1.5 hover:bg-green-100">
                      <FaWhatsapp className="text-[15px]" />
                      <span className="text-[12px] font-[500]">+977 9851017391</span>
                    </a>
                    <a href="https://wa.me/85265492201" target="_blank" className="flex items-center gap-2 text-[#25D366] hover:text-[#128C7E] transition-all duration-300 bg-green-50 rounded-lg px-2.5 py-1.5 hover:bg-green-100">
                      <FaWhatsapp className="text-[15px]" />
                      <span className="text-[12px] font-[500]">+852 65492201</span>
                    </a>
                  </div>
                  <Button component={Link} to="/contact" className="!bg-primary !text-white !text-[11px] !font-[600] !w-full !rounded-lg hover:!bg-primary/90 !transition-all !duration-300 !shadow-sm" style={{ padding: '3px 12px' }}>Contact Us</Button>
                </div>
              </details>
              <div className="hidden lg:block">
                <h2 className="text-[16px] font-[700] mb-5 flex items-center gap-2">
                  <span className="w-1 h-5 bg-primary rounded-full inline-block"></span>
                  Contact Us
                </h2>
                <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
                  <p className="text-[13px] text-gray-600 leading-relaxed">
                    <strong className="text-gray-800">White Yak Pashmina</strong><br />
                    Narsingh Chowk Marg, Kathmandu 44600, Nepal
                  </p>
                  <p className="text-[13px] text-gray-600 leading-relaxed mt-2">
                    <strong className="text-gray-800">Representative Office</strong><br />
                    Kin Wah Street, Northpoint, Hongkong
                  </p>
                </div>
                <a className="link text-[13px] flex items-center gap-2 text-gray-600 hover:text-primary transition-colors duration-300 mb-3" href="mailto:mdhamala2000@gmail.com">
                  <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                    <HiOutlineMail className="text-[14px] text-gray-500" />
                  </span>
                  mdhamala2000@gmail.com
                </a>
                <div className="flex flex-col gap-2 mb-4">
                  <a href="https://wa.me/9779841321806" target="_blank" className="flex items-center gap-2.5 text-[#25D366] hover:text-[#128C7E] transition-all duration-300 bg-green-50 rounded-lg px-3 py-2 hover:bg-green-100">
                    <FaWhatsapp className="text-[18px]" />
                    <span className="text-[13px] font-[500]">+977 9841321806</span>
                  </a>
                  <a href="https://wa.me/9779851017391" target="_blank" className="flex items-center gap-2.5 text-[#25D366] hover:text-[#128C7E] transition-all duration-300 bg-green-50 rounded-lg px-3 py-2 hover:bg-green-100">
                    <FaWhatsapp className="text-[18px]" />
                    <span className="text-[13px] font-[500]">+977 9851017391</span>
                  </a>
                  <a href="https://wa.me/85265492201" target="_blank" className="flex items-center gap-2.5 text-[#25D366] hover:text-[#128C7E] transition-all duration-300 bg-green-50 rounded-lg px-3 py-2 hover:bg-green-100">
                    <FaWhatsapp className="text-[18px]" />
                    <span className="text-[13px] font-[500]">+852 65492201</span>
                  </a>
                </div>
                <Button component={Link} to="/contact" className="!bg-primary !text-white !font-[600] !w-full !rounded-lg hover:!bg-primary/90 !transition-all !duration-300 !shadow-sm !text-[13px]">Contact Us</Button>
              </div>
            </div>

            <div className="w-full lg:w-[40%] grid grid-cols-2 lg:flex lg:flex-row lg:pl-8 gap-5 lg:gap-0">
              <div className="lg:w-[50%]">
                <details className="lg:hidden group" open>
                  <summary className="text-[15px] font-[600] py-2 list-none flex items-center justify-between cursor-pointer select-none">
                    <span className="flex items-center gap-2">
                      <span className="w-1 h-4 bg-primary rounded-full inline-block"></span>
                      Learn & Explore
                    </span>
                    <HiOutlineChevronDown className="transition-transform duration-300 group-open:rotate-180 text-gray-400 text-sm" />
                  </summary>
                  <ul className="mt-1 space-y-0.5">
                    {[
                      { label: 'Home', to: '/', icon: HiOutlineHome },
                      { label: 'All Products', to: '/products', icon: HiOutlineShoppingBag },
                      { label: 'What is Pashmina', to: '/what-is-pashmina', icon: HiOutlineInformationCircle },
                      { label: 'Sitemap', to: '/sitemap', icon: HiOutlineMap },
                      { label: 'Contact Us', to: '/contact', icon: HiOutlineMail },
                    ].map((item, i) => (
                      <li key={i} className="list-none">
                        <Link to={item.to} className="group/link cursor-pointer inline-flex items-center gap-2 w-full text-[12px] py-1 text-gray-600 hover:text-primary transition-all duration-300">
                          <item.icon className="text-[13px] text-gray-400 group-hover/link:text-primary transition-colors duration-300" />
                          <span className="relative">
                            {item.label}
                            <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-primary transition-all duration-300 group-hover/link:w-full"></span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
                <div className="hidden lg:block">
                  <h2 className="text-[16px] font-[700] mb-5 flex items-center gap-2">
                    <span className="w-1 h-5 bg-primary rounded-full inline-block"></span>
                    Learn & Explore
                  </h2>
                  <ul className="space-y-2.5">
                    {[
                      { label: 'Home', to: '/', icon: HiOutlineHome },
                      { label: 'All Products', to: '/products', icon: HiOutlineShoppingBag },
                      { label: 'What is Pashmina', to: '/what-is-pashmina', icon: HiOutlineInformationCircle },
                      { label: 'Sitemap', to: '/sitemap', icon: HiOutlineMap },
                      { label: 'Contact Us', to: '/contact', icon: HiOutlineMail },
                    ].map((item, i) => (
                      <li key={i} className="list-none">
                        <Link to={item.to} className="group/link cursor-pointer inline-flex items-center gap-2.5 text-[14px] text-gray-600 hover:text-primary transition-all duration-300">
                          <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center group-hover/link:bg-primary/10 transition-all duration-300">
                            <item.icon className="text-[14px] text-gray-500 group-hover/link:text-primary transition-colors duration-300" />
                          </span>
                          <span className="relative">
                            {item.label}
                            <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-primary transition-all duration-300 group-hover/link:w-full"></span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="lg:w-[50%]">
                <details className="lg:hidden group" open>
                  <summary className="text-[15px] font-[600] py-2 list-none flex items-center justify-between cursor-pointer select-none">
                    <span className="flex items-center gap-2">
                      <span className="w-1 h-4 bg-primary rounded-full inline-block"></span>
                      Our Policy
                    </span>
                    <HiOutlineChevronDown className="transition-transform duration-300 group-open:rotate-180 text-gray-400 text-sm" />
                  </summary>
                  <ul className="mt-1 space-y-0.5">
                    {[
                      { label: 'Privacy Policy', to: '/privacy-policy', icon: HiOutlineShieldCheck },
                      { label: 'Refund & Return', to: '/refund-return-policy', icon: HiOutlineRefresh },
                      { label: 'Shipping Policy', to: '/shipping-policy', icon: HiOutlineTruck },
                      { label: 'Terms of Service', to: '/terms-of-service', icon: HiOutlineDocumentText },
                    ].map((item, i) => (
                      <li key={i} className="list-none">
                        <Link to={item.to} className="group/link cursor-pointer inline-flex items-center gap-2 w-full text-[12px] py-1 text-gray-600 hover:text-primary transition-all duration-300">
                          <item.icon className="text-[13px] text-gray-400 group-hover/link:text-primary transition-colors duration-300" />
                          <span className="relative">
                            {item.label}
                            <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-primary transition-all duration-300 group-hover/link:w-full"></span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
                <div className="hidden lg:block">
                  <h2 className="text-[16px] font-[700] mb-5 flex items-center gap-2">
                    <span className="w-1 h-5 bg-primary rounded-full inline-block"></span>
                    Our Policy
                  </h2>
                  <ul className="space-y-2.5">
                    {[
                      { label: 'Privacy Policy', to: '/privacy-policy', icon: HiOutlineShieldCheck },
                      { label: 'Refund & Return', to: '/refund-return-policy', icon: HiOutlineRefresh },
                      { label: 'Shipping Policy', to: '/shipping-policy', icon: HiOutlineTruck },
                      { label: 'Terms of Service', to: '/terms-of-service', icon: HiOutlineDocumentText },
                    ].map((item, i) => (
                      <li key={i} className="list-none">
                        <Link to={item.to} className="group/link cursor-pointer inline-flex items-center gap-2.5 text-[14px] text-gray-600 hover:text-primary transition-all duration-300">
                          <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center group-hover/link:bg-primary/10 transition-all duration-300">
                            <item.icon className="text-[14px] text-gray-500 group-hover/link:text-primary transition-colors duration-300" />
                          </span>
                          <span className="relative">
                            {item.label}
                            <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-primary transition-all duration-300 group-hover/link:w-full"></span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-[35%] lg:pl-8 lg:pr-8">
              <details className="lg:hidden group" open>
                <summary className="text-[15px] font-[600] py-2 list-none flex items-center justify-between cursor-pointer select-none">
                  <span className="flex items-center gap-2">
                    <span className="w-1 h-4 bg-primary rounded-full inline-block"></span>
                    Newsletter
                  </span>
                  <HiOutlineChevronDown className="transition-transform duration-300 group-open:rotate-180 text-gray-400 text-sm" />
                </summary>
                <div className="mt-2">
                  <p className="text-[12px] text-gray-500 leading-relaxed">Subscribe to get news about special discounts.</p>
                  <form className="mt-3 flex gap-2" onSubmit={handleSubscribe}>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        className="w-full h-[36px] border border-gray-200 outline-none pl-3 pr-3 rounded-lg text-[12px] bg-white focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all duration-300"
                        placeholder="Your Email Address"
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                      />
                    </div>
                    <Button type="submit" className="!bg-primary !text-white !text-[11px] !font-[600] !whitespace-nowrap !rounded-lg !px-4 hover:!bg-primary/90 !transition-all !duration-300 !min-w-0 !shadow-sm" disabled={isSubscribing} style={{ minWidth: 'auto', padding: '4px 14px' }}>
                      {isSubscribing ? '...' : 'SUBSCRIBE'}
                    </Button>
                  </form>
                  <FormControlLabel
                    className="mt-2 block w-full"
                    control={<Checkbox sx={{ '& .MuiSvgIcon-root': { fontSize: 16 }, color: '#d1d5db', '&.Mui-checked': { color: '#ff5252' } }} />}
                    label={<span style={{ fontSize: 11, color: '#6b7280' }}>I agree to the terms and conditions and the privacy policy</span>}
                  />
                </div>
              </details>
              <div className="hidden lg:block">
                <h2 className="text-[16px] font-[700] mb-5 flex items-center gap-2">
                  <span className="w-1 h-5 bg-primary rounded-full inline-block"></span>
                  Newsletter
                </h2>
                <p className="text-[13px] text-gray-500 leading-relaxed mb-5">Subscribe to get news about special discounts and exclusive offers.</p>
                <form onSubmit={handleSubscribe} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full h-[46px] border border-gray-200 outline-none pl-4 pr-4 rounded-lg text-[13px] bg-white focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all duration-300"
                      placeholder="Your Email Address"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="!bg-primary !text-white !font-[600] !w-full !mt-3 !rounded-lg !py-2.5 hover:!bg-primary/90 !transition-all !duration-300 !shadow-sm !text-[13px] !tracking-wider" disabled={isSubscribing}>
                    {isSubscribing ? 'Subscribing...' : 'SUBSCRIBE'}
                  </Button>
                  <FormControlLabel
                    className="mt-3 block w-full"
                    control={<Checkbox sx={{ color: '#d1d5db', '&.Mui-checked': { color: '#ff5252' } }} />}
                    label={<span style={{ fontSize: 12, color: '#9ca3af' }}>I agree to the terms & privacy policy</span>}
                  />
                </form>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <div className="bottomStrip border-t border-[rgba(0,0,0,0.08)] pt-4 lg:pt-3 pb-[80px] lg:pb-3 bg-white">
        <div className="container flex items-center justify-between flex-col lg:flex-row gap-3 lg:gap-0">
          <ul className="flex items-center gap-2 lg:gap-2.5">
            <li className="list-none">
              <a href="https://www.facebook.com/whiteyakpashmina" target="_blank" rel="noopener noreferrer" className="w-[32px] h-[32px] lg:w-[36px] lg:h-[36px] rounded-full border border-gray-200 flex items-center justify-center group hover:bg-primary hover:border-primary transition-all duration-300 shadow-sm">
                <FaFacebookF className="text-[13px] lg:text-[16px] text-gray-500 group-hover:text-white transition-colors duration-300" />
              </a>
            </li>
            <li className="list-none">
              <a href="https://www.youtube.com/@whiteyakpashmina" target="_blank" rel="noopener noreferrer" className="w-[32px] h-[32px] lg:w-[36px] lg:h-[36px] rounded-full border border-gray-200 flex items-center justify-center group hover:bg-primary hover:border-primary transition-all duration-300 shadow-sm">
                <AiOutlineYoutube className="text-[15px] lg:text-[19px] text-gray-500 group-hover:text-white transition-colors duration-300" />
              </a>
            </li>
            <li className="list-none">
              <a href="https://www.pinterest.com/whiteyakpashmina" target="_blank" rel="noopener noreferrer" className="w-[32px] h-[32px] lg:w-[36px] lg:h-[36px] rounded-full border border-gray-200 flex items-center justify-center group hover:bg-primary hover:border-primary transition-all duration-300 shadow-sm">
                <FaPinterestP className="text-[13px] lg:text-[16px] text-gray-500 group-hover:text-white transition-colors duration-300" />
              </a>
            </li>
            <li className="list-none">
              <a href="https://www.instagram.com/whiteyakpashmina" target="_blank" rel="noopener noreferrer" className="w-[32px] h-[32px] lg:w-[36px] lg:h-[36px] rounded-full border border-gray-200 flex items-center justify-center group hover:bg-primary hover:border-primary transition-all duration-300 shadow-sm">
                <FaInstagram className="text-[13px] lg:text-[16px] text-gray-500 group-hover:text-white transition-colors duration-300" />
              </a>
            </li>
          </ul>

          <p className="text-[11px] lg:text-[13px] text-center text-gray-500 mb-0 leading-tight">
            © 2024 White Yak Pashmina. All rights reserved.
          </p>

          <div className="flex items-center gap-2.5 lg:gap-3 text-[22px] lg:text-[30px] text-gray-400">
            <FaCcVisa className="hover:text-[#1A1F71] transition-colors duration-300" />
            <FaCcMastercard className="hover:text-[#EB001B] transition-colors duration-300" />
            <FaCcAmex className="hover:text-[#2E77BC] transition-colors duration-300" />
            <FaCcPaypal className="hover:text-[#003087] transition-colors duration-300" />
          </div>
        </div>
      </div>






      {/* Cart Panel */}
      <Drawer
        open={context.openCartPanel}
        onClose={context.toggleCartPanel(false)}
        anchor={"right"}
        className="cartPanel"
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400 },
            maxWidth: '100%',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
            borderLeft: '1px solid #f0f0f0'
          }
        }}
      >
        <CartPanel data={context?.cartData} />
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
