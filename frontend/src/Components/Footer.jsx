import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa';
import { useSettings } from '../contexts/SettingsContext';

const Footer = () => {
  const { settings } = useSettings();
  
  const socialMediaLinks = [
    {
      name: 'Facebook',
      url: settings?.socialMedia?.facebook,
      icon: FaFacebookF,
      color: 'hover:text-blue-600'
    },
    {
      name: 'Twitter',
      url: settings?.socialMedia?.twitter,
      icon: FaTwitter,
      color: 'hover:text-blue-400'
    },
    {
      name: 'Instagram',
      url: settings?.socialMedia?.instagram,
      icon: FaInstagram,
      color: 'hover:text-pink-600'
    },
    {
      name: 'LinkedIn',
      url: settings?.socialMedia?.linkedin,
      icon: FaLinkedinIn,
      color: 'hover:text-blue-700'
    },
    {
      name: 'YouTube',
      url: settings?.socialMedia?.youtube,
      icon: FaYoutube,
      color: 'hover:text-red-600'
    }
  ];

  const activeSocialLinks = socialMediaLinks.filter(link => link.url && link.url.trim() !== '');
  
  return (
    <footer className="bg-white border-t mt-auto relative z-0"> {/* Added mt-auto and z-index */}
      <div className="max-w-screen-xl mx-auto py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Brand Section */}
        <div className="mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-200">
          <div className="flex items-center justify-center space-x-3">
            <span className="text-2xl sm:text-3xl font-bold text-blue-600">{settings.storeInfo.name}</span>
          </div>
          <p className="text-center text-gray-600 mt-3 sm:mt-4 max-w-md mx-auto text-sm sm:text-base px-4 sm:px-0">
            {settings.storeInfo.description}
          </p>
          
          {/* Social Media Icons */}
          {activeSocialLinks.length > 0 && (
            <div className="flex justify-center space-x-3 sm:space-x-4 mt-4 sm:mt-6">
              {activeSocialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 transition-all duration-300 transform hover:scale-110 hover:bg-gray-200 ${social.color}`}
                    aria-label={`Follow us on ${social.name}`}
                  >
                    <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-500 tracking-wider uppercase">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm sm:text-base text-gray-600 hover:text-blue-600 transition-colors">About</Link></li>
              <li><Link to="/contact" className="text-sm sm:text-base text-gray-600 hover:text-blue-600 transition-colors">Contact</Link></li>
            </ul>
          </div>
          {/* Help & Support */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-500 tracking-wider uppercase">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/contact" className="text-base text-gray-600 hover:text-blue-600">Contact Us</Link></li>
              <li><Link to="/faq" className="text-sm sm:text-base text-gray-600 hover:text-blue-600 transition-colors">FAQs</Link></li>
              <li><Link to="/products" className="text-sm sm:text-base text-gray-600 hover:text-blue-600 transition-colors">Products</Link></li>
            </ul>
          </div>
          {/* Legal */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-500 tracking-wider uppercase">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy-policy" className="text-sm sm:text-base text-gray-600 hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="text-sm sm:text-base text-gray-600 hover:text-blue-600 transition-colors">Terms of Service</Link></li>
              <li><Link to="/shipping-policy" className="text-sm sm:text-base text-gray-600 hover:text-blue-600 transition-colors">Shipping Policy</Link></li>
              <li><Link to="/cancellation-refunds" className="text-sm sm:text-base text-gray-600 hover:text-blue-600 transition-colors">Cancellation & Refunds</Link></li>
            </ul>
          </div>
          {/* Google Maps Location */}
          <div className="space-y-3 sm:space-y-4 col-span-1 sm:col-span-2 md:col-span-1">
             <h3 className="text-xs sm:text-sm font-semibold text-gray-500 tracking-wider uppercase">Visit Our Store</h3>
             <p className="text-sm sm:text-base text-gray-600">Find us at our physical location in Nagarathpete, Bengaluru.</p>
             <div className="w-full h-40 sm:h-48 rounded-lg overflow-hidden border border-gray-300">
               <iframe 
                 src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.112478761705!2d77.57936717531959!3d12.964653787350109!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae150076391a2b%3A0x8f80be7dae9c0a59!2sSky%20Electro%20Tech!5e0!3m2!1sen!2sin!4v1756483257812!5m2!1sen!2sin" 
                 width="100%" 
                 height="100%" 
                 style={{border: 0}} 
                 allowFullScreen="" 
                 loading="lazy" 
                 referrerPolicy="no-referrer-when-downgrade"
                 title="SkyElectroTech Store Location"
               />
             </div>
             <p className="text-xs sm:text-sm text-gray-600">
               2nd Floor, No 140, Sadar Patrappa Rd<br />
               Nagarathpete, Bengaluru - 560002
             </p>
          </div>
        </div>
        <div className="mt-8 sm:mt-10 md:mt-12 border-t border-gray-200 pt-6 sm:pt-8 text-center">
          <p className="text-xs sm:text-sm md:text-base text-gray-500">© {new Date().getFullYear()} {settings.storeInfo.name}. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;