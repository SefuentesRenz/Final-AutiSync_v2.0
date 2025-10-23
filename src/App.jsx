// src/App.jsx - WORKING VERSION without broken components
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ScrollToTop from './Admin/ScrollToTop';

import { ChatProvider } from './components/ChatContext.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';

import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import StudentPage from './pages/StudentPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import StudentProfile from './pages/StudentProfile';
import FlashcardsPage from './pages/FlashcardsPage';
import LinkChildPage from './pages/LinkChildPage';

// Working Admin pages
import ActivitiesPage from './Admin/Activities';
import AddActivity from './Admin/AddActivity';
import Tracking from './Admin/Tracking';
import AdminProfile from './Admin/AdminProfile.jsx';
import AlarmingEmotions from './Admin/AlarmingEmotions.jsx';


// Working Parent pages
import ParentDashboard from './parents/ParentDashboard.jsx';
import ParentHomepage from './parents/ParentHomepage.jsx';

// Debug page
import DebugPage from './pages/DebugPage.jsx';

import ErrorBoundary from './components/ErrorBoundary';
import Students from './Admin/Students.jsx';
import StudentProgress from './Admin/StudentProgress.jsx';

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/loginpage" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/signuppage" element={<SignupPage />} />
          <Route path="/studentpage" element={<StudentPage />} />
          <Route path="/studentprofile" element={<StudentProfile />} />
          <Route path="/flashcardspage" element={<FlashcardsPage />} />
          <Route path="/link-child" element={<LinkChildPage />} />

          {/* Admin Pages - All Working */}
          <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/addactivity" element={<AddActivity />} />
          <Route path="/tracking" element={<ErrorBoundary fallback={<div style={{padding:'20px'}}>Error loading Tracking page - check console for details</div>}><Tracking /></ErrorBoundary>} />
          <Route path="/adminprofile" element={<AdminProfile />} />
          <Route path="/alarmingemotions" element={<AlarmingEmotions />} />
          
          {/* These routes are temporarily disabled - will fix Students/StudentProgress components */}
          <Route path="/admin/students" element={<ErrorBoundary fallback={<div style={{padding:'20px'}}>Error loading Students page</div>}><Students /></ErrorBoundary>} />
          <Route path="/admin/student-progress/:id" element={<ErrorBoundary fallback={<div style={{padding:'20px'}}>Error loading Student Progress page</div>}><StudentProgress /></ErrorBoundary>} />
          
          {/* Temporary fallback routes */}
          {/* <Route path="/admin/students" element={<div style={{padding: '20px'}}>Students page temporarily unavailable. Will be fixed shortly.</div>} /> */}
          {/* <Route path="/admin/student-progress/:id" element={<div style={{padding: '20px'}}>Student Progress page temporarily unavailable. Will be fixed shortly.</div>} /> */}

          {/* Parent Pages - Working */}
          <Route path="/parent-homepage" element={<ParentHomepage />} />
          <Route path="/link-child" element={<LinkChildPage />} />
          <Route path="/parent-dashboard" element={<ParentDashboard />} />
          
          {/* Debug page */}
          <Route path="/debug" element={<DebugPage />} />
        </Routes>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
