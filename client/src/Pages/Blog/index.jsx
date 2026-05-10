import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaCalendarAlt, FaArrowRight, FaQuoteLeft, FaUserCircle } from 'react-icons/fa';
import { fetchDataFromApi } from '../../utils/api';
import SEO from '../../components/SEO';

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 12;

  useEffect(() => {
    fetchDataFromApi("/api/blog").then((res) => {
      if (res?.blogs && res.blogs.length > 0) {
        setBlogs(res.blogs);
      } else {
        setBlogs([]);
      }
      setLoading(false);
    }).catch(() => {
      setBlogs([]);
      setLoading(false);
    });
  }, []);

  const filteredBlogs = useCallback(() => {
    return blogs.filter(blog => 
      blog.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [blogs, searchQuery]);

  const paginatedBlogs = filteredBlogs().slice((currentPage - 1) * blogsPerPage, currentPage * blogsPerPage);
  const totalPages = Math.ceil(filteredBlogs().length / blogsPerPage);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setTimeout(() => {
        setSubscribeStatus('success');
        setEmail('');
        setTimeout(() => setSubscribeStatus(null), 3000);
      }, 500);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getExcerpt = (text, maxLength = 80) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <>
      <SEO 
        title="Blog"
        description="Read our articles about Pashmina, cashmere, and the art of handwoven shawls from Nepal. Learn about the history, craftsmanship, and care of your Pashmina."
        url="/blog"
      />
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Hero Banner */}
      <section className="bg-gray-100 py-10 md:py-14 border-b border-gray-200">
        <div className="container text-center">
          <span className="inline-block px-3 py-1.5 bg-orange-100 text-orange-600 text-xs font-medium rounded-full mb-4">
            Our Blog
          </span>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Stories of <span className="text-orange-500">Craftsmanship</span>
          </h1>
          <p className="text-gray-500 text-sm max-w-lg mx-auto">
            Discover the art, culture, and heritage behind our exquisite collections
          </p>
        </div>
      </section>

      {/* Search Bar */}
      <section className="py-6 bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="container">
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full px-4 py-2.5 pl-10 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:border-orange-500 focus:bg-white transition-all shadow-sm"
            />
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-10">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
              <h3 className="text-lg font-bold text-slate-900">
                {searchQuery ? 'Search Results' : 'Latest Articles'}
              </h3>
            </div>
            <span className="text-slate-400 text-xs">{filteredBlogs().length} articles</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-slate-200 h-40"></div>
                  <div className="p-4">
                    <div className="bg-slate-200 h-3 w-14 rounded mb-3"></div>
                    <div className="bg-slate-200 h-4 w-full rounded mb-2"></div>
                    <div className="bg-slate-200 h-4 w-3/4 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : paginatedBlogs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {paginatedBlogs.map((blog, index) => (
                <Link 
                  key={blog._id} 
                  to={`/blog/${blog._id}`} 
                  className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative h-40 bg-slate-100 overflow-hidden">
                    <img 
                      src={blog.images?.[0] || 'https://images.unsplash.com/photo-1558618666-fda25fe75f48?w=400'} 
                      alt={blog.title}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {blog.category && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-orange-500 text-white text-[10px] font-semibold rounded-full shadow-md">
                        {blog.category}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-slate-400 text-[11px] mb-2.5">
                      <FaCalendarAlt className="text-[10px]" />
                      {formatDate(blog.createdAt)}
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span>{blog.author || 'Admin'}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors leading-tight">
                      {blog.title}
                    </h4>
                    <p className="text-slate-500 text-xs line-clamp-2 mb-3">
                      {getExcerpt(blog.excerpt)}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-orange-500 text-xs font-semibold flex items-center gap-1.5 group-hover:gap-2 transition-all">
                        Read Article 
                        <FaArrowRight className="text-[10px]" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaSearch className="text-orange-500 text-xl" />
              </div>
              <h4 className="text-base font-semibold text-slate-900 mb-2">No articles found</h4>
              <p className="text-slate-500 text-sm mb-4">Try adjusting your search</p>
              {searchQuery && (
                <button 
                  onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                  className="px-5 py-2.5 bg-orange-500 text-white rounded-full text-sm font-medium hover:bg-orange-600 transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-12">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all ${
                  currentPage === 1 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white border border-slate-200 text-slate-600 hover:bg-orange-500 hover:text-white hover:border-orange-500'
                }`}
              >
                ‹
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    currentPage === i + 1 ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-white border border-slate-200 text-slate-600 hover:bg-orange-500 hover:text-white'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all ${
                  currentPage === totalPages ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white border border-slate-200 text-slate-600 hover:bg-orange-500 hover:text-white hover:border-orange-500'
                }`}
              >
                ›
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-14 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-400 rounded-full blur-3xl"></div>
        </div>
        <div className="container relative z-10">
          <div className="max-w-xl mx-auto text-center">
            <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FaQuoteLeft className="text-orange-400 text-lg" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Stay Inspired</h3>
            <p className="text-slate-300 text-sm mb-6 max-w-md mx-auto">
              Subscribe to our newsletter for exclusive articles and updates
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email" 
                required
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-full text-white text-sm placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white/20 transition-all"
              />
              <button 
                type="submit"
                className="px-6 py-3 bg-orange-500 text-white rounded-full text-sm font-semibold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30"
              >
                Subscribe
              </button>
            </form>
            {subscribeStatus === 'success' && (
              <p className="text-green-400 text-sm mt-3">Thanks for subscribing!</p>
            )}
            <p className="text-slate-500 text-xs mt-4">No spam, unsubscribe anytime</p>
          </div>
        </div>
      </section>
    </div>
    </>
  );
};

export default Blog;