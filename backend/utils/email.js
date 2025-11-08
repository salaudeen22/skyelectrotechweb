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

// Send email function using the transporter

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

// Helper function to get logo URL
const getLogoUrl = () => {
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  return `${baseUrl}/favicon_io%20(1)/android-chrome-512x512.webp`;
};

// Helper function to get favicon URL
const getFaviconUrl = () => {
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  return `${baseUrl}/favicon_io%20(1)/favicon-32x32.webp`;
};

// Helper function to get logo URL for emails (using local images)
const getEmailLogoUrl = () => {
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  return `${baseUrl}/favicon_io%20(1)/android-chrome-512x512.webp`;
};

// Helper function to get favicon URL for emails
const getEmailFaviconUrl = () => {
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  return `${baseUrl}/favicon_io%20(1)/favicon-32x32.webp`;
};

// -------------------------------------------------------------------
// START OF ENHANCED EMAIL TEMPLATES
// -------------------------------------------------------------------

// ENHANCED Welcome email template
const getWelcomeEmailTemplate = (userName) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const logoUrl = getEmailLogoUrl();
  
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
        <title>Welcome to SkyElectroTech</title>
        <style>
          :root {
            --primary-color: #6366f1;
            --primary-dark: #4f46e5;
            --primary-light: #818cf8;
            --secondary-color: #10b981;
            --accent-color: #f59e0b;
            --background-color: #f8fafc;
            --text-color: #1e293b;
            --text-light: #64748b;
            --text-muted: #94a3b8;
            --card-background: #ffffff;
            --border-color: #e2e8f0;
            --border-light: #f1f5f9;
            --footer-text: #64748b;
            --success-color: #10b981;
            --warning-color: #f59e0b;
            --error-color: #ef4444;
            --gradient-primary: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
            --gradient-secondary: linear-gradient(135deg, #10b981 0%, #059669 100%);
            --gradient-accent: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.7;
            color: var(--text-color);
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            margin: 0;
            padding: 20px;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          .container {
            max-width: 650px;
            margin: 0 auto;
            background-color: var(--card-background);
            border-radius: 24px;
            overflow: hidden;
            box-shadow: var(--shadow-2xl);
            border: 1px solid var(--border-color);
            position: relative;
          }
          
          .container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--gradient-primary);
          }
          
          .header {
            background: var(--gradient-primary);
            color: white;
            padding: 60px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
            box-shadow: var(--shadow-xl);
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.2;
          }
          
          .logo {
            width: 120px;
            height: 120px;
            margin: 0 auto 30px;
            border-radius: 24px;
            background: rgba(255, 255, 255, 0.15);
            padding: 20px;
            backdrop-filter: blur(20px);
            border: 2px solid rgba(255, 255, 255, 0.3);
            position: relative;
            z-index: 1;
            box-shadow: var(--shadow-lg);
            transition: transform 0.3s ease;
          }
          
          .logo:hover {
            transform: scale(1.05);
          }
          
          .header h1 {
            margin: 0;
            font-size: 36px;
            font-weight: 800;
            position: relative;
            z-index: 1;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            letter-spacing: -0.025em;
          }
          
          .header p {
            margin: 15px 0 0;
            font-size: 18px;
            opacity: 0.95;
            position: relative;
            z-index: 1;
            font-weight: 400;
          }
          
          .content {
            padding: 50px 40px;
          }
          
          .content h2 {
            font-size: 28px;
            color: var(--text-color);
            margin-bottom: 25px;
            font-weight: 700;
            letter-spacing: -0.025em;
          }
          
          .content p {
            margin-bottom: 25px;
            color: var(--text-light);
            font-size: 16px;
            line-height: 1.8;
          }
          
          .features {
            margin: 40px 0;
            padding: 0;
            list-style: none;
          }
          
          .feature-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 30px;
            padding: 30px;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-radius: 20px;
            border: 1px solid var(--border-color);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: var(--shadow-md);
            position: relative;
            overflow: hidden;
          }
          
          .feature-item::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: var(--gradient-primary);
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          
          .feature-item:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-xl);
            border-color: var(--primary-light);
          }
          
          .feature-item:hover::before {
            opacity: 1;
          }
          
          .feature-item:last-child {
            margin-bottom: 0;
          }
          
          .feature-icon {
            width: 64px;
            height: 64px;
            margin-right: 30px;
            flex-shrink: 0;
            background: var(--gradient-primary);
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            box-shadow: var(--shadow-lg);
            position: relative;
            overflow: hidden;
          }
          
          .feature-icon::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            transition: left 0.6s ease;
          }
          
          .feature-item:hover .feature-icon::before {
            left: 100%;
          }
          
          .feature-icon svg {
            width: 28px;
            height: 28px;
            stroke-width: 2;
          }
          
          .feature-content h3 {
            font-size: 20px;
            font-weight: 600;
            color: var(--text-color);
            margin-bottom: 10px;
            letter-spacing: -0.025em;
          }
          
          .feature-content p {
            color: var(--text-light);
            margin: 0;
            font-size: 15px;
            line-height: 1.6;
          }
          
          .cta-section {
            text-align: center;
            margin: 60px 0 40px;
            padding: 50px;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-radius: 24px;
            border: 1px solid var(--border-color);
            box-shadow: var(--shadow-lg);
            position: relative;
            overflow: hidden;
          }
          
          .cta-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: var(--gradient-primary);
          }
          
          .cta-button {
            display: inline-block;
            background: var(--gradient-primary);
            color: #ffffff;
            padding: 20px 40px;
            text-decoration: none;
            border-radius: 16px;
            font-weight: 700;
            font-size: 18px;
            margin: 30px 0;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: var(--shadow-lg);
            position: relative;
            overflow: hidden;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border: none;
            cursor: pointer;
          }
          
          .cta-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            transition: left 0.6s ease;
          }
          
          .cta-button:hover::before {
            left: 100%;
          }
          
          .cta-button:hover {
            transform: translateY(-3px);
            box-shadow: var(--shadow-2xl);
          }
          
          .footer {
            text-align: center;
            padding: 40px;
            font-size: 14px;
            color: var(--footer-text);
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-top: 1px solid var(--border-color);
          }
          
          .footer p {
            margin: 8px 0;
          }
          
          .social-links {
            margin: 25px 0;
          }
          
          .social-links a {
            display: inline-block;
            margin: 0 12px;
            color: var(--text-muted);
            text-decoration: none;
            transition: color 0.3s ease;
            font-weight: 500;
          }
          
          .social-links a:hover {
            color: var(--primary-color);
          }
          
          /* Responsive Design */
          @media (max-width: 600px) {
            body {
              padding: 10px;
            }
            
            .container {
              border-radius: 20px;
            }
            
            .header {
              padding: 40px 25px;
            }
            
            .header h1 {
              font-size: 32px;
            }
            
            .content {
              padding: 40px 25px;
            }
            
            .feature-item {
              padding: 25px;
            }
            
            .feature-icon {
              width: 56px;
              height: 56px;
              margin-right: 20px;
            }
            
            .cta-section {
              padding: 30px 25px;
            }
          }
          
          /* Dark Mode Support */
          @media (prefers-color-scheme: dark) {
            :root {
              --background-color: #0f172a;
              --text-color: #f1f5f9;
              --text-light: #cbd5e1;
              --text-muted: #94a3b8;
              --card-background: #1e293b;
              --border-color: #334155;
              --border-light: #475569;
              --footer-text: #64748b;
            }
            
            .content h2 { 
              color: #f8fafc; 
            }
            
            .feature-item {
              background: linear-gradient(135deg, #334155 0%, #475569 100%);
              border-color: #475569;
            }
            
            .feature-content h3 { 
              color: #f8fafc; 
            }
            
            .cta-section {
              background: linear-gradient(135deg, #334155 0%, #475569 100%);
              border-color: #475569;
            }
            
            .footer {
              background: linear-gradient(135deg, #334155 0%, #475569 100%);
              border-color: #475569;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${logoUrl}" alt="SkyElectroTech Logo" class="logo">
            <h1>Welcome Aboard, ${userName}!</h1>
            <p>Your journey into the world of electronics starts now</p>
          </div>
          <div class="content">
            <h2>Welcome to the Future of Electronics Shopping</h2>
            <p>Thank you for joining SkyElectroTech! We're thrilled to have you in our community. Get ready to discover amazing electronics at unbeatable prices with cutting-edge technology and exceptional service.</p>
            
            <ul class="features">
              <li class="feature-item">
                <div class="feature-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <div class="feature-content">
                  <h3>Vast Product Catalog</h3>
                  <p>Browse through thousands of high-quality electronics and components with detailed specifications and real-time availability</p>
                </div>
              </li>
              <li class="feature-item">
                <div class="feature-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div class="feature-content">
                  <h3>Secure Shopping</h3>
                  <p>Shop with confidence with our enterprise-grade security, encrypted payments, and comprehensive data protection</p>
                </div>
              </li>
              <li class="feature-item">
                <div class="feature-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <div class="feature-content">
                  <h3>Fast Delivery</h3>
                  <p>Get your orders delivered quickly with real-time tracking, multiple shipping options, and guaranteed delivery times</p>
                </div>
              </li>
            </ul>
            
            <div class="cta-section">
              <p>Ready to start your shopping journey?</p>
              <a href="${clientUrl}/products" class="cta-button">Start Shopping Now</a>
              <p style="font-size: 15px; margin-top: 20px; color: var(--text-light);">
                If you have any questions, our dedicated support team is here to help 24/7!
              </p>
            </div>
          </div>
          <div class="footer">
            <p>You received this email because you signed up at SkyElectroTech.</p>
            <div class="social-links">
              <a href="#">Facebook</a> • <a href="#">Twitter</a> • <a href="#">Instagram</a> • <a href="#">LinkedIn</a>
            </div>
            <p>© ${new Date().getFullYear()} SkyElectroTech. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Welcome to SkyElectroTech, ${userName}!

      Thank you for joining our community. With your new account, you can:
      
      • Browse our vast catalog of electronics and components
      • Shop securely with multiple payment options
      • Track your orders with real-time updates
      • Enjoy fast and reliable delivery
      
      Start shopping now: ${clientUrl}/products
      
      Happy exploring!
      The SkyElectroTech Team
    `
  };
};

// REDESIGNED Forgot password email template
const getForgotPasswordEmailTemplate = (userName, resetUrl) => {
  const logoUrl = getEmailLogoUrl();
  
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
        <title>Reset Your Password</title>
        <style>
          :root {
            --primary-color: #f59e0b;
            --primary-dark: #d97706;
            --primary-light: #fbbf24;
            --secondary-color: #10b981;
            --accent-color: #f59e0b;
            --background-color: #f8fafc;
            --text-color: #1e293b;
            --text-light: #64748b;
            --text-muted: #94a3b8;
            --card-background: #ffffff;
            --border-color: #e2e8f0;
            --border-light: #f1f5f9;
            --footer-text: #64748b;
            --warning-color: #fbbf24;
            --warning-bg: #fefce8;
            --warning-border: #fde68a;
            --gradient-primary: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            --gradient-secondary: linear-gradient(135deg, #10b981 0%, #059669 100%);
            --gradient-accent: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.7;
            color: var(--text-color);
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            margin: 0;
            padding: 20px;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          .container {
            max-width: 650px;
            margin: 0 auto;
            background-color: var(--card-background);
            border-radius: 24px;
            overflow: hidden;
            box-shadow: var(--shadow-2xl);
            border: 1px solid var(--border-color);
            position: relative;
          }
          
          .container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--gradient-primary);
          }
          
          .header {
            background: var(--gradient-primary);
            color: white;
            padding: 50px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
            box-shadow: var(--shadow-xl);
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.2;
          }
          
          .logo {
            width: 60px;
            height: 60px;
            margin: 0 auto 20px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.1);
            padding: 8px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            position: relative;
            z-index: 1;
          }
          
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            position: relative;
            z-index: 1;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          .header p {
            margin: 10px 0 0;
            font-size: 16px;
            opacity: 0.9;
            position: relative;
            z-index: 1;
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .content p {
            margin-bottom: 20px;
            color: var(--text-light);
            font-size: 16px;
          }
          
          .notice-box {
            display: flex;
            align-items: flex-start;
            padding: 20px;
            border-radius: 12px;
            margin: 25px 0;
            border: 1px solid var(--warning-border);
            background: var(--warning-bg);
            position: relative;
            overflow: hidden;
          }
          
          .notice-box::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 4px;
            background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
          }
          
          .notice-icon {
            width: 48px;
            height: 48px;
            margin-right: 20px;
            flex-shrink: 0;
            background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
          }
          
          .notice-icon svg {
            width: 24px;
            height: 24px;
          }
          
          .notice-content h3 {
            font-size: 18px;
            font-weight: 600;
            color: #92400e;
            margin-bottom: 8px;
          }
          
          .notice-content p {
            color: #a16207;
            margin: 0;
            font-size: 14px;
          }
          
          .reset-button {
            display: inline-block;
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
            color: #ffffff;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            margin: 25px auto;
            text-align: center;
            transition: all 0.3s ease;
            box-shadow: 0 4px 14px 0 rgba(245, 158, 11, 0.3);
            position: relative;
            overflow: hidden;
          }
          
          .reset-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
          }
          
          .reset-button:hover::before {
            left: 100%;
          }
          
          .reset-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px 0 rgba(245, 158, 11, 0.4);
          }
          
          .link-box {
            background: #f8fafc;
            padding: 20px;
            border-radius: 12px;
            font-family: 'Courier New', monospace;
            word-break: break-all;
            text-align: center;
            font-size: 14px;
            margin-top: 20px;
            border: 1px solid var(--border-color);
            color: var(--text-color);
          }
          
          .footer {
            text-align: center;
            padding: 30px;
            font-size: 14px;
            color: var(--footer-text);
            background: #f8fafc;
            border-top: 1px solid var(--border-color);
          }
          
          .footer p {
            margin: 5px 0;
          }
          
          /* Responsive Design */
          @media (max-width: 600px) {
            body {
              padding: 10px;
            }
            
            .container {
              border-radius: 12px;
            }
            
            .header {
              padding: 30px 20px;
            }
            
            .header h1 {
              font-size: 24px;
            }
            
            .content {
              padding: 30px 20px;
            }
            
            .notice-box {
              padding: 15px;
            }
            
            .notice-icon {
              width: 40px;
              height: 40px;
              margin-right: 15px;
            }
          }
          
          /* Dark Mode Support */
          @media (prefers-color-scheme: dark) {
            :root {
              --background-color: #0f172a;
              --text-color: #e2e8f0;
              --text-light: #94a3b8;
              --card-background: #1e293b;
              --border-color: #334155;
              --footer-text: #64748b;
              --warning-bg: #2c271a;
              --warning-border: #92400e;
            }
            
            .link-box {
              background: #334155;
              border-color: #475569;
            }
            
            .footer {
              background: #334155;
              border-color: #475569;
            }
          }
        </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${logoUrl}" alt="SkyElectroTech Logo" class="logo">
          <h1>Password Reset Request</h1>
          <p>Secure your account with a new password</p>
        </div>
        <div class="content">
          <p><strong>Hi ${userName},</strong></p>
          <p>We received a request to reset the password for your SkyElectroTech account. If you did not make this request, you can safely ignore this email.</p>
          
          <div class="notice-box">
            <div class="notice-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="notice-content">
              <h3>Time-Sensitive Link</h3>
              <p>For your security, this link will expire in 10 minutes.</p>
            </div>
          </div>
          
          <p>Click the button below to set a new password:</p>
          <a href="${resetUrl}" class="reset-button">Reset My Password</a>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <div class="link-box">${resetUrl}</div>
          
          <p style="margin-top: 30px; padding: 20px; background: #f8fafc; border-radius: 12px; border-left: 4px solid #10b981;">
            <strong>Security Note:</strong> Never share this link with anyone. Our team will never ask for your password via email.
          </p>
        </div>
        <div class="footer">
          <p>If you didn't request a password reset, please contact our support team immediately.</p>
          <p>© ${new Date().getFullYear()} SkyElectroTech. All rights reserved.</p>
        </div>
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
  
  const logoUrl = getEmailLogoUrl();

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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
        <title>OTP Verification</title>
        <style>
          :root {
            --primary-color: #3b82f6;
            --primary-dark: #1d4ed8;
            --primary-light: #60a5fa;
            --secondary-color: #10b981;
            --accent-color: #f59e0b;
            --background-color: #f8fafc;
            --text-color: #1e293b;
            --text-light: #64748b;
            --text-muted: #94a3b8;
            --card-background: #ffffff;
            --border-color: #e2e8f0;
            --border-light: #f1f5f9;
            --footer-text: #64748b;
            --success-color: #10b981;
            --warning-color: #f59e0b;
            --gradient-primary: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            --gradient-secondary: linear-gradient(135deg, #10b981 0%, #059669 100%);
            --gradient-accent: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.7;
            color: var(--text-color);
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            margin: 0;
            padding: 20px;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          .container {
            max-width: 650px;
            margin: 0 auto;
            background-color: var(--card-background);
            border-radius: 24px;
            overflow: hidden;
            box-shadow: var(--shadow-2xl);
            border: 1px solid var(--border-color);
            position: relative;
          }
          
          .container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--gradient-primary);
          }
          
          .header {
            background: var(--gradient-primary);
            color: white;
            padding: 50px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
            box-shadow: var(--shadow-xl);
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.2;
          }
          
          .logo {
            width: 60px;
            height: 60px;
            margin: 0 auto 20px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.1);
            padding: 8px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            position: relative;
            z-index: 1;
          }
          
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            position: relative;
            z-index: 1;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          .header p {
            margin: 10px 0 0;
            font-size: 16px;
            opacity: 0.9;
            position: relative;
            z-index: 1;
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .content h2 {
            font-size: 24px;
            color: #1e293b;
            margin-bottom: 20px;
            font-weight: 600;
          }
          
          .content p {
            margin-bottom: 20px;
            color: var(--text-light);
            font-size: 16px;
          }
          
          .otp-box {
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            border-radius: 16px;
            margin: 30px 0;
            position: relative;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.3);
          }
          
          .otp-box::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.1;
          }
          
          .otp-label {
            font-size: 18px;
            font-weight: 500;
            margin-bottom: 20px;
            position: relative;
            z-index: 1;
          }
          
          .otp-code {
            font-size: 48px;
            font-weight: 700;
            letter-spacing: 12px;
            margin: 20px 0;
            padding: 25px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 12px;
            display: inline-block;
            position: relative;
            z-index: 1;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          .otp-expiry {
            font-size: 14px;
            opacity: 0.9;
            position: relative;
            z-index: 1;
          }
          
          .notice {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 1px solid var(--warning-color);
            border-radius: 12px;
            padding: 20px;
            margin: 30px 0;
            position: relative;
            overflow: hidden;
          }
          
          .notice::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 4px;
            background: linear-gradient(135deg, var(--warning-color), #d97706);
          }
          
          .notice strong {
            color: #92400e;
            font-weight: 600;
          }
          
          .footer {
            text-align: center;
            padding: 30px;
            font-size: 14px;
            color: var(--footer-text);
            background: #f8fafc;
            border-top: 1px solid var(--border-color);
          }
          
          .footer p {
            margin: 5px 0;
          }
          
          /* Responsive Design */
          @media (max-width: 600px) {
            body {
              padding: 10px;
            }
            
            .container {
              border-radius: 12px;
            }
            
            .header {
              padding: 30px 20px;
            }
            
            .header h1 {
              font-size: 24px;
            }
            
            .content {
              padding: 30px 20px;
            }
            
            .otp-box {
              padding: 30px 20px;
            }
            
            .otp-code {
              font-size: 36px;
              letter-spacing: 8px;
              padding: 20px;
            }
          }
          
          /* Dark Mode Support */
          @media (prefers-color-scheme: dark) {
            :root {
              --background-color: #0f172a;
              --text-color: #e2e8f0;
              --text-light: #94a3b8;
              --card-background: #1e293b;
              --border-color: #334155;
              --footer-text: #64748b;
            }
            
            .content h2 { 
              color: #f1f5f9; 
            }
            
            .notice {
              background: linear-gradient(135deg, #2c271a 0%, #92400e 100%);
              border-color: #f59e0b;
            }
            
            .footer {
              background: #334155;
              border-color: #475569;
            }
          }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="${logoUrl}" alt="SkyElectroTech Logo" class="logo">
                <h1>SkyElectroTech</h1>
                <p>OTP Verification</p>
            </div>
            <div class="content">
                <h2>Hello ${userName}!</h2>
                <p>We received a request to ${purposeText[purpose] || purpose}. Please use the OTP code below to complete the verification:</p>
                
                <div class="otp-box">
                    <p class="otp-label">Your OTP Code:</p>
                    <div class="otp-code">${otpCode}</div>
                    <p class="otp-expiry">This code expires in 10 minutes</p>
                </div>

                <div class="notice">
                    <strong>Security Notice:</strong> Never share this OTP with anyone. Our team will never ask for your OTP via email or phone.
                </div>

                <p>If you didn't request this verification, please ignore this email or contact our support team.</p>
            </div>
            <div class="footer">
                <p>© ${new Date().getFullYear()} SkyElectroTech. All rights reserved.</p>
                <p>This is an automated message, please do not reply.</p>
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
  const logoUrl = getEmailLogoUrl();
  
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
        <title>Order Confirmation</title>
        <style>
          :root {
            --primary-color: #10b981;
            --primary-dark: #059669;
            --primary-light: #34d399;
            --secondary-color: #3b82f6;
            --accent-color: #f59e0b;
            --background-color: #f4f7f9;
            --text-color: #1e293b;
            --text-light: #64748b;
            --text-muted: #94a3b8;
            --card-background: #ffffff;
            --border-color: #e2e8f0;
            --border-light: #f1f5f9;
            --footer-text: #64748b;
            --gradient-primary: linear-gradient(135deg, #10b981 0%, #059669 100%);
            --gradient-secondary: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            --gradient-accent: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          }
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.7;
            color: var(--text-color);
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            margin: 0;
            padding: 20px;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          .container {
            max-width: 750px;
            margin: 0 auto;
            background-color: var(--card-background);
            border-radius: 24px;
            overflow: hidden;
            box-shadow: var(--shadow-2xl);
            border: 1px solid var(--border-color);
            position: relative;
          }
          
          .container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--gradient-primary);
          }
          .header {
            background: var(--gradient-primary);
            color: white;
            padding: 60px 40px;
            text-align: center;
            box-shadow: var(--shadow-xl);
            position: relative;
            overflow: hidden;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.2;
          }
          .logo {
            max-width: 120px;
            margin-bottom: 25px;
            border-radius: 16px;
            background: rgba(255, 255, 255, 0.1);
            padding: 12px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
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
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          }
          .order-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
          }
          .detail-item {
            padding: 20px;
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
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
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
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
            background: linear-gradient(135deg, var(--primary-color) 0%, #059669 100%);
            color: #ffffff;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 700;
            font-size: 16px;
            margin: 25px 0;
            transition: all 0.3s ease;
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .cta-button:hover {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
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
                <img src="${logoUrl}" alt="SkyElectroTech Logo" class="logo">
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
  const logoUrl = getEmailLogoUrl();
  
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
                <img src="${logoUrl}" alt="SkyElectroTech Logo" class="logo">
                <h1>New Order Received!</h1>
                <p>Order #${orderId} - ${formatCurrency(order.totalPrice)}</p>
            </div>
            <div class="content">
                <div class="alert-box">
                    <h3>New Order Alert</h3>
                    <p>A new order has been placed and requires your attention.</p>
                </div>

                <div class="order-summary">
                    <h3>Order Summary</h3>
                    <p><strong>Order ID:</strong> #${orderId}</p>
                    <p><strong>Date:</strong> ${orderDate}</p>
                    <p><strong>Customer:</strong> ${user.name} (${user.email})</p>
                    <p><strong>Payment Method:</strong> ${order.paymentInfo?.method?.charAt(0).toUpperCase() + order.paymentInfo?.method?.slice(1) || 'Not specified'}</p>
                    <p><strong>Payment Status:</strong> ${order.paymentInfo?.status === 'completed' ? 'Paid' : 'Pending'}</p>
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
  const logoUrl = getEmailLogoUrl();
  
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
                <img src="${logoUrl}" alt="SkyElectroTech Logo" class="logo">
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



// Send new order email to admin recipients
const sendNewOrderEmail = async (emailData) => {
  try {
    const { to, orderData } = emailData;
    const emailTemplate = getOrderNotificationEmailTemplate(orderData, orderData.user);
    await sendEmail({
      to: to,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });
    console.log(`New order email sent to: ${to}`);
    return { success: true };
  } catch (error) {
    console.error(`Failed to send new order email to ${emailData.to}:`, error);
    throw error;
  }
};

// Send project request email to admin recipients
const sendProjectRequestEmail = async (emailData) => {
  try {
    const { to, projectData } = emailData;
    const emailTemplate = getServiceRequestNotificationEmailTemplate(projectData);
    await sendEmail({
      to: to,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });
    console.log(`Project request email sent to: ${to}`);
    return { success: true };
  } catch (error) {
    console.error(`Failed to send project request email to ${emailData.to}:`, error);
    throw error;
  }
};

// Send return user handover email to admin recipients (for admin notification service)
const sendReturnUserHandoverAdminEmail = async (emailData) => {
  try {
    const { to, returnData } = emailData;
    const logoUrl = getEmailLogoUrl();
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: #f59e0b; color: white; padding: 30px; text-align: center; }
          .content { padding: 40px 30px; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; color: #6b7280; }
          .info-box { background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 15px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${logoUrl}" alt="SkyElectroTech" style="height: 40px; margin-bottom: 15px;">
            <h1>Return Item Handed Over</h1>
          </div>
          <div class="content">
            <p><strong>A customer has marked their return item as handed over:</strong></p>
            <div class="info-box">
              <p><strong>Order:</strong> ${returnData.orderNumber}</p>
              <p><strong>Customer:</strong> ${returnData.customerName} (${returnData.customerEmail})</p>
              <p><strong>Return Request #:</strong> ${returnData.requestNumber || 'N/A'}</p>
              <p><strong>Handed Over Date:</strong> ${new Date(returnData.handedOverAt).toLocaleDateString()}</p>
              <p><strong>Reason:</strong> ${returnData.reason}</p>
            </div>
            <p>Please verify the return item pickup and process accordingly.</p>
            <p><a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/admin/orders/${returnData.orderId}">View Order Details</a></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} SkyElectroTech. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    await sendEmail({
      to: to,
      subject: `Return Item Handed Over - ${returnData.orderNumber}`,
      html: html,
      text: `Return Item Handed Over - Order: ${returnData.orderNumber}, Customer: ${returnData.customerName}, Request #: ${returnData.requestNumber}, Date: ${new Date(returnData.handedOverAt).toLocaleDateString()}`,
    });
    console.log(`Return user handover email sent to: ${to}`);
    return { success: true };
  } catch (error) {
    console.error(`Failed to send return user handover email to ${emailData.to}:`, error);
    throw error;
  }
};

// Send return request email to admin recipients (for admin notification service)
const sendReturnRequestAdminEmail = async (emailData) => {
  try {
    const { to, returnData } = emailData;
    const logoUrl = getEmailLogoUrl();
    
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    };

    const getReasonLabel = (reason) => {
      const reasons = {
        'defective': 'Defective/Damaged Product',
        'wrong_item': 'Wrong Item Received',
        'not_as_described': 'Not as Described',
        'changed_mind': 'Changed Mind',
        'other': 'Other'
      };
      return reasons[reason] || reason;
    };
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: #dc2626; color: white; padding: 30px; text-align: center; }
          .content { padding: 40px 30px; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; color: #6b7280; }
          .info-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${logoUrl}" alt="SkyElectroTech" style="height: 40px; margin-bottom: 15px;">
            <h1>Return Request Received</h1>
          </div>
          <div class="content">
            <p><strong>A customer has requested a return:</strong></p>
            <div class="info-box">
              <p><strong>Order:</strong> ${returnData.orderNumber}</p>
              <p><strong>Customer:</strong> ${returnData.customerName} (${returnData.customerEmail})</p>
              <p><strong>Order Total:</strong> ${formatCurrency(returnData.orderTotal)}</p>
              <p><strong>Reason:</strong> ${getReasonLabel(returnData.reason)}</p>
              <p><strong>Request Date:</strong> ${new Date(returnData.requestedAt).toLocaleDateString()}</p>
            </div>
            <p><strong>Description:</strong> ${returnData.description || 'No additional description provided'}</p>
            <p>Please review and approve/reject this return request.</p>
            <p><a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/admin/orders/${returnData.orderId}">Review Return Request</a></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} SkyElectroTech. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    await sendEmail({
      to: to,
      subject: `Return Request - ${returnData.orderNumber}`,
      html: html,
      text: `Return Request - Order: ${returnData.orderNumber}, Customer: ${returnData.customerName}, Reason: ${getReasonLabel(returnData.reason)}`,
    });
    console.log(`Return request email sent to: ${to}`);
    return { success: true };
  } catch (error) {
    console.error(`Failed to send return request email to ${emailData.to}:`, error);
    throw error;
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
                <h1>New User Registration</h1>
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
                <h1>Return Request</h1>
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
        quality_issue: 'Quality Issue',
        incompatible: 'Product Not Compatible',
        missing_parts: 'Missing Parts/Accessories',
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
                <h1>Return Request Approved</h1>
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

                <h3>Next Steps :</h3>
                <ol>
                    <li>Please package the items securely in original packaging</li>
                    <li>Include all accessories, manuals, and warranty cards</li>
                    <li>Our third-party delivery partner will schedule pickup within 24-48 hours</li>
                    <li>Return shipping cost: ₹100-200 (will be deducted from refund)</li>
                    <li>Refund will be processed within 3-5 business days after receiving return</li>
                    <li>You will receive tracking details via SMS/Email</li>
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
      quality_issue: 'Quality Issue',
      incompatible: 'Product Not Compatible',
      missing_parts: 'Missing Parts/Accessories',
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
                <h1>Return Request Status</h1>
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

// Notify customer when pickup is scheduled
const sendReturnPickupScheduledEmail = async (order, user, returnRequest) => {
  const subject = `Return Pickup Scheduled - Order ${order.orderId}`;
  const html = `
    <html>
      <head><title>Return Pickup Scheduled</title></head>
      <body>
        <h1>Return Pickup Scheduled</h1>
        <p>Hi ${user.name || 'Customer'},</p>
        <p>Your return pickup has been scheduled for <strong>${new Date(returnRequest.pickupDate).toLocaleString('en-IN')}</strong>.</p>
        <p>Order: <strong>${order.orderId}</strong></p>
        <p>Return Request #: <strong>${returnRequest.requestNumber}</strong></p>
        <p>If you need to change the pickup time, please reply to this email.</p>
        <p>— SkyElectroTech</p>
      </body>
    </html>
  `;
  await sendEmail({ to: user.email, subject, html });
};

// Notify admin when user confirms handover
const sendReturnUserHandedOverEmail = async (order, user, returnRequest) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'skyelectrotechblr@gmail.com';
  const subject = `User Marked Return Handed Over - ${order.orderId}`;
  const html = `
    <html>
      <head><title>Return Handed Over</title></head>
      <body>
        <h1>Return Item Handed Over</h1>
        <p>Order: <strong>${order.orderId}</strong></p>
        <p>Customer: <strong>${user.name}</strong> (${user.email})</p>
        <p>Return Request #: <strong>${returnRequest.requestNumber}</strong></p>
        <p>The customer has marked the item as handed over to the courier.</p>
      </body>
    </html>
  `;
  await sendEmail({ to: adminEmail, subject, html });
};

// Service request confirmation email template for customer
const getServiceRequestEmailTemplate = (serviceRequest) => {
  const logoUrl = getEmailLogoUrl();
  
  const getServiceTypeDisplay = (type) => {
    const types = {
      '3d-printing': '3D Printing',
      'drone-services': 'Drone Services',
      'project-building': 'Project Building'
    };
    return types[type] || type;
  };

  return {
    subject: `Service Request Confirmation - ${getServiceTypeDisplay(serviceRequest.serviceType)}`,
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
        <title>Service Request Confirmation</title>
        <style>
          :root {
            --primary-color: #3b82f6;
            --primary-dark: #1d4ed8;
            --primary-light: #60a5fa;
            --secondary-color: #10b981;
            --accent-color: #f59e0b;
            --background-color: #f8fafc;
            --text-color: #1e293b;
            --text-light: #64748b;
            --text-muted: #94a3b8;
            --card-background: #ffffff;
            --border-color: #e2e8f0;
            --border-light: #f1f5f9;
            --footer-text: #64748b;
            --gradient-primary: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            --gradient-secondary: linear-gradient(135deg, #10b981 0%, #059669 100%);
            --gradient-accent: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.7;
            color: var(--text-color);
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            margin: 0;
            padding: 20px;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          .container {
            max-width: 650px;
            margin: 0 auto;
            background-color: var(--card-background);
            border-radius: 24px;
            overflow: hidden;
            box-shadow: var(--shadow-2xl);
            border: 1px solid var(--border-color);
            position: relative;
          }
          
          .container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--gradient-primary);
          }
          
          .header {
            background: var(--gradient-primary);
            color: white;
            padding: 50px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
            box-shadow: var(--shadow-xl);
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.2;
          }
          
          .logo {
            width: 60px;
            height: 60px;
            margin: 0 auto 20px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.1);
            padding: 8px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            position: relative;
            z-index: 1;
          }
          
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            position: relative;
            z-index: 1;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          .header p {
            margin: 10px 0 0;
            font-size: 16px;
            opacity: 0.9;
            position: relative;
            z-index: 1;
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .content h2 {
            font-size: 24px;
            color: #1e293b;
            margin-bottom: 20px;
            font-weight: 600;
          }
          
          .content p {
            margin-bottom: 20px;
            color: var(--text-light);
            font-size: 16px;
          }
          
          .request-summary {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          }
          
          .request-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
          }
          
          .detail-item {
            padding: 20px;
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
          }
          
          .detail-item strong {
            display: block;
            color: #1e293b;
            margin-bottom: 5px;
          }
          
          .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            color: white;
            background-color: #f59e0b;
          }
          
          .footer {
            text-align: center;
            padding: 30px;
            font-size: 14px;
            color: var(--footer-text);
            background: #f8fafc;
            border-top: 1px solid var(--border-color);
          }
          
          .footer p {
            margin: 5px 0;
          }
          
          @media (max-width: 600px) {
            .request-details {
              grid-template-columns: 1fr;
            }
          }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="${logoUrl}" alt="SkyElectroTech Logo" class="logo">
                <h1>Service Request Confirmed</h1>
                <p>Request #${serviceRequest.requestNumber}</p>
            </div>
            <div class="content">
                <h2>Hello ${serviceRequest.name}!</h2>
                <p>Thank you for submitting your service request. We have received your inquiry and our team will review it shortly.</p>
                
                <div class="request-summary">
                    <h3>Request Summary</h3>
                    <p><strong>Service Type:</strong> ${getServiceTypeDisplay(serviceRequest.serviceType)}</p>
                    <p><strong>Request Number:</strong> #${serviceRequest.requestNumber}</p>
                    <p><strong>Status:</strong> <span class="status-badge">Pending Review</span></p>
                </div>

                <div class="request-details">
                    <div class="detail-item">
                        <strong>Service Type</strong>
                        ${getServiceTypeDisplay(serviceRequest.serviceType)}
                    </div>
                    <div class="detail-item">
                        <strong>Request Number</strong>
                        #${serviceRequest.requestNumber}
                    </div>
                    ${serviceRequest.projectType ? `
                    <div class="detail-item">
                        <strong>Project Type</strong>
                        ${serviceRequest.projectType}
                    </div>
                    ` : ''}
                    ${serviceRequest.budget ? `
                    <div class="detail-item">
                        <strong>Budget Range</strong>
                        ${serviceRequest.budget}
                    </div>
                    ` : ''}
                    ${serviceRequest.timeline ? `
                    <div class="detail-item">
                        <strong>Timeline</strong>
                        ${serviceRequest.timeline}
                    </div>
                    ` : ''}
                </div>

                <h3>Project Description</h3>
                <div class="detail-item">
                    <p>${serviceRequest.description}</p>
                </div>

                ${serviceRequest.requirements ? `
                <h3>Additional Requirements</h3>
                <div class="detail-item">
                    <p>${serviceRequest.requirements}</p>
                </div>
                ` : ''}

                <p>Our team will review your request and contact you within 24-48 hours with a detailed quote and next steps.</p>
                
                <p>If you have any questions or need to provide additional information, please don't hesitate to contact us.</p>
            </div>
            <div class="footer">
                <p>Thank you for choosing SkyElectroTech for your project needs!</p>
                <p>© ${new Date().getFullYear()} SkyElectroTech. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `,
    text: `
    Service Request Confirmation - SkyElectroTech

    Hello ${serviceRequest.name}!

    Thank you for submitting your service request. We have received your inquiry and our team will review it shortly.

    Request Summary:
    - Service Type: ${getServiceTypeDisplay(serviceRequest.serviceType)}
    - Request Number: #${serviceRequest.requestNumber}
    - Status: Pending Review
    ${serviceRequest.projectType ? `- Project Type: ${serviceRequest.projectType}` : ''}
    ${serviceRequest.budget ? `- Budget Range: ${serviceRequest.budget}` : ''}
    ${serviceRequest.timeline ? `- Timeline: ${serviceRequest.timeline}` : ''}

    Project Description:
    ${serviceRequest.description}

    ${serviceRequest.requirements ? `
    Additional Requirements:
    ${serviceRequest.requirements}
    ` : ''}

    Our team will review your request and contact you within 24-48 hours with a detailed quote and next steps.

    If you have any questions or need to provide additional information, please don't hesitate to contact us.

    Thank you for choosing SkyElectroTech for your project needs!

    © ${new Date().getFullYear()} SkyElectroTech. All rights reserved.
    `
  };
};

// Service request notification email template for admin
const getServiceRequestNotificationEmailTemplate = (serviceRequest) => {
  const logoUrl = getEmailLogoUrl();
  
  const getServiceTypeDisplay = (type) => {
    const types = {
      '3d-printing': '3D Printing',
      'drone-services': 'Drone Services',
      'project-building': 'Project Building'
    };
    return types[type] || type;
  };

  return {
    subject: `New Service Request - ${getServiceTypeDisplay(serviceRequest.serviceType)} - ${serviceRequest.name}`,
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
        <title>New Service Request</title>
        <style>
          :root {
            --primary-color: #3b82f6;
            --primary-dark: #1d4ed8;
            --primary-light: #60a5fa;
            --secondary-color: #10b981;
            --accent-color: #f59e0b;
            --background-color: #f8fafc;
            --text-color: #1e293b;
            --text-light: #64748b;
            --text-muted: #94a3b8;
            --card-background: #ffffff;
            --border-color: #e2e8f0;
            --border-light: #f1f5f9;
            --footer-text: #64748b;
            --gradient-primary: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            --gradient-secondary: linear-gradient(135deg, #10b981 0%, #059669 100%);
            --gradient-accent: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.7;
            color: var(--text-color);
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            margin: 0;
            padding: 20px;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          .container {
            max-width: 650px;
            margin: 0 auto;
            background-color: var(--card-background);
            border-radius: 24px;
            overflow: hidden;
            box-shadow: var(--shadow-2xl);
            border: 1px solid var(--border-color);
            position: relative;
          }
          
          .container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--gradient-primary);
          }
          
          .header {
            background: var(--gradient-primary);
            color: white;
            padding: 50px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
            box-shadow: var(--shadow-xl);
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.2;
          }
          
          .logo {
            width: 60px;
            height: 60px;
            margin: 0 auto 20px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.1);
            padding: 8px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            position: relative;
            z-index: 1;
          }
          
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            position: relative;
            z-index: 1;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          .header p {
            margin: 10px 0 0;
            font-size: 16px;
            opacity: 0.9;
            position: relative;
            z-index: 1;
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .content h2 {
            font-size: 24px;
            color: #1e293b;
            margin-bottom: 20px;
            font-weight: 600;
          }
          
          .content p {
            margin-bottom: 20px;
            color: var(--text-light);
            font-size: 16px;
          }
          
          .alert-box {
            background: #dbeafe;
            border: 1px solid #3b82f6;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          
          .request-summary {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          }
          
          .customer-info {
            background: #f1f5f9;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          
          .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            color: white;
            background-color: #f59e0b;
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
                <img src="${logoUrl}" alt="SkyElectroTech Logo" class="logo">
                <h1>New Service Request</h1>
                <p>Request #${serviceRequest.requestNumber} - ${getServiceTypeDisplay(serviceRequest.serviceType)}</p>
            </div>
            <div class="content">
                <div class="alert-box">
                    <h3>New Service Request Alert</h3>
                    <p>A new service request has been submitted and requires your attention.</p>
                </div>

                <div class="request-summary">
                    <h3>Request Summary</h3>
                    <p><strong>Service Type:</strong> ${getServiceTypeDisplay(serviceRequest.serviceType)}</p>
                    <p><strong>Request Number:</strong> #${serviceRequest.requestNumber}</p>
                    <p><strong>Customer:</strong> ${serviceRequest.name} (${serviceRequest.email})</p>
                    <p><strong>Status:</strong> <span class="status-badge">Pending Review</span></p>
                </div>

                <div class="customer-info">
                    <h3>Customer Information</h3>
                    <p><strong>Name:</strong> ${serviceRequest.name}</p>
                    <p><strong>Email:</strong> ${serviceRequest.email}</p>
                    <p><strong>Phone:</strong> ${serviceRequest.phone}</p>
                    ${serviceRequest.projectType ? `<p><strong>Project Type:</strong> ${serviceRequest.projectType}</p>` : ''}
                    ${serviceRequest.budget ? `<p><strong>Budget Range:</strong> ${serviceRequest.budget}</p>` : ''}
                    ${serviceRequest.timeline ? `<p><strong>Timeline:</strong> ${serviceRequest.timeline}</p>` : ''}
                </div>

                <h3>Project Description</h3>
                <div class="customer-info">
                    <p>${serviceRequest.description}</p>
                </div>

                ${serviceRequest.requirements ? `
                <h3>Additional Requirements</h3>
                <div class="customer-info">
                    <p>${serviceRequest.requirements}</p>
                </div>
                ` : ''}

                <p>Please review this service request and take appropriate action.</p>
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/admin/services" class="cta-button">Review Service Request</a>
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
    New Service Request - SkyElectroTech

    A new service request has been submitted!

    Request Summary:
    - Service Type: ${getServiceTypeDisplay(serviceRequest.serviceType)}
    - Request Number: #${serviceRequest.requestNumber}
    - Customer: ${serviceRequest.name} (${serviceRequest.email})
    - Status: Pending Review

    Customer Information:
    - Name: ${serviceRequest.name}
    - Email: ${serviceRequest.email}
    - Phone: ${serviceRequest.phone}
    ${serviceRequest.projectType ? `- Project Type: ${serviceRequest.projectType}` : ''}
    ${serviceRequest.budget ? `- Budget Range: ${serviceRequest.budget}` : ''}
    ${serviceRequest.timeline ? `- Timeline: ${serviceRequest.timeline}` : ''}

    Project Description:
    ${serviceRequest.description}

    ${serviceRequest.requirements ? `
    Additional Requirements:
    ${serviceRequest.requirements}
    ` : ''}

    Please review this service request and take appropriate action.

    Review service request: ${process.env.CLIENT_URL || 'http://localhost:3000'}/admin/services
    `
  };
};

// Send service request confirmation email to customer
const sendServiceRequestEmail = async (serviceRequest) => {
  try {
    const emailTemplate = getServiceRequestEmailTemplate(serviceRequest);
    await sendEmail({
      to: serviceRequest.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });
    console.log(`Service request confirmation email sent to ${serviceRequest.email}`);
  } catch (error) {
    console.error(`Failed to send service request confirmation email to ${serviceRequest.email}:`, error);
  }
};



// Payment timeout email template
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

const sendPaymentTimeoutEmail = async (userEmail, data) => {
  try {
    const emailData = {
      to: userEmail,
      subject: 'Payment Timeout - Action Required',
      html: getPaymentTimeoutEmailTemplate(data)
    };
    return await sendEmail(emailData);
  } catch (error) {
    console.error('Error sending payment timeout email:', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendOTPEmail,
  sendForgotPasswordEmail,
  sendOrderConfirmationEmail,
  sendNewOrderEmail,
  sendProjectRequestEmail,
  sendReturnUserHandoverAdminEmail,
  sendOrderStatusUpdateEmail,
  sendReturnRequestEmail,
  sendReturnApprovedEmail,
  sendReturnRejectedEmail,
  sendReturnPickupScheduledEmail,
  //
  sendReturnUserHandedOverEmail,
  // new export will be appended below

  sendNewUserNotificationEmail,
  sendServiceRequestEmail,
  sendPaymentTimeoutEmail,
  getWelcomeEmailTemplate,
  getOTPEmailTemplate,
  getForgotPasswordEmailTemplate,
  getOrderConfirmationEmailTemplate,
  getOrderNotificationEmailTemplate,
  getOrderStatusUpdateEmailTemplate,
  getPaymentTimeoutEmailTemplate,
};