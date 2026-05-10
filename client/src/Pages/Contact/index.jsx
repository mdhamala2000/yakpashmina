import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaWhatsapp, FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock, FaPaperPlane, FaChevronRight } from "react-icons/fa";
import TextField from "@mui/material/TextField";
import toast from "react-hot-toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in required fields");
      return;
    }
    setSending(true);
    setTimeout(() => {
      toast.success("Message sent successfully!");
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setSending(false);
    }, 1500);
  };

  const contactInfo = [
    { icon: FaMapMarkerAlt, title: "Visit Our Store", items: ["White Yak Pashmina", "Narsingh Chowk Marg, Kathmandu", "Representative: Hong Kong"] },
    { icon: FaEnvelope, title: "Email Us", items: ["mdhamala2000@gmail.com"], link: "mailto:mdhamala2000@gmail.com" },
    { icon: FaPhone, title: "Call Us", items: ["+977 9841321806", "+977 9851017391"], link: "tel:+9779841321806" },
    { icon: FaWhatsapp, title: "WhatsApp", items: ["+977 9841321806", "+977 9851017391", "+852 65492201"], link: "https://wa.me/9779841321806" },
    { icon: FaClock, title: "Business Hours", items: ["Mon - Sat: 9AM - 8PM", "Sunday: 10AM - 6PM"] }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gray-100 py-8 border-b border-gray-200">
        <div className="container">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link to="/" className="hover:text-orange-500">Home</Link>
            <FaChevronRight className="text-[10px]" />
            <span className="text-gray-700">Contact Us</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Contact Us</h1>
          <p className="text-gray-500 text-sm mt-1 max-w-lg">Have a question? We'd love to hear from you. Our team is here to help.</p>
        </div>
      </section>

      <div className="container py-8">
        {/* Contact Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {contactInfo.map((item, index) => (
            <div key={index} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <item.icon className="text-orange-500 text-lg" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{item.title}</h3>
              {item.link ? (
                <a href={item.link} className="text-xs text-gray-500 hover:text-orange-500 block">
                  {item.items[0]}
                </a>
              ) : (
                <p className="text-xs text-gray-500 leading-tight">
                  {item.items.map((i, idx) => <span key={idx} className="block">{i}</span>)}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Contact Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-1 h-5 bg-orange-500 rounded-full"></span>
              Get In Touch
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                  <FaMapMarkerAlt className="text-orange-500 text-sm" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Store Location</h4>
                  <p className="text-xs text-gray-500 mt-0.5">White Yak Pashmina, Narsingh Chowk Marg, Kathmandu 44600, Nepal</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                  <FaEnvelope className="text-orange-500 text-sm" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Email</h4>
                  <a href="mailto:mdhamala2000@gmail.com" className="text-xs text-orange-500 hover:underline">
                    mdhamala2000@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                  <FaPhone className="text-orange-500 text-sm" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Phone</h4>
                  <a href="tel:+9779841321806" className="text-xs text-orange-500 hover:underline block">
                    +977 9841321806
                  </a>
                  <a href="tel:+9779851017391" className="text-xs text-orange-500 hover:underline block">
                    +977 9851017391
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                  <FaWhatsapp className="text-orange-500 text-sm" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">WhatsApp</h4>
                  <div className="flex flex-col gap-0.5">
                    <a href="https://wa.me/9779841321806" target="_blank" className="text-xs text-orange-500 hover:underline">
                      +977 9841321806
                    </a>
                    <a href="https://wa.me/9779851017391" target="_blank" className="text-xs text-orange-500 hover:underline">
                      +977 9851017391
                    </a>
                    <a href="https://wa.me/85265492201" target="_blank" className="text-xs text-orange-500 hover:underline">
                      +852 65492201
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-1 h-5 bg-orange-500 rounded-full"></span>
              Send Us a Message
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <TextField
                  fullWidth
                  size="small"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  label="Name *"
                  variant="outlined"
                  className="bg-gray-50"
                />
                <TextField
                  fullWidth
                  size="small"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  label="Email *"
                  variant="outlined"
                  className="bg-gray-50"
                />
              </div>
              
              <div className="grid sm:grid-cols-2 gap-3">
                <TextField
                  fullWidth
                  size="small"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  label="Phone"
                  variant="outlined"
                  className="bg-gray-50"
                />
                <TextField
                  fullWidth
                  size="small"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  label="Subject"
                  variant="outlined"
                  className="bg-gray-50"
                />
              </div>
              
              <TextField
                fullWidth
                size="small"
                name="message"
                value={formData.message}
                onChange={handleChange}
                label="Message *"
                multiline
                rows={4}
                variant="outlined"
                className="bg-gray-50"
              />
              
              <button 
                type="submit"
                disabled={sending}
                className="w-full py-2.5 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {sending ? 'Sending...' : (
                  <>
                    <FaPaperPlane className="text-xs" /> Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Map */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d883.0198145149666!2d85.30969479604398!3d27.714839040787517!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb1900766eefb1%3A0x41d692c8639c337c!2swhite%20yak%20pashmina!5e0!3m2!1sen!2shk!4v1776184437242!5m2!1sen!2shk" 
            width="100%" 
            height="350" 
            style={{border: 0}} 
            allowFullScreen="" 
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Location Map"
          />
        </div>
      </div>
    </div>
  );
};

export default Contact;