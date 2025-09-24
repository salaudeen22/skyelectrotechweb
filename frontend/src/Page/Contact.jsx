import { useState, useEffect } from 'react';
import { FiMail, FiPhone, FiMapPin, FiClock } from 'react-icons/fi';
import SEO from '../Components/SEO';
import { Helmet } from 'react-helmet';

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
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Generate structured data for local business
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "SkyElectroTech",
    "description": "Your trusted partner for electronics and industrial automation components in Bangalore, Karnataka",
    "url": "https://skyelectrotech.com",
    "telephone": "+916361241811",
    "email": "skyelectrotechblr@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "2nd Floor, No 140, Sadar Patrappa Rd, Thigalarpet, Kumbarpet, Dodpete",
      "addressLocality": "Nagarathpete, Bengaluru",
      "addressRegion": "Karnataka",
      "postalCode": "560002",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 12.964653787350109,
      "longitude": 77.57936717531959
    },
    "openingHours": [
      "Mo-Fr 10:30-19:30",
      "Sa 10:30-19:30", 
      "Su 10:30-14:30"
    ],
    "priceRange": "$$",
    "servesCuisine": null,
    "hasMap": "https://www.google.com/maps/place/Sky+Electro+Tech/@12.964653787350109,77.57936717531959,17z",
    "sameAs": [
      "https://www.facebook.com/skyelectrotech",
      "https://www.instagram.com/skyelectrotech"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": 150
    },
    "potentialAction": {
      "@type": "ReserveAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "tel:+916361241811"
      },
      "result": {
        "@type": "Reservation",
        "name": "Phone consultation"
      }
    }
  };

  const contactPageStructuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact SkyElectroTech - Electronics & Automation Components",
    "description": "Contact SkyElectroTech for Arduino, Raspberry Pi, sensors, motors, PLCs, and industrial automation components. Get technical support and product assistance.",
    "url": "https://skyelectrotech.com/contact",
    "mainEntity": {
      "@type": "Organization",
      "name": "SkyElectroTech",
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "telephone": "+916361241811",
          "contactType": "customer service",
          "areaServed": "IN",
          "availableLanguage": ["English", "Hindi", "Kannada"]
        },
        {
          "@type": "ContactPoint",
          "email": "skyelectrotechblr@gmail.com",
          "contactType": "technical support",
          "areaServed": "IN",
          "availableLanguage": ["English", "Hindi"]
        }
      ]
    }
  };

  return (
    <>
      <SEO 
        title="Contact SkyElectroTech - Electronics Store Bangalore | Technical Support & Customer Service"
        description="Contact SkyElectroTech for Arduino, Raspberry Pi, sensors, PLCs & automation components. Get technical support, product help & customer service. Located in Bangalore, Karnataka. Call +91 6361241811"
        keywords="contact SkyElectroTech Bangalore, electronics store contact, Arduino support, Raspberry Pi help, technical support electronics, automation components Bangalore, electronics customer service"
        canonical="https://skyelectrotech.in/contact"
      />
      
      <Helmet>
        {/* Enhanced SEO Meta Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Contact SkyElectroTech - Electronics & Automation Components Store Bangalore" />
        <meta property="og:description" content="Get in touch with SkyElectroTech for Arduino, Raspberry Pi, sensors, PLCs & industrial automation components. Technical support & customer service available." />
        <meta property="og:url" content="https://skyelectrotech.in/contact" />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:site_name" content="SkyElectroTech" />
        
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Contact SkyElectroTech - Electronics Store Bangalore" />
        <meta name="twitter:description" content="Contact us for Arduino, Raspberry Pi, sensors & automation components. Technical support available." />
        
        {/* Local Business Schema */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        
        {/* Contact Page Schema */}
        <script type="application/ld+json">
          {JSON.stringify(contactPageStructuredData)}
        </script>
        
        {/* Additional SEO Tags */}
        <meta name="geo.region" content="IN-KA" />
        <meta name="geo.placename" content="Bangalore, Karnataka" />
        <meta name="geo.position" content="12.964653787350109;77.57936717531959" />
        <meta name="ICBM" content="12.964653787350109, 77.57936717531959" />
        
        <link rel="alternate" hrefLang="en-in" href="https://skyelectrotech.com/contact" />
        <link rel="alternate" hrefLang="x-default" href="https://skyelectrotech.com/contact" />
      </Helmet>
      <div className="bg-gray-50 min-h-screen flex flex-col">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1">
          {/* SEO-Optimized Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Contact SkyElectroTech - Electronics Store Bangalore
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-4xl mx-auto px-2">
              Get technical support for Arduino, Raspberry Pi, sensors, PLCs and industrial automation components. 
              Located in Bangalore, Karnataka. Expert assistance for all your electronics projects.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">📍 Bangalore, Karnataka</span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">📞 +91 6361241811</span>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">⏰ Mon-Sat 10:30 AM - 7:30 PM</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
            {/* Contact Information */}
            <div className="space-y-6 sm:space-y-8">
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Contact Information - SkyElectroTech Electronics Store
                </h2>
                
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      <FiMail className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Email - Technical Support</h3>
                      <p className="text-sm sm:text-base text-gray-600 break-all">
                        <a href="mailto:skyelectrotechblr@gmail.com" className="hover:text-blue-600">
                          skyelectrotechblr@gmail.com
                        </a>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">For technical support, product inquiries, and customer service</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      <FiPhone className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Phone - Customer Service</h3>
                      <p className="text-sm sm:text-base text-gray-600">
                        <a href="tel:+916361241811" className="hover:text-blue-600 font-medium">+91 063612 41811</a>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Arduino, Raspberry Pi, sensors, PLCs & automation support</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      <FiMapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Store Address - Bangalore</h3>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                        <strong>SkyElectroTech Electronics Store</strong><br />
                        2nd Floor, No 140, Sadar Patrappa Rd<br />
                        Thigalarpet, Kumbarpet, Dodpete<br />
                        Nagarathpete, Bengaluru, Karnataka 560002<br />
                        India
                      </p>
                      <p className="text-xs text-gray-500 mt-2">Near major electronics markets in Bangalore</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      <FiClock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Store Hours - Electronics Support</h3>
                      <div className="space-y-1">
                        <p className="text-sm sm:text-base text-gray-600"><strong>Monday - Friday:</strong> 10:30 AM - 7:30 PM</p>
                        <p className="text-sm sm:text-base text-gray-600"><strong>Saturday:</strong> 10:30 AM - 7:30 PM</p>
                        <p className="text-sm sm:text-base text-gray-600"><strong>Sunday:</strong> 10:30 AM - 2:30 PM</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Technical support available during store hours</p>
                    </div>
                  </div>
                </div>
              </div>

            

            </div>

            {/* Contact Form - Compact design */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5 max-h-fit">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                Contact Form - Get Electronics Support
              </h2>
              <p className="text-sm text-gray-600 mb-3">
                Need help with Arduino, Raspberry Pi, sensors, PLCs or industrial automation? 
                Fill out the form below and our technical experts will get back to you promptly.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter subject"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical min-h-[80px]"
                    placeholder="Enter your message"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md text-sm font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
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