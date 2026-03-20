import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout, LogOut, Video, User, FolderArchive, Layers } from 'lucide-react';

const Navbar = ({ user, onLogout, activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/');
  };

  // Helper to change tab AND navigate to the correct page
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Redirect logic: If not already on an archive/gallery page, go there
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

        {/* Navigation Links */}
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

          {/* Vertical Divider */}
          <div className="h-6 w-px bg-slate-200 mx-2" />

          {/* Functional Toggle Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => handleTabChange('videos')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'videos' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Video size={14} />
              Videos
            </button>
            <button 
              onClick={() => handleTabChange('playlists')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'playlists' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Layers size={14} />
              Playlists
            </button>
          </div>
        </div>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-sm font-bold text-slate-900">{user.full_name || 'User'}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
              {user.role}
            </span>
          </div>
          
          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
            <User size={20} className="text-slate-500" />
          </div>

          <button 
            onClick={handleLogoutClick}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;