import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import AdminSidebar from '../Admin/AdminSidebar.jsx';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-30">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md bg-white shadow-md text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        >
          <FaBars className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      </div>

      <AdminSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      <main className="flex-1 p-2 sm:p-4 lg:p-6 xl:p-10 pt-16 lg:pt-6 overflow-auto w-full"> {/* Added w-full and improved padding */}
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;