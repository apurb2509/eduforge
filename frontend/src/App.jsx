import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Auth from './pages/Auth';
// Ensure this import path matches your folder structure
import VideoGenerator from './components/VideoGenerator'; 

function App() {
  const [user, setUser] = useState(null);

  if (!user) return <Auth onLogin={setUser} />;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} onLogout={() => setUser(null)} />
      
      <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        {user.role === 'instructor' ? (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Instructor Dashboard</h1>
              <p className="text-slate-500 mt-1">Transform your knowledge into AI-powered video lectures.</p>
            </div>
            
            {/* THIS IS YOUR VIDEO GENERATOR COMPONENT */}
            <VideoGenerator />
            
          </div>
        ) : (
          <div className="u-card p-12 text-center">
             <h1 className="text-3xl font-bold text-slate-900">Student Panel</h1>
             <p className="text-slate-500 mt-4">You don't have any enrolled courses yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;