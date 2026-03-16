import React from 'react';

const StudyNotes = ({ notes }) => {
  if (!notes) return null;

  return (
    <div className="card" style={{ marginTop: '2rem' }}>
      <h3>📝 Smart Study Notes</h3>
      <ul>
        {notes.key_points.map((point, index) => (
          <li key={index} style={{ marginBottom: '0.5rem' }}>{point}</li>
        ))}
      </ul>
    </div>
  );
};

export default StudyNotes;