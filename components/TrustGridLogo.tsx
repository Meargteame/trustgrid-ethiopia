import React from 'react';

interface TrustGridLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const TrustGridLogo: React.FC<TrustGridLogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 text-xl',
    md: 'h-8 text-2xl',
    lg: 'h-10 text-3xl'
  };

  const markSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className={`inline-flex items-center gap-1 font-sans font-black tracking-tight text-[#0A0A0A] select-none ${sizeClasses[size]} ${className}`}>
      <span>TrustGrid</span>
      <span className={`inline-flex items-center justify-center rounded-[4px] bg-[#D7FF3D] border-[1.5px] border-[#0A0A0A] p-0.5 ${markSizes[size]}`} title="TrustGrid Verified">
        <svg viewBox="0 0 16 16" fill="none" className="w-full h-full">
          <circle cx="4.5" cy="4.5" r="0.9" fill="#0A0A0A" />
          <circle cx="11.5" cy="4.5" r="0.9" fill="#0A0A0A" />
          <circle cx="4.5" cy="11.5" r="0.9" fill="#0A0A0A" />
          <circle cx="11.5" cy="11.5" r="0.9" fill="#0A0A0A" />
          <path d="M3.5 8 L6.5 11 L12.5 4.5" stroke="#0A0A0A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
};

export const TrustGridMark: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <span 
    className={`inline-flex items-center justify-center rounded-[4px] bg-[#D7FF3D] border-[1.5px] border-[#0A0A0A] flex-shrink-0 ${className}`}
    style={{ width: size, height: size, padding: size > 16 ? 2 : 1 }}
    title="TrustGrid Telegram Verified"
  >
    <svg viewBox="0 0 16 16" fill="none" className="w-full h-full">
      <circle cx="4.5" cy="4.5" r="0.9" fill="#0A0A0A" />
      <circle cx="11.5" cy="4.5" r="0.9" fill="#0A0A0A" />
      <circle cx="4.5" cy="11.5" r="0.9" fill="#0A0A0A" />
      <circle cx="11.5" cy="11.5" r="0.9" fill="#0A0A0A" />
      <path d="M3.5 8 L6.5 11 L12.5 4.5" stroke="#0A0A0A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);
