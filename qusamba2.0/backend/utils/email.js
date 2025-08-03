const nodemailer = require('nodemailer');

// Create transporter based on environment
const createTransporter = () => {
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email credentials not configured. Emails will be logged but not sent.');
    // Return a test transporter that doesn't actually send emails
    return {
      sendMail: async (mailOptions) => {
        console.log('📧 Email would be sent:', {
          to: mailOptions.to,
          subject: mailOptions.subject,
          html: mailOptions.html ? 'HTML content present' : 'No HTML content'
        });
        return {
          messageId: 'test-message-id-' + Date.now(),
          accepted: [mailOptions.to],
          rejected: []
        };
      }
    };
  }

  if (process.env.NODE_ENV === 'production') {
    // Production email configuration (e.g., using Gmail, SendGrid, etc.)
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else {
    // Development configuration using Ethereal Email (fake SMTP)
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
};

// Main email sending function
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Qusamba <noreply@qusamba.com>',
      to: options.email,
      subject: options.subject,
      html: options.html || options.message,
      text: options.text || options.message
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);
    
    // In development, log preview URL (only for real nodemailer transporters)
    if (process.env.NODE_ENV !== 'production' && nodemailer.getTestMessageUrl) {
      try {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          console.log('Preview URL:', previewUrl);
        }
      } catch (urlError) {
        // Ignore preview URL errors
      }
    }
    
    return info;
  } catch (error) {
    console.error('Email sending failed:', error.message);
    
    // If email credentials are not configured, don't throw an error
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email not sent due to missing credentials, but continuing...');
      return {
        messageId: 'no-credentials-' + Date.now(),
        accepted: [options.email],
        rejected: []
      };
    }
    
    throw new Error('Email could not be sent');
  }
};

// Email templates
const emailTemplates = {
  welcome: (name, email) => ({
    subject: 'Welcome to Qusamba - Your Bangle Shopping Destination!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #d4af37; font-size: 28px; margin: 0;">Welcome to Qusamba!</h1>
          <p style="color: #666; font-size: 16px;">Your Premium Bangle Collection</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">Hello ${name}!</h2>
          <p style="color: #555; line-height: 1.6;">
            Thank you for joining Qusamba! We're excited to have you as part of our community.
          </p>
          <p style="color: #555; line-height: 1.6;">
            Explore our exquisite collection of bangles and discover the perfect pieces to complement your style.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
             style="background: #d4af37; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Start Shopping
          </a>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; color: #666; font-size: 14px;">
          <p>If you have any questions, feel free to contact us at support@qusamba.com</p>
          <p>Best regards,<br>The Qusamba Team</p>
        </div>
      </div>
    `
  }),

  passwordReset: (name, resetToken) => ({
    subject: 'Password Reset Request - Qusamba',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #d4af37; font-size: 28px; margin: 0;">Password Reset</h1>
          <p style="color: #666; font-size: 16px;">Qusamba Account Security</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">Hello ${name}!</h2>
          <p style="color: #555; line-height: 1.6;">
            We received a request to reset your password. If you didn't make this request, you can ignore this email.
          </p>
          <p style="color: #555; line-height: 1.6;">
            To reset your password, click the button below. This link will expire in 10 minutes.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}" 
             style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Reset Password
          </a>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="color: #856404; margin: 0; font-size: 14px;">
            <strong>Security Note:</strong> This link will expire in 10 minutes. If you didn't request this reset, please ignore this email.
          </p>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; color: #666; font-size: 14px;">
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 3px;">
            ${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}
          </p>
          <p>Best regards,<br>The Qusamba Team</p>
        </div>
      </div>
    `
  }),

  orderConfirmation: (name, order) => ({
    subject: `Order Confirmation - #${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #d4af37; font-size: 28px; margin: 0;">Order Confirmed!</h1>
          <p style="color: #666; font-size: 16px;">Thank you for your purchase</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">Hello ${name}!</h2>
          <p style="color: #555; line-height: 1.6;">
            Your order has been confirmed and is being processed. Here are your order details:
          </p>
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Order Number:</strong> #${order.orderNumber}</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
            <p><strong>Status:</strong> ${order.status}</p>
          </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${order._id}" 
             style="background: #d4af37; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Track Order
          </a>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; color: #666; font-size: 14px;">
          <p>We'll send you another email when your order ships.</p>
          <p>Best regards,<br>The Qusamba Team</p>
        </div>
      </div>
    `
  }),

  paymentConfirmation: (name, order) => ({
    subject: `Payment Confirmed - Order #${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #28a745; font-size: 28px; margin: 0;">Payment Confirmed!</h1>
          <p style="color: #666; font-size: 16px;">Your payment has been successfully processed</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">Hello ${name}!</h2>
          <p style="color: #555; line-height: 1.6;">
            Great news! Your payment has been confirmed and your order is now being processed.
          </p>
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Order Number:</strong> #${order.orderNumber}</p>
            <p><strong>Payment Date:</strong> ${new Date(order.payment?.paidAt || Date.now()).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
            <p><strong>Payment Method:</strong> ${order.payment?.method === 'razorpay' ? 'Razorpay (Card/UPI/Net Banking)' : order.payment?.method}</p>
            <p><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">${order.status === 'confirmed' ? 'Order Confirmed' : order.status}</span></p>
          </div>
        </div>
        
        <div style="background: #e8f5e8; border: 1px solid #28a745; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="color: #155724; margin: 0; font-size: 14px;">
            <strong>Next Steps:</strong> We'll start processing your order immediately. You'll receive another email with tracking details once your order ships.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${order._id}" 
             style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            View Order Status
          </a>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; color: #666; font-size: 14px;">
          <p>Thank you for choosing Qusamba! If you have any questions, contact us at support@qusamba.com</p>
          <p>Best regards,<br>The Qusamba Team</p>
        </div>
      </div>
    `
  }),

  orderShipped: (name, order, trackingNumber) => ({
    subject: `Order Shipped - #${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #28a745; font-size: 28px; margin: 0;">Order Shipped!</h1>
          <p style="color: #666; font-size: 16px;">Your order is on its way</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">Hello ${name}!</h2>
          <p style="color: #555; line-height: 1.6;">
            Great news! Your order has been shipped and is on its way to you.
          </p>
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Order Number:</strong> #${order.orderNumber}</p>
            <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
            <p><strong>Shipped Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${order._id}" 
             style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Track Package
          </a>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; color: #666; font-size: 14px;">
          <p>Expected delivery: 3-5 business days</p>
          <p>Best regards,<br>The Qusamba Team</p>
        </div>
      </div>
    `
  })
};

// Helper functions for specific email types
const sendWelcomeEmail = async (email, name) => {
  const template = emailTemplates.welcome(name, email);
  return await sendEmail({
    email,
    subject: template.subject,
    html: template.html
  });
};

const sendPasswordResetEmail = async (email, name, resetToken) => {
  const template = emailTemplates.passwordReset(name, resetToken);
  return await sendEmail({
    email,
    subject: template.subject,
    html: template.html
  });
};

const sendOrderConfirmationEmail = async (email, name, order) => {
  const template = emailTemplates.orderConfirmation(name, order);
  return await sendEmail({
    email,
    subject: template.subject,
    html: template.html
  });
};

const sendPaymentConfirmationEmail = async (email, name, order) => {
  const template = emailTemplates.paymentConfirmation(name, order);
  return await sendEmail({
    email,
    subject: template.subject,
    html: template.html
  });
};

const sendOrderShippedEmail = async (email, name, order, trackingNumber) => {
  const template = emailTemplates.orderShipped(name, order, trackingNumber);
  return await sendEmail({
    email,
    subject: template.subject,
    html: template.html
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  sendPaymentConfirmationEmail,
  sendOrderShippedEmail,
  emailTemplates
};
