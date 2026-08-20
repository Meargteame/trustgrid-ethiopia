import React from 'react';
import { Button } from './Button';
import { CheckCircle2, Shield, Star, Send, ArrowRight, Video } from 'lucide-react';

interface HeroProps {
  onLogin: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onLogin }) => {
  return (
    <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden bg-white bg-grid">
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Content */}
          <div className="lg:col-span-7 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-xs font-bold text-gray-800 mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              The Trust & Verification Infrastructure for Modern Businesses
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-black tracking-tight mb-6 leading-[1.1]">
              Turn Client Praise Into <br/>
              <span className="relative text-black">
                Verified Social Proof.
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-brand-lime -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-600 mb-8 leading-relaxed max-w-xl">
              Stop relying on easily faked chat screenshots that clients doubt. Collect authentic customer feedback verified via <strong>Telegram & Work Email</strong>, and showcase your live Wall of Proof anywhere.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button size="lg" onClick={onLogin} className="shadow-md">
                Claim Your Public Wall
                <ArrowRight size={16} className="ml-2" />
              </Button>
              <a 
                href="#demo"
                className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-bold text-gray-700 hover:text-black bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors"
              >
                Explore Live Demo
              </a>
            </div>

            <div className="mt-10 flex items-center gap-6 text-xs font-bold text-gray-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>Telegram Identity Verified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield size={16} className="text-emerald-600" />
                <span>Zero-Code Embed Widgets</span>
              </div>
            </div>
          </div>

          {/* Right Content - Modern Live Card Preview */}
          <div className="lg:col-span-5 relative flex justify-center">
             
             {/* Decorative Backdrop Glow */}
             <div className="absolute -inset-4 bg-gradient-to-tr from-brand-lime/30 to-amber-200/30 rounded-3xl blur-2xl -z-10 opacity-70"></div>

             {/* Live Verified Card Simulation */}
             <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-7 shadow-xl w-full max-w-md relative overflow-hidden flex flex-col space-y-4">
                
                {/* Header: Verified Status */}
                <div className="flex items-center justify-between">
                   <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold">
                      <Send size={12} className="text-[#0088cc]" />
                      <span>Verified via Telegram</span>
                   </div>
                   <div className="flex items-center gap-0.5 text-amber-400">
                      {[1, 2, 3, 4, 5].map(i => (
                         <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                      ))}
                   </div>
                </div>

                {/* Quote */}
                <p className="text-sm sm:text-base text-gray-900 font-semibold leading-relaxed">
                   "We closed 3x more enterprise deals after adding TrustGrid’s verified proofs. Clients trust cryptographic identity over random channel screenshots."
                </p>

                {/* Reviewer Details */}
                <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                   <img 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120" 
                      alt="Sara K." 
                      className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
                   />
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                         <p className="text-xs font-extrabold text-black truncate">Sara Kidane</p>
                         <CheckCircle2 size={13} className="text-emerald-600 flex-shrink-0" />
                      </div>
                      <p className="text-[11px] text-gray-500 truncate">Product Lead • Addis Fintech</p>
                   </div>
                   <span className="text-[10px] text-gray-400 font-mono">100% Authentic</span>
                </div>

                {/* Public Link Bar */}
                <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-200 flex items-center justify-between text-xs">
                   <span className="font-mono text-gray-500 truncate">trustgrid.leonslab.tech/wall/addisfintech</span>
                   <span className="px-2 py-0.5 rounded-md bg-black text-white text-[10px] font-bold">Live</span>
                </div>
             </div>

          </div>

        </div>
      </div>
    </section>
  );
};