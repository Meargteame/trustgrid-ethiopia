import React, { useState } from 'react';
import { X, Mail, CheckCircle2, UserPlus, Loader2 } from 'lucide-react';

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
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-sans animate-fade-in">
            <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-8 max-w-sm w-full text-center">
               <div className="w-14 h-14 bg-[#F4F4F5] rounded-full flex items-center justify-center mx-auto mb-4 text-[#0A0A0A]">
                  <CheckCircle2 size={28} />
               </div>
               <h3 className="text-xl font-black text-[#0A0A0A] mb-2">Invitation Sent!</h3>
               <p className="text-[#6B7280] text-xs mb-6">An invitation link has been sent to {email}.</p>
               <button 
                  onClick={onClose}
                  className="w-full py-2.5 bg-[#0A0A0A] text-[#FFFFFF] font-bold text-xs rounded-xl hover:bg-[#222222] transition-colors"
               >
                  Close
               </button>
            </div>
         </div>
      );
   }

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-sans animate-fade-in">
         <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl w-full max-w-md relative overflow-hidden">
            
            <button 
               onClick={onClose}
               className="absolute top-4 right-4 text-[#6B7280] hover:text-[#0A0A0A] transition-colors p-1"
            >
               <X size={18} />
            </button>

            <div className="p-7">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#0A0A0A] text-[#FFFFFF] rounded-xl flex items-center justify-center">
                     <UserPlus size={18} />
                  </div>
                  <div>
                     <h2 className="text-lg font-black text-[#0A0A0A]">Invite Team Member</h2>
                     <p className="text-xs text-[#6B7280]">Add collaborators to your workspace.</p>
                  </div>
               </div>

               <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1">
                     <label className="block text-xs font-bold text-[#6B7280] uppercase">Email Address</label>
                     <div className="relative">
                        <Mail size={15} className="absolute left-3.5 top-3.5 text-[#6B7280]" />
                        <input
                           type="email"
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           className="w-full pl-10 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-[#0A0A0A] outline-none transition-all"
                           placeholder="colleague@company.com"
                           required
                        />
                     </div>
                  </div>

                  <div className="space-y-1">
                     <label className="block text-xs font-bold text-[#6B7280] uppercase">Workspace Role</label>
                     <div className="grid grid-cols-2 gap-2.5">
                        {['Admin', 'Editor'].map((r) => (
                           <button
                              key={r}
                              type="button"
                              onClick={() => setRole(r)}
                              className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                                 role === r 
                                    ? 'border-[#0A0A0A] bg-[#0A0A0A] text-[#FFFFFF]' 
                                    : 'border-gray-200 text-[#6B7280] hover:border-gray-300 bg-[#FFFFFF]'
                              }`}
                           >
                              {r}
                           </button>
                        ))}
                     </div>
                     <p className="text-[11px] text-[#6B7280] mt-1.5">
                        {role === 'Admin' ? 'Can manage team, integrations, and branding.' : 'Can manage testimonials, forms, and widgets.'}
                     </p>
                  </div>

                  <div className="pt-2">
                     <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-[#0A0A0A] text-[#FFFFFF] font-bold text-xs rounded-xl hover:bg-[#222222] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                     >
                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Send Invitation'}
                     </button>
                  </div>
               </form>
            </div>
            
            <div className="bg-[#F4F4F5] p-3 text-center border-t border-gray-200">
               <p className="text-[11px] text-[#6B7280] font-medium">
                  Team limit: 3/5 members used on Professional Plan
               </p>
            </div>
         </div>
      </div>
   );
};
