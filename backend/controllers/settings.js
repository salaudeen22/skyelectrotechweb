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
      cache,
      notifications
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
    if (notifications) {
      console.log('Updating notifications:', notifications);
      // Validate admin recipients limit before saving
      if (notifications.adminRecipients && notifications.adminRecipients.length > 2) {
        return sendError(res, 400, 'Maximum of 2 admin recipients allowed for notifications');
      }
      settings.notifications = { ...settings.notifications, ...notifications };
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
    heroSlider: {
      enabled: settings.heroSlider?.enabled || true,
      autoSlide: settings.heroSlider?.autoSlide || true,
      slideInterval: settings.heroSlider?.slideInterval || 7000,
      slides: settings.heroSlider?.slides?.filter(slide => slide.isActive)
        .sort((a, b) => a.order - b.order) || []
    },
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

// @desc    Get hero slides
// @route   GET /api/settings/hero-slides
// @access  Public
const getHeroSlides = asyncHandler(async (req, res) => {
  const settings = await Settings.findOne().sort('-createdAt');
  
  if (!settings) {
    return sendResponse(res, 200, { slides: [], enabled: true }, 'No slides found');
  }

  // Return only active slides, sorted by order
  const slides = settings.heroSlider?.slides?.filter(slide => slide.isActive)
    .sort((a, b) => a.order - b.order) || [];

  sendResponse(res, 200, { 
    slides,
    enabled: settings.heroSlider?.enabled || true,
    autoSlide: settings.heroSlider?.autoSlide || true,
    slideInterval: settings.heroSlider?.slideInterval || 7000
  }, 'Hero slides retrieved successfully');
});

// @desc    Add hero slide
// @route   POST /api/settings/hero-slides
// @access  Private (Admin)
const addHeroSlide = asyncHandler(async (req, res) => {
  const { title, subtitle, image, buttonText, buttonLink, gradientColor, order } = req.body;

  if (!title || !subtitle || !image || !buttonText || !buttonLink) {
    return sendError(res, 400, 'Title, subtitle, image, button text, and button link are required');
  }

  let settings = await Settings.findOne().sort('-createdAt');
  
  if (!settings) {
    settings = new Settings({
      updatedBy: req.user._id
    });
  }

  // Initialize heroSlider if it doesn't exist
  if (!settings.heroSlider) {
    settings.heroSlider = {
      enabled: true,
      autoSlide: true,
      slideInterval: 7000,
      slides: []
    };
  }

  // Generate unique ID for the slide
  const slideId = Date.now().toString();

  // Create new slide
  const newSlide = {
    id: slideId,
    title,
    subtitle,
    image,
    buttonText,
    buttonLink,
    gradientColor: gradientColor || 'from-blue-900/80 to-blue-700/60',
    isActive: true,
    order: order !== undefined ? order : (settings.heroSlider.slides.length > 0 ? 
      Math.max(...settings.heroSlider.slides.map(s => s.order || 0)) + 1 : 0),
    createdAt: new Date()
  };

  settings.heroSlider.slides.push(newSlide);
  settings.updatedBy = req.user._id;
  await settings.save();

  sendResponse(res, 201, { slide: newSlide }, 'Hero slide added successfully');
});

// @desc    Update hero slide
// @route   PUT /api/settings/hero-slides/:id
// @access  Private (Admin)
const updateHeroSlide = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, subtitle, image, buttonText, buttonLink, gradientColor, isActive, order } = req.body;

  const settings = await Settings.findOne().sort('-createdAt');
  
  if (!settings || !settings.heroSlider?.slides) {
    return sendError(res, 404, 'No slides found');
  }

  const slideIndex = settings.heroSlider.slides.findIndex(slide => slide.id === id);

  if (slideIndex === -1) {
    return sendError(res, 404, 'Slide not found');
  }

  // Update slide fields
  if (title !== undefined) settings.heroSlider.slides[slideIndex].title = title;
  if (subtitle !== undefined) settings.heroSlider.slides[slideIndex].subtitle = subtitle;
  if (image !== undefined) settings.heroSlider.slides[slideIndex].image = image;
  if (buttonText !== undefined) settings.heroSlider.slides[slideIndex].buttonText = buttonText;
  if (buttonLink !== undefined) settings.heroSlider.slides[slideIndex].buttonLink = buttonLink;
  if (gradientColor !== undefined) settings.heroSlider.slides[slideIndex].gradientColor = gradientColor;
  if (isActive !== undefined) settings.heroSlider.slides[slideIndex].isActive = isActive;
  if (order !== undefined) settings.heroSlider.slides[slideIndex].order = order;

  settings.updatedBy = req.user._id;
  await settings.save();

  sendResponse(res, 200, { 
    slide: settings.heroSlider.slides[slideIndex] 
  }, 'Hero slide updated successfully');
});

// @desc    Delete hero slide
// @route   DELETE /api/settings/hero-slides/:id
// @access  Private (Admin)
const deleteHeroSlide = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const settings = await Settings.findOne().sort('-createdAt');
  
  if (!settings || !settings.heroSlider?.slides) {
    return sendError(res, 404, 'No slides found');
  }

  const slideIndex = settings.heroSlider.slides.findIndex(slide => slide.id === id);

  if (slideIndex === -1) {
    return sendError(res, 404, 'Slide not found');
  }

  settings.heroSlider.slides.splice(slideIndex, 1);
  settings.updatedBy = req.user._id;
  await settings.save();

  sendResponse(res, 200, {}, 'Hero slide deleted successfully');
});

// @desc    Update hero slider settings
// @route   PUT /api/settings/hero-slider
// @access  Private (Admin)
const updateHeroSliderSettings = asyncHandler(async (req, res) => {
  const { enabled, autoSlide, slideInterval } = req.body;

  let settings = await Settings.findOne().sort('-createdAt');
  
  if (!settings) {
    settings = new Settings({
      updatedBy: req.user._id
    });
  }

  // Initialize heroSlider if it doesn't exist
  if (!settings.heroSlider) {
    settings.heroSlider = {
      enabled: true,
      autoSlide: true,
      slideInterval: 7000,
      slides: []
    };
  }

  // Update settings
  if (enabled !== undefined) settings.heroSlider.enabled = enabled;
  if (autoSlide !== undefined) settings.heroSlider.autoSlide = autoSlide;
  if (slideInterval !== undefined) settings.heroSlider.slideInterval = slideInterval;

  settings.updatedBy = req.user._id;
  await settings.save();

  sendResponse(res, 200, { 
    heroSlider: settings.heroSlider 
  }, 'Hero slider settings updated successfully');
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
  calculateShippingCost,
  getHeroSlides,
  addHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  updateHeroSliderSettings
}; 