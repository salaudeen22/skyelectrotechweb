import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initializeAnalytics } from './utils/analytics';
import { io } from 'socket.io-client';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { CategoriesProvider } from './contexts/CategoriesContext';
import { SettingsProvider } from './contexts/SettingsContext';

// Layouts
import MainLayout from './Layouts/MainLayout';
import AdminLayout from './Layouts/AdminLayout';
import AuthLayout from './Layouts/AuthLayout';

// Pages
import Home from './Page/Home';
import About from './Page/About';
import Contact from './Page/Contact';
import FAQ from './Page/FAQ';
import PrivacyPolicy from './Page/PrivacyPolicy';
import TermsOfService from './Page/TermsOfService';
import ShippingPolicy from './Page/ShippingPolicy';
import CancellationRefunds from './Page/CancellationRefunds';
import ProductList from './User/ProductList';
import ProductDetails from './User/ProductDetails';
import Cart from './User/Cart';
import ShippingInfo from './User/ShippingInfo';
import ShippingMethod from './User/ShippingMethod';
import Payment from './User/Payment';
import Checkout from './User/Checkout';
import OrderHistory from './User/OrderHistory';
import OrderDetails from './User/OrderDetails';
import Profile from './User/Profile';

// Auth Pages
import Login from './Auth/Login';
import Register from './Auth/Register';
import AuthCallback from './Auth/AuthCallback';
import ForgotPassword from './Auth/ForgotPassword';
import ResetPassword from './Auth/ResetPassword';
import ChangePassword from './Auth/ChangePassword';

// User Pages
import Wishlist from './User/Wishlist';
import Notifications from './User/Notifications';
import NotificationSettings from './User/NotificationSettings';

// Admin Pages
import AdminDashboard from './Admin/AdminDashboard';
import ProductManagement from './Admin/ProductManagement';
import CategoriesManagement from './Admin/CategoriesManagement';
import CommentsManagement from './Admin/CommentsManagement';
import Employees from './Admin/Employees';
import Settings from './Admin/Settings';
import OrdersAndSales from './Admin/OrderManagement';
import ReturnRequests from './Admin/ReturnRequests';
import ServiceRequests from './Admin/ServiceRequests';

// Components
import ProtectedRoute from './Components/ProtectedRoute';
import NotFound from './Components/NotFound';
import AnalyticsTracker from './Components/AnalyticsTracker';
import ErrorBoundary from './Components/ErrorBoundary';


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
  useEffect(() => {
    initializeAnalytics();
    
    // Initialize Socket.IO for real-time notifications
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5001', {
      transports: ['websocket', 'polling'],
      autoConnect: true
    });

    // Store socket in window object for use in hooks
    window.io = socket;

    // Socket event listeners
    socket.on('connect', () => {
      console.log('Socket.IO connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
    });

    socket.on('error', (error) => {
      console.error('Socket.IO error:', error);
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <CategoriesProvider>
            <SettingsProvider>
              <Router>
                <ErrorBoundary>
                  <div className="App">
                    <AnalyticsTracker />
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
                  <Route path="about" element={<About />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="faq" element={<FAQ />} />
                  <Route path="privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="terms-of-service" element={<TermsOfService />} />
                  <Route path="shipping-policy" element={<ShippingPolicy />} />
                  <Route path="cancellation-refunds" element={<CancellationRefunds />} />
                  <Route path="products" element={<ProductList />} />
                  <Route path="products/:id" element={<ProductDetails />} />
                  {/* SEO-friendly product URLs with slug-id format */}
                  <Route path="product/:slugWithId" element={<ProductDetails />} />
                  <Route path="category/:categoryId" element={<ProductList />} />
                  {/* SEO-friendly category URLs with slug-id format */}
                  <Route path="category/:slugWithId" element={<ProductList />} />
                  <Route path="search" element={<ProductList />} />
                </Route>

                {/* Auth Routes */}
                <Route path="/auth" element={<AuthLayout />}>
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route path="callback" element={<AuthCallback />} />
                  <Route path="forgot-password" element={<ForgotPassword />} />
                  <Route path="reset-password" element={<ResetPassword />} />
                  <Route path="change-password" element={
                    <ProtectedRoute allowedRoles={['user', 'admin', 'employee']}>
                      <ChangePassword />
                    </ProtectedRoute>
                  } />
                </Route>

                {/* Protected User Routes */}
                <Route path="/user" element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <MainLayout />
                  </ProtectedRoute>
                }>
                  <Route path="cart" element={<Cart />} />
                  <Route path="shipping" element={<ShippingInfo />} />
                  <Route path="shipping-method" element={<ShippingMethod />} />
                  <Route path="payment" element={<Payment />} />
                  <Route path="checkout" element={<Checkout />} />
                  <Route path="orders" element={<OrderHistory />} />
                  <Route path="orders/:id" element={<OrderDetails />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="wishlist" element={<Navigate to="/wishlist" replace />} />
                </Route>

                {/* Wishlist route (accessible to regular users only) */}
                <Route path="/wishlist" element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <MainLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Wishlist />} />
                </Route>

                {/* Orders route (accessible to all authenticated users) */}
                <Route path="/orders" element={
                  <ProtectedRoute allowedRoles={['user', 'admin', 'employee']}>
                    <MainLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<OrderHistory />} />
                  <Route path=":id" element={<OrderDetails />} />
                </Route>

                {/* Notifications route (accessible to all authenticated users) */}
                <Route path="/notifications" element={
                  <ProtectedRoute allowedRoles={['user', 'admin', 'employee']}>
                    <MainLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Notifications />} />
                  <Route path="settings" element={<NotificationSettings />} />
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
                  <Route path="comments" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <CommentsManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="orders" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <OrdersAndSales />
                    </ProtectedRoute>
                  } />
                  <Route path="return-requests" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <ReturnRequests />
                    </ProtectedRoute>
                  } />
                  <Route path="services" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <ServiceRequests />
                    </ProtectedRoute>
                  } />
                  <Route path="employees" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Employees />
                    </ProtectedRoute>
                  } />
                  <Route path="settings" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Settings />
                    </ProtectedRoute>
                  } />
                </Route>

                {/* Redirect old routes */}
                <Route path="/admin/login" element={<Navigate to="/auth/login" replace />} />
                <Route path="/admin/register" element={<Navigate to="/auth/register" replace />} />
                <Route path="/cart" element={<Navigate to="/user/cart" replace />} />
                <Route path="/checkout" element={<Navigate to="/user/shipping" replace />} />
                <Route path="/profile" element={<Navigate to="/user/profile" replace />} />

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
                  </ErrorBoundary>
                </Router>
              </SettingsProvider>
            </CategoriesProvider>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
  );
};

export default App;