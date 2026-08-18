import React, { useEffect, useState } from 'react';
import { Star, Loader2, Shield } from 'lucide-react';
import { Button } from './Button';
import { supabase } from '../lib/supabase';

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
          .eq('status', 'verified')
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
    <section id="testimonials" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-black max-w-lg leading-tight">
            Real reviews from real businesses
          </h2>
        </div>

        {loading ? (
           <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-400" /></div>
        ) : reviews.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="border border-gray-200 p-6 rounded-2xl hover:shadow-lg transition-shadow bg-white flex flex-col">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-brand-lime text-brand-lime" />
                  ))}
                </div>
                <h4 className="font-bold text-sm mb-2">{review.company || 'Verified Client'}</h4>
                <p className="text-xs text-gray-500 mb-6 leading-relaxed flex-1">
                  "{review.text}"
                </p>
                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-100">
                  <img src={review.avatar_url || `https://ui-avatars.com/api/?name=${review.name}`} alt={review.name} className="w-8 h-8 rounded-full object-cover bg-gray-100" />
                  <div>
                     <p className="text-xs font-bold text-black">{review.name}</p>
                     <p className="text-[10px] text-gray-400">Verified Client</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center flex flex-col items-center justify-center">
            <div className="bg-gray-50 p-4 rounded-full mb-6">
              <Shield size={32} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Be one of our first verified businesses</h3>
            <p className="text-gray-500 max-w-md mb-2">
              TrustGrid is just getting started. Sign up to create your wall of proof and be among the first to build verified trust with your customers.
            </p>
          </div>
        )}

      </div>
    </section>
  );
};