import React, { useState } from 'react';
import { Linkedin, Info, X, Clock, User } from 'lucide-react';
import { TrustGridMark } from './TrustGridLogo';

interface VerificationBadgeProps {
  method: 'manual' | 'email' | 'linkedin' | 'telegram';
  isVerified?: boolean;
  telegramUsername?: string;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({ method, isVerified = true, telegramUsername }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleInfo = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setIsOpen(!isOpen);
  };

  const BadgeContent = () => {
    if (method === 'telegram') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F4F4F5] border border-gray-200 rounded-lg text-[10px] font-bold text-[#0A0A0A] cursor-pointer hover:bg-gray-200 transition-colors" onClick={toggleInfo}>
          <TrustGridMark size={13} />
          <span>VERIFIED TELEGRAM {telegramUsername ? `@${telegramUsername}` : ''}</span>
          <Info size={10} className="ml-0.5 opacity-60" />
        </span>
      );
    }

    if (method === 'linkedin') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F4F4F5] border border-gray-200 rounded-lg text-[10px] font-bold text-[#0A0A0A] cursor-pointer hover:bg-gray-200 transition-colors" onClick={toggleInfo}>
          <Linkedin size={12} className="text-[#0a66c2]" />
          <span>LINKEDIN CERTIFIED</span>
          <Info size={10} className="ml-0.5 opacity-60" />
        </span>
      );
    }

    if (method === 'email') {
      if (!isVerified) {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-[10px] font-bold text-amber-800 cursor-pointer hover:bg-amber-100 transition-colors" onClick={toggleInfo}>
            <Clock size={12} />
            <span>PENDING CONFIRMATION</span>
            <Info size={10} className="ml-0.5 opacity-60" />
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F4F4F5] border border-gray-200 rounded-lg text-[10px] font-bold text-[#0A0A0A] cursor-pointer hover:bg-gray-200 transition-colors" onClick={toggleInfo}>
          <TrustGridMark size={13} />
          <span>EMAIL VERIFIED</span>
          <Info size={10} className="ml-0.5 opacity-60" />
        </span>
      );
    }

    // Manual / Default
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F4F4F5] border border-gray-200 rounded-lg text-[10px] font-bold text-[#6B7280] cursor-pointer hover:bg-gray-200 transition-colors" onClick={toggleInfo}>
        <User size={12} />
        <span>SELF-REPORTED</span>
        <Info size={10} className="ml-1 opacity-70" />
      </span>
    );
  };

  return (
    <div className="relative inline-block z-10 font-sans">
      <BadgeContent />

      {/* Verification Explanation Popup */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-[#0A0A0A] text-white p-4 rounded-xl border border-gray-800 z-50 animate-fade-in">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-[#D7FF3D] text-xs uppercase tracking-wider">Verification Source</h4>
            <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="text-gray-400 hover:text-white">
              <X size={14} />
            </button>
          </div>

          <p className="text-xs leading-relaxed text-gray-300">
            {method === 'telegram' && "This identity was verified via Telegram Login. The reviewer's Telegram account has been authenticated."}
            {method === 'linkedin' && "This identity was verified via LinkedIn. The employment history and profile are authentic."}
            {method === 'email' && !isVerified && "The client has been emailed but hasn't clicked the verification link yet."}
            {method === 'email' && isVerified && "Verified via email confirmation. The client clicked a secure link sent to their work email."}
            {method === 'manual' && "This review was manually submitted. TrustGrid checks for spam patterns but identity is self-reported."}
          </p>
        </div>
      )}
    </div>
  );
};