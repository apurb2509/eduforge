import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Auth from './pages/Auth';
import VideoGenerator from './components/VideoGenerator'; 
import StudentGallery from './components/StudentGallery';
import ViewArchive from './components/ViewArchive';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
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
      <div className="h-screen w-full bg-slate-50 flex flex-col overflow-hidden">
        {user && <Navbar user={user} onLogout={handleLogout} />}
        
        {/* pb-0 here ensures the 'main' container doesn't overflow the viewport */}
        <main className="flex-1 overflow-y-auto pt-0 pb-0 w-full h-full">
          <Routes>
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

            <Route 
              path="/instructor-dashboard" 
              element={
                <ProtectedRoute user={user} allowedRole="instructor">
                  {/* Padding is handled inside the route to keep Auth screens clean */}
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 px-6 md:px-12 pt-20 pb-8">
                    <div className="mb-6">
                      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Instructor Dashboard</h1>
                      <p className="text-slate-500 text-sm">Transform your knowledge into AI-powered video lectures.</p>
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
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 px-6 md:px-12 pt-20 pb-8">
                    <div className="mb-4">
                      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Lecture Archive</h1>
                    </div>
                    <ViewArchive user={user} />
                  </div>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/student-gallery" 
              element={
                <ProtectedRoute user={user} allowedRole="student">
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 px-6 md:px-12 pt-20 pb-8">
                    <div className="mb-4">
                      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Gallery</h1>
                    </div>
                    <StudentGallery />
                  </div>
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