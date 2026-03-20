import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Edit, Trash2, Calendar, User, Loader2, PlayCircle, X, 
  Plus, FolderPlus, Film, CheckCircle2, ChevronUp, ChevronDown, Upload 
} from 'lucide-react';

const ViewArchive = () => {
  // --- 1. State Management ---
  const [lectures, setLectures] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('videos'); // 'videos' or 'playlists'
  
  // Selection/Modals
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [editItem, setEditItem] = useState(null); // Item currently being edited
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
      console.error("Fetch failed:", err); // Fixed: err is now used
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Playlist Logic ---
  const handleCreatePlaylist = async () => {
    const name = prompt("Enter Playlist Name:");
    if (!name) return;
    
    try {
      await axios.post(`${API_BASE_URL}/playlists`, { 
        name, 
        description: "New Playlist",
        video_ids: selectedIds 
      });
      setSelectedIds([]);
      setSelectionMode(false);
      fetchData();
    } catch (err) {
      console.error("Error creating playlist:", err); // Fixed: err is now used
      alert("Error creating playlist");
    }
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // --- 3. Update & Upload Logic ---
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', editItem.title);
    formData.append('description', editItem.description);
    if (editItem.newThumbnail) {
      formData.append('thumbnail', editItem.newThumbnail);
    }

    try {
      await axios.patch(`${API_BASE_URL}/lectures/${editItem.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setEditItem(null);
      fetchData();
    } catch (err) {
      console.error("Update failed:", err); // Fixed: err is now used
      alert("Update failed");
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Delete this ${type}?`)) return;
    try {
      await axios.delete(`${API_BASE_URL}/${type === 'video' ? 'lectures' : 'playlists'}/${id}`);
      fetchData();
    } catch (err) {
      console.error(`Delete ${type} failed:`, err); // Fixed: err is now used
      alert("Delete failed");
    }
  };

  // --- 4. Reorder Logic ---
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
    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
      <Loader2 className="animate-spin mb-2" size={32} />
      <p>Syncing Archive...</p>
    </div>
  );

  return (
    <div className="space-y-8 p-2">
      {/* --- Control Bar --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex p-1 bg-slate-100 rounded-2xl">
          <button 
            onClick={() => setActiveTab('videos')}
            className={`px-6 py-2 rounded-xl font-medium transition-all ${activeTab === 'videos' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
          >
            Videos
          </button>
          <button 
            onClick={() => setActiveTab('playlists')}
            className={`px-6 py-2 rounded-xl font-medium transition-all ${activeTab === 'playlists' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
          >
            Playlists
          </button>
        </div>

        <div className="flex gap-3">
          {activeTab === 'videos' && (
            <button 
              onClick={() => { setSelectionMode(!selectionMode); setSelectedIds([]); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border font-medium transition-all ${selectionMode ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-slate-200 text-slate-700'}`}
            >
              {selectionMode ? <X size={18}/> : <Plus size={18}/>}
              {selectionMode ? "Cancel Selection" : "Select for Playlist"}
            </button>
          )}
          {selectionMode && selectedIds.length > 0 && (
            <button 
              onClick={handleCreatePlaylist}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
            >
              <FolderPlus size={18}/> Create Playlist ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      {/* --- Grid View --- */}
      {activeTab === 'videos' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {lectures.map((lecture) => (
            <div 
              key={lecture.id} 
              className={`group bg-white rounded-3xl border overflow-hidden relative transition-all ${selectionMode && selectedIds.includes(lecture.id) ? 'border-indigo-500 ring-4 ring-indigo-50 shadow-xl' : 'border-slate-200 shadow-sm'}`}
            >
              {selectionMode && (
                <div 
                  className="absolute inset-0 z-30 cursor-pointer" 
                  onClick={() => toggleSelection(lecture.id)}
                />
              )}
              
              <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                {!selectionMode && (
                  <>
                    <button onClick={() => setEditItem(lecture)} className="p-2 bg-white/90 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white shadow-md"><Edit size={18} /></button>
                    <button onClick={() => handleDelete('video', lecture.id)} className="p-2 bg-white/90 text-red-500 rounded-xl hover:bg-red-500 hover:text-white shadow-md"><Trash2 size={18} /></button>
                  </>
                )}
              </div>

              {selectionMode && selectedIds.includes(lecture.id) && (
                <div className="absolute top-4 left-4 z-40 bg-indigo-600 text-white p-1 rounded-full shadow-lg">
                  <CheckCircle2 size={24} />
                </div>
              )}

              <div className="aspect-video bg-slate-900 relative flex items-center justify-center" onClick={() => !selectionMode && setSelectedVideo(lecture)}>
                <PlayCircle className="text-white/60 group-hover:text-white z-10" size={56} />
                <img 
                  src={`${API_BASE_URL}/static/${lecture.thumbnail_url || lecture.video_url.replace('output_', 'input_').replace('.mp4', '.jpg')}`} 
                  className="absolute inset-0 w-full h-full object-cover opacity-70" 
                  alt="" 
                />
              </div>

              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-900 truncate">{lecture.title}</h3>
                <p className="text-sm text-slate-500 line-clamp-1">{lecture.description}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* --- Playlist View --- */
        <div className="space-y-6">
          {playlists.map(pl => (
            <div key={pl.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    <Film className="text-indigo-600" /> {pl.name}
                  </h2>
                  <p className="text-slate-500">{pl.videos?.length || 0} Lectures in this collection</p>
                </div>
                <button onClick={() => handleDelete('playlist', pl.id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={20}/></button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {pl.videos?.map((vid) => (
                  <div key={vid.id} className="bg-slate-50 rounded-2xl p-3 border border-slate-100 group relative">
                    <div className="aspect-video rounded-xl bg-slate-200 overflow-hidden mb-3">
                      <img src={`${API_BASE_URL}/static/${vid.video_url.replace('output_', 'input_').replace('.mp4', '.jpg')}`} className="w-full h-full object-cover" alt=""/>
                    </div>
                    <p className="font-semibold text-sm truncate">{vid.title}</p>
                    
                    <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => moveInPlaylist(pl.id, vid.id, -1)} className="p-1 bg-white rounded-md shadow text-slate-600 hover:text-indigo-600"><ChevronUp size={14}/></button>
                      <button onClick={() => moveInPlaylist(pl.id, vid.id, 1)} className="p-1 bg-white rounded-md shadow text-slate-600 hover:text-indigo-600"><ChevronDown size={14}/></button>
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
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditItem(null)} />
          <form onSubmit={handleSaveEdit} className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl space-y-5">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Edit Lecture</h2>
              <button type="button" onClick={() => setEditItem(null)}><X /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Title</label>
                <input 
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  value={editItem.title} 
                  onChange={(e) => setEditItem({...editItem, title: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Description</label>
                <textarea 
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl h-24 resize-none"
                  value={editItem.description} 
                  onChange={(e) => setEditItem({...editItem, description: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Custom Thumbnail</label>
                <div className="mt-1 relative border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center hover:bg-slate-50 transition-all">
                  <Upload className="text-slate-400 mb-2" />
                  <span className="text-xs text-slate-500">Click to upload .jpg or .png</span>
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => setEditItem({...editItem, newThumbnail: e.target.files[0]})}
                  />
                  {editItem.newThumbnail && <p className="mt-2 text-xs font-bold text-indigo-600">{editItem.newThumbnail.name}</p>}
                </div>
              </div>
            </div>

            <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all">
              Save Changes
            </button>
          </form>
        </div>
      )}

      {/* --- Video Modal Player --- */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedVideo(null)} />
          <div className="relative w-full max-w-5xl bg-black rounded-3xl overflow-hidden">
            <video controls autoPlay className="w-full aspect-video" src={`${API_BASE_URL}/static/${selectedVideo.video_url}`} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewArchive;