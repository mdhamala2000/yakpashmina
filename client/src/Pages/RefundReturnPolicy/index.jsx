import React from "react";
import { Link } from "react-router-dom";
import { FaHome, FaChevronRight, FaExchangeAlt, FaMoneyBillWave, FaBoxOpen } from "react-icons/fa";

const RefundReturnPolicy = () => {
  return (
    <section className="py-8 lg:py-12">
      <div className="container">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 py-8 px-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Refund & Return Policy</h1>
            <p className="text-white/80 mt-2">Last updated: April 2026</p>
          </div>

          <div className="p-6 lg:p-10">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <Link to="/" className="hover:text-primary"><FaHome /></Link>
              <FaChevronRight className="text-xs" />
              <span className="hover:text-primary cursor-pointer">Home</span>
              <FaChevronRight className="text-xs" />
              <span className="text-green-600">Refund & Return Policy</span>
            </div>

            <div className="prose max-w-none space-y-6">
              <div className="bg-green-50 p-5 rounded-xl border-l-4 border-green-500">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FaExchangeAlt className="text-green-600" />
                  1. Our Return Policy
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  At White Yak Pashmina, we want you to love your purchase. If for any reason you are not completely satisfied 
                  with your order, you may return most items within 30 days of delivery for a full refund or exchange. 
                  Please note that certain items are not eligible for return due to hygiene reasons or final sale classifications.
                </p>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FaBoxOpen />
                  2. Eligible Items
                </h2>
                <p className="text-gray-600 leading-relaxed mb-3">To be eligible for a return, your item must be:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
                  <li>In the same condition that you received it</li>
                  <li>With all original tags, packaging, and accessories</li>
                  <li>Unworn, unwashed, and undamaged</li>
                  <li>Accompanied by the original receipt or proof of purchase</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FaMoneyBillWave className="text-green-600" />
                  3. Refund Process
                </h2>
                <p className="text-gray-600 leading-relaxed mb-3">
                  Once we receive and inspect your returned item, we will notify you about the status of your refund:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
                  <li><strong>Approved Refunds:</strong> Processed within 5-9 business days</li>
                  <li><strong>Original Shipping Costs:</strong> Non-refundable unless the return is due to our error</li>
                  <li><strong>Refund Method:</strong> Same as your original payment method</li>
                  <li><strong>Store Credit:</strong> Optional alternative with 10% bonus value</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">4. How to Return</h2>
                <p className="text-gray-600 leading-relaxed mb-3">Follow these simple steps to return your item:</p>
                <div className="space-y-3 ml-2">
                  <div className="flex gap-3 items-start">
                    <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0">1</span>
                    <p className="text-gray-600">Contact our customer service team to request a return authorization</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0">2</span>
                    <p className="text-gray-600">Pack the item securely in original packaging with all accessories</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0">3</span>
                    <p className="text-gray-600">Ship the package using a trackable shipping method</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0">4</span>
                    <p className="text-gray-600">Allow 5-9 business days for the refund to process after we receive the return</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 p-5 rounded-xl border-l-4 border-red-500">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">5. Non-Returnable Items</h2>
                <p className="text-gray-600 leading-relaxed mb-3">The following items cannot be returned:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
                  <li>Intimate apparel, swimwear, or undergarments</li>
                  <li>Items marked as "Final Sale" or "Clearance"</li>
                  <li>Personal care items that have been used</li>
                  <li>Gift cards or downloadable software</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">6. Exchanges</h2>
                <p className="text-gray-600 leading-relaxed">
                  If you need to exchange an item for a different size, color, or product, simply return the original item 
                  and place a new order for the desired item. This ensures faster processing and availability.
                </p>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">7. Contact Us</h2>
                <p className="text-gray-600 leading-relaxed">
                  If you have any questions about our return policy, please contact us:
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

export default RefundReturnPolicy;
