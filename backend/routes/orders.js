const express = require('express');
const { body } = require('express-validator');
const {
  createOrder,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  getAllOrders,
  getOrdersByEmployee,
  assignOrderToEmployee,
  cancelOrder
} = require('../controllers/orders');
const { auth, adminOnly, adminOrEmployee, userAccess } = require('../middleware/auth');
const validate = require('../middleware/validate');
const logActivity = require('../middleware/activityLogger');
const Order = require('../models/Order');
const Settings = require('../models/Settings');

const router = express.Router();

// Validation rules
const createOrderValidation = [
  body('orderItems')
    .isArray({ min: 1 })
    .withMessage('Order must have at least one item'),
  body('orderItems.*.product')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('orderItems.*.quantity')
    .isInt({ min: 1, max: 10 })
    .withMessage('Quantity must be between 1 and 10'),
  body('shippingInfo.name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .notEmpty()
    .withMessage('Name is required'),
  body('shippingInfo.email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .notEmpty()
    .withMessage('Email is required'),
  body('shippingInfo.phone')
    .custom((value) => {
      // Remove spaces, dashes, and parentheses for validation
      const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
      const phoneRegex = /^[+]?[1-9][\d]{9,15}$/;
      return phoneRegex.test(cleanPhone);
    })
    .withMessage('Please provide a valid phone number (10-15 digits, can include spaces, dashes, or country code)')
    .notEmpty()
    .withMessage('Phone number is required'),
  body('shippingInfo.address')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Address must be between 10 and 200 characters')
    .notEmpty()
    .withMessage('Address is required'),
  body('shippingInfo.city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters')
    .notEmpty()
    .withMessage('City is required'),
  body('shippingInfo.zipCode')
    .trim()
    .isLength({ min: 5, max: 10 })
    .withMessage('ZIP code must be between 5 and 10 characters')
    .notEmpty()
    .withMessage('ZIP code is required')
];

const updateOrderStatusValidation = [
  body('status')
    .isIn(['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'])
    .withMessage('Invalid order status'),
  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Note cannot exceed 500 characters'),
  body('trackingNumber')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Tracking number cannot exceed 50 characters')
];

// User routes
router.post('/', auth, userAccess, createOrderValidation, validate, createOrder);
router.get('/my-orders', auth, userAccess, getMyOrders);
router.get('/:id', auth, userAccess, getOrder);
router.put('/:id/cancel', auth, userAccess, cancelOrder);

// Employee routes (can view assigned orders and update status)
router.get('/employee/assigned', auth, adminOrEmployee, getOrdersByEmployee);

// Admin/Employee routes (can update order status)
router.put('/:id/status', 
  auth, 
  adminOrEmployee, 
  updateOrderStatusValidation, 
  validate, 
  updateOrderStatus
);

// Admin routes
router.get('/', auth, adminOnly, getAllOrders);
router.put('/:id/assign', auth, adminOnly, assignOrderToEmployee);

// Test route to check order data
router.get('/test-order/:id', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const { id } = req.params;
        const order = await Order.findById(id)
            .populate('user', 'name email phone')
            .populate('orderItems.product', 'name price image description');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({
            orderId: order._id,
            totalPrice: order.totalPrice,
            totalAmount: order.totalAmount,
            orderItems: order.orderItems,
            user: order.user
        });

    } catch (error) {
        console.error('Error in test order route:', error);
        res.status(500).json({ 
            message: 'Test failed',
            error: error.message
        });
    }
});

// Test route to check PDF generation
router.get('/test-pdf', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        // Generate simple test HTML
        const testHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Test PDF</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .content { margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Sky Electro Tech</h1>
                    <h2>Test PDF Generation</h2>
                </div>
                <div class="content">
                    <p>This is a test to verify PDF generation is working.</p>
                    <p>Generated on: ${new Date().toLocaleString('en-IN')}</p>
                    <p>If you can see this as a PDF, Puppeteer is working correctly!</p>
                </div>
            </body>
            </html>
        `;

        try {
            // Try to generate PDF
            const pdfBuffer = await generatePDF(testHTML);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="test.pdf"');
            res.send(pdfBuffer);
        } catch (pdfError) {
            console.error('PDF generation failed:', pdfError);
            // Fallback to HTML
            res.setHeader('Content-Type', 'text/html');
            res.send(testHTML);
        }

    } catch (error) {
        console.error('Error in test route:', error);
        res.status(500).json({ 
            message: 'Test failed',
            error: error.message
        });
    }
});

// Test route to check HTML generation
router.get('/test-invoice', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        // Generate simple test HTML
        const testHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Test Invoice</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .content { margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Sky Electro Tech</h1>
                    <h2>Test Invoice</h2>
                </div>
                <div class="content">
                    <p>This is a test invoice to verify HTML generation.</p>
                    <p>Generated on: ${new Date().toLocaleString('en-IN')}</p>
                </div>
            </body>
            </html>
        `;

        // For testing, return HTML instead of PDF
        res.setHeader('Content-Type', 'text/html');
        res.send(testHTML);

    } catch (error) {
        console.error('Error in test route:', error);
        res.status(500).json({ 
            message: 'Test failed',
            error: error.message
        });
    }
});

// Generate today's sales invoice PDF
router.get('/today-sales-invoice', auth, async (req, res) => {
    try {
        console.log('Today sales invoice endpoint called');
        
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        // Get today's date (start and end)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Fetch today's orders
        const orders = await Order.find({
            createdAt: {
                $gte: today,
                $lt: tomorrow
            }
        }).populate('user', 'name email phone')
          .populate('orderItems.product', 'name price image')
          .sort({ createdAt: 1 });

        console.log('Today\'s orders found:', orders.length);
        console.log('Sample order:', orders[0]);

        if (orders.length === 0) {
            return res.status(404).json({ message: 'No orders found for today' });
        }

        // Calculate summary
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || order.totalAmount || 0), 0);
        const totalOrders = orders.length;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        console.log('Total revenue calculated:', totalRevenue);
        console.log('Total orders:', totalOrders);
        console.log('Average order value:', avgOrderValue);

        // Get company settings
        const settings = await Settings.findOne().sort('-createdAt');
        console.log('Settings found:', settings ? 'Yes' : 'No');
        const companyInfo = settings?.storeInfo || {
            name: 'Sky Electro Tech',
            description: 'Electronics & Components Store',
            email: 'info@skyelectro.tech',
            phone: '+91 98765 43210',
            address: '123 Electronics Street, Mumbai, Maharashtra - 400001',
            gstin: '27AABCS1234Z1Z5'
        };
        console.log('Company info:', companyInfo);

        // Generate HTML content
        const htmlContent = generateInvoiceHTML({
            orders,
            totalRevenue,
            totalOrders,
            avgOrderValue,
            date: today.toLocaleDateString('en-IN'),
            companyInfo
        });

        try {
            // Generate PDF with proper invoice format
            const pdfBuffer = await generatePDF(htmlContent);

            // Set response headers
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="Today_Sales_Invoice_${today.toISOString().split('T')[0]}.pdf"`);
            
            res.send(pdfBuffer);
        } catch (pdfError) {
            console.error('PDF generation failed, falling back to HTML:', pdfError);
            console.error('PDF Error stack:', pdfError.stack);
            
            // Fallback to HTML
            res.setHeader('Content-Type', 'text/html');
            res.setHeader('Content-Disposition', `attachment; filename="Today_Sales_Invoice_${today.toISOString().split('T')[0]}.html"`);
            
            res.send(htmlContent);
        }

    } catch (error) {
        console.error('Error generating sales invoice:', error);
        console.error('Error stack:', error.stack);
        
        // Ensure we only send serializable error information
        const errorResponse = {
            message: 'Failed to generate sales invoice',
            error: error.message || 'Unknown error occurred'
        };
        
        // Only include stack trace in development
        if (process.env.NODE_ENV === 'development' && error.stack) {
            errorResponse.stack = error.stack;
        }
        
        res.status(500).json(errorResponse);
    }
});

// Generate individual order invoice PDF
router.get('/:id/invoice', auth, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Fetch the specific order
        const order = await Order.findById(id)
            .populate('user', 'name email phone')
            .populate('orderItems.product', 'name price image description');

        console.log('Order shipping info:', order.shippingInfo);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Debug: Log order data
        console.log('Order data for invoice generation:', {
            orderId: order._id,
            totalPrice: order.totalPrice,
            totalAmount: order.totalAmount,
            orderItems: order.orderItems,
            user: order.user
        });

        // Get company settings
        const settings = await Settings.findOne().sort('-createdAt');
        const companyInfo = settings?.storeInfo || {
            name: 'Sky Electro Tech',
            description: 'Electronics & Components Store',
            email: 'info@skyelectro.tech',
            phone: '+91 98765 43210',
            address: '123 Electronics Street, Mumbai, Maharashtra - 400001',
            gstin: '27AABCS1234Z1Z5'
        };

        // Generate HTML content for individual order
        const htmlContent = generateOrderInvoiceHTML(order, companyInfo);

        try {
            // Generate PDF with proper invoice format
            const pdfBuffer = await generatePDF(htmlContent);

            // Set response headers
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="Order_Invoice_${order._id.toString().slice(-8)}.pdf"`);
            
            res.send(pdfBuffer);
        } catch (pdfError) {
            console.error('PDF generation failed, falling back to HTML:', pdfError);
            
            // Fallback to HTML
            res.setHeader('Content-Type', 'text/html');
            res.setHeader('Content-Disposition', `attachment; filename="Order_Invoice_${order._id.toString().slice(-8)}.html"`);
            
            res.send(htmlContent);
        }

    } catch (error) {
        console.error('Error generating order invoice:', error);
        res.status(500).json({ message: 'Failed to generate order invoice' });
    }
});

// Helper function to generate individual order invoice HTML
function generateOrderInvoiceHTML(order, companyInfo) {
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN');
    const orderTime = new Date(order.createdAt).toLocaleTimeString('en-IN');
    
    // Calculate GST (assuming 18% GST)
    const gstRate = 0.18;
    const totalAmount = order.totalPrice || order.totalAmount || 0;
    const totalWithoutGST = totalAmount / (1 + gstRate);
    const totalGST = totalAmount - totalWithoutGST;
    
    console.log('Invoice calculations:', {
        totalAmount,
        totalWithoutGST,
        totalGST,
        orderItems: order.orderItems?.length || 0
    });
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Order Invoice - Sky Electro Tech</title>
            <style>
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    margin: 0; 
                    padding: 20px; 
                    background-color: #f8f9fa;
                }
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 30px; 
                    border-bottom: 3px solid #3B82F6; 
                    padding-bottom: 20px; 
                }
                .company-name { 
                    font-size: 28px; 
                    font-weight: bold; 
                    color: #1F2937; 
                    margin-bottom: 5px;
                }
                .company-tagline {
                    font-size: 14px;
                    color: #6B7280;
                    margin-bottom: 10px;
                }
                .invoice-title { 
                    font-size: 22px; 
                    color: #3B82F6; 
                    margin: 10px 0;
                    font-weight: 600;
                }
                .order-info {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                    margin-bottom: 30px;
                }
                .info-section {
                    background: #F9FAFB;
                    padding: 20px;
                    border-radius: 8px;
                    border-left: 4px solid #3B82F6;
                }
                .info-title {
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 10px;
                    font-size: 14px;
                }
                .info-content {
                    color: #1F2937;
                    font-size: 14px;
                }
                .order-id {
                    font-family: 'Courier New', monospace;
                    font-weight: bold;
                    color: #3B82F6;
                    font-size: 16px;
                }
                .items-table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin: 20px 0;
                    background: white;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .items-table th, .items-table td { 
                    border: 1px solid #E5E7EB; 
                    padding: 12px; 
                    text-align: left; 
                }
                .items-table th { 
                    background-color: #F3F4F6; 
                    font-weight: bold;
                    color: #374151;
                    font-size: 14px;
                }
                .items-table td {
                    font-size: 14px;
                    color: #374151;
                }
                .total-section {
                    background: #FEF3C7;
                    padding: 20px;
                    border-radius: 8px;
                    margin-top: 20px;
                }
                .total-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    font-size: 16px;
                }
                .total-final {
                    font-weight: bold;
                    font-size: 18px;
                    color: #92400E;
                    border-top: 2px solid #F59E0B;
                    padding-top: 10px;
                    margin-top: 10px;
                }
                .status-badge {
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 500;
                    text-transform: capitalize;
                    display: inline-block;
                }
                .status-delivered { background-color: #D1FAE5; color: #065F46; }
                .status-shipped { background-color: #DBEAFE; color: #1E40AF; }
                .status-processing { background-color: #EDE9FE; color: #5B21B6; }
                .status-pending { background-color: #FEF3C7; color: #92400E; }
                .status-cancelled { background-color: #FEE2E2; color: #991B1B; }
                .footer { 
                    margin-top: 30px; 
                    text-align: center; 
                    color: #6B7280; 
                    font-size: 12px;
                    border-top: 1px solid #E5E7EB;
                    padding-top: 20px;
                }
                .product-image {
                    width: 40px;
                    height: 40px;
                    object-fit: cover;
                    border-radius: 4px;
                }
                .company-details {
                    background: #F3F4F6;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    font-size: 12px;
                }
                .gst-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    font-size: 16px;
                    color: #0277BD;
                    font-weight: 500;
                }
                .qr-section {
                    text-align: center;
                    margin: 20px 0;
                    padding: 20px;
                    background: #F9FAFB;
                    border-radius: 8px;
                }
                .qr-code {
                    width: 100px;
                    height: 100px;
                    background: #E5E7EB;
                    margin: 0 auto 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    color: #6B7280;
                    border: 2px dashed #D1D5DB;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="company-name">${companyInfo.name}</div>
                    <div class="company-tagline">${companyInfo.description}</div>
                    <div class="invoice-title">Order Invoice</div>
                </div>
                
                <div class="company-details">
                    <strong>Company Details:</strong><br>
                    ${companyInfo.name}<br>
                    GSTIN: ${companyInfo.gstin}<br>
                    Address: ${companyInfo.address}<br>
                    Phone: ${companyInfo.phone} | Email: ${companyInfo.email}
                </div>
                
                <div class="order-info">
                    <div class="info-section">
                        <div class="info-title">Order Details</div>
                        <div class="info-content">
                            <div><strong>Order ID:</strong> <span class="order-id">#${order._id.toString().slice(-8)}</span></div>
                            <div><strong>Date:</strong> ${orderDate}</div>
                            <div><strong>Time:</strong> ${orderTime}</div>
                            <div><strong>Status:</strong> 
                                <span class="status-badge status-${order.orderStatus?.toLowerCase() || 'pending'}">
                                    ${order.orderStatus || 'Pending'}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="info-section">
                        <div class="info-title">Customer Information</div>
                        <div class="info-content">
                            <div><strong>Name:</strong> ${order.user?.name || 'Unknown'}</div>
                            <div><strong>Phone:</strong> ${order.user?.phone || 'N/A'}</div>
                        </div>
                    </div>
                    
                    <div class="info-section">
                        <div class="info-title">Delivery Address</div>
                        <div class="info-content">
                            <div><strong>Name:</strong> ${order.shippingInfo?.name || 'N/A'}</div>
                            <div><strong>Phone:</strong> ${order.shippingInfo?.phone || 'N/A'}</div>
                            <div><strong>Address:</strong> ${order.shippingInfo?.address || 'N/A'}</div>
                            <div><strong>City:</strong> ${order.shippingInfo?.city || 'N/A'}</div>
                            <div><strong>State:</strong> ${order.shippingInfo?.state || 'N/A'}</div>
                            <div><strong>Pincode:</strong> ${order.shippingInfo?.zipCode || 'N/A'}</div>
                        </div>
                    </div>
                </div>
                
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.orderItems?.map(item => `
                            <tr>
                                <td>
                                    <div style="display: flex; align-items: center;">
                                        <div style="width: 40px; height: 40px; background: #E5E7EB; border-radius: 4px; margin-right: 10px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #6B7280;">
                                            ${(item.name || item.product?.name || 'P').charAt(0)}
                                        </div>
                                        <div>
                                            <div style="font-weight: 500;">${item.name || item.product?.name || 'Unknown Product'}</div>
                                            <div style="font-size: 12px; color: #6B7280;">${item.product?.description || ''}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>₹${(item.price || 0).toLocaleString('en-IN')}</td>
                                <td>${item.quantity || 0}</td>
                                <td>₹${((item.price || 0) * (item.quantity || 0)).toLocaleString('en-IN')}</td>
                            </tr>
                        `).join('') || '<tr><td colspan="4" style="text-align: center;">No items found</td></tr>'}
                    </tbody>
                </table>
                
                <div class="total-section">
                    <div class="total-row">
                        <span>Subtotal (Before GST):</span>
                        <span>₹${totalWithoutGST.toLocaleString('en-IN', {maximumFractionDigits: 2})}</span>
                    </div>
                    <div class="gst-row">
                        <span>GST (18%):</span>
                        <span>₹${totalGST.toLocaleString('en-IN', {maximumFractionDigits: 2})}</span>
                    </div>
                    <div class="total-row">
                        <span>Shipping:</span>
                        <span>₹0.00</span>
                    </div>
                    <div class="total-row total-final">
                        <span>Total Amount (Including GST):</span>
                        <span>₹${totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                </div>
                
                <div class="qr-section">
                    <div class="qr-code">
                        QR Code<br>for Order<br>#${order._id.toString().slice(-8)}
                    </div>
                    <p><strong>Scan QR Code for Order Tracking</strong></p>
                    <p>Order ID: #${order._id.toString().slice(-8)}</p>
                </div>
                
                <div class="footer">
                    <p><strong>Generated on:</strong> ${new Date().toLocaleString('en-IN')}</p>
                    <p>${companyInfo.name} - Your Trusted Electronics Partner</p>
                    <p>This invoice is for shipping and parcel purposes.</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

// Helper function to generate HTML content for today's sales with GST and shipping details
function generateInvoiceHTML(data) {
    const { orders, totalRevenue, totalOrders, avgOrderValue, date, companyInfo } = data;
    
    // Calculate GST (assuming 18% GST)
    const gstRate = 0.18;
    const totalWithoutGST = totalRevenue / (1 + gstRate);
    const totalGST = totalRevenue - totalWithoutGST;
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Today's Sales Invoice - Sky Electro Tech</title>
            <style>
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    margin: 0; 
                    padding: 20px; 
                    background-color: #f8f9fa;
                }
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 30px; 
                    border-bottom: 3px solid #3B82F6; 
                    padding-bottom: 20px; 
                }
                .company-name { 
                    font-size: 28px; 
                    font-weight: bold; 
                    color: #1F2937; 
                    margin-bottom: 5px;
                }
                .company-tagline {
                    font-size: 14px;
                    color: #6B7280;
                    margin-bottom: 10px;
                }
                .invoice-title { 
                    font-size: 22px; 
                    color: #3B82F6; 
                    margin: 10px 0;
                    font-weight: 600;
                }
                .date-info {
                    font-size: 16px;
                    color: #374151;
                    font-weight: 500;
                }
                .company-details {
                    background: #F3F4F6;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    font-size: 12px;
                }
                .summary { 
                    margin-bottom: 30px; 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 20px;
                    border-radius: 10px;
                    color: white;
                }
                .summary-grid { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                    gap: 20px; 
                    margin-bottom: 20px; 
                }
                .summary-card { 
                    background: rgba(255, 255, 255, 0.1); 
                    padding: 20px; 
                    border-radius: 8px; 
                    text-align: center; 
                    backdrop-filter: blur(10px);
                }
                .summary-value { 
                    font-size: 28px; 
                    font-weight: bold; 
                    margin-bottom: 5px;
                }
                .summary-label { 
                    font-size: 14px; 
                    opacity: 0.9;
                }
                .orders-table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-top: 20px; 
                    background: white;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .orders-table th, .orders-table td { 
                    border: 1px solid #E5E7EB; 
                    padding: 12px; 
                    text-align: left; 
                }
                .orders-table th { 
                    background-color: #F3F4F6; 
                    font-weight: bold;
                    color: #374151;
                    font-size: 14px;
                }
                .orders-table td {
                    font-size: 14px;
                    color: #374151;
                }
                .total-row { 
                    background-color: #FEF3C7; 
                    font-weight: bold;
                    color: #92400E;
                }
                .gst-row {
                    background-color: #E0F2FE;
                    font-weight: 500;
                    color: #0277BD;
                }
                .status-badge {
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 500;
                    text-transform: capitalize;
                }
                .status-delivered { background-color: #D1FAE5; color: #065F46; }
                .status-shipped { background-color: #DBEAFE; color: #1E40AF; }
                .status-processing { background-color: #EDE9FE; color: #5B21B6; }
                .status-pending { background-color: #FEF3C7; color: #92400E; }
                .status-cancelled { background-color: #FEE2E2; color: #991B1B; }
                .footer { 
                    margin-top: 30px; 
                    text-align: center; 
                    color: #6B7280; 
                    font-size: 12px;
                    border-top: 1px solid #E5E7EB;
                    padding-top: 20px;
                }
                .order-id {
                    font-family: 'Courier New', monospace;
                    font-weight: bold;
                    color: #3B82F6;
                }
                .amount {
                    font-weight: 600;
                    color: #059669;
                }
                .customer-name {
                    font-weight: 500;
                    color: #1F2937;
                }
                .customer-address {
                    font-size: 12px;
                    color: #6B7280;
                }
                .customer-phone {
                    font-size: 12px;
                    color: #059669;
                    font-weight: 500;
                }
                .qr-section {
                    text-align: center;
                    margin: 20px 0;
                    padding: 20px;
                    background: #F9FAFB;
                    border-radius: 8px;
                }
                .qr-code {
                    width: 100px;
                    height: 100px;
                    background: #E5E7EB;
                    margin: 0 auto 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    color: #6B7280;
                    border: 2px dashed #D1D5DB;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="company-name">${companyInfo.name}</div>
                    <div class="company-tagline">${companyInfo.description}</div>
                    <div class="invoice-title">Today's Sales Invoice</div>
                    <div class="date-info">Date: ${date}</div>
                </div>
                
                <div class="company-details">
                    <strong>Company Details:</strong><br>
                    Sky Electro Tech<br>
                    GSTIN: 27AABCS1234Z1Z5<br>
                    Address: 123 Electronics Street, Mumbai, Maharashtra - 400001<br>
                    Phone: +91 98765 43210 | Email: info@skyelectro.tech
                </div>
                
                <div class="summary">
                    <div class="summary-grid">
                        <div class="summary-card">
                            <div class="summary-value">${totalOrders}</div>
                            <div class="summary-label">Total Orders</div>
                        </div>
                        <div class="summary-card">
                            <div class="summary-value">₹${totalRevenue.toLocaleString('en-IN')}</div>
                            <div class="summary-label">Total Revenue</div>
                        </div>
                        <div class="summary-card">
                            <div class="summary-value">₹${avgOrderValue.toLocaleString('en-IN', {maximumFractionDigits: 2})}</div>
                            <div class="summary-label">Average Order Value</div>
                        </div>
                    </div>
                </div>
                
                <table class="orders-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer Details</th>
                            <th>Phone</th>
                            <th>Items</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.map(order => `
                            <tr>
                                <td class="order-id">#${order._id.toString().slice(-8)}</td>
                                <td>
                                    <div class="customer-name">${order.shippingInfo?.name || order.user?.name || 'Unknown'}</div>
                                    <div class="customer-address">${order.shippingInfo?.city || 'N/A'}, ${order.shippingInfo?.state || 'N/A'}</div>
                                </td>
                                <td class="customer-phone">${order.shippingInfo?.phone || order.user?.phone || 'N/A'}</td>
                                <td>${order.orderItems?.length || 0} items</td>
                                <td class="amount">₹${(order.totalPrice || order.totalAmount || 0).toLocaleString('en-IN')}</td>
                                <td>
                                    <span class="status-badge status-${order.orderStatus?.toLowerCase() || 'pending'}">
                                        ${order.orderStatus || 'Pending'}
                                    </span>
                                </td>
                                <td>${new Date(order.createdAt).toLocaleTimeString('en-IN', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                })}</td>
                            </tr>
                        `).join('')}
                        <tr class="gst-row">
                            <td colspan="4"><strong>Subtotal (Before GST)</strong></td>
                            <td><strong>₹${totalWithoutGST.toLocaleString('en-IN', {maximumFractionDigits: 2})}</strong></td>
                            <td colspan="2"></td>
                        </tr>
                        <tr class="gst-row">
                            <td colspan="4"><strong>GST (18%)</strong></td>
                            <td><strong>₹${totalGST.toLocaleString('en-IN', {maximumFractionDigits: 2})}</strong></td>
                            <td colspan="2"></td>
                        </tr>
                        <tr class="total-row">
                            <td colspan="4"><strong>Total Revenue (Including GST)</strong></td>
                            <td><strong>₹${totalRevenue.toLocaleString('en-IN')}</strong></td>
                            <td colspan="2"></td>
                        </tr>
                    </tbody>
                </table>
                
                <div class="qr-section">
                    <div class="qr-code">
                        QR Code<br>for Shipping
                    </div>
                    <p><strong>Scan QR Code for Order Tracking</strong></p>
                    <p>Generated on: ${new Date().toLocaleString('en-IN')}</p>
                </div>
                
                <div class="footer">
                    <p><strong>Generated on:</strong> ${new Date().toLocaleString('en-IN')}</p>
                    <p>${companyInfo.name} - Your Trusted Electronics Partner</p>
                    <p>This invoice is for shipping and parcel purposes.</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

// Helper function to generate PDF with better error handling
async function generatePDF(htmlContent) {
    try {
        const puppeteer = require('puppeteer');
        
        console.log('Launching Puppeteer browser...');
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ],
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
        });
        
        console.log('Creating new page...');
        const page = await browser.newPage();
        
        console.log('Setting content...');
        await page.setContent(htmlContent, { 
            waitUntil: 'networkidle0',
            timeout: 30000 
        });
        
        console.log('Generating PDF...');
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            },
            timeout: 30000
        });
        
        console.log('Closing browser...');
        await browser.close();
        
        console.log('PDF generated successfully');
        return pdfBuffer;
    } catch (error) {
        console.error('PDF generation error:', error);
        console.error('Error stack:', error.stack);
        
        // Fallback: return HTML content as text
        console.log('Falling back to HTML response...');
        throw new Error(`PDF generation failed: ${error.message}. Please check server logs.`);
    }
}

module.exports = router;
