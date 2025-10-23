// src/App-simple.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>AutiSync v2.0</h1>
      <p>Application is loading...</p>
      <Routes>
        <Route path="/" element={
          <div>
            <h2>Welcome to AutiSync</h2>
            <p>This is the landing page</p>
            <a href="/loginpage" style={{ color: 'blue', textDecoration: 'underline' }}>Go to Login</a>
          </div>
        } />
        <Route path="/loginpage" element={
          <div>
            <h2>Login Page</h2>
            <p>Login functionality will be here</p>
            <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>Back to Home</a>
          </div>
        } />
      </Routes>
    </div>
  );
}

export default App;
