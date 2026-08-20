import React, { useRef, useState } from 'react';
import { X, Share2, Instagram, Linkedin, Download, CheckCircle2, Star, ShieldCheck, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import { TestimonialData } from '../types';
import { Button } from './Button';
import { Toast } from './Toast';

interface SocialShareModalProps {
  testimonial: TestimonialData;
  onClose: () => void;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({ testimonial, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [platform, setPlatform] = useState<'instagram' | 'linkedin'>('instagram');
  const [cardTheme, setCardTheme] = useState<'dark' | 'light' | 'lime'>('light');
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const displayName = testimonial.clientName || (testimonial as any).name || 'Verified Client';
  const displayRole = testimonial.clientRole || (testimonial as any).role || 'Customer';
  const displayCompany = testimonial.clientCompany || (testimonial as any).company || '';
  const displaySubtext = displayCompany ? `${displayRole} • ${displayCompany}` : displayRole;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3, // Ultra-sharp 3x HD export
        quality: 1.0,
      });
      download(dataUrl, `trustgrid-proof-${testimonial.id.slice(0, 8)}.png`);
      setToast({ message: 'High-res social image downloaded successfully!', type: 'success' });
    } catch (err: any) {
      console.error('Failed to generate image:', err);
      setToast({ message: 'Failed to export image. Please try again.', type: 'error' });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="bg-white rounded-3xl w-full max-w-5xl flex flex-col md:flex-row overflow-hidden shadow-2xl border border-gray-200">
        
        {/* Preview Area (Canvas) */}
        <div className="flex-1 bg-gray-100 p-6 sm:p-10 flex flex-col items-center justify-center relative bg-grid min-h-[460px]">
           <div className="absolute top-4 left-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-200 shadow-sm">
              Preview: {platform === 'instagram' ? 'Instagram Square (1080×1080)' : 'LinkedIn Landscape (1200×630)'}
           </div>

           {/* The Exportable Social Card */}
           <div 
             ref={cardRef}
             className={`transition-all duration-300 relative shadow-2xl rounded-2xl overflow-hidden p-8 flex flex-col justify-between ${
               platform === 'instagram' 
                 ? 'w-[340px] h-[340px] sm:w-[400px] sm:h-[400px]' 
                 : 'w-[340px] h-[240px] sm:w-[480px] sm:h-[300px]'
             } ${
               cardTheme === 'dark' 
                 ? 'bg-gray-950 text-white' 
                 : cardTheme === 'lime' 
                   ? 'bg-[#D4F954] text-black' 
                   : 'bg-white text-black border border-gray-200'
             }`}
             style={
               cardTheme === 'dark' 
                 ? { backgroundImage: 'radial-gradient(circle at top right, #222 0%, #030712 100%)' } 
                 : undefined
             }
           >
              {/* Header: Brand watermark & Verification status */}
              <div className="flex justify-between items-start z-10">
                 <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                       cardTheme === 'dark' ? 'bg-[#D4F954] text-black' : cardTheme === 'lime' ? 'bg-black text-white' : 'bg-black text-white'
                    }`}>
                       T.
                    </div>
                    <div>
                       <span className="font-extrabold text-sm tracking-tight block leading-none">TrustGrid</span>
                       <span className={`text-[10px] font-bold ${cardTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Verified Social Proof</span>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                       <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                    ))}
                 </div>
              </div>

              {/* Quote Body */}
              <div className="relative z-10 my-auto py-2">
                 <span className={`text-5xl font-serif absolute -top-6 -left-2 opacity-30 ${
                    cardTheme === 'dark' ? 'text-[#D4F954]' : cardTheme === 'lime' ? 'text-black' : 'text-gray-400'
                 }`}>"</span>
                 <p className={`font-bold leading-relaxed relative z-10 break-words break-all [overflow-wrap:anywhere] whitespace-pre-wrap ${
                   platform === 'instagram' ? 'text-base sm:text-lg max-h-[160px]' : 'text-sm sm:text-base max-h-[120px]'
                 } overflow-hidden`}>
                    {testimonial.text}
                 </p>
              </div>

              {/* Reviewer Author Footer */}
              <div className={`flex items-center gap-3 pt-4 border-t z-10 ${
                 cardTheme === 'dark' ? 'border-white/10' : cardTheme === 'lime' ? 'border-black/10' : 'border-gray-100'
              }`}>
                 {testimonial.avatarUrl ? (
                    <img 
                      src={testimonial.avatarUrl} 
                      className="w-10 h-10 rounded-full border border-gray-300 object-cover flex-shrink-0" 
                      alt={displayName}
                    />
                 ) : (
                    <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                       {displayName.slice(0, 2)}
                    </div>
                 )}
                 <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-sm truncate leading-tight flex items-center gap-1">
                       <span>{displayName}</span>
                       <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                    </p>
                    <p className={`text-xs truncate ${cardTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                       {displaySubtext}
                    </p>
                 </div>
                 <div className="flex-shrink-0">
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                       <ShieldCheck size={11} /> 100% Authentic
                    </span>
                 </div>
              </div>

              {/* Ambient Glow in Dark Theme */}
              {cardTheme === 'dark' && (
                 <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#D4F954] opacity-10 blur-3xl rounded-full pointer-events-none"></div>
              )}
           </div>
        </div>

        {/* Controls Sidebar */}
        <div className="w-full md:w-80 bg-white p-6 sm:p-8 flex flex-col justify-between">
           <div>
              <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100">
                 <div>
                    <h3 className="font-extrabold text-lg text-black">Share Proof</h3>
                    <p className="text-xs text-gray-500">Export high-resolution graphics</p>
                 </div>
                 <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors">
                    <X size={18} />
                 </button>
              </div>

              <div className="space-y-6">
                 {/* Platform Aspect Ratio Selector */}
                 <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Aspect Ratio</label>
                    <div className="grid grid-cols-2 gap-2">
                       <button 
                          onClick={() => setPlatform('instagram')}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                             platform === 'instagram' 
                                ? 'border-black bg-black text-white shadow-sm' 
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                       >
                          <Instagram size={14} /> Square (1:1)
                       </button>
                       <button 
                          onClick={() => setPlatform('linkedin')}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                             platform === 'linkedin' 
                                ? 'border-black bg-black text-white shadow-sm' 
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                       >
                          <Linkedin size={14} /> Wide (1.9:1)
                       </button>
                    </div>
                 </div>

                 {/* Card Theme Selector */}
                 <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Visual Theme</label>
                    <div className="grid grid-cols-3 gap-2">
                       <button
                          onClick={() => setCardTheme('dark')}
                          className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-[11px] font-bold transition-all ${
                             cardTheme === 'dark' ? 'border-black ring-2 ring-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                       >
                          <div className="w-full h-5 rounded-md bg-gray-950 border border-gray-800"></div>
                          <span>Dark</span>
                       </button>
                       <button
                          onClick={() => setCardTheme('light')}
                          className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-[11px] font-bold transition-all ${
                             cardTheme === 'light' ? 'border-black ring-2 ring-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                       >
                          <div className="w-full h-5 rounded-md bg-white border border-gray-200"></div>
                          <span>Light</span>
                       </button>
                       <button
                          onClick={() => setCardTheme('lime')}
                          className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-[11px] font-bold transition-all ${
                             cardTheme === 'lime' ? 'border-black ring-2 ring-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                       >
                          <div className="w-full h-5 rounded-md bg-[#D4F954] border border-black/20"></div>
                          <span>Accent</span>
                       </button>
                    </div>
                 </div>

                 {/* Pro Tip */}
                 <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-xs font-bold text-black mb-1">💡 Story & Post Tip</p>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                       Sharing verified proofs on Instagram Stories & LinkedIn feeds builds immediate organic credibility.
                    </p>
                 </div>
              </div>
           </div>

           {/* Export Action Button */}
           <div className="pt-6">
              <Button 
                 onClick={handleDownload} 
                 fullWidth 
                 disabled={generating}
                 className="shadow-sm font-bold"
              >
                 {generating ? (
                    <><Loader2 size={16} className="animate-spin mr-2" /> Generating PNG...</>
                 ) : (
                    <><Download size={16} className="mr-2" /> Download High-Res PNG</>
                 )}
              </Button>
           </div>
        </div>

      </div>
    </div>
  );
};