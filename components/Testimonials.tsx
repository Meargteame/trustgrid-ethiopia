import React, { useEffect, useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
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

const STATIC_REVIEWS = [
  {
    id: 'static-1',
    name: "Karan Lynn",
    text: "I was recommended TrustGrid from a friend and WOW! Giving my clients peace of mind has helped me grow beyond my expectations.",
    company: "Founder",
    avatar_url: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=100&h=100",
    status: 'verified'
  },
  {
    id: 'static-2',
    name: "Dianne Russell",
    text: "Such a wonderful platform! Someone who trades regularly but does not have a physical shop, this plan has been a lifesaver.",
    company: "Housewife",
    avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100",
    status: 'verified'
  },
  {
    id: 'static-3',
    name: "Marvin McKinney",
    text: "After a hiatus from the market I needed some encouragement to help me get my confidence back. TrustGrid provided that.",
    company: "Student",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100",
    status: 'verified'
  },
  {
    id: 'static-4',
    name: "Ronald Richards",
    text: "The workouts are fun to do but still make you sweat! I'm so grateful for the two of you for starting this amazing app.",
    company: "Businessman",
    avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100",
    status: 'verified'
  }
];

export const Testimonials: React.FC = () => {
  const [reviews, setReviews] = useState<Testimonial[]>(STATIC_REVIEWS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicReviews = async () => {
      try {
        setLoading(true);
        // Fetch 4 most recent verified reviews from ANY user (public wall concept)
        // Or strictly from the demo user if we want consistency. 
        // For now, let's show real verified reviews.
        const { data, error } = await supabase
          .from('testimonials')
          .select('id, name, text, company, avatar_url, status')
          .eq('status', 'verified')
          .order('created_at', { ascending: false })
          .limit(4);

        if (!error && data && data.length > 0) {
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
            People all over the world use TrustGrid for their business
          </h2>
          <Button variant="outline" size="sm" className="mt-4 md:mt-0 rounded-lg">View All Reviews</Button>
        </div>

        {loading ? (
           <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-400" /></div>
        ) : (
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
        )}

      </div>
    </section>
  );
};