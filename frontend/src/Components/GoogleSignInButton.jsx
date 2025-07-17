import React, { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { FaGoogle } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

const GoogleSignInButton = ({ text = "Sign in with Google", className = "" }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await googleLogin();
      if (result.success) {
        // Role-based navigation
        const user = result.user;
        if (user && (user.role === 'admin' || user.role === 'employee')) {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className={`w-full inline-flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-3"></div>
          <span>Signing in...</span>
        </>
      ) : (
        <>
          <FaGoogle className="h-5 w-5 mr-3 text-red-500" />
          <span>{text}</span>
        </>
      )}
    </button>
  );
};

export default GoogleSignInButton;
