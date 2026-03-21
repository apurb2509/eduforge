import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout, LogOut, Video, User, FolderArchive, Layers, Menu, X } from 'lucide-react';

const Navbar = ({ user, onLogout, activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogoutClick = () => {
    onLogout();
    navigate('/');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsMenuOpen(false);
    
    if (user.role === 'instructor' && location.pathname !== '/archive') {
      navigate('/archive');
    } else if (user.role === 'student' && location.pathname !== '/student-gallery') {
      navigate('/student-gallery');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-indigo-600 p-2 rounded-xl group-hover:rotate-6 transition-transform">
            <Layout className="text-white" size={20} />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
            EduForge
          </span>
        </Link>

        {/* Desktop Navigation Links - Hidden on mobile, visible on md+ */}
        <div className="hidden md:flex items-center gap-8">
          {user.role === 'instructor' ? (
            <Link 
              to="/instructor-dashboard" 
              className={`text-sm font-semibold flex items-center gap-2 transition-colors ${
                location.pathname === '/instructor-dashboard' ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'
              }`}
            >
              <Video size={18} /> Create Lecture
            </Link>
          ) : (
            <Link 
              to="/student-gallery" 
              className={`text-sm font-semibold flex items-center gap-2 transition-colors ${
                location.pathname === '/student-gallery' ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'
              }`}
            >
              <FolderArchive size={18} /> My Gallery
            </Link>
          )}

          <div className="h-6 w-px bg-slate-200 mx-2" />

          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => handleTabChange('videos')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'videos' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Video size={14} /> Videos
            </button>
            <button 
              onClick={() => handleTabChange('playlists')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'playlists' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Layers size={14} /> Playlists
            </button>
          </div>
        </div>

        {/* User Profile & Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-sm font-bold text-slate-900">{user.full_name || 'User'}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
              {user.role}
            </span>
          </div>
          
          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
            <User size={20} className="text-slate-500" />
          </div>

          {/* Mobile Menu Button - ONLY visible on small screens */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <button 
            onClick={handleLogoutClick}
            className="hidden md:block p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Dropdown - Doesn't affect desktop layout */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-4 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col gap-2">
            {user.role === 'instructor' ? (
              <Link to="/instructor-dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-sm font-bold text-slate-700">
                <Video size={18} /> Create Lecture
              </Link>
            ) : (
              <Link to="/student-gallery" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-sm font-bold text-slate-700">
                <FolderArchive size={18} /> My Gallery
              </Link>
            )}
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button onClick={() => handleTabChange('videos')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold ${activeTab === 'videos' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
              <Video size={14} /> Videos
            </button>
            <button onClick={() => handleTabChange('playlists')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold ${activeTab === 'playlists' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
              <Layers size={14} /> Playlists
            </button>
          </div>

          <button onClick={handleLogoutClick} className="w-full flex items-center justify-center gap-2 p-3 text-red-500 font-bold text-sm bg-red-50 rounded-xl">
            <LogOut size={18} /> Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;