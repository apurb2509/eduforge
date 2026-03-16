import React, { useState } from 'react';

const LectureForm = () => {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submit:", { text, file });
  };

  return (
    <div className="card">
      <h3>Generate AI Lecture</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Instructor Image</label>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} accept="image/*" />
        </div>
        <div className="form-group">
          <label>Lecture Content</label>
          <textarea 
            rows="5" 
            placeholder="Enter the text you want the AI to speak..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary">Generate Video</button>
      </form>
    </div>
  );
};

export default LectureForm;