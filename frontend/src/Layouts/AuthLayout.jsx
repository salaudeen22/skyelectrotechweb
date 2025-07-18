import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    // This layout is minimal, just renders the auth components directly
    <div className="w-full h-full">
      <Outlet />
    </div>
  );
};

export default AuthLayout;