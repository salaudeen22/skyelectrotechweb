import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Cookies from 'js-cookie';
import LoadingSpinner from '../Components/LoadingSpinner';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuthData } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isProcessing) {
      return;
    }

    const handleCallback = async () => {
      setIsProcessing(true);
      
      const token = searchParams.get('token');
      const error = searchParams.get('error');
      

      if (error) {
        let errorMessage = 'Authentication failed';
        
        switch (error) {
          case 'oauth_error':
            errorMessage = 'Google authentication error occurred';
            break;
          case 'oauth_failed':
            errorMessage = 'Google authentication was cancelled or failed';
            break;
          case 'token_error':
            errorMessage = 'Token generation failed';
            break;
          default:
            errorMessage = 'Authentication failed';
        }
        
        // Redirect to login with error message
        navigate('/auth/login', { 
          state: { error: errorMessage } 
        });
        return;
      }

      if (token) {
        try {
          // Store the token and fetch user data
          localStorage.setItem('token', token);
          
          // Fetch user data using the toke
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const cleanUrl = apiUrl.replace(/\/+$/, '');
          const meEndpoint = cleanUrl.endsWith('/api') 
            ? `${cleanUrl}/auth/me`
            : `${cleanUrl}/api/auth/me`;
            
          const response = await fetch(meEndpoint, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            
            // Set authentication data using the new function
            const result = await setAuthData(data.data.user, token);
            
            if (result.success) {
              // Redirect to dashboard or home
              navigate('/', { replace: true });
            } else {
              throw new Error('Failed to set authentication data');
            }
          } else {
            throw new Error('Failed to fetch user data');
          }
        } catch (error) {
          localStorage.removeItem('token');
          navigate('/auth/login', { 
            state: { error: 'Failed to complete authentication' } 
          });
        }
      } else {
        // No token and no error - shouldn't happen
        navigate('/auth/login', { 
          state: { error: 'No authentication data received' } 
        });
      }
    };

    handleCallback();
  }, [searchParams, navigate, setAuthData, isProcessing]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">
          Completing your authentication...
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
