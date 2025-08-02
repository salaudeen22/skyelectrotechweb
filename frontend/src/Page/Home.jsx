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
        
        // First try to fetch featured products
        let productsResponse = await productsAPI.getProducts({ 
          page: 1, 
          limit: 8, 
          featured: true 
        });
        
        // If no featured products found, fetch regular products (top performing)
        if (!productsResponse.data.products || productsResponse.data.products.length === 0) {
          console.log('No featured products found, fetching regular products...');
          productsResponse = await productsAPI.getProducts({ 
            page: 1, 
            limit: 8,
            sort: '-ratings.average' // Sort by rating descending
          });
        }
        
        setFeaturedProducts(productsResponse.data.products || []);

        // Fetch categories (first 4 categories)
        const categoriesResponse = await categoriesAPI.getCategories();
        setCategories(categoriesResponse.data.categories.slice(0, 4) || []);
        
      } catch (error) {
        console.error('Error fetching homepage data:', error);
        toast.error('Failed to load homepage data');
        
        // Set empty arrays on error instead of dummy data
        setFeaturedProducts([]);
        setCategories([]);
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
          {categories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-8">
              {categories.map((category) => (
                <Link key={category._id} to={`/category/${category._id}`} className="group block text-center">
                  <div className="relative rounded-lg overflow-hidden aspect-w-3 aspect-h-2">
                    <img 
                      src={category.image?.url || category.image || 'https://tepeseo.com/wp-content/uploads/2019/05/404notfound.png'} 
                      alt={category.name} 
                      className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
                                              onError={(e) => {
                          e.target.src = 'https://tepeseo.com/wp-content/uploads/2019/05/404notfound.png';
                        }}
                    />
                  </div>
                  <h3 className="mt-4 text-md font-semibold text-gray-800 group-hover:text-blue-600">{category.name}</h3>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No categories available at the moment.</p>
            </div>
          )}
        </section>

        {/* Featured Products Section */}
        <section className="bg-white">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                {featuredProducts.length > 0 ? 'Featured Products' : 'Our Products'}
                </h2>
                <p className="mt-4 text-lg text-gray-600">
                {featuredProducts.length > 0 ? 'Check out our most popular items and best sellers.' : 'Discover amazing products for your projects.'}
                </p>
            </div>
            {featuredProducts.length > 0 ? (
              <>
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
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-6">No products available at the moment.</p>
                <Link 
                  to="/products" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
                >
                  Browse Products
                </Link>
              </div>
            )}
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