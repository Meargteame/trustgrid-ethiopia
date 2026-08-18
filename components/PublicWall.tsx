import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { TestimonialData, WidgetConfig } from '../types';
import { CheckCircle2, Star, Quote, Search, Share2, Play } from 'lucide-react';

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

  useEffect(() => {
    const fetchMethods = async () => {
      // Clean handle - remove trailing slash if present
      const cleanHandle = companyHandle.endsWith('/') ? companyHandle.slice(0, -1) : companyHandle;

      try {
        setLoading(true);
        // 1. Fetch Profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', cleanHandle)
          .single();

        if (profileError) {
          setError('Company not found');
          console.error(profileError);
          return;
        }

        setProfile(profileData);

        // -- ANALYTICS TRACKING --
        // Insert view record
        if (profileData && profileData.id) {
           // Fire and forget - don't await to block render
           const referrer = document.referrer || 'direct';
           supabase.from('views').insert({
              wall_id: profileData.id,
              referrer: referrer
           }).then(({ error }) => {
              if (error) console.error("Failed to track view:", error);
           });
        }
        // ------------------------

        // 2. Fetch Widget Config & Verified Testimonials
        if (profileData) {
          const { data: config } = await supabase
            .from('widget_configs')
            .select('*')
            .eq('user_id', profileData.id)
            .single();

          let currentConfig = null;
          if (config) {
             currentConfig = {
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
             } as WidgetConfig;
             setWidgetConfig(currentConfig);
          }

          const { data: testimonialsData, error: testimonialsError } = await supabase
            .from('testimonials')
            .select('*')
            .eq('user_id', profileData.id)
            .eq('status', 'verified')
            .order('created_at', { ascending: false });

          if (testimonialsError) {
            console.error(testimonialsError);
          } else {
             // Map DB fields to TestimonialData if necessary or just cast
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
                // Add default values for missing fields to match TestimonialData
                sentiment: t.sentiment,
                score: t.score
             }));
             
             // Apply widget filters
             const minRatingRequired = currentConfig?.min_rating || 0;
             const maxCards = currentConfig?.cards_to_show || 50;
             
             const filtered = mappedData
               .filter(t => (t.score || 100) >= (minRatingRequired * 20)) // approximate 1-5 to 0-100 scale
               .slice(0, maxCards);

             setTestimonials(filtered);
          }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <div className="text-xl font-bold text-gray-800 mb-2">Page Not Found</div>
        <p className="text-gray-600">The public wall for "{companyHandle}" could not be found.</p>
      </div>
    );
  }

  // Apply Styles based on WidgetConfig
  let previewClass = "bg-white";
  let textClass = "text-black font-sans";
  let cardClass = "bg-white border border-gray-100 shadow-sm rounded-xl";
  
  if (widgetConfig) {
      const { theme, borderRadius, shadow, font } = widgetConfig;
      
      if (theme === 'dark_mode') {
         previewClass = "bg-black border-2 border-blue-900";
         cardClass = "bg-gray-900 border border-gray-800 text-white";
         textClass = "text-white";
      } else if (theme === 'minimalist') {
         previewClass = "bg-gray-50";
         cardClass = "bg-white border-0 shadow-none";
         textClass = "text-gray-800";
      } else if (theme === 'brand') {
         previewClass = "bg-brand-lime/5 border-2 border-brand-lime";
         cardClass = "bg-white border-2 border-brand-lime shadow-brutal";
         textClass = "text-black";
      }

      const radiusMap = { 'none': 'rounded-none', 'sm': 'rounded-md', 'md': 'rounded-xl', 'full': 'rounded-3xl' };
      cardClass = cardClass.replace('rounded-xl', '');
      cardClass += ` ${radiusMap[borderRadius as keyof typeof radiusMap] || 'rounded-xl'}`;

      const shadowMap = { 'none': 'shadow-none', 'sm': 'shadow-sm', 'card': 'shadow-md', 'strong': 'shadow-xl' };
      cardClass = cardClass.replace('shadow-sm', '');
      cardClass += ` ${shadowMap[shadow as keyof typeof shadowMap] || 'shadow-md'}`;

      const fontMap = { 'inter': 'font-sans', 'serif': 'font-serif', 'mono': 'font-mono' };
      textClass = textClass.replace('font-sans', '');
      textClass += ` ${fontMap[font as keyof typeof fontMap] || 'font-sans'}`;
  }

  const layout = widgetConfig?.layout || 'grid';
  const columns = widgetConfig?.columns || 3;
  const gap = widgetConfig?.gap === 'tight' ? '2' : widgetConfig?.gap === 'loose' ? '8' : '4';

  return (
    <div className={`min-h-screen font-sans flex flex-col ${previewClass}`}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
           <div className="flex items-center space-x-3">
              <span className="text-brand-green">
                 <CheckCircle2 className="w-6 h-6 fill-current" />
              </span>
              <span className="font-bold text-xl tracking-tight text-gray-900">TrustGrid<span className="text-brand-green">.PRO</span></span>
           </div>
           
           <a href="/" className="text-sm font-medium text-gray-500 hover:text-black hover:underline">
             Create your own wall
           </a>
        </div>
      </header>
      
      {/* Profile Hero */}
      <div className="pb-12 pt-16">
         <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="relative inline-block mb-6">
              <div 
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-3xl font-bold text-white overflow-hidden"
                style={{ backgroundColor: profile.primary_color || '#000' }}
              >
                 {profile.logo_url ? (
                   <img src={profile.logo_url} alt={profile.company_name} className="w-full h-full object-cover" />
                 ) : profile.avatar_url ? (
                   <img src={profile.avatar_url} alt={profile.company_name} className="w-full h-full object-cover" />
                 ) : (
                   (profile.company_name || profile.full_name || 'C').substring(0, 1).toUpperCase()
                 )}
              </div>
              <div className="absolute bottom-0 right-0 bg-brand-green text-black p-1.5 rounded-full border-2 border-white" title="Verified Pro">
                 <CheckCircle2 className="w-5 h-5 fill-current" />
              </div>
            </div>
            
            <h1 className={`text-4xl font-extrabold mb-2 tracking-tight ${textClass}`}>
               {profile.company_name || profile.full_name}
            </h1>
            <p className={`text-lg font-medium max-w-2xl mx-auto mb-8 opacity-70 ${textClass}`}>
               See what verified clients are saying about our work.
            </p>
         </div>
      </div>

      {/* Wall Content */}
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
         {widgetConfig?.header_title && (
            <div className={`text-center mb-10 ${textClass}`}>
               <h2 className="text-2xl font-bold mb-2">{widgetConfig.header_title}</h2>
               <div className="w-12 h-1 bg-brand-lime mx-auto rounded-full"></div>
            </div>
         )}

         {testimonials.length === 0 ? (
            <div className="text-center py-20 opacity-50 border-2 border-dashed border-gray-400 rounded-2xl mx-auto max-w-2xl">
               <p className={`text-lg ${textClass}`}>No verified testimonials available.</p>
            </div>
         ) : (
            <div className={`w-full transition-all duration-500 ${
               layout === 'grid' 
                  ? `grid grid-cols-1 md:grid-cols-${columns} gap-${gap}` 
                  : 'flex flex-col gap-4 max-w-2xl mx-auto'
            }`}>
               {testimonials.map((item) => (
                  <div key={item.id} className={`p-6 transition-all duration-300 flex flex-col h-full ${cardClass} ${layout === 'carousel' ? 'min-w-[300px]' : 'w-full'} hover:-translate-y-1 hover:shadow-lg`}>
                     <div className="flex justify-between items-start mb-4">
                        {widgetConfig?.show_rating !== false && (
                           <div className="flex gap-0.5 text-yellow-400 text-xs">
                              {[1,2,3,4,5].map(i => <span key={i} style={{color: '#FBBF24'}}>★</span>)}
                           </div>
                        )}
                        {widgetConfig?.show_date !== false && item.createdAt && (
                           <div className={`text-[10px] uppercase font-bold tracking-wider opacity-40 ${textClass}`}>
                              {new Date(item.createdAt).toLocaleDateString()}
                           </div>
                        )}
                     </div>

                     <p className={`text-base leading-relaxed mb-6 flex-1 opacity-90 ${textClass}`}>
                        "{item.text}"
                     </p>

                     <div className="flex items-center gap-3 pt-4 border-t border-gray-500/10 mt-auto">
                        {widgetConfig?.show_avatar !== false && (
                           <img 
                              src={item.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.clientName)}`} 
                              className="w-10 h-10 rounded-full object-cover bg-gray-200 border border-gray-100" 
                              alt={item.clientName}
                           />
                        )}
                        <div>
                           <p className={`text-sm font-bold ${layout === 'popup' ? 'text-xs' : ''} ${textClass}`}>{item.clientName}</p>
                           {item.clientCompany && <p className={`text-xs opacity-60 ${textClass}`}>{item.clientCompany}</p>}
                        </div>
                        <div className="ml-auto">
                           {item.verificationMethod === 'telegram' ? (
                              <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full border border-blue-100" title="Identity Verified">
                                 <CheckCircle2 size={12} className="text-blue-500" />
                                 <span className="text-[9px] font-bold text-blue-700 uppercase tracking-wide">
                                    Telegram {item.reviewerTelegramUsername ? `@${item.reviewerTelegramUsername}` : ''}
                                 </span>
                              </div>
                           ) : (
                              <div className="w-6 h-6 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center" title="Verified Client">
                                 <CheckCircle2 size={12} />
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 text-center text-gray-500 text-sm mt-auto">
         <p>Verified by <a href="/" className="text-brand-black hover:underline font-semibold">TrustGrid.PRO</a></p>
      </footer>
    </div>
  );
};
