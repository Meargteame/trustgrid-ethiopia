import React from 'react';
import { Twitter, Linkedin, Facebook } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white pt-20 pb-12 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          
          <div className="col-span-1 md:col-span-1">
            <span className="font-extrabold text-2xl tracking-tighter text-black block mb-6">
              TrustGrid.
            </span>
            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              Gemini members have over 4,000 workouts at their fingertips. Try now.
            </p>
            <a href="mailto:reach.fitness@gmail.com" className="text-xs font-bold text-black border-b border-black pb-0.5">
              trustgrid.ethiopia@gmail.com
            </a>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-4">Primary Pages</h4>
            <ul className="space-y-3 text-xs text-gray-500">
              <li><a href="#" className="hover:text-black transition-colors">Workout</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Route</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Community</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Shop</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-4">Utility pages</h4>
            <ul className="space-y-3 text-xs text-gray-500">
              <li><a href="#" className="hover:text-black transition-colors">Instructions</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Style guide</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Licenses</a></li>
              <li><a href="#" className="hover:text-black transition-colors">404 Not found</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Password protected</a></li>
            </ul>
          </div>

          <div>
             <h4 className="font-bold text-sm mb-4">Download now</h4>
             <div className="flex flex-col gap-3">
               <button className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold hover:bg-gray-800">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/3/31/Apple_logo_white.svg" className="w-4 h-4" alt="Apple" />
                 App Store
               </button>
               <button className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold hover:bg-gray-800">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/d/d7/Android_robot.svg" className="w-4 h-4 fill-white invert" alt="Android" />
                 Google Play
               </button>
             </div>
          </div>

        </div>

        <div className="border-t border-gray-100 pt-8 text-[10px] text-gray-400 flex justify-between items-center">
          <p>© {new Date().getFullYear()} TrustGrid Ethiopia.</p>
          <div className="flex gap-4">
             <a href="#" className="hover:text-black"><Twitter size={14} /></a>
             <a href="#" className="hover:text-black"><Linkedin size={14} /></a>
             <a href="#" className="hover:text-black"><Facebook size={14} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};