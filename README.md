# SkyElectroTech E-commerce Platform

A full-stack e-commerce platform built with React, Node.js, Express, and MongoDB.

## Features

- **User Management**: Registration, login, profile management
- **Product Management**: CRUD operations for products with categories
- **Shopping Cart**: Add/remove items, quantity management
- **Wishlist**: Save favorite products
- **Order Management**: Complete order lifecycle
- **Payment Integration**: Razorpay payment gateway
- **Comment System**: Product reviews and ratings
- **Admin Dashboard**: Comprehensive admin panel
- **Analytics**: Sales and user analytics
- **Bulk Operations**: Import/export products via CSV

## Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- React Hot Toast

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Passport.js (Google OAuth)
- Multer (File uploads)
- Nodemailer (Email notifications)

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd skyelectrotech
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Environment Setup**

   Create a `.env` file in the `backend` directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/skyelectrotech
   
   # JWT
   JWT_SECRET=your-jwt-secret-key
   
   # Server
   PORT=5000
   NODE_ENV=development
   
   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   CLIENT_URL=http://localhost:3000
   
   # Session
   SESSION_SECRET=your-session-secret
   
   # Optional: Email
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM_NAME=SkyElectroTech
   
   # Optional: Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   
   # Optional: Razorpay
   RAZORPAY_KEY_ID=your-razorpay-key-id
   RAZORPAY_KEY_SECRET=your-razorpay-key-secret
   
   # Optional: Cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas (update MONGODB_URI in .env)
   ```

## Running the Application

### Development Mode
```bash
# Start both frontend and backend in development mode
npm run dev

# Or start them separately
npm run dev:backend  # Backend on http://localhost:5000
npm run dev:frontend # Frontend on http://localhost:3000
```

### Production Mode
```bash
# Build frontend
npm run build

# Start production servers
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Comments
- `GET /api/comments` - Get all comments (Admin)
- `GET /api/comments/stats` - Get comment statistics (Admin)
- `PUT /api/comments/:id/status` - Update comment status (Admin)
- `DELETE /api/comments/:id` - Delete comment (Admin)

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details

## Admin Access

To create an admin user, run the script:
```bash
cd backend
node scripts/createAdmin.js
```

## Troubleshooting

### Common Issues

1. **"Unexpected token '<'" Error**
   - This usually means the backend server is not running
   - Ensure MongoDB is running
   - Check that the backend server is started on port 5000

2. **CORS Errors**
   - The proxy configuration in `vite.config.js` should handle this
   - Ensure the backend CORS settings include `http://localhost:3000`

3. **Database Connection Issues**
   - Verify MongoDB is running
   - Check the `MONGODB_URI` in your `.env` file
   - For MongoDB Atlas, ensure your IP is whitelisted

4. **Port Already in Use**
   - Kill processes using ports 3000 or 5000
   - Or change the ports in the configuration files

## Project Structure

```
skyelectrotech/
├── backend/
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Custom middleware
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API routes
│   ├── utils/          # Utility functions
│   └── server.js       # Main server file
├── frontend/
│   ├── src/
│   │   ├── Admin/      # Admin components
│   │   ├── Auth/       # Authentication components
│   │   ├── Components/ # Reusable components
│   │   ├── contexts/   # React contexts
│   │   ├── services/   # API services
│   │   └── User/       # User components
│   └── vite.config.js  # Vite configuration
└── package.json        # Root package.json
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details 