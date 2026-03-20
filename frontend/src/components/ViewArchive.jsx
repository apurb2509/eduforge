import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Edit, Trash2, Calendar, User, Loader2, PlayCircle, X, Search,
  Plus, FolderPlus, Film, CheckCircle2, ChevronUp, ChevronDown, 
  Upload, Link2Off, ArrowUpDown, Info
} from 'lucide-react';

const ViewArchive = () => {
  // --- 1. State Management ---
  const [lectures, setLectures] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('videos'); 
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest"); // 'latest', 'oldest', 'name'
  
  // Selection/Modals
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [editItem, setEditItem] = useState(null); 
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

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
      <p className="text-xl font-medium">Loading your archive...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4">
      
      {/* --- Header Section: Search & Professional Filters --- */}
      <div className="flex flex-col lg:flex-row gap-4 items-center bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
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
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
            <ArrowUpDown size={18} className="text-indigo-500" />
            <select 
              className="bg-transparent outline-none text-slate-600 font-bold cursor-pointer text-sm"
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

      {/* --- Navigation & Batch Actions --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex p-1.5 bg-white rounded-2xl shadow-sm border border-slate-100 w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('videos')} 
            className={`flex-1 md:flex-none px-10 py-3 rounded-xl font-black transition-all ${activeTab === 'videos' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Videos
          </button>
          <button 
            onClick={() => setActiveTab('playlists')} 
            className={`flex-1 md:flex-none px-10 py-3 rounded-xl font-black transition-all ${activeTab === 'playlists' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Playlists
          </button>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          {activeTab === 'videos' && (
            <button 
              onClick={() => { setSelectionMode(!selectionMode); setSelectedIds([]); }} 
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border-2 font-bold transition-all ${selectionMode ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'}`}
            >
              {selectionMode ? <X size={20}/> : <Plus size={20}/>}
              {selectionMode ? "Cancel Selection" : "Create Playlist"}
            </button>
          )}
          {selectionMode && selectedIds.length > 0 && (
            <button 
              onClick={handleCreatePlaylist} 
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 animate-in zoom-in-95"
            >
              <FolderPlus size={20}/> Save Playlist ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      {/* --- Main Content Grid --- */}
      {activeTab === 'videos' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredLectures.map((lecture) => (
            <div 
              key={lecture.id} 
              className={`group bg-white rounded-[2rem] border-2 overflow-hidden relative transition-all duration-300 ${selectionMode && selectedIds.includes(lecture.id) ? 'border-indigo-500 ring-8 ring-indigo-50 scale-[1.02]' : 'border-transparent shadow-md hover:shadow-xl'}`}
            >
              {selectionMode && (
                <div className="absolute inset-0 z-30 cursor-pointer" onClick={() => toggleSelection(lecture.id)} />
              )}
              
              <div className="absolute top-4 right-4 z-40 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                {!selectionMode && (
                  <>
                    <button onClick={() => setEditItem(lecture)} className="p-3 bg-white/95 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white shadow-xl"><Edit size={18} /></button>
                    <button onClick={() => handleDelete('video', lecture.id)} className="p-3 bg-white/95 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white shadow-xl"><Trash2 size={18} /></button>
                  </>
                )}
              </div>

              {selectionMode && selectedIds.includes(lecture.id) && (
                <div className="absolute top-6 left-6 z-40 bg-indigo-600 text-white p-1.5 rounded-full shadow-2xl">
                  <CheckCircle2 size={28} />
                </div>
              )}

              <div 
                className="aspect-video bg-slate-900 relative flex items-center justify-center cursor-pointer overflow-hidden" 
                onClick={() => !selectionMode && setSelectedVideo(lecture)}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <PlayCircle className="text-white opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all z-20" size={72} />
                <img 
                  src={`${API_BASE_URL}/static/${lecture.thumbnail_url || lecture.video_url.replace('output_', 'input_').replace('.mp4', '.jpg')}`} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  alt={lecture.title} 
                />
              </div>

              <div className="p-8">
                <h3 className="text-xl font-black text-slate-800 truncate mb-2">{lecture.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">{lecture.description}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* --- Playlist View --- */
        <div className="space-y-10">
          {filteredPlaylists.map(pl => (
            <div key={pl.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm relative overflow-hidden group/pl">
              <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500" />
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div className="flex items-center gap-5">
                  <div className="p-5 bg-indigo-50 text-indigo-600 rounded-[1.5rem]">
                    <Film size={32} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900">{pl.name}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        {pl.videos?.length || 0} Items
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete('playlist', pl.id)} 
                  className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                >
                  <Trash2 size={24}/>
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {pl.videos?.map((vid) => (
                  <div key={vid.id} className="bg-slate-50 rounded-3xl p-4 border border-slate-100 group relative transition-all hover:bg-white hover:shadow-xl">
                    <div 
                      className="aspect-video rounded-2xl bg-slate-200 overflow-hidden mb-4 cursor-pointer relative flex items-center justify-center group/play"
                      onClick={() => setSelectedVideo(vid)}
                    >
                      <PlayCircle className="absolute z-10 text-white opacity-0 group-hover/play:opacity-100 transition-opacity" size={48} />
                      <img 
                        src={`${API_BASE_URL}/static/${vid.video_url.replace('output_', 'input_').replace('.mp4', '.jpg')}`} 
                        className="w-full h-full object-cover group-hover/play:scale-110 group-hover/play:brightness-50 transition-all duration-500" 
                        alt={vid.title}
                      />
                    </div>

                    <p 
                      className="font-bold text-slate-800 text-sm truncate cursor-pointer hover:text-indigo-600 px-1" 
                      onClick={() => setSelectedVideo(vid)}
                    >
                      {vid.title}
                    </p>
                    
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => handleUnlink(vid.id)} className="p-2.5 bg-white text-red-500 rounded-xl shadow-lg hover:bg-red-500 hover:text-white"><Link2Off size={16}/></button>
                      <button onClick={() => moveInPlaylist(pl.id, vid.id, -1)} className="p-2.5 bg-white rounded-xl shadow-lg text-slate-600 hover:text-indigo-600"><ChevronUp size={16}/></button>
                      <button onClick={() => moveInPlaylist(pl.id, vid.id, 1)} className="p-2.5 bg-white rounded-xl shadow-lg text-slate-600 hover:text-indigo-600"><ChevronDown size={16}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- Edit Modal --- */}
      {editItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setEditItem(null)} />
          <form onSubmit={handleSaveEdit} className="relative w-full max-w-lg bg-white rounded-[3rem] p-12 shadow-2xl space-y-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-6">
              <h2 className="text-3xl font-black text-slate-900">Edit Asset</h2>
              <button type="button" onClick={() => setEditItem(null)} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors"><X size={24}/></button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Title</label>
                <input 
                  className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] outline-none focus:border-indigo-500 focus:bg-white font-bold text-slate-700 transition-all" 
                  value={editItem.title} 
                  onChange={(e) => setEditItem({...editItem, title: e.target.value})} 
                />
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Description</label>
                <textarea 
                  className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] h-32 resize-none outline-none focus:border-indigo-500 focus:bg-white font-medium text-slate-600 transition-all" 
                  value={editItem.description} 
                  onChange={(e) => setEditItem({...editItem, description: e.target.value})} 
                />
              </div>
              <div className="relative group/up">
                <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-8 flex flex-col items-center hover:bg-indigo-50 hover:border-indigo-300 transition-all cursor-pointer">
                  <Upload className="text-indigo-400 mb-3 group-hover/up:scale-110 transition-transform" size={32} />
                  <span className="text-sm font-black text-slate-500">Drop New Thumbnail</span>
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setEditItem({...editItem, newThumbnail: e.target.files[0]})} />
                </div>
                {editItem.newThumbnail && (
                  <div className="mt-4 flex items-center gap-2 text-indigo-600 bg-indigo-50 p-3 rounded-xl">
                    <Info size={16}/>
                    <span className="text-xs font-bold truncate">{editItem.newThumbnail.name}</span>
                  </div>
                )}
              </div>
            </div>
            <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:translate-y-[-2px] active:translate-y-0 transition-all">
              Commit Changes
            </button>
          </form>
        </div>
      )}

      {/* --- High-End Video Player Modal --- */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 backdrop-blur-2xl transition-all">
          <div className="absolute inset-0" onClick={() => setSelectedVideo(null)} />
          <div className="relative w-full max-w-6xl mx-auto p-4 md:p-10" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedVideo(null)} 
              className="absolute -top-4 md:top-4 right-4 z-50 p-4 bg-white/10 text-white rounded-full hover:bg-white/20 hover:rotate-90 transition-all"
            >
              <X size={28}/>
            </button>
            <div className="bg-black rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(79,70,229,0.2)]">
              <video 
                controls 
                autoPlay 
                className="w-full aspect-video" 
                src={`${API_BASE_URL}/static/${selectedVideo.video_url}`} 
              />
              <div className="p-8 bg-zinc-900 border-t border-white/5">
                <h2 className="text-2xl font-black text-white mb-2">{selectedVideo.title}</h2>
                <p className="text-zinc-400 font-medium leading-relaxed">{selectedVideo.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewArchive;