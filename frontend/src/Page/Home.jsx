import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiPrinter, FiCamera, FiTool } from 'react-icons/fi';
import HeroSlider from '../Components/Subcompo/HeroSlider';
import ProductCard from '../Components/ProductCard'; 
import { FaShippingFast, FaShieldAlt, FaHeadset } from 'react-icons/fa';
import { productsAPI, categoriesAPI, servicesAPI } from '../services/apiServices';
import { toast } from 'react-hot-toast';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showServiceForm, setShowServiceForm] = useState(null);
  const [serviceFormData, setServiceFormData] = useState({
    name: '',
    email: '',
    phone: '',
    projectType: '',
    description: '',
    budget: '',
    timeline: '',
    requirements: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      console.log('Searching for:', searchTerm.trim());
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      toast.error('Please enter a search term');
    }
  };

  const handleServiceFormChange = (e) => {
    const { name, value } = e.target;
    setServiceFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServiceFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await servicesAPI.submitServiceRequest({
        serviceType: showServiceForm,
        ...serviceFormData
      });

      if (response.success) {
        toast.success('Service request submitted successfully! We will contact you soon.');
        setShowServiceForm(null);
        setServiceFormData({
          name: '',
          email: '',
          phone: '',
          projectType: '',
          description: '',
          budget: '',
          timeline: '',
          requirements: ''
        });
      } else {
        toast.error(response.message || 'Failed to submit service request. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting service request:', error);
      toast.error('Failed to submit service request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getServiceFormFields = () => {
    const baseFields = [
      { name: 'name', label: 'Full Name', type: 'text', required: true },
      { name: 'email', label: 'Email Address', type: 'email', required: true },
      { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
      { name: 'description', label: 'Project Description', type: 'textarea', required: true }
    ];

    switch (showServiceForm) {
      case '3d-printing':
        return [
          ...baseFields,
          { name: 'projectType', label: '3D Printing Type', type: 'select', options: ['Prototype', 'Production Part', 'Art/Decoration', 'Educational Model', 'Custom Design', 'Other'], required: true },
          { name: 'requirements', label: 'Technical Requirements', type: 'textarea', placeholder: 'Material preferences, size specifications, quantity, etc.' },
          { name: 'timeline', label: 'Timeline', type: 'select', options: ['Urgent (1-3 days)', 'Standard (1 week)', 'Flexible (2+ weeks)'], required: true }
        ];
      case 'drone-services':
        return [
          ...baseFields,
          { name: 'projectType', label: 'Drone Service Type', type: 'select', options: ['Agricultural Spraying', 'Crop Monitoring', 'Aerial Photography', 'Videography', 'Surveying & Mapping', 'Inspection & Monitoring', 'Precision Agriculture', 'Other'], required: true },
          { name: 'requirements', label: 'Service Requirements', type: 'textarea', placeholder: 'Location, area size, crop type (if agricultural), specific requirements, duration, etc.' },
          { name: 'budget', label: 'Budget Range', type: 'select', options: ['Under ₹5,000', '₹5,000 - ₹10,000', '₹10,000 - ₹25,000', '₹25,000 - ₹50,000', '₹50,000+'], required: true }
        ];
      case 'project-building':
        return [
          ...baseFields,
          { name: 'projectType', label: 'Project Type', type: 'select', options: ['IoT Project', 'Robotics', 'Automation', 'Electronics Prototype', 'Custom Circuit', 'Other'], required: true },
          { name: 'requirements', label: 'Technical Specifications', type: 'textarea', placeholder: 'Components needed, functionality requirements, etc.' },
          { name: 'budget', label: 'Budget Range', type: 'select', options: ['Under ₹10,000', '₹10,000 - ₹25,000', '₹25,000 - ₹50,000', '₹50,000+'], required: true },
          { name: 'timeline', label: 'Timeline', type: 'select', options: ['Urgent (1-2 weeks)', 'Standard (1 month)', 'Flexible (2+ months)'], required: true }
        ];
      default:
        return baseFields;
    }
  };

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
        
        {/* Hero Section */}
        <section className="relative">
          {/* Hero Slider */}
          <div className="h-[40vh] sm:h-[50vh] md:h-[60vh]">
            <HeroSlider />
          </div>
        </section>

        {/* Search Section - Below Hero */}
        <section className="bg-white py-8 border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Find Your Perfect Components</h2>
              <p className="text-gray-600">Search thousands of electronic components and tools</p>
            </div>
            
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 max-w-3xl mx-auto">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="text"
                  placeholder="Search for Arduino, Raspberry Pi, sensors, motors, or any electronic component..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300 shadow-sm"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl whitespace-nowrap"
              >
                <FiSearch className="text-xl" />
                Search
              </button>
            </form>
            
            {/* Quick Search Suggestions */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <span className="text-sm text-gray-500 mr-2">Popular:</span>
              {['Arduino', 'Raspberry Pi', 'Sensors', 'Motors', 'LEDs', 'Resistors'].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchTerm(term);
                    navigate(`/products?search=${encodeURIComponent(term)}`);
                  }}
                  className="text-sm bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 px-3 py-1 rounded-full transition-colors duration-200"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </section>

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

        {/* Services Section */}
        <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Our Services</h2>
            <p className="mt-4 text-lg text-gray-600">Beyond components, we offer comprehensive project solutions and specialized services.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* 3D Printing Service */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiPrinter className="text-3xl text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">3D Printing</h3>
                <p className="text-gray-600">Professional 3D printing services for prototypes, production parts, and custom designs.</p>
              </div>
              <div className="flex-grow">
                <ul className="text-sm text-gray-600 mb-6 space-y-2">
                  <li>• Prototype Development</li>
                  <li>• Production Parts</li>
                  <li>• Custom Designs</li>
                  <li>• Multiple Materials</li>
                  <li>• Fast Turnaround</li>
                  <li>• Quality Assurance</li>
                </ul>
              </div>
              <button
                onClick={() => setShowServiceForm('3d-printing')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Get Quote
              </button>
            </div>

            {/* Drone Services */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCamera className="text-3xl text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Drone Services</h3>
                <p className="text-gray-600">Comprehensive drone solutions for agriculture, photography, surveying, and specialized applications.</p>
              </div>
              <div className="flex-grow">
                <ul className="text-sm text-gray-600 mb-6 space-y-2">
                  <li>• Agricultural Spraying</li>
                  <li>• Crop Monitoring & Analysis</li>
                  <li>• Aerial Photography & Videography</li>
                  <li>• Surveying & Mapping</li>
                  <li>• Inspection & Monitoring</li>
                  <li>• Precision Agriculture</li>
                </ul>
              </div>
              <button
                onClick={() => setShowServiceForm('drone-services')}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Get Quote
              </button>
            </div>

            {/* Project Building */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiTool className="text-3xl text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Project Building</h3>
                <p className="text-gray-600">Custom electronics projects, IoT solutions, and automation systems.</p>
              </div>
              <div className="flex-grow">
                <ul className="text-sm text-gray-600 mb-6 space-y-2">
                  <li>• IoT Projects</li>
                  <li>• Robotics Solutions</li>
                  <li>• Automation Systems</li>
                  <li>• Custom Circuits</li>
                  <li>• Prototype Development</li>
                  <li>• Technical Support</li>
                </ul>
              </div>
              <button
                onClick={() => setShowServiceForm('project-building')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Get Quote
              </button>
            </div>
          </div>
        </section>

        {/* Service Form Modal */}
        {showServiceForm && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-900">
                    {showServiceForm === '3d-printing' && '3D Printing Service Request'}
                    {showServiceForm === 'drone-services' && 'Drone Service Request'}
                    {showServiceForm === 'project-building' && 'Project Building Request'}
                  </h3>
                  <button
                    onClick={() => setShowServiceForm(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleServiceFormSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {getServiceFormFields().map((field) => (
                    <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      
                      {field.type === 'textarea' ? (
                        <textarea
                          name={field.name}
                          value={serviceFormData[field.name]}
                          onChange={handleServiceFormChange}
                          required={field.required}
                          placeholder={field.placeholder}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : field.type === 'select' ? (
                        <select
                          name={field.name}
                          value={serviceFormData[field.name]}
                          onChange={handleServiceFormChange}
                          required={field.required}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select {field.label}</option>
                          {field.options.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          name={field.name}
                          value={serviceFormData[field.name]}
                          onChange={handleServiceFormChange}
                          required={field.required}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowServiceForm(null)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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