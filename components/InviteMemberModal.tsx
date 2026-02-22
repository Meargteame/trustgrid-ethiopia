import React, { useState } from 'react';
import { X, Mail, CheckCircle2, UserPlus, Loader2 } from 'lucide-react';
import { Button } from './Button';

interface InviteMemberModalProps {
   onClose: () => void;
   onInvite: (email: string, role: string) => Promise<void>;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ onClose, onInvite }) => {
   const [email, setEmail] = useState('');
   const [role, setRole] = useState('Editor');
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [success, setSuccess] = useState(false);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email) return;

      setIsSubmitting(true);
      try {
         await onInvite(email, role);
         setSuccess(true);
         setTimeout(onClose, 2000);
      } catch (error) {
         console.error(error);
      } finally {
         setIsSubmitting(false);
      }
   };

   if (success) {
      return (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl scale-100 transition-transform">
               <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                  <CheckCircle2 size={32} />
               </div>
               <h3 className="text-xl font-bold mb-2">Invitation Sent!</h3>
               <p className="text-gray-500 mb-6">An email has been sent to {email} with instructions to join.</p>
               <Button onClick={onClose} fullWidth>Close</Button>
            </div>
         </div>
      );
   }

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
         <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-lime to-black" />
            
            <button 
               onClick={onClose}
               className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
            >
               <X size={20} />
            </button>

            <div className="p-8">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center">
                     <UserPlus size={20} />
                  </div>
                  <div>
                     <h2 className="text-xl font-bold">Invite Team Member</h2>
                     <p className="text-sm text-gray-500">Add collaborators to your workspace.</p>
                  </div>
               </div>

               <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                     <div className="relative">
                        <Mail size={16} className="absolute left-3 top-3.5 text-gray-400" />
                        <input
                           type="email"
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           className="w-full pl-10 px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                           placeholder="colleague@company.com"
                           required
                        />
                     </div>
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role</label>
                     <div className="grid grid-cols-2 gap-3">
                        {['Admin', 'Editor'].map((r) => (
                           <button
                              key={r}
                              type="button"
                              onClick={() => setRole(r)}
                              className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                                 role === r 
                                    ? 'border-black bg-black text-white shadow-md' 
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                              }`}
                           >
                              {r}
                           </button>
                        ))}
                     </div>
                     <p className="text-xs text-gray-400 mt-2">
                        {role === 'Admin' ? 'Can manage team and billing.' : 'Can manage testimonials and widgets.'}
                     </p>
                  </div>

                  <div className="pt-2">
                     <Button type="submit" fullWidth disabled={isSubmitting} className="h-12 text-sm">
                        {isSubmitting ? <Loader2 className="animate-spin" /> : 'Send Invitation'}
                     </Button>
                  </div>
               </form>
            </div>
            
            <div className="bg-gray-50 p-4text-center border-t border-gray-100">
               <p className="text-xs text-center text-gray-400 py-3">
                  Team limit: 3/5 members used on Elite Plan
               </p>
            </div>
         </div>
      </div>
   );
};
