# SkyElectroTech API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Base URL](#base-url)
3. [Authentication](#authentication)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [API Endpoints](#api-endpoints)
7. [Data Models](#data-models)
8. [WebSocket Events](#websocket-events)
9. [File Upload](#file-upload)
10. [Payment Integration](#payment-integration)
11. [Development Setup](#development-setup)

## Overview

SkyElectroTech is a comprehensive e-commerce platform with role-based access control, featuring user management, product catalog, order processing, payment integration, and real-time notifications.

**Key Features:**
- Multi-role authentication (User, Employee, Admin)
- Google OAuth integration
- Product management with categories
- Shopping cart and wishlist
- Order processing with status tracking
- Razorpay payment integration
- Real-time notifications via WebSocket
- File upload to AWS S3
- Analytics and reporting
- Bulk operations

## Base URL

```
Development: http://localhost:5000
Production: https://your-production-domain.com
```

## Authentication

### JWT Token Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Google OAuth

For Google OAuth authentication:

```
GET /api/auth/google
GET /api/auth/google/callback
```

### Role-Based Access

- **User**: Basic e-commerce operations
- **Employee**: Order management, customer support
- **Admin**: Full system access

## Error Handling

### Standard Error Response Format

```json
{
  "message": "Error description",
  "error": "Detailed error message",
  "path": "/api/endpoint",
  "method": "GET"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Rate Limited
- `500` - Internal Server Error

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: Rate limit info in `RateLimit-*` headers

## API Endpoints

### Health Check

#### GET /api/health
Check server status.

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Authentication Endpoints

#### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "jwt_token"
}
```

#### POST /api/auth/login
User login.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### POST /api/auth/logout
User logout (requires authentication).

#### GET /api/auth/me
Get current user profile (requires authentication).

#### PUT /api/auth/profile
Update user profile (requires authentication + OTP).

**Request Body:**
```json
{
  "otp": "123456",
  "name": "John Doe",
  "phone": "+1234567890"
}
```

#### POST /api/auth/request-otp
Request OTP for profile update.

#### POST /api/auth/address
Add new address (requires authentication).

**Request Body:**
```json
{
  "name": "Home",
  "street": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA",
  "isDefault": true
}
```

#### PUT /api/auth/address/:id
Update address (requires authentication).

#### DELETE /api/auth/address/:id
Delete address (requires authentication).

#### GET /api/auth/addresses
Get user addresses (requires authentication).

#### POST /api/auth/change-password
Change password (requires authentication).

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

#### POST /api/auth/forgot-password
Request password reset.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

#### POST /api/auth/reset-password
Reset password with token.

**Request Body:**
```json
{
  "token": "reset_token",
  "password": "newpassword"
}
```

### Product Endpoints

#### GET /api/products
Get all products with pagination and filtering.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `category` - Category ID filter
- `search` - Search term
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `sort` - Sort field (price, name, createdAt)
- `order` - Sort order (asc, desc)

**Response:**
```json
{
  "products": [
    {
      "_id": "product_id",
      "name": "Product Name",
      "description": "Product description",
      "price": 99.99,
      "category": {
        "_id": "category_id",
        "name": "Electronics"
      },
      "images": ["image_urls"],
      "stock": 50,
      "rating": 4.5,
      "reviews": 25
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### GET /api/products/featured
Get featured products.

#### GET /api/products/search
Search products.

#### GET /api/products/category/:categoryId
Get products by category.

#### GET /api/products/:id
Get single product details.

#### POST /api/products/:id/reviews
Add product review (requires authentication).

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Great product!"
}
```

#### DELETE /api/products/:id/reviews/:reviewId
Delete product review (requires authentication).

#### POST /api/products
Create new product (Admin only).

**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "category": "category_id",
  "sku": "PROD001",
  "stock": 50,
  "images": ["image_urls"]
}
```

#### PUT /api/products/:id
Update product (Admin only).

#### DELETE /api/products/:id
Delete product (Admin only).

### Category Endpoints

#### GET /api/categories
Get all categories.

#### GET /api/categories/:id
Get category details.

#### POST /api/categories
Create category (Admin only).

**Request Body:**
```json
{
  "name": "Electronics",
  "description": "Electronic products",
  "image": "category_image_url"
}
```

#### PUT /api/categories/:id
Update category (Admin only).

#### DELETE /api/categories/:id
Delete category (Admin only).

### Order Endpoints

#### POST /api/orders
Create new order (requires authentication).

**Request Body:**
```json
{
  "orderItems": [
    {
      "product": "product_id",
      "quantity": 2
    }
  ],
  "shippingInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "razorpay"
}
```

#### GET /api/orders/my-orders
Get user's orders (requires authentication).

#### GET /api/orders/:id
Get order details (requires authentication).

#### PUT /api/orders/:id/cancel
Cancel order (requires authentication).

#### GET /api/orders
Get all orders (Admin/Employee only).

#### PUT /api/orders/:id/status
Update order status (Admin/Employee only).

**Request Body:**
```json
{
  "status": "shipped",
  "trackingNumber": "TRACK123",
  "note": "Order shipped via express delivery"
}
```

#### POST /api/orders/:id/return
Request order return (requires authentication).

**Request Body:**
```json
{
  "reason": "Defective product",
  "description": "Product arrived damaged"
}
```

### Cart Endpoints

#### GET /api/cart
Get user's cart (requires authentication).

#### POST /api/cart
Add item to cart (requires authentication).

**Request Body:**
```json
{
  "product": "product_id",
  "quantity": 2
}
```

#### PUT /api/cart/:itemId
Update cart item quantity (requires authentication).

**Request Body:**
```json
{
  "quantity": 3
}
```

#### DELETE /api/cart/:itemId
Remove item from cart (requires authentication).

#### DELETE /api/cart
Clear cart (requires authentication).

### Wishlist Endpoints

#### GET /api/wishlist
Get user's wishlist (requires authentication).

#### POST /api/wishlist
Add product to wishlist (requires authentication).

**Request Body:**
```json
{
  "product": "product_id"
}
```

#### DELETE /api/wishlist/:productId
Remove product from wishlist (requires authentication).

### Payment Endpoints

#### POST /api/payments/create-order
Create Razorpay order (requires authentication).

**Request Body:**
```json
{
  "amount": 9999,
  "currency": "INR",
  "orderId": "order_id"
}
```

#### POST /api/payments/verify
Verify payment signature (requires authentication).

**Request Body:**
```json
{
  "razorpay_order_id": "order_id",
  "razorpay_payment_id": "payment_id",
  "razorpay_signature": "signature"
}
```

#### GET /api/payments/history
Get payment history (requires authentication).

### User Management Endpoints

#### GET /api/users
Get all users (Admin only).

#### GET /api/users/:id
Get user details (Admin only).

#### PUT /api/users/:id
Update user (Admin only).

#### DELETE /api/users/:id
Delete user (Admin only).

#### POST /api/users/:id/role
Change user role (Admin only).

**Request Body:**
```json
{
  "role": "employee"
}
```

### Analytics Endpoints

#### GET /api/analytics/dashboard
Get dashboard analytics (Admin only).

#### GET /api/analytics/sales
Get sales analytics (Admin only).

#### GET /api/analytics/products
Get product analytics (Admin only).

#### GET /api/analytics/users
Get user analytics (Admin only).

### Upload Endpoints

#### POST /api/upload/image
Upload single image (requires authentication).

**Form Data:**
- `image` - Image file (max 5MB)

#### POST /api/upload/images
Upload multiple images (requires authentication).

**Form Data:**
- `images` - Image files (max 5 files, 5MB each)

### Bulk Upload Endpoints

#### POST /api/bulk-upload/products
Bulk upload products via CSV (Admin only).

**Form Data:**
- `file` - CSV file with product data

### Settings Endpoints

#### GET /api/settings
Get application settings.

#### PUT /api/settings
Update settings (Admin only).

### Comments Endpoints

#### GET /api/comments/:productId
Get product comments.

#### POST /api/comments/:productId
Add comment (requires authentication).

**Request Body:**
```json
{
  "content": "Great product!"
}
```

#### PUT /api/comments/:id
Update comment (requires authentication).

#### DELETE /api/comments/:id
Delete comment (requires authentication).

### Service Request Endpoints

#### POST /api/services/request
Create service request (requires authentication).

**Request Body:**
```json
{
  "type": "repair",
  "description": "Need repair service",
  "product": "product_id"
}
```

#### GET /api/services/requests
Get service requests (Admin/Employee only).

#### PUT /api/services/requests/:id
Update service request status (Admin/Employee only).

### Notification Endpoints

#### GET /api/notifications
Get user notifications (requires authentication).

#### PUT /api/notifications/:id/read
Mark notification as read (requires authentication).

#### DELETE /api/notifications/:id
Delete notification (requires authentication).

#### POST /api/notifications/subscribe
Subscribe to push notifications (requires authentication).

**Request Body:**
```json
{
  "endpoint": "push_endpoint",
  "keys": {
    "p256dh": "p256dh_key",
    "auth": "auth_key"
  }
}
```

### Recommendations Endpoints

#### GET /api/recommendations
Get personalized product recommendations (requires authentication).

## Data Models

### User Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  role: String (user|employee|admin),
  phone: String,
  addresses: [Address],
  avatar: String,
  googleId: String,
  isEmailVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Product Model
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  category: ObjectId (ref: Category),
  images: [String],
  stock: Number,
  sku: String,
  rating: Number,
  reviews: [Review],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Model
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  orderItems: [OrderItem],
  shippingInfo: ShippingInfo,
  paymentInfo: PaymentInfo,
  status: String,
  totalAmount: Number,
  assignedEmployee: ObjectId (ref: User),
  trackingNumber: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Category Model
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  image: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## WebSocket Events

### Connection
```javascript
// Join user room
socket.emit('join-user', userId);
```

### Notification Events
```javascript
// Receive notification
socket.on('notification', (data) => {
  console.log('New notification:', data);
});

// Order status update
socket.on('order-update', (data) => {
  console.log('Order updated:', data);
});
```

## File Upload

### Supported Formats
- Images: JPG, JPEG, PNG, GIF, WebP
- Maximum size: 5MB per file
- Maximum files: 5 per request

### Upload to AWS S3
Files are automatically uploaded to AWS S3 and URLs are returned.

## Payment Integration

### Razorpay Integration
- Supports multiple currencies
- Secure payment processing
- Webhook support for payment status updates
- Automatic order creation and verification

### Payment Flow
1. Create order on backend
2. Create Razorpay order
3. Process payment on frontend
4. Verify payment signature
5. Update order status

## Development Setup

### Prerequisites
- Node.js (v16+)
- MongoDB
- AWS S3 account
- Razorpay account

### Environment Variables
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/skyelectrotech

# JWT
JWT_SECRET=your-jwt-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AWS S3
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket

# Razorpay
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-email-password

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Session
SESSION_SECRET=your-session-secret
```

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

### Testing
```bash
# Run tests
npm test

# Test notifications
npm run test:notifications
```

## Security Features

- JWT-based authentication
- Role-based access control
- Rate limiting
- Input validation
- CORS protection
- Helmet security headers
- Password hashing with bcrypt
- File upload validation
- SQL injection protection (MongoDB)
- XSS protection

## Performance Features

- Response compression
- Caching with node-cache
- Database indexing
- Pagination
- Image optimization
- CDN integration (AWS S3)

## Monitoring and Logging

- Morgan HTTP request logging
- Activity logging for admin actions
- Error tracking and reporting
- Performance monitoring
- Database connection monitoring

---

**Version**: 1.0.0  
**Last Updated**: January 2024  
**Contact**: SkyElectroTech Development Team
