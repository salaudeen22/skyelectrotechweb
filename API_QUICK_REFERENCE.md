# SkyElectroTech API - Quick Reference Guide

## 🚀 Quick Start

### Base URL
```
Development: http://localhost:5000
Production: https://your-production-domain.com
```

### Authentication
```bash
# Include JWT token in headers
Authorization: Bearer <your-jwt-token>
```

## 📋 Essential Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/logout` | User logout | Yes |

### Products
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/products` | Get all products | No |
| GET | `/api/products/:id` | Get product details | No |
| GET | `/api/products/search` | Search products | No |
| POST | `/api/products` | Create product | Admin |
| PUT | `/api/products/:id` | Update product | Admin |
| DELETE | `/api/products/:id` | Delete product | Admin |

### Orders
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/orders` | Create order | User |
| GET | `/api/orders/my-orders` | Get user orders | User |
| GET | `/api/orders/:id` | Get order details | User |
| PUT | `/api/orders/:id/cancel` | Cancel order | User |
| GET | `/api/orders` | Get all orders | Admin/Employee |
| PUT | `/api/orders/:id/status` | Update order status | Admin/Employee |

### Cart
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/cart` | Get cart | User |
| POST | `/api/cart` | Add to cart | User |
| PUT | `/api/cart/:itemId` | Update cart item | User |
| DELETE | `/api/cart/:itemId` | Remove from cart | User |

## 🔑 Common Request Examples

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Products with Pagination
```bash
curl -X GET "http://localhost:5000/api/products?page=1&limit=10&category=category_id&search=electronics"
```

### Create Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

## 📊 Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "message": "Error description",
  "error": "Detailed error message",
  "path": "/api/endpoint",
  "method": "GET"
}
```

### Paginated Response
```json
{
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 🔐 Role-Based Access

| Role | Permissions |
|------|-------------|
| **User** | View products, manage cart/wishlist, place orders, view own orders |
| **Employee** | All user permissions + order management, customer support |
| **Admin** | Full system access, user management, analytics, settings |

## 📁 File Upload

### Upload Single Image
```bash
curl -X POST http://localhost:5000/api/upload/image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@/path/to/image.jpg"
```

### Upload Multiple Images
```bash
curl -X POST http://localhost:5000/api/upload/images \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

**Limits:**
- Max file size: 5MB
- Max files: 5 per request
- Supported formats: JPG, JPEG, PNG, GIF, WebP

## 💳 Payment Integration

### Create Razorpay Order
```bash
curl -X POST http://localhost:5000/api/payments/create-order \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 9999,
    "currency": "INR",
    "orderId": "order_id"
  }'
```

### Verify Payment
```bash
curl -X POST http://localhost:5000/api/payments/verify \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_order_id": "order_id",
    "razorpay_payment_id": "payment_id",
    "razorpay_signature": "signature"
  }'
```

## 🔌 WebSocket Events

### Connect and Join User Room
```javascript
const socket = io('http://localhost:5000');
socket.emit('join-user', userId);
```

### Listen for Notifications
```javascript
socket.on('notification', (data) => {
  console.log('New notification:', data);
});

socket.on('order-update', (data) => {
  console.log('Order updated:', data);
});
```

## 📈 Query Parameters

### Products
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `category` - Filter by category ID
- `search` - Search term
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `sort` - Sort field (price, name, createdAt)
- `order` - Sort order (asc, desc)

### Orders
- `page` - Page number
- `limit` - Items per page
- `status` - Filter by order status
- `dateFrom` - Filter from date
- `dateTo` - Filter to date

## 🚨 Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 429 | Rate Limited |
| 500 | Internal Server Error |

## ⚡ Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: Rate limit info in `RateLimit-*` headers

## 🔧 Environment Variables

```env
# Required
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skyelectrotech
JWT_SECRET=your-jwt-secret

# Optional
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=your-s3-bucket
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# Run tests
npm test

# Test notifications
npm run test:notifications
```

## 📚 Additional Resources

- [Full API Documentation](./API_DOCUMENTATION.md)
- [Postman Collection](./SkyElectroTech_API.postman_collection.json)
- [Frontend Repository](../frontend/)

## 🆘 Support

For API support and questions:
- Check the full documentation
- Review error responses for specific issues
- Ensure proper authentication headers
- Verify request body format and validation

---

**Version**: 1.0.0  
**Last Updated**: January 2024
