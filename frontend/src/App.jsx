import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";

// Layout Components
import MainLayout from "./Layouts/MainLayout";
import AuthLayout from "./Layouts/AuthLayout";
import AdminLayout from "./Layouts/AdminLayout";

// User Pages
import Home from "./Page/Home";
import ProductList from "./User/ProductList";
import Cart from "./User/Cart";
import Checkout from "./User/Checkout";

// Admin Pages
import AdminDashboard from "./Admin/AdminDashboard";
import ProductManagement from "./Admin/ProductManagement";
import Sales from "./Admin/Sales";
import Inventory from "./Admin/Inventory";
import Employees from "./Admin/Employees";
import Login from "./Admin/Login";
import Register from "./Admin/Register";

const App = () => {
  return (
    <Routes>
      {/* Auth Portal (No Navbar/Footer) */}
      <Route element={<AuthLayout />}>
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/register" element={<Register />} />
      </Route>

      {/* Admin Portal (Admin Sidebar Layout) */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="sales" element={<Sales />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="employees" element={<Employees />} />
      </Route>

      {/* User Portal (Main Navbar/Footer Layout) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
      </Route>
    </Routes>
  );
};

export default App;