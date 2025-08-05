import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import SEO from '../Components/SEO';

const FAQ = () => {
  const [openItems, setOpenItems] = useState(new Set());

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const faqs = [
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express), UPI payments, net banking, and digital wallets like Paytm, PhonePe, and Google Pay. We also offer Cash on Delivery (COD) for orders up to ₹5,000."
    },
    {
      question: "How long does shipping take?",
      answer: "Standard delivery takes 3-5 business days across India. Express delivery (1-2 days) is available for select cities. International shipping takes 7-14 business days depending on the destination."
    },
    {
      question: "Do you offer technical support?",
      answer: "Yes, we provide comprehensive technical support for all our products. Our team of electronics experts is available via email, phone, and live chat to help you with product selection, installation, and troubleshooting."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 7-day return policy for most products. Items must be in original packaging and unused condition. Some products like software and custom items are non-returnable. Return shipping is free for defective items."
    },
    {
      question: "Are your products genuine and authentic?",
      answer: "Absolutely! We only stock genuine products from authorized distributors and manufacturers. All our products come with manufacturer warranty and are tested for quality before shipping."
    },
    {
      question: "Do you offer bulk discounts?",
      answer: "Yes, we offer attractive bulk discounts for educational institutions, businesses, and large orders. Contact our sales team for custom pricing and volume discounts."
    },
    {
      question: "Can I track my order?",
      answer: "Yes, you can track your order in real-time through our website or mobile app. You'll receive tracking updates via email and SMS at every stage of delivery."
    },
    {
      question: "Do you ship internationally?",
      answer: "Yes, we ship to most countries worldwide. International shipping rates and delivery times vary by location. Contact us for specific shipping information to your country."
    },
    {
      question: "What if I receive a damaged product?",
      answer: "If you receive a damaged product, please take photos and contact us within 24 hours. We'll arrange a replacement or refund immediately. No questions asked for damaged items."
    },
    {
      question: "Do you have a physical store?",
      answer: "Yes, we have a physical store in Bangalore. You can visit us during business hours to see products in person and get expert advice from our team."
    },
    {
      question: "Can I get a quote for custom requirements?",
      answer: "Yes, we provide custom quotes for special requirements, bulk orders, and unique specifications. Our technical team can help design solutions for your specific needs."
    },
    {
      question: "Do you offer installation services?",
      answer: "Yes, we offer installation and setup services for complex products like industrial automation systems, PLCs, and advanced robotics kits. Additional charges may apply."
    }
  ];

  return (
    <>
      <SEO 
        title="FAQ - SkyElectroTech"
        description="Find answers to frequently asked questions about SkyElectroTech products, shipping, returns, payment methods, and technical support."
        keywords="FAQ, frequently asked questions, SkyElectroTech support, shipping, returns, payment methods"
      />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find answers to common questions about our products, services, and policies
            </p>
          </div>

          {/* FAQ Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-600 text-white p-6 rounded-lg text-center">
              <h3 className="text-lg font-semibold mb-2">Orders & Shipping</h3>
              <p className="text-blue-100">Payment, delivery, and tracking</p>
            </div>
            <div className="bg-green-600 text-white p-6 rounded-lg text-center">
              <h3 className="text-lg font-semibold mb-2">Products & Support</h3>
              <p className="text-green-100">Quality, warranty, and technical help</p>
            </div>
            <div className="bg-purple-600 text-white p-6 rounded-lg text-center">
              <h3 className="text-lg font-semibold mb-2">Returns & Policies</h3>
              <p className="text-purple-100">Returns, refunds, and customer service</p>
            </div>
          </div>

          {/* FAQ List */}
          <div className="bg-white rounded-lg shadow-sm">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 last:border-b-0">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  {openItems.has(index) ? (
                    <FiChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <FiChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {openItems.has(index) && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-12 bg-blue-600 rounded-lg p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-blue-100 mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/contact" 
                className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Contact Us
              </a>
              <a 
                href="/products" 
                className="inline-block border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Browse Products
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FAQ; 