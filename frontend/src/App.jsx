import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { CategoriesProvider } from './contexts/CategoriesContext';

// Layouts
import MainLayout from './Layouts/MainLayout';
import AdminLayout from './Layouts/AdminLayout';
import AuthLayout from './Layouts/AuthLayout';

// Pages
import Home from './Page/Home';
import ProductList from './User/ProductList';
import ProductDetails from './User/ProductDetails';
import Cart from './User/Cart';
import Checkout from './User/Checkout';
import OrderHistory from './User/OrderHistory';
import OrderDetails from './User/OrderDetails';
import Profile from './User/Profile';

// Auth Pages
import Login from './Auth/Login';
import Register from './Auth/Register';

// Admin Pages
import AdminDashboard from './Admin/AdminDashboard';
import ProductManagement from './Admin/ProductManagement';
import CategoriesManagement from './Admin/CategoriesManagement';
import Inventory from './Admin/Inventory';
import Sales from './Admin/Sales';
import Employees from './Admin/Employees';

// Components
import ProtectedRoute from './Components/ProtectedRoute';
import NotFound from './Components/NotFound';

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <CategoriesProvider>
            <Router>
              <div className="App">
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      duration: 3000,
                      theme: {
                        primary: 'green',
                        secondary: 'black',
                      },
                    },
                  }}
                />
              
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<Home />} />
                  <Route path="products" element={<ProductList />} />
                  <Route path="products/:id" element={<ProductDetails />} />
                  <Route path="category/:categoryId" element={<ProductList />} />
                  <Route path="search" element={<ProductList />} />
                </Route>

                {/* Auth Routes */}
                <Route path="/auth" element={<AuthLayout />}>
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                </Route>

                {/* Protected User Routes */}
                <Route path="/user" element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <MainLayout />
                  </ProtectedRoute>
                }>
                  <Route path="cart" element={<Cart />} />
                  <Route path="checkout" element={<Checkout />} />
                  <Route path="orders" element={<OrderHistory />} />
                  <Route path="orders/:id" element={<OrderDetails />} />
                  <Route path="profile" element={<Profile />} />
                </Route>

                {/* Admin/Employee Routes */}
                <Route path="/admin" element={
                  <ProtectedRoute allowedRoles={['admin', 'employee']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<AdminDashboard />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  
                  {/* Admin Only Routes */}
                  <Route path="products" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <ProductManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="categories" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <CategoriesManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="inventory" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Inventory />
                    </ProtectedRoute>
                  } />
                  <Route path="sales" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Sales />
                    </ProtectedRoute>
                  } />
                  <Route path="employees" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Employees />
                    </ProtectedRoute>
                  } />
                </Route>

                {/* Redirect old routes */}
                <Route path="/admin/login" element={<Navigate to="/auth/login" replace />} />
                <Route path="/admin/register" element={<Navigate to="/auth/register" replace />} />
                <Route path="/cart" element={<Navigate to="/user/cart" replace />} />
                <Route path="/checkout" element={<Navigate to="/user/checkout" replace />} />

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </Router>
        </CategoriesProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
  );
};

export default App;