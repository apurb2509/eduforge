import React, { useState, useRef, useEffect } from 'react';
import { Upload, Wand2, Loader2, PlayCircle, FileText, CheckCircle2, X, AlertCircle } from 'lucide-react';
import axios from 'axios';

const VideoGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0); 
  
  // --- New states for Title & Description ---
  const [showModal, setShowModal] = useState(false);
  const [lectureTitle, setLectureTitle] = useState("");
  const [description, setDescription] = useState("");
  
  const fileInputRef = useRef(null);

  // --- WebSocket Listener for Real-Time Progress ---
  useEffect(() => {
    const socket = new WebSocket('ws://127.0.0.1:8000/ws/progress');

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.progress !== undefined) {
        setProgress(data.progress);
        setStatus(data.status || "Processing...");
      }
    };

    socket.onerror = () => console.error("WebSocket error");
    
    return () => socket.close();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Triggered when user clicks "Generate AI Lecture"
  const startGenerationFlow = () => {
    if (!script) return alert("Please enter a script!");
    if (!imageFile) return alert("Please upload an image!");
    setShowModal(true); // Show the title/description modal
  };

  const handleGenerate = async () => {
    if (!lectureTitle) return alert("Please enter a title!");
    
    setShowModal(false);
    setLoading(true);
    setProgress(0); 
    setStatus("Connecting to AI Engine...");
    setVideoUrl(null);

    const formData = new FormData();
    formData.append("text", script);
    formData.append("image", imageFile);
    formData.append("title", lectureTitle);
    formData.append("description", description); // Sent to updated backend
    formData.append("instructor_name", "Apurb");

    try {
      const res = await axios.post("http://127.0.0.1:8000/generate-video", formData);
      setVideoUrl(res.data.video_url);
      setStatus("Video Generated Successfully!");
      // Reset inputs after success
      setLectureTitle("");
      setDescription("");
    } catch (err) {
      console.error("Upload failed", err);
      setStatus("Error: Failed to generate video.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 animate-in fade-in duration-500">
      
      {/* Input Section */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
            <FileText size={18} className="text-indigo-600" /> Lecture Script
          </label>
          <textarea 
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Paste your medical notes or lecture script here..."
            className="w-full h-64 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none text-slate-600 bg-slate-50/50"
          />
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              onClick={() => fileInputRef.current.click()}
              className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer group ${
                imagePreview ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                className="hidden" 
                accept="image/*"
              />
              
              {imagePreview ? (
                <div className="relative w-full h-full flex flex-col items-center">
                  <img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-full border-2 border-indigo-500 shadow-md mb-2" />
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-tighter">Image Uploaded</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeImage(); }}
                    className="absolute -top-4 -right-4 bg-white shadow-md rounded-full p-1 text-slate-400 hover:text-red-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="text-slate-400 group-hover:text-indigo-500 mb-2" size={32} />
                  <span className="text-sm font-medium text-slate-600 text-center">Upload Instructor Image</span>
                </>
              )}
            </div>
            
            <button 
              onClick={startGenerationFlow}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl flex flex-col items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100 group px-6 py-4"
            >
              {loading ? (
                <div className="flex flex-col items-center gap-2 w-full">
                  <div className="flex items-center gap-3">
                    <Loader2 className="animate-spin" size={24} />
                    <span className="font-bold">{progress}%</span>
                  </div>
                  <div className="w-full bg-indigo-400/30 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div 
                      className="bg-white h-full transition-all duration-500" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest opacity-90 truncate max-w-[150px]">
                    {status}
                  </span>
                </div>
              ) : (
                <>
                  <Wand2 className="group-hover:rotate-12 transition-transform" size={28} />
                  <span className="font-bold">Generate AI Lecture</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Output / Preview Section */}
      <div className="space-y-6">
        <div className="bg-slate-900 rounded-2xl aspect-video flex flex-col items-center justify-center border border-slate-800 shadow-xl overflow-hidden group relative">
          {videoUrl ? (
            <video src={videoUrl} controls autoPlay className="w-full h-full object-contain" />
          ) : (
            <>
              <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              {loading ? (
                <div className="flex flex-col items-center">
                   <div className="relative flex items-center justify-center mb-4">
                      <Loader2 size={64} className="text-indigo-500 animate-spin absolute" />
                      <span className="text-indigo-400 text-xs font-bold">{progress}%</span>
                   </div>
                   <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] animate-pulse">
                     {status}
                   </p>
                </div>
              ) : (
                <>
                  <PlayCircle size={48} className="text-slate-700 mb-2" />
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Video Preview</p>
                </>
              )}
            </>
          )}
        </div>
        
        {status && !loading && (
          <div className={`p-4 rounded-xl flex items-center gap-3 border animate-in slide-in-from-right-4 ${
            status.includes("Error") ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50 border-green-100 text-green-700'
          }`}>
            {status.includes("Error") ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span className="text-sm font-medium">{status}</span>
          </div>
        )}

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-3">Generation Tips</h3>
          <ul className="text-xs text-slate-500 space-y-3">
            <li className="flex gap-2">
              <span className="text-indigo-500 font-bold">•</span>
              Use clear, front-facing portrait images for better lip-sync.
            </li>
            <li className="flex gap-2">
              <span className="text-indigo-500 font-bold">•</span>
              Keep scripts under 500 words for faster processing.
            </li>
          </ul>
        </div>
      </div>

      {/* --- NEW MODAL FOR TITLE & DESCRIPTION --- */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 border border-slate-100 transform animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Lecture Details</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Lecture Title</label>
                <input 
                  type="text"
                  value={lectureTitle}
                  onChange={(e) => setLectureTitle(e.target.value)}
                  placeholder="e.g., Intro to Anatomy"
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Description / Caption</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide a brief summary for students..."
                  className="w-full p-3 h-32 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleGenerate}
                  className="flex-1 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                >
                  Start Processing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoGenerator;