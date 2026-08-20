import React from 'react';
import { TrustGridLogo } from './TrustGridLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#FFFFFF] pt-20 pb-12 border-t border-[#F4F4F5]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12 mb-16">
          
          <div className="col-span-1 md:col-span-1 space-y-4">
            <TrustGridLogo size="sm" />
            <p className="text-xs text-[#6B7280] leading-relaxed max-w-sm">
              The social proof verification system for modern businesses. Collect authentic reviews verified via Telegram identity and display live walls of proof.
            </p>
            <div>
              <a 
                href="mailto:support@leonslab.tech" 
                className="text-xs font-bold text-[#0A0A0A] border-b border-[#0A0A0A] pb-0.5 hover:text-[#333333] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] rounded-sm"
              >
                support@leonslab.tech
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#0A0A0A] mb-4">Product</h4>
            <ul className="space-y-3 text-xs text-[#6B7280]">
              <li><a href="#features" className="hover:text-[#0A0A0A] transition-colors">Features</a></li>
              <li><a href="#demo" className="hover:text-[#0A0A0A] transition-colors">Why It Works</a></li>
              <li><a href="#testimonials" className="hover:text-[#0A0A0A] transition-colors">Verified Wall</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#0A0A0A] mb-4">Company</h4>
            <ul className="space-y-3 text-xs text-[#6B7280]">
              <li><a href="mailto:support@leonslab.tech" className="hover:text-[#0A0A0A] transition-colors">Contact Support</a></li>
              <li><a href="#" className="hover:text-[#0A0A0A] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#0A0A0A] transition-colors">Terms of Service</a></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-[#F4F4F5] pt-8 text-xs text-[#6B7280] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} TrustGrid. All rights reserved.</p>
          <div className="flex items-center gap-6">
             <a href="mailto:support@leonslab.tech" className="hover:text-[#0A0A0A] transition-colors">Support</a>
             <a href="#features" className="hover:text-[#0A0A0A] transition-colors">Overview</a>
          </div>
        </div>
      </div>
    </footer>
  );
};