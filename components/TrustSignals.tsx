import React from 'react';
import { Send, LayoutGrid, Globe } from 'lucide-react';
import { TrustGridMark } from './TrustGridLogo';

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-24 bg-[#FFFFFF] border-b border-[#F4F4F5] scroll-mt-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4F4F5] border border-gray-200 text-xs font-bold text-[#0A0A0A] mb-4">
            <span>How TrustGrid Works</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0A0A0A] tracking-tight leading-tight mb-4">
            Built for trust. <br />
            Verified at the source.
          </h2>
          <p className="text-[#6B7280] text-base leading-relaxed max-w-xl">
            Everything you need to collect, verify, and display genuine customer feedback without relying on easily manipulated screenshots.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Pillar 1 */}
          <div className="p-8 rounded-2xl bg-[#F4F4F5] border border-gray-200 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#0A0A0A] text-[#FFFFFF] flex items-center justify-center font-bold">
                <Send size={18} className="text-[#D7FF3D]" />
              </div>
              <h3 className="text-xl font-bold text-[#0A0A0A]">Telegram Identity Verification</h3>
              <p className="text-[#6B7280] text-sm leading-relaxed">
                Reviewers authenticate with their real Telegram account or verified work email. No fake accounts, duplicate reviews, or manufactured praise.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-gray-200 flex items-center gap-2 text-xs font-bold text-[#0A0A0A]">
               <TrustGridMark size={14} />
               <span>Authentic reviewer profile</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-8 rounded-2xl bg-[#F4F4F5] border border-gray-200 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#0A0A0A] text-[#FFFFFF] flex items-center justify-center font-bold">
                <LayoutGrid size={18} className="text-[#D7FF3D]" />
              </div>
              <h3 className="text-xl font-bold text-[#0A0A0A]">Branded Wall of Proof</h3>
              <p className="text-[#6B7280] text-sm leading-relaxed">
                Get a dedicated public page (<code className="text-[#0A0A0A] font-mono text-xs">/wall/yourname</code>) showcasing your verified reviews, trust score, and direct submission link.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-gray-200 flex items-center gap-2 text-xs font-bold text-[#0A0A0A]">
               <Globe size={14} className="text-[#0A0A0A]" />
               <span>Shareable with a single link</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="p-8 rounded-2xl bg-[#F4F4F5] border border-gray-200 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#0A0A0A] text-[#FFFFFF] flex items-center justify-center font-bold">
                <span className="text-[#D7FF3D] font-mono font-bold text-xs">&lt;/&gt;</span>
              </div>
              <h3 className="text-xl font-bold text-[#0A0A0A]">Live Embed Widgets</h3>
              <p className="text-[#6B7280] text-sm leading-relaxed">
                Drop floating social proof toasts or responsive review grids into your website, Shopify store, or landing page with zero code.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-gray-200 flex items-center gap-2 text-xs font-bold text-[#0A0A0A]">
               <span className="w-2 h-2 rounded-full bg-[#0A0A0A]"></span>
               <span>Copy &amp; paste embed script</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};