import React from 'react';
import { Twitter, Linkedin, Facebook } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white pt-20 pb-12 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12 mb-16">
          
          <div className="col-span-1 md:col-span-1">
            <span className="font-extrabold text-2xl tracking-tighter text-black block mb-6">
              TrustGrid.
            </span>
            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              Build verified proof for your business. Turn customer testimonials into a trusted wall of proof with Telegram & email identity verification.
            </p>
            <a href="mailto:support@leonslab.tech" className="text-xs font-bold text-black border-b border-black pb-0.5">
              support@leonslab.tech
            </a>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-4">Product</h4>
            <ul className="space-y-3 text-xs text-gray-500">
              <li><a href="#features" className="hover:text-black transition-colors">Features</a></li>
              <li><a href="#demo" className="hover:text-black transition-colors">Live Showcase</a></li>
              <li><a href="#testimonials" className="hover:text-black transition-colors">Verified Wall</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-4">Company</h4>
            <ul className="space-y-3 text-xs text-gray-500">
              <li><a href="mailto:support@leonslab.tech" className="hover:text-black transition-colors">Contact Support</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Terms of Service</a></li>
            </ul>
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