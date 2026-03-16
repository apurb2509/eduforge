import React, { useState } from 'react';
import axios from 'axios';

const LectureForm = () => {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [videoUrl, setVideoUrl] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !text) return alert("Please provide both an image and text.");

    setLoading(true);
    setStatus('Processing AI Lecture...');
    setVideoUrl(null);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('text', text);

    try {
      const response = await axios.post('http://127.0.0.1:8000/generate-video', formData);
      setVideoUrl(response.data.video_url);
      setStatus('Generation complete!');
    } catch (error) {
      console.error(error);
      setStatus('Error generating video.');
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
          <input type="file" onChange={(e) => setFile(e.target.files[0])} accept="image/*" />
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
          {loading ? 'Generating...' : 'Generate Video'}
        </button>
      </form>

      {status && <p className="status-message">{status}</p>}

      {videoUrl && (
        <div className="video-container">
          <h4>Generated Lecture:</h4>
          <video controls width="100%" src={videoUrl}>
            Your browser does not support the video tag.
          </video>
          <a href={videoUrl} download className="download-link">Download Video</a>
        </div>
      )}
    </div>
  );
};

export default LectureForm;