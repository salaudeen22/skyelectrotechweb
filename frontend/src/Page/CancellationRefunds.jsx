import { useEffect } from 'react';
import SEO from '../Components/SEO';

const CancellationRefunds = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SEO 
        title="Cancellation & Refunds Policy - SkyElectroTech"
        description="Learn about SkyElectroTech's cancellation and refunds policy. Understand our return process, refund timelines, and conditions for returns."
        keywords="cancellation policy, refunds, returns, SkyElectroTech returns, refund policy, cancellation process"
      />
      <div className="bg-gray-50 min-h-screen flex flex-col">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Cancellation & Refunds Policy</h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              Our comprehensive policy for order cancellations, returns, and refunds to ensure customer satisfaction.
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:p-8">
            <div className="prose max-w-none text-sm sm:text-base">
              {/* Quick Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-bold text-green-900 mb-3 sm:mb-4">Quick Summary</h2>
                <ul className="list-disc pl-4 sm:pl-6 text-green-800 space-y-1 sm:space-y-2 text-xs sm:text-sm">
                  <li><strong>Order Cancellation:</strong> Free cancellation before shipping</li>
                  <li><strong>Return Window:</strong> 24 hours from delivery date</li>
                  <li><strong>Refund Processing:</strong> 3-7 business days after return</li>
                  <li><strong>Return Shipping:</strong> ₹100-200 (customer responsibility unless defective)</li>
                </ul>
              </div>

              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">1. Order Cancellation Policy</h2>
              
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Before Shipping</h3>
              <ul className="list-disc pl-4 sm:pl-6 text-gray-700 mb-4 sm:mb-6 space-y-1 sm:space-y-0">
                <li><strong>Free Cancellation:</strong> Orders can be cancelled free of charge before they are shipped</li>
                <li><strong>How to Cancel:</strong> Log into your account or contact customer support</li>
                <li><strong>Processing Time:</strong> Cancellation requests are processed within 2-4 hours during business hours</li>
                <li><strong>Refund Timeline:</strong> Refunds for cancelled orders are processed within 3-5 business days</li>
              </ul>

              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">After Shipping</h3>
              <ul className="list-disc pl-4 sm:pl-6 text-gray-700 mb-4 sm:mb-6 space-y-1 sm:space-y-0">
                <li>Once shipped, orders cannot be cancelled directly</li>
                <li>You can refuse delivery or initiate a return request upon delivery</li>
                <li>Return shipping charges will apply (₹100-200 depending on location)</li>
                <li>Refund will be processed after we receive the returned item</li>
              </ul>

              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">2. Return Policy</h2>
              
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Return Window</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <p className="text-blue-800 text-sm sm:text-base">
                  <strong>24 Hours Return Policy:</strong> You can return most items within 24 hours of delivery. 
                  This policy ensures quick resolution and product freshness for our small business operations.
                </p>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-4">Returnable Items</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>Electronics in original packaging and unused condition</li>
                <li>Accessories with all original components</li>
                <li>Items with manufacturing defects or damage during shipping</li>
                <li>Wrong items delivered due to our error</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-4">Non-Returnable Items</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <ul className="list-disc pl-6 text-red-800 space-y-1">
                  <li>Items damaged by misuse or normal wear and tear</li>
                  <li>Products with missing serial numbers or damaged warranty stickers</li>
                  <li>Customized or personalized products</li>
                  <li>Software products (unless defective)</li>
                  <li>Items without original packaging, accessories, or manuals</li>
                  <li>Consumable items like batteries, cables (unless defective)</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Return Process</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 text-lg sm:text-xl font-bold">1</div>
                  <h4 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2">Initiate Return</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Log in to your account and select the item to return, or contact customer support</p>
                </div>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 text-lg sm:text-xl font-bold">2</div>
                  <h4 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2">Schedule Pickup</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Our team will schedule a pickup from your address within 2-3 business days</p>
                </div>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 text-lg sm:text-xl font-bold">3</div>
                  <h4 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2">Receive Refund</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Refund processed within 3-7 business days after we receive the item</p>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-4">Return Requirements</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li><strong>Original Packaging:</strong> Items must be returned in original packaging</li>
                <li><strong>All Accessories:</strong> Include all accessories, manuals, and warranty cards</li>
                <li><strong>Condition:</strong> Items should be in unused, undamaged condition</li>
                <li><strong>Return Reason:</strong> Provide a clear reason for return</li>
                <li><strong>Photos:</strong> For damaged items, photos may be required</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Return Shipping Charges</h2>
              
              {/* Mobile-friendly table - stacked layout */}
              <div className="block sm:hidden mb-6">
                <div className="space-y-4">
                  <div className="bg-white border border-gray-300 rounded-lg p-3">
                    <h4 className="font-semibold text-sm mb-2">Defective/Damaged Item</h4>
                    <div className="flex justify-between text-sm">
                      <span>Shipping:</span>
                      <span className="text-green-600 font-semibold">FREE</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Paid By:</span>
                      <span>SkyElectroTech</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-300 rounded-lg p-3">
                    <h4 className="font-semibold text-sm mb-2">Wrong Item Delivered</h4>
                    <div className="flex justify-between text-sm">
                      <span>Shipping:</span>
                      <span className="text-green-600 font-semibold">FREE</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Paid By:</span>
                      <span>SkyElectroTech</span>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-300 rounded-lg p-3">
                    <h4 className="font-semibold text-sm mb-2">Changed Mind/Not Satisfied</h4>
                    <div className="flex justify-between text-sm">
                      <span>Shipping:</span>
                      <span>₹100-200</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Paid By:</span>
                      <span>Customer</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-300 rounded-lg p-3">
                    <h4 className="font-semibold text-sm mb-2">Size/Compatibility Issues</h4>
                    <div className="flex justify-between text-sm">
                      <span>Shipping:</span>
                      <span>₹100-200</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Paid By:</span>
                      <span>Customer</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto mb-6">
                <table className="min-w-full border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-300 px-3 sm:px-4 py-2 text-left font-semibold text-sm sm:text-base">Return Reason</th>
                      <th className="border border-gray-300 px-3 sm:px-4 py-2 text-left font-semibold text-sm sm:text-base">Shipping Charges</th>
                      <th className="border border-gray-300 px-3 sm:px-4 py-2 text-left font-semibold text-sm sm:text-base">Paid By</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-3 sm:px-4 py-2 text-sm sm:text-base">Defective/Damaged Item</td>
                      <td className="border border-gray-300 px-3 sm:px-4 py-2 text-green-600 font-semibold text-sm sm:text-base">FREE</td>
                      <td className="border border-gray-300 px-3 sm:px-4 py-2 text-sm sm:text-base">SkyElectroTech</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-3 sm:px-4 py-2 text-sm sm:text-base">Wrong Item Delivered</td>
                      <td className="border border-gray-300 px-3 sm:px-4 py-2 text-green-600 font-semibold text-sm sm:text-base">FREE</td>
                      <td className="border border-gray-300 px-3 sm:px-4 py-2 text-sm sm:text-base">SkyElectroTech</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-3 sm:px-4 py-2 text-sm sm:text-base">Changed Mind/Not Satisfied</td>
                      <td className="border border-gray-300 px-3 sm:px-4 py-2 text-sm sm:text-base">₹100-200</td>
                      <td className="border border-gray-300 px-3 sm:px-4 py-2 text-sm sm:text-base">Customer</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-3 sm:px-4 py-2 text-sm sm:text-base">Size/Compatibility Issues</td>
                      <td className="border border-gray-300 px-3 sm:px-4 py-2 text-sm sm:text-base">₹100-200</td>
                      <td className="border border-gray-300 px-3 sm:px-4 py-2 text-sm sm:text-base">Customer</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Refund Policy</h2>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Refund Methods</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li><strong>Original Payment Method:</strong> Refunds are processed to the original payment method used</li>
                <li><strong>Bank Transfer:</strong> For cash on delivery orders, refunds via bank transfer</li>
                <li><strong>Store Credit:</strong> Option available for faster processing (instant credit)</li>
                <li><strong>Wallet Refund:</strong> For digital wallet payments, refunded to the same wallet</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-4">Refund Timeline</h3>
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Payment Method</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Refund Timeline</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Processing Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Credit/Debit Card</td>
                      <td className="border border-gray-300 px-4 py-2">5-7 business days</td>
                      <td className="border border-gray-300 px-4 py-2">After return received</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">UPI/Digital Wallets</td>
                      <td className="border border-gray-300 px-4 py-2">3-5 business days</td>
                      <td className="border border-gray-300 px-4 py-2">After return received</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Net Banking</td>
                      <td className="border border-gray-300 px-4 py-2">5-7 business days</td>
                      <td className="border border-gray-300 px-4 py-2">After return received</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">Cash on Delivery</td>
                      <td className="border border-gray-300 px-4 py-2">7-10 business days</td>
                      <td className="border border-gray-300 px-4 py-2">Bank transfer after return</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Special Categories</h2>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Electronics & Gadgets</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>24 hours return window for electronics</li>
                <li>Must include original packaging, accessories, and warranty cards</li>
                <li>Serial numbers and warranty stickers must be intact</li>
                <li>Software licenses cannot be transferred back</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom/Bulk Orders</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>Customized products are generally non-returnable</li>
                <li>Bulk orders (&gt;10 items) may have different return policies</li>
                <li>Contact customer support for custom order returns</li>
                <li>Restocking fee may apply for bulk returns</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Warranty vs Returns</h2>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-yellow-900 mb-3">Important Distinction</h3>
                <ul className="list-disc pl-6 text-yellow-800 space-y-2">
                  <li><strong>Returns:</strong> For items you want to send back for refund (24 hours)</li>
                  <li><strong>Warranty:</strong> For defective items after the return period (varies by product)</li>
                  <li><strong>Replacement:</strong> Available for defective items within return period</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Replacement Policy</h2>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>Replacements available for defective or damaged items</li>
                <li>Same product replacement subject to stock availability</li>
                <li>If exact product unavailable, refund will be processed</li>
                <li>Replacement shipping is free for defective items</li>
                <li>Replacement timeline: 3-7 business days after return received</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Dispute Resolution</h2>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-4">If Your Return is Rejected</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>You will receive detailed reasons for rejection</li>
                <li>Photos of the returned item condition will be provided</li>
                <li>You can appeal the decision within 3 days</li>
                <li>Items will be returned to you at your shipping cost</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Check Process</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>All returned items undergo quality inspection</li>
                <li>Items must pass our quality standards for refund approval</li>
                <li>Inspection typically takes 1-2 business days</li>
                <li>You will be notified of inspection results</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">10. Customer Support</h2>
              <p className="text-gray-700 mb-4">
                For any questions about cancellations, returns, or refunds, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> skyelectrotechblr@gmail.com<br />
                  <strong>Phone:</strong> +91 063612 41811<br />
                  <strong>WhatsApp:</strong> +91 063612 41811<br />
                  <strong>Support Hours:</strong> 9:00 AM - 7:00 PM (Monday to Saturday)<br />
                  <strong>Average Response Time:</strong> Within 4 hours during business hours<br />
                  <strong>Address:</strong> 2nd Floor, No 140, Sadar Patrappa Rd, Thigalarpet, Kumbarpet, Dodpete, Nagarathpete, Bengaluru, Karnataka 560002, India
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Need Help?</h3>
                <p className="text-blue-800">
                  Our customer support team is here to help you with any return or refund queries. 
                  Don't hesitate to reach out if you need assistance with the return process.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CancellationRefunds;
