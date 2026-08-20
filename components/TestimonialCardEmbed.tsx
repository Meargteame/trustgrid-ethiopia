// components/TestimonialCardEmbed.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Star, Play, Quote } from 'lucide-react';
import { TrustGridMark } from './TrustGridLogo';

interface TestimonialCardEmbedProps {
  testimonialId: string;
}

interface EmbedData {
  testimonial: {
    id: string;
    name: string;
    text: string;
    company?: string;
    avatar_url?: string; // Client avatar
    video_url?: string;
    score?: number;
    created_at: string;
    user_id?: string;
    is_verified?: boolean;
    verification_method?: string;
  };
  brand: {
    company_name?: string;
    logo_url?: string;
    primary_color?: string;
  };
}

export const TestimonialCardEmbed: React.FC<TestimonialCardEmbedProps> = ({ testimonialId }) => {
  const [data, setData] = useState<EmbedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Testimonial
        const { data: testimonialRaw, error: tError } = await supabase
          .from('testimonials')
          .select('*')
          .eq('id', testimonialId)
          .single();

        if (tError) throw tError;
        if (!testimonialRaw) throw new Error('Testimonial not found');
        
        const testimonial = testimonialRaw as any; 

        // 2. Fetch Brand Profile (using testimonial.user_id)
        let brandData = {};
        if (testimonial.user_id) {
          const { data: profile, error: pError } = await supabase
            .from('profiles')
            .select('company_name, logo_url, primary_color')
            .eq('id', testimonial.user_id)
            .single();
          
          if (!pError && profile) {
            brandData = profile;
          }
        }

        setData({
          testimonial: testimonial,
          brand: brandData
        });

      } catch (err: any) {
        console.error('Error fetching embed data:', err);
        setError(err.message || 'Failed to load testimonial');
      } finally {
        setLoading(false);
      }
    };

    if (testimonialId) {
      fetchData();
    }
  }, [testimonialId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[150px] w-full bg-[#FFFFFF] rounded-xl">
        <Loader2 className="animate-spin text-gray-400" size={24} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-full min-h-[150px] w-full bg-[#F4F4F5] border border-gray-200 rounded-xl p-4 text-center">
        <p className="text-sm text-[#6B7280]">Testimonial currently unavailable.</p>
      </div>
    );
  }

  const { testimonial } = data;
  
  return (
    <div className="h-full font-sans antialiased w-full bg-[#FFFFFF] rounded-xl border border-gray-200 overflow-hidden flex flex-col relative group">
        
      {/* Video Player Overlay */}
      {testimonial.video_url && isVideoPlaying && (
        <div className="absolute inset-0 bg-black z-20 flex items-center justify-center">
           <video 
             src={testimonial.video_url} 
             controls 
             autoPlay 
             playsInline
             className="w-full h-full object-contain"
           />
           <button 
             onClick={() => setIsVideoPlaying(false)}
             className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/80 transition-colors"
             aria-label="Close Video"
           >
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
           </button>
        </div>
      )}

      <div className="p-4 sm:p-5 flex-1 flex flex-col relative">
          {/* Header: User Info & Verification */}
          <div className="flex justify-between items-start mb-3 gap-2">
              <div className="flex items-center gap-3 overflow-hidden">
                 {testimonial.avatar_url ? (
                     <img 
                       src={testimonial.avatar_url} 
                       alt={testimonial.name}
                       className="w-10 h-10 rounded-full object-cover border border-gray-200 flex-shrink-0"
                       onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=F4F4F5&color=0A0A0A` }}
                     />
                 ) : (
                    <div className="w-10 h-10 rounded-full bg-[#F4F4F5] flex items-center justify-center text-[#0A0A0A] font-bold text-xs uppercase flex-shrink-0 border border-gray-200">
                        {testimonial.name.substring(0,2)}
                    </div>
                 )}
                 <div className="min-w-0">
                     <h4 className="font-extrabold text-[#0A0A0A] text-sm leading-tight truncate pr-1">{testimonial.name}</h4>
                     <p className="text-xs text-[#6B7280] leading-tight truncate">{testimonial.company || 'Verified Reviewer'}</p>
                 </div>
              </div>
              
              <div className="flex flex-col items-end gap-1">
                {testimonial.is_verified && (
                    <div className="flex items-center gap-1 bg-[#F4F4F5] px-2 py-0.5 rounded-full border border-gray-200" title="Identity Verified">
                        <TrustGridMark size={11} />
                        <span className="text-[9px] font-bold text-[#0A0A0A] uppercase tracking-wide">Verified</span>
                    </div>
                )}
              </div>
          </div>

          {/* Star Rating */}
          <div className="flex items-center gap-0.5 mb-2.5">
             {[1, 2, 3, 4, 5].map((s) => (
                <Star 
                  key={s} 
                  size={13} 
                  className="fill-amber-400 text-amber-500" 
                />
             ))}
          </div>

          {/* Testimonial Text */}
          <div className="relative flex-1">
             <Quote className="absolute -top-1 -left-2 opacity-10 text-gray-400 transform -scale-x-100" size={24} />
             <p className="text-sm text-[#0A0A0A] leading-relaxed px-1 overflow-y-auto max-h-[120px] scrollbar-hide italic break-words break-all [overflow-wrap:anywhere] whitespace-pre-wrap">
                "{testimonial.text}"
             </p>
          </div>

          {/* Video Attachment Indicator */}
          {testimonial.video_url && !isVideoPlaying && (
             <button 
               onClick={() => setIsVideoPlaying(true)}
               className="mt-3 w-full py-2 bg-[#F4F4F5] hover:bg-gray-200 rounded-lg flex items-center justify-center gap-2 transition-colors border border-gray-200"
             >
                <div className="w-5 h-5 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center">
                    <Play size={9} className="ml-0.5 fill-white" />
                </div>
                <span className="text-xs font-bold text-[#0A0A0A]">Watch Video Review</span>
             </button>
          )}

      </div>
      
      {/* Footer: Powered By */}
      <div className="bg-[#F4F4F5] px-5 py-2 border-t border-gray-200 flex justify-between items-center">
         <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => window.open('/', '_blank')}>
            <span className="text-[10px] text-[#6B7280] font-medium">Verified by</span>
            <div className="flex items-center gap-1">
                <TrustGridMark size={11} />
                <span className="text-[10px] font-bold text-[#0A0A0A] tracking-tight">TrustGrid</span>
            </div>
         </div>
         {testimonial.created_at && (
             <span className="text-[10px] text-[#6B7280]">
               {new Date(testimonial.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
             </span>
         )}
      </div>

    </div>
  );
};
