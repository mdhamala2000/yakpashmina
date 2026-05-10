import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaCalendarAlt, FaUser, FaHeart, FaBookmark, FaShareAlt, FaTag, FaArrowRight, FaQuoteLeft } from 'react-icons/fa';
import { fetchDataFromApi } from '../../utils/api';

const BlogDetails = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    fetchDataFromApi(`/api/blog/${id}`).then((res) => {
      if (res?.blog) {
        setBlog(res.blog);
        fetchDataFromApi("/api/blog").then((res2) => {
          if (res2?.blogs) {
            setRelatedBlogs(res2.blogs.filter(b => b._id !== id).slice(0, 4));
          }
        });
      } else {
        setError("Blog not found");
      }
      setLoading(false);
    }).catch(() => {
      setError("Error loading blog");
      setLoading(false);
    });
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="container py-8">
          <div className="animate-pulse">
            <div className="bg-slate-200 h-64 rounded-2xl mb-6"></div>
            <div className="bg-slate-200 h-4 w-24 rounded mb-4"></div>
            <div className="bg-slate-200 h-8 w-full rounded mb-3"></div>
            <div className="bg-slate-200 h-8 w-3/4 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center py-16">
        <div className="container text-center max-w-sm">
          <div className="text-6xl text-slate-200 font-bold mb-4">404</div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Article Not Found</h1>
          <p className="text-slate-500 text-sm mb-5">The article you're looking for doesn't exist.</p>
          <Link to="/blog" className="inline-block px-6 py-3 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-colors">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const blogDate = blog.createdAt || new Date().toISOString();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Breadcrumb */}
      <div className="bg-white py-4 border-b border-slate-200 sticky top-0 z-30">
        <div className="container">
          <Link to="/blog" className="inline-flex items-center gap-2 text-slate-500 hover:text-orange-500 text-sm font-medium transition-colors">
            <FaArrowLeft className="text-xs" /> Back to Articles
          </Link>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <article className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Image */}
              <div className="h-56 sm:h-72 lg:h-80 bg-slate-100 relative">
                <img 
                  src={blog.images?.[0] || 'https://images.unsplash.com/photo-1558618666-fda25fe75f48?w=1200'} 
                  alt={blog.title}
                  className="w-full h-full object-contain"
                />
                {blog.category && (
                  <span className="absolute top-4 left-4 px-3 py-1.5 bg-orange-500 text-white text-xs font-semibold rounded-full shadow-lg">
                    {blog.category}
                  </span>
                )}
              </div>
              
              <div className="p-6 sm:p-8">
                {/* Meta */}
                <div className="flex items-center gap-4 mb-5 flex-wrap">
                  <span className="flex items-center gap-1.5 text-slate-400 text-xs">
                    <FaCalendarAlt className="text-[10px]" /> {formatDate(blogDate)}
                  </span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className="text-slate-400 text-xs">5 min read</span>
                </div>
                
                {/* Title */}
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-4 leading-tight">
                  {blog.title}
                </h1>
                
                {/* Excerpt */}
                {blog.excerpt && (
                  <div className="bg-gradient-to-r from-orange-50 to-transparent border-l-4 border-orange-500 p-4 rounded-r-lg mb-6">
                    <div className="flex items-start gap-3">
                      <FaQuoteLeft className="text-orange-500 mt-0.5 text-sm" />
                      <p className="text-slate-600 text-sm italic leading-relaxed">
                        {blog.excerpt}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Author & Actions */}
                <div className="flex items-center justify-between py-5 border-t border-b border-slate-100 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                      <FaUser className="text-slate-400 text-sm" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{blog.author || 'Admin'}</p>
                      <p className="text-[11px] text-slate-400">{formatDate(blogDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setLiked(!liked)} 
                      className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${liked ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500'}`}
                    >
                      <FaHeart className="text-sm" />
                    </button>
                    <button 
                      onClick={() => setBookmarked(!bookmarked)} 
                      className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${bookmarked ? 'bg-blue-50 text-blue-500' : 'bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-500'}`}
                    >
                      <FaBookmark className="text-sm" />
                    </button>
                    <button className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                      <FaShareAlt className="text-sm" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed [&_p]:mb-4 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-slate-900 [&_img]:rounded-xl [&_img]:my-4 [&_img]:w-full [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:list-disc [&_ol]:pl-5 [&_ol]:mb-4 [&_ol]:list-decimal [&_a]:text-orange-500 [&_a]:underline">
                  <div dangerouslySetInnerHTML={{ __html: blog.description || '<p>No content available.</p>' }} />
                </div>
              </div>
            </article>

            {/* Share Section */}
            <div className="mt-6 bg-white rounded-2xl shadow-sm p-5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-slate-600 text-sm font-medium">Share this article:</span>
                  <div className="flex gap-2">
                    <button className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white transition-all">
                      <FaShareAlt className="text-sm" />
                    </button>
                    <button 
                      onClick={() => setLiked(!liked)} 
                      className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${liked ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-red-500 hover:text-white'}`}
                    >
                      <FaHeart className="text-sm" />
                    </button>
                  </div>
                </div>
                <Link to="/blog" className="text-orange-500 text-sm font-medium flex items-center gap-2 hover:gap-3 transition-all">
                  View More Articles <FaArrowRight className="text-xs" />
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-5">
            {/* Related Articles */}
            {relatedBlogs.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 bg-orange-500 rounded-full"></div>
                  <h3 className="text-base font-bold text-slate-900">Related Articles</h3>
                </div>
                <div className="space-y-4">
                  {relatedBlogs.map((related) => (
                    <Link key={related._id} to={`/blog/${related._id}`} className="block group">
                      <div className="flex gap-3">
                        <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                          <img 
                            src={related.images?.[0] || 'https://images.unsplash.com/photo-1558618666-fda25fe75f48?w=100'} 
                            alt=""
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 line-clamp-2 group-hover:text-orange-600 transition-colors leading-tight">
                            {related.title}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            {new Date(related.createdAt || new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-orange-500 rounded-full"></div>
                <h3 className="text-base font-bold text-slate-900">Categories</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Pashmina', 'Fashion', 'Crafts', 'Design', 'Culture', 'Lifestyle'].map((cat) => (
                  <Link 
                    key={cat}
                    to="/blog"
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium rounded-full hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter Box */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-center">
              <FaQuoteLeft className="text-orange-400 text-xl mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-2">Stay Updated</h3>
              <p className="text-slate-400 text-xs mb-4">Get the latest articles delivered to your inbox</p>
              <input 
                type="email" 
                placeholder="Your email" 
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-orange-500 mb-2"
              />
              <button className="w-full py-2.5 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors">
                Subscribe
              </button>
            </div>

            {/* View All Button */}
            <Link to="/blog" className="block w-full py-3 bg-orange-500 text-white text-center rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors">
              View All Articles
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetails;