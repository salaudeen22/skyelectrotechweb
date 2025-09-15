import { useState, useEffect } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import SEO from '../Components/SEO';
import FAQSchema from '../Components/FAQSchema';

const FAQ = () => {
  const [openItems, setOpenItems] = useState(new Set());

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
        canonical="https://skyelectrotech.in/faq"
      />
      
      {/* Add FAQ Schema for structured data */}
      <FAQSchema faqs={faqs} />
      <div className="bg-gray-50 min-h-screen flex flex-col">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Frequently Asked Questions</h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              Find answers to common questions about our products, services, and policies
            </p>
          </div>

          {/* FAQ Categories */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-blue-600 text-white p-4 sm:p-6 rounded-lg text-center">
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Orders & Shipping</h3>
              <p className="text-blue-100 text-sm sm:text-base">Payment, delivery, and tracking</p>
            </div>
            <div className="bg-green-600 text-white p-4 sm:p-6 rounded-lg text-center">
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Products & Support</h3>
              <p className="text-green-100 text-sm sm:text-base">Quality, warranty, and technical help</p>
            </div>
            <div className="bg-purple-600 text-white p-4 sm:p-6 rounded-lg text-center">
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Returns & Policies</h3>
              <p className="text-purple-100 text-sm sm:text-base">Returns, refunds, and customer service</p>
            </div>
          </div>

          {/* FAQ List */}
          <div className="bg-white rounded-lg shadow-sm">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 last:border-b-0">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 pr-3 sm:pr-4 leading-tight">
                    {faq.question}
                  </h3>
                  {openItems.has(index) ? (
                    <FiChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <FiChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {openItems.has(index) && (
                  <div className="px-4 sm:px-6 pb-3 sm:pb-4 animate-in slide-in-from-top-1 duration-200">
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-8 sm:mt-12 bg-blue-600 rounded-lg p-4 sm:p-6 lg:p-8 text-center text-white">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Still Have Questions?</h2>
            <p className="text-blue-100 mb-4 sm:mb-6 text-sm sm:text-base px-2">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <a 
                href="/contact" 
                className="inline-block bg-white text-blue-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-100 transition-colors"
              >
                Contact Us
              </a>
              <a 
                href="/products" 
                className="inline-block border-2 border-white text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-white hover:text-blue-600 transition-colors"
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