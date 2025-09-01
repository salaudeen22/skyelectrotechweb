import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { heroSliderService } from '../../services/heroSliderService';

// Default slides as fallback
const defaultSlides = [
  {
    id: 1,
    image: 'https://computronicslab.com/wp-content/uploads/2024/10/WhatsApp-Image-2024-10-21-at-10.50.19-AM-1-1600x700.jpeg',
    title: 'Arduino Boards & Accessories',
    subtitle: 'Build IoT & embedded projects with ease',
    buttonText: 'Shop Arduino',
    gradientColor: 'from-blue-900/80 to-blue-700/60',
    buttonLink: '/products?category=arduino'
  },
  {
    id: 2,
    image: 'https://bannerengineering-h.assetsadobe.com/is/image//content/dam/banner-engineering/3d-renders/product-group/divisionimages2024/updated/Div-Main-product-grouping-2024-ctr.psd?wid=1200&hei=630&fit=crop&qlt=60&fmt=png',
    title: 'Top Quality Sensors',
    subtitle: 'Wide range of sensors for all applications',
    buttonText: 'Explore Sensors',
    gradientColor: 'from-emerald-900/80 to-emerald-700/60',
    buttonLink: '/products?category=sensors'
  },
  {
    id: 3,
    image: 'https://cpc.farnell.com/wcsstore/ExtendedSitesCatalogAssetStore/cms/asset/images/europe/cpc/storefronts/raspberry-pi/rpi-5-banner-v4.png',
    title: 'Raspberry Pi & Kits',
    subtitle: 'Perfect boards for prototyping & learning',
    buttonText: 'View Pi Boards',
    gradientColor: 'from-purple-900/80 to-purple-700/60',
    buttonLink: '/products?category=raspberry-pi'
  },
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [slides, setSlides] = useState(defaultSlides);
  const [sliderSettings, setSliderSettings] = useState({
    enabled: true,
    autoSlide: true,
    slideInterval: 7000
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch slides from backend
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        setLoading(true);
        const response = await heroSliderService.getHeroSlides();
        
        if (response.success && response.data.slides && response.data.slides.length > 0) {
          // Map backend data to component format
          const mappedSlides = response.data.slides.map(slide => ({
            id: slide.id,
            image: slide.image,
            title: slide.title,
            subtitle: slide.subtitle,
            buttonText: slide.buttonText,
            gradientColor: slide.gradientColor,
            buttonLink: slide.buttonLink
          }));
          
          setSlides(mappedSlides);
          setSliderSettings({
            enabled: response.data.enabled,
            autoSlide: response.data.autoSlide,
            slideInterval: response.data.slideInterval
          });
        }
      } catch (error) {
        console.error('Error fetching hero slides:', error);
        // Keep default slides on error
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, []);

  const prevSlide = () => {
    const isFirstSlide = current === 0;
    const newIndex = isFirstSlide ? slides.length - 1 : current - 1;
    setCurrent(newIndex);
  };

  const nextSlide = useCallback(() => {
    const isLastSlide = current === slides.length - 1;
    const newIndex = isLastSlide ? 0 : current + 1;
    setCurrent(newIndex);
  }, [current, slides.length]);

  const handleSlideClick = (slide) => {
    if (slide.buttonLink) {
      navigate(slide.buttonLink);
    }
  };

  useEffect(() => {
    // Only auto-slide when not hovered and settings allow it
    if (!isHovered && sliderSettings.autoSlide && sliderSettings.enabled) {
      const slideInterval = setInterval(nextSlide, sliderSettings.slideInterval);
      return () => clearInterval(slideInterval);
    }
  }, [nextSlide, isHovered, sliderSettings]);

  // Don't render if slider is disabled or no slides
  if (!sliderSettings.enabled || slides.length === 0) {
    return null;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="relative w-full h-full overflow-hidden rounded-xl shadow-2xl bg-gray-200 animate-pulse">
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-full overflow-hidden rounded-xl shadow-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Container for all slides */}
      <div
        className="w-full h-full flex transition-transform duration-1000 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="w-full h-full flex-shrink-0 relative cursor-pointer"
            onClick={() => handleSlideClick(slide)}
          >
            {/* Background Image with Ken Burns Effect */}
            <img
              src={slide.image}
              alt={slide.title}
              className={`w-full h-full object-cover transition-all duration-[10000ms] ease-linear ${
                current === index ? 'scale-110' : 'scale-100'
              }`}
            />
            
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradientColor}`} />
            
            {/* Floating electronics decoration */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-white rounded-full animate-pulse"></div>
              <div className="absolute bottom-1/3 right-1/4 w-12 h-12 border-2 border-white rounded-full animate-ping"></div>
              <div className="absolute top-1/3 right-1/3 w-6 h-6 bg-blue-400 rounded-full animate-bounce"></div>
            </div>
            
            {/* Text Content - More compact for smaller height */}
            <div className="absolute inset-0 flex flex-col justify-center items-start p-6 md:p-12 lg:p-16">
              <div className="max-w-xl">
                <h2
                  className={`text-white text-2xl md:text-3xl lg:text-4xl font-bold mb-3 leading-tight transition-all duration-1000 ease-out ${
                    current === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
                >
                  {slide.title}
                </h2>
                <p
                  className={`text-blue-100 text-sm md:text-lg mb-6 transition-all duration-1000 ease-out delay-150 ${
                    current === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                >
                  {slide.subtitle}
                </p>
                <div
                  className={`transition-all duration-1000 ease-out delay-300 ${
                    current === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                >
                  <button 
                    className="bg-white text-blue-800 font-bold px-6 py-2 rounded-full hover:bg-blue-50 hover:scale-105 transition-all duration-300 shadow-lg flex items-center gap-2 text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSlideClick(slide);
                    }}
                  >
                    {slide.buttonText}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows - Always visible but more prominent on hover */}
      <button 
        onClick={prevSlide}
        className={`absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full z-20 transition-all duration-300 ${
          isHovered ? 'opacity-100 scale-110' : 'opacity-70 scale-100'
        } hover:bg-black/50 hover:scale-125`}
      >
        <FiChevronLeft size={24} />
      </button>
      <button 
        onClick={nextSlide}
        className={`absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full z-20 transition-all duration-300 ${
          isHovered ? 'opacity-100 scale-110' : 'opacity-70 scale-100'
        } hover:bg-black/50 hover:scale-125`}
      >
        <FiChevronRight size={24} />
      </button>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 z-20">
        <div 
          className="h-full bg-white transition-all duration-1000 ease-linear"
          style={{
            width: `${100 / slides.length}%`,
            transform: `translateX(${current * 100}%)`
          }}
        />
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              current === i ? 'bg-white w-6' : 'bg-white/50 w-2 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Current slide indicator */}
      <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs z-20">
        {current + 1} / {slides.length}
      </div>
    </div>
  );
};

export default HeroSlider;