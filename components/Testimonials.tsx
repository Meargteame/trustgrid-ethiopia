import React from 'react';
import { Star } from 'lucide-react';
import { Button } from './Button';

const reviews = [
  {
    title: "Well worth the money",
    text: "I was recommended TrustGrid from a friend and WOW! Giving my clients peace of mind has helped me grow beyond my expectations.",
    author: "Karan Lynn",
    role: "Founder at Company",
    avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=100&h=100"
  },
  {
    title: "Optimal centre for trust",
    text: "Such a wonderful platform! Someone who trades regularly but does not have a physical shop, this plan has been a lifesaver.",
    author: "Dianne Russell",
    role: "Housewife",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100"
  },
  {
    title: "Best verification program",
    text: "After a hiatus from the market I needed some encouragement to help me get my confidence back. TrustGrid provided that.",
    author: "Marvin McKinney",
    role: "College Student",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100"
  },
  {
    title: "Thank you for changing my mindset",
    text: "The workouts are fun to do but still make you sweat! I'm so grateful for the two of you for starting this amazing app.",
    author: "Ronald Richards",
    role: "Businessman",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100"
  }
];

export const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-black max-w-lg leading-tight">
            People all over the world use TrustGrid for their business
          </h2>
          <Button variant="outline" size="sm" className="mt-4 md:mt-0 rounded-lg">View All Reviews</Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((review, index) => (
            <div key={index} className="border border-gray-200 p-6 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-brand-lime text-brand-lime" />
                ))}
              </div>
              <h4 className="font-bold text-sm mb-2">{review.title}</h4>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                {review.text}
              </p>
              <div className="flex items-center gap-3 mt-auto">
                <img src={review.avatar} alt={review.author} className="w-8 h-8 rounded-full object-cover" />
                <div>
                   <p className="text-xs font-bold text-black">{review.author}</p>
                   <p className="text-[10px] text-gray-400">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};