import React from 'react';
import { Button } from './Button';
import { Star, QrCode } from 'lucide-react';

interface HeroProps {
  onLogin: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onLogin }) => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-white bg-grid">
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Content */}
          <div className="relative z-10 text-left">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-black tracking-tight mb-6 leading-[1.05]">
              Fuel up and build <br/>
              <span className="relative">
                 Real Trust!
                 <svg className="absolute w-full h-3 -bottom-1 left-0 text-brand-lime -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                   <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                 </svg>
              </span>
            </h1>

            <p className="mt-6 text-lg text-gray-600 mb-10 leading-relaxed max-w-lg">
              Unlock the power of verified testimonials. Turn messy chat screenshots into a professional wall of proof with our AI-powered verification tools.
            </p>

            <div className="flex items-center gap-6 mb-10">
              <div className="flex -space-x-3">
                 <img className="w-12 h-12 rounded-full border-4 border-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100" alt="User" />
                 <img className="w-12 h-12 rounded-full border-4 border-white object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&h=100" alt="User" />
                 <div className="w-12 h-12 rounded-full border-4 border-white bg-black text-white flex items-center justify-center text-xs font-bold">+2k</div>
              </div>
              <div>
                <p className="font-bold text-black text-lg leading-none">64,739</p>
                <p className="text-sm text-gray-500">Happy Businesses</p>
              </div>
              <div className="h-8 w-px bg-gray-300 mx-2"></div>
              <div>
                 <p className="font-bold text-black text-lg leading-none flex items-center gap-1">
                   4.8/5 <Star size={16} className="text-brand-lime fill-brand-lime" />
                 </p>
                 <p className="text-sm text-gray-500">Rating</p>
              </div>
            </div>

            <Button size="lg" onClick={onLogin}>
              Create Free Wall
            </Button>
          </div>

          {/* Right Content - Phone Mockup & Sunburst */}
          <div className="relative flex justify-center lg:justify-end">
             {/* Sunburst Graphic */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] z-0 pointer-events-none">
                <svg viewBox="0 0 200 200" className="w-full h-full animate-spin-slow">
                   <g transform="translate(100,100)">
                      {[...Array(12)].map((_, i) => (
                        <path key={i} d="M0,0 L20,-100 L40,0 Z" fill="#FCE676" transform={`rotate(${i * 30})`} opacity="0.5" />
                      ))}
                   </g>
                </svg>
             </div>

             {/* Phone Card UI */}
             <div className="relative z-10 bg-white border-4 border-black rounded-[2.5rem] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] w-[320px] overflow-hidden">
                <div className="h-8 bg-white border-b-2 border-gray-100 flex items-center justify-between px-6 pt-2">
                   <span className="text-[10px] font-bold">9:41</span>
                   <div className="flex gap-1">
                      <div className="w-3 h-3 bg-black rounded-full"></div>
                      <div className="w-3 h-3 border border-black rounded-full"></div>
                   </div>
                </div>
                
                <div className="p-8 flex flex-col items-center text-center pb-12">
                   <h3 className="font-bold text-2xl mb-6 self-start">TrustGrid.</h3>
                   
                   <div className="bg-black p-4 rounded-2xl mb-6">
                      <QrCode className="text-white w-32 h-32" strokeWidth={1.5} />
                   </div>

                   <p className="text-sm text-gray-500 mb-6 max-w-[200px]">
                      Scan the QR code to verify this business profile
                   </p>

                   <div className="w-full bg-gray-50 rounded-xl p-3 border border-gray-200 flex items-center justify-between">
                      <span className="text-xs font-mono text-gray-500 truncate mr-2">trustgrid.et/addis-design</span>
                      <Button size="sm" className="!py-1 !px-3 !text-xs !border-0 bg-brand-lime" onClick={onLogin}>Visit</Button>
                   </div>
                </div>
             </div>

          </div>

        </div>
      </div>
    </section>
  );
};