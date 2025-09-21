import { memo } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import CategoriesNavbar from '../Components/CategoriesNavbar';
import Footer from '../Components/Footer.jsx';
import WhatsAppChat from '../Components/WhatsAppChat';

const MainLayout = memo(() => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Navbar />
      <CategoriesNavbar />
      <main className="flex-1 pt-28 pb-4 min-h-[calc(100vh-200px)] relative"> {/* Increased pt to account for categories navbar */}
        <div className="min-h-[75vh] w-full flex flex-col relative z-0"> {/* Reduced z-index to allow dropdowns to appear above */}
          <Outlet /> {/* Child routes will be rendered here */}
        </div>
      </main>
      <Footer />
      
      {/* WhatsApp Chat Button - Available on all user pages */}
      <WhatsAppChat />
    </div>
  );
});

MainLayout.displayName = 'MainLayout';

export default MainLayout;