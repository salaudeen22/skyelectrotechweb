import { useEffect } from 'react';

const FAQSchema = ({ faqs = [] }) => {
  useEffect(() => {
    // Remove existing FAQ schema
    const existingSchema = document.querySelector('script[data-faq-schema="true"]');
    if (existingSchema) {
      existingSchema.remove();
    }

    if (faqs.length === 0) return;

    // Create comprehensive FAQ schema
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map((faq) => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer,
          "dateCreated": faq.dateCreated || new Date().toISOString(),
          "upvoteCount": faq.upvoteCount || 0,
          "author": {
            "@type": "Organization",
            "name": "SkyElectroTech"
          }
        }
      }))
    };

    // Add FAQ schema to head
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-faq-schema', 'true');
    script.text = JSON.stringify(faqSchema);
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [faqs]);

  return null;
};

// Default FAQ data for electronics store
export const defaultElectronicsFAQs = [
  {
    question: "Do you provide technical support for Arduino and Raspberry Pi projects?",
    answer: "Yes, SkyElectroTech provides comprehensive technical support for all Arduino, Raspberry Pi, and microcontroller projects. Our expert team helps with code debugging, circuit design, and troubleshooting. Contact us for personalized assistance.",
    upvoteCount: 25
  },
  {
    question: "What is your warranty policy for electronic components?",
    answer: "All genuine electronic components from SkyElectroTech come with manufacturer warranty ranging from 6 months to 2 years depending on the product. Industrial automation components and development boards typically have 1-year warranty. Defective items are replaced free of charge.",
    upvoteCount: 18
  },
  {
    question: "Do you offer same-day delivery in Bangalore?",
    answer: "Yes, we offer same-day delivery for orders placed before 2 PM within Bangalore city limits. Standard delivery takes 1-3 business days across India.",
    upvoteCount: 32
  },
  {
    question: "Can I get custom PCB design and fabrication services?",
    answer: "SkyElectroTech offers professional PCB design and fabrication services for prototypes and small batch production. Our team specializes in Arduino-compatible boards, sensor modules, and industrial automation PCBs. Contact us with your requirements for a quote.",
    upvoteCount: 15
  },
  {
    question: "Do you stock industrial automation components like PLCs and HMIs?",
    answer: "Yes, we maintain extensive inventory of industrial automation components including PLCs, HMIs, servo drives, VFDs, sensors, and control panels from leading brands. Suitable for manufacturing, process automation, and industrial IoT applications.",
    upvoteCount: 21
  },
  {
    question: "What programming and development tools do you recommend for beginners?",
    answer: "For beginners, we recommend starting with Arduino IDE for Arduino boards, Thonny or Raspberry Pi OS for Raspberry Pi, and Fritzing for circuit design. We provide starter kits with tutorials, sample codes, and step-by-step guides for easy learning.",
    upvoteCount: 28
  }
];

export default FAQSchema;