import { useState, useEffect } from 'react';
import { FiMail, FiPhone, FiMapPin, FiClock } from 'react-icons/fi';
import SEO from '../Components/SEO';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Contact form submitted:', formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <SEO 
        title="Contact Us - SkyElectroTech"
        description="Get in touch with SkyElectroTech for technical support, product inquiries, or customer service. We're here to help with your electronics and automation needs."
        keywords="contact SkyElectroTech, customer support, technical help, electronics support, automation support"
      />
      <div className="bg-gray-50 min-h-screen flex flex-col">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Contact Us</h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              We're here to help with your electronics and automation needs. Get in touch with us today.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
            {/* Contact Information */}
            <div className="space-y-6 sm:space-y-8">
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Get in Touch</h2>
                
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      <FiMail className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Email</h3>
                      <p className="text-sm sm:text-base text-gray-600 break-all">skyelectrotechblr@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      <FiPhone className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Phone</h3>
                      <p className="text-sm sm:text-base text-gray-600">
                        <a href="tel:+916361241811" className="hover:text-blue-600">+91 063612 41811</a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      <FiMapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Address</h3>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                        SkyElectroTech<br />
                        2nd Floor, No 140, Sadar Patrappa Rd<br />
                        Thigalarpet, Kumbarpet, Dodpete<br />
                        Nagarathpete, Bengaluru, Karnataka 560002<br />
                        India
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      <FiClock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Business Hours</h3>
                      <p className="text-sm sm:text-base text-gray-600">Monday - Friday: 10:30 AM - 7:30 PM</p>
                      <p className="text-sm sm:text-base text-gray-600">Saturday: 10:30 AM - 7:30 PM</p>
                      <p className="text-sm sm:text-base text-gray-600">Sunday: 10:30 AM - 2:30 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Google Maps */}
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Find Us</h2>
                <div className="w-full h-64 sm:h-80 rounded-lg overflow-hidden">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.112478761705!2d77.57936717531959!3d12.964653787350109!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae150076391a2b%3A0x8f80be7dae9c0a59!2sSky%20Electro%20Tech!5e0!3m2!1sen!2sin!4v1756483257812!5m2!1sen!2sin" 
                    width="100%" 
                    height="100%" 
                    style={{border: 0}} 
                    allowFullScreen="" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="SkyElectroTech Location"
                  />
                </div>
                <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600">
                  <p className="font-semibold">Business Hours:</p>
                  <p>Monday - Friday: 10:30 AM - 7:30 PM</p>
                  <p>Saturday: 10:30 AM - 7:30 PM</p>
                  <p>Sunday: 10:30 AM - 2:30 PM</p>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Frequently Asked Questions</h2>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900">How long does shipping take?</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Standard delivery takes 3-5 business days across India.</p>
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900">Do you offer technical support?</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Yes, we provide technical support for all our products.</p>
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900">What payment methods do you accept?</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">We accept all major credit cards, UPI, and net banking.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter subject"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                    placeholder="Enter your message"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-md text-sm sm:text-base font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Send Message
                </button>
              </form>

              {/* Contact alternatives for mobile */}
              <div className="mt-6 pt-6 border-t border-gray-200 sm:hidden">
                <p className="text-xs text-gray-600 mb-3">Or contact us directly:</p>
                <div className="flex flex-col space-y-2">
                  <a
                    href="tel:+916361241811"
                    className="flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    <FiPhone className="w-4 h-4" />
                    <span>Call Now</span>
                  </a>
                  <a
                    href="mailto:skyelectrotechblr@gmail.com"
                    className="flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    <FiMail className="w-4 h-4" />
                    <span>Send Email</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact; 