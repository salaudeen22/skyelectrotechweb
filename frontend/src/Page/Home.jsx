// src/pages/Home.js

import React from 'react';
import Navbar from '../Components/Navbar';
import HeroSlider from '../Components/Subcompo/HeroSlider';
import ProductCard from '../Components/ProductCard'; 
import { FaShippingFast, FaShieldAlt, FaHeadset } from 'react-icons/fa'; // Icons for the "Why Choose Us" section

// --- Data for the page ---

// Expanded dummy data for featured products
const featuredProducts = [
  { id: 1, imageUrl: 'https://www.theengineerstore.in/cdn/shop/products/arduino-uno-r3-1.png?v=1701086206', category: 'Development Board', name: 'Arduino Uno R3', price: '550.00' },
  { id: 2, imageUrl: 'https://m.media-amazon.com/images/I/6120PfrjBqL.jpg', category: 'SBC', name: 'Raspberry Pi 4 Model B (2GB)', price: '4500.00' },
  { id: 3, imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuBZkNT4gPIhsPepZy6C4e-SZ_0Y7T4St__g&s', category: 'Module', name: 'ESP32-WROOM-32 Dev Board', price: '750.00' },
  { id: 4, imageUrl: 'https://m.media-amazon.com/images/I/71rwFl8vLEL.jpg', category: 'Sensor', name: '37-in-1 Sensor Kit for Arduino', price: '1999.00' },
  { id: 5, imageUrl: 'https://5.imimg.com/data5/SELLER/Default/2024/12/471505966/XG/QI/MP/562456/sg90-tower-pro-micro-servo-motor.jpg', category: 'Actuator', name: 'SG90 Micro Servo Motor', price: '120.00' },
  { id: 6, imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBtM4MWK07O_g5Dy3LTtr6XSlwNAQYR0n3pA&s', category: 'Prototyping', name: 'MB-102 Breadboard + Jumper Wires', price: '250.00' },
  { id: 7, imageUrl: 'https://m.media-amazon.com/images/I/61CwFjA8PSL.jpg', category: 'Tools', name: '60W Adjustable Soldering Iron Kit', price: '950.00' },
  { id: 8, imageUrl: 'https://ibots.in/wp-content/uploads/2023/06/ibots-711919-01.jpg', category: 'Robotics', name: '2WD Smart Robot Car Chassis Kit', price: '800.00' },
];

// Data for the category section
const categories = [
    { name: 'Sensors', imageUrl: 'https://rfidunion.com/wp-content/uploads/2022/10/Sensors-and-Actuators.jpg', href: '#' },
    { name: 'Dev Boards', imageUrl: 'https://robu.in/wp-content/uploads/2020/05/development-boards-1024x768.jpeg', href: '#' },
    { name: 'Motors', imageUrl: 'https://www.kindpng.com/picc/m/750-7504672_electric-motor-banner-siemens-ie4-motor-hd-png.png', href: '#' },
    { name: 'Tools', imageUrl: 'https://www.jameco.com/Jameco/Products/MakeImag/2311999.jpg', href: '#' },
];


const Home = () => {
  return (
    <div className="bg-gray-50">
      <Navbar />

      <main className="pt-16 md:pt-28"> 
        
        <HeroSlider />

        {/* Shop by Category Section */}
        <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Shop by Category</h2>
            <p className="mt-4 text-lg text-gray-600">Find the perfect components for your next project.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-8">
            {categories.map((category) => (
              <a key={category.name} href={category.href} className="group block text-center">
                <div className="relative rounded-lg overflow-hidden aspect-w-3 aspect-h-2">
                  <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>
                <h3 className="mt-4 text-md font-semibold text-gray-800 group-hover:text-blue-600">{category.name}</h3>
              </a>
            ))}
          </div>
        </section>


        {/* Featured Products Section */}
        <section className="bg-white">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Featured Products
                </h2>
                <p className="mt-4 text-lg text-gray-600">
                Check out our most popular items and best sellers.
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {featuredProducts.map((product) => (
                <ProductCard
                    key={product.id}
                    imageUrl={product.imageUrl}
                    category={product.category}
                    name={product.name}
                    price={product.price}
                    // Pass the whole product object if you plan to use more data (e.g., for 'Add to Cart')
                    // product={product} 
                />
                ))}
            </div>
            </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="flex flex-col items-center">
                    <FaShippingFast className="text-4xl text-blue-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900">Fast Shipping</h3>
                    <p className="mt-2 text-gray-600">Get your components delivered to your doorstep in no time.</p>
                </div>
                <div className="flex flex-col items-center">
                    <FaShieldAlt className="text-4xl text-blue-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900">Quality Guaranteed</h3>
                    <p className="mt-2 text-gray-600">We source only high-quality, reliable parts for your projects.</p>
                </div>
                <div className="flex flex-col items-center">
                    <FaHeadset className="text-4xl text-blue-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900">Maker Support</h3>
                    <p className="mt-2 text-gray-600">Have questions? Our team of experts is here to help you succeed.</p>
                </div>
            </div>
        </section>

      </main>


    </div>
  );
};

export default Home;