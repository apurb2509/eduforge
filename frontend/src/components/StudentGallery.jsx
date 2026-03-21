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
  Edit,
  Layers,
} from "lucide-react";

const StudentGallery = ({ activeTab = "videos" }) => {
  // --- 1. State Management ---
  const [lectures, setLectures] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [filteredLectures, setFilteredLectures] = useState([]);
  const [filteredPlaylists, setFilteredPlaylists] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- 2. Constants & Auth ---
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isInstructor = user.role === "instructor";
  const API_BASE_URL = "http://127.0.0.1:8000";

  // --- 3. Data Fetching & Real-Time Sync ---
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [lecturesRes, playlistsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/lectures`),
        axios.get(`${API_BASE_URL}/playlists`),
      ]);
      
      if (Array.isArray(lecturesRes.data)) setLectures(lecturesRes.data);
      if (Array.isArray(playlistsRes.data)) setPlaylists(playlistsRes.data);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();

    const socket = new WebSocket("ws://localhost:8080/ws/progress");
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "REFRESH_DATA") fetchAllData();
      } catch (err) {
        console.error("WebSocket message error:", err);
      }
    };

    return () => socket.close();
  }, []);

  // --- 4. Search Filtering Logic ---
  useEffect(() => {
    const lectureResults = lectures.filter(
      (lecture) =>
        lecture.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lecture.instructor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lecture.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLectures(lectureResults);

    const playlistResults = playlists.filter(
      (playlist) =>
        playlist.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPlaylists(playlistResults);
  }, [searchTerm, lectures, playlists]);

  // --- 5. Instructor Update Logic ---
  const handleUpdate = async (e, id, currentTitle, currentDesc) => {
    e.stopPropagation();
    const newTitle = prompt("Enter new title:", currentTitle);
    const newDescription = prompt("Enter new description:", currentDesc);

    if (newTitle !== null && newDescription !== null) {
      try {
        await axios.patch(`${API_BASE_URL}/lectures/${id}`, {
          title: newTitle,
          description: newDescription,
        });
        fetchAllData(); 
      } catch (error) {
        console.error("Error updating lecture:", error);
      }
    }
  };

  // --- 6. Hard Delete Logic ---
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to permanently delete this lecture?")) return;
    try {
        await axios.delete(`${API_BASE_URL}/lectures/${id}`);
        fetchAllData(); 
    } catch (err) {
        console.error("Delete failed", err);
    }
  };

  // --- 7. Loading State View ---
  if (loading && lectures.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="animate-spin mb-2" size={32} />
        <p className="font-black uppercase tracking-widest text-xs">Loading library...</p>
      </div>
    );

  return (
    <div className="pt-24 pb-12 px-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {activeTab === 'videos' ? 'My Gallery' : 'Playlists'}
            </h2>
            <p className="text-slate-500 font-medium">
              {activeTab === 'videos' ? 'Browse all available AI-generated lectures.' : 'Organized collections for your learning path.'}
            </p>
          </div>
          <button onClick={fetchAllData} className="w-fit p-3 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all shadow-sm">
            <RefreshCw className={loading ? "animate-spin" : ""} size={20} />
          </button>
        </div>

        {/* --- Search Bar --- */}
        <div className="relative max-w-2xl">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
          <input
            type="text"
            placeholder={`Search ${activeTab === 'videos' ? 'videos' : 'playlists'}...`}
            className="w-full pl-14 pr-12 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-slate-900 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* --- Gallery Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeTab === "videos" ? (
            filteredLectures.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 text-slate-400">
                {searchTerm ? `No videos found for "${searchTerm}"` : "No lectures available yet."}
              </div>
            ) : (
              filteredLectures.map((lecture) => (
                <div
                  key={lecture.id}
                  onClick={() => setSelectedVideo(lecture)}
                  className="group bg-white rounded-[2rem] border border-slate-200 overflow-hidden cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all relative"
                >
                  {isInstructor && (
                    <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={(e) => handleUpdate(e, lecture.id, lecture.title, lecture.description)}
                        className="p-3 bg-white/95 text-indigo-600 rounded-2xl shadow-lg hover:bg-indigo-600 hover:text-white transition-all"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, lecture.id)}
                        className="p-3 bg-white/95 text-red-500 rounded-2xl shadow-lg hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                  <div className="aspect-video bg-slate-900 relative flex items-center justify-center overflow-hidden">
                    <PlayCircle className="text-white/60 group-hover:text-white group-hover:scale-110 transition-all z-10" size={56} />
                    <img
                      src={`${API_BASE_URL}/static/${lecture.video_url.replace('output_', 'input_').replace('.mp4', '.jpg')}`}
                      className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      alt={lecture.title}
                      onError={(e) => { e.target.src = "https://via.placeholder.com/640x360?text=AI+Lecture"; }}
                    />
                  </div>
                  <div className="p-7">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 truncate">{lecture.title}</h3>
                    <p className="text-sm text-slate-600 mb-5 line-clamp-2 min-h-[40px] leading-relaxed">{lecture.description || "No description provided."}</p>
                    <div className="flex items-center justify-between text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><User size={14} className="text-indigo-500"/> {lecture.instructor}</span>
                      <span className="flex items-center gap-1.5"><Calendar size={14} className="text-indigo-500"/> {lecture.date}</span>
                    </div>
                  </div>
                </div>
              ))
            )
          ) : (
            filteredPlaylists.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 text-slate-400">
                {searchTerm ? `No playlists found for "${searchTerm}"` : "No playlists created yet."}
              </div>
            ) : (
              filteredPlaylists.map((playlist) => (
                <div key={playlist.id} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col h-full">
                  <div className="p-7 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100"><Layers size={22} /></div>
                      <div>
                        <h3 className="font-bold text-slate-900 leading-tight text-lg">{playlist.name}</h3>
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">
                          {playlist.videos?.length || 0} Lectures
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 space-y-3 flex-grow overflow-y-auto max-h-[350px]">
                    {playlist.videos && playlist.videos.length > 0 ? (
                      playlist.videos.map((lecture) => (
                        <div 
                          key={lecture.id}
                          onClick={() => setSelectedVideo(lecture)}
                          className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-indigo-50 cursor-pointer transition-colors border border-transparent hover:border-indigo-100"
                        >
                          <div className="relative w-24 aspect-video bg-slate-200 rounded-xl overflow-hidden flex-shrink-0">
                            <img 
                              src={`${API_BASE_URL}/static/${lecture.video_url.replace('output_', 'input_').replace('.mp4', '.jpg')}`} 
                              className="w-full h-full object-cover" 
                              alt="" 
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/0 transition-colors">
                              <PlayCircle className="text-white/80" size={24} />
                            </div>
                          </div>
                          <p className="text-sm font-bold text-slate-700 line-clamp-2 leading-snug">{lecture.title}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-10 text-xs text-slate-400 italic font-medium uppercase tracking-tighter">No videos added yet</p>
                    )}
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>

      {/* --- Video Modal Player --- */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md" onClick={() => setSelectedVideo(null)} />
          <div className="relative w-full max-w-5xl bg-black rounded-[2.5rem] overflow-hidden shadow-2xl">
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-6 right-6 z-20 p-2.5 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
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
            <div className="p-8 bg-zinc-900">
                <h2 className="text-2xl font-black text-white mb-2">{selectedVideo.title}</h2>
                <p className="text-zinc-400 font-medium leading-relaxed">{selectedVideo.description || "No description provided."}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentGallery;