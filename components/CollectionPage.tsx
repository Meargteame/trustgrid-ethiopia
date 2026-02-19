import React, { useState, useRef } from 'react';
import { Button } from './Button';
import { Camera, Video, Upload, Check, Gift } from 'lucide-react';

interface CollectionPageProps {
  onBack: () => void;
}

export const CollectionPage: React.FC<CollectionPageProps> = ({ onBack }) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [isRecording, setIsRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    text: ''
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
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
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please allow permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate upload delay
    setStep('success');
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* CSS Confetti */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
           {[...Array(20)].map((_, i) => (
             <div 
               key={i} 
               className="absolute w-3 h-3 bg-brand-lime rounded-full animate-bounce"
               style={{
                 left: `${Math.random() * 100}%`,
                 top: `-20px`,
                 animationDuration: `${Math.random() * 3 + 2}s`,
                 animationDelay: `${Math.random() * 2}s`,
                 backgroundColor: ['#D4F954', '#FCE676', '#000000'][Math.floor(Math.random() * 3)]
               }}
             ></div>
           ))}
        </div>

        <div className="text-center max-w-md w-full animate-fade-in">
           <div className="w-24 h-24 bg-brand-lime rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
             <Check size={48} className="text-black" />
           </div>
           
           <h1 className="text-3xl font-extrabold mb-4">You're Amazing!</h1>
           <p className="text-gray-500 mb-8">Thank you for supporting Addis Design Co. Your feedback helps us grow.</p>
           
           <div className="bg-black text-white p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-20">
                 <Gift size={64} />
              </div>
              <p className="text-xs font-bold text-brand-lime uppercase mb-2">A small gift for you</p>
              <p className="text-2xl font-black mb-1">10% OFF</p>
              <p className="text-sm text-gray-400 mb-4">Your next project with us.</p>
              <div className="bg-white/10 p-2 rounded-lg border border-dashed border-gray-600 font-mono text-center">
                 THANKYOU2026
              </div>
           </div>

           <Button className="mt-8" variant="ghost" onClick={onBack}>Close Window</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-xl mx-auto bg-white min-h-screen shadow-2xl">
         
         <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-20">
            <div className="flex items-center gap-3">
               <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&h=100" className="w-10 h-10 rounded-full border border-gray-200" />
               <div>
                  <p className="text-xs font-bold text-gray-500">Reviewing</p>
                  <p className="font-bold text-sm">Addis Design Co.</p>
               </div>
            </div>
            <Button size="sm" variant="ghost" onClick={onBack}>Cancel</Button>
         </div>

         <div className="p-6 pb-20">
            <h1 className="text-2xl font-extrabold mb-2">How was your experience?</h1>
            <p className="text-gray-500 text-sm mb-8">It only takes 45 seconds.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
               
               {/* Video Recorder */}
               <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-bold">
                     <Video size={16} /> Record Video (Optional)
                  </label>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 overflow-hidden relative min-h-[200px] flex items-center justify-center">
                     {videoBlob ? (
                        <div className="w-full text-center p-8">
                           <div className="w-16 h-16 bg-brand-lime rounded-full flex items-center justify-center mx-auto mb-4 border border-black">
                              <Check size={24} />
                           </div>
                           <p className="font-bold">Video Recorded!</p>
                           <button type="button" onClick={() => setVideoBlob(null)} className="text-xs text-red-500 underline mt-2">Retake</button>
                        </div>
                     ) : isRecording ? (
                        <div className="relative w-full h-64 bg-black">
                           <video ref={videoRef} className="w-full h-full object-cover" muted></video>
                           <div className="absolute bottom-4 left-0 w-full flex justify-center">
                              <button type="button" onClick={stopRecording} className="bg-red-500 text-white px-6 py-2 rounded-full font-bold animate-pulse">
                                 Stop Recording
                              </button>
                           </div>
                        </div>
                     ) : (
                        <div className="text-center p-8">
                           <button type="button" onClick={startRecording} className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4 text-white hover:scale-110 transition-transform">
                              <Camera size={24} />
                           </button>
                           <p className="text-sm font-bold">Tap to Record</p>
                           <p className="text-xs text-gray-500 mt-1">Make it personal!</p>
                        </div>
                     )}
                  </div>
               </div>

               <div className="space-y-3">
                  <label className="text-sm font-bold">Write a Review</label>
                  <textarea 
                     required
                     className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-black outline-none min-h-[120px]"
                     placeholder="What did you like most about the service?"
                     value={formData.text}
                     onChange={e => setFormData({...formData, text: e.target.value})}
                  ></textarea>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Your Name</label>
                     <input 
                        required
                        type="text" 
                        className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-black outline-none"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                     />
                  </div>
                  <div>
                     <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Company / Role</label>
                     <input 
                        required
                        type="text" 
                        className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-black outline-none"
                        value={formData.company}
                        onChange={e => setFormData({...formData, company: e.target.value})}
                     />
                  </div>
               </div>

               <div className="pt-4">
                  <Button fullWidth size="lg" type="submit" className="shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                     Send Review
                  </Button>
               </div>

            </form>
         </div>
      </div>
    </div>
  );
};