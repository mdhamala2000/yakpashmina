import Button from "@mui/material/Button";
import React, { useContext, useEffect, useState } from "react";
import { RiMenu2Fill } from "react-icons/ri";
import { LiaAngleDownSolid } from "react-icons/lia";
import { Link } from "react-router-dom";
import { GoRocket } from "react-icons/go";
import CategoryPanel from "./CategoryPanel";

import "../Navigation/style.css";
import { MyContext } from "../../../App";
import MobileNav from "./MobileNav";

const Navigation = (props) => {
  const [isOpenCatPanel, setIsOpenCatPanel] = useState(false);
  const [catData, setCatData] = useState([]);

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
                  <Button className="link transition !font-[500] !text-[rgba(0,0,0,0.8)] hover:!text-[#ff5252] !py-4">
                    Home
                  </Button>
                </Link>
              </li>

              <li className="list-none">
                <Link to="/products" className="link transition text-[14px] font-[500] cursor-pointer">
                  <Button className="link transition !font-[500] !text-[rgba(0,0,0,0.8)] hover:!text-[#ff5252] !py-4">
                    Shop
                  </Button>
                </Link>
              </li>

              {
                catData?.length !== 0 && catData?.map((cat, index) => {
                  return (
                    <li className="list-none relative" key={index}>
                      <Link to={`/category/${cat?._id}`} className="link transition text-[14px] font-[500] cursor-pointer">
                        <Button className="link transition !font-[500] !text-[rgba(0,0,0,0.8)] hover:!text-[#ff5252] !py-4">
                          {cat?.name}
                        </Button>
                      </Link>

                      {
                        cat?.children?.length > 0 &&
                        <div className="submenu absolute top-[120%] left-[0%] min-w-[200px] bg-white shadow-lg rounded-lg opacity-0 invisible transition-all z-50 border border-gray-100">
                          <ul className="py-2">
                            {
                              cat?.children?.map((subCat, index_) => (
                                <li className="list-none w-full relative" key={index_}>
                                  <Link to={`/category/${subCat?._id}`} className="w-full cursor-pointer">
                                    <Button className="!text-[rgba(0,0,0,0.8)] w-full !text-left !justify-start !rounded-none hover:!bg-gray-50 !py-2 !px-4 !text-[13px]">
                                      {subCat?.name}
                                    </Button>
                                  </Link>
                                </li>
                              ))
                            }
                          </ul>
                        </div>
                      }
                    </li>
                  )
                })
              }

              <li className="list-none">
                <Link to="/blog" className="link transition text-[14px] font-[500] cursor-pointer">
                  <Button className="link transition !font-[500] !text-[rgba(0,0,0,0.8)] hover:!text-[#ff5252] !py-4">
                    Blog
                  </Button>
                </Link>
              </li>

              <li className="list-none">
                <Link to="/all-reviews" className="link transition text-[14px] font-[500] cursor-pointer">
                  <Button className="link transition !font-[500] !text-[rgba(0,0,0,0.8)] hover:!text-[#ff5252] !py-4">
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