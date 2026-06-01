import Button from "@mui/material/Button";
import React, { useContext, useEffect, useState } from "react";
import { RiMenu2Fill } from "react-icons/ri";
import { LiaAngleDownSolid, LiaAngleRightSolid } from "react-icons/lia";
import { Link } from "react-router-dom";
import { GoRocket } from "react-icons/go";
import { HiDotsHorizontal } from "react-icons/hi";
import CategoryPanel from "./CategoryPanel";

import "../Navigation/style.css";
import { MyContext } from "../../../App";
import MobileNav from "./MobileNav";

const MAX_VISIBLE_CATS = 7;

const Navigation = (props) => {
  const [isOpenCatPanel, setIsOpenCatPanel] = useState(false);
  const [catData, setCatData] = useState([]);
  const [moreOpen, setMoreOpen] = useState(false);

  const context = useContext(MyContext);

  useEffect(() => {
    if (context?.catData?.length > 0) {
      const validCats = context.catData.filter(cat => cat.productCount > 0);
      setCatData(validCats);
    }
  }, [context?.catData]);

  useEffect(() => {
    setIsOpenCatPanel(props.isOpenCatPanel);
  }, [props.isOpenCatPanel])

  const openCategoryPanel = () => {
    setIsOpenCatPanel(true);
  };

  const visibleCats = catData.slice(0, MAX_VISIBLE_CATS);
  const extraCats = catData.slice(MAX_VISIBLE_CATS);

  const renderCatButton = (cat) => (
    <Link to={`/category/${cat?._id}`} className="link transition text-[14px] font-[500] cursor-pointer">
      <Button className="link transition nav-link-btn">
        {cat?.name}
      </Button>
    </Link>
  );

  const renderSubmenu = (children) => (
    children?.length > 0 && (
      <div className="submenu absolute top-[120%] left-[0%] min-w-[210px] bg-white shadow-lg rounded-lg opacity-0 invisible transition-all z-50 border border-gray-100">
        <ul className="py-2">
          {children.map((child, idx) => (
            <li className="list-none w-full relative" key={idx}>
              <Link to={`/category/${child?._id}`} className="w-full cursor-pointer">
                <Button className="!text-[rgba(0,0,0,0.8)] w-full !text-left !justify-start !rounded-none hover:!bg-gray-50 !py-2 !px-4 !text-[13px] flex items-center gap-2">
                  <span className="flex-1 truncate">{child?.name}</span>
                  {child?.children?.length > 0 && <LiaAngleRightSolid className="text-[11px] shrink-0" />}
                </Button>
              </Link>
              {renderSubmenu(child?.children)}
            </li>
          ))}
        </ul>
      </div>
    )
  );

  return (
    <>
      <nav className="navigation">
        <div className="container flex items-center justify-start lg:justify-end gap-8">
          {
            context?.windowWidth > 992 && catData.length > 0 &&
            <div className="col_1 w-[20%]">
              <Button
                className="!text-black gap-2 w-full"
                onClick={openCategoryPanel}
              >
                <RiMenu2Fill className="text-[18px]" />
                Shop By Categories
                <LiaAngleDownSolid className="text-[13px] ml-auto font-bold" />
              </Button>
            </div>
          }


          <div className="col_2 w-full lg:w-[60%]">
            <ul className="flex items-center gap-3 nav">
              <li className="list-none">
                <Link to="/" className="link transition text-[14px] font-[500] cursor-pointer">
                  <Button className="link transition nav-link-btn">
                    Home
                  </Button>
                </Link>
              </li>

              <li className="list-none">
                <Link to="/products" className="link transition text-[14px] font-[500] cursor-pointer">
                  <Button className="link transition nav-link-btn">
                    Shop
                  </Button>
                </Link>
              </li>

              {visibleCats.map((cat, index) => (
                <li className="list-none relative" key={cat._id || index}>
                  {renderCatButton(cat)}
                  {renderSubmenu(cat?.children)}
                </li>
              ))}

              {extraCats.length > 0 && (
                <li className="list-none relative" onMouseEnter={() => setMoreOpen(true)} onMouseLeave={() => setMoreOpen(false)}>
                  <Button className="link transition nav-link-btn flex items-center gap-1">
                    <HiDotsHorizontal className="text-[18px]" />
                    <span className="text-[10px] font-semibold bg-gray-200 text-gray-600 rounded-full px-1.5 py-0.5 leading-none">{extraCats.length}</span>
                  </Button>
                  {moreOpen && (
                    <div className="absolute top-full left-0 min-w-[220px] bg-white shadow-xl rounded-lg z-50 border border-gray-200 py-1">
                      {extraCats.map((cat, index) => (
                        <div key={cat._id || index} className="relative group/sub">
                          <Link to={`/category/${cat?._id}`} className="block px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 hover:text-[#ff5252] transition-colors truncate">
                            {cat?.name}
                            {cat?.children?.length > 0 && <span className="float-right mt-0.5"><LiaAngleRightSolid className="text-[11px]" /></span>}
                          </Link>
                          {cat?.children?.length > 0 && (
                            <div className="submenu absolute top-0 left-full min-w-[210px] bg-white shadow-lg rounded-lg opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all z-50 border border-gray-100 ml-1">
                              <ul className="py-2">
                                {cat.children.map((subCat, idx) => (
                                  <li className="list-none w-full relative" key={idx}>
                                    <Link to={`/category/${subCat?._id}`} className="w-full cursor-pointer">
                                      <Button className="!text-[rgba(0,0,0,0.8)] w-full !text-left !justify-start !rounded-none hover:!bg-gray-50 !py-2 !px-4 !text-[13px] flex items-center gap-2">
                                        <span className="flex-1 truncate">{subCat?.name}</span>
                                        {subCat?.children?.length > 0 && <LiaAngleRightSolid className="text-[11px] shrink-0" />}
                                      </Button>
                                    </Link>
                                    {subCat?.children?.length > 0 && (
                                      <div className="submenu absolute top-0 left-full min-w-[210px] bg-white shadow-lg rounded-lg opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all z-50 border border-gray-100 ml-1">
                                        <ul className="py-2">
                                          {subCat.children.map((child, ci) => (
                                            <li className="list-none w-full" key={ci}>
                                              <Link to={`/category/${child?._id}`} className="block px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 hover:text-[#ff5252] transition-colors truncate">
                                                {child?.name}
                                              </Link>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              )}

              <li className="list-none">
                <Link to="/blog" className="link transition text-[14px] font-[500] cursor-pointer">
                  <Button className="link transition nav-link-btn">
                    Blog
                  </Button>
                </Link>
              </li>

              <li className="list-none">
                <Link to="/all-reviews" className="link transition text-[14px] font-[500] cursor-pointer">
                  <Button className="link transition nav-link-btn">
                    Reviews
                  </Button>
                </Link>
              </li>

            </ul>
          </div>

          <div className="col_3 w-[20%] hidden lg:block">
            <p className="text-[14px] font-[500] flex items-center gap-3 mb-0 mt-0">
              <GoRocket className="text-[18px]" />
              Free International Delivery
            </p>
          </div>
        </div>
      </nav>

      {/* category panel component */}
      {
        catData?.length !== 0 &&
        <CategoryPanel
          isOpenCatPanel={isOpenCatPanel}
          setIsOpenCatPanel={setIsOpenCatPanel}
          propsSetIsOpenCatPanel={props.setIsOpenCatPanel}
          data={catData}
        />
      }


      {
        context?.windowWidth < 992 && <MobileNav />
      }



    </>
  );
};

export default Navigation;