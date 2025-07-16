// src/components/ProductCard.js

import React from 'react';
import { FiShoppingCart } from 'react-icons/fi';

const ProductCard = ({ imageUrl, category, name, price }) => {
  return (
    // 'group' is essential for the hover effects on child elements
    <div className="group relative bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 flex flex-col">
      
      {/* Product Image Section */}
      <a href="#" className="block overflow-hidden">
        <img 
          src={imageUrl} 
          alt={name}
          className="w-full h-52 object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
        />
      </a>
      
      {/* Product Details Section */}
      <div className="p-5 flex-grow flex flex-col">
        <div>
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">{category}</p>
          <h3 className="text-lg font-bold text-gray-900 mt-1 truncate" title={name}>
            {name}
          </h3>
          <p className="text-2xl font-extrabold text-gray-800 mt-2">
            <span className="text-lg font-semibold text-gray-500">₹</span>{price}
          </p>
        </div>
        
        {/* Add to Cart Button - Appears on hover */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          {/* This button is initially hidden and fades in on card hover */}
          <button className="w-full flex items-center justify-center bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300">
            <FiShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;