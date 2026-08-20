import React, { useState } from 'react';
import { X, Copy, CheckCircle2 } from 'lucide-react';
import { TrustGridMark } from './TrustGridLogo';

interface EmbedCodeModalProps {
  testimonialId: string;
  onClose: () => void;
}

export const EmbedCodeModal: React.FC<EmbedCodeModalProps> = ({ testimonialId, onClose }) => {
  const [copied, setCopied] = useState(false);

  const embedCode = `
<!-- TrustGrid Testimonial Widget -->
<iframe 
  src="${window.location.origin}/embed/card/${testimonialId}" 
  width="100%" 
  height="250" 
  style="border:1px solid #E4E4E7; overflow:hidden; border-radius:16px;" 
  title="Verified Review"
></iframe>
<div style="font-size:10px; color:#6B7280; text-align:center; margin-top:4px; font-family:sans-serif;">
  Verified by <a href="${window.location.origin}" target="_blank" style="color:#0A0A0A; font-weight:bold; text-decoration:none;">TrustGrid</a>
</div>
  `.trim();

  const handleCopy = () => {
     navigator.clipboard.writeText(embedCode);
     setCopied(true);
     setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-sans animate-fade-in">
      <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl w-full max-w-2xl flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-[#F4F4F5]">
           <div className="flex items-center gap-2">
              <TrustGridMark size={16} />
              <h3 className="font-black text-base text-[#0A0A0A]">Embed this Testimonial</h3>
           </div>
           <button onClick={onClose} className="p-1.5 hover:bg-gray-200 text-[#6B7280] hover:text-[#0A0A0A] rounded-lg transition-colors">
              <X size={18} />
           </button>
        </div>
        
        <div className="p-6 sm:p-8 space-y-6">
           <p className="text-xs text-[#6B7280]">
              Copy and paste this code snippet into your store or website (HTML, WordPress, Webflow, Shopify) to display live interactive proof.
           </p>

           <div className="bg-[#0A0A0A] border border-gray-800 rounded-xl p-4 relative group">
              <pre className="text-gray-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap break-all pr-24">
                 {embedCode}
              </pre>
              <button 
                 onClick={handleCopy}
                 className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
              >
                 {copied ? <CheckCircle2 size={13} className="text-[#D7FF3D]" /> : <Copy size={13} />}
                 <span className="text-xs font-bold">{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
           </div>
           
           <div className="flex items-start gap-3 p-4 bg-[#F4F4F5] border border-gray-200 rounded-xl">
               <div className="p-1 bg-[#D7FF3D] rounded-md text-[#0A0A0A] font-black text-[10px] uppercase">
                   PRO TIP
               </div>
               <p className="text-xs text-[#6B7280]">
                   Live embedded proof cards convert 3x better than static screenshots because buyers can click through to verify the authentic Telegram identity.
               </p>
           </div>
        </div>
      </div>
    </div>
  );
};
