import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { TestimonialData } from '../types';
import { CheckCircle2, Star, Quote, Play, ExternalLink, Shield, Sparkles } from 'lucide-react';

interface WidgetEmbedProps {
  companyHandle: string;
}

export const WidgetEmbed: React.FC<WidgetEmbedProps> = ({ companyHandle }) => {
  const [testimonials, setTestimonials] = useState<TestimonialData[]>([]);
  const [profileInfo, setProfileInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  // Parse custom parameters from the iframe URL query string
  const queryParams = new URLSearchParams(window.location.search);
  const theme = queryParams.get('theme') || 'light';
  const layout = queryParams.get('layout') || 'grid';
  const showRating = queryParams.get('rating') !== 'false';
  const showDate = queryParams.get('date') !== 'false';
  const showAvatar = queryParams.get('avatar') !== 'false';
  const borderRadius = queryParams.get('rad') || 'xl';
  const shadow = queryParams.get('shad') || 'md';
  const font = queryParams.get('font') || 'sans';
  const columns = parseInt(queryParams.get('cols') || '3', 10);
  const gap = parseInt(queryParams.get('gap') || '6', 10);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const cleanHandle = companyHandle.replace(/\/+$/, '').trim();

        // 1. Get Profile with case-insensitive match
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, company_name, full_name, avatar_url, primary_color, min_rating, cards_to_show')
          .ilike('username', cleanHandle)
          .single();

        if (profileError || !profile) {
          throw new Error("Wall not found");
        }

        setProfileInfo(profile);

        // 2. Get Testimonials (query verified, approved, published, or recent pending)
        const { data: testimonialsData, error: testimonialsError } = await supabase
          .from('testimonials')
          .select('*')
          .eq('user_id', profile.id)
          .or('status.eq.verified,status.eq.published,status.eq.approved,status.eq.pending')
          .order('created_at', { ascending: false });

        if (testimonialsError) {
          throw testimonialsError;
        }

        const mappedData: TestimonialData[] = (testimonialsData || []).map((t: any) => ({
          id: t.id,
          clientName: t.name || 'Anonymous Client',
          clientCompany: t.company,
          text: t.text,
          videoUrl: t.video_url,
          avatarUrl: t.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name || 'Client')}&background=0D1117&color=fff`,
          cardStyle: t.card_style,
          verificationMethod: t.reviewer_telegram_id ? 'telegram' : (t.is_verified ? 'linkedin' : 'manual'),
          reviewerTelegramUsername: t.reviewer_telegram_username,
          status: t.status,
          createdAt: t.created_at,
          sourceUrl: t.source,
          sentiment: t.sentiment,
          score: t.score
        }));

        // Apply profile count limit
        const maxCards = profile.cards_to_show || 50;
        setTestimonials(mappedData.slice(0, maxCards));

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (companyHandle) {
      fetchTestimonials();
    }
  }, [companyHandle]);

  if (loading) {
    return (
      <div className="min-h-[220px] flex flex-col items-center justify-center bg-transparent gap-3 p-8">
        <div className="w-12 h-12 rounded-full border-4 border-black border-t-[#D4F954] animate-spin shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"></div>
        <p className="text-xs font-black text-black tracking-wide uppercase">Loading Verified Proofs...</p>
      </div>
    );
  }

  // --- Dynamic Styles based on Params ---
  let fontClass = 'font-sans';
  if (font === 'serif') fontClass = 'font-serif';
  if (font === 'mono') fontClass = 'font-mono';

  // Theme Colors
  let bgClass = 'bg-white';
  let textClass = 'text-black';
  let borderClass = 'border border-gray-200 hover:border-gray-300';
  let subTextClass = 'text-gray-500';
  let quoteColor = 'text-gray-900';
  let badgeBg = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  
  if (theme === 'dark') {
    bgClass = 'bg-gray-950';
    textClass = 'text-white';
    borderClass = 'border border-gray-800 hover:border-gray-700';
    subTextClass = 'text-gray-400';
    quoteColor = 'text-gray-200';
    badgeBg = 'bg-emerald-950/60 text-emerald-400 border border-emerald-800';
  } else if (theme === 'transparent') {
    bgClass = 'bg-white/90 backdrop-blur-md';
    textClass = 'text-black';
    borderClass = 'border border-gray-200/80 hover:border-gray-300';
    subTextClass = 'text-gray-600';
    quoteColor = 'text-black';
    badgeBg = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  }

  // Border Radius
  let radClass = 'rounded-2xl';
  if (borderRadius === 'none') radClass = 'rounded-none';
  if (borderRadius === 'md') radClass = 'rounded-xl';
  if (borderRadius === '2xl') radClass = 'rounded-2xl';
  if (borderRadius === '3xl') radClass = 'rounded-3xl';

  // Shadow
  let shadClass = 'shadow-sm hover:shadow-md';
  if (shadow === 'none') shadClass = 'shadow-none';
  if (shadow === 'sm') shadClass = 'shadow-sm';
  if (shadow === 'lg') shadClass = 'shadow-lg';

  // Gap translation
  let gapClass = 'gap-6';
  if (gap <= 4) gapClass = 'gap-4';
  if (gap >= 8) gapClass = 'gap-8';

  // Empty state if 0 testimonials
  if (error || testimonials.length === 0) {
    const brandTitle = profileInfo?.company_name || profileInfo?.full_name || companyHandle;
    const collectUrl = `/collect/${companyHandle}`;

    return (
      <div className={`w-full min-h-[260px] bg-transparent ${fontClass} p-4 sm:p-6 flex flex-col items-center justify-center antialiased`}>
        <div className={`max-w-md w-full p-8 ${bgClass} ${textClass} ${borderClass} ${radClass} ${shadClass} text-center flex flex-col items-center relative transition-all`}>
          
          <div className="relative mb-4">
            {profileInfo?.avatar_url ? (
              <img 
                src={profileInfo.avatar_url} 
                alt={brandTitle} 
                className="w-16 h-16 rounded-full object-cover border border-gray-200 shadow-sm p-0.5 bg-white" 
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#FCE676] text-black flex items-center justify-center font-black text-xl shadow-sm border border-black/15">
                {brandTitle?.charAt(0)?.toUpperCase() || '⭐'}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-sm">
              <CheckCircle2 size={14} className="stroke-[3]" />
            </div>
          </div>

          <div className="flex items-center gap-1 text-amber-500 mb-2">
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={16} className="fill-amber-400 text-amber-500" />
            ))}
          </div>

          <h3 className="font-extrabold text-xl mb-1 tracking-tight">{brandTitle}</h3>
          <p className={`text-xs leading-relaxed mb-6 max-w-xs font-medium ${subTextClass}`}>
            No customer reviews published yet. Be the first verified client to share your experience!
          </p>

          <a 
            href={collectUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-full py-3 px-6 rounded-xl font-bold text-xs bg-black text-white hover:bg-gray-800 shadow-sm inline-flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles size={14} className="text-yellow-400" />
            Leave a Verified Review
          </a>

          <div className="mt-5 flex items-center gap-1.5 text-[10px] text-gray-400 font-bold tracking-wider uppercase">
            <Shield size={11} className="text-gray-400" />
            Verified with <span className="text-black font-extrabold">TrustGrid</span>
          </div>
        </div>
      </div>
    );
  }

  // Layout handling
  let containerClass = '';
  if (layout === 'grid') {
    let colClass = 'md:grid-cols-3';
    if (columns === 1) colClass = 'md:grid-cols-1 max-w-xl mx-auto';
    if (columns === 2) colClass = 'md:grid-cols-2 max-w-4xl mx-auto';
    if (columns === 4) colClass = 'md:grid-cols-4';
    
    containerClass = `grid grid-cols-1 sm:grid-cols-2 ${colClass} ${gapClass}`;
  } else if (layout === 'feed') {
    containerClass = `flex flex-col ${gapClass} max-w-2xl mx-auto`;
  } else if (layout === 'carousel') {
    containerClass = `flex overflow-x-auto pb-4 snap-x snap-mandatory ${gapClass} scrollbar-none`;
  }

  return (
    <div className={`w-full min-h-[220px] bg-transparent ${fontClass} p-3 sm:p-6 antialiased`}>
      <div className={containerClass}>
        {testimonials.map((item) => (
          <div 
            key={item.id} 
            className={`border ${bgClass} ${textClass} ${borderClass} ${radClass} ${shadClass} p-6 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 relative group overflow-hidden ${
              layout === 'carousel' ? 'min-w-[300px] sm:min-w-[340px] snap-center' : 'w-full'
            }`}
          >
            {/* Top Row: Stars + Date + Verification */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-1">
                {showRating && (
                  <div className="flex gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                )}
                {item.verificationMethod === 'telegram' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-blue-200 bg-blue-50 text-blue-700 ml-2">
                    <CheckCircle2 size={11} className="stroke-[3]" />
                    Telegram
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200 bg-emerald-50 text-emerald-700 ml-2">
                    <CheckCircle2 size={11} className="stroke-[3]" />
                    Verified
                  </span>
                )}
              </div>

              {showDate && item.createdAt && (
                <span className={`text-[10px] font-bold tracking-wider uppercase ${subTextClass}`}>
                  {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
            </div>

            {/* Video Attachment (if present) */}
            {item.videoUrl && (
              <div className="mb-4 rounded-xl overflow-hidden bg-black aspect-video relative border border-gray-200 shadow-sm">
                <video 
                  src={item.videoUrl} 
                  controls 
                  preload="metadata"
                  className="w-full h-full object-cover" 
                />
              </div>
            )}

            {/* Testimonial Quote Text */}
            <div className="mb-5 flex-1 relative">
              <Quote size={18} className="text-gray-300 mb-2 opacity-60" />
              <p className={`text-sm sm:text-base leading-relaxed font-medium break-words break-all [overflow-wrap:anywhere] whitespace-pre-wrap ${quoteColor}`}>
                "{item.text}"
              </p>
            </div>

            {/* Reviewer Profile Card */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800/80 mt-auto">
              {showAvatar && (
                <img 
                  src={item.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.clientName)}&background=FCE676&color=111111`} 
                  alt={item.clientName} 
                  className="w-10 h-10 rounded-full object-cover bg-gray-100 border border-gray-200 shadow-sm flex-shrink-0" 
                />
              )}
              <div className="min-w-0 flex-1">
                <h4 className="font-extrabold text-sm truncate leading-tight flex items-center gap-1.5">
                  {item.clientName}
                  {item.verificationMethod === 'telegram' && (
                    <CheckCircle2 size={13} className="text-blue-600 flex-shrink-0" />
                  )}
                </h4>
                {item.clientCompany ? (
                  <p className={`text-xs font-bold truncate ${subTextClass}`}>{item.clientCompany}</p>
                ) : item.reviewerTelegramUsername ? (
                  <p className="text-xs text-blue-600 font-bold truncate">@{item.reviewerTelegramUsername}</p>
                ) : (
                  <p className={`text-xs font-bold ${subTextClass}`}>Verified Client</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
