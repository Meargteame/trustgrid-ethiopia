import React from 'react';
import { TrendingUp, CheckCircle2, Video, Linkedin } from 'lucide-react';

interface TrustMeterProps {
  score: number;
}

export const TrustMeter: React.FC<TrustMeterProps> = ({ score }) => {
  // SVG Circle calculations
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  const getColor = () => {
    if (score < 40) return '#EF4444'; // Red
    if (score < 70) return '#F59E0B'; // Amber
    return '#D4F954'; // Brand Lime
  };

  return (
    <div className="bg-black text-white rounded-3xl p-6 md:p-8 mb-8 flex flex-col md:flex-row items-center gap-8 shadow-[8px_8px_0px_0px_rgba(212,249,84,1)] border-2 border-brand-lime relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-lime opacity-10 blur-3xl rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

      {/* Circular Progress */}
      <div className="relative w-32 h-32 flex-shrink-0">
         <svg className="w-full h-full transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="#333"
              strokeWidth="8"
              fill="transparent"
              className="scale-[2] origin-center"
            />
            {/* Progress Circle */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke={getColor()}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="scale-[2] origin-center transition-all duration-1000 ease-out"
            />
         </svg>
         <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black">{score}%</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Trust</span>
         </div>
      </div>

      {/* Content */}
      <div className="flex-1 text-center md:text-left z-10">
         <h2 className="text-2xl font-bold mb-2 flex items-center justify-center md:justify-start gap-2">
            Reputation Score
            {score === 100 && <CheckCircle2 className="text-brand-lime" />}
         </h2>
         <p className="text-gray-400 text-sm mb-6 max-w-md">
            Your Trust Score determines your visibility on the TrustGrid marketplace. Reach 100% to get the "Verified Elite" badge.
         </p>

         {/* Tips */}
         {score < 100 ? (
            <div className="bg-white/10 rounded-xl p-4 border border-white/10">
               <p className="text-xs font-bold text-brand-lime uppercase mb-3 flex items-center gap-2">
                  <TrendingUp size={14} /> Tips to Improve
               </p>
               <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                     <span className="flex items-center gap-2"><Video size={14} className="text-gray-400" /> Add a Video Testimonial</span>
                     <span className="font-bold text-brand-lime">+20 pts</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                     <span className="flex items-center gap-2"><Linkedin size={14} className="text-gray-400" /> Connect LinkedIn</span>
                     <span className="font-bold text-brand-lime">+10 pts</span>
                  </div>
               </div>
            </div>
         ) : (
            <div className="bg-brand-lime/20 rounded-xl p-4 border border-brand-lime text-brand-lime text-sm font-bold">
               🎉 You have reached maximum trust! Keep maintaining your streak.
            </div>
         )}
      </div>

    </div>
  );
};