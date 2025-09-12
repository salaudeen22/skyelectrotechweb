import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FiLock, FiEye, FiEyeOff, FiCheck, FiArrowLeft, FiXCircle, FiShield, FiKey, FiSave } from 'react-icons/fi';

const ChangePassword = () => {
  const { changePassword } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!formData.newPassword) newErrors.newPassword = 'New password is required';
    else if (formData.newPassword.length < 8) newErrors.newPassword = 'Password must be at least 8 characters';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your new password';
    else if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (formData.currentPassword && formData.currentPassword === formData.newPassword) newErrors.newPassword = 'New password must be different from the current one';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const result = await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      if (result.success) {
        navigate('/user/profile', { state: { success: 'Password changed successfully!' } });
      } else {
        setErrors({ api: result.message || 'Failed to change password.' });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setErrors({ api: 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => navigate('/user/profile');
  
  const requirementList = [
    { text: 'At least 8 characters long', valid: formData.newPassword.length >= 8 },
    { text: 'An uppercase letter (A-Z)', valid: /[A-Z]/.test(formData.newPassword) },
    { text: 'A lowercase letter (a-z)', valid: /[a-z]/.test(formData.newPassword) },
    { text: 'A number (0-9)', valid: /[0-9]/.test(formData.newPassword) },
    { text: 'A special character (!, @, #, etc.)', valid: /[^A-Za-z0-9]/.test(formData.newPassword) },
  ];

  const strengthScore = requirementList.filter(req => req.valid).length;
  const strengthText = strengthScore < 2 ? 'Weak' : strengthScore < 4 ? 'Fair' : 'Strong';
  const strengthColor = strengthScore < 2 ? 'red' : strengthScore < 4 ? 'yellow' : 'green';

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-3 sm:px-4 py-6 sm:py-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-60 h-60 sm:w-80 sm:h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-60 h-60 sm:w-80 sm:h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-60 h-60 sm:w-80 sm:h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-lg w-full mx-auto">
        {/* Card Container */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="mb-8">
              <button 
                onClick={handleCancel} 
                className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 inline-flex items-center mb-4 sm:mb-6 transition-colors duration-200 group"
              >
                <FiArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                Back to Profile
              </button>
              
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <FiKey className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 h-5 w-5 sm:h-6 sm:w-6 bg-green-500 rounded-full flex items-center justify-center">
                      <FiShield className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                    </div>
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">Change Password</h1>
                <p className="text-gray-600 text-sm sm:text-lg leading-relaxed">
                  Update your password to keep your account secure
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {errors.api && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-start space-x-3 animate-in slide-in-from-top-2 duration-300">
                  <FiXCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Error</p>
                    <p className="text-sm text-red-700 mt-1">{errors.api}</p>
                  </div>
                </div>
              )}

              {/* Current Password */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700">Current Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiLock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input 
                    type={showPasswords.current ? 'text' : 'password'} 
                    name="currentPassword" 
                    value={formData.currentPassword} 
                    onChange={handleInputChange} 
                    className={`w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 border-2 ${errors.currentPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'} rounded-xl focus:ring-4 transition-all duration-200 bg-white/50 backdrop-blur-sm text-sm sm:text-base`}
                    placeholder="Enter your current password"
                  />
                  <button 
                    type="button" 
                    onClick={() => togglePasswordVisibility('current')} 
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPasswords.current ? <FiEyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <FiEye className="h-4 w-4 sm:h-5 sm:w-5" />}
                  </button>
                </div>
                {errors.currentPassword && <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>}
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700">New Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiLock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input 
                    type={showPasswords.new ? 'text' : 'password'} 
                    name="newPassword" 
                    value={formData.newPassword} 
                    onChange={handleInputChange} 
                    className={`w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 border-2 ${errors.newPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'} rounded-xl focus:ring-4 transition-all duration-200 bg-white/50 backdrop-blur-sm text-sm sm:text-base`}
                    placeholder="Enter your new password"
                  />
                  <button 
                    type="button" 
                    onClick={() => togglePasswordVisibility('new')} 
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPasswords.new ? <FiEyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <FiEye className="h-4 w-4 sm:h-5 sm:w-5" />}
                  </button>
                </div>
                {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700">Confirm New Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiLock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input 
                    type={showPasswords.confirm ? 'text' : 'password'} 
                    name="confirmPassword" 
                    value={formData.confirmPassword} 
                    onChange={handleInputChange} 
                    className={`w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 border-2 ${errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'} rounded-xl focus:ring-4 transition-all duration-200 bg-white/50 backdrop-blur-sm text-sm sm:text-base`}
                    placeholder="Confirm your new password"
                  />
                  <button 
                    type="button" 
                    onClick={() => togglePasswordVisibility('confirm')} 
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPasswords.confirm ? <FiEyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <FiEye className="h-4 w-4 sm:h-5 sm:w-5" />}
                  </button>
                  {formData.confirmPassword && formData.newPassword === formData.confirmPassword && !errors.confirmPassword && (
                    <div className="absolute inset-y-0 right-12 pr-4 flex items-center pointer-events-none">
                      <FiCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                    </div>
                  )}
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>

              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-900">Password Strength</h4>
                    <span className={`text-xs sm:text-sm font-medium px-2 py-1 rounded-full ${
                      strengthColor === 'red' ? 'bg-red-100 text-red-700' :
                      strengthColor === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {strengthText}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        strengthColor === 'red' ? 'bg-red-500' :
                        strengthColor === 'yellow' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${(strengthScore / 5) * 100}%` }}
                    ></div>
                  </div>
                  <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700">
                    {requirementList.map((req, index) => (
                      <li key={index} className={`flex items-center ${req.valid ? 'text-green-600' : 'text-gray-500'}`}>
                        <FiCheck className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${req.valid ? 'text-green-500' : 'text-gray-400'}`} />
                        {req.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0 pt-3 sm:pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full sm:flex-1 py-3 sm:py-4 px-4 sm:px-6 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <FiSave className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Update Password
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 sm:mt-8">
          <p className="text-xs sm:text-sm text-gray-500">
            Forgot your password? <Link to="/auth/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium">Reset it here</Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default ChangePassword;