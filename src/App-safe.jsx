// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ScrollToTop from './Admin/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';

import { ChatProvider } from './components/ChatContext.jsx'; // Import ChatContext provider
import { AuthProvider } from './contexts/AuthContext.jsx'; // Import AuthContext provider

import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import StudentPage from './pages/StudentPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
// import ChooseCategory from './pages/ChooseCategory';
// import ChooseDifficulty from './pages/ChooseDifficulty';
import StudentProfile from './pages/StudentProfile';
// import EasyAcademicFlashcard from './pages/AcademicFlashcard/EasyAcademicFlashcard';
import FlashcardsPage from './pages/FlashcardsPage';


// Admin pages
import ActivitiesPage from './Admin/Activities';
import AddActivity from './Admin/AddActivity';
// import ExpressionWall from './Admin/ExpressionWall';
import Tracking from './Admin/Tracking';
import AdminProfile from './Admin/AdminProfile.jsx';
import AlarmingEmotions from './Admin/AlarmingEmotions.jsx';
import Students from './Admin/Students.jsx';
// import Notifications from './Admin/Notifications';

// Parent pages
import ParentDashboard from './parents/ParentDashboard.jsx';
import ParentHomepage from './parents/ParentHomepage.jsx';
import StudentProgress from './Admin/StudentProgress.jsx';

const SafeRoute = ({ element, name }) => (
  <ErrorBoundary fallback={<div style={{padding: '20px'}}>Error loading {name}. Check console for details.</div>}>
    {element}
  </ErrorBoundary>
);

function App() {
  return (
    <AuthProvider> {/* Wrap with AuthProvider */}
      <ChatProvider> {/* Wrap your app with ChatProvider */}
        <ScrollToTop />
        <Routes>
        <Route path="/loginpage" element={<SafeRoute element={<LoginPage />} name="LoginPage" />} />
        <Route path="/reset-password" element={<SafeRoute element={<ResetPasswordPage />} name="ResetPasswordPage" />} />
        <Route path="/home" element={<SafeRoute element={<HomePage />} name="HomePage" />} />
        <Route path="/" element={<SafeRoute element={<LandingPage />} name="LandingPage" />} />
        <Route path="/signuppage" element={<SafeRoute element={<SignupPage />} name="SignupPage" />} />
        <Route path="/studentpage" element={<SafeRoute element={<StudentPage />} name="StudentPage" />} />
        {/* <Route path="/choosecategory" element={<ChooseCategory />} />
        <Route path="/choosedifficulty" element={<ChooseDifficulty />} /> */}
        <Route path="/studentprofile" element={<SafeRoute element={<StudentProfile />} name="StudentProfile" />} />
        {/* <Route path="/easyacademicflashcard" element={<EasyAcademicFlashcard />} /> */}
        {/* <Route path="/flashcardspage" element={<FlashcardsPage />} /> */}
        <Route path="/flashcardspage" element={<SafeRoute element={<FlashcardsPage />} name="FlashcardsPage" />} />


        {/* Admin Pages */}
        <Route path="/activities" element={<SafeRoute element={<ActivitiesPage />} name="ActivitiesPage" />} />
        <Route path="/addactivity" element={<SafeRoute element={<AddActivity />} name="AddActivity" />} />
        {/* <Route path="/expressionwall" element={<ExpressionWall />} /> */}
        <Route path="/tracking" element={<SafeRoute element={<Tracking />} name="Tracking" />} />
        <Route path="/adminprofile" element={<SafeRoute element={<AdminProfile />} name="AdminProfile" />} />
        <Route path="/alarmingemotions" element={<SafeRoute element={<AlarmingEmotions />} name="AlarmingEmotions" />} />
        <Route path="/admin/students" element={<SafeRoute element={<Students />} name="Students" />} />
        <Route path="/admin/student-progress/:id" element={<SafeRoute element={<StudentProgress />} name="StudentProgress" />} />

        {/* Parent Pages */}
        <Route path="/parent-homepage" element={<SafeRoute element={<ParentHomepage />} name="ParentHomepage" />} />
        <Route path="/parent-dashboard" element={<SafeRoute element={<ParentDashboard />} name="ParentDashboard" />} />
      </Routes>
    </ChatProvider>
    </AuthProvider>
  );
}

export default App;
