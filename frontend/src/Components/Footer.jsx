import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-screen-xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Company</h3>
            <ul className="space-y-2">
              <li><Link to="#" className="text-base text-gray-600 hover:text-blue-600">About</Link></li>
              <li><Link to="#" className="text-base text-gray-600 hover:text-blue-600">Careers</Link></li>
            </ul>
          </div>
          {/* Help & Support */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Support</h3>
            <ul className="space-y-2">
              <li><Link to="#" className="text-base text-gray-600 hover:text-blue-600">Contact Us</Link></li>
              <li><Link to="#" className="text-base text-gray-600 hover:text-blue-600">FAQs</Link></li>
              <li><Link to="#" className="text-base text-gray-600 hover:text-blue-600">Shipping</Link></li>
            </ul>
          </div>
          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="#" className="text-base text-gray-600 hover:text-blue-600">Privacy Policy</Link></li>
              <li><Link to="#" className="text-base text-gray-600 hover:text-blue-600">Terms of Service</Link></li>
            </ul>
          </div>
          {/* Newsletter */}
          <div className="space-y-4 md:col-span-2 lg:col-span-1">
             <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Subscribe to our newsletter</h3>
             <p className="text-base text-gray-600">The latest news, articles, and resources, sent to your inbox weekly.</p>
             <form className="mt-4 sm:flex sm:max-w-md">
                 <input type="email" placeholder="Enter your email" className="appearance-none w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                 <div className="mt-3 sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                     <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Subscribe</button>
                 </div>
             </form>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-200 pt-8 text-center">
          <p className="text-base text-gray-500">© {new Date().getFullYear()} SkyelectroTech. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;