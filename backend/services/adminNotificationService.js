const Settings = require('../models/Settings');
const { sendNewOrderEmail, sendReturnRequestEmail, sendProjectRequestEmail, sendReturnUserHandoverAdminEmail } = require('../utils/email');
const notificationService = require('./notificationService');

class AdminNotificationService {
  async getNotificationSettings() {
    try {
      const settings = await Settings.findOne().populate('notifications.adminRecipients', 'name email role');
      
      if (!settings) {
        // Return default settings if none exist
        return {
          adminRecipients: [],
          preferences: {
            newOrder: true,
            returnRequest: true,
            projectRequest: true
          }
        };
      }
      
      return settings.notifications;
    } catch (error) {
      console.error('Error getting notification settings:', error);
      throw error;
    }
  }

  async getAdminRecipients() {
    try {
      const notificationSettings = await this.getNotificationSettings();
      return notificationSettings.adminRecipients || [];
    } catch (error) {
      console.error('Error getting admin recipients:', error);
      return [];
    }
  }

  async shouldSendNotification(notificationType) {
    try {
      const notificationSettings = await this.getNotificationSettings();
      return notificationSettings.preferences[notificationType] !== false;
    } catch (error) {
      console.error('Error checking notification preference:', error);
      return true; // Default to sending notifications if there's an error
    }
  }

  async sendAdminEmail(notificationType, emailData) {
    try {
      // Check if this notification type is enabled
      const shouldSend = await this.shouldSendNotification(notificationType);
      if (!shouldSend) {
        console.log(`${notificationType} email notifications are disabled`);
        return { sent: 0, recipients: [] };
      }

      // Get admin recipients
      const adminRecipients = await this.getAdminRecipients();
      
      if (adminRecipients.length === 0) {
        console.log('No admin recipients configured for notifications');
        // Fallback to env admin email if no recipients configured
        const fallbackEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
        if (fallbackEmail) {
          emailData.to = fallbackEmail;
          return await this.sendEmailByType(notificationType, emailData);
        }
        return { sent: 0, recipients: [] };
      }

      let sent = 0;
      const results = [];

      // Send to each configured admin recipient
      for (const admin of adminRecipients) {
        try {
          emailData.to = admin.email;
          await this.sendEmailByType(notificationType, emailData);
          sent++;
          results.push({ email: admin.email, name: admin.name, success: true });
        } catch (error) {
          console.error(`Failed to send ${notificationType} email to ${admin.email}:`, error);
          results.push({ email: admin.email, name: admin.name, success: false, error: error.message });
        }
      }

      return { sent, recipients: results };
    } catch (error) {
      console.error(`Error sending ${notificationType} admin email:`, error);
      throw error;
    }
  }

  async sendEmailByType(notificationType, emailData) {
    switch (notificationType) {
      case 'newOrder':
        return await sendNewOrderEmail(emailData);
      case 'returnRequest':
        return await sendReturnRequestEmail(emailData);
      case 'projectRequest':
        return await sendProjectRequestEmail(emailData);
      case 'returnHandover':
        return await sendReturnUserHandoverAdminEmail(emailData);
      default:
        throw new Error(`Unknown notification type: ${notificationType}`);
    }
  }

  async sendAdminWallNotification(notificationType, notificationData) {
    try {
      // Check if this notification type is enabled
      const shouldSend = await this.shouldSendNotification(notificationType);
      if (!shouldSend) {
        console.log(`${notificationType} wall notifications are disabled`);
        return { sent: 0, recipients: [] };
      }

      // Get admin recipients
      const adminRecipients = await this.getAdminRecipients();
      
      if (adminRecipients.length === 0) {
        console.log('No admin recipients configured for wall notifications');
        return { sent: 0, recipients: [] };
      }

      let sent = 0;
      const results = [];

      // Send wall notification to each configured admin recipient
      for (const admin of adminRecipients) {
        try {
          await notificationService.createAndSendNotification(admin._id, notificationData);
          sent++;
          results.push({ userId: admin._id.toString(), name: admin.name, success: true });
        } catch (error) {
          console.error(`Failed to send ${notificationType} wall notification to ${admin.name}:`, error);
          results.push({ userId: admin._id.toString(), name: admin.name, success: false, error: error.message });
        }
      }

      return { sent, recipients: results };
    } catch (error) {
      console.error(`Error sending ${notificationType} admin wall notification:`, error);
      throw error;
    }
  }

  async sendNewOrderNotification(orderData) {
    try {
      const emailData = {
        subject: `New Order Received - ${orderData.orderNumber}`,
        orderData
      };

      const wallNotificationData = {
        title: 'New Order Received',
        message: `Order ${orderData.orderNumber} has been placed by ${orderData.user?.name || 'Guest'}`,
        type: 'system',
        priority: 'high',
        actionUrl: `/admin/orders/${orderData._id}`,
        data: {
          orderId: orderData._id,
          orderNumber: orderData.orderNumber,
          customerName: orderData.user?.name,
          totalAmount: orderData.totalAmount
        }
      };

      const [emailResult, wallResult] = await Promise.allSettled([
        this.sendAdminEmail('newOrder', emailData),
        this.sendAdminWallNotification('newOrder', wallNotificationData)
      ]);

      return {
        email: emailResult.status === 'fulfilled' ? emailResult.value : { error: emailResult.reason },
        wallNotification: wallResult.status === 'fulfilled' ? wallResult.value : { error: wallResult.reason }
      };
    } catch (error) {
      console.error('Error sending new order notification:', error);
      throw error;
    }
  }

  async sendReturnRequestNotification(returnData) {
    try {
      const emailData = {
        subject: `Return Request Received - Order ${returnData.orderNumber}`,
        returnData
      };

      const wallNotificationData = {
        title: 'Return Request Received',
        message: `Return request for order ${returnData.orderNumber}`,
        type: 'system',
        priority: 'high',
        actionUrl: `/admin/returns/${returnData._id}`,
        data: {
          returnId: returnData._id,
          orderNumber: returnData.orderNumber,
          reason: returnData.reason
        }
      };

      const [emailResult, wallResult] = await Promise.allSettled([
        this.sendAdminEmail('returnRequest', emailData),
        this.sendAdminWallNotification('returnRequest', wallNotificationData)
      ]);

      return {
        email: emailResult.status === 'fulfilled' ? emailResult.value : { error: emailResult.reason },
        wallNotification: wallResult.status === 'fulfilled' ? wallResult.value : { error: wallResult.reason }
      };
    } catch (error) {
      console.error('Error sending return request notification:', error);
      throw error;
    }
  }

  async sendProjectRequestNotification(projectData) {
    try {
      const emailData = {
        subject: `New Project Request - ${projectData.title}`,
        projectData
      };

      const wallNotificationData = {
        title: 'New Project Request',
        message: `Project request: ${projectData.title}`,
        type: 'system',
        priority: 'high',
        actionUrl: `/admin/projects/${projectData._id}`,
        data: {
          projectId: projectData._id,
          title: projectData.title,
          customerName: projectData.customerName
        }
      };

      const [emailResult, wallResult] = await Promise.allSettled([
        this.sendAdminEmail('projectRequest', emailData),
        this.sendAdminWallNotification('projectRequest', wallNotificationData)
      ]);

      return {
        email: emailResult.status === 'fulfilled' ? emailResult.value : { error: emailResult.reason },
        wallNotification: wallResult.status === 'fulfilled' ? wallResult.value : { error: wallResult.reason }
      };
    } catch (error) {
      console.error('Error sending project request notification:', error);
      throw error;
    }
  }

  async sendReturnHandoverNotification(returnData) {
    try {
      const emailData = {
        subject: `Return Item Handed Over - ${returnData.orderNumber}`,
        returnData
      };

      const wallNotificationData = {
        title: 'Return Item Handed Over',
        message: `Customer has marked return item as handed over for order ${returnData.orderNumber}`,
        type: 'system',
        priority: 'high',
        actionUrl: `/admin/orders/${returnData.orderId}`,
        data: {
          orderId: returnData.orderId,
          orderNumber: returnData.orderNumber,
          customerName: returnData.customerName,
          returnRequestId: returnData._id,
          handedOverAt: returnData.handedOverAt
        }
      };

      const [emailResult, wallResult] = await Promise.allSettled([
        this.sendAdminEmail('returnHandover', emailData),
        this.sendAdminWallNotification('returnHandover', wallNotificationData)
      ]);

      return {
        email: emailResult.status === 'fulfilled' ? emailResult.value : { error: emailResult.reason },
        wallNotification: wallResult.status === 'fulfilled' ? wallResult.value : { error: wallResult.reason }
      };
    } catch (error) {
      console.error('Error sending return handover notification:', error);
      throw error;
    }
  }

}

module.exports = new AdminNotificationService();