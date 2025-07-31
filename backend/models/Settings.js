const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // Store Information
  storeInfo: {
    name: {
      type: String,
      default: 'SkyElectroTech'
    },
    description: {
      type: String,
      default: 'Your trusted electronics store'
    },
    email: {
      type: String,
      default: 'admin@skyelectro.tech'
    },
    phone: {
      type: String,
      default: '+91 1234567890'
    },
    address: {
      type: String,
      default: 'Your store address'
    },
    logo: {
      type: String,
      default: ''
    },
    favicon: {
      type: String,
      default: ''
    }
  },

  // Shipping Settings
  shipping: {
    enabled: {
      type: Boolean,
      default: true
    },
    freeShippingThreshold: {
      type: Number,
      default: 1000
    },
    defaultShippingCost: {
      type: Number,
      default: 50
    },
    shippingMethods: [{
      name: {
        type: String,
        required: true
      },
      cost: {
        type: Number,
        required: true
      },
      estimatedDays: {
        type: String,
        default: '3-5 business days'
      },
      isActive: {
        type: Boolean,
        default: true
      }
    }],
    zones: [{
      name: {
        type: String,
        required: true
      },
      countries: [String],
      states: [String],
      cost: {
        type: Number,
        required: true
      },
      isActive: {
        type: Boolean,
        default: true
      }
    }]
  },

  // Payment Settings
  payment: {
    currency: {
      type: String,
      default: 'INR'
    },
    currencySymbol: {
      type: String,
      default: '₹'
    },
    taxRate: {
      type: Number,
      default: 18
    },
    paymentMethods: {
      cod: {
        enabled: {
          type: Boolean,
          default: true
        },
        minOrderAmount: {
          type: Number,
          default: 0
        },
        maxOrderAmount: {
          type: Number,
          default: 5000
        }
      },
      online: {
        enabled: {
          type: Boolean,
          default: true
        },
        methods: [{
          type: String,
          enum: ['card', 'upi', 'netbanking', 'wallet']
        }]
      }
    }
  },

  // Order Settings
  order: {
    autoConfirm: {
      type: Boolean,
      default: false
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    maxOrderQuantity: {
      type: Number,
      default: 10
    },
    lowStockThreshold: {
      type: Number,
      default: 5
    },
    orderPrefix: {
      type: String,
      default: 'SKY'
    }
  },

  // Email Settings
  email: {
    orderConfirmation: {
      enabled: {
        type: Boolean,
        default: true
      },
      subject: {
        type: String,
        default: 'Order Confirmation - {orderId}'
      }
    },
    orderStatusUpdate: {
      enabled: {
        type: Boolean,
        default: true
      },
      subject: {
        type: String,
        default: 'Order Status Update - {orderId}'
      }
    },
    welcomeEmail: {
      enabled: {
        type: Boolean,
        default: true
      },
      subject: {
        type: String,
        default: 'Welcome to {storeName}'
      }
    }
  },

  // SEO Settings
  seo: {
    metaTitle: {
      type: String,
      default: 'SkyElectroTech - Your Electronics Store'
    },
    metaDescription: {
      type: String,
      default: 'Find the best electronics at great prices'
    },
    metaKeywords: {
      type: String,
      default: 'electronics, gadgets, tech, online store'
    },
    googleAnalytics: {
      type: String,
      default: ''
    },
    facebookPixel: {
      type: String,
      default: ''
    }
  },

  // Social Media
  socialMedia: {
    facebook: {
      type: String,
      default: ''
    },
    twitter: {
      type: String,
      default: ''
    },
    instagram: {
      type: String,
      default: ''
    },
    linkedin: {
      type: String,
      default: ''
    },
    youtube: {
      type: String,
      default: ''
    }
  },

  // Maintenance Mode
  maintenance: {
    enabled: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: 'We are currently under maintenance. Please check back soon.'
    },
    allowedIPs: [String]
  },

  // Cache Settings
  cache: {
    enabled: {
      type: Boolean,
      default: true
    },
    duration: {
      type: Number,
      default: 3600 // 1 hour in seconds
    }
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
settingsSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Settings', settingsSchema); 