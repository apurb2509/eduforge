import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Edit, Trash2, Calendar, User, Loader2, PlayCircle, X, Search,
  Plus, FolderPlus, Film, CheckCircle2, ChevronUp, ChevronDown, 
  Upload, Link2Off, ArrowUpDown, Info
} from 'lucide-react';

const ViewArchive = ({ activeTab = 'videos' }) => {
  // --- 1. State Management ---
  const [lectures, setLectures] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest"); // 'latest', 'oldest', 'name'
  
  // Selection/Modals
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [editItem, setEditItem] = useState(null); 
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  // Add these lines
const [addingToPlaylist, setAddingToPlaylist] = useState(null); // Stores the playlist object we are adding to
const [availableVideos, setAvailableVideos] = useState([]); // Videos not already in the playlist

  const API_BASE_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lecRes, playRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/lectures`),
        axios.get(`${API_BASE_URL}/playlists`)
      ]);
      setLectures(lecRes.data);
      setPlaylists(playRes.data);
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Professional Sort & Filter Logic ---
  const getSortedItems = (items) => {
    let result = [...items];
    
    // Sort logic
    if (sortBy === 'name') {
      result.sort((a, b) => (a.title || a.name).localeCompare(b.title || b.name));
    } else if (sortBy === 'latest') {
      result.sort((a, b) => b.id - a.id);
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => a.id - b.id);
    }

    // Search logic
    return result.filter(item => {
      const name = (item.title || item.name || "").toLowerCase();
      const desc = (item.description || "").toLowerCase();
      const query = searchQuery.toLowerCase();
      return name.includes(query) || desc.includes(query);
    });
  };

  const filteredLectures = getSortedItems(lectures);
  const filteredPlaylists = getSortedItems(playlists);

  // --- 3. Actions ---
  const handleCreatePlaylist = async () => {
    const name = prompt("Enter Playlist Name:");
    if (!name) return;
    try {
      await axios.post(`${API_BASE_URL}/playlists`, { 
        name, 
        description: "New Playlist Collection",
        video_ids: selectedIds 
      });
      setSelectedIds([]);
      setSelectionMode(false);
      fetchData();
    } catch (err) {
      console.error("Operation failed:", err);
      alert("An error occurred. Please try again.");
    }
  };

  const handleUnlink = async (lectureId) => {
    if (!window.confirm("Remove this video from the playlist?")) return;
    try {
      await axios.post(`${API_BASE_URL}/lectures/${lectureId}/unlink`);
      fetchData();
    } catch (err) {
      console.error("Failed to remove video:", err);
      alert("An error occurred. Please try again.");
    }
  };

  const handleOpenAddModal = (playlist) => {
    // Filter out videos already in this playlist
    const existingIds = new Set(playlist.videos?.map(v => v.id) || []);
    const available = lectures.filter(lec => !existingIds.has(lec.id));
    setAvailableVideos(available);
    setAddingToPlaylist(playlist);
  };
  
  const handleAddVideoToPlaylist = async (videoId) => {
    try {
      // Use FormData because your FastAPI backend expects Form data for video_id
      const formData = new FormData();
      formData.append("video_id", videoId);

      await axios.post(
        `${API_BASE_URL}/playlists/${addingToPlaylist.id}/add-video`, 
        formData
      );
      
      // Close modal and refresh data
      setAddingToPlaylist(null);
      fetchData();
    } catch (err) {
      console.error("Failed to add video:", err);
      alert("Could not add video. Check if the backend is running.");
    }
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', editItem.title);
    formData.append('description', editItem.description);
    if (editItem.newThumbnail) formData.append('thumbnail', editItem.newThumbnail);

    try {
      await axios.patch(`${API_BASE_URL}/lectures/${editItem.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setEditItem(null);
      fetchData();
    } catch (err) {
      console.error("Update failed:", err);
      alert("An error occurred. Please try again.");
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Permanently delete this ${type}?`)) return;
    try {
      await axios.delete(`${API_BASE_URL}/${type === 'video' ? 'lectures' : 'playlists'}/${id}`);
      fetchData();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("An error occurred. Please try again.");
    }
  };

  const moveInPlaylist = (playlistId, videoId, direction) => {
    setPlaylists(prev => prev.map(pl => {
      if (pl.id !== playlistId) return pl;
      const newVideos = [...pl.videos];
      const idx = newVideos.findIndex(v => v.id === videoId);
      if ((direction === -1 && idx === 0) || (direction === 1 && idx === newVideos.length - 1)) return pl;
      const temp = newVideos[idx];
      newVideos[idx] = newVideos[idx + direction];
      newVideos[idx + direction] = temp;
      return { ...pl, videos: newVideos };
    }));
  };

  if (loading && lectures.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <Loader2 className="animate-spin mb-4" size={48} />
      <p className="text-xl font-medium uppercase tracking-widest">Loading your archive...</p>
    </div>
  );

  return (
    <div className="pt-24 pb-12 px-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- Header Section: Title & Search --- */}
        <div className="flex flex-col lg:flex-row gap-6 items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex-shrink-0">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Archive Manager</h2>
            <p className="text-slate-500 font-medium italic">Manage your {activeTab} assets</p>
          </div>
          
          <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
            <input 
              type="text"
              placeholder={`Search through your ${activeTab}...`}
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 w-full lg:w-auto">
              <ArrowUpDown size={18} className="text-indigo-500" />
              <select 
                className="bg-transparent outline-none text-slate-600 font-black cursor-pointer text-xs uppercase tracking-wider"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="latest">Recently Added</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- Batch Actions --- */}
        <div className="flex justify-end items-center gap-4">
          <div className="flex gap-3 w-full md:w-auto">
            {activeTab === 'videos' && (
              <button 
                onClick={() => { setSelectionMode(!selectionMode); setSelectedIds([]); }} 
                className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-2xl border-2 font-black transition-all ${selectionMode ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400 shadow-sm'}`}
              >
                {selectionMode ? <X size={20}/> : <Plus size={20}/>}
                {selectionMode ? "Cancel Selection" : "Create Playlist"}
              </button>
            )}
            {selectionMode && selectedIds.length > 0 && (
              <button 
                onClick={handleCreatePlaylist} 
                className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 animate-in zoom-in-95"
              >
                <FolderPlus size={20}/> Save Playlist ({selectedIds.length})
              </button>
            )}
          </div>
        </div>

        {/* --- Main Content Grid --- */}
        {activeTab === 'videos' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredLectures.map((lecture) => (
              <div 
                key={lecture.id} 
                className={`group bg-white rounded-[2.5rem] border-2 overflow-hidden relative transition-all duration-300 ${selectionMode && selectedIds.includes(lecture.id) ? 'border-indigo-500 ring-[12px] ring-indigo-50 scale-[1.02]' : 'border-transparent shadow-md hover:shadow-2xl'}`}
              >
                {selectionMode && (
                  <div className="absolute inset-0 z-30 cursor-pointer" onClick={() => toggleSelection(lecture.id)} />
                )}
                
                <div className="absolute top-5 right-5 z-40 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  {!selectionMode && (
                    <>
                      <button onClick={() => setEditItem(lecture)} className="p-3.5 bg-white/95 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white shadow-2xl transition-all"><Edit size={20} /></button>
                      <button onClick={() => handleDelete('video', lecture.id)} className="p-3.5 bg-white/95 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white shadow-2xl transition-all"><Trash2 size={20} /></button>
                    </>
                  )}
                </div>

                {selectionMode && selectedIds.includes(lecture.id) && (
                  <div className="absolute top-8 left-8 z-40 bg-indigo-600 text-white p-2 rounded-full shadow-2xl">
                    <CheckCircle2 size={32} />
                  </div>
                )}

                <div 
                  className="aspect-video bg-slate-900 relative flex items-center justify-center cursor-pointer overflow-hidden" 
                  onClick={() => !selectionMode && setSelectedVideo(lecture)}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <PlayCircle className="text-white opacity-70 group-hover:opacity-100 group-hover:scale-125 transition-all z-20" size={80} />
                  <img 
                    src={`${API_BASE_URL}/static/${lecture.thumbnail_url || lecture.video_url.replace('output_', 'input_').replace('.mp4', '.jpg')}`} 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                    alt={lecture.title} 
                  />
                </div>

                <div className="p-9">
                  <h3 className="text-2xl font-black text-slate-800 truncate mb-3">{lecture.title}</h3>
                  <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed font-medium">{lecture.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* --- Playlist View --- */
          <div className="space-y-12">
            {filteredPlaylists.map(pl => (
              <div key={pl.id} className="bg-white rounded-[3rem] border border-slate-100 p-12 shadow-sm relative overflow-hidden group/pl transition-all hover:shadow-md">
                <div className="absolute top-0 left-0 w-3 h-full bg-indigo-500" />
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                  <div className="flex items-center gap-6">
                    <div className="p-6 bg-indigo-50 text-indigo-600 rounded-[2rem] shadow-sm">
                      <Film size={40} />
                    </div>
                    <div>
                      <h2 className="text-4xl font-black text-slate-900 tracking-tight">{pl.name}</h2>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                          {pl.videos?.length || 0} Lectures
                        </span>
                      </div>
                    </div>
                  </div>
{/* Modify the Action Buttons in the Playlist Header */}
<div className="flex gap-3">
            <button 
              onClick={() => handleOpenAddModal(pl)} 
              className="p-4 text-indigo-500 hover:bg-indigo-50 rounded-2xl transition-all shadow-sm border border-slate-100 bg-white"
              title="Add videos to this playlist"
            >
              <Plus size={28}/>
            </button>
            <button 
              onClick={() => handleDelete('playlist', pl.id)} 
              className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all shadow-sm border border-slate-100 bg-white"
            >
              <Trash2 size={28}/>
            </button>
          </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {pl.videos?.map((vid) => (
                    <div key={vid.id} className="bg-slate-50 rounded-[2rem] p-5 border border-slate-100 group relative transition-all hover:bg-white hover:shadow-2xl">
                      <div 
                        className="aspect-video rounded-2xl bg-slate-200 overflow-hidden mb-5 cursor-pointer relative flex items-center justify-center group/play"
                        onClick={() => setSelectedVideo(vid)}
                      >
                        <PlayCircle className="absolute z-10 text-white opacity-0 group-hover/play:opacity-100 transition-opacity" size={56} />
<img 
  src={`${API_BASE_URL}/static/${vid.thumbnail_url || vid.video_url.replace('output_', 'input_').replace('.mp4', '.jpg')}`} 
  className="w-full h-full object-cover group-hover/play:scale-110 group-hover/play:brightness-50 transition-all duration-700" 
  alt={vid.title}
  onError={(e) => { 
    // Fallback image if the file is missing from the server
    e.target.src = 'https://via.placeholder.com/640x360?text=Thumbnail+Not+Found'; 
  }}
/>
                      </div>

                      <p 
                        className="font-black text-slate-800 text-base truncate cursor-pointer hover:text-indigo-600 px-2" 
                        onClick={() => setSelectedVideo(vid)}
                      >
                        {vid.title}
                      </p>
                      
                      <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => handleUnlink(vid.id)} className="p-3 bg-white text-red-500 rounded-xl shadow-xl hover:bg-red-500 hover:text-white"><Link2Off size={18}/></button>
                        <button onClick={() => moveInPlaylist(pl.id, vid.id, -1)} className="p-3 bg-white rounded-xl shadow-xl text-slate-600 hover:text-indigo-600"><ChevronUp size={18}/></button>
                        <button onClick={() => moveInPlaylist(pl.id, vid.id, 1)} className="p-3 bg-white rounded-xl shadow-xl text-slate-600 hover:text-indigo-600"><ChevronDown size={18}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Edit Modal --- */}
      {editItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setEditItem(null)} />
          <form onSubmit={handleSaveEdit} className="relative w-full max-w-lg bg-white rounded-[3.5rem] p-12 shadow-2xl space-y-10">
            <div className="flex justify-between items-center border-b border-slate-100 pb-8">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Modify Assets</h2>
              <button type="button" onClick={() => setEditItem(null)} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors"><X size={28}/></button>
            </div>
            <div className="space-y-8">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-3 ml-2">Lecture Title</label>
                <input 
                  className="w-full p-6 bg-slate-50 border-2 border-slate-50 rounded-[2rem] outline-none focus:border-indigo-500 focus:bg-white font-bold text-slate-800 transition-all shadow-sm" 
                  value={editItem.title} 
                  onChange={(e) => setEditItem({...editItem, title: e.target.value})} 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-3 ml-2">Description</label>
                <textarea 
                  className="w-full p-6 bg-slate-50 border-2 border-slate-50 rounded-[2rem] h-40 resize-none outline-none focus:border-indigo-500 focus:bg-white font-medium text-slate-600 transition-all shadow-sm" 
                  value={editItem.description} 
                  onChange={(e) => setEditItem({...editItem, description: e.target.value})} 
                />
              </div>
              <div className="relative group/up">
                <div className="border-2 border-dashed border-slate-200 rounded-[2.5rem] p-10 flex flex-col items-center hover:bg-indigo-50 hover:border-indigo-300 transition-all cursor-pointer bg-slate-50/50">
                  <Upload className="text-indigo-400 mb-4 group-hover/up:scale-125 transition-transform duration-500" size={40} />
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Update Thumbnail</span>
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setEditItem({...editItem, newThumbnail: e.target.files[0]})} />
                </div>
                {editItem.newThumbnail && (
                  <div className="mt-5 flex items-center gap-3 text-indigo-600 bg-indigo-50 p-4 rounded-2xl border border-indigo-100 animate-in fade-in slide-in-from-top-2">
                    <Info size={18}/>
                    <span className="text-xs font-black truncate">{editItem.newThumbnail.name}</span>
                  </div>
                )}
              </div>
            </div>
            <button type="submit" className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:translate-y-[-4px] active:translate-y-0 transition-all tracking-widest text-sm uppercase">
              Commit Changes
            </button>
          </form>
        </div>
      )}

      {/* --- High-End Video Player Modal --- */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 backdrop-blur-2xl transition-all">
          <div className="absolute inset-0" onClick={() => setSelectedVideo(null)} />
          <div className="relative w-full max-w-6xl mx-auto p-4 md:p-12" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedVideo(null)} 
              className="absolute -top-6 md:top-6 right-6 z-50 p-5 bg-white/10 text-white rounded-full hover:bg-white/20 hover:rotate-90 transition-all"
            >
              <X size={32}/>
            </button>
            <div className="bg-black rounded-[3rem] overflow-hidden shadow-[0_0_120px_rgba(79,70,229,0.3)] border border-white/5">
              <video 
                controls 
                autoPlay 
                className="w-full aspect-video" 
                src={`${API_BASE_URL}/static/${selectedVideo.video_url}`} 
              />
              <div className="p-10 bg-zinc-900 border-t border-white/5">
                <h2 className="text-3xl font-black text-white mb-3 tracking-tight">{selectedVideo.title}</h2>
                <p className="text-zinc-400 font-medium leading-relaxed text-lg">{selectedVideo.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Add Video to Playlist Modal --- */}
{addingToPlaylist && (
  <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setAddingToPlaylist(null)} />
    <div className="relative w-full max-w-4xl bg-white rounded-[3rem] p-10 shadow-2xl flex flex-col max-h-[85vh]">
      <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Add to "{addingToPlaylist.name}"</h2>
          <p className="text-slate-500 text-sm font-medium">Select a video from your library to add</p>
        </div>
        <button onClick={() => setAddingToPlaylist(null)} className="p-3 hover:bg-slate-100 rounded-2xl"><X size={24}/></button>
      </div>

      <div className="overflow-y-auto pr-2 space-y-4 custom-scrollbar">
        {availableVideos.length > 0 ? (
          availableVideos.map((vid) => (
            <div key={vid.id} className="flex items-center gap-6 p-4 rounded-3xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group">
              <div className="w-40 aspect-video rounded-xl bg-slate-200 overflow-hidden flex-shrink-0">
                <img 
                  src={`${API_BASE_URL}/static/${vid.video_url.replace('output_', 'input_').replace('.mp4', '.jpg')}`} 
                  className="w-full h-full object-cover" 
                  alt="" 
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-800 truncate">{vid.title}</h4>
                <p className="text-slate-500 text-xs line-clamp-1">{vid.description}</p>
              </div>
              <button 
                onClick={() => handleAddVideoToPlaylist(vid.id)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all"
              >
                Add Video
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-slate-400 font-medium">All your videos are already in this playlist!</p>
          </div>
        )}
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default ViewArchive;