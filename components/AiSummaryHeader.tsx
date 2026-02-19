import React, { useEffect, useState } from 'react';
import { Sparkles, Quote } from 'lucide-react';

interface AiSummaryHeaderProps {
  reviewCount: number;
}

export const AiSummaryHeader: React.FC<AiSummaryHeaderProps> = ({ reviewCount }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate AI generation time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-white border border-gray-200 rounded-2xl p-6 mb-8 flex items-center justify-center gap-3 animate-pulse">
        <Sparkles size={18} className="text-brand-lime animate-spin" />
        <span className="text-sm font-bold text-gray-400">TrustGrid AI is reading {reviewCount} reviews...</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-black text-white rounded-2xl p-6 mb-8 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(212,249,84,1)] border-2 border-black">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Quote size={80} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-brand-lime text-black text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
            AI Summary
          </span>
          <span className="text-xs text-gray-400">Based on {reviewCount} verified sources</span>
        </div>
        
        <h3 className="text-lg md:text-xl font-medium leading-relaxed">
          "Trusted by <span className="text-brand-lime font-bold underline decoration-brand-lime/30 underline-offset-4">20+ clients</span> for <span className="text-white font-bold">Fast Delivery</span> and <span className="text-white font-bold">Excellent Communication</span>. Clients frequently mention high-quality design work and reliable deadlines."
        </h3>

        <div className="flex gap-2 mt-4">
          {['Fast Turnaround', 'Verified Pro', 'Great Communication'].map((tag, i) => (
             <span key={i} className="text-[10px] border border-gray-700 rounded-full px-3 py-1 text-gray-300">
                {tag}
             </span>
          ))}
        </div>
      </div>
    </div>
  );
};