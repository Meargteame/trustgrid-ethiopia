import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ShieldCheck, Star } from 'lucide-react';

interface TestimonialData {
  id: string;
  clientName: string;
  clientCompany?: string;
  text: string;
  videoUrl?: string;
  avatarUrl?: string;
  cardStyle?: 'light' | 'dark' | 'brand';
  verificationMethod?: string;
  reviewerTelegramUsername?: string;
  status: string;
  createdAt: string;
  sourceUrl?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  score?: number;
}

interface WidgetEmbedProps {
  companyHandle: string;
}

export const WidgetEmbed: React.FC<WidgetEmbedProps> = ({ companyHandle }) => {
  const [testimonials, setTestimonials] = useState<TestimonialData[]>([]);
  const [profileInfo, setProfileInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        // 1. Get Profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, company_name, full_name, avatar_url, primary_color, min_rating, cards_to_show')
          .eq('username', companyHandle)
          .single();

        if (profileError || !profile) {
          throw new Error("Wall not found");
        }

        setProfileInfo(profile);

        // 2. Get Testimonials (query verified or approved or published)
        const { data: testimonialsData, error: testimonialsError } = await supabase
          .from('testimonials')
          .select('*')
          .eq('user_id', profile.id)
          .in('status', ['verified', 'published', 'approved'])
          .order('created_at', { ascending: false });

        if (testimonialsError) {
          throw testimonialsError;
        }

        const mappedData: TestimonialData[] = (testimonialsData || []).map((t: any) => ({
          id: t.id,
          clientName: t.name,
          clientCompany: t.company,
          text: t.text,
          videoUrl: t.video_url,
          avatarUrl: t.avatar_url,
          cardStyle: t.card_style,
          verificationMethod: t.reviewer_telegram_id ? 'telegram' : (t.is_verified ? 'linkedin' : 'manual'),
          reviewerTelegramUsername: t.reviewer_telegram_username,
          status: t.status,
          createdAt: t.created_at,
          sourceUrl: t.source,
          sentiment: t.sentiment,
          score: t.score
        }));

        // Apply profile filters
        const minRatingRequired = profile.min_rating || 0;
        const maxCards = profile.cards_to_show || 50;
        
        const filtered = mappedData
          .filter(t => (t.score || 100) >= (minRatingRequired * 20))
          .slice(0, maxCards);

        setTestimonials(filtered);

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
      <div className="min-h-[220px] flex items-center justify-center bg-transparent">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // --- Dynamic Styles based on Params ---
  
  // Font
  let fontClass = 'font-sans';
  if (font === 'serif') fontClass = 'font-serif';
  if (font === 'mono') fontClass = 'font-mono';

  // Theme Colors
  let bgClass = 'bg-white';
  let textClass = 'text-gray-900';
  let borderClass = 'border-gray-200';
  let subTextClass = 'text-gray-500';
  let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  
  if (theme === 'dark') {
    bgClass = 'bg-gray-900';
    textClass = 'text-white';
    borderClass = 'border-gray-800';
    subTextClass = 'text-gray-400';
    badgeBg = 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60';
  } else if (theme === 'transparent') {
    bgClass = 'bg-white/40 backdrop-blur-md';
    textClass = 'text-gray-900';
    borderClass = 'border-white/40';
    subTextClass = 'text-gray-600';
    badgeBg = 'bg-emerald-500/10 text-emerald-800 border-emerald-500/20';
  }

  // Border Radius
  let radClass = 'rounded-2xl';
  if (borderRadius === 'none') radClass = 'rounded-none';
  if (borderRadius === 'md') radClass = 'rounded-lg';
  if (borderRadius === '2xl') radClass = 'rounded-2xl';
  if (borderRadius === '3xl') radClass = 'rounded-3xl';

  // Shadow
  let shadClass = 'shadow-md';
  if (shadow === 'none') shadClass = 'shadow-none';
  if (shadow === 'sm') shadClass = 'shadow-sm';
  if (shadow === 'lg') shadClass = 'shadow-xl';

  // If no testimonials or error, show a welcoming CTA card
  if (error || testimonials.length === 0) {
    const brandTitle = profileInfo?.company_name || profileInfo?.full_name || companyHandle;
    const collectUrl = `/collect/${companyHandle}`;

    return (
      <div className={`w-full min-h-[260px] bg-transparent ${fontClass} p-4 sm:p-6 flex flex-col items-center justify-center antialiased`}>
        <div className={`max-w-md w-full p-6 sm:p-8 border ${bgClass} ${textClass} ${borderClass} ${radClass} ${shadClass} text-center flex flex-col items-center`}>
          {profileInfo?.avatar_url ? (
            <img 
              src={profileInfo.avatar_url} 
              alt={brandTitle} 
              className="w-12 h-12 rounded-full object-cover mb-3 border border-gray-200" 
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-black text-sm mb-3">
              {brandTitle?.charAt(0) || '⭐'}
            </div>
          )}

          <div className="flex gap-1 text-amber-400 mb-2">
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={15} className="fill-amber-400 text-amber-400" />
            ))}
          </div>

          <h3 className="font-extrabold text-base mb-1.5">{brandTitle}</h3>
          <p className={`text-xs leading-relaxed mb-5 ${subTextClass}`}>
            No reviews published yet. Be the first client to share your verified experience!
          </p>

          <a 
            href={collectUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-full py-3 px-4 rounded-xl font-extrabold text-xs bg-black text-white hover:bg-gray-800 transition-all shadow-md inline-flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            ⭐ Leave a Verified Review
          </a>

          <div className="mt-4 text-[10px] text-gray-400 font-medium">
            Powered by <strong className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>TrustGrid</strong>
          </div>
        </div>
      </div>
    );
  }

  // Gap translation
  let gapClass = 'gap-5';
  if (gap <= 4) gapClass = 'gap-3';
  if (gap >= 8) gapClass = 'gap-6';

  // Layout handling
  let containerClass = '';
  
  if (layout === 'grid') {
    let colClass = 'md:grid-cols-3';
    if (columns === 1) colClass = 'md:grid-cols-1 max-w-xl mx-auto';
    if (columns === 2) colClass = 'md:grid-cols-2 max-w-3xl mx-auto';
    if (columns === 4) colClass = 'md:grid-cols-4';
    
    containerClass = `grid grid-cols-1 sm:grid-cols-2 ${colClass} ${gapClass}`;
  } else if (layout === 'feed') {
    containerClass = `flex flex-col ${gapClass} max-w-2xl mx-auto`;
  } else if (layout === 'carousel') {
    containerClass = `flex overflow-x-auto pb-4 ${gapClass} snap-x snap-mandatory scrollbar-none`;
  }

  return (
    <div className={`w-full min-h-screen bg-transparent ${fontClass} p-3 sm:p-5 antialiased`}>
      <div className={containerClass}>
        {testimonials.map((item) => (
          <div 
            key={item.id} 
            className={`p-5 sm:p-6 flex flex-col h-full border ${bgClass} ${textClass} ${borderClass} ${radClass} ${shadClass} ${layout === 'carousel' ? 'min-w-[280px] sm:min-w-[340px] snap-start flex-shrink-0' : 'w-full'} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
          >
            <div className="flex justify-between items-start mb-3 gap-2">
              {showRating && (
                <div className="flex gap-1 text-amber-400 text-sm">
                  {[1,2,3,4,5].map(i => <Star key={i} size={14} className="fill-amber-400 text-amber-400" />)}
                </div>
              )}
              {showDate && item.createdAt && (
                <div className={`text-[11px] font-medium tracking-wide opacity-50 ${subTextClass}`}>
                  {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              )}
            </div>

            <p className={`text-sm sm:text-base leading-relaxed mb-5 flex-1 break-words whitespace-pre-wrap ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              "{item.text}"
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-gray-500/10 mt-auto gap-2">
              <div className="flex items-center gap-3 min-w-0">
                {showAvatar && (
                  <img 
                    src={item.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.clientName)}&background=random`} 
                    className="w-9 h-9 rounded-full object-cover bg-gray-200 border border-gray-100 flex-shrink-0" 
                    alt={item.clientName}
                  />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{item.clientName}</p>
                  {item.clientCompany && <p className={`text-xs ${subTextClass} truncate`}>{item.clientCompany}</p>}
                </div>
              </div>

              {item.verificationMethod && item.verificationMethod !== 'manual' && (
                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeBg} flex-shrink-0`}>
                  <ShieldCheck size={11} />
                  {item.verificationMethod === 'telegram' ? 'Telegram' : 'LinkedIn'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Subtle branding link */}
      <div className="text-center mt-4">
        <a 
          href="https://trustgrid.et" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-[11px] font-medium text-gray-400 hover:text-gray-600 transition-colors inline-flex items-center gap-1"
        >
          Verified by <span className="font-bold text-gray-800 dark:text-gray-200">TrustGrid</span>
        </a>
      </div>
    </div>
  );
};
