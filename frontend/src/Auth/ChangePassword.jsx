import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FiLock, FiEye, FiEyeOff, FiCheck, FiArrowLeft, FiXCircle } from 'react-icons/fi';

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

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="mb-6">
            <button onClick={handleCancel} className="text-sm font-medium text-blue-600 hover:text-blue-500 inline-flex items-center mb-4">
              <FiArrowLeft className="w-4 h-4 mr-1" />
              Back to Profile
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Change Password</h2>
            <p className="text-gray-600">Update your password for enhanced account security</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.api && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
                <FiXCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                <p className="text-sm text-red-800">{errors.api}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type={showPasswords.current ? 'text' : 'password'} 
                  name="currentPassword" 
                  value={formData.currentPassword} 
                  onChange={handleInputChange} 
                  className={`w-full pl-10 pr-10 py-2.5 border ${errors.currentPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                  placeholder="Enter current password"
                />
                <button 
                  type="button" 
                  onClick={() => togglePasswordVisibility('current')} 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.current ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
              </div>
              {errors.currentPassword && <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type={showPasswords.new ? 'text' : 'password'} 
                  name="newPassword" 
                  value={formData.newPassword} 
                  onChange={handleInputChange} 
                  className={`w-full pl-10 pr-10 py-2.5 border ${errors.newPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                  placeholder="Enter new password"
                />
                <button 
                  type="button" 
                  onClick={() => togglePasswordVisibility('new')} 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
              </div>
              {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type={showPasswords.confirm ? 'text' : 'password'} 
                  name="confirmPassword" 
                  value={formData.confirmPassword} 
                  onChange={handleInputChange} 
                  className={`w-full pl-10 pr-10 py-2.5 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                  placeholder="Confirm new password"
                />
                <button 
                  type="button" 
                  onClick={() => togglePasswordVisibility('confirm')} 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
                {formData.confirmPassword && formData.newPassword === formData.confirmPassword && !errors.confirmPassword && (
                  <div className="absolute inset-y-0 right-10 pr-3 flex items-center pointer-events-none">
                    <FiCheck className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Password Requirements</h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {requirementList.map((req, index) => (
                  <li key={index} className={`flex items-center ${req.valid ? 'text-green-600' : 'text-gray-600'}`}>
                    <FiCheck className="w-3.5 h-3.5 mr-2" />
                    {req.text}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;