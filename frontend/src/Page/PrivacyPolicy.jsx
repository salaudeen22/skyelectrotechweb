import React from 'react';
import SEO from '../Components/SEO';

const PrivacyPolicy = () => {
  return (
    <>
      <SEO 
        title="Privacy Policy - SkyElectroTech"
        description="Learn about how SkyElectroTech collects, uses, and protects your personal information. Read our comprehensive privacy policy."
        keywords="privacy policy, data protection, personal information, SkyElectroTech privacy"
      />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              How we collect, use, and protect your personal information
            </p>
            <p className="text-sm text-gray-500 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Information We Collect</h2>
              <p className="text-gray-700 mb-4">
                We collect information you provide directly to us, such as when you create an account, 
                make a purchase, or contact our support team. This may include:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>Name, email address, and phone number</li>
                <li>Billing and shipping addresses</li>
                <li>Payment information (processed securely by our payment partners)</li>
                <li>Order history and preferences</li>
                <li>Communications with our support team</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">2. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>Process and fulfill your orders</li>
                <li>Provide customer support and technical assistance</li>
                <li>Send order confirmations and shipping updates</li>
                <li>Improve our products and services</li>
                <li>Send marketing communications (with your consent)</li>
                <li>Comply with legal obligations</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Information Sharing</h2>
              <p className="text-gray-700 mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share 
                your information only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>With payment processors to complete transactions</li>
                <li>With shipping partners to deliver your orders</li>
                <li>With service providers who assist in our operations</li>
                <li>When required by law or to protect our rights</li>
                <li>With your explicit consent</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement appropriate security measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>SSL encryption for all data transmission</li>
                <li>Secure payment processing</li>
                <li>Regular security audits</li>
                <li>Limited access to personal information</li>
                <li>Secure data storage practices</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Cookies and Tracking</h2>
              <p className="text-gray-700 mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>Remember your preferences and settings</li>
                <li>Analyze website traffic and usage patterns</li>
                <li>Provide personalized content and recommendations</li>
                <li>Improve website functionality and performance</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Your Rights</h2>
              <p className="text-gray-700 mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Request data portability</li>
                <li>Lodge a complaint with supervisory authorities</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Data Retention</h2>
              <p className="text-gray-700 mb-4">
                We retain your personal information only as long as necessary to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>Provide our services</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes</li>
                <li>Enforce our agreements</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Children's Privacy</h2>
              <p className="text-gray-700 mb-6">
                Our services are not intended for children under 13 years of age. We do not knowingly 
                collect personal information from children under 13. If you believe we have collected 
                information from a child under 13, please contact us immediately.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Changes to This Policy</h2>
              <p className="text-gray-700 mb-6">
                We may update this privacy policy from time to time. We will notify you of any changes 
                by posting the new policy on this page and updating the "Last updated" date. We encourage 
                you to review this policy periodically.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">10. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about this privacy policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> privacy@skyelectrotech.com<br />
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

export default PrivacyPolicy; 