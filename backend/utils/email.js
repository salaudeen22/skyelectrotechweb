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

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendForgotPasswordEmail,
  getWelcomeEmailTemplate,
  getForgotPasswordEmailTemplate,
};