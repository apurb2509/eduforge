import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LectureForm from './components/LectureForm';
import StudyNotes from './components/StudyNotes';
import './index.css';

const App = () => {
  const [notes, setNotes] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);

  return (
    <div>
      <Navbar />
      <main className="container">
        <LectureForm 
          onNotesGenerated={setNotes} 
          onVideoGenerated={setVideoUrl} 
        />
        
        {videoUrl && (
          <div className="card" style={{ marginTop: '2rem' }}>
            <h3>🎥 Generated AI Lecture</h3>
            <div className="video-container">
              <video controls width="100%" src={videoUrl} key={videoUrl}>
                Your browser does not support the video tag.
              </video>
              <a href={videoUrl} download className="download-link">Download Video</a>
            </div>
          </div>
        )}

        <StudyNotes notes={notes} />
      </main>
    </div>
  );
};

export default App;