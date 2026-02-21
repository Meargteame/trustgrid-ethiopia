import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Video, Mic, Send, Paperclip, X, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { analyzeTrustContent } from '../services/geminiService';

interface CollectionPageProps {
   targetUsername?: string;
   onBack: () => void;
}

export const CollectionPage: React.FC<CollectionPageProps> = ({ targetUsername, onBack }) => {
   const [step, setStep] = useState(1);
   const [isRecording, setIsRecording] = useState(false);
   const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
   const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
   const videoRef = useRef<HTMLVideoElement>(null);
   const streamRef = useRef<MediaStream | null>(null);
   const [reviewText, setReviewText] = useState('');
   const [name, setName] = useState('');
   const [company, setCompany] = useState('');
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [showConfetti, setShowConfetti] = useState(false);

   // Context state
   const [targetUserId, setTargetUserId] = useState<string | null>(null);
   const [targetCompanyName, setTargetCompanyName] = useState<string>('');
   const [loadingProfile, setLoadingProfile] = useState(true);

   // Resolve User ID
   useEffect(() => {
      async function resolveUser() {
         setLoadingProfile(true);
         try {
             if (targetUsername) {
                // Public Link Flow: Look up by username
                const { data, error } = await supabase
                   .from('profiles')
                   .select('id, company_name, full_name')
                   .eq('username', targetUsername)
                   .single();
                
                if (error || !data) {
                   console.error("User resolution error", error);
                   alert("Collection link invalid or user not found.");
                   onBack();
                   return;
                }
                
                setTargetUserId(data.id);
                setTargetCompanyName(data.company_name || data.full_name || targetUsername);
             } else {
                // Dashboard Preview Flow: Use current session
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                   setTargetUserId(user.id);
                   // Fetch profile for company name
                   const { data } = await supabase.from('profiles').select('company_name').eq('id', user.id).single();
                   setTargetCompanyName(data?.company_name || "My Company");
                } else {
                   // Fallback for dev/demo if auth is skipped
                   console.warn("No user session found for preview.");
                }
             }
         } catch(e) {
             console.error(e);
         } finally {
             setLoadingProfile(false);
         }
      }
      resolveUser();
   }, [targetUsername]);

   const startRecording = async () => {
      try {
         const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
         streamRef.current = stream;

         if (videoRef.current) {
            videoRef.current.srcObject = stream;
         }

         const recorder = new MediaRecorder(stream);
         const chunks: BlobPart[] = [];

         recorder.ondataavailable = (e) => chunks.push(e.data);
         recorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            setVideoBlob(blob);
            // Turn off camera
            stream.getTracks().forEach(track => track.stop());
         };

         recorder.start();
         setMediaRecorder(recorder);
         setIsRecording(true);
      } catch (err) {
         console.error("Camera access denied", err);
         alert("Could not access camera. Please allow permissions.");
      }
   };

   const stopRecording = () => {
      mediaRecorder?.stop();
      setIsRecording(false);
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!videoBlob && !reviewText) {
         alert("Please record a video or write a review.");
         return;
      }

      if (!targetUserId) {
         alert("Error: No recipient identified for this review.");
         return;
      }

      setIsSubmitting(true);

      try {
         // 1. Analyze with Gemini
         const analysis = await analyzeTrustContent(reviewText || "Video Review");

         // 2. Upload Video (if any)
         let videoUrl = null;
         if (videoBlob) {
            const fileName = `${targetUserId}/${Date.now()}.webm`;
            const { error: uploadError } = await supabase.storage
               .from('videos')
               .upload(fileName, videoBlob);
            
            if (!uploadError) {
               const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(fileName);
               videoUrl = publicUrl;
            } else {
               console.warn("Video upload failed", uploadError);
            }
         }

         // 3. Save to Supabase
         const { error } = await supabase.from('testimonials').insert({
            user_id: targetUserId,
            name,
            company,
            text: reviewText,
            video_url: videoUrl,
            score: analysis.score,
            sentiment: analysis.sentiment,
            status: 'pending',
            avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
         });

         if (error) throw error;

         setStep(3); // Success
         setShowConfetti(true);
      } catch (err: any) {
         console.error(err);
         alert('Failed to submit review: ' + (err.message || "Unknown error"));
      } finally {
         setIsSubmitting(false);
      }
   };

   if (loadingProfile) {
      return (
         <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-gray-400" size={32} />
         </div>
      );
   }

   if (step === 3) {
      return (
         <div className="min-h-screen bg-brand-lime flex flex-col items-center justify-center p-6 text-center animate-fade-in relative overflow-hidden">
            {/* Confetti CSS (Simple version) */}
            {showConfetti && (
               <div className="absolute inset-0 pointer-events-none">
                  {[...Array(20)].map((_, i) => (
                     <div key={i} className="absolute w-2 h-2 bg-white rounded-full animate-ping" style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random()}s`,
                        animationDuration: '1s'
                     }} />
                  ))}
               </div>
            )}

            <div className="bg-white p-8 rounded-[32px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 border-black max-w-sm w-full transform rotate-1 transition-transform hover:rotate-0">
               <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={32} className="text-green-600" />
               </div>
               <h2 className="text-2xl font-black font-sans mb-2">Thank You!</h2>
               <p className="text-gray-600 mb-6 text-sm">Your feedback helps {targetCompanyName} build trust. You are a legend!</p>

               <div className="border border-dashed border-gray-300 p-4 rounded-xl bg-gray-50 mb-6">
                  <p className="text-xs uppercase font-bold text-gray-400 mb-1">Your 10% Off Coupon</p>
                  <p className="text-xl font-mono font-bold tracking-widest text-black">TRUST2026</p>
               </div>

               <button onClick={onBack} className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors">
                  Return Home
               </button>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-white font-sans text-gray-900">
         {/* Mobile Header */}
         <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 flex items-center gap-4 z-50">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
               <ArrowLeft size={20} />
            </button>
            <div>
               <h1 className="text-sm font-bold">{targetCompanyName || "Addis Design Co."}</h1>
               <p className="text-[10px] text-gray-500">Collect Reviews</p>
            </div>
         </div>

         <div className="max-w-md mx-auto p-4 pb-20">
            <h2 className="text-2xl font-black mb-2 mt-4">Share you experience</h2>
            <p className="text-gray-500 text-sm mb-6">Your feedback helps us improve and build trust with future clients.</p>

            {/* Video Recorder */}
            <div className="bg-black rounded-[24px] overflow-hidden aspect-[4/5] relative mb-6 shadow-xl group border-4 border-white ring-1 ring-gray-200">
               {videoBlob ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                     <p className="text-white font-bold">Video Recorded!</p>
                     <button
                        onClick={() => setVideoBlob(null)}
                        className="absolute top-4 right-4 bg-white/20 p-2 rounded-full hover:bg-white/40"
                     >
                        <X size={20} className="text-white" />
                     </button>
                  </div>
               ) : (
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-80" />
               )}

               {!videoBlob && (
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                     {!isRecording ? (
                        <button
                           onClick={startRecording}
                           className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center hover:scale-110 transition-transform bg-transparent"
                        >
                           <div className="w-12 h-12 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                        </button>
                     ) : (
                        <button
                           onClick={stopRecording}
                           className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center hover:scale-110 transition-transform bg-red-500 animate-pulse"
                        >
                           <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                           </div>
                        </button>
                     )}
                  </div>
               )}

               <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2">
                  <Video size={12} className="text-white" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Video Testimonial</span>
               </div>
            </div>

            {/* Text Form */}
            <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up">
               <div>
                  <label className="block text-xs font-bold uppercase mb-2">Or write a review</label>
                  <textarea
                     className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black focus:bg-white transition-all outline-none resize-none text-sm"
                     rows={4}
                     placeholder="What did you like most about working with us?"
                     value={reviewText}
                     onChange={(e) => setReviewText(e.target.value)}
                  />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <input
                     type="text"
                     placeholder="Your Name"
                     className="w-full p-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-black focus:bg-white transition-all outline-none text-sm"
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     required
                  />
                  <input
                     type="text"
                     placeholder="Company / Role"
                     className="w-full p-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-black focus:bg-white transition-all outline-none text-sm"
                     value={company}
                     onChange={(e) => setCompany(e.target.value)}
                     required
                  />
               </div>

               <div className="pt-4">
                  <button
                     type="submit"
                     disabled={isSubmitting}
                     className="w-full bg-brand-lime border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] py-4 rounded-xl font-black text-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                     {isSubmitting ? <Loader2 className="animate-spin" /> : <>Submit Feedback <Send size={16} /></>}
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
};