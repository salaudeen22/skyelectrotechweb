import React, { useEffect } from 'react';
import SEO from '../Components/SEO';

const About = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SEO 
        title="About SkyElectroTech - Arduino & Raspberry Pi Dealer Bangalore | Industrial Electronics Supplier"
        description="SkyElectroTech - Leading Arduino, Raspberry Pi & industrial automation components supplier in Bangalore, Karnataka. Electronic components shop in Nagarathpete with Arduino Uno R3, sensor kits, PLCs. Expert technical support & same-day delivery in Bangalore."
        keywords="Arduino dealer Bangalore, Raspberry Pi supplier Karnataka, industrial automation components Bangalore, electronics store Nagarathpete, Arduino Uno R3 Bangalore, sensor kits India, PLC modules Bangalore, electronic components shop near me"
      />
      <div className="bg-gray-50 min-h-screen flex flex-col">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">About SkyElectroTech - Arduino & Raspberry Pi Dealer in Bangalore</h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              Leading Arduino dealer, Raspberry Pi supplier & industrial automation components store in Nagarathpete, Bangalore, Karnataka
            </p>
          </div>

          {/* Company Story */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Our Journey</h2>
            <div className="prose max-w-none text-gray-700 text-sm sm:text-base">
              <p className="mb-3 sm:mb-4">
                <strong>Why does SkyElectroTech exist?</strong> This question takes us back to our founding story.
              </p>
              <p className="mb-3 sm:mb-4">
                As engineering graduates and passionate makers in Bangalore, we faced the same frustration that thousands 
                of students, hobbyists, and professionals encounter daily across Karnataka and India - <em>finding reliable, affordable 
                electronic components locally</em>. Whether it was for a college project, a startup prototype, 
                or an industrial automation solution, we often found ourselves struggling with:
              </p>
              <ul className="mb-3 sm:mb-4 pl-4 sm:pl-6 space-y-1 sm:space-y-0">
                <li>• Limited local availability of quality components</li>
                <li>• Expensive international shipping and customs</li>
                <li>• Lack of technical support and documentation</li>
                <li>• Long delivery times that killed project momentum</li>
              </ul>
              <p className="mb-3 sm:mb-4">
                That was our <strong>Eureka moment</strong>. We realized that India's growing maker community, 
                students, and industries needed a reliable partner - someone who understood their challenges 
                because we had lived them ourselves.
              </p>
              <p className="mb-3 sm:mb-4">
                SkyElectroTech was born from this personal experience in Bangalore's thriving tech ecosystem. We started with a simple promise: 
                to bridge the gap between innovative minds and the Arduino, Raspberry Pi, and automation components they need to bring their 
                ideas to life. What began as solving our own problem has grown into serving thousands 
                of makers, students, and professionals across Karnataka and throughout India.
              </p>
              <p className="mb-3 sm:mb-4">
                Today, we're proud to be part of Bangalore's innovation revolution - supporting everything from 
                student projects at top engineering colleges to industrial automation solutions for Karnataka's industries, 
                from startup prototypes in the Silicon Valley of India to research initiatives. 
                Because we believe that great ideas shouldn't be limited by component availability.
              </p>
            </div>
          </div>

          {/* Our Vision */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-blue-100">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Our Vision</h2>
            <p className="text-base sm:text-lg text-gray-700 mb-4">
              To accelerate Karnataka and India's innovation journey by making world-class Arduino, Raspberry Pi, 
              and industrial automation components accessible to every maker, student, and professional in Bangalore and beyond - 
              because every great invention starts with the right components.
            </p>
            <div className="bg-white/50 rounded-lg p-3 sm:p-4 border-l-4 border-blue-500">
              <p className="text-sm sm:text-base text-gray-700 italic">
                "Innovation distinguishes between a leader and a follower. We exist to ensure that 
                component availability never becomes the limiting factor in India's journey to becoming 
                a global innovation hub."
              </p>
            </div>
          </div>

          {/* Mission & Values */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:p-8 border-l-4 border-green-500">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                <span className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center mr-2 sm:mr-3 text-sm sm:text-base">
                  🎯
                </span>
                Our Mission
              </h3>
              <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">
                To democratize access to quality electronic components and empower innovation 
                across all levels - from curious students to seasoned professionals.
              </p>
              <p className="text-gray-600 text-xs sm:text-sm">
                <strong>How we do it:</strong> By sourcing globally, stocking locally, and delivering 
                with the technical support that every maker deserves.
              </p>
              
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:p-8 border-l-4 border-purple-500">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                <span className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-full flex items-center justify-center mr-2 sm:mr-3 text-sm sm:text-base">
                  💎
                </span>
                Our Values
              </h3>
              <ul className="text-sm sm:text-base text-gray-700 space-y-2 sm:space-y-3">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2 mt-1">•</span>
                  <span><strong>Maker-First:</strong> Understanding your challenges because we've been there</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2 mt-1">•</span>
                  <span><strong>Quality Promise:</strong> Every component tested, every delivery tracked</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2 mt-1">•</span>
                  <span><strong>Community Support:</strong> Building India's innovation ecosystem together</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2 mt-1">•</span>
                  <span><strong>Continuous Learning:</strong> Staying ahead with latest tech and trends</span>
                </li>
              </ul>
            </div>
          </div>

          {/* What We Offer */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">What Makes Us Different</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center p-3 sm:p-4 rounded-lg bg-blue-50 border border-blue-100">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Comprehensive Catalog</h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  10,000+ products from Arduino & Raspberry Pi to PLCs, sensors, motors, 
                  displays, and industrial automation components
                </p>
              </div>
              <div className="text-center p-3 sm:p-4 rounded-lg bg-green-50 border border-green-100">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Quality First</h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Every component tested and verified. Authentic products from trusted 
                  manufacturers with proper warranties
                </p>
              </div>
              <div className="text-center p-3 sm:p-4 rounded-lg bg-purple-50 border border-purple-100">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Lightning Fast</h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Same-day dispatch, 24-48 hour delivery across major cities. 
                  Real-time tracking and updates
                </p>
              </div>
              <div className="text-center p-3 sm:p-4 rounded-lg bg-orange-50 border border-orange-100">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Technical Support</h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Expert technical guidance, detailed documentation, and project 
                  support from fellow makers
                </p>
              </div>
              <div className="text-center p-3 sm:p-4 rounded-lg bg-indigo-50 border border-indigo-100">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Community Focused</h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Special pricing for students, bulk orders for institutions, 
                  and maker community programs
                </p>
              </div>
              <div className="text-center p-3 sm:p-4 rounded-lg bg-teal-50 border border-teal-100">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Innovation Ready</h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Latest components, trending technologies, and emerging 
                  platforms available first
                </p>
              </div>
            </div>
          </div>

          {/* Our Promise to India's Innovators */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-4 sm:p-6 lg:p-8 text-center text-white mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Join India's Innovation Revolution</h2>
            <p className="text-blue-100 mb-4 sm:mb-6 max-w-2xl mx-auto text-sm sm:text-base">
              Whether you're a student building your first Arduino project, a startup creating the next big thing, 
              or an industry professional automating the future - we're here to ensure components never limit your creativity.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <a 
                href="/products" 
                className="inline-block bg-white text-blue-600 px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm sm:text-base"
              >
                Explore Components
              </a>
              <a 
                href="/contact" 
                className="inline-block border-2 border-white text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors text-sm sm:text-base"
              >
                Get Technical Support
              </a>
            </div>
          </div>

          {/* Closing Message */}
          <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-lg">
            <p className="text-sm sm:text-base text-gray-700 italic max-w-2xl mx-auto px-4">
              "Every great innovation started with someone who refused to let limitations define their vision. 
              At SkyElectroTech, we ensure that finding the right components is never one of those limitations."
            </p>
            <p className="text-gray-500 mt-3 sm:mt-4 text-sm sm:text-base">
              - Team SkyElectroTech
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default About; 