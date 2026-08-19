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
      <div className="min-h-[260px] flex flex-col items-center justify-center bg-transparent gap-3 p-8">
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
          <Sparkles className="w-4 h-4 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="text-xs font-semibold text-gray-400 animate-pulse tracking-wide">Loading Verified Proofs...</p>
      </div>
    );
  }

  // --- Dynamic Styles based on Params ---
  let fontClass = 'font-sans';
  if (font === 'serif') fontClass = 'font-serif';
  if (font === 'mono') fontClass = 'font-mono';

  // Theme Colors
  let bgClass = 'bg-white/90 backdrop-blur-xl';
  let textClass = 'text-gray-900';
  let borderClass = 'border-gray-100 hover:border-gray-300';
  let subTextClass = 'text-gray-500';
  let quoteColor = 'text-gray-700';
  let badgeBg = 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
  
  if (theme === 'dark') {
    bgClass = 'bg-gray-950/90 backdrop-blur-xl';
    textClass = 'text-white';
    borderClass = 'border-gray-800/80 hover:border-gray-700';
    subTextClass = 'text-gray-400';
    quoteColor = 'text-gray-200';
    badgeBg = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  } else if (theme === 'transparent') {
    bgClass = 'bg-white/60 backdrop-blur-md';
    textClass = 'text-gray-900';
    borderClass = 'border-white/60 hover:border-white';
    subTextClass = 'text-gray-600';
    quoteColor = 'text-gray-800';
    badgeBg = 'bg-emerald-500/10 text-emerald-800 border-emerald-500/20';
  }

  // Border Radius
  let radClass = 'rounded-2xl';
  if (borderRadius === 'none') radClass = 'rounded-none';
  if (borderRadius === 'md') radClass = 'rounded-xl';
  if (borderRadius === '2xl') radClass = 'rounded-2xl';
  if (borderRadius === '3xl') radClass = 'rounded-3xl';

  // Shadow
  let shadClass = 'shadow-lg hover:shadow-xl';
  if (shadow === 'none') shadClass = 'shadow-none';
  if (shadow === 'sm') shadClass = 'shadow-sm';
  if (shadow === 'lg') shadClass = 'shadow-2xl';

  // Gap translation
  let gapClass = 'gap-6';
  if (gap <= 4) gapClass = 'gap-4';
  if (gap >= 8) gapClass = 'gap-8';

  // Empty state if 0 testimonials
  if (error || testimonials.length === 0) {
    const brandTitle = profileInfo?.company_name || profileInfo?.full_name || companyHandle;
    const collectUrl = `/collect/${companyHandle}`;

    return (
      <div className={`w-full min-h-[300px] bg-transparent ${fontClass} p-4 sm:p-6 flex flex-col items-center justify-center antialiased`}>
        <div className={`max-w-md w-full p-8 border ${bgClass} ${textClass} ${borderClass} ${radClass} ${shadClass} text-center flex flex-col items-center relative overflow-hidden transition-all duration-300`}>
          
          {/* Subtle glowing ambient gradient */}
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative mb-4">
            {profileInfo?.avatar_url ? (
              <img 
                src={profileInfo.avatar_url} 
                alt={brandTitle} 
                className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-md p-0.5 bg-white" 
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-gray-900 to-black text-white flex items-center justify-center font-black text-xl shadow-lg border border-gray-700">
                {brandTitle?.charAt(0)?.toUpperCase() || '⭐'}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-md">
              <CheckCircle2 size={14} className="stroke-[3]" />
            </div>
          </div>

          <div className="flex items-center gap-1 text-amber-400 mb-2">
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={16} className="fill-amber-400 text-amber-400 drop-shadow-sm" />
            ))}
          </div>

          <h3 className="font-black text-lg mb-1 tracking-tight">{brandTitle}</h3>
          <p className={`text-xs leading-relaxed mb-6 max-w-xs ${subTextClass}`}>
            No customer reviews published yet. Be the very first verified client to share your experience!
          </p>

          <a 
            href={collectUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-full py-3.5 px-6 rounded-xl font-extrabold text-xs bg-black text-white hover:bg-gray-800 transition-all shadow-xl inline-flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles size={14} className="text-yellow-400" />
            Leave a Verified Review
          </a>

          <div className="mt-5 flex items-center gap-1.5 text-[10px] text-gray-400 font-semibold tracking-wider uppercase">
            <Shield size={11} className="text-emerald-500" />
            Verified with <span className={theme === 'dark' ? 'text-white font-bold' : 'text-gray-900 font-bold'}>TrustGrid</span>
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
                {item.verificationMethod === 'telegram' && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ml-2 ${badgeBg}`}>
                    <CheckCircle2 size={11} className="stroke-[3]" />
                    Telegram
                  </span>
                )}
              </div>

              {showDate && item.createdAt && (
                <span className={`text-[10px] font-semibold tracking-wider uppercase ${subTextClass}`}>
                  {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
            </div>

            {/* Video Attachment (if present) */}
            {item.videoUrl && (
              <div className="mb-4 rounded-xl overflow-hidden bg-black aspect-video relative group/video shadow-inner">
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
              <Quote size={20} className="text-gray-300 dark:text-gray-700 mb-2 opacity-50" />
              <p className={`text-sm leading-relaxed font-medium break-words whitespace-pre-wrap ${quoteColor}`}>
                {item.text}
              </p>
            </div>

            {/* Reviewer Profile Card */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800/80 mt-auto">
              {showAvatar && (
                <img 
                  src={item.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.clientName)}&background=0D1117&color=fff`} 
                  alt={item.clientName} 
                  className="w-10 h-10 rounded-full object-cover bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex-shrink-0 shadow-sm" 
                />
              )}
              <div className="min-w-0 flex-1">
                <h4 className="font-extrabold text-sm truncate leading-tight flex items-center gap-1.5">
                  {item.clientName}
                  {item.verificationMethod === 'telegram' && (
                    <CheckCircle2 size={13} className="text-blue-500 flex-shrink-0" />
                  )}
                </h4>
                {item.clientCompany ? (
                  <p className={`text-xs truncate ${subTextClass}`}>{item.clientCompany}</p>
                ) : item.reviewerTelegramUsername ? (
                  <p className="text-[11px] text-blue-500 font-medium truncate">@{item.reviewerTelegramUsername}</p>
                ) : (
                  <p className={`text-[11px] font-medium ${subTextClass}`}>Verified Customer</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
