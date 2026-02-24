// components/TestimonialCardEmbed.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Star, CheckCircle2, Play, Quote, ShieldCheck } from 'lucide-react';

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
    score?: number; // AI Trust Score (0-100)
    sentiment?: 'Positive' | 'Neutral' | 'Negative';
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
  const [showTrustScore, setShowTrustScore] = useState(false);

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
        
        // Cast to any to access returned fields if types are not perfectly aligned yet
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
      <div className="flex items-center justify-center h-full min-h-[150px] w-full bg-white rounded-xl">
        <Loader2 className="animate-spin text-gray-400" size={24} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-full min-h-[150px] w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
        <p className="text-sm text-gray-500">Testimonial currently unavailable.</p>
      </div>
    );
  }

  const { testimonial, brand } = data;
  
  // Trust Score Color Calculation
  const getTrustScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-lime-600 bg-lime-50 border-lime-200';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="h-full font-sans antialiased w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col relative group hover:shadow-md transition-all duration-300">
        
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
                       className="w-10 h-10 rounded-full object-cover border border-gray-100 flex-shrink-0"
                       onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=random` }}
                     />
                 ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs uppercase flex-shrink-0">
                        {testimonial.name.substring(0,2)}
                    </div>
                 )}
                 <div className="min-w-0">
                     <h4 className="font-bold text-gray-900 text-sm leading-tight truncate pr-1">{testimonial.name}</h4>
                     <p className="text-xs text-gray-500 leading-tight truncate">{testimonial.company || 'Verified Customer'}</p>
                 </div>
              </div>
              
              <div className="flex flex-col items-end gap-1">
                {/* TrustGrid Verified Badge (Mini) */}
                {testimonial.is_verified && (
                    <div className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100" title="Identity Verified">
                        <CheckCircle2 size={10} className="text-blue-500" />
                        <span className="text-[9px] font-bold text-blue-700 uppercase tracking-wide">Verified</span>
                    </div>
                )}
                
                {/* AI Trust Score Badge (Click/Hover to reveal details in full version) */}
                {testimonial.score !== undefined && testimonial.score > 0 && (
                     <div 
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full border cursor-help ${getTrustScoreColor(testimonial.score)}`}
                        title={`AI Trust Score: ${testimonial.score}/100 based on sentiment and authenticity checks.`}
                        onClick={() => setShowTrustScore(!showTrustScore)}
                     >
                        <ShieldCheck size={10} />
                        <span className="text-[9px] font-bold uppercase tracking-wide">Score: {testimonial.score}</span>
                     </div>
                )}
              </div>
          </div>

          {/* Star Rating */}
          <div className="flex items-center gap-0.5 mb-2.5">
             {[1, 2, 3, 4, 5].map((s) => (
                <Star 
                  key={s} 
                  size={14} 
                  className={`fill-current text-yellow-400`}
                  style={{ color: '#FBBF24' }} 
                />
             ))}
          </div>

          {/* Testimonial Text */}
          <div className="relative flex-1">
             <Quote className="absolute -top-1 -left-2 opacity-10 text-gray-400 transform -scale-x-100" size={24} />
             <p className="text-sm text-gray-700 leading-relaxed px-1 overflow-y-auto max-h-[120px] scrollbar-hide italic">
                "{testimonial.text}"
             </p>
          </div>

          {/* Video Attachment Indicator */}
          {testimonial.video_url && !isVideoPlaying && (
             <button 
               onClick={() => setIsVideoPlaying(true)}
               className="mt-3 w-full py-2 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-center gap-2 transition-colors border border-gray-100 group-hover:border-gray-200"
             >
                <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play size={10} className="ml-0.5 fill-white" />
                </div>
                <span className="text-xs font-semibold text-gray-700">Watch Video Review</span>
             </button>
          )}

      </div>
      
      {/* Footer: Powered By */}
      <div className="bg-gray-50 px-5 py-2 border-t border-gray-100 flex justify-between items-center">
         <div className="flex items-center gap-1.5 group/brand cursor-pointer" onClick={() => window.open('https://trustgrid.et', '_blank')}>
            <span className="text-[10px] text-gray-400 font-medium">Powered by</span>
            <div className="flex items-center gap-1 opacity-70 group-hover/brand:opacity-100 transition-opacity">
                {/* Simple TrustGrid Logo Icon */}
                <div className="w-3 h-3 bg-gray-800 rounded-sm flex items-center justify-center">
                    <div className="w-1 h-1 bg-[#D4F954] rounded-full"></div>
                </div>
                <span className="text-[10px] font-bold text-gray-900 tracking-tight">TrustGrid</span>
            </div>
         </div>
         {testimonial.created_at && (
             <span className="text-[10px] text-gray-400">
               {new Date(testimonial.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
             </span>
         )}
      </div>

    </div>
  );
};
