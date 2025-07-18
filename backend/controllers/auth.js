const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { sendResponse, sendError, asyncHandler } = require('../utils/helpers');
const { sendWelcomeEmail, sendForgotPasswordEmail, sendOTPEmail } = require('../utils/email');
const crypto = require('crypto');
const passport = require('../config/passport');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, googleId, role = 'user' } = req.body;

  // Validate that either password or googleId is provided
  if (!password && !googleId) {
    return sendError(res, 400, 'Either password or Google ID is required');
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return sendError(res, 400, 'User already exists with this email');
  }

  // Prepare user data
  const userData = {
    name,
    email,
    role: role === 'admin' ? 'user' : role // Prevent admin creation via registration
  };

  // Add password or googleId
  if (password) {
    userData.password = password;
  }
  
  if (googleId) {
    userData.googleId = googleId;
    userData.emailVerified = true; // Google users are pre-verified
  }

  // Create user
  const user = await User.create(userData);

  // Generate token
  const token = generateToken(user._id);

  // Remove password from response
  user.password = undefined;

  // Send welcome email (don't wait for it to complete)
  try {
    await sendWelcomeEmail(user.email, user.name);
  } catch (emailError) {
    console.error('Failed to send welcome email:', emailError);
    // Don't fail registration if email fails
  }

  sendResponse(res, 201, {
    user,
    token
  }, 'User registered successfully');
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists and include password
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return sendError(res, 401, 'Invalid email or password');
  }

  // Check if account is active
  if (!user.isActive) {
    return sendError(res, 401, 'Account is deactivated. Please contact administrator.');
  }

  // Check password
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return sendError(res, 401, 'Invalid email or password');
  }

  // Update last login
  await user.updateLastLogin();

  // Generate token
  const token = generateToken(user._id);

  // Remove password from response
  user.password = undefined;

  sendResponse(res, 200, {
    user,
    token
  }, 'Login successful');
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  // In a real application, you might want to blacklist the token
  // For now, we'll just send a success response
  sendResponse(res, 200, null, 'Logout successful');
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = req.user;
  sendResponse(res, 200, { user }, 'User profile retrieved successfully');
});

// @desc    Request OTP for profile update
// @route   POST /api/auth/profile/request-otp
// @access  Private
const requestProfileUpdateOTP = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  // Generate OTP
  const otp = user.generateOTP('profile_update');
  await user.save();

  // Send OTP email
  try {
    await sendOTPEmail(user.email, user.name, otp, 'profile_update');
    sendResponse(res, 200, null, 'OTP sent to your email. Please check and verify to update your profile.');
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    user.clearOTP();
    await user.save();
    return sendError(res, 500, 'Failed to send OTP. Please try again.');
  }
});

// @desc    Update user profile with OTP verification
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { otp, ...profileData } = req.body;

  const user = await User.findById(req.user._id);

  // Verify OTP
  if (!user.verifyOTP(otp, 'profile_update')) {
    return sendError(res, 400, 'Invalid or expired OTP. Please request a new OTP.');
  }

  // Clear OTP after successful verification
  user.clearOTP();

  const allowedFields = ['name', 'phone', 'address'];
  const updates = {};

  // Only include allowed fields
  allowedFields.forEach(field => {
    if (profileData[field] !== undefined) {
      updates[field] = profileData[field];
    }
  });

  // Update user profile
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  );

  sendResponse(res, 200, { user: updatedUser }, 'Profile updated successfully');
});

// @desc    Add new address
// @route   POST /api/auth/addresses
// @access  Private
const addAddress = asyncHandler(async (req, res) => {
  const { name, street, city, state, country, zipCode, isDefault } = req.body;

  const user = await User.findById(req.user._id);

  // If this is set as default, unset all other default addresses
  if (isDefault) {
    user.addresses.forEach(addr => {
      addr.isDefault = false;
    });
  }

  // Add new address
  const newAddress = {
    name,
    street,
    city,
    state,
    country,
    zipCode,
    isDefault: isDefault || user.addresses.length === 0 // First address is default by default
  };

  user.addresses.push(newAddress);
  await user.save();

  const addedAddress = user.addresses[user.addresses.length - 1];
  sendResponse(res, 201, { address: addedAddress }, 'Address added successfully');
});

// @desc    Update address
// @route   PUT /api/auth/addresses/:addressId
// @access  Private
const updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const { name, street, city, state, country, zipCode, isDefault } = req.body;

  const user = await User.findById(req.user._id);
  const addressIndex = user.addresses.findIndex(addr => addr.id === addressId);

  if (addressIndex === -1) {
    return sendError(res, 404, 'Address not found');
  }

  // If this is set as default, unset all other default addresses
  if (isDefault) {
    user.addresses.forEach(addr => {
      addr.isDefault = false;
    });
  }

  // Update address
  const address = user.addresses[addressIndex];
  address.name = name || address.name;
  address.street = street || address.street;
  address.city = city || address.city;
  address.state = state || address.state;
  address.country = country || address.country;
  address.zipCode = zipCode || address.zipCode;
  address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

  await user.save();

  sendResponse(res, 200, { address }, 'Address updated successfully');
});

// @desc    Delete address
// @route   DELETE /api/auth/addresses/:addressId
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const user = await User.findById(req.user._id);
  const addressIndex = user.addresses.findIndex(addr => addr.id === addressId);

  if (addressIndex === -1) {
    return sendError(res, 404, 'Address not found');
  }

  const wasDefault = user.addresses[addressIndex].isDefault;

  // Remove address
  user.addresses.splice(addressIndex, 1);

  // If deleted address was default and there are other addresses, make the first one default
  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();

  sendResponse(res, 200, null, 'Address deleted successfully');
});

// @desc    Get all addresses
// @route   GET /api/auth/addresses
// @access  Private
const getAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  sendResponse(res, 200, { addresses: user.addresses }, 'Addresses retrieved successfully');
});

// @desc    Set default address
// @route   PUT /api/auth/addresses/:addressId/default
// @access  Private
const setDefaultAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const user = await User.findById(req.user._id);
  const addressIndex = user.addresses.findIndex(addr => addr.id === addressId);

  if (addressIndex === -1) {
    return sendError(res, 404, 'Address not found');
  }

  // Unset all default addresses
  user.addresses.forEach(addr => {
    addr.isDefault = false;
  });

  // Set new default
  user.addresses[addressIndex].isDefault = true;

  await user.save();

  sendResponse(res, 200, { address: user.addresses[addressIndex] }, 'Default address updated successfully');
});

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  const isPasswordMatch = await user.comparePassword(currentPassword);
  if (!isPasswordMatch) {
    return sendError(res, 400, 'Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  sendResponse(res, 200, null, 'Password changed successfully');
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return sendError(res, 404, 'User not found with this email');
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save();

  // Send password reset email
  try {
    await sendForgotPasswordEmail(user.email, user.name, resetToken);
    sendResponse(res, 200, null, 'Password reset email sent successfully');
  } catch (emailError) {
    console.error('Failed to send password reset email:', emailError);
    
    // Reset the token fields if email fails
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    
    return sendError(res, 500, 'Failed to send password reset email. Please try again.');
  }
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  // Hash token to compare with stored token
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return sendError(res, 400, 'Invalid or expired reset token');
  }

  // Set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendResponse(res, 200, null, 'Password reset successful');
});

// @desc    Google OAuth
// @route   GET /api/auth/google
// @access  Public
const googleAuth = (req, res, next) => {
  // Check if Google OAuth is configured
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return sendError(res, 500, 'Google OAuth is not configured');
  }
  
  // Import passport here to avoid initialization issues
  const passport = require('../config/passport');
  return passport.authenticate('google', {
    scope: ['profile', 'email']
  })(req, res, next);
};

// @desc    Google OAuth Callback
// @route   GET /api/auth/google/callback
// @access  Public
const googleCallback = (req, res, next) => {
  // Check if Google OAuth is configured
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_not_configured`);
  }

  const passport = require('../config/passport');
  passport.authenticate('google', { session: false }, async (err, user, info) => {
    if (err) {
      console.error('Google OAuth Error:', err);
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_error`);
    }

    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }

    try {
      // Generate JWT token
      const token = generateToken(user._id);
      
      // Update last login
      await user.updateLastLogin();

      // Redirect to frontend with token
      const redirectUrl = `${process.env.CLIENT_URL}/auth/callback?token=${token}`;
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('Token generation error:', error);
      return res.redirect(`${process.env.CLIENT_URL}/login?error=token_error`);
    }
  })(req, res, next);
};

// @desc    Link Google account to existing user
// @route   POST /api/auth/link-google
// @access  Private
const linkGoogleAccount = asyncHandler(async (req, res) => {
  const { googleToken } = req.body;
  
  if (!googleToken) {
    return sendError(res, 400, 'Google token is required');
  }

  // Here you would verify the Google token with Google's API
  // For now, this is a placeholder
  sendResponse(res, 200, null, 'Google account linked successfully');
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  requestProfileUpdateOTP,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  getAddresses,
  setDefaultAddress,
  changePassword,
  forgotPassword,
  resetPassword,
  googleAuth,
  googleCallback,
  linkGoogleAccount
};
