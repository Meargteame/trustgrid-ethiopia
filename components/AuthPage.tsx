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
            
            <form onSubmit={handleSubmit} className="space-y-5">
              
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
                    <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Company Name</label>
                    <div className="relative">
                      <Building size={16} className="absolute left-4 top-3.5 text-gray-400" />
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Addis Design Co."
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