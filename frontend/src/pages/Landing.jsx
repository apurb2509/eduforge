import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Zap, Target, Shield } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';
import Footer from '../components/Footer';
import heroBg from '../assets/carousel-1.jpg'; 

gsap.registerPlugin(ScrollTrigger);

const Landing = () => {
  const navigate = useNavigate();
  const container = useRef();
  const [progress, setProgress] = useState(0);

  const features = [
    { icon: <Zap size={24}/>, title: "Instant Generation", desc: "Convert concepts into video lectures in seconds using RAG." },
    { icon: <Target size={24}/>, title: "Precision Learning", desc: "Adaptive content tailored to specific curriculum standards." },
    { icon: <Shield size={24}/>, title: "Verified Knowledge", desc: "Built-in validation to ensure educational accuracy." }
  ];

  // Force Scroll to top on manual refresh
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  useGSAP(() => {
    // 1. INITIALIZE LENIS (Smooth Scroll)
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      infinite: false,
    });

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // 2. LOADER TIMELINE
    const tl = gsap.timeline({
      onComplete: () => {
        // Remove loader from accessibility tree and DOM flow
        gsap.set(".loader-wrapper", { display: "none", visibility: "hidden" });
        // Recalculate positions for ScrollTrigger after DOM is clear
        ScrollTrigger.refresh(true);
      }
    });

    tl.to({}, {
      duration: 1.5,
      onUpdate: function() {
        setProgress(Math.round(this.progress() * 100));
      },
      ease: "power1.inOut"
    })
    .to(".loader-circle", { 
      strokeDashoffset: 0, 
      duration: 1.5, 
      ease: "power1.inOut" 
    }, 0)
    .to(".loader-wrapper", { 
      opacity: 0, 
      duration: 0.5 
    });

    // 3. SCROLL ANIMATIONS
    // Feature Cards Reveal
    gsap.from(".feature-card", {
      scrollTrigger: {
        trigger: "#features",
        start: "top 85%",
        toggleActions: "play none none none"
      },
      y: 60,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: "power3.out",
      clearProps: "all" 
    });

    // Vision Section Reveal
    gsap.from(".vision-animate", {
      scrollTrigger: {
        trigger: "#vision",
        start: "top 85%",
      },
      scale: 0.95,
      opacity: 0,
      y: 40,
      duration: 1.2,
      stagger: 0.3,
      ease: "expo.out",
      clearProps: "all"
    });

    // 4. CLEANUP
    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, { scope: container });

  return (
    <div ref={container} className="relative w-full bg-white">
      
      {/* 0-100% CIRCULAR LOADER */}
      <div className="loader-wrapper fixed inset-0 z-[9999] bg-slate-900 flex flex-col items-center justify-center pointer-events-none">
        <div className="relative flex items-center justify-center">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-slate-800" />
            <circle 
              cx="48" cy="48" r="44" 
              stroke="currentColor" strokeWidth="3" fill="transparent" 
              strokeDasharray="276.46" strokeDashoffset="276.46"
              className="loader-circle text-indigo-500" 
            />
          </svg>
          <span className="absolute text-white font-mono text-xl font-bold">
            {progress}%
          </span>
        </div>
        <span className="mt-4 text-slate-500 text-[10px] uppercase tracking-[0.3em] font-bold">Initialising EduForge</span>
      </div>

      {/* HERO SECTION */}
      <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-slate-900">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBg})`, opacity: 0.4 }}
        />
        
        <div className="relative z-10 flex flex-col items-center text-center px-6">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 mb-8">
            <span className="text-indigo-400 animate-pulse text-xs font-black uppercase tracking-[0.2em]">Now in Beta</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
            Forge Your <span className="text-indigo-500">Future</span><br/>With AI
          </h1>
          
          <p className="max-w-2xl mx-auto text-slate-300 text-lg md:text-xl mb-12 font-medium">
            The world's first event-driven educational platform designed for 
            autonomous learning and AI-powered media generation.
          </p>

          <button 
            onClick={() => navigate('/auth')}
            className="group flex flex-col items-center justify-center gap-4 transition-all hover:scale-105 active:scale-95"
          >
            <div className="bg-indigo-600 p-6 rounded-full shadow-[0_0_50px_rgba(79,70,229,0.4)] 
                            group-hover:bg-green-600 group-hover:shadow-[0_0_60px_rgba(34,197,94,0.6)] 
                            transition-all duration-500 border-4 border-white/20 flex items-center justify-center">
              <Compass className="text-white" size={48} style={{ animation: 'spin 12s linear infinite' }} />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-white font-black tracking-[0.3em] uppercase text-sm group-hover:text-green-400 transition-colors">
                Discover EduForge
              </span>
              <div className="h-1 w-8 bg-indigo-500 rounded-full mt-2 transition-all group-hover:w-24 group-hover:bg-green-500"></div>
            </div>
          </button>
        </div>
      </section>

      {/* WHY EDUFORGE SECTION */}
      <section id="features" className="relative z-10 py-24 px-6 max-w-7xl mx-auto min-h-[500px] bg-white">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Why EduForge Over Others?</h2>
          <div className="h-1.5 w-20 bg-indigo-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="feature-card p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl transition-all group">
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
      <section id="vision" className="relative z-10 bg-slate-900 py-24 px-6 overflow-visible">
         <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
            <div className="vision-animate flex-1">
                <h2 className="text-4xl font-black text-white mb-6">Our Vision for <span className="text-indigo-400">2027</span></h2>
                <p className="text-slate-400 text-lg leading-relaxed mb-8">
                    We believe that education should be as dynamic as the world around us. 
                    EduForge aims to democratize high-quality instructional content 
                    by allowing anyone to generate master-class level videos.
                </p>
            </div>
            <div className="vision-animate flex-1 bg-white/5 backdrop-blur-xl p-8 rounded-[3rem] border border-white/10">
                <blockquote className="text-2xl font-medium text-slate-300 italic">
                    "The best way to predict the future of learning is to build the forge."
                </blockquote>
            </div>
         </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;