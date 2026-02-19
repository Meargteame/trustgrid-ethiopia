import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from './Button';

interface NavbarProps {
  onLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLogin }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-sm pt-4 pb-4 border-b border-transparent transition-all">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => window.location.href = '#'}>
            <span className="font-extrabold text-2xl tracking-tighter text-black">
              TrustGrid.
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-10">
            <a href="#features" className="text-gray-600 hover:text-black font-semibold text-sm transition-colors">Features</a>
            <a href="#demo" className="text-gray-600 hover:text-black font-semibold text-sm transition-colors">AI Demo</a>
            <a href="#testimonials" className="text-gray-600 hover:text-black font-semibold text-sm transition-colors">Reviews</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button onClick={onLogin} className="font-bold text-sm hover:underline">Login</button>
            <Button variant="primary" size="sm" onClick={onLogin}>Sign up free</Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-black focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full top-20 left-0 shadow-xl z-50">
          <div className="px-6 py-8 space-y-4">
            <a href="#features" className="block text-lg font-bold text-gray-900" onClick={() => setIsOpen(false)}>Features</a>
            <a href="#demo" className="block text-lg font-bold text-gray-900" onClick={() => setIsOpen(false)}>AI Demo</a>
            <a href="#testimonials" className="block text-lg font-bold text-gray-900" onClick={() => setIsOpen(false)}>Reviews</a>
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
              <Button fullWidth variant="outline" onClick={onLogin}>Login</Button>
              <Button fullWidth variant="primary" onClick={onLogin}>Sign up free</Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};