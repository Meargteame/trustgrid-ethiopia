import React, { useState } from 'react';
import { Button } from './Button';
import { Eye, EyeOff, ArrowLeft, Mail, Lock, Building, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthPageProps {
  onLogin: () => void;
  onBack: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onBack }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              company_name: companyName,
            },
          },
        });
        if (error) throw error;
        
        // Check if email confirmation is required
        if (data.user && !data.session) {
           setSuccessMsg("Account created! Please check your email to verify your account before logging in.");
           setIsSignUp(false); // Switch to login view
        } else if (data.session) {
           onLogin();
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onLogin();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

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
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-gray-500 text-sm">
              {isSignUp ? 'Start building trust with your customers today.' : 'Manage your proofs and verification status.'}
            </p>
          </div>

          <div className="bg-white border-2 border-black rounded-[2rem] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
            
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Google Sign In */}
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-colors font-bold text-gray-700 mb-4"
                onClick={async () => {
                   const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
                   if (error) {
                      if (error.message.includes('provider is not enabled')) {
                         setErrorMsg("Google Sign-In is not enabled in Supabase yet. Please enable it in your Authentication > Providers settings.");
                      } else {
                         setErrorMsg(error.message);
                      }
                   }
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z"
                    fill="#EA4335"
                  />
                </svg>
                {isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
              </button>

              <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase">Or continue with email</span>
                  <div className="flex-grow border-t border-gray-200"></div>
              </div>
              
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                  <AlertCircle size={16} />
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-2 border border-green-200">
                  <CheckCircle2 size={16} />
                  {successMsg}
                </div>
              )}

              {isSignUp && (
                <div className="space-y-5 animate-fade-in">
                  <div>
                    <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Full Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-3.5 text-gray-400" />
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Abebe Bikila"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-11 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black focus:ring-0 outline-none transition-colors bg-gray-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Company / Display Name</label>
                    <div className="relative">
                      <Building size={16} className="absolute left-4 top-3.5 text-gray-400" />
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Addis Design Co. or John Doe"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full pl-11 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black focus:ring-0 outline-none transition-colors bg-gray-50 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-3.5 text-gray-400" />
                  <input 
                    type="email" 
                    required 
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black focus:ring-0 outline-none transition-colors bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-3.5 text-gray-400" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-11 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black focus:ring-0 outline-none transition-colors bg-gray-50 focus:bg-white"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-black"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  fullWidth 
                  size="lg"
                  disabled={isLoading}
                  className="bg-brand-lime text-black"
                >
                  {isLoading ? 'Processing...' : (isSignUp ? 'Create Free Account' : 'Sign In')}
                </Button>
              </div>

            </form>

            {/* Toggle Login/Signup */}
            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-600">
                {isSignUp ? "Already have an account?" : "New to TrustGrid?"}
                <button 
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="ml-2 font-bold text-black hover:underline focus:outline-none"
                >
                  {isSignUp ? "Log in" : "Create account"}
                </button>
              </p>
            </div>

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