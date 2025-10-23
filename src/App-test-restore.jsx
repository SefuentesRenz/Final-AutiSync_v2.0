// src/App-test-restore.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ScrollToTop from './Admin/ScrollToTop';

// Import only essential pages first
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <div>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={
          <div style={{ padding: '20px' }}>
            <h1>Page Not Found</h1>
            <a href="/" style={{ color: 'blue' }}>Back to Home</a>
          </div>
        } />
      </Routes>
    </div>
  );
}

export default App;
