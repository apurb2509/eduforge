import React from 'react';
import Navbar from './components/Navbar';
import './index.css';

const App = () => {
  return (
    <div>
      <Navbar />
      <main className="container">
        <h1>Welcome to EduForge</h1>
        <p>Your AI-powered learning ecosystem.</p>
      </main>
    </div>
  );
};

export default App;