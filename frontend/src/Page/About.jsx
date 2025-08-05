import React from 'react';
import SEO from '../Components/SEO';

const About = () => {
  return (
    <>
      <SEO 
        title="About Us - SkyElectroTech"
        description="Learn about SkyElectroTech - your trusted partner for electronics and industrial automation components. Discover our story, mission, and commitment to quality."
        keywords="about SkyElectroTech, electronics company, industrial automation, Arduino, Raspberry Pi, company history"
      />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">About SkyElectroTech</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your trusted partner for electronics and industrial automation components
            </p>
          </div>

          {/* Company Story */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Story</h2>
            <div className="prose max-w-none text-gray-700">
              <p className="mb-4">
                SkyElectroTech was founded with a simple mission: to make high-quality electronic components 
                and industrial automation equipment accessible to everyone - from students and hobbyists to 
                professional engineers and industrial clients.
              </p>
              <p className="mb-4">
                What started as a small electronics store has grown into a comprehensive platform serving 
                thousands of customers across India. We understand the challenges faced by makers, 
                students, and professionals in finding reliable components for their projects.
              </p>
              <p className="mb-4">
                Today, we're proud to offer one of the largest selections of Arduino, Raspberry Pi, 
                sensors, motor drivers, and industrial automation components in India, backed by 
                exceptional customer service and technical support.
              </p>
            </div>
          </div>

          {/* Mission & Values */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-700">
                To democratize access to quality electronic components and empower innovation 
                across all levels - from beginners to advanced professionals.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Our Values</h3>
              <ul className="text-gray-700 space-y-2">
                <li>• Quality and reliability in every product</li>
                <li>• Exceptional customer service</li>
                <li>• Innovation and continuous improvement</li>
                <li>• Supporting the maker community</li>
              </ul>
            </div>
          </div>

          {/* What We Offer */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What We Offer</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Wide Product Range</h3>
                <p className="text-gray-600">
                  From Arduino and Raspberry Pi to industrial PLCs and automation components
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Assured</h3>
                <p className="text-gray-600">
                  All products are verified and tested for quality and reliability
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast Delivery</h3>
                <p className="text-gray-600">
                  Quick and reliable shipping across India with real-time tracking
                </p>
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="bg-blue-600 rounded-lg p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Ready to Start Your Project?</h2>
            <p className="text-blue-100 mb-6">
              Browse our extensive collection of electronic components and find everything you need
            </p>
            <a 
              href="/products" 
              className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Shop Now
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default About; 