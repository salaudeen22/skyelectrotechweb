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
          <FaBars className="h-6 w-6" />
        </button>
      </div>

      <AdminSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      <main className="flex-1 p-6 lg:p-10 pt-16 lg:pt-6 overflow-auto"> {/* Added overflow-auto for proper scrolling */}
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;