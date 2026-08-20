import React from 'react';
import { TrendingUp, Video, Send } from 'lucide-react';
import { TrustGridMark } from './TrustGridLogo';

interface TrustMeterProps {
  score: number;
}

export const TrustMeter: React.FC<TrustMeterProps> = ({ score }) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  const getColor = () => {
    if (score < 40) return '#EF4444';
    if (score < 70) return '#F59E0B';
    return '#D7FF3D'; // Brand Lime
  };

  return (
    <div className="bg-[#0A0A0A] text-[#FFFFFF] rounded-2xl p-6 md:p-8 mb-8 flex flex-col md:flex-row items-center gap-8 border border-gray-800 relative overflow-hidden">
      
      {/* Circular Progress */}
      <div className="relative w-32 h-32 flex-shrink-0">
         <svg className="w-full h-full transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="64"
              cy="64"
              r={54}
              stroke="#222222"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Progress Circle */}
            <circle
              cx="64"
              cy="64"
              r={54}
              stroke={getColor()}
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 54}
              strokeDashoffset={(2 * Math.PI * 54) - (score / 100) * (2 * Math.PI * 54)}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
         </svg>
         <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-white">{score}%</span>
            <span className="text-[10px] text-[#6B7280] uppercase tracking-widest font-bold">Trust</span>
         </div>
      </div>

      {/* Content */}
      <div className="flex-1 text-center md:text-left z-10">
         <h2 className="text-2xl font-black text-white mb-2 flex items-center justify-center md:justify-start gap-2">
            <span>Reputation Score</span>
            {score === 100 && <TrustGridMark size={18} />}
         </h2>
         <p className="text-gray-400 text-sm mb-6 max-w-md">
            Your Trust Score reflects genuine reviewer verification. Reach 100% to maximize conversion on your public wall.
         </p>

         {/* Tips */}
         {score < 100 ? (
            <div className="bg-[#1A1A1A] rounded-xl p-4 border border-gray-800">
               <p className="text-xs font-bold text-[#D7FF3D] uppercase mb-3 flex items-center gap-2">
                  <TrendingUp size={14} /> Tips to Improve Score
               </p>
               <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-300">
                     <span className="flex items-center gap-2"><Send size={13} className="text-[#0088cc]" /> Use Telegram Verification</span>
                     <span className="font-bold text-[#D7FF3D]">+20 pts</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-300">
                     <span className="flex items-center gap-2"><Video size={13} className="text-gray-400" /> Collect Video Testimonials</span>
                     <span className="font-bold text-[#D7FF3D]">+10 pts</span>
                  </div>
               </div>
            </div>
         ) : (
            <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#D7FF3D]/40 text-[#D7FF3D] text-xs font-bold flex items-center gap-2">
               <TrustGridMark size={16} />
               <span>Maximum verification score achieved!</span>
            </div>
         )}
      </div>

    </div>
  );
};