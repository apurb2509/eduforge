import React, { useState, useRef } from 'react';
import { Upload, Wand2, Loader2, PlayCircle, FileText, CheckCircle2, X } from 'lucide-react';
import axios from 'axios';

const VideoGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [status, setStatus] = useState("");
  const fileInputRef = useRef(null);

  // Handle Image Selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Remove Selected Image
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerate = async () => {
    if (!script) return alert("Please enter a script first!");
    if (!imageFile) return alert("Please upload an instructor image!");

    setLoading(true);
    setStatus("Processing Audio & Lip-Sync...");
    setVideoUrl(null);

    const formData = new FormData();
    formData.append("script", script);
    formData.append("image", imageFile);

    try {
      // Point this to your FastAPI endpoint
      const response = await axios.post("http://localhost:8000/generate-video", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Assuming your backend returns the path or URL of the generated video
      setVideoUrl(response.data.video_url);
      setStatus("Video Generated Successfully!");
    } catch (error) {
      console.error("Error generating video:", error);
      setStatus("Error: Could not connect to backend.");
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
            {/* Image Upload Area */}
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
              onClick={handleGenerate}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl flex flex-col items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100 group"
            >
              {loading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="animate-spin" size={28} />
                  <span className="text-[10px] font-medium animate-pulse opacity-80 uppercase tracking-widest">{status}</span>
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
            <video 
              src={`http://localhost:8000/${videoUrl}`} 
              controls 
              className="w-full h-full"
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <PlayCircle size={48} className={`${loading ? 'text-indigo-500 animate-pulse' : 'text-slate-700'} mb-2`} />
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                {loading ? "AI is rendering..." : "Video Preview"}
              </p>
            </>
          )}
        </div>
        
        {/* Status Notification */}
        {status && !loading && (
          <div className={`p-4 rounded-xl flex items-center gap-3 border animate-in slide-in-from-right-4 ${
            status.includes("Error") ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50 border-green-100 text-green-700'
          }`}>
            <CheckCircle2 size={18} />
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
            <li className="flex gap-2">
              <span className="text-indigo-500 font-bold">•</span>
              Ensure your lighting is consistent in the photo.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VideoGenerator;