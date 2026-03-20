import React, { useState } from 'react'; // Removed useEffect
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Auth from './pages/Auth';
import VideoGenerator from './components/VideoGenerator'; 
import StudentGallery from './components/StudentGallery';
import ViewArchive from './components/ViewArchive';
import ProtectedRoute from './components/ProtectedRoute';

// Derived Navigation: No more cascading renders or unused effect errors
const NavigationManager = ({ user, onLogout, activeTab, setActiveTab }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Pure function to determine active state from the URL
  const getActivePage = () => {
    const path = location.pathname;
    if (path === '/instructor-dashboard') return 'upload';
    if (path === '/archive') return 'archive';
    if (path === '/student-gallery') return 'dashboard';
    return 'dashboard';
  };

  const handlePageChange = (pageId) => {
    if (pageId === 'upload') navigate('/instructor-dashboard');
    else if (pageId === 'archive') navigate('/archive');
    else if (pageId === 'dashboard') {
      navigate(user.role === 'instructor' ? '/instructor-dashboard' : '/student-gallery');
    }
  };

  return (
    <Navbar 
      user={user} 
      onLogout={onLogout} 
      activePage={getActivePage()} 
      setActivePage={handlePageChange}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    />
  );
};

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Failed to parse user", error);
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState('videos');

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <Router>
      <div className="h-screen w-full bg-slate-50 flex flex-col overflow-hidden">
        {user && (
          <NavigationManager 
            user={user} 
            onLogout={handleLogout} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
          />
        )}
        
        <main className="flex-1 overflow-y-auto w-full h-full">
          <Routes>
            <Route 
              path="/" 
              element={!user ? (
                <Auth onLogin={setUser} />
              ) : (
                <Navigate to={user.role === 'instructor' ? "/instructor-dashboard" : "/student-gallery"} replace />
              )} 
            />

            <Route 
              path="/instructor-dashboard" 
              element={
                <ProtectedRoute user={user} allowedRole="instructor">
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 px-6 md:px-12 pt-24 pb-8">
                    <div className="mb-6">
                      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Instructor Dashboard</h1>
                    </div>
                    <VideoGenerator user={user} />
                  </div>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/archive" 
              element={
                <ProtectedRoute user={user} allowedRole="instructor">
                  <ViewArchive user={user} activeTab={activeTab} />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/student-gallery" 
              element={
                <ProtectedRoute user={user} allowedRole="student">
                  <StudentGallery activeTab={activeTab} />
                </ProtectedRoute>
              } 
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;