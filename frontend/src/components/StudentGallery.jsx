import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlayCircle, X, Calendar, User, Video, Trash2, Loader2, Search, XCircle } from 'lucide-react';

const StudentGallery = () => {
  const [lectures, setLectures] = useState([]);
  const [filteredLectures, setFilteredLectures] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchLectures();
  }, []);

  // Update filtered list whenever searchTerm or lectures change
  useEffect(() => {
    const results = lectures.filter(lecture =>
      lecture.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecture.instructor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecture.script?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLectures(results);
  }, [searchTerm, lectures]);

  const fetchLectures = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/lectures');
      if (Array.isArray(res.data)) {
        setLectures(res.data);
        setFilteredLectures(res.data);
      }
    } catch {
      console.error("Fetch failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this lecture?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/lectures/${id}`);
      setLectures(prev => prev.filter(l => l.id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
      <Loader2 className="animate-spin mb-2" size={32} />
      <p>Loading library...</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Search Bar Section */}
      <div className="relative max-w-xl mx-auto group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="Search by title, instructor, or content..."
          className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all text-slate-900 placeholder:text-slate-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm("")}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-300 hover:text-slate-500"
          >
            <XCircle size={20} />
          </button>
        )}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredLectures.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 text-lg">
              {searchTerm ? `No results found for "${searchTerm}"` : "No lectures available yet."}
            </p>
          </div>
        ) : (
          filteredLectures.map((lecture) => (
            <div 
              key={lecture.id}
              onClick={() => setSelectedVideo(lecture)}
              className="group bg-white rounded-3xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all relative"
            >
              {currentUser.role === 'instructor' && (
                <button
                  onClick={(e) => handleDelete(e, lecture.id)}
                  className="absolute top-4 right-4 z-20 p-2 bg-white/90 hover:bg-red-500 hover:text-white text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                >
                  <Trash2 size={18} />
                </button>
              )}

              <div className="aspect-video bg-slate-900 relative flex items-center justify-center">
                <PlayCircle className="text-white/40 group-hover:text-white group-hover:scale-110 transition-all z-10" size={56} />
                {lecture.image_url && (
                   <img 
                     src={`http://127.0.0.1:8000${lecture.image_url}`} 
                     className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                     alt=""
                   />
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2 truncate">{lecture.title}</h3>
                <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
                  <span className="flex items-center gap-1.5"><User size={14}/> {lecture.instructor_name || 'Instructor'}</span>
                  <span className="flex items-center gap-1.5"><Calendar size={14}/> {lecture.created_at?.split('T')[0]}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Video Player Modal (unchanged logic) */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md" onClick={() => setSelectedVideo(null)} />
          <div className="relative w-full max-w-5xl bg-black rounded-3xl overflow-hidden shadow-2xl">
            <button onClick={() => setSelectedVideo(null)} className="absolute top-4 right-4 z-20 p-2 bg-white/10 text-white rounded-full hover:bg-white/20"><X size={24} /></button>
            <video controls autoPlay className="w-full aspect-video" src={`http://127.0.0.1:8000${selectedVideo.video_url}`} />
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentGallery;