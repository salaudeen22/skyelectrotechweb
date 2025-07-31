const ActivityLog = require('../models/ActivityLog');

const logActivity = (action, resource) => {
  return async (req, res, next) => {
    // Store original res.json to intercept response
    const originalJson = res.json;
    
    res.json = function(data) {
      // Only log successful operations (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        // Log activity asynchronously to avoid blocking response
        setImmediate(async () => {
          try {
            await ActivityLog.create({
              user: req.user._id,
              action,
              resource,
              resourceId: data.data?._id || req.params.id,
              description: generateDescription(action, resource, req.user.name),
              metadata: {
                method: req.method,
                url: req.originalUrl,
                params: req.params,
                body: sanitizeBody(req.body)
              },
              ipAddress: req.ip || req.connection.remoteAddress,
              userAgent: req.get('User-Agent')
            });
          } catch (error) {
            console.error('Activity logging error:', error);
          }
        });
      }
      
      // Call original json method
      originalJson.call(this, data);
    };
    
    next();
  };
};

const generateDescription = (action, resource, userName) => {
  const actionMap = {
    login: 'logged in',
    logout: 'logged out',
    product_created: 'created a product',
    product_updated: 'updated a product',
    product_deleted: 'deleted a product',
    order_status_updated: 'updated order status',
    user_created: 'created a user',
    user_updated: 'updated a user',
    user_deleted: 'deleted a user',
    category_created: 'created a category',
    category_updated: 'updated a category',
    category_deleted: 'deleted a category'
  };
  
  return `${userName} ${actionMap[action] || action} ${resource}`;
};

const sanitizeBody = (body) => {
  const sanitized = { ...body };
  // Remove sensitive information
  delete sanitized.password;
  delete sanitized.confirmPassword;
  delete sanitized.token;
  return sanitized;
};

module.exports = logActivity;
