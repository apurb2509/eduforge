import React from 'react';
import { Layout } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Brand Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Layout className="text-white" size={18} />
            </div>
            <span className="text-xl font-bold text-white">EduForge</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            The next generation of autonomous learning. Powered by advanced AI to 
            transform educational media into interactive experiences.
          </p>
        </div>

        {/* Vision & Links */}
        <div>
          <h4 className="text-white font-bold mb-4">Platform</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#vision" className="hover:text-indigo-400 transition-colors">Our Vision</a></li>
            <li><a href="#features" className="hover:text-indigo-400 transition-colors">Why EduForge</a></li>
          </ul>
        </div>

        {/* Legal Section */}
        <div>
          <h4 className="text-white font-bold mb-4">Legal & Support</h4>
          <ul className="space-y-2 text-sm">
            <li><button className="hover:text-indigo-400 transition-colors">Privacy Policy</button></li>
            <li><button className="hover:text-indigo-400 transition-colors">Terms of Service</button></li>
            <li><button className="hover:text-indigo-400 transition-colors text-slate-500 italic">Disclaimer: AI generated content may vary in accuracy.</button></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-slate-800 mt-12 pt-8 text-center text-xs text-slate-500">
        © 2026 EduForge AI Media Engine. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;