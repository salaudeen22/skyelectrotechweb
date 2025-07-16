import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroSlider from '../Components/Subcompo/HeroSlider';
import ProductCard from '../Components/ProductCard'; 
import { FaShippingFast, FaShieldAlt, FaHeadset } from 'react-icons/fa';
import { productsAPI, categoriesAPI } from '../services/apiServices';
import { toast } from 'react-hot-toast';


const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch featured products (first 8 products)
        const productsResponse = await productsAPI.getProducts({ 
          page: 1, 
          limit: 8, 
          featured: true 
        });
        setFeaturedProducts(productsResponse.data.products);

        // Fetch categories (first 4 categories)
        const categoriesResponse = await categoriesAPI.getCategories();
        setCategories(categoriesResponse.data.categories.slice(0, 4));
        
      } catch (error) {
        console.error('Error fetching homepage data:', error);
        toast.error('Failed to load homepage data');
        
        // Fallback to dummy data
        setFeaturedProducts([
          { _id: '1', name: 'Arduino Uno R3', price: 550, images: ['https://www.theengineerstore.in/cdn/shop/products/arduino-uno-r3-1.png?v=1701086206'], category: { name: 'Development Board' } },
          { _id: '2', name: 'Raspberry Pi 4 Model B (2GB)', price: 4500, images: ['https://m.media-amazon.com/images/I/6120PfrjBqL.jpg'], category: { name: 'SBC' } },
          { _id: '3', name: 'ESP32-WROOM-32 Dev Board', price: 750, images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuBZkNT4gPIhsPepZy6C4e-SZ_0Y7T4St__g&s'], category: { name: 'Module' } },
          { _id: '4', name: '37-in-1 Sensor Kit for Arduino', price: 1999, images: ['https://m.media-amazon.com/images/I/71rwFl8vLEL.jpg'], category: { name: 'Sensor' } },
        ]);
        
        setCategories([
          { _id: '1', name: 'Sensors', image: 'https://rfidunion.com/wp-content/uploads/2022/10/Sensors-and-Actuators.jpg' },
          { _id: '2', name: 'Dev Boards', image: 'https://robu.in/wp-content/uploads/2020/05/development-boards-1024x768.jpeg' },
          { _id: '3', name: 'Motors', image: 'https://www.kindpng.com/picc/m/750-7504672_electric-motor-banner-siemens-ie4-motor-hd-png.png' },
          { _id: '4', name: 'Tools', image: 'https://www.jameco.com/Jameco/Products/MakeImag/2311999.jpg' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  return (
    <div className="bg-gray-50">
      <main className="pt-16 md:pt-0"> 
        
        <HeroSlider />

        {/* Shop by Category Section */}
        <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Shop by Category</h2>
            <p className="mt-4 text-lg text-gray-600">Find the perfect components for your next project.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-8">
            {categories.map((category) => (
              <Link key={category._id} to={`/category/${category._id}`} className="group block text-center">
                <div className="relative rounded-lg overflow-hidden aspect-w-3 aspect-h-2">
                  <img 
                    src={category.image || category.imageUrl} 
                    alt={category.name} 
                    className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105" 
                  />
                </div>
                <h3 className="mt-4 text-md font-semibold text-gray-800 group-hover:text-blue-600">{category.name}</h3>
              </Link>
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
                    key={product._id}
                    product={product}
                />
                ))}
            </div>
            
            <div className="text-center mt-12">
              <Link 
                to="/products" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
              >
                View All Products
              </Link>
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