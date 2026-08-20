import React from 'react';

interface TrustGridLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const TrustGridLogo: React.FC<TrustGridLogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  const markSizes = {
    sm: 18,
    md: 24,
    lg: 30
  };

  return (
    <div className={`inline-flex items-center gap-1.5 font-sans font-black tracking-tight text-[#0A0A0A] select-none ${sizeClasses[size]} ${className}`}>
      <span>TrustGrid</span>
      <TrustGridMark size={markSizes[size]} />
    </div>
  );
};

export const TrustGridMark: React.FC<{ size?: number; className?: string }> = ({ size = 18, className = '' }) => (
  <span 
    className={`inline-flex items-center justify-center flex-shrink-0 ${className}`}
    style={{ width: size, height: size }}
    title="TrustGrid Verified"
  >
    <img 
      src="/trustgrid-mark.png" 
      alt="TrustGrid" 
      className="w-full h-full object-contain rounded-md select-none"
      onError={(e) => {
        // Fallback to SVG if png fails to load
        (e.target as HTMLImageElement).src = '/trustgrid-mark.svg';
      }}
    />
  </span>
);
