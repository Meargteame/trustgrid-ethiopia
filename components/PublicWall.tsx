import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { TestimonialData, WidgetConfig } from '../types';
import { 
  CheckCircle2, Star, Quote, Search, Share2, Play, 
  Shield, Sparkles, Filter, Video, MessageSquare, ExternalLink,
  ArrowRight, Heart, Award, Copy, Globe
} from 'lucide-react';
import { Toast } from './Toast';

interface PublicWallProps {
  companyHandle: string;
}

interface CompanyProfile {
  id: string;
  company_name: string;
  avatar_url: string;
  logo_url?: string;
  website?: string;
  primary_color: string;
  username: string;
  full_name: string;
}

export const PublicWall: React.FC<PublicWallProps> = ({ companyHandle }) => {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [testimonials, setTestimonials] = useState<TestimonialData[]>([]);
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'video' | 'telegram'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  useEffect(() => {
    const fetchMethods = async () => {
      const cleanHandle = (companyHandle || '').replace(/\/+$/, '').trim();

      try {
        setLoading(true);
        // 1. Fetch Profile (case-insensitive)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .ilike('username', cleanHandle)
          .single();

        if (profileError || !profileData) {
          setError('Company not found');
          return;
        }

        setProfile(profileData);

        // Track View in Analytics
        const referrer = document.referrer || 'direct';
        supabase.from('views').insert({
          wall_id: profileData.id,
          referrer: referrer
        }).then(({ error: viewErr }) => {
          if (viewErr) console.warn("Analytics view error:", viewErr);
        });

        // 2. Fetch Widget Config
        const { data: config } = await supabase
          .from('widget_configs')
          .select('*')
          .eq('user_id', profileData.id)
          .maybeSingle();

        if (config) {
          setWidgetConfig({
            layout: config.layout,
            theme: config.theme,
            columns: config.columns,
            gap: config.gap,
            border_radius: config.border_radius,
            shadow: config.shadow,
            font: config.font,
            header_title: config.header_title,
            show_rating: config.show_rating,
            show_date: config.show_date,
            show_avatar: config.show_avatar,
            min_rating: config.min_rating,
            cards_to_show: config.cards_to_show
          } as WidgetConfig);
        }

        // 3. Fetch Testimonials (verified, approved, published, or recent pending)
        const { data: testimonialsData, error: testimonialsError } = await supabase
          .from('testimonials')
          .select('*')
          .eq('user_id', profileData.id)
          .or('status.eq.verified,status.eq.published,status.eq.approved,status.eq.pending')
          .order('created_at', { ascending: false });

        if (testimonialsError) {
          console.error(testimonialsError);
        } else {
          const mappedData: TestimonialData[] = (testimonialsData || []).map((t: any) => ({
            id: t.id,
            clientName: t.name || 'Verified Client',
            clientCompany: t.company,
            text: t.text,
            videoUrl: t.video_url,
            avatarUrl: t.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name || 'Client')}&background=FCE676&color=111111`,
            cardStyle: t.card_style,
            verificationMethod: t.reviewer_telegram_id ? 'telegram' : (t.is_verified ? 'linkedin' : 'manual'),
            reviewerTelegramUsername: t.reviewer_telegram_username,
            status: t.status,
            createdAt: t.created_at,
            sourceUrl: t.source,
            sentiment: t.sentiment,
            score: t.score
          }));

          setTestimonials(mappedData);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (companyHandle) {
      fetchMethods();
    }
  }, [companyHandle]);

  // Filtered & Searched Testimonials
  const filteredTestimonials = useMemo(() => {
    return testimonials.filter(item => {
      if (filterType === 'video' && !item.videoUrl) return false;
      if (filterType === 'telegram' && item.verificationMethod !== 'telegram') return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.clientName?.toLowerCase().includes(query);
        const matchesText = item.text?.toLowerCase().includes(query);
        const matchesCompany = item.clientCompany?.toLowerCase().includes(query);
        const matchesTelegram = item.reviewerTelegramUsername?.toLowerCase().includes(query);
        return matchesName || matchesText || matchesCompany || matchesTelegram;
      }

      return true;
    });
  }, [testimonials, filterType, searchQuery]);

  const handleCopyShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setToast({ message: "Wall of Proof link copied to clipboard!", type: "success" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white bg-grid flex flex-col items-center justify-center gap-3 text-black font-sans">
        <div className="w-12 h-12 rounded-full border-3 border-gray-200 border-t-black animate-spin"></div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Loading Wall of Proof...
        </p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-white bg-grid flex flex-col items-center justify-center p-6 text-center text-black font-sans">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-gray-200 shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 text-black flex items-center justify-center mx-auto mb-4">
            <Shield size={28} />
          </div>
          <h1 className="text-2xl font-extrabold mb-2 tracking-tight">Wall Not Found</h1>
          <p className="text-gray-500 text-sm mb-6 font-medium">
            The requested public wall for "<span className="text-black font-bold font-mono">{companyHandle}</span>" does not exist or has been relocated.
          </p>
          <a
            href="/"
            className="w-full py-3 px-4 rounded-xl font-bold bg-black text-white hover:bg-gray-800 transition-all inline-block text-sm shadow-sm"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  const brandTitle = profile.company_name || profile.full_name || companyHandle;
  const videoCount = testimonials.filter(t => !!t.videoUrl).length;
  const telegramCount = testimonials.filter(t => t.verificationMethod === 'telegram').length;

  return (
    <div className="min-h-screen bg-white bg-grid text-black font-sans antialiased flex flex-col relative">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 group">
            <span className="font-extrabold text-2xl tracking-tighter text-black">
              TrustGrid.
            </span>
          </a>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyShare}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-gray-50 text-black border border-gray-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              title="Share Wall"
            >
              <Share2 size={13} />
              <span className="hidden sm:inline">Share Wall</span>
            </button>
            <a
              href={`/collect/${companyHandle}`}
              className="px-4 py-2 rounded-xl bg-black hover:bg-gray-800 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles size={13} className="text-yellow-400" />
              Leave Review
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-12 pb-10 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          
          {/* Real Company Logo / Avatar */}
          <div className="relative mb-5">
            {profile.logo_url || profile.avatar_url ? (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white border-2 border-gray-200 shadow-md p-2 flex items-center justify-center overflow-hidden">
                <img
                  src={profile.logo_url || profile.avatar_url}
                  alt={brandTitle}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#FCE676] text-black border-2 border-gray-200 shadow-md flex items-center justify-center text-3xl sm:text-4xl font-black">
                {brandTitle.charAt(0).toUpperCase()}
              </div>
            )}
            <div 
              className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-sm" 
              title="100% Cryptographically Verified Business"
            >
              <CheckCircle2 size={18} className="stroke-[3]" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-black mb-2 flex items-center justify-center gap-2">
            <span>{brandTitle}</span>
          </h1>

          {/* Official Website Link (if configured) */}
          {profile.website && (
            <div className="mb-4">
              <a 
                href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 hover:text-black transition-all shadow-sm group"
              >
                <Globe size={13} className="text-gray-400 group-hover:text-black transition-colors" />
                <span>{profile.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                <ExternalLink size={11} className="text-gray-400 group-hover:text-black transition-colors" />
              </a>
            </div>
          )}

          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto mb-8 font-medium leading-relaxed">
            See what verified clients are saying. Every review is authentic with cryptographic identity verification.
          </p>

          {/* Social Proof Stats Bar */}
          <div className="grid grid-cols-3 max-w-xl mx-auto bg-white rounded-2xl border border-gray-200 p-4 divide-x divide-gray-100 shadow-sm">
            <div className="px-3 text-center">
              <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={14} className="fill-amber-400 text-amber-500" />
                ))}
              </div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">5.0 Star Rating</p>
            </div>
            
            <div className="px-3 text-center">
              <div className="text-xl font-extrabold text-black">{testimonials.length}</div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Proofs</p>
            </div>

            <div className="px-3 text-center">
              <div className="text-xl font-extrabold text-emerald-600 flex items-center justify-center gap-1">
                <CheckCircle2 size={18} /> 100%
              </div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Verified Proof</p>
            </div>
          </div>

        </div>
      </section>

      {/* Filter and Search Controls */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
          
          {/* Filter Pills */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap border ${
                filterType === 'all'
                  ? 'bg-black text-white border-black shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}
            >
              <MessageSquare size={13} />
              All Reviews ({testimonials.length})
            </button>

            <button
              onClick={() => setFilterType('video')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap border ${
                filterType === 'video'
                  ? 'bg-black text-white border-black shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}
            >
              <Video size={13} />
              Video Proofs ({videoCount})
            </button>

            <button
              onClick={() => setFilterType('telegram')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap border ${
                filterType === 'telegram'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}
            >
              <Shield size={13} />
              Telegram Verified ({telegramCount})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search proofs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs text-black placeholder-gray-400 font-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
            />
          </div>

        </div>
      </section>

      {/* Main Reviews Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28 flex-1 w-full">
        {filteredTestimonials.length === 0 ? (
          <div className="py-20 px-6 rounded-3xl bg-white border border-dashed border-gray-300 text-center max-w-lg mx-auto shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 text-black flex items-center justify-center mx-auto mb-4">
              <Sparkles size={24} />
            </div>
            <h3 className="text-xl font-extrabold text-black mb-2">No Reviews Found</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto font-medium leading-relaxed">
              {searchQuery ? "No reviews match your search query." : `Be the first customer to share your verified experience with ${brandTitle}!`}
            </p>
            <a
              href={`/collect/${companyHandle}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-black hover:bg-gray-800 text-white font-bold text-xs transition-all shadow-sm"
            >
              <Sparkles size={14} className="text-yellow-400" />
              Leave a Verified Review
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTestimonials.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-white border border-gray-200 p-6 flex flex-col justify-between hover:shadow-md hover:border-gray-300 transition-all duration-200 shadow-sm group relative"
              >
                <div>
                  {/* Top Header: Stars + Date + Verified Badge */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      <div className="flex gap-0.5 text-amber-500">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={14} className="fill-amber-400 text-amber-500" />
                        ))}
                      </div>
                      {item.verificationMethod === 'telegram' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 ml-2">
                          <CheckCircle2 size={11} className="stroke-[3]" />
                          Telegram
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 ml-2">
                          <CheckCircle2 size={11} className="stroke-[3]" />
                          Verified
                        </span>
                      )}
                    </div>

                    {item.createdAt && (
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </div>

                  {/* Video Player (if attached) */}
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

                  {/* Quote Body */}
                  <div className="mb-6">
                    <Quote size={18} className="text-gray-300 mb-2" />
                    <p className="text-sm sm:text-base leading-relaxed text-gray-900 font-medium break-words break-all [overflow-wrap:anywhere] whitespace-pre-wrap">
                      "{item.text}"
                    </p>
                  </div>
                </div>

                {/* Reviewer Profile Card */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100 mt-auto">
                  <img
                    src={item.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.clientName)}&background=FCE676&color=111111`}
                    alt={item.clientName}
                    className="w-10 h-10 rounded-full object-cover bg-gray-100 border border-gray-200 shadow-sm flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-extrabold text-sm text-black truncate leading-tight flex items-center gap-1.5">
                      {item.clientName}
                    </h4>
                    {item.clientCompany ? (
                      <p className="text-xs text-gray-500 font-medium truncate mt-0.5">{item.clientCompany}</p>
                    ) : item.reviewerTelegramUsername ? (
                      <p className="text-xs text-blue-600 font-medium truncate mt-0.5">@{item.reviewerTelegramUsername}</p>
                    ) : (
                      <p className="text-xs text-gray-400 font-medium mt-0.5">Verified Client</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Bottom CTA Bar */}
      <aside className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 max-w-xl w-[92%] sm:w-auto">
        <div className="bg-white/95 backdrop-blur-md border border-gray-200 px-5 py-2.5 rounded-full shadow-lg flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-800 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            Verified by <strong className="font-extrabold text-black">TrustGrid</strong>
          </div>
          <a
            href={`/collect/${companyHandle}`}
            className="px-4 py-1.5 rounded-full bg-black hover:bg-gray-800 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap"
          >
            Leave Review
            <ArrowRight size={13} />
          </a>
        </div>
      </aside>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-8 text-center text-xs font-medium text-gray-400 mt-auto">
        <p>
          Protected & Verified by{' '}
          <a href="/" className="text-black font-bold hover:underline">
            TrustGrid
          </a>
        </p>
      </footer>
    </div>
  );
};
