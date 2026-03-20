import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Auth from './pages/Auth';
import VideoGenerator from './components/VideoGenerator'; 
import StudentGallery from './components/StudentGallery';
import ViewArchive from './components/ViewArchive'; // Import the new Archive component
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  // Initialize user state from localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        {/* Only show Navbar if user is logged in */}
        {user && <Navbar user={user} onLogout={handleLogout} />}
        
        <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
          <Routes>
            {/* Login/Register Route */}
            <Route 
              path="/" 
              element={
                !user ? (
                  <Auth onLogin={setUser} />
                ) : (
                  <Navigate to={user.role === 'instructor' ? "/instructor-dashboard" : "/student-gallery"} replace />
                )
              } 
            />

            {/* Instructor Protected Route - Dashboard */}
            <Route 
              path="/instructor-dashboard" 
              element={
                <ProtectedRoute user={user} allowedRole="instructor">
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="mb-8">
                      <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Instructor Dashboard</h1>
                      <p className="text-slate-500 mt-1">Transform your knowledge into AI-powered video lectures.</p>
                    </div>
                    <VideoGenerator />
                  </div>
                </ProtectedRoute>
              } 
            />

            {/* NEW: Instructor Protected Route - Archive Management */}
            <Route 
              path="/archive" 
              element={
                <ProtectedRoute user={user} allowedRole="instructor">
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="mb-8">
                      <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Lecture Archive</h1>
                      <p className="text-slate-500 mt-1">Manage your videos, playlists, and thumbnails.</p>
                    </div>
                    <ViewArchive />
                  </div>
                </ProtectedRoute>
              } 
            />

            {/* Student Protected Route */}
            <Route 
              path="/student-gallery" 
              element={
                <ProtectedRoute user={user} allowedRole="student">
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="mb-8">
                      <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Student Gallery</h1>
                      <p className="text-slate-500 mt-1">Browse and watch AI-generated lectures.</p>
                    </div>
                    <StudentGallery />
                  </div>
                </ProtectedRoute>
              } 
            />

            {/* Redirect any unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;