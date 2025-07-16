import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaMicrochip } from 'react-icons/fa';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e) => {
      e.preventDefault();
      setError('');
      setSuccess('');
      if (password !== confirmPassword) {
          setError('Passwords do not match.');
          return;
      }
      if (password.length < 8) {
          setError('Password must be at least 8 characters long.');
          return;
      }
      // Simulate successful registration
      console.log('Registering user:', { name, email });
      setSuccess('Registration successful! You can now log in.');
      // In a real app, you would redirect or clear the form
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl">
      <div className="text-center mb-8">
        <FaMicrochip className="mx-auto text-blue-600 text-5xl mb-3" />
        <h1 className="text-3xl font-bold text-gray-800">Create an Account</h1>
        <p className="text-gray-500">Join our community of makers</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Full Name</label>
          <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email Address</label>
          <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="•••••••• (min 8 characters)" className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
        </div>
         <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">Confirm Password</label>
          <input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
        </div>
        
        {error && <div className="mb-4 text-sm text-center text-red-700 bg-red-100 p-3 rounded-lg">{error}</div>}
        {success && <div className="mb-4 text-sm text-center text-green-700 bg-green-100 p-3 rounded-lg">{success}</div>}

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Create Account
        </button>
      </form>
      <p className="text-center text-gray-500 text-sm mt-6">
        Already have an account?{' '}
        <Link to="/admin/login" className="font-bold text-blue-600 hover:underline">
          Login here
        </Link>
      </p>
    </div>
  );
};

export default Register;