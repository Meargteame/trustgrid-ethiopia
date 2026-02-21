import React, { useState } from 'react';
import { X, Copy, CheckCircle2 } from 'lucide-react';

interface EmbedCodeModalProps {
  testimonialId: string;
  onClose: () => void;
}

export const EmbedCodeModal: React.FC<EmbedCodeModalProps> = ({ testimonialId, onClose }) => {
  const [copied, setCopied] = useState(false);

  // In a real app, this would be a script tag pointing to our widget CDN
  // For MVP, we provide an iframe code snippet that points to a "card view"
  // Since we don't have a single card view route yet, we'll mock the logic
  // or point to the public wall with a highlight param.
  const embedCode = `
<!-- TrustGrid Testimonial Widget -->
<iframe 
  src="${window.location.origin}/embed/card/${testimonialId}" 
  width="100%" 
  height="250" 
  style="border:none; overflow:hidden; border-radius:12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);" 
  title="Verified Review"
></iframe>
<div style="font-size:10px; color:#666; text-align:center; margin-top:4px;">
  Verified by <a href="https://trustgrid.et" target="_blank" style="color:#000; font-weight:bold; text-decoration:none;">TrustGrid.et</a>
</div>
  `.trim();

  const handleCopy = () => {
     navigator.clipboard.writeText(embedCode);
     setCopied(true);
     setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
           <h3 className="font-bold text-lg">Embed this Testimonial</h3>
           <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <X size={20} />
           </button>
        </div>
        
        <div className="p-8">
           <p className="text-sm text-gray-500 mb-4">
              Copy and paste this code into your website (HTML, WordPress, Webflow, etc.) to display this trusted proof.
           </p>

           <div className="bg-gray-900 rounded-xl p-4 relative group">
              <pre className="text-gray-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap break-all">
                 {embedCode}
              </pre>
              <button 
                 onClick={handleCopy}
                 className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors flex items-center gap-2"
              >
                 {copied ? <CheckCircle2 size={14} className="text-green-400" /> : <Copy size={14} />}
                 <span className="text-xs font-bold">{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
           </div>
           
           <div className="mt-6 flex items-center gap-3 p-4 bg-brand-lime/10 border border-brand-lime/30 rounded-xl">
               <div className="w-8 h-8 rounded-full bg-brand-lime flex items-center justify-center font-bold text-black text-xs">
                   Tip
               </div>
               <p className="text-xs font-medium text-gray-700">
                   Embedded testimonials have 30% higher trust than static screenshots because they link back to the source verification.
               </p>
           </div>
        </div>
      </div>
    </div>
  );
};
