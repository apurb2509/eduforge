import React, { useState } from 'react';
import { Mail, Lock, User, GraduationCap, Presentation } from 'lucide-react';

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('student');

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-indigo-600 p-8 text-center text-white">
          <h2 className="text-3xl font-bold">EduForge</h2>
          <p className="mt-2 text-indigo-100">Ignite your learning journey</p>
        </div>

        <div className="p-8">
          {/* Toggle Login/Signup */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${isLogin ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
            >
              Login
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${!isLogin ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
            >
              Sign Up
            </button>
          </div>

          <form className="space-x-y-4">
            {!isLogin && (
              <div className="relative mb-4">
                <User className="absolute left-3 top-3 text-slate-400" size={20} />
                <input type="text" placeholder="Full Name" className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
            )}
            
            <div className="relative mb-4">
              <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
              <input type="email" placeholder="Email Address" className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            <div className="relative mb-6">
              <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
              <input type="password" placeholder="Password" className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            {/* Role Selection */}
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4 mb-8">
                <button 
                  type="button"
                  onClick={() => setRole('student')}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center transition-all ${role === 'student' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <GraduationCap className={role === 'student' ? 'text-indigo-600' : 'text-slate-400'} />
                  <span className={`text-sm mt-2 font-medium ${role === 'student' ? 'text-indigo-600' : 'text-slate-600'}`}>Student</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setRole('instructor')}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center transition-all ${role === 'instructor' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <Presentation className={role === 'instructor' ? 'text-indigo-600' : 'text-slate-400'} />
                  <span className={`text-sm mt-2 font-medium ${role === 'instructor' ? 'text-indigo-600' : 'text-slate-600'}`}>Instructor</span>
                </button>
              </div>
            )}

            <button 
              type="button"
              onClick={() => onLogin({ name: 'Apurb', role: isLogin ? 'instructor' : role })}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
            >
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;