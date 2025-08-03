import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authServices } from '../services/apiServices';
import { FiMail, FiCheckCircle, FiXCircle, FiArrowLeft } from 'react-icons/fi';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    try {
      await authServices.forgotPassword(email);
      setMessage('Password reset email sent! Please check your inbox and spam folder.');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                <img 
                  src="/favicon_io (1)/android-chrome-512x512.png" 
                  alt="SkyElectroTech" 
                  className="h-10 w-auto object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div 
                  className="hidden items-center justify-center h-10 w-10 bg-blue-600 rounded-lg text-white font-bold text-xs"
                  style={{ display: 'none' }}
                >
                  SET
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Forgot Password?</h2>
            <p className="text-gray-600">No worries, we'll send you reset instructions.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="you@example.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
                <FiXCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {message && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-start">
                <FiCheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                <p className="text-sm text-green-800">{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                'Send Reset Email'
              )}
            </button>

            <div className="text-center">
              <Link
                to="/auth/login"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 inline-flex items-center"
              >
                <FiArrowLeft className="w-4 h-4 mr-1" />
                Back to Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;