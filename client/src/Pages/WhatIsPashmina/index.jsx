import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronRight, FaQuoteLeft, FaAward, FaHands, FaMountain } from 'react-icons/fa';

const WhatIsPashmina = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    alert('Thank you for subscribing!');
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gray-100 py-10 md:py-14 border-b border-gray-200">
        <div className="container text-center">
          <span className="inline-block px-3 py-1.5 bg-orange-100 text-orange-600 text-xs font-medium rounded-full mb-4">
            Our Heritage
          </span>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            What is <span className="text-orange-500">Pashmina</span>?
          </h1>
          <p className="text-gray-500 text-sm max-w-lg mx-auto">
            Discover the royal heritage of Nepal's finest textile
          </p>
        </div>
      </section>

      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Introduction */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaMountain className="text-orange-500" />
                The Golden Fiber of the Himalayas
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Pashmina, derived from the Persian word "pashm" meaning "soft gold," is one of the finest and most luxurious textiles in the world. In Nepal, this exquisite wool has been crafted for centuries, passed down through generations of master artisans who have perfected the art of weaving.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                The word "Pashmina" is often used interchangeably with "Cashmere," but true Pashmina specifically refers to the wool harvested from the Changthangi goats that thrive in the high altitudes of the Nepalese Himalayas, particularly in the Dolpa and Mustang regions.
              </p>
            </div>

            {/* Origin */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaHands className="text-orange-500" />
                Nepal's Timeless Tradition
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                For over 500 years, Nepal has been the heartland of Pashmina weaving. The craft was introduced to the Kathmandu Valley by the Newar artisans, and today, the city remains a global hub for authentic Pashmina products. The intricate designs and superior quality of Nepalese Pashmina are unmatched anywhere in the world.
              </p>
              <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                <div className="flex items-start gap-3">
                  <FaQuoteLeft className="text-orange-500 mt-1" />
                  <p className="text-gray-700 text-sm italic">
                    "Pashmina is not just a fabric; it's a story of Himalayan mountains, resilient goats, and the nimble fingers of Nepali artisans who transform raw wool into poetry."
                  </p>
                </div>
              </div>
            </div>

            {/* How it's made */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">How Pashmina is Made</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-orange-600 text-xs font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Harvesting</h4>
                    <p className="text-xs text-gray-500 mt-1">Each spring, herders carefully comb the undercoat of Changthangi goats to collect the fine wool without harming the animals.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-orange-600 text-xs font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Sorting & Cleaning</h4>
                    <p className="text-xs text-gray-500 mt-1">The raw wool is meticulously sorted by hand to remove impurities, then washed to remove natural oils.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-orange-600 text-xs font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Spinning</h4>
                    <p className="text-xs text-gray-500 mt-1">Master spinners use traditional spinning wheels to create fine threads, a skill passed down through generations.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-orange-600 text-xs font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Weaving</h4>
                    <p className="text-xs text-gray-500 mt-1">Expert weavers create intricate patterns using handlooms, a process that can take weeks to complete a single scarf.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Characteristics */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaAward className="text-orange-500" />
                What Makes Nepalese Pashmina Special
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-1.5"></span>
                  <span className="text-gray-600 text-sm"><strong>Ultra Fine Fiber:</strong> At just 12-15 microns, our Pashmina is finer than human hair.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-1.5"></span>
                  <span className="text-gray-600 text-sm"><strong>Handcrafted Excellence:</strong> Each piece is meticulously made by skilled artisans.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-1.5"></span>
                  <span className="text-gray-600 text-sm"><strong>Timeless Durability:</strong> With proper care, Pashmina lasts for generations.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-1.5"></span>
                  <span className="text-gray-600 text-sm"><strong>Temperature Adaptive:</strong> Naturally warm in winter, cool in summer.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-1.5"></span>
                  <span className="text-gray-600 text-sm"><strong>Lightweight Luxury:</strong> Incredibly warm yet feather-light to wear.</span>
                </li>
              </ul>
            </div>

            {/* Care Instructions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Caring for Your Pashmina</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Do's</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Store in a dry place</li>
                    <li>• Use padded hangers</li>
                    <li>• Dry clean occasionally</li>
                    <li>• Fold instead of hanging</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Don'ts</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Avoid direct sunlight</li>
                    <li>• Don't use harsh chemicals</li>
                    <li>• Never machine wash</li>
                    <li>• Avoid frequent wearing</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Quick Facts */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Quick Facts</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Origin</span>
                  <span className="text-gray-900 font-medium">Nepal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Fiber Diameter</span>
                  <span className="text-gray-900 font-medium">12-15 microns</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Goat Breed</span>
                  <span className="text-gray-900 font-medium">Changthangi</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Altitude</span>
                  <span className="text-gray-900 font-medium">14,000+ ft</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Production</span>
                  <span className="text-gray-900 font-medium">100% Handmade</span>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Our Pashmina Products</h3>
              <div className="space-y-2">
                {['Pashmina Shawls', 'Pashmina Scarves', 'Pashmina Wraps', 'Pashmina Stoles', 'Custom Designs'].map((item, idx) => (
                  <Link key={idx} to="/products" className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors group">
                    <span className="text-xs text-gray-600 group-hover:text-orange-600">{item}</span>
                    <FaChevronRight className="text-[10px] text-gray-400 group-hover:text-orange-500" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 text-center">
              <h3 className="text-sm font-bold text-white mb-2">Stay Updated</h3>
              <p className="text-xs text-slate-400 mb-3">Get the latest Pashmina news</p>
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs placeholder-slate-400 focus:outline-none"
                />
                <button className="w-full py-2 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600">
                  Subscribe
                </button>
              </form>
            </div>

            {/* CTA */}
            <Link to="/products" className="block w-full py-3 bg-orange-500 text-white text-center rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors">
              Shop Pashmina
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatIsPashmina;