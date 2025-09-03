import React, { useEffect } from 'react';
import SEO from '../Components/SEO';

const TermsOfService = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SEO 
        title="Terms of Service - SkyElectroTech "
        description="Read SkyElectroTech's terms of service covering website usage, product purchases, returns, and customer obligations."
        keywords="terms of service, terms and conditions, SkyElectroTech terms, website usage terms"
      />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Please read these terms carefully before using our services
            </p>
            <p className="text-sm text-gray-500 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-6">
                By accessing and using SkyElectroTech's website and services, you accept and agree to be bound 
                by the terms and provision of this agreement. If you do not agree to abide by the above, 
                please do not use this service.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Use License</h2>
              <p className="text-gray-700 mb-4">
                Permission is granted to temporarily download one copy of the materials (information or software) 
                on SkyElectroTech's website for personal, non-commercial transitory viewing only. This is the 
                grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on the website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Product Information</h2>
              <p className="text-gray-700 mb-4">
                While we strive to provide accurate product information, we do not warrant that product 
                descriptions, prices, or other content is accurate, complete, reliable, current, or error-free. 
                Product images are for illustrative purposes only and may not reflect the exact appearance 
                of the product.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Pricing and Payment</h2>
              <p className="text-gray-700 mb-4">
                All prices are in Indian Rupees (INR) and are subject to change without notice. Payment 
                must be made at the time of order placement. We accept various payment methods including 
                credit cards, UPI, net banking, and digital wallets.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Shipping and Delivery</h2>
              <p className="text-gray-700 mb-4">
                Delivery times are estimates only. We are not responsible for delays beyond our control. 
                Risk of loss and title for items purchased pass to you upon delivery of the items to the carrier.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Returns and Refunds</h2>
              <p className="text-gray-700 mb-4">
                We accept returns within 7 days of delivery for most products. Items must be in original 
                packaging and unused condition. Some products are non-returnable. Return shipping costs 
                are the responsibility of the customer unless the item is defective.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Warranty and Support</h2>
              <p className="text-gray-700 mb-4">
                Products come with manufacturer warranty as applicable. We provide technical support for 
                our products but are not responsible for misuse or improper installation. Technical support 
                is provided on a best-effort basis.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">8. User Accounts</h2>
              <p className="text-gray-700 mb-4">
                You are responsible for maintaining the confidentiality of your account and password. You 
                agree to accept responsibility for all activities that occur under your account or password.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Prohibited Uses</h2>
              <p className="text-gray-700 mb-4">
                You may not use our website or services to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Transmit harmful, offensive, or inappropriate content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with the proper functioning of our website</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">10. Intellectual Property</h2>
              <p className="text-gray-700 mb-6">
                The content on this website, including text, graphics, logos, images, and software, is 
                the property of SkyElectroTech and is protected by copyright laws. You may not reproduce, 
                distribute, or create derivative works without our written permission.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">11. Limitation of Liability</h2>
              <p className="text-gray-700 mb-6">
                SkyElectroTech shall not be liable for any indirect, incidental, special, consequential, 
                or punitive damages, including but not limited to loss of profits, data, or use, incurred 
                by you or any third party, whether in an action in contract or tort, even if we have been 
                advised of the possibility of such damages.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">12. Indemnification</h2>
              <p className="text-gray-700 mb-6">
                You agree to indemnify and hold harmless SkyElectroTech from any claims, damages, or expenses 
                arising from your use of our services or violation of these terms.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">13. Governing Law</h2>
              <p className="text-gray-700 mb-6">
                These terms shall be governed by and construed in accordance with the laws of India. Any 
                disputes arising from these terms shall be subject to the exclusive jurisdiction of the 
                courts in Bangalore, Karnataka.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">14. Changes to Terms</h2>
              <p className="text-gray-700 mb-6">
                We reserve the right to modify these terms at any time. Changes will be effective immediately 
                upon posting on the website. Your continued use of our services constitutes acceptance of 
                the modified terms.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">15. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these terms, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@skyelectrotech.com<br />
                  <strong>Phone:</strong> +91 98765 43210<br />
                  <strong>Address:</strong> SkyElectroTech, 123 Electronics Street, Tech Park, Bangalore - 560001, Karnataka, India
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsOfService; 