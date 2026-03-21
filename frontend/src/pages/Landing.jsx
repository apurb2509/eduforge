import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Zap, Target, Shield, ArrowRight, Layout } from 'lucide-react';
import Footer from '../components/Footer';
import heroBg from '../assets/hero-pic-1.jpg'; 

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    { icon: <Zap size={24}/>, title: "Instant Generation", desc: "Convert concepts into video lectures in seconds using RAG." },
    { icon: <Target size={24}/>, title: "Precision Learning", desc: "Adaptive content tailored to specific curriculum standards." },
    { icon: <Shield size={24}/>, title: "Verified Knowledge", desc: "Built-in validation to ensure educational accuracy." }
  ];

  return (
    <div className="min-h-screen bg-white">
{/* HERO SECTION */}
<section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden">
  {/* Background Image with Overlay */}
  <div 
    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
    style={{ backgroundImage: `url(${heroBg})`, filter: 'brightness(0.4)' }}
  />
  
  {/* Content Container - Ensure this is flex-col and items-center */}
  <div className="relative z-10 flex flex-col items-center text-center px-6 animate-in fade-in zoom-in duration-1000">
    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 mb-8">
      <span className="text-indigo-400 animate-pulse text-xs font-black uppercase tracking-[0.2em]">Now in Beta</span>
    </div>
    
    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
      Forge Your <span className="text-indigo-500">Future</span><br/>With AI
    </h1>
    
    <p className="max-w-2xl mx-auto text-slate-300 text-lg md:text-xl mb-12 font-medium text-center">
      The world's first event-driven educational platform designed for 
      autonomous learning and AI-powered media generation.
    </p>

    {/* THE DISCOVER ICON - Now navigating to /auth */}
{/* THE DISCOVER ICON (CENTRE PIECE) */}
<button 
  onClick={() => navigate('/auth')}
  className="group relative flex flex-col items-center justify-center gap-4 transition-all hover:scale-105 active:scale-95"
>
  {/* The Circle Container - Changes to Green on Hover */}
  <div className="bg-indigo-600 p-6 rounded-full shadow-[0_0_50px_rgba(79,70,229,0.4)] 
                  group-hover:bg-green-600 group-hover:shadow-[0_0_60px_rgba(34,197,94,0.6)] 
                  transition-all duration-500 border-4 border-white/20">
    
    {/* The Compass - Rotates slowly and needle changes color */}
    <Compass 
      className="text-white animate-spin-slow group-hover:text-white transition-colors duration-500" 
      size={48} 
      style={!window.tailwind?.config ? { animation: 'spin 8s linear infinite' } : {}} 
    />
  </div>

  <div className="flex flex-col items-center text-center">
    <span className="text-white font-black tracking-[0.3em] uppercase text-sm group-hover:text-green-400 transition-colors">
      Discover EduForge
    </span>
    {/* Underline changes to green too */}
    <div className="h-1 w-8 bg-indigo-500 rounded-full mt-2 transition-all group-hover:w-24 group-hover:bg-green-500"></div>
  </div>
</button>
  </div>
</section>

      {/* WHY EDUFORGE SECTION */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Why EduForge Over Others?</h2>
          <div className="h-1.5 w-20 bg-indigo-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
              <div className="text-indigo-600 mb-6 bg-indigo-50 w-fit p-4 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
              <p className="text-slate-600 leading-relaxed text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* VISION SECTION */}
      <section id="vision" className="bg-slate-900 py-24 px-6 overflow-hidden relative">
         <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
                <h2 className="text-4xl font-black text-white mb-6">Our Vision for <span className="text-indigo-400">2027</span></h2>
                <p className="text-slate-400 text-lg leading-relaxed mb-8">
                    We believe that education should be as dynamic as the world around us. 
                    EduForge aims to democratize high-quality instructional content 
                    by allowing anyone to generate master-class level videos using 
                    just a few prompts and datasets.
                </p>
                <div className="flex items-center gap-4 text-white font-bold">
                    <div className="h-px w-12 bg-indigo-500"></div>
                    Building the future of Instrumentation Engineering
                </div>
            </div>
            <div className="flex-1 bg-white/5 backdrop-blur-xl p-8 rounded-[3rem] border border-white/10">
                <blockquote className="text-2xl font-medium text-slate-300 italic">
                    "The best way to predict the future of learning is to build the forge that creates it."
                </blockquote>
            </div>
         </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;