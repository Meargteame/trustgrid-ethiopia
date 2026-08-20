import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, AlertCircle, ShieldCheck, Zap, Lock, Sparkles, CheckCircle2, Mail, KeyRound, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TrustGridLogo, TrustGridMark } from './TrustGridLogo';

interface AuthPageProps {
  onLogin: () => void;
  onBack: () => void;
}

const FREE_EMAIL_DOMAINS = [
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.uk', 'yahoo.fr',
  'hotmail.com', 'hotmail.co.uk', 'hotmail.fr', 'outlook.com', 'outlook.fr',
  'icloud.com', 'me.com', 'mac.com', 'aol.com', 'mail.ru', 'bk.ru',
  'inbox.ru', 'list.ru', 'protonmail.com', 'proton.me', 'pm.me',
  'zoho.com', 'yandex.com', 'yandex.ru', 'live.com', 'msn.com',
  'gmx.com', 'gmx.de', 'gmx.net', 'web.de', 't-online.de', 'inbox.com'
];

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onBack }) => {
  const telegramWrapperRef = useRef<HTMLDivElement>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [activeMode, setActiveMode] = useState<'telegram' | 'email'>('telegram');

  useEffect(() => {
    // Add the callback to window so the Telegram widget script can call it
    (window as any).onTelegramAuth = async (user: any) => {
      try {
        setErrorMsg(null);
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
        console.error('Telegram login error:', err);
        setErrorMsg(err.message || 'Telegram login failed. Please try again.');
      }
    };

    if (telegramWrapperRef.current) {
      telegramWrapperRef.current.innerHTML = '';
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.setAttribute('data-telegram-login', import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'trustgrid_bot');
      script.setAttribute('data-size', 'large');
      script.setAttribute('data-radius', '12');
      script.setAttribute('data-onauth', 'onTelegramAuth(user)');
      script.setAttribute('data-request-access', 'write');
      script.async = true;
      telegramWrapperRef.current.appendChild(script);
    }
  }, []);

  const validateWorkEmail = (emailStr: string): boolean => {
    const trimmed = emailStr.trim().toLowerCase();
    const parts = trimmed.split('@');
    if (parts.length !== 2 || !parts[1].includes('.')) {
      setErrorMsg('Please enter a valid email address.');
      return false;
    }
    const domain = parts[1];
    if (FREE_EMAIL_DOMAINS.includes(domain)) {
      setErrorMsg('Please enter a company work email (e.g. name@yourbrand.com). Personal email accounts (@gmail, @yahoo, @outlook) are not permitted.');
      return false;
    }
    return true;
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (!validateWorkEmail(email)) {
      return;
    }

    try {
      setEmailLoading(true);
      setErrorMsg(null);
      
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: window.location.origin
        }
      });

      if (error) throw error;
      setEmailSent(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send login link. Please try again.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || !email) return;

    try {
      setOtpLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: otpCode.trim(),
        type: 'email'
      });

      if (error) throw error;

      if (data?.session) {
        onLogin();
      } else {
        throw new Error('Verification failed. Please double check the code.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid or expired verification code.');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col font-sans selection:bg-[#D7FF3D] selection:text-[#0A0A0A]">
      
      {/* Top Navigation */}
      <header className="px-6 py-4 border-b border-[#F4F4F5] flex items-center justify-between">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-xs font-bold text-[#6B7280] hover:text-[#0A0A0A] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] rounded-lg px-2 py-1.5"
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>

        <TrustGridLogo size="md" />

        <div className="w-20 hidden sm:block"></div>
      </header>

      {/* Main Split Authentication Screen */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16">
        
        {/* Left Side: Brand Value Proposition */}
        <div className="flex-1 w-full max-w-lg space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F4F4F5] border border-gray-200 rounded-full text-xs font-bold text-[#0A0A0A] mb-4">
              <TrustGridMark size={14} />
              <span>ETHIOPIA'S SOCIAL PROOF INFRASTRUCTURE</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-black text-[#0A0A0A] tracking-tight leading-[1.1]">
              Collect proof.<br />
              <span className="relative inline-block">
                Verify identity.
              </span><br />
              Close 3x more sales.
            </h1>
            
            <p className="mt-4 text-[#6B7280] text-base leading-relaxed">
              Authenticate your merchant account to manage your Wall of Proof, customize embed widgets, and automate Telegram customer verification.
            </p>
          </div>

          {/* Value Props List */}
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-[#F4F4F5] rounded-lg text-[#0A0A0A] mt-0.5">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#0A0A0A]">Cryptographic Telegram Login</p>
                <p className="text-xs text-[#6B7280]">Reviewers verify with their real Telegram account to eliminate screenshot fraud.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-[#F4F4F5] rounded-lg text-[#0A0A0A] mt-0.5">
                <Zap size={16} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#0A0A0A]">1-Click Widget Lab & Embeds</p>
                <p className="text-xs text-[#6B7280]">Embed walls, toast popups, and carousel widgets into any store in 30 seconds.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-[#F4F4F5] rounded-lg text-[#0A0A0A] mt-0.5">
                <ShieldCheck size={16} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#0A0A0A]">Automated Channel Broadcasting</p>
                <p className="text-xs text-[#6B7280]">Auto-push 5-star verified reviews directly to your Telegram channel.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Box */}
        <div className="w-full max-w-md">
          <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-8 space-y-6">
            
            {/* Header in Box */}
            <div className="text-center space-y-1">
              <div className="flex justify-center mb-3">
                <TrustGridMark size={36} />
              </div>
              <h2 className="text-2xl font-black text-[#0A0A0A] tracking-tight">Welcome to TrustGrid</h2>
              <p className="text-xs text-[#6B7280]">Sign in to your merchant dashboard</p>
            </div>

            {/* Error Notification */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMsg}</span>
              </div>
            )}

            {/* Mode Switcher */}
            <div className="flex bg-[#F4F4F5] p-1 rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => { setActiveMode('telegram'); setErrorMsg(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeMode === 'telegram'
                    ? 'bg-[#FFFFFF] text-[#0A0A0A] border border-gray-200'
                    : 'text-[#6B7280] hover:text-[#0A0A0A]'
                }`}
              >
                Telegram Login
              </button>
              <button
                type="button"
                onClick={() => { setActiveMode('email'); setErrorMsg(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeMode === 'email'
                    ? 'bg-[#FFFFFF] text-[#0A0A0A] border border-gray-200'
                    : 'text-[#6B7280] hover:text-[#0A0A0A]'
                }`}
              >
                Work Email
              </button>
            </div>

            {/* TELEGRAM LOGIN MODE */}
            {activeMode === 'telegram' && (
              <div className="space-y-4 animate-fade-in text-center">
                <p className="text-xs text-[#6B7280]">
                  Click below to authenticate with your official Telegram account:
                </p>

                {/* Telegram Official Button Widget Container */}
                <div className="py-4 flex justify-center items-center min-h-[60px]">
                  <div ref={telegramWrapperRef}></div>
                </div>

                <div className="p-3 bg-[#F4F4F5] rounded-xl border border-gray-200 text-center">
                  <p className="text-[11px] text-[#6B7280]">
                    🛡️ Instant cryptographic identity verification via Telegram
                  </p>
                </div>
              </div>
            )}

            {/* EMAIL LOGIN MODE */}
            {activeMode === 'email' && (
              <div className="space-y-4 animate-fade-in">
                {emailSent ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl space-y-1.5 text-center">
                      <p className="font-bold text-xs">Security link & code sent!</p>
                      <p className="text-[11px] text-emerald-800 leading-relaxed">
                        We sent a login code and confirmation link to <strong>{email}</strong>.
                      </p>
                    </div>

                    {/* Enter Code Option (Solves redirect issues) */}
                    <form onSubmit={handleVerifyOtp} className="space-y-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-[#6B7280] uppercase">
                          Enter 6-Digit Code from Email
                        </label>
                        <div className="relative">
                          <KeyRound size={15} className="absolute left-3.5 top-3.5 text-[#6B7280]" />
                          <input
                            type="text"
                            required
                            maxLength={8}
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\s+/g, ''))}
                            placeholder="123456"
                            className="w-full pl-10 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono font-bold tracking-widest text-[#0A0A0A] focus:ring-2 focus:ring-[#0A0A0A] outline-none transition-all"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={otpLoading || !otpCode}
                        className="w-full py-2.5 bg-[#0A0A0A] text-[#FFFFFF] font-bold text-xs rounded-xl hover:bg-[#222222] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {otpLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                        <span>{otpLoading ? 'Verifying...' : 'Verify & Sign In'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setEmailSent(false); setOtpCode(''); }}
                        className="w-full py-1 text-center text-xs text-[#6B7280] hover:text-[#0A0A0A] font-medium"
                      >
                        Use a different email address
                      </button>
                    </form>
                  </div>
                ) : (
                  <form onSubmit={handleEmailSignIn} className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#6B7280] uppercase">Company Work Email</label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3.5 top-3.5 text-[#6B7280]" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@yourcompany.com"
                          className="w-full pl-10 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0A0A0A] outline-none transition-all"
                        />
                      </div>
                      <p className="text-[11px] text-[#6B7280]">
                        Only company domain emails allowed (e.g. <code>@leonslab.tech</code>).
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={emailLoading}
                      className="w-full py-3 bg-[#0A0A0A] text-[#FFFFFF] font-bold text-xs rounded-xl hover:bg-[#222222] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {emailLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                      <span>{emailLoading ? 'Sending Work Login Link...' : 'Send Work Magic Link'}</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            <p className="text-[11px] text-[#6B7280] text-center pt-2 border-t border-gray-100">
              By signing in, you agree to TrustGrid's <a href="#" className="text-[#0A0A0A] font-bold underline">Terms of Service</a> & <a href="#" className="text-[#0A0A0A] font-bold underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};