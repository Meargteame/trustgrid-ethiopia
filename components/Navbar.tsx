import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { TrustGridLogo } from './TrustGridLogo';

interface NavbarProps {
  onLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLogin }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 bg-[#FFFFFF] border-b border-[#F4F4F5] transition-all">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Brand Logo with Signature Grid+Checkmark Period */}
          <a href="#" className="flex-shrink-0 flex items-center focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] focus:ring-offset-2 rounded-lg p-1">
            <TrustGridLogo size="md" />
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a 
              href="#features" 
              className="text-[#6B7280] hover:text-[#0A0A0A] font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] rounded-md px-1.5 py-1"
            >
              Features
            </a>
            <a 
              href="#demo" 
              className="text-[#6B7280] hover:text-[#0A0A0A] font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] rounded-md px-1.5 py-1"
            >
              Why It Works
            </a>
            <a 
              href="#testimonials" 
              className="text-[#6B7280] hover:text-[#0A0A0A] font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] rounded-md px-1.5 py-1"
            >
              Live Wall
            </a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={onLogin}
              className="px-5 py-2.5 rounded-xl bg-[#0A0A0A] text-[#FFFFFF] font-bold text-xs hover:bg-[#222222] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] focus:ring-offset-2"
            >
              Log In
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#0A0A0A] p-2 focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] rounded-lg"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#FFFFFF] border-b border-[#F4F4F5]">
          <div className="px-6 py-6 space-y-4">
            <a 
              href="#features" 
              className="block text-base font-bold text-[#0A0A0A]" 
              onClick={() => setIsOpen(false)}
            >
              Features
            </a>
            <a 
              href="#demo" 
              className="block text-base font-bold text-[#0A0A0A]" 
              onClick={() => setIsOpen(false)}
            >
              Why It Works
            </a>
            <a 
              href="#testimonials" 
              className="block text-base font-bold text-[#0A0A0A]" 
              onClick={() => setIsOpen(false)}
            >
              Live Wall
            </a>
            <div className="pt-4 border-t border-[#F4F4F5]">
              <button 
                onClick={() => { setIsOpen(false); onLogin(); }}
                className="w-full py-3 rounded-xl bg-[#0A0A0A] text-[#FFFFFF] font-bold text-xs hover:bg-[#222222] transition-colors"
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};