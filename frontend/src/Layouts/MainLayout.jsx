import { memo } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer.jsx';

const MainLayout = memo(() => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-4 min-h-[calc(100vh-200px)] relative"> {/* Increased min-height and added relative positioning */}
        <div className="min-h-[75vh] w-full flex flex-col relative z-10"> {/* Increased min-height and added z-index */}
          <Outlet /> {/* Child routes will be rendered here */}
        </div>
      </main>
      <Footer />
    </div>
  );
});

MainLayout.displayName = 'MainLayout';

export default MainLayout;