import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppChat = ({ className = '' }) => {
  const handleWhatsAppClick = () => {
    const phoneNumber = '+916361241811';
    const message = 'Hello! I need help from SkyElectroTech support.';
    const whatsappUrl = `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      type="button"
      onClick={handleWhatsAppClick}
      aria-label="Chat on WhatsApp"
      className={`fixed bottom-5 right-5 z-40 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 active:scale-95 transition transform focus:outline-none focus:ring-4 focus:ring-green-300 p-4 ${className}`}
    >
      <FaWhatsapp className="w-6 h-6" />
    </button>
  );
};

export default WhatsAppChat;