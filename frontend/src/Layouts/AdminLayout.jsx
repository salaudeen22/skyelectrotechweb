import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../Admin/AdminSidebar.jsx';

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-10 ml-64"> {/* ml-64 to offset sidebar width */}
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;