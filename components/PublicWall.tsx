import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { TestimonialData } from '../types';
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

        // 2. Fetch Verified Testimonials
        if (profileData) {
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
                verificationMethod: t.is_verified ? 'linkedin' : 'manual', // simplification based on available data
                status: t.status,
                createdAt: t.created_at,
                sourceUrl: t.source,
                // Add default values for missing fields to match TestimonialData
                sentiment: t.sentiment,
                score: t.score
             }));
             setTestimonials(mappedData);
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

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
           <div className="flex items-center space-x-3">
              <span className="text-brand-green">
                 <CheckCircle2 className="w-6 h-6 fill-current" />
              </span>
              <span className="font-bold text-xl tracking-tight">TrustGrid<span className="text-brand-green">.PRO</span></span>
           </div>
           
           <a href="/" className="text-sm font-medium text-gray-500 hover:text-black hover:underline">
             Create your own wall
           </a>
        </div>
      </header>
      
      {/* Profile Hero */}
      <div className="bg-white border-b border-gray-200 pb-12 pt-16">
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
            
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
               {profile.company_name || profile.full_name}
            </h1>
            <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto mb-8">
               See what verified clients are saying about our work.
            </p>

            <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-800">
               <Star className="w-4 h-4 text-yellow-500 fill-current mr-2" />
               {testimonials.length} Verified Reviews
            </div>
         </div>
      </div>

      {/* Testimonials Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
         {testimonials.length === 0 ? (
            <div className="text-center py-20 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
               <p className="text-lg">No verified testimonials yet.</p>
            </div>
         ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((t) => (
                  <TestimonialCard key={t.id} testimonial={t} primaryColor={profile.primary_color} />
                ))}
             </div>
         )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 text-center text-gray-500 text-sm">
         <p>Verified by <a href="/" className="text-brand-black hover:underline font-semibold">TrustGrid.PRO</a></p>
      </footer>
    </div>
  );
};

const TestimonialCard: React.FC<{ testimonial: TestimonialData; primaryColor?: string }> = ({ testimonial, primaryColor }) => {
   const isDark = testimonial.cardStyle === 'dark';
   const isLime = testimonial.cardStyle === 'lime';
   
   let cardClass = "relative p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg flex flex-col h-full ";
   
   if (isDark) {
      cardClass += "bg-gray-900 border-gray-800 text-white shadow-xl";
   } else if (isLime) {
      cardClass += "bg-brand-lime border-brand-lime text-gray-900 shadow-md";
   } else {
      cardClass += "bg-white border-gray-200 text-gray-900 shadow-sm";
   }

   const textColor = isDark ? "text-gray-300" : "text-gray-600";
   const headingColor = isDark ? "text-white" : "text-gray-900";

   return (
      <div className={cardClass}>
         {/* Trust Badge at top right */}
         <div className="absolute top-4 right-4 text-gray-400 opacity-50">
            <Quote className="w-8 h-8" />
         </div>

         {/* Author Header */}
         <div className="flex items-center space-x-4 mb-6 relative z-10">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
               {testimonial.avatarUrl ? (
                  <img src={testimonial.avatarUrl} alt={testimonial.clientName} className="w-full h-full object-cover" />
               ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-gray-400 text-xl">
                     {testimonial.clientName.substring(0, 1)}
                  </div>
               )}
            </div>
            <div>
               <h3 className={`font-bold text-lg ${headingColor}`}>{testimonial.clientName}</h3>
               {testimonial.clientCompany && (
                  <p className={`text-xs uppercase tracking-wide font-medium ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                     {testimonial.clientCompany}
                  </p>
               )}
            </div>
         </div>

         {/* Content */}
         <div className="grow relative z-10">
             {testimonial.videoUrl && (
                <div className="mb-4 rounded-lg overflow-hidden bg-black relative group border border-gray-200 shadow-inner" style={{ aspectRatio: '16/9' }}>
                   <video 
                      src={testimonial.videoUrl} 
                      controls 
                      className="w-full h-full object-contain"
                   />
                </div>
             )}
             
             <p className={`text-base leading-relaxed ${textColor} mt-4`}>
               "{testimonial.text}"
             </p>
         </div>

         {/* Footer / Meta */}
         <div className={`mt-6 pt-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'} flex items-center justify-between`}>
             <div className="flex items-center space-x-1.5 text-xs font-medium text-emerald-600">
                <CheckCircle2 className="w-4 h-4 fill-emerald-100 text-emerald-600" />
                <span>Verified Client</span>
             </div>
             
             <button className={`p-2 rounded-full hover:bg-black/5 transition-colors ${isDark ? 'text-gray-600 hover:text-white' : 'text-gray-300 hover:text-gray-600'}`}>
                <Share2 className="w-4 h-4" />
             </button>
         </div>
      </div>
   );
};
