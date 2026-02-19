import React, { useRef } from 'react';
import { X, Download, Share2, Instagram, Linkedin } from 'lucide-react';
import { TestimonialData } from '../types';
import { Button } from './Button';

interface SocialShareModalProps {
  testimonial: TestimonialData;
  onClose: () => void;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({ testimonial, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    // In a real app, use html-to-image here. 
    // For MVP, we simulate the action.
    const btn = document.getElementById('download-btn');
    if(btn) {
        btn.innerHTML = `<span class="flex items-center gap-2"><div class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div> Generatng...</span>`;
        setTimeout(() => {
            // Note: This string injection of <Check /> won't render a React component, 
            // but for the purpose of this mock interaction we leave the logic as provided 
            // while fixing the TypeScript errors.
            btn.innerHTML = `<span class="flex items-center gap-2">Saved to Device</span>`;
            setTimeout(onClose, 1000);
        }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-4xl flex flex-col md:flex-row overflow-hidden shadow-2xl">
        
        {/* Preview Area (Canvas) */}
        <div className="flex-1 bg-gray-100 p-8 flex items-center justify-center relative bg-grid">
           <div className="absolute top-4 left-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
              Preview: Instagram Post (1080x1080)
           </div>

           {/* The Social Card */}
           <div 
             ref={cardRef}
             className="w-[320px] h-[320px] md:w-[400px] md:h-[400px] bg-black text-white p-8 flex flex-col justify-between relative shadow-2xl rounded-none md:rounded-xl overflow-hidden"
             style={{
                backgroundImage: 'radial-gradient(circle at top right, #333 0%, #000 100%)'
             }}
           >
              {/* Watermark / Brand */}
              <div className="flex justify-between items-start">
                 <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-brand-lime rounded-full flex items-center justify-center text-black font-black text-xs">
                       T.
                    </div>
                    <span className="font-bold text-sm">TrustGrid Verified</span>
                 </div>
                 <div className="px-2 py-1 bg-white/10 rounded text-[10px] font-mono border border-white/10">
                    ID: {testimonial.id.slice(0,6)}
                 </div>
              </div>

              {/* Quote */}
              <div className="relative z-10">
                 <span className="text-6xl text-brand-lime font-serif absolute -top-8 -left-2 opacity-50">"</span>
                 <p className="text-xl md:text-2xl font-bold leading-tight relative z-10">
                    {testimonial.text.length > 120 ? testimonial.text.slice(0, 120) + "..." : testimonial.text}
                 </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-4 border-t border-white/20 pt-6">
                 <img 
                   src={testimonial.avatarUrl} 
                   className="w-12 h-12 rounded-full border-2 border-brand-lime object-cover" 
                   alt="Author"
                 />
                 <div>
                    <p className="font-bold text-white text-sm">{testimonial.name}</p>
                    <p className="text-xs text-gray-400">{testimonial.role} • {testimonial.company}</p>
                 </div>
                 <div className="ml-auto">
                    {testimonial.verificationMethod === 'linkedin' && <Linkedin size={20} className="text-[#0a66c2]" />}
                    {testimonial.verificationMethod === 'telegram' && <Share2 size={20} className="text-[#0088cc]" />}
                 </div>
              </div>

              {/* Decor */}
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-brand-lime opacity-10 blur-3xl rounded-full"></div>
           </div>
        </div>

        {/* Controls */}
        <div className="w-full md:w-80 bg-white p-8 border-l border-gray-100 flex flex-col">
           <div className="flex justify-between items-center mb-8">
              <h3 className="font-extrabold text-xl">Share Proof</h3>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
           </div>

           <div className="space-y-6 flex-1">
              <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Platform</label>
                 <div className="flex gap-2">
                    <button className="flex-1 py-2 px-3 rounded-xl border-2 border-black bg-black text-white text-xs font-bold flex items-center justify-center gap-2">
                       <Instagram size={14} /> Instagram
                    </button>
                    <button className="flex-1 py-2 px-3 rounded-xl border-2 border-gray-200 text-gray-500 text-xs font-bold hover:border-gray-300">
                       LinkedIn
                    </button>
                 </div>
              </div>

              <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Style</label>
                 <div className="grid grid-cols-2 gap-2">
                    <div className="aspect-video bg-black rounded-lg cursor-pointer ring-2 ring-brand-lime"></div>
                    <div className="aspect-video bg-white border border-gray-200 rounded-lg cursor-pointer"></div>
                 </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                 <p className="text-xs font-bold mb-1">💡 Pro Tip</p>
                 <p className="text-xs text-gray-500">Posting verified reviews on your Story increases conversion by 18%.</p>
              </div>
           </div>

           <Button id="download-btn" onClick={handleDownload} fullWidth className="mt-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Download size={18} className="mr-2" /> Download Image
           </Button>
        </div>

      </div>
    </div>
  );
};