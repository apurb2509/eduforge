import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  PlayCircle,
  X,
  Calendar,
  User,
  Trash2,
  Loader2,
  Search,
  XCircle,
  RefreshCw,
  Edit, // Added Edit icon
} from "lucide-react";

const StudentGallery = () => {
  // --- 1. State Management ---
  const [lectures, setLectures] = useState([]);
  const [filteredLectures, setFilteredLectures] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- 2. Constants & Auth ---
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isInstructor = user.role === "instructor";
  const API_BASE_URL = "http://127.0.0.1:8000";

  // --- 3. Data Fetching ---
  useEffect(() => {
    fetchLectures();
  }, []);

  const fetchLectures = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/lectures`);
      if (Array.isArray(res.data)) {
        setLectures(res.data);
      }
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  // --- 4. Search Filtering Logic ---
  useEffect(() => {
    const results = lectures.filter(
      (lecture) =>
        lecture.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lecture.instructor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lecture.description?.toLowerCase().includes(searchTerm.toLowerCase()) // Added description to search
    );
    setFilteredLectures(results);
  }, [searchTerm, lectures]);

  // --- 5. Instructor Update Logic ---
  const handleUpdate = async (e, id, currentTitle, currentDesc) => {
    e.stopPropagation(); // Prevent opening the video modal
    const newTitle = prompt("Enter new title:", currentTitle);
    const newDescription = prompt("Enter new description:", currentDesc);

    if (newTitle !== null && newDescription !== null) {
      try {
        await axios.patch(`${API_BASE_URL}/lectures/${id}`, {
          title: newTitle,
          description: newDescription,
        });
        fetchLectures(); // Dynamically refresh the list for real-time updates
      } catch (error) {
        console.error("Error updating lecture:", error);
        alert("Failed to update lecture. Check if the server is running.");
      }
    }
  };

  // --- 6. Hard Delete Logic ---
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this lecture? This action cannot be undone."
      )
    )
      return;
    
    try {
        await axios.delete(`${API_BASE_URL}/lectures/${id}`);
        fetchLectures(); // Refresh list after deletion
    } catch (err) {
        console.error("Delete failed", err);
        alert("Failed to delete lecture.");
    }
  };

  // --- 7. Loading State View ---
  if (loading && lectures.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="animate-spin mb-2" size={32} />
        <p>Loading library...</p>
      </div>
    );

  return (
    <div className="space-y-8 p-6">
      {/* --- Search & Refresh Bar --- */}
      <div className="flex gap-3 max-w-2xl mx-auto">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Search by title, instructor, or description..."
            className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all text-slate-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600"
            >
              <XCircle size={20} />
            </button>
          )}
        </div>
        <button
          onClick={fetchLectures}
          className="p-4 bg-white border border-slate-200 rounded-2xl hover:text-indigo-600 hover:border-indigo-600 transition-all shadow-sm shadow-indigo-100"
          title="Refresh Gallery"
        >
          <RefreshCw className={loading ? "animate-spin" : ""} size={20} />
        </button>
      </div>

      {/* --- Gallery Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredLectures.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
            {searchTerm
              ? `No results found for "${searchTerm}"`
              : "No lectures available yet."}
          </div>
        ) : (
          filteredLectures.map((lecture) => (
            <div
              key={lecture.id}
              onClick={() => setSelectedVideo(lecture)}
              className="group bg-white rounded-3xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all relative"
            >
              {/* Instructor Actions (Visible only to instructors) */}
              {isInstructor && (
                <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={(e) => handleUpdate(e, lecture.id, lecture.title, lecture.description)}
                    className="p-2 bg-white/90 text-indigo-600 rounded-xl shadow-md hover:bg-indigo-600 hover:text-white transition-all"
                    title="Edit Details"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, lecture.id)}
                    className="p-2 bg-white/90 text-red-500 rounded-xl shadow-md hover:bg-red-500 hover:text-white transition-all"
                    title="Delete Lecture"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}

              {/* Thumbnail Container */}
              <div className="aspect-video bg-slate-900 relative flex items-center justify-center overflow-hidden">
                <PlayCircle
                  className="text-white/60 group-hover:text-white group-hover:scale-110 transition-all z-10"
                  size={56}
                />
                <img
                  src={`${API_BASE_URL}/static/${lecture.video_url.replace('output_', 'input_').replace('.mp4', '.jpg')}`}
                  className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  alt={lecture.title}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/640x360?text=AI+Lecture";
                  }}
                />
              </div>

              {/* Card Details */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-1 truncate">
                  {lecture.title}
                </h3>
                
                {/* Description Box - Dynamic for students and teachers */}
                <p className="text-sm text-slate-600 mb-4 line-clamp-2 min-h-[40px]">
                  {lecture.description || "No description provided."}
                </p>
                
                <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <User size={14} /> {lecture.instructor}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} /> {lecture.date}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- Video Modal Player --- */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/95 backdrop-blur-md"
            onClick={() => setSelectedVideo(null)}
          />
          <div className="relative w-full max-w-5xl bg-black rounded-3xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 z-20 p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
            >
              <X size={24} />
            </button>
            <video
              controls
              autoPlay
              className="w-full aspect-video"
              src={`${API_BASE_URL}/static/${selectedVideo.video_url}`}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentGallery;