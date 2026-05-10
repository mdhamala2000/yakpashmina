import React from "react";
import { Link } from "react-router-dom";
import { FaHome, FaChevronRight, FaShippingFast, FaMapMarkedAlt, FaClock, FaBox } from "react-icons/fa";

const ShippingPolicy = () => {
  return (
    <section className="py-8 lg:py-12">
      <div className="container">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 py-8 px-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Shipping Policy</h1>
            <p className="text-white/80 mt-2">Last updated: April 2026</p>
          </div>

          <div className="p-6 lg:p-10">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <Link to="/" className="hover:text-primary"><FaHome /></Link>
              <FaChevronRight className="text-xs" />
              <span className="hover:text-primary cursor-pointer">Home</span>
              <FaChevronRight className="text-xs" />
              <span className="text-blue-600">Shipping Policy</span>
            </div>

            <div className="prose max-w-none space-y-6">
              <div className="bg-blue-50 p-5 rounded-xl border-l-4 border-blue-500">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FaShippingFast className="text-blue-600" />
                  1. Shipping Overview
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  White Yak Pashmina offers worldwide shipping to bring our premium fashion products to customers globally. 
                  We partner with reliable courier services to ensure your orders arrive safely and on time. 
                  Free shipping is available for orders over $100.
                </p>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FaClock />
                  2. Processing Time
                </h2>
                <p className="text-gray-600 leading-relaxed mb-3">
                  All orders are processed within 1-3 business days (excluding weekends and holidays) after order confirmation:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
                  <li><strong>In-Stock Items:</strong> 1-2 business days</li>
                  <li><strong>Custom/Personalized Items:</strong> 5-9 business days</li>
                  <li><strong>Pre-Order Items:</strong> As specified on product page</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FaMapMarkedAlt className="text-blue-600" />
                  3. Delivery Time
                </h2>
                <p className="text-gray-600 leading-relaxed mb-3">
                  Delivery times vary by location and shipping method selected:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-600">
                    <thead className="bg-gray-100 text-gray-700">
                      <tr>
                        <th className="px-4 py-2 rounded-l-lg">Destination</th>
                        <th className="px-4 py-2">Standard Shipping</th>
                        <th className="px-4 py-2">Express Shipping</th>
                        <th className="px-4 py-2 rounded-r-lg">Free Shipping Threshold</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="px-4 py-2">Kathmandu Valley</td>
                        <td className="px-4 py-2">1-2 days</td>
                        <td className="px-4 py-2">Same day</td>
                        <td className="px-4 py-2">N/A</td>
                      </tr>
                      <tr className="border-b">
                        <td className="px-4 py-2">Major Cities (Nepal)</td>
                        <td className="px-4 py-2">2-4 days</td>
                        <td className="px-4 py-2">1-2 days</td>
                        <td className="px-4 py-2">$50</td>
                      </tr>
                      <tr className="border-b">
                        <td className="px-4 py-2">International - Asia</td>
                        <td className="px-4 py-2">5-10 days</td>
                        <td className="px-4 py-2">5-9 days</td>
                        <td className="px-4 py-2">$150</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2">International - Other</td>
                        <td className="px-4 py-2">10-15 days</td>
                        <td className="px-4 py-2">5-9 days</td>
                        <td className="px-4 py-2">$200</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FaBox />
                  4. Shipping Costs
                </h2>
                <p className="text-gray-600 leading-relaxed mb-3">
                  Shipping costs are calculated based on the following factors:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
                  <li>Weight and dimensions of the package</li>
                  <li>Shipping destination</li>
                  <li>Selected shipping method</li>
                  <li>Shipping insurance (optional but recommended)</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">5. Order Tracking</h2>
                <p className="text-gray-600 leading-relaxed mb-3">
                  Once your order ships, you will receive a confirmation email with:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
                  <li>Tracking number</li>
                  <li>Estimated delivery date</li>
                  <li>Direct link to track your package</li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-3">
                  You can also track your order by logging into your account or contacting our customer service.
                </p>
              </div>

              <div className="bg-yellow-50 p-5 rounded-xl border-l-4 border-yellow-500">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">6. Important Notes</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Orders placed on weekends or holidays will be processed on the next business day</li>
                  <li>Customs duties and taxes are not included in shipping costs (for international orders)</li>
                  <li>Shipping times are estimates and may vary due to weather, customs, or other delays</li>
                  <li>We do not ship to P.O. Boxes or APO/FPO addresses for certain items</li>
                  <li>Multiple items in one order may be shipped separately for faster delivery</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">7. Contact Us</h2>
                <p className="text-gray-600 leading-relaxed">
                  For shipping inquiries or to track your order, please contact us:
                  <br /><br />
                  <strong>Email:</strong> mdhamala2000@gmail.com<br />
                  <strong>Phone:</strong> +977 9841321806<br />
                  <strong>WhatsApp:</strong> +852 65492201
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShippingPolicy;
