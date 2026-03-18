import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PlayCircle, Clock, User, Calendar } from 'lucide-react';

const StudentGallery = () => {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const res = await axios.get("http://localhost:8000/student/lectures");
        setLectures(res.data);
      } catch (error) {
        // Fixed: Use 'error' here so the linter is happy
        console.error("Failed to fetch lectures:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLectures();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {lectures.length > 0 ? (
        lectures.map((lecture) => (
          <div key={lecture.id} className="u-card group cursor-pointer overflow-hidden border border-slate-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all">
            <div className="aspect-video bg-slate-900 flex items-center justify-center relative overflow-hidden">
               <PlayCircle className="text-white/50 group-hover:text-white group-hover:scale-110 transition-all z-10" size={48} />
               <div className="absolute inset-0 bg-indigo-600/10 group-hover:bg-transparent transition-colors" />
            </div>
            
            <div className="p-5">
              <h3 className="font-bold text-slate-900 text-lg line-clamp-1">{lecture.title}</h3>
              
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                  <User size={14} className="text-indigo-500" />
                  <span>{lecture.instructor}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Calendar size={14} />
                  <span>{lecture.date}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-4 line-clamp-2 italic bg-slate-50 p-2 rounded-lg">
                "{lecture.preview}"
              </p>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300">
          <p className="text-slate-500 font-medium">No AI lectures generated yet.</p>
          <p className="text-sm text-slate-400">Switch to Instructor mode to create the first one!</p>
        </div>
      )}
    </div>
  );
};

export default StudentGallery;