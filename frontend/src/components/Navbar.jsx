import React from 'react';
import { User, LogOut, BookOpen, Video, FileText, Menu } from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="bg-white border-b border-slate-200 fixed w-full z-50 top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo Section */}
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <BookOpen className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              Edu<span className="text-indigo-600">Forge</span>
            </span>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            {user?.role === 'instructor' ? (
              <>
                <a href="#generate" className="text-slate-600 hover:text-indigo-600 font-medium flex items-center gap-1.5">
                  <Video size={18} /> Create Lecture
                </a>
                <a href="#analytics" className="text-slate-600 hover:text-indigo-600 font-medium">Dashboard</a>
              </>
            ) : (
              <>
                <a href="#courses" className="text-slate-600 hover:text-indigo-600 font-medium">My Learning</a>
                <a href="#explore" className="text-slate-600 hover:text-indigo-600 font-medium">Explore</a>
              </>
            )}
          </div>

          {/* User Profile / Auth Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-900 leading-none">{user.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                </div>
                <button 
                  onClick={onLogout}
                  className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button className="text-slate-600 font-medium hover:text-indigo-600">Login</button>
                <button className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-sm">
                  Join for Free
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;