import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { TestimonialData } from '../types';
import { CheckCircle2, Star, Quote, Play, ExternalLink, Shield, Sparkles, X, Flame } from 'lucide-react';

interface WidgetEmbedProps {
  companyHandle: string;
}

export const WidgetEmbed: React.FC<WidgetEmbedProps> = ({ companyHandle }) => {
  const [testimonials, setTestimonials] = useState<TestimonialData[]>([]);
  const [profileInfo, setProfileInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  // Toast / Popup state
  const [toastIndex, setToastIndex] = useState(0);
  const [toastVisible, setToastVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

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
  const toastPosition = queryParams.get('pos') || 'bottom-left'; // 'bottom-left' | 'bottom-right'

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

        // 2. Get Testimonials (query verified, approved, published)
        const { data: testimonialsData, error: testimonialsError } = await supabase
          .from('testimonials')
          .select('*')
          .eq('user_id', profile.id)
          .or('status.eq.verified,status.eq.published,status.eq.approved')
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

  // Toast cycling timer
  useEffect(() => {
    if (layout !== 'toast' || testimonials.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setToastVisible(false);
      setTimeout(() => {
        setToastIndex((prev) => (prev + 1) % testimonials.length);
        setToastVisible(true);
      }, 400); // fade transition
    }, 6000);

    return () => clearInterval(timer);
  }, [layout, testimonials.length, isPaused]);

  if (loading) {
    return (
      <div className="min-h-[160px] flex flex-col items-center justify-center bg-transparent gap-2 p-6">
        <div className="w-8 h-8 rounded-full border-2 border-black border-t-[#D4F954] animate-spin"></div>
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Loading Verified Proof...</p>
      </div>
    );
  }

  if (error || !profileInfo) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 shadow-sm max-w-md mx-auto my-6">
        <p className="text-sm font-bold text-black mb-1">Widget Unavailable</p>
        <p className="text-xs text-gray-500">{error || "Could not load verification records for this handle."}</p>
      </div>
    );
  }

  // Visual Theme Tokens
  let bgClass = 'bg-white';
  let textClass = 'text-black';
  let subTextClass = 'text-gray-500';
  let borderClass = 'border-gray-200';
  let quoteColor = 'text-gray-800';

  if (theme === 'dark') {
    bgClass = 'bg-gray-950';
    textClass = 'text-white';
    subTextClass = 'text-gray-400';
    borderClass = 'border-gray-800';
    quoteColor = 'text-gray-200';
  } else if (theme === 'lime') {
    bgClass = 'bg-[#D4F954]';
    textClass = 'text-black';
    subTextClass = 'text-gray-800';
    borderClass = 'border-black';
    quoteColor = 'text-black';
  }

  // Radius Tokens
  const radClass = {
    'none': 'rounded-none',
    'md': 'rounded-md',
    'lg': 'rounded-xl',
    'xl': 'rounded-2xl',
    '2xl': 'rounded-3xl',
  }[borderRadius] || 'rounded-2xl';

  // Shadow Tokens
  const shadClass = {
    'none': 'shadow-none',
    'sm': 'shadow-sm',
    'md': 'shadow-md',
    'lg': 'shadow-lg',
    'xl': 'shadow-xl',
  }[shadow] || 'shadow-md';

  // Font Tokens
  const fontClass = {
    'sans': 'font-sans',
    'serif': 'font-serif',
    'mono': 'font-mono',
  }[font] || 'font-sans';

  // Gap Tokens
  const gapClass = {
    '2': 'gap-2',
    '4': 'gap-4',
    '6': 'gap-6',
    '8': 'gap-8',
  }[gap.toString()] || 'gap-6';

  const brandTitle = profileInfo.company_name || profileInfo.full_name || `@${profileInfo.username}`;
  const collectUrl = `/collect/${profileInfo.username}`;
  const wallUrl = `/wall/${profileInfo.username}`;

  // Empty state
  if (testimonials.length === 0) {
    return (
      <div className={`w-full bg-transparent ${fontClass} p-6 antialiased flex items-center justify-center`}>
        <div className={`w-full max-w-md ${bgClass} ${textClass} border ${borderClass} ${radClass} ${shadClass} p-8 text-center flex flex-col items-center shadow-lg`}>
          <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center mb-4">
            <Sparkles size={22} className="text-yellow-400" />
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

  // ----------------------------------------------------
  // LAYOUT: LIVE SOCIAL PROOF TOAST (FOMO POPUP)
  // ----------------------------------------------------
  if (layout === 'toast') {
    const currentItem = testimonials[toastIndex] || testimonials[0];
    const posClass = toastPosition === 'bottom-right' ? 'right-4 bottom-4' : 'left-4 bottom-4';

    return (
      <div 
        className={`fixed z-50 ${posClass} max-w-[360px] w-[calc(100%-2rem)] transition-all duration-300 transform ${
          toastVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-95 pointer-events-none'
        }`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className={`p-4 border ${bgClass} ${textClass} ${borderClass} ${radClass} ${shadClass} backdrop-blur-md shadow-2xl relative overflow-hidden flex flex-col gap-2.5`}>
          
          {/* Top Row: Icon + Stars + Close */}
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
              <Flame size={11} className="text-amber-500 fill-amber-500" />
              <span>Verified Proof</span>
            </div>

            <div className="flex items-center gap-1">
              {showRating && (
                <div className="flex gap-0.5 text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={11} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
              )}
              <button 
                onClick={() => setToastVisible(false)}
                className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-colors"
                title="Dismiss"
              >
                <X size={12} />
              </button>
            </div>
          </div>

          {/* Review Text */}
          <p className={`text-xs font-semibold leading-snug line-clamp-2 break-words break-all [overflow-wrap:anywhere] ${quoteColor}`}>
            "{currentItem.text}"
          </p>

          {/* Footer: Reviewer Info + Verification + TrustGrid Tag */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-0.5">
            <div className="flex items-center gap-2 min-w-0">
              {showAvatar && (
                <img 
                  src={currentItem.avatarUrl} 
                  alt={currentItem.clientName} 
                  className="w-6 h-6 rounded-full object-cover border border-gray-200 flex-shrink-0"
                />
              )}
              <div className="min-w-0">
                <p className={`text-[11px] font-extrabold truncate flex items-center gap-1 ${textClass}`}>
                  <span>{currentItem.clientName}</span>
                  <CheckCircle2 size={10} className="text-emerald-600 flex-shrink-0" />
                </p>
                {currentItem.clientCompany && (
                  <p className={`text-[9px] truncate ${subTextClass}`}>{currentItem.clientCompany}</p>
                )}
              </div>
            </div>

            <a 
              href={wallUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[9px] font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-wider flex items-center gap-0.5 flex-shrink-0"
            >
              <span>TrustGrid</span>
              <ExternalLink size={9} />
            </a>
          </div>

          {/* Progress Indicator Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100 overflow-hidden">
            <div className="h-full bg-emerald-500 animate-[progress_6s_linear_infinite]"></div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // STANDARD LAYOUTS: GRID / FEED / CAROUSEL
  // ----------------------------------------------------
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

            {/* Author Profile Row */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100/50 mt-auto">
              <div className="flex items-center gap-3">
                {showAvatar && (
                  <img 
                    src={item.avatarUrl} 
                    alt={item.clientName} 
                    className="w-9 h-9 rounded-full object-cover border border-gray-200/80 bg-gray-100" 
                  />
                )}
                <div>
                  <h4 className="font-extrabold text-sm tracking-tight leading-tight">{item.clientName}</h4>
                  <p className={`text-xs ${subTextClass}`}>{item.clientCompany || 'Verified Customer'}</p>
                </div>
              </div>

              {/* External source icon */}
              {item.sourceUrl && (
                <a 
                  href={item.sourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-black p-1 transition-colors"
                  title="View original verification source"
                >
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Global verification footer credit */}
      <div className="mt-8 text-center">
        <a 
          href={wallUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-[11px] font-bold text-gray-500 hover:text-black hover:border-gray-400 shadow-sm transition-all"
        >
          <Shield size={13} className="text-emerald-500" />
          <span>Verified with <strong className="text-black">TrustGrid</strong></span>
        </a>
      </div>
    </div>
  );
};
