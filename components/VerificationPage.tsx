import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Shield, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface VerificationPageProps {
  token?: string; // Passed from App.tsx handling /verify/:token
}

export const VerificationPage: React.FC<VerificationPageProps> = ({ token }) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already_verified'>('loading');
  const [data, setData] = useState<any>(null);

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
      setStatus('loading'); // Keep loading state but show content (handled in render)
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
        alert("Verification failed. Please try again.");
     }
  };

  if (status === 'error') {
     return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
           <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
              <XCircle size={48} className="text-red-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold mb-2">Invalid Link</h1>
              <p className="text-gray-500">This verification link is invalid or has expired.</p>
           </div>
        </div>
     );
  }

  if (status === 'success') {
     return (
        <div className="min-h-screen bg-[#D4F954] flex items-center justify-center p-4">
           <div className="bg-white p-8 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 border-black text-center max-w-md w-full animate-slide-up">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                 <CheckCircle2 size={32} className="text-green-600" />
              </div>
              <h1 className="text-2xl font-black mb-2">Verified!</h1>
              <p className="text-gray-600 mb-6">Thank you for confirming your review. It is now marked as <span className="font-bold text-black">Trusted Proof</span> on the blockchain (simulated).</p>
           </div>
        </div>
     );
  }

  if (status === 'already_verified') {
     return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
           <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
              <Shield size={48} className="text-blue-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold mb-2">Already Verified</h1>
              <p className="text-gray-500">You have already confirmed this testimonial. Thank you!</p>
           </div>
        </div>
     );
  }

  // Loaded Data View
  if (!data) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 flex flex-col items-center">
       <div className="max-w-xl w-full">
          <div className="text-center mb-12">
             <div className="font-extrabold text-2xl tracking-tighter text-black mb-2">TrustGrid.</div>
             <p className="text-gray-500">Verification Request</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-brand-lime" />
             
             <h2 className="text-xl font-bold mb-6 text-center">
                Did you write this review for <br/>
                <span className="text-brand-lime bg-black px-2 rounded-md">{data.profiles?.company_name || 'TrustGrid User'}</span>?
             </h2>

             <div className="bg-gray-50 p-6 rounded-2xl border-l-4 border-gray-300 mb-8 italic text-gray-700 relative">
                <QuoteIcon className="absolute top-4 left-4 text-gray-200 w-8 h-8 -z-10" />
                "{data.text}"
                <div className="mt-4 flex items-center gap-3 not-italic">
                   {data.avatar_url && <img src={data.avatar_url} className="w-8 h-8 rounded-full" />}
                   <div>
                       <p className="text-sm font-bold">{data.name}</p>
                       <p className="text-xs text-gray-500">{data.company}</p>
                   </div>
                </div>
             </div>

             <div className="flex gap-4">
                <button 
                   onClick={() => alert("Please contact the user directly to request removal.")}
                   className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-bold hover:bg-gray-50 transition-colors text-gray-500"
                >
                   No, Report
                </button>
                <button 
                   onClick={handleVerify}
                   className="flex-1 py-3 rounded-xl bg-black text-white font-bold shadow-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                   <Shield size={18} />
                   Yes, Verify It
                </button>
             </div>

             <p className="text-center text-xs text-gray-400 mt-6">
                By verifying, you confirm this testimonial is authentic.
             </p>
          </div>
       </div>
    </div>
  );
};

const QuoteIcon = ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.01697 21L5.01697 18C5.01697 16.8954 5.9124 16 7.01697 16H10.017C10.5693 16 11.017 15.5523 11.017 15V9C11.017 8.44772 10.5693 8 10.017 8H6.01697C5.46468 8 5.01697 8.44772 5.01697 9V11C5.01697 11.5523 4.56925 12 4.01697 12H3.01697V5H13.017V15C13.017 18.3137 10.3307 21 7.01697 21H5.01697Z" />
    </svg>
);
