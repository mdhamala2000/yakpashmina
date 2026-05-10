import React from "react";
import { Link } from "react-router-dom";
import { FaHome, FaChevronRight } from "react-icons/fa";

const PrivacyPolicy = () => {
  return (
    <section className="py-8 lg:py-12">
      <div className="container">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-[#ff6b6b] py-8 px-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Privacy Policy</h1>
            <p className="text-white/80 mt-2">Last updated: April 2026</p>
          </div>

          <div className="p-6 lg:p-10">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <Link to="/" className="hover:text-primary"><FaHome /></Link>
              <FaChevronRight className="text-xs" />
              <span className="hover:text-primary cursor-pointer">Home</span>
              <FaChevronRight className="text-xs" />
              <span className="text-primary">Privacy Policy</span>
            </div>

            <div className="prose max-w-none space-y-6">
              <div className="bg-gray-50 p-5 rounded-xl">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">1. Introduction</h2>
                <p className="text-gray-600 leading-relaxed">
                  Welcome to White Yak Pashmina. We respect your privacy and are committed to protecting your personal data. 
                  This privacy policy will inform you as to how we look after your personal data when you visit our website 
                  and tell you about your privacy rights and how the law protects you.
                </p>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">2. Data We Collect</h2>
                <p className="text-gray-600 leading-relaxed mb-3">
                  We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
                  <li>Identity Data (name, username, date of birth)</li>
                  <li>Contact Data (email address, telephone numbers, delivery address)</li>
                  <li>Financial Data (payment card details)</li>
                  <li>Transaction Data (details about payments to and from you)</li>
                  <li>Technical Data (internet protocol address, browser type, operating system)</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">3. How We Use Your Data</h2>
                <p className="text-gray-600 leading-relaxed mb-3">
                  We will only use your personal data when legally permitted. The most common ways we use your data include:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
                  <li>To register you as a new customer</li>
                  <li>To process and deliver your orders</li>
                  <li>To manage payments, fees and charges</li>
                  <li>To deliver website content and products to you</li>
                  <li>To communicate with you about your orders</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">4. Data Security</h2>
                <p className="text-gray-600 leading-relaxed">
                  We have put in place appropriate security measures to prevent your personal data from being accidentally lost, 
                  used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data 
                  to those employees, agents, contractors and other third parties who have a business need to know.
                </p>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">5. Your Legal Rights</h2>
                <p className="text-gray-600 leading-relaxed mb-3">
                  Under certain circumstances, you have rights under data protection laws in relation to your personal data, including:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
                  <li>Request access to your personal data</li>
                  <li>Request correction of your personal data</li>
                  <li>Request erasure of your personal data</li>
                  <li>Object to processing of your personal data</li>
                  <li>Request transfer of your personal data</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">6. Contact Us</h2>
                <p className="text-gray-600 leading-relaxed">
                  If you have any questions about this privacy policy or our privacy practices, please contact us at:
                  <br /><br />
                  <strong>Email:</strong> mdhamala2000@gmail.com<br />
                  <strong>Phone:</strong> +977 9841321806<br />
                  <strong>Address:</strong> Narsingh Chowk Marg, Kathmandu 44600, Nepal
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrivacyPolicy;
