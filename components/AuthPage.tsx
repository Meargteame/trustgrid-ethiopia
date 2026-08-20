import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TrustGridLogo } from './TrustGridLogo';

interface AuthPageProps {
  onLogin: () => void;
  onBack: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onBack }) => {
  const telegramWrapperRef = useRef<HTMLDivElement>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Add the callback to window so the script can call it
    (window as any).onTelegramAuth = async (user: any) => {
       try {
          const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/telegram-auth`;
          const res = await fetch(url, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ action: 'login', telegramData: user })
          });
          const data = await res.json();
          if (data.error) throw new Error(data.error);
          
          await supabase.auth.setSession(data.session);
          onLogin();
       } catch (err: any) {
          setErrorMsg(err.message || 'Telegram login failed');
       }
    };

    if (telegramWrapperRef.current) {
       telegramWrapperRef.current.innerHTML = '';
       const script = document.createElement('script');
       script.src = 'https://telegram.org/js/telegram-widget.js?22';
       script.setAttribute('data-telegram-login', import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'placeholder_bot');
       script.setAttribute('data-size', 'large');
       script.setAttribute('data-radius', '12');
       script.setAttribute('data-onauth', 'onTelegramAuth(user)');
       script.setAttribute('data-request-access', 'write');
       script.async = true;
       telegramWrapperRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col font-sans">
      
      {/* Header */}
      <div className="p-6 border-b border-[#F4F4F5] flex items-center justify-between">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-xs font-bold text-[#6B7280] hover:text-[#0A0A0A] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] rounded-lg px-2 py-1"
        >
          <ArrowLeft size={16} /> Back to Home
        </button>
        <TrustGridLogo size="sm" />
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-[#0A0A0A] mb-2 tracking-tight">
              Sign In to TrustGrid
            </h1>
            <p className="text-[#6B7280] text-sm">
              Authenticate via Telegram to manage your Wall of Proof.
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-8 flex flex-col items-center">
            
            {errorMsg && (
              <div className="p-3 mb-6 w-full bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="my-4" ref={telegramWrapperRef}></div>

            <p className="text-[11px] text-[#6B7280] text-center mt-6">
              Instant login via Telegram official authentication. No password required.
            </p>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[11px] text-[#6B7280]">
              By continuing, you agree to the <a href="#" className="text-[#0A0A0A] font-semibold underline">Terms of Service</a> and <a href="#" className="text-[#0A0A0A] font-semibold underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};