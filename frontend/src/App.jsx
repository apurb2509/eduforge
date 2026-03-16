import React from 'react';
import Navbar from './components/Navbar';
import LectureForm from './components/LectureForm';
import './index.css';

const App = () => {
  return (
    <div>
      <Navbar />
      <main className="container">
        <LectureForm />
      </main>
    </div>
  );
};

export default App;