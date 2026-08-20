import React, { useEffect, useState } from 'react';
import { Star, Loader2, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TrustGridMark } from './TrustGridLogo';

interface Testimonial {
  id: string;
  name: string;
  text: string;
  company?: string;
  avatar_url?: string;
  status: string;
}

export const Testimonials: React.FC = () => {
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicReviews = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('testimonials')
          .select('id, name, text, company, avatar_url, status')
          .in('status', ['verified', 'approved', 'published'])
          .order('created_at', { ascending: false })
          .limit(4);

        if (!error && data) {
          setReviews(data);
        }
      } catch (err) {
        console.error("Failed to load public reviews", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicReviews();
  }, []);

  return (
    <section id="testimonials" className="py-24 bg-[#FFFFFF] border-b border-[#F4F4F5] scroll-mt-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4F4F5] border border-gray-200 text-xs font-bold text-[#0A0A0A] mb-4">
            <span>Verified Wall</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0A0A0A] tracking-tight leading-tight mb-4">
            Recent verified customer reviews
          </h2>
          <p className="text-[#6B7280] text-base leading-relaxed max-w-xl">
            Live feedback submitted by genuine clients and authenticated through Telegram.
          </p>
        </div>

        {loading ? (
           <div className="flex justify-center py-12">
             <Loader2 className="animate-spin text-[#0A0A0A]" />
           </div>
        ) : reviews.length > 0 ? (
          <div className={`grid gap-6 ${
            reviews.length === 1 
              ? 'max-w-lg' 
              : reviews.length === 2 
                ? 'grid-cols-1 md:grid-cols-2 max-w-3xl' 
                : reviews.length === 3 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
          }`}>
            {reviews.map((review) => (
              <div key={review.id} className="border border-gray-200 p-6 rounded-2xl bg-[#FFFFFF] flex flex-col justify-between overflow-hidden">
                <div>
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="fill-amber-400 text-amber-500" />
                    ))}
                  </div>
                  <h4 className="font-bold text-sm mb-2 text-[#0A0A0A]">{review.company || 'Verified Client'}</h4>
                  <p className="text-xs text-[#6B7280] mb-6 leading-relaxed flex-1 break-words [overflow-wrap:anywhere] whitespace-pre-wrap">
                    "{review.text}"
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-[#F4F4F5]">
                  <img 
                    src={review.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.name)}&background=F4F4F5&color=0A0A0A`} 
                    alt={review.name} 
                    className="w-8 h-8 rounded-full object-cover bg-[#F4F4F5] border border-gray-200" 
                  />
                  <div className="min-w-0 flex-1">
                     <div className="flex items-center gap-1.5">
                       <p className="text-xs font-bold text-[#0A0A0A] truncate">{review.name}</p>
                       <TrustGridMark size={12} />
                     </div>
                     <p className="text-[10px] text-[#6B7280] font-medium">
                        Telegram Verified
                     </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-gray-200 bg-[#F4F4F5] rounded-2xl p-12 text-left max-w-2xl">
            <div className="w-10 h-10 rounded-xl bg-[#0A0A0A] text-[#FFFFFF] flex items-center justify-center mb-4">
              <ShieldCheck size={20} className="text-[#D7FF3D]" />
            </div>
            <h3 className="text-lg font-bold text-[#0A0A0A] mb-2">Be among the first verified businesses</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed mb-6">
              TrustGrid is in early access. Claim your custom Wall of Proof, send your verification link to your clients, and start displaying genuine social proof today.
            </p>
            <a 
              href="#features" 
              className="inline-flex items-center text-xs font-bold text-[#0A0A0A] hover:underline"
            >
              See how verification works →
            </a>
          </div>
        )}
      </div>
    </section>
  );
};