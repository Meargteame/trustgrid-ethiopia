import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Toast } from './Toast';
import { TrustGridLogo, TrustGridMark } from './TrustGridLogo';

interface VerificationPageProps {
  token: string;
}

export const VerificationPage: React.FC<VerificationPageProps> = ({ token }) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already_verified' | 'ready'>('loading');
  const [data, setData] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  useEffect(() => {
    if (!token) {
       setStatus('error');
       return;
    }
    fetchTestimonial();
  }, [token]);

  const fetchTestimonial = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select(`
            *,
            profiles:user_id ( full_name, company_name )
        `)
        .eq('verification_token', token)
        .single();

      if (error || !data) throw new Error("Invalid token");

      if (data.status === 'verified') {
          setStatus('already_verified');
          return;
      }

      setData(data);
      setStatus('ready');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const handleVerify = async () => {
     try {
        const { error } = await supabase
           .from('testimonials')
           .update({ 
               status: 'verified', 
               verified_at: new Date().toISOString() 
           })
           .eq('verification_token', token);

        if (error) throw error;
        setStatus('success');
     } catch (err) {
        console.error(err);
        setToast({ message: "Verification failed. Please try again.", type: 'error' });
     }
  };

  if (status === 'error') {
     return (
        <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center p-6 font-sans">
           <div className="bg-[#FFFFFF] p-8 rounded-2xl border border-gray-200 text-center max-w-md w-full">
              <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
                 <XCircle size={24} />
              </div>
              <h1 className="text-xl font-black text-[#0A0A0A] mb-2">Invalid Verification Link</h1>
              <p className="text-xs text-[#6B7280]">This verification link is invalid or has expired.</p>
           </div>
        </div>
     );
  }

  if (status === 'success') {
     return (
        <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center p-6 font-sans">
           <div className="bg-[#FFFFFF] p-8 rounded-2xl border border-gray-200 text-center max-w-md w-full">
              <div className="w-14 h-14 bg-[#F4F4F5] border border-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                 <TrustGridMark size={28} />
              </div>
              <h1 className="text-2xl font-black text-[#0A0A0A] mb-2">Review Verified!</h1>
              <p className="text-xs text-[#6B7280] leading-relaxed mb-6">
                Thank you for confirming your feedback. It is now marked as <strong className="text-[#0A0A0A]">Cryptographically Verified Proof</strong> and published to the business trust wall.
              </p>
              <div className="flex justify-center">
                 <TrustGridLogo size="sm" />
              </div>
           </div>
        </div>
     );
  }

  if (status === 'already_verified') {
     return (
        <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center p-6 font-sans">
           <div className="bg-[#FFFFFF] p-8 rounded-2xl border border-gray-200 text-center max-w-md w-full">
              <div className="w-12 h-12 bg-[#F4F4F5] border border-gray-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                 <CheckCircle2 size={24} className="text-[#0A0A0A]" />
              </div>
              <h1 className="text-xl font-black text-[#0A0A0A] mb-2">Already Verified</h1>
              <p className="text-xs text-[#6B7280]">You have already confirmed this testimonial. Thank you!</p>
           </div>
        </div>
     );
  }

  // Loaded Data View
  if (!data) return <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center"><Loader2 className="animate-spin text-[#0A0A0A]" /></div>;

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center p-6 font-sans relative">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        <div className="bg-[#FFFFFF] p-8 rounded-2xl border border-gray-200 max-w-lg w-full">
           <div className="text-center mb-8">
              <div className="w-12 h-12 bg-[#F4F4F5] border border-gray-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                 <TrustGridMark size={22} />
              </div>
              <h1 className="text-2xl font-black text-[#0A0A0A]">Verify Testimonial</h1>
              <p className="text-xs text-[#6B7280] mt-1">Please confirm you wrote this review for {data.profiles?.company_name || 'the business'}.</p>
           </div>

           <div className="space-y-6">
              <div className="bg-[#F4F4F5] p-5 rounded-xl border border-gray-200 text-xs text-[#0A0A0A] leading-relaxed">
                 <p className="italic mb-4 font-medium">"{data.text}"</p>
                 <div className="flex items-center gap-2.5 pt-3 border-t border-gray-200">
                    {data.avatar_url && <img src={data.avatar_url} className="w-7 h-7 rounded-full object-cover border border-gray-200" />}
                    <div>
                        <p className="text-xs font-bold text-[#0A0A0A]">{data.name}</p>
                        <p className="text-[11px] text-[#6B7280]">{data.company || 'Verified Client'}</p>
                    </div>
                 </div>
              </div>

              <div className="flex gap-3">
                 <button 
                    onClick={() => setToast({ message: "Please contact the user directly to request removal.", type: 'info' })}
                    className="flex-1 py-3 rounded-xl border border-gray-200 font-bold hover:bg-[#F4F4F5] transition-colors text-xs text-[#6B7280]"
                 >
                    Report / Reject
                 </button>
                 <button 
                    onClick={handleVerify}
                    className="flex-1 py-3 rounded-xl bg-[#0A0A0A] text-[#FFFFFF] font-bold hover:bg-[#222222] transition-colors flex items-center justify-center gap-2 text-xs"
                 >
                    <TrustGridMark size={14} />
                    <span>Yes, Confirm Proof</span>
                 </button>
              </div>

              <div className="text-center mt-6">
                 <TrustGridLogo size="sm" />
              </div>
           </div>
        </div>
     </div>
  );
};
