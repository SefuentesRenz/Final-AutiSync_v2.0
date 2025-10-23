// Minimal App.jsx to test imports
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ChatProvider } from './components/ChatContext.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import ScrollToTop from './Admin/ScrollToTop';

// Import just the basic pages first
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import StudentPage from './pages/StudentPage';
import StudentProfile from './pages/StudentProfile';
import FlashcardsPage from './pages/FlashcardsPage';

// Working Admin pages
import ActivitiesPage from './Admin/Activities';
import AddActivity from './Admin/AddActivity';
import Tracking from './Admin/Tracking';
import AdminProfile from './Admin/AdminProfile.jsx';
import AlarmingEmotions from './Admin/AlarmingEmotions.jsx';

// Test ONLY Parent pages
import ParentDashboard from './parents/ParentDashboard.jsx';
import ParentHomepage from './parents/ParentHomepage.jsx';

const App = () => {
  return (
    <AuthProvider>
      <ChatProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/loginpage" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/signuppage" element={<SignupPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/studentpage" element={<StudentPage />} />
          <Route path="/studentprofile" element={<StudentProfile />} />
          <Route path="/flashcardspage" element={<FlashcardsPage />} />
          
          {/* All working Admin pages */}
          <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/addactivity" element={<AddActivity />} />
          <Route path="/tracking" element={<Tracking />} />
          <Route path="/adminprofile" element={<AdminProfile />} />
          <Route path="/alarmingemotions" element={<AlarmingEmotions />} />
          
          {/* Test ONLY Parent pages */}
          <Route path="/parent-homepage" element={<ParentHomepage />} />
          <Route path="/parent-dashboard" element={<ParentDashboard />} />
        </Routes>
      </ChatProvider>
    </AuthProvider>
  );
};

export default App;
