import { memo } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer.jsx';
import Breadcrumb from '../Components/Breadcrumb';

const MainLayout = memo(() => {
  return (
    <div className="bg-gray-50 font-sans">
      <Navbar />
      <Breadcrumb />
      <main className="pt-20"> {/* Add padding top to account for fixed navbar */}
        <Outlet /> {/* Child routes will be rendered here */}
      </main>
      <Footer />
    </div>
  );
});

MainLayout.displayName = 'MainLayout';

export default MainLayout;