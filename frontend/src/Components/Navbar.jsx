// src/components/Navbar.js

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiChevronDown } from 'react-icons/fi';

// Define navigation links with categories
const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'All Products', href: '/products' },
  {
    name: 'Categories',
    href: '#',
    subCategories: [
      {
        name: 'Core Components',
        href: '#',
        subItems: [
          { name: 'Microcontrollers', href: '/category/microcontrollers' },
          { name: 'SBCs (Raspberry Pi)', href: '/category/sbc' },
          { name: 'Development Boards', href: '/category/dev-boards' },
        ],
      },
      {
        name: 'Sensors & Modules',
        href: '#',
        subItems: [
          { name: 'Environmental Sensors', href: '/category/env-sensors' },
          { name: 'Motion Sensors', href: '/category/motion-sensors' },
          { name: 'Communication Modules', href: '/category/comms-modules' },
        ],
      },
      { name: 'Robotics', href: '/category/robotics' },
      { name: 'Tools & Prototyping', href: '/category/tools' },
    ],
  },
  { name: 'About Us', href: '/about' },
];

const Navbar = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMobileSubMenu, setOpenMobileSubMenu] = useState(null);

  const toggleMobileSubMenu = (categoryName) => {
    setOpenMobileSubMenu(openMobileSubMenu === categoryName ? null : categoryName);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="text-3xl font-bold text-indigo-600">
            Sky<span className="text-gray-800">electro</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) =>
              link.subCategories ? (
                <div key={link.name} className="relative group">
                  <button className="flex items-center text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-base font-medium transition-colors">
                    <span>{link.name}</span>
                    <FiChevronDown className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                  </button>
                  {/* Dropdown Menu */}
                  <div className="absolute top-full -left-4 w-64 mt-2 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 opacity-0 group-hover:opacity-100 transform scale-95 group-hover:scale-100 transition-all duration-200 ease-out z-10 origin-top-left">
                    <div className="py-2">
                      {link.subCategories.map((subCat) =>
                        subCat.subItems ? (
                          <div key={subCat.name} className="relative group/sub">
                            <button className="w-full text-left flex justify-between items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">
                              <span>{subCat.name}</span>
                              <FiChevronDown className="-rotate-90 h-4 w-4" />
                            </button>
                            {/* Sub-Dropdown Menu */}
                            <div className="absolute top-0 left-full w-56 ml-1 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 opacity-0 group-hover/sub:opacity-100 transform scale-95 group-hover/sub:scale-100 transition-all duration-200 ease-out z-10 origin-left">
                              {subCat.subItems.map((item) => (
                                <Link key={item.name} to={item.href} className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">
                                  {item.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <Link key={subCat.name} to={subCat.href} className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">
                            {subCat.name}
                          </Link>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <Link key={link.name} to={link.href} className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-base font-medium transition-colors">
                  {link.name}
                </Link>
              )
            )}
          </div>

          {/* Icons & Mobile Menu Button */}
          <div className="flex items-center">
            <div className="hidden sm:flex items-center space-x-5">
              <Link to="/cart" className="relative text-gray-600 hover:text-indigo-600 transition-colors">
                <FiShoppingCart size={24} />
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">3</span>
              </Link>
              <Link to="/admin/login" className="text-gray-600 hover:text-indigo-600 transition-colors">
                <FiUser size={24} />
              </Link>
            </div>
            <div className="ml-4 flex lg:hidden">
              <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-md text-gray-700 hover:text-indigo-600">
                {isMobileMenuOpen ? <FiX size={26} /> : <FiMenu size={26} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) =>
              link.subCategories ? (
                <div key={link.name}>
                  <button onClick={() => toggleMobileSubMenu(link.name)} className="w-full flex justify-between items-center text-left text-gray-800 hover:bg-indigo-50 block px-3 py-2 rounded-md text-base font-medium">
                    <span>{link.name}</span>
                    <FiChevronDown className={`ml-1 h-5 w-5 transition-transform duration-200 ${openMobileSubMenu === link.name ? 'rotate-180' : ''}`} />
                  </button>
                  {openMobileSubMenu === link.name && (
                    <div className="pl-4 mt-1 space-y-1">
                      {link.subCategories.map((subCat) => (
                        <Link key={subCat.name} to={subCat.href} className="text-gray-600 hover:bg-indigo-50 block pl-3 pr-3 py-2 rounded-md text-base font-medium border-l-2 border-indigo-200">
                          {subCat.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link key={link.name} to={link.href} className="text-gray-800 hover:bg-indigo-50 block px-3 py-2 rounded-md text-base font-medium">
                  {link.name}
                </Link>
              )
            )}
            <div className="border-t border-gray-200 mt-4 pt-4 flex items-center space-x-4 px-3">
               <Link to="/cart" className="relative text-gray-600 hover:text-indigo-600 transition-colors">
                <FiShoppingCart size={24} />
              </Link>
              <Link to="/admin/login" className="text-gray-600 hover:text-indigo-600 transition-colors">
                <FiUser size={24} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;