import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LectureForm from './components/LectureForm';
import StudyNotes from './components/StudyNotes';
import './index.css';

const App = () => {
  const [notes, setNotes] = useState(null);

  return (
    <div>
      <Navbar />
      <main className="container">
        {/* Pass setNotes to the form so it can update the state after API call */}
        <LectureForm onNotesGenerated={setNotes} />
        <StudyNotes notes={notes} />
      </main>
    </div>
  );
};

export default App;