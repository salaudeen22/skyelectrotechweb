import React, { useEffect } from 'react';
import SEO from '../Components/SEO';

const ShippingPolicy = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SEO 
        title="Shipping Policy - SkyElectroTech"
        description="Learn about SkyElectroTech's shipping policies, delivery times, shipping charges, and coverage areas. Get all the information about our shipping process."
        keywords="shipping policy, delivery, shipping charges, SkyElectroTech shipping, delivery time, shipping areas"
      />
      <div className="bg-gray-50 min-h-screen flex flex-col">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Shipping Policy</h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              Everything you need to know about our shipping process, delivery times, and charges.
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:p-8">
            <div className="prose max-w-none text-sm sm:text-base">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">1. Shipping Coverage</h2>
              <p className="text-gray-700 mb-3 sm:mb-4">
                We currently ship to all locations within India. Our shipping network covers:
              </p>
              <ul className="list-disc pl-4 sm:pl-6 text-gray-700 mb-4 sm:mb-6 space-y-1 sm:space-y-0">
                <li>All major cities and metropolitan areas</li>
                <li>Tier 2 and Tier 3 cities</li>
                <li>Rural areas (subject to courier availability)</li>
                <li>Union territories and remote locations</li>
              </ul>

              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">2. Shipping Methods & Delivery Times</h2>
              
              {/* Mobile Cards */}
              <div className="block sm:hidden space-y-4 mb-6">
                <div className="bg-white border border-gray-300 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Standard Delivery</h4>
                  <p className="text-sm text-gray-600 mb-1"><strong>Time:</strong> 3-5 business days</p>
                  <p className="text-sm text-gray-600"><strong>Coverage:</strong> Pan India</p>
                </div>
                <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Express Delivery</h4>
                  <p className="text-sm text-gray-600 mb-1"><strong>Time:</strong> 1-2 business days</p>
                  <p className="text-sm text-gray-600"><strong>Coverage:</strong> Major cities only</p>
                </div>
                <div className="bg-white border border-gray-300 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Same Day Delivery</h4>
                  <p className="text-sm text-gray-600 mb-1"><strong>Time:</strong> Same day (orders before 6 PM)</p>
                  <p className="text-sm text-gray-600"><strong>Coverage:</strong> Bangalore city limits only</p>
                </div>
              </div>

              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto mb-6">
                <table className="min-w-full border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Shipping Method</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Delivery Time</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Coverage</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Standard Delivery</td>
                      <td className="border border-gray-300 px-4 py-2">3-5 business days</td>
                      <td className="border border-gray-300 px-4 py-2">Pan India</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">Express Delivery</td>
                      <td className="border border-gray-300 px-4 py-2">1-2 business days</td>
                      <td className="border border-gray-300 px-4 py-2">Major cities only</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Same Day Delivery</td>
                      <td className="border border-gray-300 px-4 py-2">Same day (orders before 6 PM)</td>
                      <td className="border border-gray-300 px-4 py-2">Bangalore city limits only</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">3. Shipping Charges</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-2 sm:mb-3">Free Shipping</h3>
                <p className="text-blue-800 text-sm sm:text-base">
                  Enjoy <strong>FREE shipping</strong> on all orders above ₹1,000 for standard delivery within India.
                </p>
              </div>
              
              {/* Mobile Cards */}
              <div className="block sm:hidden space-y-4 mb-6">
                <div className="bg-white border border-gray-300 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Below ₹1,000</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Standard:</strong> ₹50</p>
                    <p className="text-sm text-gray-600"><strong>Express:</strong> ₹150</p>
                    <p className="text-sm text-gray-600"><strong>Same Day:</strong> ₹200</p>
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">₹1,000 & above</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-green-600 font-semibold"><strong>Standard:</strong> FREE</p>
                    <p className="text-sm text-gray-600"><strong>Express:</strong> ₹100</p>
                    <p className="text-sm text-gray-600"><strong>Same Day:</strong> ₹150</p>
                  </div>
                </div>
              </div>

              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto mb-6">
                <table className="min-w-full border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Order Value</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Standard Delivery</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Express Delivery</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Same Day Delivery</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Below ₹1,000</td>
                      <td className="border border-gray-300 px-4 py-2">₹50</td>
                      <td className="border border-gray-300 px-4 py-2">₹150</td>
                      <td className="border border-gray-300 px-4 py-2">₹200</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">₹1,000 & above</td>
                      <td className="border border-gray-300 px-4 py-2 text-green-600 font-semibold">FREE</td>
                      <td className="border border-gray-300 px-4 py-2">₹100</td>
                      <td className="border border-gray-300 px-4 py-2">₹150</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">4. Order Processing Time</h2>
              <ul className="list-disc pl-4 sm:pl-6 text-gray-700 mb-4 sm:mb-6 space-y-1 sm:space-y-0">
                <li>Orders placed before 6:00 PM on business days are eligible for same-day delivery within Bangalore</li>
                <li>Orders placed after 6:00 PM or on weekends/holidays are processed the next business day</li>
                <li>Standard orders are typically processed within 24 hours</li>
                <li>Custom or bulk orders may require additional processing time (2-3 business days)</li>
                <li>During peak seasons or sales, processing may take 1-2 additional days</li>
              </ul>

              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">5. Tracking Your Order</h2>
              <p className="text-gray-700 mb-3 sm:mb-4">
                Once your order is shipped, you will receive:
              </p>
              <ul className="list-disc pl-4 sm:pl-6 text-gray-700 mb-4 sm:mb-6 space-y-1 sm:space-y-0">
                <li>Email notification with tracking number</li>
                <li>SMS updates on delivery status</li>
                <li>Real-time tracking through our website</li>
                <li>WhatsApp notifications (if opted in)</li>
              </ul>

              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">6. Delivery Guidelines</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-yellow-900 mb-2 sm:mb-3">Important Notes</h3>
                <ul className="list-disc pl-4 sm:pl-6 text-yellow-800 space-y-1 text-sm sm:text-base">
                  <li>Delivery times are estimates and may vary due to unforeseen circumstances</li>
                  <li>Delivery attempts are made during business hours (9 AM - 7 PM)</li>
                  <li>Customers will be contacted before delivery</li>
                  <li>Photo ID may be required for delivery verification</li>
                </ul>
              </div>

              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">7. Special Circumstances</h2>
              
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Remote Areas</h3>
              <p className="text-gray-700 mb-3 sm:mb-4">
                For remote locations or areas with limited courier access:
              </p>
              <ul className="list-disc pl-4 sm:pl-6 text-gray-700 mb-4 sm:mb-6 space-y-1 sm:space-y-0">
                <li>Additional 2-3 days may be required for delivery</li>
                <li>Remote area surcharge of ₹50-100 may apply</li>
                <li>Customer will be notified of any additional charges before shipment</li>
              </ul>

              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Monsoon & Natural Disasters</h3>
              <p className="text-gray-700 mb-4 sm:mb-6">
                During adverse weather conditions or natural disasters, deliveries may be delayed. 
                We will keep you informed of any significant delays through email and SMS.
              </p>

              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Festival Seasons</h3>
              <p className="text-gray-700 mb-4 sm:mb-6">
                During major festivals (Diwali, Holi, etc.), delivery times may be extended by 1-2 days 
                due to increased order volumes and limited courier operations.
              </p>

              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">8. Delivery Issues</h2>
              
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Failed Delivery Attempts</h3>
              <ul className="list-disc pl-4 sm:pl-6 text-gray-700 mb-4 sm:mb-6 space-y-1 sm:space-y-0">
                <li>Up to 3 delivery attempts will be made</li>
                <li>If all attempts fail, package will be returned to our warehouse</li>
                <li>Customer will be charged for re-shipment</li>
                <li>Orders returned due to failed delivery may be cancelled after 7 days</li>
              </ul>

              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Damaged or Missing Items</h3>
              <p className="text-gray-700 mb-3 sm:mb-4">
                If you receive a damaged or missing item:
              </p>
              <ul className="list-disc pl-4 sm:pl-6 text-gray-700 mb-4 sm:mb-6 space-y-1 sm:space-y-0">
                <li>Report the issue within 24 hours of delivery</li>
                <li>Provide photos of the damaged item and packaging</li>
                <li>We will arrange for replacement or refund</li>
                <li>Return pickup will be arranged at no cost to you</li>
              </ul>

              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">9. International Shipping</h2>
              <p className="text-gray-700 mb-4 sm:mb-6">
                Currently, we do not offer international shipping. We only deliver within India. 
                We are working on expanding our services to international markets and will update 
                this policy when available.
              </p>

              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">10. Address Change Policy</h2>
              <ul className="list-disc pl-4 sm:pl-6 text-gray-700 mb-4 sm:mb-6 space-y-1 sm:space-y-0">
                <li>Address changes are only possible before the order is shipped</li>
                <li>Contact customer support immediately for address changes</li>
                <li>Once shipped, address cannot be modified</li>
                <li>Additional charges may apply for address changes to different zones</li>
              </ul>

              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">11. Contact Information</h2>
              <p className="text-gray-700 mb-3 sm:mb-4">
                For shipping-related queries, please contact us:
              </p>
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <p className="text-gray-700 text-sm sm:text-base">
                  <strong>Email:</strong> skyelectrotechblr@gmail.com<br />
                  <strong>Phone:</strong> +91 63612 41811<br />
                  <strong>Customer Support Hours:</strong> 9:00 AM - 7:00 PM (Monday to Saturday)<br />
                  <strong>Address:</strong> 2nd Floor, No 140, Sadar Patrappa Rd, Thigalarpet, Kumbarpet, Dodpete, Nagarathpete, Bengaluru, Karnataka 560002, India
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShippingPolicy;
