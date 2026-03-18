import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlayCircle, X, Calendar, User, Video, Trash2, Loader2, AlertCircle } from 'lucide-react';

const StudentGallery = () => {
  // Ensure the initial state is ALWAYS an array []
  const [lectures, setLectures] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchLectures();
  }, []);

  const fetchLectures = async () => {
    try {
      setError(null);
      const res = await axios.get('http://127.0.0.1:8000/lectures');
      
      // Safety: Only set state if data is an actual array
      if (Array.isArray(res.data)) {
        setLectures(res.data);
      } else {
        setLectures([]); 
      }
    } catch (err) {
      console.error("API Error:", err);
      setError("Could not connect to the server. Please check if the backend is running.");
      setLectures([]); // Keep it as an array so .length doesn't crash
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/lectures/${id}`);
      setLectures(prev => prev.filter(l => l.id !== id));
    } catch {
      alert("Delete failed.");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
      <Loader2 className="animate-spin mb-2" size={32} />
      <p>Fetching lectures...</p>
    </div>
  );

  // If there's a connection error (like the 404 you're seeing)
  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 text-red-500 bg-red-50 rounded-3xl border border-red-100">
      <AlertCircle size={40} className="mb-2" />
      <p className="font-bold">{error}</p>
      <button onClick={fetchLectures} className="mt-4 text-sm underline">Try Again</button>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {/* Safe check: Use optional chaining or ensure it's an array */}
      {(lectures || []).length === 0 ? (
        <div className="col-span-full text-center py-20 bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200">
          <p className="text-slate-400">No lectures found.</p>
        </div>
      ) : (
        lectures.map((lecture) => (
          <div 
            key={lecture.id}
            onClick={() => setSelectedVideo(lecture)}
            className="group bg-white rounded-3xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-2xl transition-all relative"
          >
            {currentUser.role === 'instructor' && (
              <button
                onClick={(e) => handleDelete(e, lecture.id)}
                className="absolute top-4 right-4 z-20 p-2 bg-white/90 hover:bg-red-500 hover:text-white text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={18} />
              </button>
            )}

            <div className="aspect-video bg-slate-900 relative flex items-center justify-center">
              <PlayCircle className="text-white/50 group-hover:text-white transition-all z-10" size={64} />
              {lecture.image_url && (
                 <img 
                   src={`http://127.0.0.1:8000${lecture.image_url}`} 
                   className="absolute inset-0 w-full h-full object-cover opacity-60"
                   alt=""
                 />
              )}
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-2">{lecture.title}</h3>
              <div className="flex items-center gap-4 text-slate-500 text-sm">
                <span>{lecture.instructor_name || 'Instructor'}</span>
                <span>{lecture.created_at?.split('T')[0]}</span>
              </div>
            </div>
          </div>
        ))
      )}

      {selectedVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm" onClick={() => setSelectedVideo(null)} />
          <div className="relative w-full max-w-5xl bg-black rounded-3xl overflow-hidden shadow-2xl">
            <button onClick={() => setSelectedVideo(null)} className="absolute top-4 right-4 z-20 text-white"><X size={24} /></button>
            <video controls autoPlay className="w-full aspect-video" src={`http://127.0.0.1:8000${selectedVideo.video_url}`} />
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentGallery;