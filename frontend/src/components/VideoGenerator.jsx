import React, { useState } from 'react';
import { Upload, Wand2, Loader2, PlayCircle, FileText } from 'lucide-react';

const VideoGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState("");

  const handleGenerate = () => {
    if (!script) return alert("Please enter a script first!");
    setLoading(true);
    // Logic for calling your FastAPI backend will go here
    setTimeout(() => setLoading(false), 5000); 
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
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
            className="w-full h-64 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none text-slate-600"
          />
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center hover:border-indigo-400 hover:bg-indigo-50/50 transition-all cursor-pointer group">
              <Upload className="text-slate-400 group-hover:text-indigo-500 mb-2" size={32} />
              <span className="text-sm font-medium text-slate-600">Upload Instructor Image</span>
            </div>
            
            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl flex flex-col items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200"
            >
              {loading ? <Loader2 className="animate-spin" size={28} /> : <Wand2 size={28} />}
              <span className="font-bold">{loading ? "AI is Working..." : "Generate AI Lecture"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="space-y-6">
        <div className="bg-slate-900 rounded-2xl aspect-video flex flex-col items-center justify-center border border-slate-800 shadow-xl overflow-hidden group relative">
          <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <PlayCircle size={48} className="text-slate-700 mb-2" />
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Video Preview</p>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-3">Generation Tips</h3>
          <ul className="text-xs text-slate-500 space-y-2">
            <li>• Use clear, front-facing portrait images.</li>
            <li>• Keep scripts under 500 words for faster processing.</li>
            <li>• Ensure your lighting is consistent in the photo.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VideoGenerator;