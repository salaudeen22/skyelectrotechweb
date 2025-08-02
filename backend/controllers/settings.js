const Settings = require('../models/Settings');
const { sendResponse, sendError, asyncHandler } = require('../utils/helpers');

// @desc    Get all settings
// @route   GET /api/settings
// @access  Private (Admin)
const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne().sort('-createdAt');
  
  // If no settings exist, create default settings
  if (!settings) {
    settings = await Settings.create({
      updatedBy: req.user._id
    });
  }

  sendResponse(res, 200, { settings }, 'Settings retrieved successfully');
});

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private (Admin)
const updateSettings = asyncHandler(async (req, res) => {
  try {
    console.log('Updating settings with data:', JSON.stringify(req.body, null, 2));
    
    const {
      storeInfo,
      shipping,
      payment,
      order,
      email,
      seo,
      socialMedia,
      maintenance,
      cache
    } = req.body;

    let settings = await Settings.findOne().sort('-createdAt');
    
    if (!settings) {
      // Create new settings if none exist
      settings = new Settings({
        updatedBy: req.user._id
      });
    }

    // Update only provided fields with better error handling
    if (storeInfo) {
      console.log('Updating storeInfo:', storeInfo);
      settings.storeInfo = { ...settings.storeInfo, ...storeInfo };
    }
    if (shipping) {
      console.log('Updating shipping:', shipping);
      settings.shipping = { ...settings.shipping, ...shipping };
    }
    if (payment) {
      console.log('Updating payment:', payment);
      settings.payment = { ...settings.payment, ...payment };
    }
    if (order) {
      console.log('Updating order:', order);
      settings.order = { ...settings.order, ...order };
    }
    if (email) {
      console.log('Updating email:', email);
      settings.email = { ...settings.email, ...email };
    }
    if (seo) {
      console.log('Updating seo:', seo);
      settings.seo = { ...settings.seo, ...seo };
    }
    if (socialMedia) {
      console.log('Updating socialMedia:', socialMedia);
      settings.socialMedia = { ...settings.socialMedia, ...socialMedia };
    }
    if (maintenance) {
      console.log('Updating maintenance:', maintenance);
      settings.maintenance = { ...settings.maintenance, ...maintenance };
    }
    if (cache) {
      console.log('Updating cache:', cache);
      settings.cache = { ...settings.cache, ...cache };
    }

    settings.updatedBy = req.user._id;
    settings.updatedAt = new Date();

    console.log('Saving settings...');
    await settings.save();
    console.log('Settings saved successfully');

    sendResponse(res, 200, { settings }, 'Settings updated successfully');
  } catch (error) {
    console.error('Error updating settings:', error);
    console.error('Error stack:', error.stack);
    sendError(res, 500, `Failed to update settings: ${error.message}`);
  }
});

// @desc    Get public settings (for frontend)
// @route   GET /api/settings/public
// @access  Public
const getPublicSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne().sort('-createdAt');
  
  // If no settings exist, create default settings
  if (!settings) {
    settings = await Settings.create({});
  }

  // Only return public settings
  const publicSettings = {
    storeInfo: settings.storeInfo,
    shipping: {
      enabled: settings.shipping.enabled,
      freeShippingThreshold: settings.shipping.freeShippingThreshold,
      defaultShippingCost: settings.shipping.defaultShippingCost,
      shippingMethods: settings.shipping.shippingMethods.filter(method => method.isActive)
    },
    payment: {
      currency: settings.payment.currency,
      currencySymbol: settings.payment.currencySymbol,
      taxRate: settings.payment.taxRate,
      paymentMethods: settings.payment.paymentMethods
    },
    order: {
      maxOrderQuantity: settings.order.maxOrderQuantity,
      lowStockThreshold: settings.order.lowStockThreshold
    },
    seo: settings.seo,
    socialMedia: settings.socialMedia,
    maintenance: {
      enabled: settings.maintenance.enabled,
      message: settings.maintenance.message
    }
  };

  sendResponse(res, 200, { settings: publicSettings }, 'Public settings retrieved successfully');
});

// @desc    Add shipping method
// @route   POST /api/settings/shipping-methods
// @access  Private (Admin)
const addShippingMethod = asyncHandler(async (req, res) => {
  const { name, cost, estimatedDays } = req.body;

  if (!name || cost === undefined) {
    return sendError(res, 400, 'Name and cost are required');
  }

  let settings = await Settings.findOne().sort('-createdAt');
  
  if (!settings) {
    settings = new Settings({
      updatedBy: req.user._id
    });
  }

  settings.shipping.shippingMethods.push({
    name,
    cost,
    estimatedDays: estimatedDays || '3-5 business days',
    isActive: true
  });

  settings.updatedBy = req.user._id;
  await settings.save();

  sendResponse(res, 201, { 
    shippingMethod: settings.shipping.shippingMethods[settings.shipping.shippingMethods.length - 1] 
  }, 'Shipping method added successfully');
});

// @desc    Update shipping method
// @route   PUT /api/settings/shipping-methods/:id
// @access  Private (Admin)
const updateShippingMethod = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, cost, estimatedDays, isActive } = req.body;

  const settings = await Settings.findOne().sort('-createdAt');
  
  if (!settings) {
    return sendError(res, 404, 'Settings not found');
  }

  const methodIndex = settings.shipping.shippingMethods.findIndex(
    method => method._id.toString() === id
  );

  if (methodIndex === -1) {
    return sendError(res, 404, 'Shipping method not found');
  }

  if (name) settings.shipping.shippingMethods[methodIndex].name = name;
  if (cost !== undefined) settings.shipping.shippingMethods[methodIndex].cost = cost;
  if (estimatedDays) settings.shipping.shippingMethods[methodIndex].estimatedDays = estimatedDays;
  if (isActive !== undefined) settings.shipping.shippingMethods[methodIndex].isActive = isActive;

  settings.updatedBy = req.user._id;
  await settings.save();

  sendResponse(res, 200, { 
    shippingMethod: settings.shipping.shippingMethods[methodIndex] 
  }, 'Shipping method updated successfully');
});

// @desc    Delete shipping method
// @route   DELETE /api/settings/shipping-methods/:id
// @access  Private (Admin)
const deleteShippingMethod = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const settings = await Settings.findOne().sort('-createdAt');
  
  if (!settings) {
    return sendError(res, 404, 'Settings not found');
  }

  const methodIndex = settings.shipping.shippingMethods.findIndex(
    method => method._id.toString() === id
  );

  if (methodIndex === -1) {
    return sendError(res, 404, 'Shipping method not found');
  }

  settings.shipping.shippingMethods.splice(methodIndex, 1);
  settings.updatedBy = req.user._id;
  await settings.save();

  sendResponse(res, 200, {}, 'Shipping method deleted successfully');
});

// @desc    Add shipping zone
// @route   POST /api/settings/shipping-zones
// @access  Private (Admin)
const addShippingZone = asyncHandler(async (req, res) => {
  const { name, countries, states, cost } = req.body;

  if (!name || cost === undefined) {
    return sendError(res, 400, 'Name and cost are required');
  }

  let settings = await Settings.findOne().sort('-createdAt');
  
  if (!settings) {
    settings = new Settings({
      updatedBy: req.user._id
    });
  }

  settings.shipping.zones.push({
    name,
    countries: countries || [],
    states: states || [],
    cost,
    isActive: true
  });

  settings.updatedBy = req.user._id;
  await settings.save();

  sendResponse(res, 201, { 
    shippingZone: settings.shipping.zones[settings.shipping.zones.length - 1] 
  }, 'Shipping zone added successfully');
});

// @desc    Update shipping zone
// @route   PUT /api/settings/shipping-zones/:id
// @access  Private (Admin)
const updateShippingZone = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, countries, states, cost, isActive } = req.body;

  const settings = await Settings.findOne().sort('-createdAt');
  
  if (!settings) {
    return sendError(res, 404, 'Settings not found');
  }

  const zoneIndex = settings.shipping.zones.findIndex(
    zone => zone._id.toString() === id
  );

  if (zoneIndex === -1) {
    return sendError(res, 404, 'Shipping zone not found');
  }

  if (name) settings.shipping.zones[zoneIndex].name = name;
  if (countries) settings.shipping.zones[zoneIndex].countries = countries;
  if (states) settings.shipping.zones[zoneIndex].states = states;
  if (cost !== undefined) settings.shipping.zones[zoneIndex].cost = cost;
  if (isActive !== undefined) settings.shipping.zones[zoneIndex].isActive = isActive;

  settings.updatedBy = req.user._id;
  await settings.save();

  sendResponse(res, 200, { 
    shippingZone: settings.shipping.zones[zoneIndex] 
  }, 'Shipping zone updated successfully');
});

// @desc    Delete shipping zone
// @route   DELETE /api/settings/shipping-zones/:id
// @access  Private (Admin)
const deleteShippingZone = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const settings = await Settings.findOne().sort('-createdAt');
  
  if (!settings) {
    return sendError(res, 404, 'Settings not found');
  }

  const zoneIndex = settings.shipping.zones.findIndex(
    zone => zone._id.toString() === id
  );

  if (zoneIndex === -1) {
    return sendError(res, 404, 'Shipping zone not found');
  }

  settings.shipping.zones.splice(zoneIndex, 1);
  settings.updatedBy = req.user._id;
  await settings.save();

  sendResponse(res, 200, {}, 'Shipping zone deleted successfully');
});

// @desc    Calculate shipping cost
// @route   POST /api/settings/calculate-shipping
// @access  Public
const calculateShippingCost = asyncHandler(async (req, res) => {
  const { subtotal, country, state, method } = req.body;

  const settings = await Settings.findOne().sort('-createdAt');
  
  if (!settings || !settings.shipping.enabled) {
    return sendResponse(res, 200, { shippingCost: 0 }, 'Shipping disabled');
  }

  let shippingCost = settings.shipping.defaultShippingCost;

  // Check for free shipping threshold
  if (subtotal >= settings.shipping.freeShippingThreshold) {
    shippingCost = 0;
  } else {
    // Check for specific shipping zones
    if (country || state) {
      const zone = settings.shipping.zones.find(zone => 
        zone.isActive && 
        (zone.countries.includes(country) || zone.states.includes(state))
      );
      
      if (zone) {
        shippingCost = zone.cost;
      }
    }

    // Check for specific shipping method
    if (method) {
      const shippingMethod = settings.shipping.shippingMethods.find(m => 
        m.isActive && m.name.toLowerCase() === method.toLowerCase()
      );
      
      if (shippingMethod) {
        shippingCost = shippingMethod.cost;
      }
    }
  }

  sendResponse(res, 200, { 
    shippingCost,
    freeShippingThreshold: settings.shipping.freeShippingThreshold,
    availableMethods: settings.shipping.shippingMethods.filter(m => m.isActive)
  }, 'Shipping cost calculated successfully');
});

module.exports = {
  getSettings,
  updateSettings,
  getPublicSettings,
  addShippingMethod,
  updateShippingMethod,
  deleteShippingMethod,
  addShippingZone,
  updateShippingZone,
  deleteShippingZone,
  calculateShippingCost
}; 