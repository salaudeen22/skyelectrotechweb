const getPaymentTimeoutEmailTemplate = (data) => {
  const { userName, orderId, amount, currency, retryUrl } = data;
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Timeout - Action Required</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                background-color: #f8f9fa;
                padding: 20px;
                text-align: center;
                border-radius: 8px 8px 0 0;
            }
            .content {
                background-color: #ffffff;
                padding: 30px;
                border: 1px solid #e9ecef;
            }
            .footer {
                background-color: #f8f9fa;
                padding: 20px;
                text-align: center;
                border-radius: 0 0 8px 8px;
                font-size: 14px;
                color: #6c757d;
            }
            .button {
                display: inline-block;
                padding: 12px 24px;
                background-color: #007bff;
                color: #ffffff;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
            }
            .warning {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }
            .order-details {
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1 style="color: #dc3545; margin: 0;">Payment Timeout</h1>
            <p style="margin: 10px 0 0 0; color: #6c757d;">Action Required</p>
        </div>
        
        <div class="content">
            <h2>Hello ${userName},</h2>
            
            <div class="warning">
                <strong>⚠️ Important:</strong> Your payment session has expired and requires your attention.
            </div>
            
            <p>We noticed that your payment for the following order has timed out:</p>
            
            <div class="order-details">
                <strong>Order ID:</strong> ${orderId}<br>
                <strong>Amount:</strong> ${currency} ${amount}<br>
                <strong>Status:</strong> Payment Timeout
            </div>
            
            <p>Don't worry! You can still complete your payment by clicking the button below:</p>
            
            <div style="text-align: center;">
                <a href="${retryUrl}" class="button">Retry Payment</a>
            </div>
            
            <p><strong>What happened?</strong></p>
            <ul>
                <li>Your payment session expired after 30 minutes of inactivity</li>
                <li>This is a security measure to protect your payment information</li>
                <li>Your order is still pending and can be completed</li>
            </ul>
            
            <p><strong>Need help?</strong></p>
            <p>If you're experiencing any issues with the payment process, please don't hesitate to contact our support team. We're here to help!</p>
            
            <p>Best regards,<br>
            The SkyElectroTech Team</p>
        </div>
        
        <div class="footer">
            <p>This email was sent to you because your payment session timed out.</p>
            <p>If you didn't initiate this payment, please contact our support team immediately.</p>
            <p>&copy; 2024 SkyElectroTech. All rights reserved.</p>
        </div>
    </body>
    </html>
  `;
};

module.exports = { getPaymentTimeoutEmailTemplate };
