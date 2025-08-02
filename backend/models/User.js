const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: function() {
      // Password is required only if googleId is not present
      return !this.googleId;
    },
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  googleId: {
    type: String,
    sparse: true // Allows multiple null values
  },
  role: {
    type: String,
    enum: ['user', 'employee', 'admin'],
    default: 'user'
  },
  avatar: {
    public_id: String,
    url: String
  },
  phone: {
    type: String,
    maxlength: [15, 'Phone number cannot exceed 15 characters']
  },
  addresses: [{
    id: {
      type: String,
      required: true,
      default: () => new mongoose.Types.ObjectId().toString()
    },
    name: {
      type: String,
      required: true,
      maxlength: [50, 'Address name cannot exceed 50 characters']
    },
    street: {
      type: String,
      required: true,
      maxlength: [100, 'Street address cannot exceed 100 characters']
    },
    city: {
      type: String,
      required: true,
      maxlength: [50, 'City cannot exceed 50 characters']
    },
    state: {
      type: String,
      required: true,
      maxlength: [50, 'State cannot exceed 50 characters']
    },
    country: {
      type: String,
      required: true,
      maxlength: [50, 'Country cannot exceed 50 characters']
    },
    zipCode: {
      type: String,
      required: true,
      maxlength: [10, 'ZIP code cannot exceed 10 characters']
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Legacy address field for backward compatibility
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  otpCode: String,
  otpExpire: Date,
  otpPurpose: {
    type: String,
    enum: ['profile_update', 'phone_verification', 'email_verification'],
    default: 'profile_update'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  if (!this.password) {
    return false; // For Google OAuth users without password
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

// Update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Generate OTP for verification
userSchema.methods.generateOTP = function(purpose = 'profile_update') {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  this.otpCode = otp;
  this.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  this.otpPurpose = purpose;
  return otp;
};

// Verify OTP
userSchema.methods.verifyOTP = function(otp, purpose = 'profile_update') {
  if (!this.otpCode || !this.otpExpire) {
    return false;
  }
  
  if (this.otpExpire < Date.now()) {
    return false; // OTP expired
  }
  
  if (this.otpCode !== otp) {
    return false; // Invalid OTP
  }
  
  if (this.otpPurpose !== purpose) {
    return false; // Wrong purpose
  }
  
  return true;
};

// Clear OTP
userSchema.methods.clearOTP = function() {
  this.otpCode = undefined;
  this.otpExpire = undefined;
  this.otpPurpose = undefined;
};

module.exports = mongoose.model('User', userSchema);
