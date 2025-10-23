// src/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userType, setUserType] = useState("student"); // "student" or "admin"
  
  // Forgot Password States
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [forgotError, setForgotError] = useState("");

  const navigate = useNavigate();

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  const backToHome = (e) => {
    e.preventDefault();
    navigate("/");
  };

  const signupPageRoute = (e) => {
    e.preventDefault();
    navigate("/signuppage");
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError("");
    setForgotSuccess("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setForgotError(error.message);
      } else {
        setForgotSuccess("Password reset email sent! Check your inbox.");
        setForgotEmail("");
      }
    } catch (error) {
      setForgotError("An unexpected error occurred. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  const toggleForgotPassword = () => {
    setShowForgotPassword(!showForgotPassword);
    setForgotError("");
    setForgotSuccess("");
    setForgotEmail("");
    setError(""); // Clear login errors when switching
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      // Login successful
      console.log('Login successful:', data);
      
      // Redirect based on user type
      if (userType === "admin") {
        navigate("/tracking"); // Redirect admin to tracking page
      } else if (userType === "parent") {
        navigate("/parent-homepage"); // Redirect parent to parent homepage
      } else {
        navigate("/home"); // Redirect student to home page
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/2 right-32 w-48 h-48 bg-purple-200/20 rounded-full blur-2xl animate-float-delayed"></div>
        <div className="absolute bottom-32 left-1/3 w-32 h-32 bg-pink-200/20 rounded-full blur-xl animate-bounce-gentle"></div>
      </div>

      <div className="relative z-10 bg-white/80 backdrop-blur-xl p-7 rounded-2xl shadow-xl w-full max-w-md border border-white/20 animate-fade-in-scale">
        {/* Header with logo */}
        <div className="text-center mb-7">
          <div className="flex items-center justify-center -mb-3 -mt-7">
            <img
                  src="/assets/logo.png"
                  alt="AutiSync Logo"
                  className="w-23 h-23 object-contain"
                />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            AutiSync v2.0
          </h2>
          {!showForgotPassword && (
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-3 mb-3">
              <h3 className="text-xl font-bold text-gray-800 flex items-center justify-center">
                Welcome Back!
                <span className="text-xl mr-2 animate-wiggle">👋</span>
              </h3>
              <p className="text-gray-600 text-sm">
                Please enter your details to login! ✨
              </p>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Forgot Password Error/Success Messages */}
        {forgotError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {forgotError}
          </div>
        )}

        {forgotSuccess && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
            {forgotSuccess}
          </div>
        )}

        {showForgotPassword ? (
          /* Forgot Password Form */
          <form className="space-y-5" onSubmit={handleForgotPassword}>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                🔐 Reset Your Password
              </h3>
              <p className="text-gray-600 text-sm">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            <div>
              <label
                htmlFor="forgotEmail"
                className="flex items-center text-sm font-bold text-gray-700 mb-1"
              >
                📧 Email Address
              </label>
              <input
                type="email"
                id="forgotEmail"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base transition-all duration-300"
                placeholder="Enter your email address"
                required
              />
            </div>

            <button
              type="submit"
              disabled={forgotLoading}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 rounded-xl text-base font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {forgotLoading ? (
                <>
                  <span className="mr-2">⏳</span>
                  Sending Reset Email...
                </>
              ) : (
                <>
                  <span className="mr-2">📤</span>
                  Send Reset Email
                </>
              )}
            </button>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={toggleForgotPassword}
                className="text-sm font-semibold cursor-pointer text-blue-600 hover:text-blue-800 transition-colors duration-200"
              >
                ← Back to Login
              </button>
            </div>
          </form>
        ) : (
          /* Login Form */
          <form className="space-y-5" onSubmit={handleLogin}>
          {/* User type selection */}
          <div className="flex justify-center gap-2 mb-4">
            <button
              type="button"
              className={`px-4 py-2 rounded-xl font-bold border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm shadow-sm cursor-pointer ${userType === 'student' ? 'bg-blue-100 border-blue-500 text-blue-900' : 'bg-white border-gray-300 text-gray-600'}`}
              onClick={() => setUserType('student')}
            >
              👦 Student
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-xl font-bold border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm shadow-sm cursor-pointer ${userType === 'admin' ? 'bg-purple-100 border-purple-500 text-purple-900' : 'bg-white border-gray-300 text-gray-600'}`}
              onClick={() => setUserType('admin')}
            >
              🧑‍🏫 Admin
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-xl font-bold border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-200 text-sm shadow-sm cursor-pointer ${userType === 'parent' ? 'bg-green-100 border-green-500 text-green-900' : 'bg-white border-gray-300 text-gray-600'}`}
              onClick={() => setUserType('parent')}
            >
              👨‍👩‍👧‍👦 Parent
            </button>
          </div>
          <div>
            <label
              htmlFor="email"
              className="flex items-center text-sm font-bold text-gray-700 mb-1"
            >
              {userType === 'student' ? 'Email Address or Username' : 'Email Address'}
            </label>
            {userType === 'student' && (
              <p className="text-xs text-gray-500 mb-2">
                💡 If your parent created your account, ask them for your login details
              </p>
            )}
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base placeholder-gray-400 transition-all duration-300"
                placeholder={userType === 'student' ? 'Email or ask parent for login details' : 'you@example.com'}
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {/* <span className="text-gray-400 text-sm">📧</span> */}
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="flex items-center text-sm font-bold text-gray-700 mb-1 -mt-2"
            >
              {/* <span className="text-lg mr-2">🔒</span> */}
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base transition-all duration-300"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={handlePasswordToggle}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <span className="text-base">
                  {showPassword ? "🙈" : "👀"}
                </span>
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={toggleForgotPassword}
              className="text-sm font-semibold cursor-pointer decoration-2 -mt-2 text-blue-600 hover:text-blue-800 transition-colors duration-200"
            >
              {showForgotPassword ? 'Back to Login' : 'Forgot password?'}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-autism-friendly w-full bg-gradient-to-r from-blue-800 to-purple-800 hover:from-blue-900 hover:to-purple-900 text-white py-3 cursor-pointer rounded-xl text-base font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <>
                <span className="mr-2">⏳</span>
                Logging in as {userType === 'admin' ? 'Admin' : userType === 'parent' ? 'Parent' : 'Student'}...
              </>
            ) : (
              <>
                <span className="mr-2">🚀</span>
                {userType === 'admin' ? 'Login as Admin' : userType === 'parent' ? 'Access Parent Portal' : 'Start Learning!'}
              </>
            )}
          </button>
        </form>
        )}

        <div className="mt-7 space-y-4">
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{" "}
              <button
                onClick={signupPageRoute}
                className="text-blue-900 cursor-pointer font-semibold decoration-2 underline-offset-2 hover:decoration-blue-600 transition-all duration-200"
              >
                Sign up here! 
              </button>
            </p>
          </div>

          <div className="flex items-center justify-center space-x-4 pt-5 border-t border-gray-200">
            <button
              onClick={backToHome}
              className="flex items-center font-semibold cursor-pointer text-sm text-black-500 hover:text-gray-700 transition-colors duration-200"
            >
              <span className="mr-2">🏠</span>
              Back to Home
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-4 -right-4 w-7 h-7 bg-yellow-400/30 rounded-full animate-bounce-gentle"></div>
        <div className="absolute -bottom-4 -left-4 w-5 h-5 bg-pink-400/30 rounded-full animate-float"></div>
      </div>
    </div>
  );
}

export default LoginPage;
