import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import images from '../common/images';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login:', { email, password });
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(135deg, rgba(1,32,126,1) 0%, rgba(40,98,235,1) 100%)'}}>
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md flex flex-col items-center border border-gray-100">
        <div className="flex items-center justify-center bg-gradient-to-br from-[#01207E] to-[#2862EB] rounded-full h-20 w-20 mb-5 shadow-sm">
          <img src={images.logo} alt="Logo" className="h-12 w-12 object-contain" />
        </div>
        <h1 className="text-3xl font-extrabold mb-2 text-blue-900">Hirearchy.ai</h1>
        <h2 className="text-lg text-gray-500 mb-8 font-medium">Sign in to your account</h2>
        <form className="w-full flex flex-col gap-5" onSubmit={handleSubmit}>
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
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-lg shadow transition mt-2"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage; 