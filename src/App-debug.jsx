// Debug version of App.jsx
import React from 'react';

const AppDebug = () => {
  return (
    <div style={{ padding: '20px', fontSize: '24px', color: 'black' }}>
      <h1>AutiSync Debug - Can you see this?</h1>
      <p>If you can see this text, React is working.</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
};

export default AppDebug;
