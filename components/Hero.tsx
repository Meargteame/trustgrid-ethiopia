import React from 'react';
import { ArrowRight, Send, Star } from 'lucide-react';
import { TrustGridMark } from './TrustGridLogo';

interface HeroProps {
  onLogin: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onLogin }) => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 bg-[#FFFFFF] border-b border-[#F4F4F5]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Content - Confident Left-Aligned Value Proposition */}
          <div className="lg:col-span-7 text-left space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4F4F5] border border-gray-200 text-xs font-bold text-[#0A0A0A]">
              <span className="w-2 h-2 rounded-full bg-[#0A0A0A]"></span>
              <span>Verified Customer Social Proof</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0A0A0A] tracking-tight leading-[1.08]">
              Real proof. <br />
              Real trust.
            </h1>

            <p className="text-base sm:text-lg text-[#6B7280] font-normal leading-relaxed max-w-xl">
              Stop posting unverified chat screenshots that buyers doubt. TrustGrid collects authentic customer reviews verified through <strong>real Telegram identity</strong>, giving your business a trusted Wall of Proof that turns skeptics into buyers.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button 
                onClick={onLogin} 
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#0A0A0A] text-[#FFFFFF] font-bold text-sm hover:bg-[#222222] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] focus:ring-offset-2"
              >
                <span>Create your wall</span>
                <ArrowRight size={16} />
              </button>
              
              <a 
                href="#demo"
                className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-bold text-[#0A0A0A] bg-[#F4F4F5] hover:bg-gray-200 rounded-xl border border-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0A0A0A]"
              >
                Why Telegram proof works
              </a>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs font-bold text-[#6B7280]">
              <div className="flex items-center gap-2">
                <TrustGridMark size={16} />
                <span className="text-[#0A0A0A]">Telegram Identity Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                <span>Zero fake screenshots</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                <span>Embed anywhere in seconds</span>
              </div>
            </div>

          </div>

          {/* Right Content - Flat Verified Proof Card Simulation */}
          <div className="lg:col-span-5 flex justify-center">
             <div className="bg-[#FFFFFF] border border-gray-200 rounded-3xl p-6 sm:p-7 w-full max-w-md flex flex-col space-y-4">
                
                {/* Header: Verified Status */}
                <div className="flex items-center justify-between">
                   <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F4F5] border border-gray-200 text-[#0A0A0A] text-xs font-bold">
                      <Send size={12} className="text-[#0088cc]" />
                      <span>Verified via Telegram</span>
                   </div>
                   <div className="flex items-center gap-0.5 text-amber-500">
                      {[1, 2, 3, 4, 5].map(i => (
                         <Star key={i} size={14} className="fill-amber-400 text-amber-500" />
                      ))}
                   </div>
                </div>

                {/* Quote */}
                <p className="text-sm sm:text-base text-[#0A0A0A] font-semibold leading-relaxed">
                   "We replaced our Telegram channel screenshot dumps with TrustGrid's verified wall. Customers immediately trust real identities over easily photoshopped chat text."
                </p>

                {/* Reviewer Details */}
                <div className="flex items-center gap-3 pt-3 border-t border-[#F4F4F5]">
                   <div className="w-10 h-10 rounded-full bg-[#F4F4F5] border border-gray-200 flex items-center justify-center font-bold text-xs text-[#0A0A0A] flex-shrink-0">
                      SK
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                         <p className="text-xs font-extrabold text-[#0A0A0A] truncate">Sara Kidane</p>
                         <TrustGridMark size={14} />
                      </div>
                      <p className="text-[11px] text-[#6B7280] truncate">@sara_k • Addis Ababa</p>
                   </div>
                   <span className="text-[10px] text-[#6B7280] font-mono uppercase bg-[#F4F4F5] px-2 py-0.5 rounded-md">
                      Verified
                   </span>
                </div>

                {/* Public Link Bar */}
                <div className="bg-[#F4F4F5] rounded-xl p-3 border border-gray-200 flex items-center justify-between text-xs">
                   <span className="font-mono text-[#6B7280] truncate">trustgrid.leonslab.tech/wall/demo</span>
                   <span className="px-2 py-0.5 rounded-md bg-[#0A0A0A] text-white text-[10px] font-bold">
                      Live
                   </span>
                </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};