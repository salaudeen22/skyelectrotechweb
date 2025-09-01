const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // Store Information
  storeInfo: {
    name: {
      type: String,
      default: 'Sky Electro Tech'
    },
    description: {
      type: String,
      default: 'Electronics & Components Store'
    },
    email: {
      type: String,
      default: 'info@skyelectro.tech'
    },
    phone: {
      type: String,
      default: '+91 98765 43210'
    },
    address: {
      type: String,
      default: 'No. 123, Electronics Street, Bangalore, Karnataka - 560000'
    },
    gstin: {
      type: String,
      default: '27AABCS1234Z1Z5'
    },
    city: {
      type: String,
      default: 'Bangalore'
    },
    state: {
      type: String,
      default: 'Karnataka'
    },
    pincode: {
      type: String,
      default: '560000'
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
    estimatedDeliveryDays: {
      type: Number,
      default: 3
    },
    shippingFees: {
      type: Array,
      default: []
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
    },
    autoCancelMinutes: {
      type: Number,
      default: 30
    },
    allowGuestCheckout: {
      type: Boolean,
      default: true
    },
    requirePhoneNumber: {
      type: Boolean,
      default: true
    },
    requireAddress: {
      type: Boolean,
      default: true
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
    },
    fromName: {
      type: String,
      default: 'SkyElectroTech'
    },
    fromEmail: {
      type: String,
      default: 'noreply@skyelectro.tech'
    },
    shippingUpdates: {
      type: Boolean,
      default: true
    },
    marketingEmails: {
      type: Boolean,
      default: false
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
    },
    googleAnalyticsId: {
      type: String,
      default: ''
    },
    facebookPixelId: {
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

  // Hero Slider Settings
  heroSlider: {
    enabled: {
      type: Boolean,
      default: true
    },
    autoSlide: {
      type: Boolean,
      default: true
    },
    slideInterval: {
      type: Number,
      default: 7000 // milliseconds
    },
    slides: [{
      id: {
        type: String,
        required: true
      },
      title: {
        type: String,
        required: true,
        maxlength: 100
      },
      subtitle: {
        type: String,
        required: true,
        maxlength: 200
      },
      image: {
        type: String,
        required: true
      },
      buttonText: {
        type: String,
        required: true,
        maxlength: 50
      },
      buttonLink: {
        type: String,
        required: true
      },
      gradientColor: {
        type: String,
        default: 'from-blue-900/80 to-blue-700/60'
      },
      isActive: {
        type: Boolean,
        default: true
      },
      order: {
        type: Number,
        default: 0
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
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