import React, { useState } from 'react';
import { CheckCircle2, Linkedin, User, Info, X, Clock, Mail } from 'lucide-react';

interface VerificationBadgeProps {
  method: 'manual' | 'email' | 'linkedin';
  isVerified?: boolean;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({ method, isVerified = true }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleInfo = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setIsOpen(!isOpen);
  };

  const BadgeContent = () => {
    if (method === 'linkedin') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0a66c2] border border-[#004182] rounded-lg text-[10px] font-bold text-white shadow-sm cursor-pointer hover:bg-[#004182] transition-colors" onClick={toggleInfo}>
          <Linkedin size={12} className="fill-white" />
          LINKEDIN CERTIFIED
          <Info size={10} className="ml-1 opacity-70" />
        </span>
      );
    }

    if (method === 'email') {
      if (!isVerified) {
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 border border-yellow-300 rounded-lg text-[10px] font-bold text-yellow-800 shadow-sm cursor-pointer hover:bg-yellow-200 transition-colors animate-pulse" onClick={toggleInfo}>
            <Clock size={12} />
            PENDING CONFIRMATION
            <Info size={10} className="ml-1 opacity-70" />
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 border border-emerald-300 rounded-lg text-[10px] font-bold text-emerald-800 shadow-sm cursor-pointer hover:bg-emerald-200 transition-colors" onClick={toggleInfo}>
          <CheckCircle2 size={12} />
          CLIENT VERIFIED
          <Info size={10} className="ml-1 opacity-70" />
        </span>
      );
    }

    // Manual / Default
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 border border-gray-300 rounded-lg text-[10px] font-bold text-gray-500 cursor-pointer hover:bg-gray-200 transition-colors" onClick={toggleInfo}>
        <User size={12} />
        SELF-REPORTED
        <Info size={10} className="ml-1 opacity-70" />
      </span>
    );
  };

  return (
    <div className="relative inline-block z-10 font-sans">
      <BadgeContent />

      {/* Verification Explanation Popup */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-black text-white p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(212,249,84,1)] z-50 animate-fade-in border border-[#D4F954]">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-[#D4F954] text-xs uppercase tracking-wider">Verification Source</h4>
            <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="text-gray-400 hover:text-white">
              <X size={14} />
            </button>
          </div>

          <p className="text-xs leading-relaxed text-gray-300">
            {method === 'linkedin' && "This identity was cryptographically verified via LinkedIn OAuth. The employment history and profile are authentic."}
            {method === 'email' && !isVerified && "The client has been emailed but hasn't clicked the verification link yet."}
            {method === 'email' && isVerified && "Verified via email confirmation. The client clicked a secure link sent to their work email."}
            {method === 'manual' && "This review was manually submitted by the user. TrustGrid checks for spam patterns but identity is self-reported."}
          </p>
        </div>
      )}
    </div>
  );
};