import React from 'react';
import { PlayCircle, Clock, BookOpen } from 'lucide-react';

const courses = [
  { id: 1, title: "Rural Health Basics", instructor: "Dr. Apurb", duration: "12 mins", thumbnail: "https://via.placeholder.com/300x180" },
  { id: 2, title: "First Aid Essentials", instructor: "Dr. Apurb", duration: "45 mins", thumbnail: "https://via.placeholder.com/300x180" },
];

const StudentGallery = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {courses.map((course) => (
        <div key={course.id} className="u-card group cursor-pointer overflow-hidden">
          <div className="relative aspect-video bg-slate-200">
            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
              <PlayCircle className="text-white" size={48} />
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-bold text-slate-900 line-clamp-1">{course.title}</h3>
            <p className="text-sm text-slate-500 mt-1">{course.instructor}</p>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 text-xs font-medium text-slate-400">
              <span className="flex items-center gap-1"><Clock size={14} /> {course.duration}</span>
              <span className="flex items-center gap-1"><BookOpen size={14} /> 4 Modules</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudentGallery;