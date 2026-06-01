import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { MyContext } from "../../App";
import { FaHome, FaChevronRight, FaStore, FaBlog, FaStar, FaEnvelope, FaInfoCircle, FaBox, FaUser, FaHeart, FaClipboardList, FaShoppingCart, FaCreditCard, FaLock, FaTruck, FaUndo, FaFileContract } from "react-icons/fa";
import { FiGrid, FiScissors, FiPackage, FiLayers } from "react-icons/fi";

const catIconMap = {
  clothing: <FiScissors className="text-xl" />,
  accessories: <FiGrid className="text-xl" />,
  'home-decor': <FiPackage className="text-xl" />,
  default: <FiLayers className="text-xl" />,
};

const Sitemap = () => {
  const context = useContext(MyContext);
  const catData = context?.catData || [];

  const topCategories = catData.filter(cat => !cat.parentId);

  const mainPages = [
    { label: 'Home', to: '/', icon: <FaHome /> },
    { label: 'All Products', to: '/products', icon: <FaStore /> },
    { label: 'Blog', to: '/blog', icon: <FaBlog /> },
    { label: 'All Reviews', to: '/all-reviews', icon: <FaStar /> },
    { label: 'Contact Us', to: '/contact', icon: <FaEnvelope /> },
    { label: 'What is Pashmina', to: '/what-is-pashmina', icon: <FaInfoCircle /> },
    { label: 'Order Tracking', to: '/order-tracking', icon: <FaBox /> },
  ];

  const policies = [
    { label: 'Privacy Policy', to: '/privacy-policy', icon: <FaLock /> },
    { label: 'Refund and Return Policy', to: '/refund-return-policy', icon: <FaUndo /> },
    { label: 'Shipping Policy', to: '/shipping-policy', icon: <FaTruck /> },
    { label: 'Terms of Service', to: '/terms-of-service', icon: <FaFileContract /> },
  ];

  const account = [
    { label: 'Login', to: '/login', icon: <FaUser /> },
    { label: 'Register', to: '/register', icon: <FaUser /> },
    { label: 'My Account', to: '/my-account', icon: <FaUser /> },
    { label: 'My Wishlist', to: '/my-list', icon: <FaHeart /> },
    { label: 'My Orders', to: '/my-orders', icon: <FaClipboardList /> },
    { label: 'Cart', to: '/cart', icon: <FaShoppingCart /> },
    { label: 'Checkout', to: '/checkout', icon: <FaCreditCard /> },
  ];

  return (
    <section className="py-8 lg:py-12 bg-gray-50/50 min-h-screen">
      <div className="container">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-900 to-gray-700 py-8 px-6 lg:px-10">
            <div className="flex items-center gap-3 text-white/60 text-sm mb-3">
              <Link to="/" className="hover:text-white transition-colors"><FaHome /></Link>
              <FaChevronRight className="text-[10px]" />
              <span className="text-white/80">Pages</span>
              <FaChevronRight className="text-[10px]" />
              <span className="text-white font-medium">Sitemap</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Sitemap</h1>
            <p className="text-white/60 mt-1.5 text-sm">Complete overview of all pages and categories</p>
          </div>

          <div className="p-6 lg:p-10 space-y-10">

            {/* Main Pages */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2.5">
                <span className="w-1 h-5 bg-gray-900 rounded-full"></span>
                Main Pages
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {mainPages.map((page) => (
                  <Link
                    key={page.to}
                    to={page.to}
                    className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all group"
                  >
                    <span className="text-gray-400 group-hover:text-gray-900 transition-colors text-sm">{page.icon}</span>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{page.label}</span>
                  </Link>
                ))}
              </div>
            </section>

            {/* Product Categories */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2.5">
                <span className="w-1 h-5 bg-gray-900 rounded-full"></span>
                Product Categories
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {topCategories.map((cat) => (
                  <div key={cat._id} className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-gray-700">{catIconMap[cat.slug] || catIconMap.default}</span>
                      <Link to={`/category/${cat.slug}`} className="font-semibold text-gray-900 hover:text-gray-600 transition-colors">{cat.name}</Link>
                    </div>
                    {cat.children?.length > 0 && (
                      <ul className="space-y-1.5 ml-9">
                        {cat.children.map((child) => (
                          <li key={child._id}>
                            <Link to={`/category/${cat.slug}/${child.slug}`} className="text-sm text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2">
                              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                              {child.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Account Pages */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2.5">
                <span className="w-1 h-5 bg-gray-900 rounded-full"></span>
                Account
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {account.map((page) => (
                  <Link
                    key={page.to}
                    to={page.to}
                    className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all group"
                  >
                    <span className="text-gray-400 group-hover:text-gray-900 transition-colors text-sm">{page.icon}</span>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{page.label}</span>
                  </Link>
                ))}
              </div>
            </section>

            {/* Policies */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2.5">
                <span className="w-1 h-5 bg-gray-900 rounded-full"></span>
                Customer Service
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {policies.map((page) => (
                  <Link
                    key={page.to}
                    to={page.to}
                    className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all group"
                  >
                    <span className="text-gray-400 group-hover:text-gray-900 transition-colors text-sm">{page.icon}</span>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{page.label}</span>
                  </Link>
                ))}
              </div>
            </section>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Sitemap;
