// src/pages/ProductList.js

import React, { useState, useEffect, useMemo } from 'react';
import ProductCard from '../Components/ProductCard';
import { FiSearch, FiX } from 'react-icons/fi';

const dummyProducts = [
  { id: 1, imageUrl: 'https://www.theengineerstore.in/cdn/shop/products/arduino-uno-r3-1.png?v=1701086206', category: 'Development Board', name: 'Arduino Uno R3', price: '550.00' },
  { id: 2, imageUrl: 'https://m.media-amazon.com/images/I/6120PfrjBqL.jpg', category: 'SBC', name: 'Raspberry Pi 4 Model B (2GB)', price: '4500.00' },
  { id: 3, imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuBZkNT4gPIhsPepZy6C4e-SZ_0Y7T4St__g&s', category: 'Module', name: 'ESP32-WROOM-32 Dev Board', price: '750.00' },
  { id: 4, imageUrl: 'https://m.media-amazon.com/images/I/71rwFl8vLEL.jpg', category: 'Sensor', name: '37-in-1 Sensor Kit for Arduino', price: '1999.00' },
  { id: 5, imageUrl: 'https://5.imimg.com/data5/SELLER/Default/2024/12/471505966/XG/QI/MP/562456/sg90-tower-pro-micro-servo-motor.jpg', category: 'Actuator', name: 'SG90 Micro Servo Motor', price: '120.00' },
  { id: 6, imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBtM4MWK07O_g5Dy3LTtr6XSlwNAQYR0n3pA&s', category: 'Prototyping', name: 'MB-102 Breadboard + Jumper Wires', price: '250.00' },
  { id: 7, imageUrl: 'https://m.media-amazon.com/images/I/61CwFjA8PSL.jpg', category: 'Tools', name: '60W Adjustable Soldering Iron Kit', price: '950.00' },
  { id: 8, imageUrl: 'https://ibots.in/wp-content/uploads/2023/06/ibots-711919-01.jpg', category: 'Robotics', name: '2WD Smart Robot Car Chassis Kit', price: '800.00' },
  { id: 9, imageUrl: 'https://m.media-amazon.com/images/I/61eQm53nJTL.jpg', category: 'Sensor', name: 'Ultrasonic Sensor HC-SR04', price: '99.00' },
  { id: 10, imageUrl: 'https://www.electronicscomp.com/image/cache/catalog/dht11-temperature-and-humidity-sensor-4-400x400.jpg', category: 'Sensor', name: 'DHT11 Temp & Humidity Sensor', price: '150.00' },
];

const ProductList = () => {
  // State for all filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortOrder, setSortOrder] = useState('default');
  
  // State for the products that will be displayed
  const [filteredProducts, setFilteredProducts] = useState(dummyProducts);
  
  // Memoize the list of unique categories to prevent re-calculation on every render
  const allCategories = useMemo(() => {
    return [...new Set(dummyProducts.map(p => p.category))];
  }, []);

  // Handler for category checkbox changes
  const handleCategoryChange = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category) // Uncheck: remove from array
        : [...prev, category]              // Check: add to array
    );
  };

  // Handler to clear all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setPriceRange({ min: '', max: '' });
    setSortOrder('default');
  };

  // The core logic: useEffect runs whenever a filter state changes
  useEffect(() => {
    let products = [...dummyProducts];

    // 1. Filter by search term
    if (searchTerm) {
      products = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. Filter by category
    if (selectedCategories.length > 0) {
      products = products.filter(p => selectedCategories.includes(p.category));
    }

    // 3. Filter by price range
    const minPrice = parseFloat(priceRange.min);
    const maxPrice = parseFloat(priceRange.max);

    if (!isNaN(minPrice)) {
      products = products.filter(p => parseFloat(p.price) >= minPrice);
    }
    if (!isNaN(maxPrice)) {
      products = products.filter(p => parseFloat(p.price) <= maxPrice);
    }

    // 4. Apply sorting
    switch (sortOrder) {
      case 'price-asc':
        products.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-desc':
        products.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'name-asc':
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        products.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // No sorting or default sort (e.g., by ID)
        products.sort((a,b) => a.id - b.id);
        break;
    }

    setFilteredProducts(products);
  }, [searchTerm, selectedCategories, priceRange, sortOrder]);


  return (
    <main className="min-h-screen w-full bg-slate-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Our Electronics Collection
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
            Find everything you need for your next big project.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* == FILTER SIDEBAR == */}
          <aside className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md h-fit sticky top-24">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Filters</h3>

            {/* -- Search Filter -- */}
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            {/* -- Category Filter -- */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-3">Category</h4>
              <div className="space-y-2">
                {allCategories.map(category => (
                  <label key={category} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => handleCategoryChange(category)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-gray-600">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* -- Price Range Filter -- */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-3">Price Range</h4>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
            
            {/* -- Reset Button -- */}
            <button
                onClick={handleResetFilters}
                className="w-full flex items-center justify-center text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
            >
                <FiX className="mr-1"/>
                Clear All Filters
            </button>
          </aside>

          {/* == PRODUCTS GRID == */}
          <div className="lg:col-span-3">
            {/* -- Sort & Info Header -- */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm">
                <p className="text-sm text-gray-600 mb-2 sm:mb-0">
                    Showing <span className="font-bold">{filteredProducts.length}</span> of <span className="font-bold">{dummyProducts.length}</span> products
                </p>
                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="default">Default</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                </select>
            </div>
          
            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            id={product.id}
                            imageUrl={product.imageUrl}
                            category={product.category}
                            name={product.name}
                            price={product.price}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                    <h3 className="text-2xl font-semibold text-gray-700">No Products Found</h3>
                    <p className="text-gray-500 mt-2">Try adjusting your filters to find what you're looking for.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProductList;