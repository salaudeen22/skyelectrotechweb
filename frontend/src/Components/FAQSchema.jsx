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

// Default FAQ data for electronics store - optimized for competitor keywords
export const defaultElectronicsFAQs = [
  {
    question: "What power supply does Arduino Uno R3 need?",
    answer: "Arduino Uno R3 with Cable can be powered via USB (5V) or external adapter (7-12V DC). When buying Arduino Uno R3 from SkyElectroTech, the included USB cable provides power and programming interface. For standalone operation, use 9V DC adapter.",
    upvoteCount: 45
  },
  {
    question: "What's the price difference between Raspberry Pi 4 Model B 4GB vs 8GB in India?",
    answer: "Raspberry Pi 4 Model B 4GB price in India is ₹5,999 while 8GB variant costs ₹8,999 at SkyElectroTech. The 8GB version is better for memory-intensive applications, multiple virtual machines, and heavy computing tasks.",
    upvoteCount: 38
  },
  {
    question: "What sensors are included in the 37-in-1 sensor kit?",
    answer: "Our 37-in-1 sensor kit includes IR sensor module, ultrasonic sensor Arduino compatible, temperature & humidity sensors, flame sensor, sound sensor, heartbeat sensor, vibration sensor, and 30+ more sensors. Perfect for Arduino and Raspberry Pi projects.",
    upvoteCount: 52
  },
  {
    question: "How do I connect IR sensor module with Arduino?",
    answer: "IR sensor module connection: VCC to 5V, GND to GND, OUT to digital pin (e.g., pin 2). The IR sensor module detects obstacles and outputs HIGH/LOW signal. Ideal for obstacle avoidance robots and proximity detection projects.",
    upvoteCount: 41
  },
  {
    question: "Which proximity sensor is best for industrial automation in Bangalore?",
    answer: "For industrial automation in Bangalore, we recommend inductive proximity sensors (metal detection) or capacitive proximity sensors (all materials). Our PLC modules are compatible with standard proximity sensors. Available with NPN/PNP outputs.",
    upvoteCount: 29
  },
  {
    question: "Do you provide same-day delivery for Arduino and Raspberry Pi in Bangalore?",
    answer: "Yes, SkyElectroTech offers same-day delivery in Bangalore for Arduino Uno R3, Raspberry Pi 4, sensor kits, and other components. Order before 2 PM for same-day delivery within Bangalore city limits.",
    upvoteCount: 56
  },
  {
    question: "What's the range of ultrasonic sensor Arduino HC-SR04?",
    answer: "Ultrasonic sensor Arduino HC-SR04 has measuring range of 2cm to 400cm with accuracy of ±3mm. Operating frequency is 40KHz. Perfect for distance measurement, water level monitoring, and robotic applications.",
    upvoteCount: 33
  },
  {
    question: "Are your Arduino kits suitable for beginners in India?",
    answer: "Yes, our Arduino kits India are designed for beginners with step-by-step tutorials, sample codes, and project guides. Each Arduino kit includes Arduino Uno R3 with cable, breadboard, jumper wires, and essential components for learning.",
    upvoteCount: 44
  }
];

export default FAQSchema;