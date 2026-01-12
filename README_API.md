# SkyElectroTech API Documentation

Welcome to the comprehensive API documentation for the SkyElectroTech e-commerce platform. This documentation provides everything you need to integrate with our robust e-commerce API.

## 📚 Documentation Overview

### 🚀 [Quick Reference Guide](./API_QUICK_REFERENCE.md)
Essential information for developers to get started quickly:
- Base URLs and authentication
- Most commonly used endpoints
- Request/response example
- Error codes and rate limiting
- Development setup

### 📖 [Complete API Documentation](./API_DOCUMENTATION.md)
Comprehensive documentation covering:
- All API endpoints with detailed descriptions
- Request/response schemas
- Authentication methods
- Data models
- WebSocket events
- File upload specifications
- Payment integration details

### 🧪 [Postman Collection](./SkyElectroTech_API.postman_collection.json)
Ready-to-use Postman collection with:
- All API endpoints pre-configured
- Authentication handling
- Request examples
- Environment variables
- Test scripts for automatic token management

## 🏗️ Architecture Overview

SkyElectroTech is a modern e-commerce platform built with:

### Backend Stack
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens + Google OAuth
- **File Storage**: AWS S3
- **Payments**: Razorpay integration
- **Real-time**: Socket.IO for notifications
- **Security**: Helmet, CORS, Rate limiting

### Key Features
- **Multi-role System**: User, Employee, Admin roles
- **Product Management**: Categories, reviews, search
- **Order Processing**: Status tracking, returns, analytics
- **Shopping Experience**: Cart, wishlist, recommendations
- **Payment Processing**: Secure payment gateway integration
- **Real-time Updates**: WebSocket notifications
- **File Management**: Image uploads to cloud storage
- **Analytics**: Comprehensive reporting and insights

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v16+)
- MongoDB
- AWS S3 account (for file uploads)
- Razorpay account (for payments)

### 2. Installation
```bash
# Clone the repository
git clone <repository-url>
cd skyelectrotech/backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### 3. Environment Setup
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/skyelectrotech

# Authentication
JWT_SECRET=your-super-secret-jwt-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# File Storage
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket

# Payment Gateway
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-secret

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-email-password

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

## 🔐 Authentication

### JWT Token Authentication
Most endpoints require authentication via JWT token:

```bash
Authorization: Bearer <your-jwt-token>
```

### Google OAuth
For social login integration:

```bash
GET /api/auth/google
GET /api/auth/google/callback
```

### Role-Based Access Control
- **User**: Basic e-commerce operations
- **Employee**: Order management, customer support
- **Admin**: Full system access

## 📊 API Endpoints Summary

| Category | Endpoints | Description |
|----------|-----------|-------------|
| **Authentication** | 15+ endpoints | User registration, login, profile management |
| **Products** | 10+ endpoints | Product CRUD, search, reviews, categories |
| **Orders** | 12+ endpoints | Order creation, management, returns |
| **Cart & Wishlist** | 8+ endpoints | Shopping cart and wishlist management |
| **Payments** | 5+ endpoints | Payment processing and verification |
| **User Management** | 8+ endpoints | User CRUD, role management (Admin) |
| **Analytics** | 6+ endpoints | Dashboard, sales, product analytics |
| **File Upload** | 3+ endpoints | Image upload to AWS S3 |
| **Notifications** | 6+ endpoints | Real-time notifications |
| **Settings** | 2+ endpoints | Application configuration |

## 🔌 Real-time Features

### WebSocket Connection
```javascript
const socket = io('http://localhost:5000');
socket.emit('join-user', userId);
```

### Available Events
- `notification` - New notifications
- `order-update` - Order status changes
- `payment-success` - Payment confirmations

## 💳 Payment Integration

### Razorpay Flow
1. Create order on backend
2. Create Razorpay order
3. Process payment on frontend
4. Verify payment signature
5. Update order status

### Supported Features
- Multiple currencies
- Secure payment processing
- Webhook support
- Automatic verification

## 📁 File Upload

### Supported Formats
- **Images**: JPG, JPEG, PNG, GIF, WebP
- **Size Limit**: 5MB per file
- **Batch Upload**: Up to 5 files per request

### Upload Endpoints
- `POST /api/upload/image` - Single image
- `POST /api/upload/images` - Multiple images
- `POST /api/bulk-upload/products` - CSV bulk upload

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based auth
- **Role-Based Access**: Granular permissions
- **Rate Limiting**: 100 requests per 15 minutes
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Cross-origin request security
- **Helmet Security**: HTTP security headers
- **Password Hashing**: bcrypt encryption
- **File Validation**: Upload security checks

## 📈 Performance Features

- **Response Compression**: Automatic gzip compression
- **Caching**: Redis-like caching with node-cache
- **Database Indexing**: Optimized MongoDB queries
- **Pagination**: Efficient data pagination
- **Image Optimization**: Automatic image processing
- **CDN Integration**: AWS S3 for static assets

## 🧪 Testing

### Available Test Scripts
```bash
# Run all tests
npm test

# Test notifications
npm run test:notifications

# Test push notifications
npm run test:push-notifications
```

### Postman Testing
1. Import the provided Postman collection
2. Set up environment variables
3. Run the authentication flow
4. Test all endpoints with real data

## 📊 Monitoring & Logging

- **HTTP Logging**: Morgan request logging
- **Activity Logging**: Admin action tracking
- **Error Tracking**: Comprehensive error reporting
- **Performance Monitoring**: Response time tracking
- **Database Monitoring**: Connection health checks

## 🔄 API Versioning

Current version: **v1.0.0**

- All endpoints are prefixed with `/api/`
- Backward compatibility maintained
- Version-specific features documented

## 🆘 Support & Troubleshooting

### Common Issues
1. **Authentication Errors**: Check JWT token validity
2. **CORS Issues**: Verify allowed origins
3. **File Upload Failures**: Check file size and format
4. **Payment Errors**: Verify Razorpay credentials
5. **Database Connection**: Check MongoDB URI

### Getting Help
- Review error responses for specific details
- Check the full API documentation
- Use the Postman collection for testing
- Verify environment variables
- Check server logs for detailed errors

## 📝 Changelog

### Version 1.0.0 (January 2024)
- Initial API release
- Complete e-commerce functionality
- Multi-role authentication system
- Real-time notifications
- Payment integration
- File upload system
- Analytics and reporting

## 🤝 Contributing

To contribute to the API:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Update documentation
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Related Resources

- [Frontend Repository](../frontend/)
- [Database Schema](./models/)
- [Deployment Guide](./deployment/)
- [Security Guidelines](./security/)

---

**SkyElectroTech API Team**  
**Version**: 1.0.0  
**Last Updated**: January 2024

For questions or support, please refer to the documentation or contact the development team.
