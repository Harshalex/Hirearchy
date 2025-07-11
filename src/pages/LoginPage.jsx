import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '../api/authApi';
import { loginSuccess, loginFailure } from '../slices/authSlice';
import images from '../common/images';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const result = await login({ email, password }).unwrap();
      console.log(result);
      dispatch(loginSuccess({ 
        user: result.user, 
        token: result.access// FIX: use access_token from API
      }));
      navigate('/talent-search');
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.data?.message || 'Login failed. Please try again.');
      dispatch(loginFailure(error.data?.message || 'Login failed'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F6F6]">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md flex flex-col items-center border border-gray-100">
        {/* ... existing logo and headers ... */}
        <div className="flex items-center justify-center bg-gradient-to-br from-[#01207E] to-[#2862EB] rounded-full h-20 w-20 mb-5 shadow-sm">
          <img src={images.logo} alt="Logo" className="h-12 w-12 object-contain" />
        </div>
        <h1 className="text-3xl font-extrabold mb-2 text-blue-900">Hirearchy.ai</h1>
        <h2 className="text-lg text-gray-500 mb-8 font-medium">Sign in to your account</h2>
        
        {/* Add error display */}
        {error && (
          <div className="w-full bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        
        <form className="w-full flex flex-col gap-5" onSubmit={handleSubmit}>
          {/* ... existing form fields ... */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Email</label>
            <input
              type="email"
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-base focus:ring-2 focus:ring-blue-200 focus:outline-none"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Password</label>
            <input
              type="password"
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-base focus:ring-2 focus:ring-blue-200 focus:outline-none"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          
          {/* Updated button with loading state */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-lg text-lg shadow transition mt-2"
          >
            {isLoading ? 'Signing in...' : 'Login'}
          </button>
        </form>
        
        {/* Add signup link */}
        <p className="mt-6 text-sm text-gray-500 text-center">
          Don't have an account?{' '}
          <a href="/signup" className="text-blue-600 hover:underline font-medium">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;