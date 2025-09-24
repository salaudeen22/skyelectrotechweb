import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initializeAnalytics } from './utils/analytics';
import { io } from 'socket.io-client';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { CategoriesProvider } from './contexts/CategoriesContext';
import { SettingsProvider } from './contexts/SettingsContext';

// Layouts (keep these eager loaded)
import MainLayout from './Layouts/MainLayout';
import AdminLayout from './Layouts/AdminLayout';
import AuthLayout from './Layouts/AuthLayout';

// Components
import ProtectedRoute from './Components/ProtectedRoute';
import AnalyticsTracker from './Components/AnalyticsTracker';
import ErrorBoundary from './Components/ErrorBoundary';
import LoadingSpinner from './Components/LoadingSpinner';
import InstallPrompt from './Components/InstallPrompt';

// Lazy loaded components
const Home = React.lazy(() => import('./Page/Home'));
const About = React.lazy(() => import('./Page/About'));
const Contact = React.lazy(() => import('./Page/Contact'));
const FAQ = React.lazy(() => import('./Page/FAQ'));
const PrivacyPolicy = React.lazy(() => import('./Page/PrivacyPolicy'));
const TermsOfService = React.lazy(() => import('./Page/TermsOfService'));
const ShippingPolicy = React.lazy(() => import('./Page/ShippingPolicy'));
const CancellationRefunds = React.lazy(() => import('./Page/CancellationRefunds'));
const ProductList = React.lazy(() => import('./User/ProductList'));
const ProductDetails = React.lazy(() => import('./User/ProductDetails'));
const Cart = React.lazy(() => import('./User/Cart'));
const ShippingInfo = React.lazy(() => import('./User/ShippingInfo'));
const ShippingMethod = React.lazy(() => import('./User/ShippingMethod'));
const Payment = React.lazy(() => import('./User/Payment'));
const Checkout = React.lazy(() => import('./User/Checkout'));
const OrderHistory = React.lazy(() => import('./User/OrderHistory'));
const OrderDetails = React.lazy(() => import('./User/OrderDetails'));
const Profile = React.lazy(() => import('./User/Profile'));

// Auth Pages
const Login = React.lazy(() => import('./Auth/Login'));
const Register = React.lazy(() => import('./Auth/Register'));
const AuthCallback = React.lazy(() => import('./Auth/AuthCallback'));
const ForgotPassword = React.lazy(() => import('./Auth/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./Auth/ResetPassword'));
const ChangePassword = React.lazy(() => import('./Auth/ChangePassword'));

// User Pages
const Wishlist = React.lazy(() => import('./User/Wishlist'));
const Notifications = React.lazy(() => import('./User/Notifications'));
const NotificationSettings = React.lazy(() => import('./User/NotificationSettings'));

// Admin Pages
const AdminDashboard = React.lazy(() => import('./Admin/AdminDashboard'));
const ProductManagement = React.lazy(() => import('./Admin/ProductManagement'));
const CategoriesManagement = React.lazy(() => import('./Admin/CategoriesManagement'));
const CommentsManagement = React.lazy(() => import('./Admin/CommentsManagement'));
const Employees = React.lazy(() => import('./Admin/Employees'));
const Settings = React.lazy(() => import('./Admin/Settings'));
const OrdersAndSales = React.lazy(() => import('./Admin/OrderManagement'));
const ReturnRequests = React.lazy(() => import('./Admin/ReturnRequests'));
const ServiceRequests = React.lazy(() => import('./Admin/ServiceRequests'));
const CouponManagement = React.lazy(() => import('./Admin/CouponManagement'));

const NotFound = React.lazy(() => import('./Components/NotFound'));


// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000, // 30 seconds (reduced from 5 minutes for better cache invalidation)
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
       console.log('Socket.IO connected:');
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
          <WishlistProvider>
            <CategoriesProvider>
              <SettingsProvider>
              <Router>
                <ErrorBoundary>
                  <div className="App">
                    <AnalyticsTracker />
                    <InstallPrompt />
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
                    
                    <Suspense fallback={<LoadingSpinner />}>
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
                  <Route path="coupons" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <CouponManagement />
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
                    </Suspense>
            </div>
                  </ErrorBoundary>
                </Router>
                </SettingsProvider>
              </CategoriesProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
  );
};

export default App;