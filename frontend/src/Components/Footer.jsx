import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';

const Footer = () => {
  const { settings } = useSettings();
  
  return (
    <footer className="bg-white border-t">
      <div className="max-w-screen-xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Brand Section */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <div className="flex items-center justify-center space-x-3">
           
            <span className="text-3xl font-bold text-blue-600">{settings.storeInfo.name}</span>
          </div>
          <p className="text-center text-gray-600 mt-4 max-w-md mx-auto">
            {settings.storeInfo.description}
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-base text-gray-600 hover:text-blue-600">About</Link></li>
              <li><Link to="/contact" className="text-base text-gray-600 hover:text-blue-600">Contact</Link></li>
            </ul>
          </div>
          {/* Help & Support */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/contact" className="text-base text-gray-600 hover:text-blue-600">Contact Us</Link></li>
              <li><Link to="/faq" className="text-base text-gray-600 hover:text-blue-600">FAQs</Link></li>
              <li><Link to="/products" className="text-base text-gray-600 hover:text-blue-600">Products</Link></li>
            </ul>
          </div>
          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy-policy" className="text-base text-gray-600 hover:text-blue-600">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="text-base text-gray-600 hover:text-blue-600">Terms of Service</Link></li>
            </ul>
          </div>
          {/* Google Maps Location */}
          <div className="space-y-4 md:col-span-2 lg:col-span-1">
             <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Visit Our Store</h3>
             <p className="text-base text-gray-600">Find us at our physical location in Nagarathpete, Bengaluru.</p>
             <div className="w-full h-48 rounded-lg overflow-hidden border border-gray-300">
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
             <p className="text-sm text-gray-600">
               2nd Floor, No 140, Sadar Patrappa Rd<br />
               Nagarathpete, Bengaluru - 560002
             </p>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-200 pt-8 text-center">
          <p className="text-base text-gray-500">© {new Date().getFullYear()} {settings.storeInfo.name}. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;