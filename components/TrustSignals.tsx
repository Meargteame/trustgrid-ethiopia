import React from 'react';
import { ShieldCheck, LayoutGrid, Sparkles, Send, Video, BarChart2 } from 'lucide-react';

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-24 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">
            Why TrustGrid
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-black tracking-tight mt-4 mb-4">
            Everything You Need To Build Unshakable Credibility
          </h2>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            Move past unverified screenshot channels. Give prospective clients genuine, verified reasons to trust and buy from you.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Feature 1 */}
          <div className="p-8 rounded-3xl bg-gray-50/70 border border-gray-200/80 hover:border-gray-300 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform">
                <ShieldCheck size={24} className="text-[#D4F954]" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-black">Cryptographic Verification</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Reviewers verify their identity via direct <strong>Telegram authentication</strong> or secure <strong>Email magic links</strong>. No fake accounts, no manufactured reviews.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200/60 flex items-center gap-2 text-xs font-bold text-gray-500">
               <Send size={13} className="text-[#0088cc]" />
               <span>Instant identity attestation</span>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="p-8 rounded-3xl bg-gray-50/70 border border-gray-200/80 hover:border-gray-300 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform">
                <LayoutGrid size={24} className="text-[#D4F954]" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-black">Branded Wall of Proof</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Get your custom public profile (<code>trustgrid.leonslab.tech/wall/yourname</code>) showcasing your verified reviews, trust score, and video testimonials.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200/60 flex items-center gap-2 text-xs font-bold text-gray-500">
               <Sparkles size={13} className="text-amber-500" />
               <span>Shareable with a single link</span>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="p-8 rounded-3xl bg-gray-50/70 border border-gray-200/80 hover:border-gray-300 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform">
                <Sparkles size={24} className="text-[#D4F954]" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-black">Widget Studio 2.0</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Customize responsive masonry grids, carousels, or single card embeds. Copy and paste into WordPress, Webflow, React, or any HTML website in seconds.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200/60 flex items-center gap-2 text-xs font-bold text-gray-500">
               <BarChart2 size={13} className="text-emerald-600" />
               <span>Real-time visitor analytics</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};