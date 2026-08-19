import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { TestimonialData, WidgetConfig } from '../types';
import { 
  CheckCircle2, Star, Quote, Search, Share2, Play, 
  Shield, Sparkles, Filter, Video, MessageSquare, ExternalLink,
  ArrowRight, Heart, Award
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
      // Type Filter
      if (filterType === 'video' && !item.videoUrl) return false;
      if (filterType === 'telegram' && item.verificationMethod !== 'telegram') return false;

      // Search Query
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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-white">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin"></div>
          <Sparkles className="w-6 h-6 text-emerald-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="text-sm font-bold text-gray-400 tracking-wider uppercase animate-pulse">
          Loading Wall of Proof...
        </p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
            <Shield size={32} />
          </div>
          <h1 className="text-2xl font-black mb-2">Wall Not Found</h1>
          <p className="text-gray-400 text-sm mb-6">
            The requested public wall for "<span className="text-white font-mono">{companyHandle}</span>" does not exist or has been relocated.
          </p>
          <a
            href="/"
            className="w-full py-3 px-4 rounded-xl font-bold bg-white text-black hover:bg-gray-100 transition-all inline-block text-sm"
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-black flex flex-col relative overflow-x-hidden">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Radiant Background Gradients */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-emerald-500/15 via-blue-500/10 to-transparent blur-[120px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-emerald-600/5 blur-[150px] pointer-events-none -z-10"></div>

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-lime-400 flex items-center justify-center text-black font-black text-xs shadow-lg group-hover:scale-105 transition-transform">
                TG
              </div>
              <span className="font-black text-lg tracking-tight text-white">
                TrustGrid<span className="text-emerald-400">.PRO</span>
              </span>
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyShare}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              title="Share Wall"
            >
              <Share2 size={13} />
              <span className="hidden sm:inline">Share Wall</span>
            </button>
            <a
              href={`/collect/${companyHandle}`}
              className="px-4 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 hover:scale-105"
            >
              <Sparkles size={13} />
              Leave Review
            </a>
          </div>
        </div>
      </header>

      {/* Hero Showcase */}
      <section className="pt-16 pb-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Avatar / Logo with glowing ring */}
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500 to-lime-400 blur-md opacity-70 animate-pulse"></div>
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={brandTitle}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover relative border-4 border-slate-950 shadow-2xl p-0.5 bg-slate-900"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-slate-900 to-slate-800 text-emerald-400 relative border-4 border-slate-950 shadow-2xl flex items-center justify-center text-3xl sm:text-4xl font-black">
                {brandTitle.charAt(0).toUpperCase()}
              </div>
            )}
            <div 
              className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-lg border-2 border-slate-950" 
              title="100% Cryptographically Verified Business"
            >
              <CheckCircle2 size={18} className="stroke-[3]" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-black tracking-wider uppercase mb-3">
            <Shield size={12} />
            Verified Wall of Proof
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
            {brandTitle}
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-8 font-medium">
            Real customer reviews and video testimonials cryptographically verified through Telegram & TrustGrid.
          </p>

          {/* Social Proof Stats Bar */}
          <div className="grid grid-cols-3 max-w-xl mx-auto bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800/80 p-4 divide-x divide-slate-800 shadow-2xl">
            <div className="px-3 text-center">
              <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={13} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">5.0 Star Rating</p>
            </div>
            
            <div className="px-3 text-center">
              <div className="text-lg font-black text-white">{testimonials.length}</div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Proofs</p>
            </div>

            <div className="px-3 text-center">
              <div className="text-lg font-black text-emerald-400 flex items-center justify-center gap-1">
                <CheckCircle2 size={16} /> 100%
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Verified Identity</p>
            </div>
          </div>

        </div>
      </section>

      {/* Filter and Search Controls */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-md p-3 rounded-2xl border border-slate-800/80">
          
          {/* Filter Pills */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                filterType === 'all'
                  ? 'bg-white text-slate-950 shadow-md'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <MessageSquare size={13} />
              All Reviews ({testimonials.length})
            </button>

            <button
              onClick={() => setFilterType('video')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                filterType === 'video'
                  ? 'bg-emerald-400 text-slate-950 shadow-md'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Video size={13} />
              Video Proofs ({videoCount})
            </button>

            <button
              onClick={() => setFilterType('telegram')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                filterType === 'telegram'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Shield size={13} />
              Telegram Verified ({telegramCount})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search proofs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>

        </div>
      </section>

      {/* Main Reviews Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28 flex-1 w-full">
        {filteredTestimonials.length === 0 ? (
          <div className="py-20 px-6 rounded-3xl bg-slate-900/40 border-2 border-dashed border-slate-800 text-center max-w-lg mx-auto backdrop-blur-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <Sparkles size={28} />
            </div>
            <h3 className="text-xl font-black text-white mb-2">No Reviews Found</h3>
            <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto leading-relaxed">
              {searchQuery ? "No reviews match your search query." : `Be the first customer to share your verified experience with ${brandTitle}!`}
            </p>
            <a
              href={`/collect/${companyHandle}`}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs transition-all shadow-xl shadow-emerald-500/20 hover:scale-105"
            >
              <Sparkles size={14} />
              Leave a Verified Review
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTestimonials.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 p-6 flex flex-col justify-between hover:border-slate-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-950/20 group relative overflow-hidden"
              >
                {/* Glow accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors"></div>

                <div>
                  {/* Top Header: Stars + Date + Verified Badge */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      <div className="flex gap-0.5 text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={14} className="fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      {item.verificationMethod === 'telegram' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 ml-2">
                          <CheckCircle2 size={11} className="stroke-[3]" />
                          Telegram
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ml-2">
                          <CheckCircle2 size={11} className="stroke-[3]" />
                          Verified
                        </span>
                      )}
                    </div>

                    {item.createdAt && (
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </div>

                  {/* Video Player */}
                  {item.videoUrl && (
                    <div className="mb-4 rounded-2xl overflow-hidden bg-black aspect-video relative group/video shadow-2xl border border-slate-800">
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
                    <Quote size={20} className="text-slate-700 mb-2" />
                    <p className="text-sm sm:text-base leading-relaxed text-slate-200 font-medium break-words whitespace-pre-wrap">
                      "{item.text}"
                    </p>
                  </div>
                </div>

                {/* Reviewer Profile */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-800/80 mt-auto">
                  <img
                    src={item.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.clientName)}&background=0D1117&color=fff`}
                    alt={item.clientName}
                    className="w-11 h-11 rounded-full object-cover bg-slate-800 border-2 border-slate-700 shadow-md flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-white truncate leading-tight flex items-center gap-1.5">
                      {item.clientName}
                    </h4>
                    {item.clientCompany ? (
                      <p className="text-xs text-slate-400 truncate mt-0.5">{item.clientCompany}</p>
                    ) : item.reviewerTelegramUsername ? (
                      <p className="text-xs text-blue-400 font-medium truncate mt-0.5">@{item.reviewerTelegramUsername}</p>
                    ) : (
                      <p className="text-xs text-slate-500 truncate mt-0.5">Verified Client</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Bottom CTA Bar */}
      <aside className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 max-w-xl w-[92%] sm:w-auto">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 px-5 py-3 rounded-full shadow-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Verified with <strong className="text-white">TrustGrid</strong>
          </div>
          <a
            href={`/collect/${companyHandle}`}
            className="px-4 py-2 rounded-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-1.5 whitespace-nowrap hover:scale-105"
          >
            Leave Review
            <ArrowRight size={13} />
          </a>
        </div>
      </aside>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 text-center text-xs text-slate-500 mt-auto">
        <p>
          Protected & Verified by{' '}
          <a href="/" className="text-slate-300 hover:text-white font-bold hover:underline">
            TrustGrid.PRO
          </a>
        </p>
      </footer>
    </div>
  );
};
