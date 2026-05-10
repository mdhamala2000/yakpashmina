import React from "react";
import { Link } from "react-router-dom";
import { FaHome, FaChevronRight, FaGavel, FaShieldAlt, FaUserShield, FaHandshake } from "react-icons/fa";

const TermsOfService = () => {
  return (
    <section className="py-8 lg:py-12">
      <div className="container">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-700 to-gray-800 py-8 px-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Terms of Service</h1>
            <p className="text-white/80 mt-2">Last updated: April 2026</p>
          </div>

          <div className="p-6 lg:p-10">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <Link to="/" className="hover:text-primary"><FaHome /></Link>
              <FaChevronRight className="text-xs" />
              <span className="hover:text-primary cursor-pointer">Home</span>
              <FaChevronRight className="text-xs" />
              <span className="text-gray-700">Terms of Service</span>
            </div>

            <div className="prose max-w-none space-y-6">
              <div className="bg-gray-50 p-5 rounded-xl">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FaGavel className="text-gray-600" />
                  1. Acceptance of Terms
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  By accessing and using the White Yak Pashmina website (the "Service"), you accept and agree to be bound by 
                  the terms and provision of this agreement. Additionally, when using White Yak Pashmina's services, you agree 
                  to act in accordance with our policies and guidelines.
                </p>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FaUserShield />
                  2. User Account Responsibilities
                </h2>
                <p className="text-gray-600 leading-relaxed mb-3">
                  To access certain features of our Service, you may be required to create an account. You agree to:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
                  <li>Provide accurate and complete registration information</li>
                  <li>Maintain the security of your account and password</li>
                  <li>Accept responsibility for all activities that occur under your account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                  <li>Not share your account credentials with others</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">3. Product Information & Pricing
                </h2>
                <p className="text-gray-600 leading-relaxed mb-3">
                  We strive to provide accurate product information:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
                  <li>All prices are displayed in USD unless otherwise specified</li>
                  <li>We reserve the right to modify prices at any time without notice</li>
                  <li>Product colors may vary slightly from what you see on your screen</li>
                  <li>We reserve the right to limit quantities available for purchase</li>
                  <li>All products are subject to availability</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FaShieldAlt className="text-green-600" />
                  4. Order & Payment Terms
                </h2>
                <p className="text-gray-600 leading-relaxed mb-3">
                  When placing an order, you agree to:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
                  <li>Provide valid payment information and authorization</li>
                  <li>Confirm that you are authorized to use the payment method</li>
                  <li>Accept responsibility for all charges incurred</li>
                  <li>Agree to our refund and return policies</li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-3">
                  We accept major credit cards, PayPal, and other payment methods as displayed on our checkout page.
                </p>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">5. Intellectual Property Rights
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  The Service and all original content, features, and functionality are and will remain the exclusive 
                  property of White Yak Pashmina and its licensors. The Service is protected by copyright, trademark, and 
                  other laws. You may not copy, modify, distribute, sell, or lease any part of our Service without 
                  our prior written consent.
                </p>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FaHandshake className="text-blue-600" />
                  6. User Conduct
                </h2>
                <p className="text-gray-600 leading-relaxed mb-3">
                  You agree NOT to:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
                  <li>Use the Service for any unlawful purpose</li>
                  <li>Attempt to gain unauthorized access to any part of the Service</li>
                  <li>Interfere with or disrupt the Service or servers</li>
                  <li>Upload or transmit viruses or harmful code</li>
                  <li>Collect or store personal data about other users</li>
                  <li>Post false, misleading, or defamatory content</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">7. Limitation of Liability
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  In no event shall White Yak Pashmina, nor its directors, employees, partners, agents, suppliers, or affiliates, 
                  be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, 
                  loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of or inability to 
                  use the Service.
                </p>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">8. Governing Law
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of Nepal, without regard to 
                  its conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive 
                  jurisdiction of the courts of Kathmandu, Nepal.
                </p>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">9. Changes to Terms
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will 
                  provide notice of any significant changes. Your continued use of the Service after any such changes 
                  constitutes acceptance of the new Terms.
                </p>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">10. Contact Us
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us:
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

export default TermsOfService;
