import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaMicrochip, FaInfoCircle } from 'react-icons/fa';

const ADMIN = { email: 'admin@gmail.com', password: "asdfghjkl;'" };
const USER = { email: 'user@gmail.com', password: "asdfghjkl;'" }; // Corrected password for user

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === ADMIN.email && password === ADMIN.password) {
      localStorage.setItem('isAdmin', 'true');
      setError('');
      navigate('/admin');
    } else if (email === USER.email && password === USER.password) {
      localStorage.setItem('isUser', 'true');
      setError('');
      navigate('/');
    } else {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl">
      <div className="text-center mb-8">
        <FaMicrochip className="mx-auto text-blue-600 text-5xl mb-3" />
        <h1 className="text-3xl font-bold text-gray-800">Welcome Back!</h1>
        <p className="text-gray-500">Sign in to continue to Skyelectro</p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r-lg">
        <div className="flex">
          <div className="py-1"><FaInfoCircle className="h-5 w-5 text-blue-400 mr-3"/></div>
          <div>
            <p className="text-sm text-blue-700">
              <span className="font-bold">Admin:</span> admin@gmail.com / asdfghjkl;'
            </p>
             <p className="text-sm text-blue-700">
              <span className="font-bold">User:</span> user@gmail.com / asdfghjkl;''
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email Address</label>
          <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
        </div>
        
        {error && <div className="mb-4 text-sm text-center text-red-700 bg-red-100 p-3 rounded-lg">{error}</div>}

        <div className="flex items-center justify-end mb-6">
          <a href="#" className="text-sm font-medium text-blue-600 hover:underline">Forgot Password?</a>
        </div>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Sign In
        </button>
      </form>
      <p className="text-center text-gray-500 text-sm mt-6">
        Don't have an account?{' '}
        <Link to="/admin/register" className="font-bold text-blue-600 hover:underline">
          Register here
        </Link>
      </p>
    </div>
  );
};

export default Login;