import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

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
    <div className="min-h-screen bg-white bg-grid flex flex-col font-sans">
      
      {/* Simple Header */}
      <div className="p-6">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors"
        >
          <ArrowLeft size={18} /> Back to Home
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-black mb-2 tracking-tight">
              Welcome back
            </h1>
            <p className="text-gray-500 text-sm">
              Log in to manage your verified proofs.
            </p>
          </div>

          <div className="bg-white border-2 border-black rounded-[2rem] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col items-center">
            
            {errorMsg && (
              <div className="p-3 mb-6 w-full bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                <AlertCircle size={16} />
                {errorMsg}
              </div>
            )}

            <div className="my-4" ref={telegramWrapperRef}></div>

          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              By clicking continue, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};