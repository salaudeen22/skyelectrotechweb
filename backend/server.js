const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const multer = require('multer');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // In development, allow all localhost origins
      if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
        return callback(null, true);
      }
      
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:5001',
        'http://51.20.12.36',
        'https://sweet-hamster-f11198.netlify.app',
        'https://6877b765d91a4d4ccae4b296--sweet-hamster-f11198.netlify.app',
        'https://skyelectrotech.in',
        'https://www.skyelectrotech.in',
        "http://skyelectrotech-files.s3-website.eu-north-1.amazonaws.com/",
        process.env.FRONTEND_URL
      ].filter(Boolean);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      } else {
        console.log('Socket.IO CORS blocked origin:', origin);
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join user to their personal room
  socket.on('join-user', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available globally
global.io = io;

// Initialize notification service with Socket.IO
const notificationService = require('./services/notificationService');
notificationService.setIO(io);

// Trust proxy for Render deployment
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  trustProxy: true // Trust the proxy headers
});
app.use('/api/', limiter);

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5001',
  'http://51.20.12.36',
  'https://sweet-hamster-f11198.netlify.app',
  'https://6877b765d91a4d4ccae4b296--sweet-hamster-f11198.netlify.app',
  'https://skyelectrotech.in',
  'https://www.skyelectrotech.in',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow all localhost origins
    if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session middleware (required for Passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'skyelectrotech-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport only if Google OAuth is configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const passport = require('./config/passport');
  app.use(passport.initialize());
  app.use(passport.session());
  console.log('Google OAuth configured successfully');
} else {
  console.log('Google OAuth not configured - missing CLIENT_ID or CLIENT_SECRET');
}

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Log environment info on startup
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Port:', process.env.PORT || 5000);
console.log('Frontend URL:', process.env.FRONTEND_URL);
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
console.log('Google Client ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
console.log('Google Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set');

// Database connection with retry/backoff (do not crash on initial failure)
const connectWithRetry = async (retries = 5, delayMs = 5000) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message || err);

    if (retries > 0) {
      const nextDelay = Math.min(delayMs * 2, 60000);
      console.log(`Retrying MongoDB connection in ${delayMs / 1000}s... (${retries} retries left)`);
      setTimeout(() => connectWithRetry(retries - 1, nextDelay), delayMs);
    } else {
      console.error('MongoDB connection failed after retries. Will continue running and retry periodically.');
      // Keep attempting in background every 60s
      setTimeout(() => connectWithRetry(5, 5000), 60000);
    }
  }
};

connectWithRetry();

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

// Start payment cron jobs if not in test environment
if (process.env.NODE_ENV !== 'test') {
  try {
    const { startPaymentCronJobs } = require('./scripts/paymentCron');
    startPaymentCronJobs();
    console.log('Payment cron jobs started');
  } catch (error) {
    console.log('Payment cron jobs not started:', error.message);
  }
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/bulk-upload', require('./routes/bulkUpload'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/services', require('./routes/services'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api', require('./routes/sitemap'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint for service health check
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'SkyElectroTech API Server',
    status: 'Online',
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('=== GLOBAL ERROR HANDLER ===');
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  console.error('URL:', req.originalUrl);
  console.error('Method:', req.method);
  console.error('User:', req.user?.name || 'Not authenticated');
  
  // Handle multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: 'File too large. Maximum size is 5MB.',
        error: err.message 
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        message: 'Too many files. Maximum 5 files allowed.',
        error: err.message 
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        message: 'Unexpected file field.',
        error: err.message 
      });
    }
    return res.status(400).json({ 
      message: 'File upload error.',
      error: err.message 
    });
  }
  
  // Handle other errors
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: err.message || 'Unknown error',
    path: req.originalUrl,
    method: req.method,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

const PORT = process.env.PORT || 5000;

// Handle uncaught exceptions (do not crash unless explicitly forced)
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  const shouldExit = process.env.FORCE_EXIT_ON_ERROR === 'true';
  if (shouldExit) {
    process.exit(1);
  } else {
    console.warn('Continuing process after uncaught exception. Set FORCE_EXIT_ON_ERROR=true to exit on errors.');
  }
});

// Handle unhandled promise rejections (do not crash unless explicitly forced)
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  const shouldExit = process.env.FORCE_EXIT_ON_ERROR === 'true';
  if (shouldExit) {
    process.exit(1);
  } else {
    console.warn('Continuing process after unhandled rejection. Set FORCE_EXIT_ON_ERROR=true to exit on errors.');
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
