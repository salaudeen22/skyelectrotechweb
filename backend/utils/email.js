const nodemailer = require('nodemailer');

// --- NO CHANGES TO THIS SECTION ---
// This transporter and sending logic is solid.
const createTransporter = () => {
  if (!process.env.EMAIL_SERVICE && !process.env.SMTP_HOST) {
    throw new Error('Email configuration is missing. Please set EMAIL_SERVICE or SMTP_HOST in environment variables.');
  }
  let transportConfig;
  if (process.env.EMAIL_SERVICE) {
    transportConfig = {
      service: process.env.EMAIL_SERVICE,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    };
  } else {
    transportConfig = {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    };
  }
  return nodemailer.createTransport(transportConfig);
};

const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'SkyElectroTech'} <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};
// --- END OF UNCHANGED SECTION ---


// -------------------------------------------------------------------
// START OF REDESIGNED EMAIL TEMPLATES
// -------------------------------------------------------------------

// REDESIGNED Welcome email template
const getWelcomeEmailTemplate = (userName) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  return {
    subject: 'Welcome to SkyElectroTech!',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
        <title>Welcome to SkyElectroTech</title>
        <style>
          :root {
            --primary-color: #4f46e5;
            --background-color: #f4f7f9;
            --text-color: #334155;
            --card-background: #ffffff;
            --footer-text: #94a3b8;
          }
          body {
            font-family: 'Poppins', Arial, sans-serif;
            line-height: 1.6;
            color: var(--text-color);
            background-color: var(--background-color);
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: var(--card-background);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
          }
          .header {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
          }
          .logo {
            max-width: 150px;
            margin-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .content {
            padding: 30px;
          }
          .content h2 {
            font-size: 22px;
            color: #1e293b;
            margin-bottom: 15px;
          }
          .features {
            margin: 25px 0;
            padding: 0;
            list-style: none;
          }
          .feature-item {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e2e8f0;
          }
          .feature-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
          }
          .feature-item svg {
            width: 24px;
            height: 24px;
            margin-right: 15px;
            flex-shrink: 0;
            color: var(--primary-color);
          }
          .cta-button {
            display: inline-block;
            background-color: var(--primary-color);
            color: #ffffff;
            padding: 14px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            transition: background-color 0.2s;
          }
          .cta-button:hover {
            background-color: #4338ca;
          }
          .footer {
            text-align: center;
            padding: 25px;
            font-size: 14px;
            color: var(--footer-text);
          }
          /* Dark Mode Styles */
          @media (prefers-color-scheme: dark) {
            :root {
              --background-color: #111827;
              --text-color: #d1d5db;
              --card-background: #1f2937;
              --footer-text: #6b7280;
            }
            .content h2 { color: #f9fafb; }
            .feature-item { border-bottom-color: #374151; }
            .cta-button { color: #ffffff !important; } /* Important to override link color */
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://i.postimg.cc/brZN4ngb/Sky-Logo-Only.png" alt="SkyElectroTech Logo" class="logo">
            <h1>Welcome Aboard, ${userName}!</h1>
          </div>
          <div class="content">
            <h2>Your journey into electronics starts now.</h2>
            <p>Thank you for joining SkyElectroTech! We're thrilled to have you in our community. Here's a glimpse of what you can do with your new account:</p>
            <ul class="features">
              <li class="feature-item">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                <span><strong>Browse & Shop:</strong> Discover our vast catalog of top-tier electronics.</span>
              </li>
              <li class="feature-item">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span><strong>Secure Checkout:</strong> Experience seamless and safe payments.</span>
              </li>
              <li class="feature-item">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <span><strong>Track Your Orders:</strong> Follow your package from our warehouse to your door.</span>
              </li>
            </ul>
            <p>Ready to get started? Explore our latest products now.</p>
            <a href="${clientUrl}/products" class="cta-button">Start Shopping</a>
            <p>If you have any questions, feel free to contact our support team. We're here to help!</p>
          </div>
        </div>
        <div class="footer">
          <p>You received this email because you signed up at SkyElectroTech.</p>
          <p>© ${new Date().getFullYear()} SkyElectroTech. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
    text: `
      Welcome to SkyElectroTech, ${userName}!

      Thank you for joining our community. With your new account, you can shop our electronics catalog, enjoy secure checkout, and track your orders.

      Start shopping now: ${clientUrl}/products

      Happy exploring!
      The SkyElectroTech Team
    `
  };
};

// REDESIGNED Forgot password email template
const getForgotPasswordEmailTemplate = (userName, resetUrl) => {
  return {
    subject: 'Reset Your SkyElectroTech Password',
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
        <title>Reset Your Password</title>
        <style>
          :root {
            --primary-color: #f59e0b; /* Amber for warning */
            --background-color: #f4f7f9;
            --text-color: #334155;
            --card-background: #ffffff;
            --footer-text: #94a3b8;
          }
          body {
            font-family: 'Poppins', Arial, sans-serif;
            line-height: 1.6;
            color: var(--text-color);
            background-color: var(--background-color);
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: var(--card-background);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
          }
          .header {
            background-color: #1f2937;
            color: white;
            padding: 40px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .content {
            padding: 30px;
          }
          .notice-box {
            display: flex;
            align-items: flex-start;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid var(--primary-color);
            background-color: #fefce8;
          }
          .notice-box svg {
            width: 24px;
            height: 24px;
            margin-right: 15px;
            flex-shrink: 0;
            color: var(--primary-color);
          }
          .reset-button {
            display: inline-block;
            background-color: var(--primary-color);
            color: #ffffff;
            padding: 14px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px auto;
            text-align: center;
            transition: background-color 0.2s;
          }
          .reset-button:hover {
            background-color: #d97706;
          }
          .link-box {
            background-color: #f1f5f9;
            padding: 15px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            word-break: break-all;
            text-align: center;
            font-size: 14px;
            margin-top: 15px;
          }
          .footer {
            text-align: center;
            padding: 25px;
            font-size: 14px;
            color: var(--footer-text);
          }
          /* Dark Mode Styles */
          @media (prefers-color-scheme: dark) {
            :root {
              --background-color: #111827;
              --text-color: #d1d5db;
              --card-background: #1f2937;
              --footer-text: #6b7280;
            }
            .notice-box {
              background-color: #2c271a;
              border-left-color: #f59e0b;
            }
            .link-box { background-color: #374151; }
            .reset-button { color: #ffffff !important; }
          }
        </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p><strong>Hi ${userName},</strong></p>
          <p>We received a request to reset the password for your SkyElectroTech account. If you did not make this request, you can safely ignore this email.</p>
          
          <div class="notice-box">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <div>
              <strong>This link is time-sensitive.</strong><br>
              For your security, it will expire in 10 minutes.
            </div>
          </div>
          
          <p>Click the button below to set a new password:</p>
          <a href="${resetUrl}" class="reset-button">Reset My Password</a>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <div class="link-box">${resetUrl}</div>
          
          <p>Thank you,<br>The SkyElectroTech Security Team</p>
        </div>
      </div>
      <div class="footer">
        <p>If you didn't request a password reset, please contact our support team immediately.</p>
        <p>© ${new Date().getFullYear()} SkyElectroTech. All rights reserved.</p>
      </div>
    </body>
    </html>
    `,
    text: `
      SkyElectroTech - Password Reset Request

      Hi ${userName},

      We received a request to reset your password. If this wasn't you, please ignore this email.

      To reset your password, visit this link (it expires in 10 minutes):
      ${resetUrl}

      If you have any issues, please contact our support team.

      The SkyElectroTech Security Team
    `
  };
};

// Email template for OTP verification
const getOTPEmailTemplate = (userName, otpCode, purpose = 'profile update') => {
  const purposeText = {
    'profile_update': 'verify your profile update',
    'phone_verification': 'verify your phone number',
    'email_verification': 'verify your email address'
  };

  return {
    subject: `OTP Verification - SkyElectroTech`,
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
        <title>OTP Verification</title>
        <style>
          :root {
            --primary-color: #3b82f6;
            --background-color: #f4f7f9;
            --text-color: #334155;
            --card-background: #ffffff;
            --footer-text: #94a3b8;
          }
          body {
            font-family: 'Poppins', Arial, sans-serif;
            line-height: 1.6;
            color: var(--text-color);
            background-color: var(--background-color);
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: var(--card-background);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
          }
          .header {
            background-color: #1f2937;
            color: white;
            padding: 40px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .content {
            padding: 30px;
          }
          .otp-box {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 12px;
            margin: 20px 0;
          }
          .otp-code {
            font-size: 36px;
            font-weight: 700;
            letter-spacing: 8px;
            margin: 15px 0;
            padding: 20px;
            background: rgba(255,255,255,0.2);
            border-radius: 8px;
            display: inline-block;
          }
          .notice {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
          }
          .footer {
            background-color: #f8fafc;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>SkyElectroTech</h1>
                <p>OTP Verification</p>
            </div>
            <div class="content">
                <h2>Hello ${userName}!</h2>
                <p>We received a request to ${purposeText[purpose] || purpose}. Please use the OTP code below to complete the verification:</p>
                
                <div class="otp-box">
                    <p style="margin: 0; font-size: 18px;">Your OTP Code:</p>
                    <div class="otp-code">${otpCode}</div>
                    <p style="margin: 0; font-size: 14px; opacity: 0.9;">This code expires in 10 minutes</p>
                </div>

                <div class="notice">
                    <strong>Security Notice:</strong> Never share this OTP with anyone. Our team will never ask for your OTP via email or phone.
                </div>

                <p>If you didn't request this verification, please ignore this email or contact our support team.</p>
            </div>
            <div class="footer">
                <p style="color: var(--footer-text); margin: 0;">
                    © 2024 SkyElectroTech. All rights reserved.<br>
                    This is an automated message, please do not reply.
                </p>
            </div>
        </div>
    </body>
    </html>
    `,
    text: `
    Hello ${userName}!

    We received a request to ${purposeText[purpose] || purpose}.

    Your OTP Code: ${otpCode}

    This code expires in 10 minutes.

    Security Notice: Never share this OTP with anyone. Our team will never ask for your OTP via email or phone.

    If you didn't request this verification, please ignore this email or contact our support team.

    © 2024 SkyElectroTech. All rights reserved.
    `
  };
};


// Send welcome email
const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const emailTemplate = getWelcomeEmailTemplate(userName);
    await sendEmail({
      to: userEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });
    console.log(`Welcome email sent to ${userEmail}`);
  } catch (error) {
    console.error(`Failed to send welcome email to ${userEmail}:`, error);
    // Don't re-throw, as a failed welcome email shouldn't block user registration.
  }
};

// Send OTP verification email
const sendOTPEmail = async (userEmail, userName, otpCode, purpose = 'profile update') => {
  try {
    const emailTemplate = getOTPEmailTemplate(userName, otpCode, purpose);
    
    await sendEmail({
      to: userEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });
    console.log(`OTP email sent to ${userEmail}`);
  } catch (error) {
    console.error(`Failed to send OTP email to ${userEmail}:`, error);
    throw error;
  }
};

// Send forgot password email
const sendForgotPasswordEmail = async (userEmail, userName, resetToken) => {
  try {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const resetUrl = `${clientUrl}/auth/reset-password?token=${resetToken}`;
    // Pass resetUrl directly, as the template now handles token display
    const emailTemplate = getForgotPasswordEmailTemplate(userName, resetUrl);
    
    await sendEmail({
      to: userEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });
    console.log(`Password reset email sent to ${userEmail}`);
  } catch (error) {
    console.error(`Failed to send password reset email to ${userEmail}:`, error);
    throw error; // Re-throw to be handled by the controller
  }
};



// Order confirmation email template for customer
const getOrderConfirmationEmailTemplate = (order, user) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const orderId = order._id.toString().slice(-6).toUpperCase();
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN');
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#f59e0b',
      'confirmed': '#3b82f6',
      'packed': '#6366f1',
      'shipped': '#10b981',
      'cancelled': '#ef4444',
      'returned': '#f97316'
    };
    return colors[status] || '#6b7280';
  };

  return {
    subject: `Order Confirmation #${orderId} - SkyElectroTech`,
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
        <title>Order Confirmation</title>
        <style>
          :root {
            --primary-color: #10b981;
            --background-color: #f4f7f9;
            --text-color: #334155;
            --card-background: #ffffff;
            --footer-text: #94a3b8;
          }
          body {
            font-family: 'Poppins', Arial, sans-serif;
            line-height: 1.6;
            color: var(--text-color);
            background-color: var(--background-color);
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 700px;
            margin: 0 auto;
            background-color: var(--card-background);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
          }
          .logo {
            max-width: 120px;
            margin-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .content {
            padding: 30px;
          }
          .order-summary {
            background: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .order-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
          }
          .detail-item {
            padding: 15px;
            background: #f1f5f9;
            border-radius: 8px;
          }
          .detail-item strong {
            display: block;
            color: #1e293b;
            margin-bottom: 5px;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .items-table th,
          .items-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
          }
          .items-table th {
            background: #f8fafc;
            font-weight: 600;
            color: #1e293b;
          }
          .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            color: white;
          }
          .total-section {
            background: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
          }
          .total-row.final {
            font-weight: 700;
            font-size: 18px;
            border-top: 2px solid #e2e8f0;
            padding-top: 12px;
            margin-top: 12px;
          }
          .cta-button {
            display: inline-block;
            background-color: var(--primary-color);
            color: #ffffff;
            padding: 14px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            transition: background-color 0.2s;
          }
          .cta-button:hover {
            background-color: #059669;
          }
          .footer {
            text-align: center;
            padding: 25px;
            font-size: 14px;
            color: var(--footer-text);
            background: #f8fafc;
          }
          @media (max-width: 600px) {
            .order-details {
              grid-template-columns: 1fr;
            }
            .items-table {
              font-size: 14px;
            }
          }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://i.postimg.cc/brZN4ngb/Sky-Logo-Only.png" alt="SkyElectroTech Logo" class="logo">
                <h1>Order Confirmed!</h1>
                <p>Thank you for your order, ${user.name}!</p>
            </div>
            <div class="content">
                <div class="order-summary">
                    <h2>Order #${orderId}</h2>
                    <p>Placed on ${orderDate}</p>
                    <span class="status-badge" style="background-color: ${getStatusColor(order.orderStatus)};">
                        ${order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                    </span>
                </div>

                <div class="order-details">
                    <div class="detail-item">
                        <strong>Order ID</strong>
                        #${orderId}
                    </div>
                    <div class="detail-item">
                        <strong>Payment Method</strong>
                        ${order.paymentInfo?.method?.charAt(0).toUpperCase() + order.paymentInfo?.method?.slice(1) || 'Not specified'}
                    </div>
                    <div class="detail-item">
                        <strong>Payment Status</strong>
                        <span class="status-badge" style="background-color: ${order.paymentInfo?.status === 'completed' ? '#10b981' : '#f59e0b'};">
                            ${order.paymentInfo?.status === 'completed' ? 'Paid' : 'Pending'}
                        </span>
                    </div>
                    <div class="detail-item">
                        <strong>Expected Delivery</strong>
                        3-5 business days
                    </div>
                </div>

                <h3>Order Items</h3>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.orderItems.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td>${item.quantity}</td>
                                <td>${formatCurrency(item.price)}</td>
                                <td>${formatCurrency(item.price * item.quantity)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="total-section">
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <span>${formatCurrency(order.itemsPrice)}</span>
                    </div>
                    <div class="total-row">
                        <span>Tax:</span>
                        <span>${formatCurrency(order.taxPrice)}</span>
                    </div>
                    <div class="total-row">
                        <span>Shipping:</span>
                        <span>${formatCurrency(order.shippingPrice)}</span>
                    </div>
                    <div class="total-row final">
                        <span>Total:</span>
                        <span>${formatCurrency(order.totalPrice)}</span>
                    </div>
                </div>

                <h3>Shipping Address</h3>
                <div class="detail-item">
                    <strong>${order.shippingInfo.name}</strong><br>
                    ${order.shippingInfo.address}<br>
                    ${order.shippingInfo.city}, ${order.shippingInfo.state} ${order.shippingInfo.zipCode}<br>
                    ${order.shippingInfo.country}<br>
                    Phone: ${order.shippingInfo.phone}
                </div>

                <p>We'll send you updates about your order status. You can also track your order in your account.</p>
                <a href="${clientUrl}/user/orders/${order._id}" class="cta-button">Track My Order</a>
            </div>
            <div class="footer">
                <p>Thank you for choosing SkyElectroTech!</p>
                <p>If you have any questions, please contact our support team.</p>
                <p>© ${new Date().getFullYear()} SkyElectroTech. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `,
    text: `
    Order Confirmation #${orderId} - SkyElectroTech

    Hi ${user.name},

    Thank you for your order! We're excited to process it for you.

    Order Details:
    - Order ID: #${orderId}
    - Date: ${orderDate}
    - Status: ${order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
    - Total: ${formatCurrency(order.totalPrice)}

    Order Items:
    ${order.orderItems.map(item => `- ${item.name} (Qty: ${item.quantity}) - ${formatCurrency(item.price * item.quantity)}`).join('\n')}

    Shipping Address:
    ${order.shippingInfo.name}
    ${order.shippingInfo.address}
    ${order.shippingInfo.city}, ${order.shippingInfo.state} ${order.shippingInfo.zipCode}
    ${order.shippingInfo.country}

    Track your order: ${clientUrl}/user/orders/${order._id}

    Thank you for choosing SkyElectroTech!
    `
  };
};

// Order notification email template for admin/owner
const getOrderNotificationEmailTemplate = (order, user) => {
  const orderId = order._id.toString().slice(-6).toUpperCase();
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN');
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return {
    subject: `New Order #${orderId} - ${formatCurrency(order.totalPrice)}`,
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
        <title>New Order Notification</title>
        <style>
          :root {
            --primary-color: #3b82f6;
            --background-color: #f4f7f9;
            --text-color: #334155;
            --card-background: #ffffff;
            --footer-text: #94a3b8;
          }
          body {
            font-family: 'Poppins', Arial, sans-serif;
            line-height: 1.6;
            color: var(--text-color);
            background-color: var(--background-color);
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 700px;
            margin: 0 auto;
            background-color: var(--card-background);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
          }
          .logo {
            max-width: 120px;
            margin-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .content {
            padding: 30px;
          }
          .alert-box {
            background: #dbeafe;
            border: 1px solid #3b82f6;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .order-summary {
            background: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .customer-info {
            background: #f1f5f9;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .items-table th,
          .items-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
          }
          .items-table th {
            background: #f8fafc;
            font-weight: 600;
            color: #1e293b;
          }
          .total-section {
            background: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
          }
          .total-row.final {
            font-weight: 700;
            font-size: 18px;
            border-top: 2px solid #e2e8f0;
            padding-top: 12px;
            margin-top: 12px;
          }
          .cta-button {
            display: inline-block;
            background-color: var(--primary-color);
            color: #ffffff;
            padding: 14px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            transition: background-color 0.2s;
          }
          .cta-button:hover {
            background-color: #1d4ed8;
          }
          .footer {
            text-align: center;
            padding: 25px;
            font-size: 14px;
            color: var(--footer-text);
            background: #f8fafc;
          }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://i.postimg.cc/brZN4ngb/Sky-Logo-Only.png" alt="SkyElectroTech Logo" class="logo">
                <h1>New Order Received!</h1>
                <p>Order #${orderId} - ${formatCurrency(order.totalPrice)}</p>
            </div>
            <div class="content">
                <div class="alert-box">
                    <h3>🛍️ New Order Alert</h3>
                    <p>A new order has been placed and requires your attention.</p>
                </div>

                <div class="order-summary">
                    <h3>Order Summary</h3>
                    <p><strong>Order ID:</strong> #${orderId}</p>
                    <p><strong>Date:</strong> ${orderDate}</p>
                    <p><strong>Customer:</strong> ${user.name} (${user.email})</p>
                    <p><strong>Payment Method:</strong> ${order.paymentInfo?.method?.charAt(0).toUpperCase() + order.paymentInfo?.method?.slice(1) || 'Not specified'}</p>
                    <p><strong>Payment Status:</strong> ${order.paymentInfo?.status === 'completed' ? '✅ Paid' : '⏳ Pending'}</p>
                </div>

                <div class="customer-info">
                    <h3>Customer Information</h3>
                    <p><strong>Name:</strong> ${user.name}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Phone:</strong> ${order.shippingInfo.phone}</p>
                    <p><strong>Address:</strong> ${order.shippingInfo.address}, ${order.shippingInfo.city}, ${order.shippingInfo.state} ${order.shippingInfo.zipCode}, ${order.shippingInfo.country}</p>
                </div>

                <h3>Order Items</h3>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.orderItems.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td>${item.quantity}</td>
                                <td>${formatCurrency(item.price)}</td>
                                <td>${formatCurrency(item.price * item.quantity)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="total-section">
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <span>${formatCurrency(order.itemsPrice)}</span>
                    </div>
                    <div class="total-row">
                        <span>Tax:</span>
                        <span>${formatCurrency(order.taxPrice)}</span>
                    </div>
                    <div class="total-row">
                        <span>Shipping:</span>
                        <span>${formatCurrency(order.shippingPrice)}</span>
                    </div>
                    <div class="total-row final">
                        <span>Total:</span>
                        <span>${formatCurrency(order.totalPrice)}</span>
                    </div>
                </div>

                <p>Please process this order and update the status accordingly.</p>
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/admin/orders" class="cta-button">View Order Details</a>
            </div>
            <div class="footer">
                <p>This is an automated notification from SkyElectroTech.</p>
                <p>© ${new Date().getFullYear()} SkyElectroTech. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `,
    text: `
    New Order Notification - SkyElectroTech

    A new order has been received!

    Order Details:
    - Order ID: #${orderId}
    - Date: ${orderDate}
    - Customer: ${user.name} (${user.email})
    - Total: ${formatCurrency(order.totalPrice)}
    - Payment Status: ${order.paymentInfo?.status === 'completed' ? 'Paid' : 'Pending'}

    Customer Information:
    - Name: ${user.name}
    - Email: ${user.email}
    - Phone: ${order.shippingInfo.phone}
    - Address: ${order.shippingInfo.address}, ${order.shippingInfo.city}, ${order.shippingInfo.state} ${order.shippingInfo.zipCode}

    Order Items:
    ${order.orderItems.map(item => `- ${item.name} (Qty: ${item.quantity}) - ${formatCurrency(item.price * item.quantity)}`).join('\n')}

    Total: ${formatCurrency(order.totalPrice)}

    Please process this order and update the status accordingly.

    View order details: ${process.env.CLIENT_URL || 'http://localhost:3000'}/admin/orders
    `
  };
};

// Order status update email template
const getOrderStatusUpdateEmailTemplate = (order, user, newStatus) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const orderId = order._id.toString().slice(-6).toUpperCase();
  
  const getStatusMessage = (status) => {
    const messages = {
      'confirmed': 'Your order has been confirmed and is being processed.',
      'processing': 'We are now processing your order and preparing it for shipment.',
      'packed': 'Your order has been packed and is ready for shipment.',
      'shipped': 'Your order has been shipped and is on its way to you! This completes your purchase.',
      'delivered': 'Your order has been delivered successfully.',
      'cancelled': 'Your order has been cancelled as requested.'
    };
    return messages[status] || 'Your order status has been updated.';
  };

  const getStatusColor = (status) => {
    const colors = {
      'confirmed': '#3b82f6',
      'processing': '#8b5cf6',
      'packed': '#6366f1',
      'shipped': '#10b981', // Green color for completion
      'delivered': '#10b981',
      'cancelled': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  return {
    subject: `Order #${orderId} Status Update - ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
        <title>Order Status Update</title>
        <style>
          :root {
            --primary-color: #3b82f6;
            --background-color: #f4f7f9;
            --text-color: #334155;
            --card-background: #ffffff;
            --footer-text: #94a3b8;
          }
          body {
            font-family: 'Poppins', Arial, sans-serif;
            line-height: 1.6;
            color: var(--text-color);
            background-color: var(--background-color);
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: var(--card-background);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
          }
          .logo {
            max-width: 120px;
            margin-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .content {
            padding: 30px;
          }
          .status-box {
            background: #f8fafc;
            border-left: 4px solid ${getStatusColor(newStatus)};
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
          }
          .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            color: white;
            background-color: ${getStatusColor(newStatus)};
          }
          .cta-button {
            display: inline-block;
            background-color: var(--primary-color);
            color: #ffffff;
            padding: 14px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            transition: background-color 0.2s;
          }
          .cta-button:hover {
            background-color: #1d4ed8;
          }
          .footer {
            text-align: center;
            padding: 25px;
            font-size: 14px;
            color: var(--footer-text);
            background: #f8fafc;
          }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://i.postimg.cc/brZN4ngb/Sky-Logo-Only.png" alt="SkyElectroTech Logo" class="logo">
                <h1>Order Status Update</h1>
                <p>Order #${orderId}</p>
            </div>
            <div class="content">
                <p><strong>Hi ${user.name},</strong></p>
                
                <div class="status-box">
                    <h3>Order Status Updated</h3>
                    <span class="status-badge">${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}</span>
                    <p>${getStatusMessage(newStatus)}</p>
                </div>

                <p><strong>Order Details:</strong></p>
                <ul>
                    <li><strong>Order ID:</strong> #${orderId}</li>
                    <li><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN')}</li>
                    <li><strong>Total Amount:</strong> ₹${order.totalPrice.toLocaleString()}</li>
                </ul>

                <p>You can track your order and view more details in your account.</p>
                <a href="${clientUrl}/user/orders/${order._id}" class="cta-button">Track My Order</a>

                <p>If you have any questions about your order, please don't hesitate to contact our support team.</p>
            </div>
            <div class="footer">
                <p>Thank you for choosing SkyElectroTech!</p>
                <p>© ${new Date().getFullYear()} SkyElectroTech. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `,
    text: `
    Order Status Update - SkyElectroTech

    Hi ${user.name},

    Your order status has been updated!

    Order Details:
    - Order ID: #${orderId}
    - New Status: ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}
    - Order Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}
    - Total Amount: ₹${order.totalPrice.toLocaleString()}

    ${getStatusMessage(newStatus)}

    Track your order: ${clientUrl}/user/orders/${order._id}

    Thank you for choosing SkyElectroTech!
    `
  };
};

// Send order confirmation email to customer
const sendOrderConfirmationEmail = async (order, user) => {
  try {
    const emailTemplate = getOrderConfirmationEmailTemplate(order, user);
    await sendEmail({
      to: user.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });
    console.log(`Order confirmation email sent to ${user.email}`);
  } catch (error) {
    console.error(`Failed to send order confirmation email to ${user.email}:`, error);
    // Don't re-throw as order creation shouldn't fail due to email issues
  }
};

// Send order notification email to admin/owner
const sendOrderNotificationEmail = async (order, user) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    if (!adminEmail) {
      console.warn('Admin email not configured, skipping order notification');
      return;
    }

    const emailTemplate = getOrderNotificationEmailTemplate(order, user);
    await sendEmail({
      to: adminEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });
    console.log(`Order notification email sent to admin: ${adminEmail}`);
  } catch (error) {
    console.error(`Failed to send order notification email to admin:`, error);
    // Don't re-throw as order creation shouldn't fail due to email issues
  }
};

// Send order status update email to customer
const sendOrderStatusUpdateEmail = async (order, user, newStatus) => {
  try {
    const emailTemplate = getOrderStatusUpdateEmailTemplate(order, user, newStatus);
    await sendEmail({
      to: user.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });
    console.log(`Order status update email sent to ${user.email}`);
  } catch (error) {
    console.error(`Failed to send order status update email to ${user.email}:`, error);
    // Don't re-throw as status update shouldn't fail due to email issues
  }
};

// Send low stock alert email to admin
const sendLowStockAlertEmail = async (product) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    if (!adminEmail) {
      console.warn('Admin email not configured, skipping low stock alert');
      return;
    }

    const emailContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Low Stock Alert</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .alert-box { background: #fef2f2; border: 1px solid #ef4444; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .product-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>⚠️ Low Stock Alert</h1>
                <p>Product stock is running low</p>
            </div>
            <div class="content">
                <div class="alert-box">
                    <h3>Stock Alert</h3>
                    <p>The following product is running low on stock and may need restocking soon.</p>
                </div>

                <div class="product-info">
                    <h3>Product Details</h3>
                    <p><strong>Product Name:</strong> ${product.name}</p>
                    <p><strong>Current Stock:</strong> ${product.stock} units</p>
                    <p><strong>Low Stock Threshold:</strong> ${product.lowStockThreshold || 10} units</p>
                    <p><strong>Category:</strong> ${product.category?.name || 'N/A'}</p>
                    <p><strong>Price:</strong> ₹${product.price?.toLocaleString() || 'N/A'}</p>
                </div>

                <p>Please consider restocking this product to avoid stockouts.</p>
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/admin/products/${product._id}" class="button">Update Stock</a>
            </div>
        </div>
    </body>
    </html>
    `;

    await sendEmail({
      to: adminEmail,
      subject: `Low Stock Alert - ${product.name}`,
      html: emailContent,
      text: `
        Low Stock Alert - SkyElectroTech

        The following product is running low on stock:

        Product Name: ${product.name}
        Current Stock: ${product.stock} units
        Low Stock Threshold: ${product.lowStockThreshold || 10} units
        Category: ${product.category?.name || 'N/A'}
        Price: ₹${product.price?.toLocaleString() || 'N/A'}

        Please consider restocking this product to avoid stockouts.

        Update stock: ${process.env.CLIENT_URL || 'http://localhost:3000'}/admin/products/${product._id}
      `
    });
    console.log(`Low stock alert email sent to admin: ${adminEmail}`);
  } catch (error) {
    console.error(`Failed to send low stock alert email to admin:`, error);
  }
};

// Send new user registration notification to admin
const sendNewUserNotificationEmail = async (user) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    if (!adminEmail) {
      console.warn('Admin email not configured, skipping new user notification');
      return;
    }

    const emailContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New User Registration</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .user-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>👤 New User Registration</h1>
                <p>A new user has joined SkyElectroTech</p>
            </div>
            <div class="content">
                <div class="user-info">
                    <h3>User Information</h3>
                    <p><strong>Name:</strong> ${user.name}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Registration Date:</strong> ${new Date(user.createdAt).toLocaleDateString('en-IN')}</p>
                    <p><strong>Registration Method:</strong> ${user.googleId ? 'Google OAuth' : 'Email/Password'}</p>
                </div>

                <p>Welcome the new user and monitor their activity.</p>
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/admin/users" class="button">View User Details</a>
            </div>
        </div>
    </body>
    </html>
    `;

    await sendEmail({
      to: adminEmail,
      subject: `New User Registration - ${user.name}`,
      html: emailContent,
      text: `
        New User Registration - SkyElectroTech

        A new user has registered:

        Name: ${user.name}
        Email: ${user.email}
        Registration Date: ${new Date(user.createdAt).toLocaleDateString('en-IN')}
        Registration Method: ${user.googleId ? 'Google OAuth' : 'Email/Password'}

        View user details: ${process.env.CLIENT_URL || 'http://localhost:3000'}/admin/users
      `
    });
    console.log(`New user notification email sent to admin: ${adminEmail}`);
  } catch (error) {
    console.error(`Failed to send new user notification email to admin:`, error);
  }
};

// Send return request notification to admin
const sendReturnRequestEmail = async (order, user, returnRequest) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    if (!adminEmail) {
      console.warn('Admin email not configured, skipping return request notification');
      return;
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount || 0);
    };

    const getReasonLabel = (reason) => {
      const reasons = {
        defective: 'Product is defective/damaged',
        wrong_item: 'Wrong item received',
        not_as_described: 'Product not as described',
        size_issue: 'Size doesn\'t fit',
        quality_issue: 'Quality not satisfactory',
        changed_mind: 'Changed my mind',
        duplicate_order: 'Duplicate order',
        other: 'Other reason'
      };
      return reasons[reason] || reason;
    };

    const getConditionLabel = (condition) => {
      const conditions = {
        good: 'Good - Like new condition',
        fair: 'Fair - Minor wear/tear',
        poor: 'Poor - Significant damage'
      };
      return conditions[condition] || condition;
    };

    const emailContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Return Request - Order ${order.orderId}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .order-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
            .return-details { background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fecaca; }
            .button { background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .image-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin: 15px 0; }
            .image-item { border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; }
            .image-item img { width: 100%; height: 120px; object-fit: cover; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔄 Return Request</h1>
                <p>Order ${order.orderId} - ${user.name}</p>
            </div>
            <div class="content">
                <div class="order-info">
                    <h3>Order Information</h3>
                    <p><strong>Order ID:</strong> ${order.orderId}</p>
                    <p><strong>Customer:</strong> ${user.name} (${user.email})</p>
                    <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                    <p><strong>Total Amount:</strong> ${formatCurrency(order.totalPrice)}</p>
                    <p><strong>Items:</strong> ${order.orderItems.length} item(s)</p>
                </div>

                <div class="return-details">
                    <h3>Return Request Details</h3>
                    <p><strong>Request #:</strong> ${returnRequest.requestNumber}</p>
                    <p><strong>Reason:</strong> ${getReasonLabel(returnRequest.reason)}</p>
                    <p><strong>Product Condition:</strong> ${getConditionLabel(returnRequest.condition)}</p>
                    <p><strong>Description:</strong></p>
                    <p style="background: white; padding: 15px; border-radius: 6px; margin: 10px 0;">${returnRequest.description}</p>
                    
                    ${returnRequest.images && returnRequest.images.length > 0 ? `
                    <p><strong>Images:</strong></p>
                    <div class="image-grid">
                        ${returnRequest.images.map(img => `
                            <div class="image-item">
                                <img src="${img}" alt="Return evidence" />
                            </div>
                        `).join('')}
                    </div>
                    ` : '<p><strong>Images:</strong> No images provided</p>'}
                </div>

                <p><strong>Action Required:</strong> Please review this return request and take appropriate action.</p>
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/admin/orders/${order._id}" class="button">Review Return Request</a>
            </div>
        </div>
    </body>
    </html>
    `;

    await sendEmail({
      to: adminEmail,
      subject: `Return Request - Order ${order.orderId} - ${user.name}`,
      html: emailContent,
      text: `
        Return Request - SkyElectroTech

        Order ID: ${order.orderId}
        Customer: ${user.name} (${user.email})
        Order Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}
        Total Amount: ${formatCurrency(order.totalPrice)}

        Return Details:
        Request #: ${returnRequest.requestNumber}
        Reason: ${getReasonLabel(returnRequest.reason)}
        Product Condition: ${getConditionLabel(returnRequest.condition)}
        Description: ${returnRequest.description}
        Images: ${returnRequest.images && returnRequest.images.length > 0 ? `${returnRequest.images.length} image(s)` : 'No images provided'}

        Review return request: ${process.env.CLIENT_URL || 'http://localhost:3000'}/admin/orders/${order._id}
      `
    });
    console.log(`Return request email sent to admin: ${adminEmail}`);
  } catch (error) {
    console.error(`Failed to send return request email to admin:`, error);
  }
};

// Send return approved email to customer
const sendReturnApprovedEmail = async (order, user, returnRequest) => {
  try {
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(amount);
    };

    const getReasonLabel = (reason) => {
      const reasons = {
        defective: 'Defective Product',
        wrong_item: 'Wrong Item Received',
        not_as_described: 'Not as Described',
        size_issue: 'Size Issue',
        quality_issue: 'Quality Issue',
        changed_mind: 'Changed Mind',
        duplicate_order: 'Duplicate Order',
        other: 'Other'
      };
      return reasons[reason] || reason;
    };

    const emailContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Return Request Approved</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #059669; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .order-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669; }
            .return-details { background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #bbf7d0; }
            .button { background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✅ Return Request Approved</h1>
                <p>Order ${order.orderId} - Return Request #${returnRequest.requestNumber}</p>
            </div>
            <div class="content">
                <p>Dear ${user.name},</p>
                
                <p>Great news! Your return request for <strong>Order ${order.orderId}</strong> has been approved.</p>

                <div class="order-info">
                    <h3>Order Information</h3>
                    <p><strong>Order ID:</strong> ${order.orderId}</p>
                    <p><strong>Return Request #:</strong> ${returnRequest.requestNumber}</p>
                    <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                    <p><strong>Total Amount:</strong> ${formatCurrency(order.totalPrice)}</p>
                </div>

                <div class="return-details">
                    <h3>Return Details</h3>
                    <p><strong>Reason:</strong> ${getReasonLabel(returnRequest.reason)}</p>
                    <p><strong>Description:</strong> ${returnRequest.description}</p>
                    ${returnRequest.adminNotes ? `<p><strong>Admin Notes:</strong> ${returnRequest.adminNotes}</p>` : ''}
                </div>

                <h3>Next Steps:</h3>
                <ol>
                    <li>Please package the items securely</li>
                    <li>Include all original packaging and accessories</li>
                    <li>We will arrange pickup or provide return shipping details</li>
                    <li>Refund will be processed once we receive and inspect the items</li>
                </ol>

                <p>If you have any questions, please contact our customer support team.</p>
                
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/orders/${order._id}" class="button">View Order Details</a>
            </div>
        </div>
    </body>
    </html>
    `;

    await sendEmail({
      to: user.email,
      subject: `Return Request Approved - Order ${order.orderId}`,
      html: emailContent,
      text: `
        Return Request Approved - SkyElectroTech

        Dear ${user.name},

        Great news! Your return request for Order ${order.orderId} has been approved.

        Order ID: ${order.orderId}
        Return Request #: ${returnRequest.requestNumber}
        Reason: ${getReasonLabel(returnRequest.reason)}
        ${returnRequest.adminNotes ? `Admin Notes: ${returnRequest.adminNotes}` : ''}

        Next Steps:
        1. Package the items securely
        2. Include all original packaging and accessories
        3. We will arrange pickup or provide return shipping details
        4. Refund will be processed once we receive and inspect the items

        View order details: ${process.env.CLIENT_URL || 'http://localhost:3000'}/orders/${order._id}
      `
    });
    console.log(`Return approved email sent to customer: ${user.email}`);
  } catch (error) {
    console.error(`Failed to send return approved email to customer:`, error);
  }
};

// Send return rejected email to customer
const sendReturnRejectedEmail = async (order, user, returnRequest) => {
  try {
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(amount);
    };

    const getReasonLabel = (reason) => {
      const reasons = {
        defective: 'Defective Product',
        wrong_item: 'Wrong Item Received',
        not_as_described: 'Not as Described',
        size_issue: 'Size Issue',
        quality_issue: 'Quality Issue',
        changed_mind: 'Changed Mind',
        duplicate_order: 'Duplicate Order',
        other: 'Other'
      };
      return reasons[reason] || reason;
    };

    const emailContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Return Request Status</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .order-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
            .return-details { background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fecaca; }
            .button { background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>❌ Return Request Status</h1>
                <p>Order ${order.orderId} - Return Request #${returnRequest.requestNumber}</p>
            </div>
            <div class="content">
                <p>Dear ${user.name},</p>
                
                <p>We regret to inform you that your return request for <strong>Order ${order.orderId}</strong> could not be approved at this time.</p>

                <div class="order-info">
                    <h3>Order Information</h3>
                    <p><strong>Order ID:</strong> ${order.orderId}</p>
                    <p><strong>Return Request #:</strong> ${returnRequest.requestNumber}</p>
                    <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                    <p><strong>Total Amount:</strong> ${formatCurrency(order.totalPrice)}</p>
                </div>

                <div class="return-details">
                    <h3>Return Details</h3>
                    <p><strong>Reason:</strong> ${getReasonLabel(returnRequest.reason)}</p>
                    <p><strong>Description:</strong> ${returnRequest.description}</p>
                    ${returnRequest.adminNotes ? `<p><strong>Admin Notes:</strong> ${returnRequest.adminNotes}</p>` : ''}
                </div>

                <p>If you have any questions about this decision or would like to discuss further, please contact our customer support team.</p>
                
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/orders/${order._id}" class="button">View Order Details</a>
            </div>
        </div>
    </body>
    </html>
    `;

    await sendEmail({
      to: user.email,
      subject: `Return Request Status - Order ${order.orderId}`,
      html: emailContent,
      text: `
        Return Request Status - SkyElectroTech

        Dear ${user.name},

        We regret to inform you that your return request for Order ${order.orderId} could not be approved at this time.

        Order ID: ${order.orderId}
        Return Request #: ${returnRequest.requestNumber}
        Reason: ${getReasonLabel(returnRequest.reason)}
        ${returnRequest.adminNotes ? `Admin Notes: ${returnRequest.adminNotes}` : ''}

        If you have any questions about this decision or would like to discuss further, please contact our customer support team.

        View order details: ${process.env.CLIENT_URL || 'http://localhost:3000'}/orders/${order._id}
      `
    });
    console.log(`Return rejected email sent to customer: ${user.email}`);
  } catch (error) {
    console.error(`Failed to send return rejected email to customer:`, error);
  }
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendOTPEmail,
  sendForgotPasswordEmail,
  sendOrderConfirmationEmail,
  sendOrderNotificationEmail,
  sendOrderStatusUpdateEmail,
  sendReturnRequestEmail,
  sendReturnApprovedEmail,
  sendReturnRejectedEmail,
  sendLowStockAlertEmail,
  sendNewUserNotificationEmail,
  getWelcomeEmailTemplate,
  getOTPEmailTemplate,
  getForgotPasswordEmailTemplate,
  getOrderConfirmationEmailTemplate,
  getOrderNotificationEmailTemplate,
  getOrderStatusUpdateEmailTemplate,
};