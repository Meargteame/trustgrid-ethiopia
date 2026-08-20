import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Video, 
  Upload, 
  Check, 
  X, 
  Star, 
  Send, 
  Loader2, 
  MessageCircle, 
  CheckCircle2, 
  ShieldCheck, 
  User, 
  Mail, 
  Globe, 
  Gift, 
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Toast } from './Toast';

// --- Types ---

interface QuestionConfig {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'rating';
  required?: boolean;
  placeholder?: string;
}

interface FormConfig {
  title: string;
  subtitle: string;
  incentive_message?: string;
  allow_video: boolean;
  allow_photo: boolean;
  allow_linkedin_import: boolean;
  questions: QuestionConfig[];
}

interface PublicProfile {
  id: string;
  company_name: string;
  avatar_url?: string;
  primary_color?: string;
  full_name?: string;
  username: string;
}

interface CollectionPageProps {
  targetUsername?: string;
  onBack?: () => void;
}

const DEFAULT_PRIMARY_COLOR = '#D4F954';

const DEFAULT_CONFIG: FormConfig = {
  title: 'Share your experience',
  subtitle: 'Your feedback helps us grow and helps others make informed decisions.',
  incentive_message: '',
  allow_video: true,
  allow_photo: true,
  allow_linkedin_import: true,
  questions: [
    {
      id: 'q1',
      label: 'What did you like most about working with us?',
      type: 'textarea',
      required: true,
      placeholder: 'Write your honest feedback here...'
    },
    {
      id: 'q2',
      label: 'How would you rate our service?',
      type: 'rating',
      required: true
    }
  ]
};

export const CollectionPage: React.FC<CollectionPageProps> = ({ targetUsername, onBack }) => {
  // --- State ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [config, setConfig] = useState<FormConfig>(DEFAULT_CONFIG);
  
  // Form State
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerCompany, setReviewerCompany] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [reviewerSocialUrl, setReviewerSocialUrl] = useState('');
  const [consentGiven, setConsentGiven] = useState(true);
  
  // Photo Upload State
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Video Media State
  const [isRecording, setIsRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ message, type });
  };

  // Telegram State
  const [telegramUser, setTelegramUser] = useState<any>(null);
  const telegramWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTargetProfileAndForm = async () => {
      try {
        setLoading(true);
        let usernameToFetch = targetUsername;

        if (!usernameToFetch) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: ownProfile } = await supabase
              .from('profiles')
              .select('id, username, company_name, avatar_url, primary_color, full_name')
              .eq('id', user.id)
              .single();
            if (ownProfile) {
              setProfile(ownProfile);
              await fetchFormConfig(ownProfile.id);
              return;
            }
          }
        }

        if (!usernameToFetch) {
          setError('No user specified');
          return;
        }

        const cleanUsername = usernameToFetch.replace(/\/+$/, '').trim();

        // 1. Fetch Profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, company_name, avatar_url, primary_color, full_name')
          .ilike('username', cleanUsername)
          .single();

        if (profileError || !profileData) {
          throw new Error('Company not found');
        }

        setProfile(profileData);

        // 2. Fetch Form Config
        await fetchFormConfig(profileData.id);

      } catch (err: any) {
        console.error('Error fetching collection profile:', err);
        setError(err.message || 'Failed to load page');
      } finally {
        setLoading(false);
      }
    };

    const fetchFormConfig = async (userId: string) => {
      const { data: formConfigData } = await supabase
        .from('form_configs')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (formConfigData) {
        setConfig({
          title: formConfigData.title || DEFAULT_CONFIG.title,
          subtitle: formConfigData.subtitle || DEFAULT_CONFIG.subtitle,
          incentive_message: formConfigData.incentive_message || '',
          allow_video: formConfigData.allow_video ?? true,
          allow_photo: formConfigData.allow_photo ?? true,
          allow_linkedin_import: formConfigData.allow_linkedin_import ?? true,
          questions: (formConfigData.questions as QuestionConfig[]) || DEFAULT_CONFIG.questions
        });
      }
    };

    fetchTargetProfileAndForm();
  }, [targetUsername]);

  // Telegram Login Script Integration
  useEffect(() => {
    (window as any).onTelegramAuth = async (user: any) => {
       try {
          const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/telegram-auth`;
          const res = await fetch(url, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ action: 'verify_buyer', telegramData: user })
          });
          const data = await res.json();
          if (data.error) throw new Error(data.error);
          
          setTelegramUser(data.user);
          if (!reviewerName) {
            setReviewerName(data.user.first_name + (data.user.last_name ? ` ${data.user.last_name}` : ''));
          }
          if (data.user.photo_url && !photoPreview) {
            setPhotoPreview(data.user.photo_url);
          }
          showToast('Telegram verified successfully!', 'success');
       } catch (err: any) {
          showToast('Telegram verification failed: ' + err.message, 'error');
       }
    };

    if (telegramWrapperRef.current && !telegramUser) {
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
  }, [telegramUser, reviewerName, photoPreview]);

  // Handle Dynamic Answers
  const handleAnswerChange = (qId: string, val: any) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  // Photo Upload Handler
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  // Video Recording Logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setMediaStream(stream);
      setIsRecording(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const completeBlob = new Blob(chunks, { type: 'video/webm' });
        setVideoBlob(completeBlob);
        setVideoPreview(URL.createObjectURL(completeBlob));
        stream.getTracks().forEach(track => track.stop());
        setMediaStream(null);
        setIsRecording(false);
      };

      mediaRecorder.start();

    } catch (err) {
      console.error("Error accessing camera:", err);
      showToast("Could not access camera/microphone. Please check permissions.", "error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const clearVideo = () => {
    setVideoBlob(null);
    setVideoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setIsSubmitting(true);

    if (!consentGiven) {
       setIsSubmitting(false);
       showToast("Please confirm consent to submit your testimonial.", "warning");
       return;
    }

    try {
      // 1. Upload video if exists
      let videoUrl = null;
      if (videoBlob) {
        const fileName = `${profile.id}/${Date.now()}_testimonial.webm`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('videos')
          .upload(fileName, videoBlob);
        
        if (!uploadError && uploadData) {
           const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(fileName);
           videoUrl = publicUrl;
        }
      }

      // 2. Upload photo if selected, otherwise fallback to Telegram avatar
      let avatarUrl = telegramUser?.photo_url || null;
      if (photoFile) {
        const ext = photoFile.name.split('.').pop() || 'jpg';
        const photoFileName = `${profile.id}/${Date.now()}_avatar.${ext}`;
        const { data: photoUploadData, error: photoUploadError } = await supabase.storage
          .from('avatars')
          .upload(photoFileName, photoFile);

        if (!photoUploadError && photoUploadData) {
          const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(photoFileName);
          avatarUrl = publicUrl;
        }
      }

      // 3. Format the textual response
      const textResponses = config.questions.map(q => {
         const ans = answers[q.id];
         if (!ans) return null;
         if (q.type === 'rating') return null; 
         return `${q.label}\nAnswer: ${ans}`;
      }).filter(Boolean).join('\n\n');

      const ratingParams = config.questions.find(q => q.type === 'rating');
      const score = ratingParams ? (answers[ratingParams.id] || 0) * 20 : 0; 
      
      const { error: insertError } = await supabase
        .from('testimonials')
        .insert({
          user_id: profile.id,
          name: reviewerName,
          company: reviewerCompany,
          avatar_url: avatarUrl,
          text: textResponses || "Verified Testimonial",
          video_url: videoUrl,
          score: score,
          status: 'verified', // Verified customer submission
          source: 'web_collection',
          social_url: reviewerSocialUrl || null,
          consent_given: consentGiven,
          is_verified: !!telegramUser,
          reviewer_telegram_id: telegramUser?.id?.toString(),
          reviewer_telegram_username: telegramUser?.username
        });

      if (insertError) {
        if (insertError.message.includes('unique_review_per_telegram_user') || insertError.code === '23505') {
            throw new Error("You have already reviewed this business with this Telegram account.");
        }
        throw insertError;
      }

      setSubmitted(true);

    } catch (err: any) {
      console.error("Submission error:", err);
      showToast(err.message || "Failed to submit testimonial. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render ---

  if (loading) {
    return (
      <div className="min-h-screen bg-white bg-grid flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full border-3 border-gray-200 border-t-black animate-spin"></div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Loading Form...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-white bg-grid flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-md border border-gray-200 p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Page Not Found</h2>
          <p className="text-gray-500 mb-6 text-sm">{error || "This collection page does not exist."}</p>
          <button 
            onClick={onBack} 
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-black text-white rounded-xl hover:bg-gray-800 font-bold text-sm transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-white bg-grid flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-200 p-8 text-center animate-fade-in space-y-6">
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-black mb-1 tracking-tight">Review Verified & Submitted!</h2>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
              Your verified review has been recorded for <span className="font-bold text-black">{profile.company_name || profile.full_name}</span>. Thank you for your feedback!
            </p>
          </div>

          {/* Unlocked Reward Card */}
          {config.incentive_message && (
            <div className="p-5 rounded-2xl bg-[#FCE676]/20 border border-amber-300/80 text-left space-y-2 shadow-sm">
              <div className="flex items-center gap-1.5 text-amber-900 font-black text-xs uppercase tracking-wider">
                <Gift size={15} className="text-amber-700" />
                <span>🎉 Reward Unlocked!</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-gray-900 leading-relaxed">
                {config.incentive_message}
              </p>
            </div>
          )}

          <div className="pt-2 flex flex-col gap-2">
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 px-6 rounded-xl bg-gray-100 hover:bg-gray-200 text-black font-bold text-xs transition-colors"
            >
              Submit Another Response
            </button>
            <a 
              href={`/wall/${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-gray-500 hover:text-black transition-colors"
            >
              View Public Wall of Proof →
            </a>
          </div>
        </div>
      </div>
    );
  }

  const brandTitle = profile.company_name || profile.full_name || 'TrustGrid Business';

  return (
    <div className="min-h-screen bg-white bg-grid font-sans antialiased pb-20 relative text-black">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header / Branding */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
           <div className="flex items-center gap-3">
             {profile.logo_url || profile.avatar_url ? (
               <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 p-1 flex items-center justify-center overflow-hidden shadow-xs">
                 <img src={profile.logo_url || profile.avatar_url} alt="Logo" className="w-full h-full object-contain" />
               </div>
             ) : (
                <div className="w-9 h-9 rounded-xl bg-[#FCE676] text-black border border-black/20 flex items-center justify-center font-black text-xs">
                  {brandTitle.charAt(0).toUpperCase()}
                </div>
             )}
             <div>
               <h1 className="font-extrabold text-sm text-black leading-tight flex items-center gap-1.5">
                 {brandTitle}
                 <CheckCircle2 size={13} className="text-emerald-600 inline" />
               </h1>
               <p className="text-[11px] text-gray-500 font-medium">Verified Reviews Collection</p>
             </div>
           </div>
           
           <a 
             href="/" 
             target="_blank" 
             rel="noopener noreferrer" 
             className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-bold text-gray-700 transition-colors shadow-sm"
           >
             <ShieldCheck size={13} className="text-emerald-600" />
             <span>TrustGrid</span>
           </a>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-10">
        {/* Title Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-black mb-2 tracking-tight">{config.title}</h2>
          <p className="text-sm text-gray-600 font-medium max-w-md mx-auto">{config.subtitle}</p>
        </div>

        {/* Incentive Banner (if configured) */}
        {config.incentive_message && (
          <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-[#FCE676]/20 border border-amber-300/60 flex items-start gap-3.5 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-amber-400/30 text-amber-900 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Gift size={20} />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full inline-block mb-1">
                Reward for Reviewers
              </span>
              <p className="text-xs sm:text-sm font-bold text-gray-900 leading-relaxed">
                {config.incentive_message}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Dynamic Questions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-100">
            {config.questions.map((q) => (
              <div key={q.id} className="p-6">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  {q.label} {q.required && <span className="text-red-500">*</span>}
                </label>
                
                {q.type === 'textarea' && (
                  <textarea
                    required={q.required}
                    rows={4}
                    placeholder={q.placeholder || "Share details of your experience..."}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none resize-none placeholder-gray-400"
                    value={answers[q.id] || ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  />
                )}

                {q.type === 'text' && (
                  <input
                    type="text"
                    required={q.required}
                    placeholder={q.placeholder || "Your answer"}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none placeholder-gray-400"
                    value={answers[q.id] || ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  />
                )}

                {q.type === 'rating' && (
                  <div className="flex gap-2 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleAnswerChange(q.id, star)}
                        className="transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star 
                          className={`w-8 h-8 ${(answers[q.id] || 0) >= star ? 'fill-current' : 'text-gray-200'}`}
                          style={{ 
                            color: (answers[q.id] || 0) >= star ? '#F59E0B' : undefined,
                            fill: (answers[q.id] || 0) >= star ? '#F59E0B' : 'none' 
                           }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Photo / Headshot Upload (if enabled) */}
          {config.allow_photo && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
                <Camera className="w-4 h-4 text-gray-700" /> Your Profile Photo (Optional)
              </h3>
              <p className="text-xs text-gray-500 mb-4">Adding a headshot or company logo increases testimonial credibility</p>

              <input 
                type="file" 
                ref={photoInputRef}
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden" 
              />

              {photoPreview ? (
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <img 
                    src={photoPreview} 
                    alt="Preview" 
                    className="w-14 h-14 rounded-xl object-cover border border-gray-200 shadow-sm" 
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">Photo Attached</p>
                    <p className="text-[11px] text-gray-500">Will appear alongside your review</p>
                  </div>
                  <button
                    type="button"
                    onClick={clearPhoto}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-700"
                    title="Remove Photo"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2.5 p-4 border border-dashed border-gray-300 rounded-xl hover:border-black hover:bg-gray-50 transition-all group text-xs font-bold text-gray-700"
                >
                  <Upload size={16} className="text-gray-400 group-hover:text-black transition-colors" />
                  <span>Upload Headshot or Company Logo</span>
                </button>
              )}
            </div>
          )}

          {/* Video Recording Section (if enabled) */}
          {config.allow_video && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
                <Video className="w-4 h-4 text-rose-500" /> Record a Video Review (Optional)
              </h3>
              <p className="text-xs text-gray-500 mb-4">Record a short 30-60 second video from your camera</p>
              
              {!isRecording && !videoPreview ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="w-full flex flex-col items-center justify-center gap-2 p-8 border border-dashed border-gray-300 rounded-xl hover:border-rose-400 hover:bg-rose-50/30 transition-all group"
                >
                  <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center group-hover:bg-rose-100 transition-colors text-rose-600">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-xs text-gray-800">Click to Start Camera</span>
                </button>
              ) : (
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video shadow-inner">
                  {isRecording ? (
                    <>
                      <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
                        <div className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                          Recording...
                        </div>
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg"
                        >
                          <div className="w-4 h-4 bg-red-600 rounded-sm" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <video src={videoPreview!} controls className="w-full h-full" />
                      <button
                        type="button"
                        onClick={clearVideo}
                        className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-full hover:bg-black/80 backdrop-blur-sm transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* About You Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
              <User size={16} className="text-gray-700" /> About You
            </h3>
            <p className="text-xs text-gray-500 mb-4">Your public profile details for this testimonial</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dawit Tadesse"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-black outline-none placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Company / Role (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Marketing Director"
                  value={reviewerCompany}
                  onChange={(e) => setReviewerCompany(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-black outline-none placeholder-gray-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <Mail size={12} className="text-gray-400" /> Email (Private, for confirmation)
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={reviewerEmail}
                  onChange={(e) => setReviewerEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-black outline-none placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <Globe size={12} className="text-gray-400" /> Social Profile or Website (Optional)
                </label>
                <input
                  type="text"
                  placeholder="linkedin.com/in/you or t.me/username"
                  value={reviewerSocialUrl}
                  onChange={(e) => setReviewerSocialUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-black outline-none placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="p-4 bg-white rounded-2xl border border-gray-200">
            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox"
                required
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="w-4 h-4 rounded text-black accent-black cursor-pointer mt-0.5" 
              />
              <span className="text-xs text-gray-600 leading-relaxed font-medium">
                I grant permission to <strong className="text-black">{brandTitle}</strong> to use and display this testimonial, my name, and my photo on their website and promotional materials.
              </span>
            </label>
          </div>

          {/* Submission and Telegram Verification */}
          <div className="pt-2">
            {!telegramUser ? (
               <div className="bg-blue-50/60 rounded-2xl p-6 sm:p-8 border border-blue-100 flex flex-col items-center text-center shadow-sm">
                  <div className="w-12 h-12 bg-blue-500 text-white rounded-xl flex items-center justify-center mb-3 shadow-md shadow-blue-500/20">
                     <MessageCircle size={24} />
                  </div>
                  <h3 className="font-extrabold text-base text-blue-950 mb-1">Verify with Telegram to Submit</h3>
                  <p className="text-xs text-blue-800/80 max-w-sm mb-5 font-medium leading-relaxed">
                    We use Telegram verification to authenticate genuine customers and eliminate fake reviews.
                  </p>
                  <div ref={telegramWrapperRef} className="min-h-[44px]"></div>
               </div>
            ) : (
               <div className="space-y-4">
                 {/* Verified Telegram Banner */}
                 <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
                       <ShieldCheck size={18} />
                     </div>
                     <div>
                       <p className="text-xs font-bold text-emerald-950">Verified as @{telegramUser.username || telegramUser.first_name}</p>
                       <p className="text-[11px] text-emerald-700 font-medium">Cryptographic Proof Active</p>
                     </div>
                   </div>
                   <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                     <Check size={12} /> Ready
                   </span>
                 </div>

                 <button
                   type="submit"
                   disabled={isSubmitting}
                   className="w-full py-4 rounded-xl bg-black text-white font-extrabold shadow-md hover:bg-gray-800 transform active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                 >
                   {isSubmitting ? (
                     <>
                       <Loader2 className="w-5 h-5 animate-spin" />
                       Submitting Review...
                     </>
                   ) : (
                     <>
                       Submit Verified Review
                       <Send className="w-4 h-4" />
                     </>
                   )}
                 </button>
               </div>
            )}

            <div className="flex items-center justify-center gap-1.5 text-center text-xs text-gray-400 mt-6 font-medium">
               <ShieldCheck size={14} className="text-gray-400" />
               <span>Secured and verified by <strong>TrustGrid</strong></span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};