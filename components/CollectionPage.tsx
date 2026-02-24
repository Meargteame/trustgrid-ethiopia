import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Video, 
  Mic, 
  Send, 
  X, 
  CheckCircle2, 
  Loader2, 
  Star, 
  Camera, 
  Linkedin,
  Upload
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// --- Types ---

interface QuestionConfig {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'rating';
  required: boolean;
  placeholder?: string;
}

interface FormConfig {
  title: string;
  subtitle: string;
  questions: QuestionConfig[];
  allow_video: boolean;
  allow_photo: boolean;
  allow_linkedin_import: boolean;
}

interface PublicProfile {
  id: string;
  username: string;
  full_name: string;
  company_name: string;
  avatar_url?: string;
  primary_color: string;
}

interface CollectionPageProps {
   targetUsername?: string;
   onBack: () => void;
}

// --- Default Configuration ---

const DEFAULT_CONFIG: FormConfig = {
  title: 'Share your experience',
  subtitle: 'Your feedback helps us grow.',
  questions: [
    { 
      id: 'q1', 
      label: 'What did you like most about working with us?', 
      type: 'textarea', 
      required: true, 
      placeholder: 'Share your thoughts...' 
    },
    { 
      id: 'q2', 
      label: 'How would you rate our service?', 
      type: 'rating', 
      required: true 
    }
  ],
  allow_video: true,
  allow_photo: true,
  allow_linkedin_import: true
};

const DEFAULT_PRIMARY_COLOR = '#D4F954'; // Lime green default

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
  
  // Media State
  const [isRecording, setIsRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // --- Initialization ---

  useEffect(() => {
    async function init() {
      if (!targetUsername) {
        // Preview Mode: Use current logged-in user
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          loadDataForUser(user.id);
        } else {
          setError("Preview requires login.");
          setLoading(false);
        }
        return;
      }

      // Public Mode: Resolve username
      try {
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, full_name, company_name, avatar_url, primary_color')
          .eq('username', targetUsername)
          .single();

        if (profileError || !profiles) {
          // Fallback: Check if it's the logged-in user viewing their own (during dev/testing)
          const { data: { user } } = await supabase.auth.getUser();
          if (user && user.user_metadata?.username === targetUsername) {
             console.log("Fallback to self for preview");
             loadDataForUser(user.id);
             return;
          }
          setError("User not found.");
          setLoading(false);
          return;
        }

        loadDataForUser(profiles.id, profiles);

      } catch (err) {
        console.error("Error resolving user:", err);
        setError("Failed to load profile.");
        setLoading(false);
      }
    }

    init();
  }, [targetUsername]);

  // Helper to load config and profile
  async function loadDataForUser(userId: string, knownProfile?: any) {
    try {
      // 1. Get Profile (if not already fetched)
      let profileData = knownProfile;
      if (!profileData) {
        const { data } = await supabase
          .from('profiles')
          .select('id, username, full_name, company_name, avatar_url, primary_color')
          .eq('id', userId)
          .single();
        profileData = data;
      }
      
      if (profileData) {
        setProfile(profileData);
      }

      // 2. Get Form Config
      const { data: configData } = await supabase
        .from('form_configs')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (configData) {
        // Parse questions if they are stored as JSONB string or object
        const parsedQuestions = typeof configData.questions === 'string' 
           ? JSON.parse(configData.questions) 
           : configData.questions;

        setConfig({
          title: configData.title || DEFAULT_CONFIG.title,
          subtitle: configData.subtitle || DEFAULT_CONFIG.subtitle,
          questions: parsedQuestions || DEFAULT_CONFIG.questions,
          allow_video: configData.allow_video ?? DEFAULT_CONFIG.allow_video,
          allow_photo: configData.allow_photo ?? DEFAULT_CONFIG.allow_photo,
          allow_linkedin_import: configData.allow_linkedin_import ?? DEFAULT_CONFIG.allow_linkedin_import
        });
      }

    } catch (err) {
      console.error("Error loading user data:", err);
    } finally {
      setLoading(false);
    }
  }

  // --- Handlers ---

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setMediaStream(stream);
      setIsRecording(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setVideoBlob(blob);
        setVideoPreview(URL.createObjectURL(blob));
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        setMediaStream(null);
        setIsRecording(false);
      };

      mediaRecorder.start();

    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera/microphone.");
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

      // 2. Format the textual response
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
          text: textResponses || "Video Testimonial",
          video_url: videoUrl,
          score: score,
          status: 'pending',
          source: 'web_collection' 
        });

      if (insertError) throw insertError;

      setSubmitted(true);

    } catch (err) {
      console.error("Submission error:", err);
      alert("Failed to submit testimonial. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render ---

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
          <p className="text-gray-500 mb-6">{error || "This collection page does not exist."}</p>
          <button onClick={onBack} className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-8">
            Your feedback has been received. We appreciate you taking the time to share your experience.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="text-gray-500 hover:text-gray-900 font-medium"
          >
            Submit another response
          </button>
        </div>
      </div>
    );
  }

  const primaryColor = profile.primary_color || DEFAULT_PRIMARY_COLOR;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header / Branding */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
           <div className="flex items-center gap-3">
             {profile.avatar_url ? (
               <img src={profile.avatar_url} alt="Logo" className="w-10 h-10 rounded-full object-cover" />
             ) : (
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                  {profile.company_name?.charAt(0) || profile.full_name?.charAt(0) || '?'}
                </div>
             )}
             <div>
               <h1 className="font-semibold text-gray-900">{profile.company_name || profile.full_name}</h1>
               <p className="text-xs text-gray-500">Video Testimonials</p>
             </div>
           </div>
           {onBack && (
              <button 
                onClick={onBack} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Exit Preview"
              >
                  <X className="w-5 h-5" />
              </button>
           )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">{config.title}</h2>
          <p className="text-lg text-gray-600">{config.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Dynamic Questions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
            {config.questions.map((q) => (
              <div key={q.id} className="p-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {q.label} {q.required && <span className="text-red-500">*</span>}
                </label>
                
                {q.type === 'textarea' && (
                  <textarea
                    required={q.required}
                    rows={4}
                    placeholder={q.placeholder}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-opacity-50 focus:border-transparent transition-all outline-none resize-none"
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    value={answers[q.id] || ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  />
                )}

                {q.type === 'text' && (
                  <input
                    type="text"
                    required={q.required}
                    placeholder={q.placeholder}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-opacity-50 focus:border-transparent transition-all outline-none"
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    value={answers[q.id] || ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  />
                )}

                {q.type === 'rating' && (
                  <div className="flex gap-2">
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
                            color: (answers[q.id] || 0) >= star ? '#FBBF24' : undefined,
                            fill: (answers[q.id] || 0) >= star ? '#FBBF24' : 'none' 
                           }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {config.allow_video && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                <Video className="w-4 h-4" /> Record a Video (Optional)
              </h3>
              
              {!isRecording && !videoPreview ? (
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={startRecording}
                    className="flex-1 flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all group"
                  >
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center group-hover:bg-red-100 transition-colors">
                      <Camera className="w-6 h-6 text-red-500" />
                    </div>
                    <span className="font-medium text-gray-600">Record Video</span>
                  </button>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                  {isRecording ? (
                    <>
                      <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
                        <div className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full animate-pulse">
                          Recording...
                        </div>
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                          <div className="w-4 h-4 bg-red-500 rounded-sm" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <video src={videoPreview!} controls className="w-full h-full" />
                      <button
                        type="button"
                        onClick={clearVideo}
                        className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-sm transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">About You</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-opacity-50 focus:border-transparent outline-none"
                  style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Company / Role</label>
                <input
                  type="text"
                  value={reviewerCompany}
                  onChange={(e) => setReviewerCompany(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-opacity-50 focus:border-transparent outline-none"
                  style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl text-black font-semibold shadow-lg hover:shadow-xl transform active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: primaryColor }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send Feedback
                  <Send className="w-5 h-5" />
                </>
              )}
            </button>
            <p className="text-center text-xs text-gray-400 mt-4">
               Powered by TrustGrid
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};