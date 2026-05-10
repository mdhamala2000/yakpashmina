import React from "react";
import { Link } from "react-router-dom";
import { FaHome, FaSearch } from "react-icons/fa";

function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center px-4">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mt-[-30px]">Page Not Found</h2>
        <p className="text-gray-500 mt-4 mb-8">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors"
          >
            <FaHome />
            <span>Go Home</span>
          </Link>
          <Link
            to="/search"
            className="flex items-center justify-center gap-2 border border-black text-black px-6 py-3 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FaSearch />
            <span>Search Products</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;