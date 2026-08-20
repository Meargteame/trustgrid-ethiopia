import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, AlertCircle, ShieldCheck, Zap, Lock, Sparkles, CheckCircle2, Mail, KeyRound, Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TrustGridLogo, TrustGridMark } from './TrustGridLogo';

interface AuthPageProps {
  onLogin: () => void;
  onBack: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onBack }) => {
  const telegramWrapperRef = useRef<HTMLDivElement>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [activeMode, setActiveMode] = useState<'password' | 'otp' | 'telegram'>('password');
  const [isSignUp, setIsSignUp] = useState(false);

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

    if (activeMode === 'telegram' && telegramWrapperRef.current) {
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
  }, [activeMode]);

  // 1. Password Login / Signup
  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      if (isSignUp) {
        // Sign Up with Password
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password,
          options: {
            data: {
              company_name: cleanEmail.split('@')[0]
            }
          }
        });
        if (error) throw error;
        if (data?.session) {
          onLogin();
        } else {
          setErrorMsg('Account created! If email confirmation is required, please check your inbox.');
        }
      } else {
        // Sign In with Password
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password
        });
        if (error) throw error;
        if (data?.session) {
          onLogin();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Magic Link / OTP request
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          emailRedirectTo: window.location.origin
        }
      });

      if (error) throw error;
      setEmailSent(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send login link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Verify OTP Code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || !email) return;

    try {
      setLoading(true);
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
      setLoading(false);
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
              Authenticate your account to manage your Wall of Proof, customize embed widgets, and automate Telegram customer verification.
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

            {/* 3-Mode Switcher */}
            <div className="flex bg-[#F4F4F5] p-1 rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => { setActiveMode('password'); setErrorMsg(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeMode === 'password'
                    ? 'bg-[#FFFFFF] text-[#0A0A0A] border border-gray-200 shadow-sm'
                    : 'text-[#6B7280] hover:text-[#0A0A0A]'
                }`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => { setActiveMode('otp'); setErrorMsg(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeMode === 'otp'
                    ? 'bg-[#FFFFFF] text-[#0A0A0A] border border-gray-200 shadow-sm'
                    : 'text-[#6B7280] hover:text-[#0A0A0A]'
                }`}
              >
                Magic Link
              </button>
              <button
                type="button"
                onClick={() => { setActiveMode('telegram'); setErrorMsg(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeMode === 'telegram'
                    ? 'bg-[#FFFFFF] text-[#0A0A0A] border border-gray-200 shadow-sm'
                    : 'text-[#6B7280] hover:text-[#0A0A0A]'
                }`}
              >
                Telegram
              </button>
            </div>

            {/* MODE 1: PASSWORD LOGIN / SIGN UP */}
            {activeMode === 'password' && (
              <form onSubmit={handlePasswordAuth} className="space-y-4 animate-fade-in">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#6B7280] uppercase">Email Address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-3.5 text-[#6B7280]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com or you@gmail.com"
                      className="w-full pl-10 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0A0A0A] outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#6B7280] uppercase">Password</label>
                    <button
                      type="button"
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="text-[11px] font-bold text-[#0A0A0A] hover:underline"
                    >
                      {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-3.5 text-[#6B7280]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0A0A0A] outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-[#6B7280] hover:text-[#0A0A0A]"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#0A0A0A] text-[#FFFFFF] font-bold text-xs rounded-xl hover:bg-[#222222] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                  <span>{loading ? 'Authenticating...' : (isSignUp ? 'Create Account & Sign In' : 'Sign In with Password')}</span>
                </button>
              </form>
            )}

            {/* MODE 2: MAGIC LINK / OTP */}
            {activeMode === 'otp' && (
              <div className="space-y-4 animate-fade-in">
                {emailSent ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl space-y-1.5 text-center">
                      <p className="font-bold text-xs">Security link & code sent!</p>
                      <p className="text-[11px] text-emerald-800 leading-relaxed">
                        We sent a login code and confirmation link to <strong>{email}</strong>.
                      </p>
                    </div>

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
                        disabled={loading || !otpCode}
                        className="w-full py-2.5 bg-[#0A0A0A] text-[#FFFFFF] font-bold text-xs rounded-xl hover:bg-[#222222] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                        <span>{loading ? 'Verifying...' : 'Verify & Sign In'}</span>
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
                      <label className="block text-xs font-bold text-[#6B7280] uppercase">Email Address</label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3.5 top-3.5 text-[#6B7280]" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@company.com or you@gmail.com"
                          className="w-full pl-10 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0A0A0A] outline-none transition-all"
                        />
                      </div>
                      <p className="text-[11px] text-[#6B7280]">
                        We'll send a passwordless login link and 6-digit code.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-[#0A0A0A] text-[#FFFFFF] font-bold text-xs rounded-xl hover:bg-[#222222] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                      <span>{loading ? 'Sending Login Link...' : 'Send Magic Login Link'}</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* MODE 3: TELEGRAM LOGIN */}
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

            <p className="text-[11px] text-[#6B7280] text-center pt-2 border-t border-gray-100">
              By signing in, you agree to TrustGrid's <a href="#" className="text-[#0A0A0A] font-bold underline">Terms of Service</a> & <a href="#" className="text-[#0A0A0A] font-bold underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};