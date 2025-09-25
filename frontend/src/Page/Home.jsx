import { useState, useEffect, useCallback, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiPrinter, FiCamera, FiTool } from 'react-icons/fi';
import HeroSlider from '../Components/Subcompo/HeroSlider';
import ProductCard from '../Components/ProductCard'; 
import { FaShippingFast, FaShieldAlt, FaHeadset } from 'react-icons/fa';
import { productsAPI, categoriesAPI, servicesAPI } from '../services/apiServices';
import { toast } from 'react-hot-toast';
import ProductRecommendations from '../Components/ProductRecommendations';
import FAQSchema, { defaultElectronicsFAQs } from '../Components/FAQSchema';
import SEO from '../Components/SEO';

// Dynamic testimonials pool for trust building
const testimonialPool = [
  {
    name: "Rohan M.",
    role: "Engineering Student",
    rating: 5,
    text: "Good selection of components. Found the Arduino Uno I needed for my project. Delivery to Koramangala took just 5 hours!",
    location: "Koramangala",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Deepak R.",
    role: "Electronics Hobbyist",
    rating: 5,
    text: "Shop owner was helpful in explaining sensor specifications. Order reached Whitefield in about 6 hours. Best electronics store in Bangalore!",
    location: "Whitefield",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Kavya S.",
    role: "Tech Startup",
    rating: 4,
    text: "Ordered ESP32 boards in the morning, received by evening in HSR Layout. Good quality and secure packaging.",
    location: "HSR Layout",
    photo: "https://images.unsplash.com/photo-1494790108755-2616b612c1ec?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Arjun K.",
    role: "Final Year Student",
    rating: 5,
    text: "Needed sensors urgently for my final year project. Got them delivered to Electronic City within 7 hours. Lifesaver!",
    location: "Electronic City",
    photo: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Priya T.",
    role: "Maker",
    rating: 4,
    text: "I order regularly for my hobby projects. Same day delivery to Marathahalli is super convenient. Always find Arduino shields in stock.",
    location: "Marathahalli",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Suresh B.",
    role: "Automation Engineer",
    rating: 5,
    text: "Bought PLCs and industrial sensors. Delivered to our Peenya office within 8 hours. Technical support was excellent too.",
    location: "Peenya",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Lakshmi R.",
    role: "Research Scholar",
    rating: 4,
    text: "Needed specific microcontrollers for my research. Found them here when other shops didn’t have stock. Delivery to Malleshwaram took just half a day.",
    location: "Malleshwaram",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Vikram N.",
    role: "Startup Founder",
    rating: 5,
    text: "Ordered a bulk lot of development boards for an IoT project. Same day delivery to Indiranagar office. Prices are competitive and products are genuine.",
    location: "Indiranagar",
    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Anita M.",
    role: "College Student",
    rating: 4,
    text: "Raspberry Pi setup for my project. Ordered in the morning and got it delivered in Jayanagar by evening. Smooth process!",
    location: "Jayanagar",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Ravi P.",
    role: "Hardware Engineer",
    rating: 5,
    text: "Professional components delivered same day to BTM Layout. Consistent quality and accurate specs. They’ve become my go-to supplier.",
    location: "BTM Layout",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Sneha K.",
    role: "Engineering Student",
    rating: 4,
    text: "I’m from Mysore. Ordered sensors on Monday, received by Wednesday. 2-day delivery was faster than I expected. Quality components too.",
    location: "Mysore",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Rajesh T.",
    role: "Hobbyist",
    rating: 5,
    text: "Ordered from Mangalore. It took 3 days but the packaging was solid and the boards were genuine. Worth the wait!",
    location: "Mangalore",
    photo: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=150&h=150&fit=crop&crop=face"
  }
];


// Function to get random testimonials
const getRandomTestimonials = (count = 3) => {
  const shuffled = [...testimonialPool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};


const Home = memo(() => {
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
  const [displayTestimonials, setDisplayTestimonials] = useState([]);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Set random testimonials on page load
        setDisplayTestimonials(getRandomTestimonials(3));
        
        // First try to fetch featured products
        let productsResponse = await productsAPI.getProducts({ 
          page: 1, 
          limit: 8, 
          featured: true 
        });
        
        // If no featured products found, fetch regular products (top performing)
        if (!productsResponse.data.products || productsResponse.data.products.length === 0) {
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
        // Still set testimonials even on error
        setDisplayTestimonials(getRandomTestimonials(3));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-rotate testimonials (3 at a time)
  useEffect(() => {
    if (isPaused) return;

    const rotateInterval = setInterval(() => {
      setCurrentTestimonialIndex((prevIndex) => {
        const nextIndex = prevIndex + 3;
        return nextIndex >= testimonialPool.length ? 0 : nextIndex;
      });
    }, 4000); // Change every 4 seconds

    return () => clearInterval(rotateInterval);
  }, [isPaused]);

  // Get current testimonials to display (responsive count)
  const getCurrentTestimonials = () => {
    const current = [];
    const count = 3; // Always get 3 for desktop, we'll handle mobile display in JSX
    for (let i = 0; i < count; i++) {
      const index = (currentTestimonialIndex + i) % testimonialPool.length;
      current.push(testimonialPool[index]);
    }
    return current;
  };

  // Get single testimonial for mobile
  const getCurrentMobileTestimonial = () => {
    const index = currentTestimonialIndex % testimonialPool.length;
    return testimonialPool[index];
  };

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      toast.error('Please enter a search term');
    }
  }, [searchTerm, navigate]);

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
      <div className="py-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {/* Enhanced SEO for Homepage */}
      <SEO 
        title="Buy Arduino, NE555, MAX7219 Online | Same Day Delivery Bangalore - SkyElectroTech"
        description="Arduino ₹299 | NE555 IC ₹15 | MAX7219 ₹99 | Humidity Sensor ₹49. ✓ COD ✓ Same Day Delivery ✓ 5000+ Products ✓ Technical Support. Electronic components shop Bangalore."
        keywords="arduino bangalore, MAX7219 display, NE555 timer IC, humidity sensor module, obstacle detection sensor, electronic components shop near me, electronics components shop near me, arduino supplier bangalore, raspberry pi bangalore, sensors bangalore"
        image="https://skyelectrotech.in/og-image.jpg"
        url="https://skyelectrotech.in/"
        type="website"
        isHomepage={true}
      />
      
      {/* Current Testimonials Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "itemListElement": getCurrentTestimonials().map((testimonial, index) => ({
              "@type": "Review",
              "position": index + 1,
              "author": {
                "@type": "Person",
                "name": testimonial.name
              },
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": testimonial.rating,
                "bestRating": "5"
              },
              "reviewBody": testimonial.text,
              "itemReviewed": {
                "@type": "LocalBusiness",
                "name": "SkyElectroTech"
              },
              "datePublished": new Date().toISOString().split('T')[0]
            }))
          })
        }}
      />

      {/* FAQ Schema for better search visibility */}
      <FAQSchema faqs={defaultElectronicsFAQs} />
      
      <div className="flex-1 pt-0"> {/* Changed from main to div and added flex-1 */} 
        
        {/* Hero Section */}
        <section className="relative">
          {/* Hero Slider */}
          <div className="h-[30vh] xs:h-[35vh] sm:h-[45vh] md:h-[55vh] lg:h-[60vh]">
            <HeroSlider />
          </div>
        </section>

        {/* Search Section - Below Hero */}
        <section className="bg-white py-6 sm:py-8 border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2">Find Your Perfect Components</h2>
              <p className="text-sm sm:text-base text-gray-600 px-2">Search thousands of electronic components and tools</p>
            </div>
            
            <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:gap-4 max-w-3xl mx-auto">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg sm:text-xl" />
                <input
                  type="text"
                  placeholder="Search Arduino, Raspberry Pi, sensors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-base sm:text-lg border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 sm:focus:ring-4 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300 shadow-sm"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <FiSearch className="text-lg sm:text-xl" />
                <span className="hidden xs:inline">Search</span>
                <span className="xs:hidden">Go</span>
              </button>
            </form>
            
            {/* Quick Search Suggestions */}
            <div className="mt-4 sm:mt-6 flex flex-wrap justify-center gap-1 sm:gap-2 px-2">
              <span className="text-xs sm:text-sm text-gray-500 mr-1 sm:mr-2 mb-1">Popular:</span>
              {['Arduino', 'Raspberry Pi', 'Sensors', 'Motors', 'LEDs', 'Resistors'].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchTerm(term);
                    navigate(`/products?search=${encodeURIComponent(term)}`);
                  }}
                  className="text-xs sm:text-sm bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 px-2 sm:px-3 py-1 rounded-full transition-colors duration-200 mb-1"
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
                  <div className="relative rounded-lg overflow-hidden aspect-[3/2]">
                    <img 
                      src={category.image?.url || category.image || 'https://tepeseo.com/wp-content/uploads/2019/05/404notfound.png'} 
                      alt={category.name} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
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

        {/* Trending Products Section */}
        <section className="bg-gray-50">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="space-y-12">
              {/* Trending Products */}
              <ProductRecommendations 
                type="trending"
                limit={8}
                title="Trending Products"
                showViewAll={true}
              />
              
              {/* Recently Viewed */}
              <ProductRecommendations 
                type="recently-viewed"
                limit={8}
                title="Recently Viewed"
                showViewAll={true}
              />
            </div>
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

        {/* Customer Testimonials Section */}
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-8 sm:py-12 lg:py-16">
          <div className="max-w-screen-xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="text-center mb-6 sm:mb-8 lg:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">What Our Customers Say</h2>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 px-2">Real feedback from electronics enthusiasts and students in Bangalore</p>
            </div>
            
            <div 
              className="relative mb-6 sm:mb-8 lg:mb-12"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Mobile View - Single Testimonial */}
              <div className="block sm:hidden">
                <div className="max-w-sm mx-auto">
                  {(() => {
                    const testimonial = getCurrentMobileTestimonial();
                    return (
                      <div key={currentTestimonialIndex} className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center mb-3">
                          <div className="flex">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="ml-2 text-xs text-gray-500">({testimonial.rating}.0)</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-3 italic leading-relaxed">"{testimonial.text}"</p>
                        <div className="border-t pt-3">
                          <p className="font-semibold text-sm text-gray-900">{testimonial.name}</p>
                          <p className="text-xs text-gray-600">{testimonial.role} • {testimonial.location}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Desktop/Tablet View - Multiple Testimonials */}
              <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 transition-all duration-500 ease-in-out">
                {getCurrentTestimonials().map((testimonial, index) => (
                  <div key={`${currentTestimonialIndex}-${index}`} className="bg-white rounded-xl shadow-lg p-5 lg:p-6 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center mb-4">
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-500">({testimonial.rating}.0)</span>
                    </div>
                    <p className="text-base text-gray-700 mb-4 italic leading-relaxed">"{testimonial.text}"</p>
                    <div className="border-t pt-4">
                      <p className="font-semibold text-base text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.role} • {testimonial.location}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Progress indicators */}
              <div className="flex justify-center mt-4 sm:mt-6 space-x-1 sm:space-x-2">
                {/* Mobile Progress - Individual testimonials */}
                <div className="block sm:hidden">
                  {Array.from({ length: testimonialPool.length }).map((_, index) => (
                    <div
                      key={index}
                      className={`inline-block h-1.5 w-1.5 rounded-full transition-colors duration-300 mx-0.5 ${
                        currentTestimonialIndex % testimonialPool.length === index ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                
                {/* Desktop Progress - Groups of 3 */}
                <div className="hidden sm:block">
                  {Array.from({ length: Math.ceil(testimonialPool.length / 3) }).map((_, index) => (
                    <div
                      key={index}
                      className={`inline-block h-2 w-8 rounded-full transition-colors duration-300 mx-1 ${
                        Math.floor(currentTestimonialIndex / 3) === index ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
            
            </div>

            {/* Trust Statistics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-8 text-center">
              <div className="bg-white rounded-lg p-3 sm:p-4 lg:p-6 shadow-md">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">1,200+</div>
                <div className="text-xs sm:text-sm lg:text-base text-gray-600">Orders Delivered</div>
              </div>
              <div className="bg-white rounded-lg p-3 sm:p-4 lg:p-6 shadow-md">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 mb-1 sm:mb-2">4.2/5</div>
                <div className="text-xs sm:text-sm lg:text-base text-gray-600">Google Reviews</div>
              </div>
              <div className="bg-white rounded-lg p-3 sm:p-4 lg:p-6 shadow-md">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600 mb-1 sm:mb-2">4 Hours</div>
                <div className="text-xs sm:text-sm lg:text-base text-gray-600">Delivery in Bangalore</div>
              </div>
              <div className="bg-white rounded-lg p-3 sm:p-4 lg:p-6 shadow-md">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-600 mb-1 sm:mb-2">3+ Years</div>
                <div className="text-xs sm:text-sm lg:text-base text-gray-600">Serving Bangalore</div>
              </div>
            </div>
          </div>
        </section>

        {/* Security & Trust Badges Section */}
        <section className="bg-white py-12">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Trust & Security Matters</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-items-center">
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900">Secure Payment</h4>
                <p className="text-xs text-gray-600">SSL Encrypted</p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900">Genuine Products</h4>
                <p className="text-xs text-gray-600">100% Authentic</p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900">Quality Tested</h4>
                <p className="text-xs text-gray-600">QC Checked</p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900">Easy Returns</h4>
                <p className="text-xs text-gray-600">7 Day Policy</p>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Why Choose Us Section */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose SkyElectroTech?</h2>
              <p className="text-lg text-gray-600">Your trusted partner for electronics components in Bangalore</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="flex flex-col items-center bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                    <FaShippingFast className="text-4xl text-blue-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Ultra Fast Delivery</h3>
                    <p className="text-gray-600 mb-4">24-hour delivery within Bangalore Same-day pickup available from our Nagarathpet store.</p>
                    <div className="bg-blue-50 px-3 py-1 rounded-full text-sm text-blue-700 font-medium">✓ 24 Hour Bangalore Delivery</div>
                </div>
                <div className="flex flex-col items-center bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                    <FaShieldAlt className="text-4xl text-green-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Quality Guaranteed</h3>
                    <p className="text-gray-600 mb-4">100% genuine products with quality testing. All components come with manufacturer warranty.</p>
                    <div className="bg-green-50 px-3 py-1 rounded-full text-sm text-green-700 font-medium">✓ Warranty Included</div>
                </div>
                <div className="flex flex-col items-center bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                    <FaHeadset className="text-4xl text-purple-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Expert Support</h3>
                    <p className="text-gray-600 mb-4">Technical support from electronics experts. Get help choosing the right components for your project.</p>
                    <div className="bg-purple-50 px-3 py-1 rounded-full text-sm text-purple-700 font-medium">✓ Free Consultation</div>
                </div>
            </div>

            {/* Contact Banner */}
            <div className="mt-6 sm:mt-8 lg:mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 text-white text-center">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 lg:mb-4">Need Help? We're Here for You!</h3>
              <p className="text-xs sm:text-sm lg:text-base text-blue-100 mb-4 sm:mb-5 lg:mb-6 px-2">Our technical experts are available Monday to Saturday, 9 AM - 7 PM</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center items-center">
                <a href="tel:+916361241811" className="w-full sm:w-auto bg-white text-blue-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span className="hidden xs:inline">Call: +91 63612 41811</span>
                  <span className="xs:hidden">Call Now</span>
                </a>
                <a href="mailto:skyelectrotechblr@gmail.com" className="w-full sm:w-auto bg-transparent border-2 border-white text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  Email Support
                </a>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
});

Home.displayName = 'Home';

export default Home;