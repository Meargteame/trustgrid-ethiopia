import React, { useEffect, useState } from 'react';
import { Sparkles, Quote, RefreshCw } from 'lucide-react';
import { generateTrustSummary, AiSummaryResult } from '../services/geminiService';

interface AiSummaryHeaderProps {
  reviews: string[];
}

export const AiSummaryHeader: React.FC<AiSummaryHeaderProps> = ({ reviews }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AiSummaryResult | null>(null);

  useEffect(() => {
    if (reviews.length > 0) {
      setLoading(true);
      generateTrustSummary(reviews)
        .then(result => setData(result))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
        setLoading(false);
    }
  }, [reviews]); // Re-run if reviews change
  
  if (reviews.length === 0) {
      return null;
  }

  if (loading) {
    return (
      <div className="w-full bg-white border border-gray-200 rounded-2xl p-6 mb-8 flex items-center justify-center gap-3 animate-pulse">
        <Sparkles size={18} className="text-brand-lime animate-spin" />
        <span className="text-sm font-bold text-gray-400">TrustGrid AI is analyzing {reviews.length} verified reviews...</span>
      </div>
    );
  }

  if (!data) return null;

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
          <span className="text-xs text-gray-400">Based on {reviews.length} verified sources</span>
        </div>
        
        <h3 className="text-lg md:text-xl font-medium leading-relaxed italic">
          "{data.summary}"
        </h3>

        <div className="flex gap-2 mt-4 flex-wrap">
          {data.keyStrengths.map((tag, i) => (
             <span key={i} className="text-[10px] border border-gray-700 rounded-full px-3 py-1 text-gray-300 font-bold bg-gray-900/50">
                {tag}
             </span>
          ))}
        </div>
      </div>
    </div>
  );
};