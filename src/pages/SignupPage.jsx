import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useSignupMutation } from "../api/authApi";
import { loginSuccess, loginFailure } from "../slices/authSlice";
import images from "../common/images";

function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("org_admin");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [signup, { isLoading }] = useSignupMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const result = await signup({ name, email, password, role }).unwrap();
      dispatch(
        loginSuccess({
          user: result.user,
          token: result.access_token, // FIX: use access_token from API
        })
      );
      navigate("/talent-search");
    } catch (error) {
      console.error("Signup failed:", error);
      setError(error.data?.message || "Signup failed. Please try again.");
      dispatch(loginFailure(error.data?.message || "Signup failed"));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="relative bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md transform transition-all duration-300 hover:shadow-2xl border border-gray-100">
        <div className="absolute -inset-0.5 rounded-2xl z-0 bg-gradient-to-r from-blue-100 to-indigo-100 opacity-50"></div>
        <div className="relative z-10 w-full flex flex-col items-center">
          {/* ... existing logo and headers ... */}
          <div className="flex items-center justify-center bg-gradient-to-br from-blue-700 to-indigo-600 rounded-full h-12 w-12 mb-4 shadow-md">
            <img
              src={images.logo}
              alt="Logo"
              className="h-8 w-8 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold mb-1 text-gray-800">
            Hirearchy.ai
          </h1>
          <h2 className="text-base text-gray-500 mb-6 font-medium">
            Create your account
          </h2>

          {/* Add error display */}
          {error && (
            <div className="w-full bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* ... existing form fields ... */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Name
              </label>
              <input
                type="text"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none transition-colors duration-200"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Email
              </label>
              <input
                type="email"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none transition-colors duration-200"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Password
              </label>
              <input
                type="password"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none transition-colors duration-200"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Role
              </label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none transition-colors duration-200"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="org_admin">CEO</option>
                <option value="recruiter">HR</option>
              </select>
            </div>

            {/* Updated button with loading state */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg text-base shadow-md transition-all duration-200 hover:shadow-lg"
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          {/* ... existing login link ... */}
          <p className="mt-4 text-sm text-gray-500 text-center">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
