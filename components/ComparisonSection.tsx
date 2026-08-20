import React from 'react';
import { Button } from './Button';
import { CheckCircle2, XCircle, Send, ShieldCheck, Sparkles, Star, Code, ArrowRight } from 'lucide-react';

export const Showcase: React.FC = () => {
  return (
    <section id="demo" className="py-24 bg-gray-50 border-y border-gray-100 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-200/80 px-3 py-1 rounded-full">
            Before & After
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-black tracking-tight mt-4 mb-4">
            Why Screenshots Fail & TrustGrid Wins
          </h2>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            Customers know channel screenshots can easily be edited or fabricated. Cryptographic proof gives buyers 100% confidence.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
          
          {/* Old Way */}
          <div className="bg-white rounded-3xl p-8 border border-red-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
             <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-400"></div>
             
             <div>
                <div className="flex items-center justify-between mb-6">
                   <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200">
                      <XCircle size={14} />
                      The Old Way: Chat Screenshots
                   </span>
                   <span className="text-xs text-gray-400 font-mono">0% Verified</span>
                </div>

                <div className="bg-gray-100 p-5 rounded-2xl border border-gray-200/80 mb-6 font-mono text-xs text-gray-700 space-y-2">
                   <p className="text-gray-400 italic mb-2">// Chat screenshot posted in channel</p>
                   <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                      <p className="font-bold text-gray-800">"Paid 10,000 ETB, fast delivery thanks!"</p>
                      <p className="text-[10px] text-gray-400 mt-1">Sender: Anonymous user (Easily edited via Photoshop/Inspector)</p>
                   </div>
                </div>

                <ul className="space-y-3 text-xs sm:text-sm text-gray-600 font-medium">
                   <li className="flex items-start gap-2 text-red-600">
                      <XCircle size={16} className="flex-shrink-0 mt-0.5" />
                      <span>Zero identity verification — easily faked with alt accounts</span>
                   </li>
                   <li className="flex items-start gap-2 text-red-600">
                      <XCircle size={16} className="flex-shrink-0 mt-0.5" />
                      <span>Lost in long Telegram message histories and forgotten</span>
                   </li>
                   <li className="flex items-start gap-2 text-red-600">
                      <XCircle size={16} className="flex-shrink-0 mt-0.5" />
                      <span>Cannot be embedded onto your official website or landing page</span>
                   </li>
                </ul>
             </div>

             <div className="mt-8 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
                Leads leave without buying due to credibility doubts.
             </div>
          </div>

          {/* The TrustGrid Way */}
          <div className="bg-white rounded-3xl p-8 border border-emerald-200 shadow-md flex flex-col justify-between relative overflow-hidden">
             <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500"></div>

             <div>
                <div className="flex items-center justify-between mb-6">
                   <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                      <ShieldCheck size={14} />
                      The TrustGrid Way: Verified Proof
                   </span>
                   <span className="text-xs text-emerald-600 font-bold font-mono">100% Cryptographic</span>
                </div>

                {/* Live Card Simulation */}
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200/80 mb-6">
                   <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                         <Send size={12} className="text-[#0088cc]" />
                         <span className="text-[11px] font-bold text-blue-700">Verified via Telegram</span>
                      </div>
                      <div className="flex text-amber-400">
                         {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} className="fill-amber-400" />)}
                      </div>
                   </div>
                   <p className="text-xs font-bold text-black leading-relaxed">
                      "Delivered our system 2 days ahead of schedule. Verified authenticity."
                   </p>
                   <p className="text-[10px] text-gray-500 mt-2 font-medium">
                      Dawit Alemu • Verified Client (@dawit_eth)
                   </p>
                </div>

                <ul className="space-y-3 text-xs sm:text-sm text-gray-700 font-medium">
                   <li className="flex items-start gap-2 text-emerald-700">
                      <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>Reviewer identity authenticated directly via Telegram or Work Email</span>
                   </li>
                   <li className="flex items-start gap-2 text-emerald-700">
                      <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>Permanent, branded Public Wall of Proof with custom slug handle</span>
                   </li>
                   <li className="flex items-start gap-2 text-emerald-700">
                      <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>Embed anywhere with live responsive widgets in 1 click</span>
                   </li>
                </ul>
             </div>

             <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                   <Sparkles size={14} /> Boost conversion rates by 30%+
                </span>
                <a href="#testimonials" className="text-xs font-extrabold text-black hover:underline inline-flex items-center gap-1">
                   View Wall <ArrowRight size={12} />
                </a>
             </div>
          </div>

        </div>

      </div>
    </section>
  );
};