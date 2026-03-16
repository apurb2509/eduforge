import React, { useState } from 'react';
import axios from 'axios';

// Destructure onNotesGenerated from props here
const LectureForm = ({ onNotesGenerated }) => {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [videoUrl, setVideoUrl] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !text) return alert("Please provide both an image and text.");

    setLoading(true);
    setStatus('Generating Video and Notes...');
    setVideoUrl(null);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('text', text);

    try {
      // 1. Generate Video
      const videoRes = await axios.post('http://127.0.0.1:8000/generate-video', formData);
      setVideoUrl(videoRes.data.video_url);

      // 2. Generate Notes (using same text)
      const notesFormData = new FormData();
      notesFormData.append('text', text);
      const notesRes = await axios.post('http://127.0.0.1:8000/generate-notes', notesFormData);
      
      // Now this call will work because it's defined in the props above
      if (onNotesGenerated) {
        onNotesGenerated(notesRes.data);
      }

      setStatus('All resources generated successfully!');
    } catch (error) {
      console.error(error);
      setStatus('Error during generation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>AI Lecture Video Generator</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Instructor Image</label>
          <input 
            type="file" 
            onChange={(e) => setFile(e.target.files[0])} 
            accept="image/*" 
          />
        </div>
        <div className="form-group">
          <label>Lecture Content</label>
          <textarea 
            rows="5" 
            placeholder="Type what the instructor should say..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Video & Notes'}
        </button>
      </form>

      {status && <p className="status-message">{status}</p>}

      {videoUrl && (
        <div className="video-container">
          <h4>Generated Lecture:</h4>
          <video controls width="100%" src={videoUrl} key={videoUrl}>
            Your browser does not support the video tag.
          </video>
          <a href={videoUrl} download className="download-link">Download Video</a>
        </div>
      )}
    </div>
  );
};

export default LectureForm;