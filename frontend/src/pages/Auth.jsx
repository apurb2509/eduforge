import React, { useState } from 'react';
import axios from 'axios';
import { User, ShieldCheck, Mail, Lock, UserPlus, LogIn, Loader2, GraduationCap } from 'lucide-react';
import heroBg from '../assets/hero-pic-1.jpg'; // Import your hero asset

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'student'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    
    try {
      const res = await axios.post(`http://127.0.0.1:8000${endpoint}`, formData);
      if (isLogin) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        onLogin(res.data.user);
      } else {
        alert("Account created! Please log in.");
        setIsLogin(true);
      }
    } catch (err) {
      alert(err.response?.data?.detail || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-full flex items-center justify-center p-4 overflow-hidden">
      {/* Background Layer with Subtle Blur */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105 transition-all duration-700"
        style={{ 
          backgroundImage: `url(${heroBg})`,
          filter: 'blur(8px) brightness(0.7)' 
        }}
      />

      {/* Main Content Wrapper */}
      <div className="relative z-10 w-full max-w-[420px] animate-in fade-in zoom-in duration-500">
        
        {/* Branding Element - Reduced margin to save vertical space */}
        <div className="flex flex-col items-center mb-4">
            <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-xl shadow-indigo-500/20 mb-2">
                <GraduationCap className="text-white" size={28} />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight drop-shadow-md">
                EduForge
            </h1>
        </div>

        {/* Auth Card (Glassmorphism) */}
        <div className="glass-card rounded-[2rem] shadow-2xl shadow-black/20 overflow-hidden">
          
          {/* Tabs - Slimmer padding */}
          <div className="flex bg-white/40 p-1 m-3 rounded-xl backdrop-blur-md border border-white/20">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-lg font-bold text-[11px] tracking-wider transition-all duration-300 ${
                isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-indigo-700'
              }`}
            >
              SIGN IN
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-lg font-bold text-[11px] tracking-wider transition-all duration-300 ${
                !isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-indigo-700'
              }`}
            >
              REGISTER
            </button>
          </div>

          <div className="px-7 pb-8 pt-2">
            <div className="text-center mb-5">
              <h2 className="text-lg font-extrabold text-slate-800">
                {isLogin ? "Welcome Back" : "Start Your Journey"}
              </h2>
              <p className="text-slate-600 text-[10px] font-medium mt-1">
                {isLogin ? "Access your AI-powered dashboard" : "Join the next generation of autonomous learning"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {!isLogin && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-1 ml-1 tracking-widest">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      required 
                      className="w-full pl-10 pr-4 py-2.5 bg-white/80 rounded-xl border border-white/50 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-xs"
                      placeholder="Enter full name"
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase mb-1 ml-1 tracking-widest">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="email" 
                    required 
                    className="w-full pl-10 pr-4 py-2.5 bg-white/80 rounded-xl border border-white/50 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-xs"
                    placeholder="email@example.com"
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase mb-1 ml-1 tracking-widest">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="password" 
                    required 
                    className="w-full pl-10 pr-4 py-2.5 bg-white/80 rounded-xl border border-white/50 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-xs"
                    placeholder="••••••••"
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="animate-in slide-in-from-top-2 duration-400">
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-2 ml-1 tracking-widest">Account Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, role: 'student'})}
                      className={`flex items-center justify-center gap-2 py-2 rounded-xl border-2 transition-all duration-300 ${
                        formData.role === 'student' 
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                        : 'border-white/50 bg-white/50 text-slate-500 hover:bg-white'
                      }`}
                    >
                      <User size={14} /> <span className="text-[10px] font-bold">Student</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, role: 'instructor'})}
                      className={`flex items-center justify-center gap-2 py-2 rounded-xl border-2 transition-all duration-300 ${
                        formData.role === 'instructor' 
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                        : 'border-white/50 bg-white/50 text-slate-500 hover:bg-white'
                      }`}
                    >
                      <ShieldCheck size={14} /> <span className="text-[10px] font-bold">Instructor</span>
                    </button>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 mt-4 active:scale-[0.98] text-sm"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : (isLogin ? <LogIn size={18}/> : <UserPlus size={18}/>)}
                <span>{isLogin ? "Sign In" : "Register Now"}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer Credit - Tightened top margin */}
        <p className="text-center mt-6 text-white/60 text-[9px] font-medium tracking-[0.2em] uppercase">
            Powered by EduForge AI Media Engine
        </p>
      </div>
    </div>
  );
};

export default Auth;