import React from 'react';
import { X, Check, Send, Star, ArrowRight } from 'lucide-react';
import { TrustGridMark } from './TrustGridLogo';

export const Showcase: React.FC = () => {
  return (
    <section id="demo" className="py-24 bg-[#FFFFFF] border-b border-[#F4F4F5] scroll-mt-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4F4F5] border border-gray-200 text-xs font-bold text-[#0A0A0A] mb-4">
            <span>Why Screenshots Fail</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0A0A0A] tracking-tight leading-tight mb-4">
            Chat screenshots vs. <br />
            Verified identity proof.
          </h2>
          <p className="text-[#6B7280] text-base leading-relaxed max-w-xl">
            Anyone can create fake chats or edit channel screenshots. Cryptographic proof connects real reviewer identities directly to your brand.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 items-stretch max-w-5xl">
          
          {/* Old Way */}
          <div className="bg-[#FFFFFF] rounded-2xl p-8 border border-gray-200 flex flex-col justify-between">
             <div>
                <div className="flex items-center justify-between mb-6">
                   <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F4F5] text-[#6B7280] text-xs font-bold border border-gray-200">
                      <X size={13} className="text-rose-500" />
                      The Old Way: Chat Screenshots
                   </span>
                   <span className="text-xs text-[#6B7280] font-mono">Unverified</span>
                </div>

                <div className="bg-[#F4F4F5] p-4 rounded-xl border border-gray-200 mb-6 font-mono text-xs text-[#6B7280] space-y-2">
                   <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <p className="font-bold text-[#0A0A0A]">"Paid 10,000 ETB, fast delivery thanks!"</p>
                      <p className="text-[10px] text-[#6B7280] mt-1">Sender: Anonymous / Unverified Account</p>
                   </div>
                </div>

                <ul className="space-y-3 text-xs sm:text-sm text-[#6B7280]">
                   <li className="flex items-start gap-2">
                      <X size={16} className="text-rose-500 flex-shrink-0 mt-0.5" />
                      <span>Zero identity proof — anyone can stage a fake chat</span>
                   </li>
                   <li className="flex items-start gap-2">
                      <X size={16} className="text-rose-500 flex-shrink-0 mt-0.5" />
                      <span>Lost in long Telegram message histories</span>
                   </li>
                   <li className="flex items-start gap-2">
                      <X size={16} className="text-rose-500 flex-shrink-0 mt-0.5" />
                      <span>Cannot be embedded as interactive website widgets</span>
                   </li>
                </ul>
             </div>

             <div className="mt-8 pt-4 border-t border-gray-200 text-xs text-[#6B7280]">
                Potential customers hesitate because screenshots are easily fabricated.
             </div>
          </div>

          {/* The TrustGrid Way */}
          <div className="bg-[#F4F4F5] rounded-2xl p-8 border border-gray-300 flex flex-col justify-between">
             <div>
                <div className="flex items-center justify-between mb-6">
                   <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFFFFF] text-[#0A0A0A] text-xs font-bold border border-gray-200">
                      <TrustGridMark size={14} />
                      The TrustGrid Way: Verified Proof
                   </span>
                   <span className="text-xs text-[#0A0A0A] font-bold font-mono">Verified</span>
                </div>

                {/* Proof Card Simulation */}
                <div className="bg-[#FFFFFF] p-4 rounded-xl border border-gray-200 mb-6">
                   <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                         <Send size={12} className="text-[#0088cc]" />
                         <span className="text-[11px] font-bold text-[#0A0A0A]">Verified via Telegram</span>
                      </div>
                      <div className="flex text-amber-500">
                         {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} className="fill-amber-400" />)}
                      </div>
                   </div>
                   <p className="text-xs font-bold text-[#0A0A0A] leading-relaxed">
                      "Delivered our system 2 days ahead of schedule. Verified authenticity."
                   </p>
                   <p className="text-[10px] text-[#6B7280] mt-2 font-medium">
                      Dawit Alemu • Verified Client (@dawit_eth)
                   </p>
                </div>

                <ul className="space-y-3 text-xs sm:text-sm text-[#0A0A0A]">
                   <li className="flex items-start gap-2 font-medium">
                      <Check size={16} className="text-[#0A0A0A] flex-shrink-0 mt-0.5" />
                      <span>Reviewer authenticated with real Telegram account (@username)</span>
                   </li>
                   <li className="flex items-start gap-2 font-medium">
                      <Check size={16} className="text-[#0A0A0A] flex-shrink-0 mt-0.5" />
                      <span>Permanent branded Wall of Proof with custom slug</span>
                   </li>
                   <li className="flex items-start gap-2 font-medium">
                      <Check size={16} className="text-[#0A0A0A] flex-shrink-0 mt-0.5" />
                      <span>Embed anywhere as live popups, masonry grids, or badges</span>
                   </li>
                </ul>
             </div>

             <div className="mt-8 pt-4 border-t border-gray-300 flex items-center justify-between">
                <span className="text-xs font-bold text-[#0A0A0A]">
                   Genuine credibility that builds buyer confidence.
                </span>
                <a href="#testimonials" className="text-xs font-bold text-[#0A0A0A] hover:underline inline-flex items-center gap-1">
                   <span>View Wall</span>
                   <ArrowRight size={12} />
                </a>
             </div>
          </div>

        </div>

      </div>
    </section>
  );
};