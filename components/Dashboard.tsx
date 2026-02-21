import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import {
   Plus, Copy, Code, LayoutGrid, Settings,
   CheckCircle2, Clock, Send, Link as LinkIcon,
   Image as ImageIcon, X, Palette, User, Mail, Shield,
   Trash2, LogOut, Check, Loader2, RefreshCw, BarChart3, ExternalLink,
   Share2, Users, Monitor, Layout
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TestimonialData, TeamMember, WidgetTheme } from '../types';
import { VerificationBadge } from './VerificationBadge';
import { AnalyticsTab } from './AnalyticsTab';
import { AiSummaryHeader } from './AiSummaryHeader';
import { TrustMeter } from './TrustMeter';
import { SocialShareModal } from './SocialShareModal';
import { EmbedCodeModal } from './EmbedCodeModal';
import { analyzeTrustContent } from '../services/geminiService';

const INITIAL_TEAM: TeamMember[] = [];

interface DashboardProps {
   onLogout: () => void;
   onOpenCollection: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout, onOpenCollection }) => {
   const [testimonials, setTestimonials] = useState<TestimonialData[]>([]);
   const [isLoadingTestimonials, setIsLoadingTestimonials] = useState(true);
   const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_TEAM);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [activeTab, setActiveTab] = useState<'feed' | 'analytics' | 'widgets' | 'settings'>('feed');
   const [filter, setFilter] = useState<'all' | 'verified' | 'pending'>('all');
   const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
   const [setupRequired, setSetupRequired] = useState(false);

   // Widget Lab State
   const [activeTheme, setActiveTheme] = useState<WidgetTheme>('modern');

   // Social Share State
   const [shareModalData, setShareModalData] = useState<TestimonialData | null>(null);
   const [embedModalId, setEmbedModalId] = useState<string | null>(null);

   // Settings Form State
   const [profileData, setProfileData] = useState({
      companyName: '',
      email: '',
      username: '', // Added username
      primaryColor: '#D4F954',
      font: 'Plus Jakarta Sans',
      logoUrl: '' // For future use
   });
   const [loadingProfile, setLoadingProfile] = useState(true);

   // Modal Form State
   const [verificationType, setVerificationType] = useState<'manual' | 'email' | 'linkedin'>('manual');
   const [isFetching, setIsFetching] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [formData, setFormData] = useState({
      name: '',
      email: '', // client email
      text: '',
      username: '', // unused for email flow but kept for structure
      linkedinUrl: '',
      avatarFile: null as File | null
   });

   // Fetch testimonials on mount
   useEffect(() => {
      fetchTestimonials();
      fetchProfile();
   }, []);

   const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
         const { data: { user } } = await supabase.auth.getUser();
         if (!user) return;

         // Get profile 
         let { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

         // Fix: Handle null data correctly even if error is present (PGRST116)
         if (error && error.code === 'PGRST116') {
             // Profile not found, create one from Auth Metadata
             const meta = user.user_metadata || {};
             // Default username from email if full_name is missing
             const defaultUsername = meta.full_name ? meta.full_name.replace(/\s+/g, '').toLowerCase() : (user.email?.split('@')[0] || 'user');
             
             const newProfile = { 
                id: user.id, 
                company_name: meta.company_name || meta.full_name || 'My Brand', // Better fallback
                email: user.email, 
                primary_color: '#D4F954',
                username: defaultUsername
             };
             
             const { data: created, error: createError } = await supabase.from('profiles').insert([newProfile]).select().single();
             
             if (!createError && created) {
                 data = created;
             } else {
                 console.error("Error creating profile:", createError);
                 data = null; // Ensure we fall back to metadata below
             }
         } else if (error) {
             console.error("Error fetching profile:", error);
         }

         if (data) {
             setProfileData({
                 companyName: data.company_name || user.user_metadata?.company_name || user.user_metadata?.full_name || 'My Brand',
                 email: data.email || user.email || '',
                 username: data.username || user.user_metadata?.full_name?.replace(/\s+/g, '').toLowerCase() || user.email?.split('@')[0] || '',
                 primaryColor: data.primary_color || '#D4F954',
                 font: data.font || 'Plus Jakarta Sans',
                 logoUrl: data.logo_url || ''
             });
         } else {
             // Fallback if no profile data found at all and insert failed
             const meta = user.user_metadata || {};
             setProfileData({
                 companyName: meta.company_name || meta.full_name || 'My Brand',
                 email: user.email || '',
                 username: meta.full_name ? meta.full_name.replace(/\s+/g, '').toLowerCase() : (user.email?.split('@')[0] || ''),
                 primaryColor: '#D4F954',
                 font: 'Plus Jakarta Sans',
                 logoUrl: ''
             });
         }
      } catch (err: any) {
         console.warn("Failed to load profile logic:", err);
      } finally {
         setLoadingProfile(false);
      }
   };

   const fetchTestimonials = async () => {
      setIsLoadingTestimonials(true);
      try {
         const { data: { user } } = await supabase.auth.getUser();
         if (!user) return;

         const { data, error } = await supabase
            .from('testimonials')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

         if (error) throw error;
         
         const mappedData: TestimonialData[] = (data || []).map((item: any) => ({
            id: item.id,
            userId: item.user_id,
            clientName: item.name,
            clientCompany: item.company,
            text: item.text,
            videoUrl: item.video_url,
            verificationMethod: item.is_verified ? 'email' : 'manual', // simplified mapping
            status: (item.status === 'approved' ? 'verified' : item.status) as any,
            createdAt: item.created_at,
            // mock missing fields for now
            clientRole: 'Client',
            sourceUrl: '',
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random`,
            cardStyle: 'white'
         }));

         setTestimonials(mappedData);
      } catch (err: any) {
         console.error('Failed to fetch testimonials:', err);
         
         if (
            err.message?.includes('relation "testimonials" does not exist') || 
            err.message?.includes('Could not find the table') || // Catch specific PostgREST error
            err.code === '42P01' || // Postgres error for undefined table
            err.code === 'PGRST204' // PostgREST error for undefined definition
         ) {
            setSetupRequired(true);
            showToast('Database not setup yet. Please run the SQL schema.', 'error');
         } else if (err.code === 'PGRST116') {
            setTestimonials([]); 
         } else {
            showToast(`Error loading data: ${err.message}`, 'error');
         }
      } finally {
         setIsLoadingTestimonials(false);
      }
   };

   const showToast = (message: string, type: 'success' | 'error' = 'success') => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
   };

   // --- Logic ---

   const calculateTrustScore = () => {
      let score = 0;
      // Base for account setup
      score += 10;
      
      const verified = testimonials.filter(t => t.status === 'verified');
      if (verified.length === 0) return 10;

      // 1. Average AI Score (50% weight)
      const aiScores = verified.map(t => t.score || 70); // Default 70 if no score
      const avgAiScore = aiScores.reduce((a, b) => a + b, 0) / aiScores.length;
      score += (avgAiScore * 0.5);

      // 2. Volume (10% weight) - Max out at 20 reviews
      score += Math.min(verified.length * 2, 20);

      // 3. Completeness (video, linkedin) (20% weight)
      // Video Reviews
      const videoCount = verified.filter(t => t.videoUrl).length;
      score += Math.min(videoCount * 5, 20);
      
      // LinkedIn Connected
      const hasLinkedin = verified.some(t => t.verificationMethod === 'linkedin');
      if (hasLinkedin) score += 10;

      return Math.min(100, Math.round(score));
   };

   const handleCopyLink = () => {
      const url = window.location.origin + '/embed/' + (profileData.username || '');
      navigator.clipboard.writeText(url);
      showToast('Link copied to clipboard!');
   };

   const handleCopyEmbed = () => {
      const code = `<iframe src="${window.location.origin}/embed/${profileData.username || ''}?theme=${activeTheme}" width="100%" height="600" frameborder="0"></iframe>`;
      navigator.clipboard.writeText(code);
      showToast('Code copied! Ready to paste into your Telegram portfolio or Website.');
   };

   const handleDelete = async (id: string) => {
      if (window.confirm('Are you sure you want to delete this proof?')) {
         try {
            const { error } = await supabase.from('testimonials').delete().eq('id', id);
            if (error) throw error;
            
            setTestimonials(testimonials.filter(t => t.id !== id));
            showToast('Proof deleted successfully');
         } catch (err) {
            console.error(err);
            showToast('Failed to delete proof', 'error');
         }
      }
   };

   const handleVerify = async (id: string) => {
      try {
         // Update DB. Ensure status is 'verified' and is_verified boolean is true
         const { error } = await supabase
            .from('testimonials')
            .update({ status: 'verified', is_verified: true })
            .eq('id', id);

         if (error) throw error;

         // Optimistic Update
         setTestimonials(testimonials.map(t => 
             t.id === id ? { ...t, status: 'verified' } : t
         ));
         showToast('Proof verified and published!');
      } catch (err: any) {
         console.error(err);
         showToast('Failed to verify proof', 'error');
         if (err.message?.includes('policies')) setSetupRequired(true);
      }
   };

   // handleVerify declaration removed (duplicate)

   const handleCustomizeStyle = async (id: string) => {
      const testimonial = testimonials.find(t => t.id === id);
      if (!testimonial) return;

      const styles: ('white' | 'lime' | 'dark')[] = ['white', 'lime', 'dark'];
      const currentIndex = styles.indexOf(testimonial.cardStyle || 'white');
      const nextStyle = styles[(currentIndex + 1) % styles.length];

      // Optimistic update
      setTestimonials(testimonials.map(t =>
         t.id === id ? { ...t, cardStyle: nextStyle } : t
      ));

      try {
         const { error } = await supabase
            .from('testimonials')
            .update({ card_style: nextStyle }) // Changed to snake_case for DB
            .eq('id', id);
            
         if (error) throw error;
         showToast('Card style updated');
      } catch (err: any) {
         console.error('Style update failed', err);
         
         if (err.message?.includes('column "card_style" of relation "testimonials" does not exist')) {
             setSetupRequired(true); // Trigger schema update alert
             showToast('Database update required. Please run the SQL.', 'error');
         } else {
             showToast('Failed to update style', 'error');
         }
         
         // Revert could happen here
      }
   };

   const handleSimulateFetch = () => {
      if (!formData.linkedinUrl) {
         showToast('Please paste a LinkedIn URL first', 'error');
         return;
      }
      setIsFetching(true);
      setTimeout(() => {
         setFormData(prev => ({
            ...prev,
            name: 'Dawit Mekonnen',
            text: 'Working with Addis Design Co. was a game changer for our startup. Highly professional and timely delivery.',
         }));
         setIsFetching(false);
         showToast('Data fetched from LinkedIn!');
      }, 2000);
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
         const { data: { user } } = await supabase.auth.getUser();
         if (!user) throw new Error("Please log in to add proofs.");

         // 1. Handle File Upload
         let avatarUrl = null;
         if (formData.avatarFile) {
            const fileName = `${user.id}/${Date.now()}.png`;
            const { error: uploadError } = await supabase.storage
               .from('avatars')
               .upload(fileName, formData.avatarFile);
            
            if (!uploadError) {
               const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
               avatarUrl = publicUrl;
            }
         }

         // 2. Analyze Content (Mock or Real)
         const analysis = await analyzeTrustContent(formData.text);

         // 3. Prepare Payload
         const payload = {
            user_id: user.id,
            name: formData.name,
            text: formData.text,
            avatar_url: avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`,
            score: analysis.score,
            sentiment: analysis.sentiment,
            status: verificationType === 'email' ? 'pending_verification' : 'verified', // If email, set pending
            source: verificationType,
            client_email: verificationType === 'email' ? formData.email : null,
            // If linkedin, store URL in video_url for now or add a column
            video_url: verificationType === 'linkedin' ? formData.linkedinUrl : null 
         };

         const { data, error } = await supabase
            .from('testimonials')
            .insert([payload])
            .select()
            .single();

         if (error) throw error;

         // 4. Handle Real Email Sending via Client
         if (verificationType === 'email' && data) {
             const verifyLink = `${window.location.origin}/verify/${data.verification_token}`;
             const subject = encodeURIComponent(`Verify your review for ${profileData.companyName || 'Addis Design Co.'}`);
             const body = encodeURIComponent(
`Hi ${formData.name},

Thanks for your kind words! 

To help us build trust with future clients, could you please verify this review by clicking the link below? 
It only takes one click.

${verifyLink}

Thanks,
${profileData.companyName || 'The Team'}
`
             );
             
             // Open the user's default email client with the pre-filled message
             window.open(`mailto:${formData.email}?subject=${subject}&body=${body}`, '_blank');
             
             showToast('Email draft opened! Please review and send.', 'success');
         } else {
             showToast('Proof added successfully!', 'success');
         }

         setIsModalOpen(false);
         // Refresh list
         const { data: newList } = await supabase.from('testimonials').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
         if (newList) setTestimonials(newList);
         
      } catch (error: any) {
         console.error(error);
         if (error.message?.includes('policies')) {
             showToast('Failed to add proof. RLS policy violation.', 'error');
         } else if (
             error.message?.includes('storage') || 
             error.message?.includes('Bucket not found') ||
             error.error === 'Bucket not found'
         ) {
             setSetupRequired(true); // Force show setup screen
             showToast('Storage bucket missing. Showing setup SQL...', 'error');
         } else {
             showToast(`Failed to add proof: ${error.message || 'Unknown error'}`, 'error');
         }
      } finally {
         setIsSubmitting(false);
      }
   };

   const handleSaveSettings = async () => {
      try {
         const { data: { user } } = await supabase.auth.getUser();
         if (!user) throw new Error("No user session");

         if (profileData.username && profileData.username.length < 3) {
            throw new Error("Handle must be at least 3 characters");
         }

         // Upsert based on ID
         const { error } = await supabase.from('profiles').upsert({
             id: user.id || 'default',
             company_name: profileData.companyName,
             username: profileData.username || null,
             email: profileData.email,
             primary_color: profileData.primaryColor,
             font: profileData.font,
             updated_at: new Date().toISOString()
         });

         if (error) throw error;
         showToast('Profile settings saved successfully!');
      } catch (err: any) {
         console.error("Failed to save settings", err);
         showToast('Failed to save: ' + (err.message), 'error');
         if (err.message?.includes('profiles')) setSetupRequired(true);
      }
   };


   const handleInviteTeam = () => {
      const email = prompt("Enter team member email:");
      if (email) {
         const newMember: TeamMember = {
            id: Date.now().toString(),
            name: email.split('@')[0],
            email,
            role: 'Editor',
            status: 'Pending',
            avatarUrl: `https://ui-avatars.com/api/?name=${email}&background=random`
         };
         setTeamMembers([...teamMembers, newMember]);
         showToast('Invitation sent!');
      }
   };

   const filteredTestimonials = testimonials.filter(t => {
      if (filter === 'all') return true;
      return t.status === filter;
   });

   const getCardStyle = (t: TestimonialData) => {
      let base = "";
      switch (t.cardStyle) {
         case 'lime': base = 'bg-brand-lime border-black'; break;
         case 'dark': base = 'bg-black border-black text-white'; break;
         default: base = 'bg-white border-black'; break;
      }
      if (t.verificationMethod === 'linkedin') {
         base += " shadow-[0_0_15px_rgba(252,230,118,0.6)] border-brand-yellow ring-1 ring-brand-yellow";
      }
      return base;
   };

   // --- Renderers ---

   if (setupRequired) {
      const sqlToRun = `-- 1. Create the table (if missing)
create table if not exists testimonials (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  company text,
  text text,
  video_url text,
  avatar_url text,
  score int,
  sentiment text,
  is_verified boolean default false,
  status text default 'pending'
);

-- 2. Enable RLS (safe to run multiple times)
alter table testimonials enable row level security;

-- Drop existing policies to avoid "already exists" errors
drop policy if exists "Public view" on testimonials;
drop policy if exists "User insert" on testimonials;
drop policy if exists "User update" on testimonials;
drop policy if exists "User delete" on testimonials;

create policy "Public view" on testimonials for select using (true);
create policy "User insert" on testimonials for insert with check (true);
create policy "User update" on testimonials for update using (auth.uid() = user_id);
create policy "User delete" on testimonials for delete using (auth.uid() = user_id);

-- 3. Create Storage Bucket for Avatars
insert into storage.buckets (id, name, public) 
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Public Access" on storage.objects;
drop policy if exists "User Upload" on storage.objects;

create policy "Public Access" on storage.objects for select using ( bucket_id = 'avatars' );
create policy "User Upload" on storage.objects for insert with check ( bucket_id = 'avatars' );

-- 4. Add avatar_url if missing
alter table testimonials add column if not exists avatar_url text;

-- 5. Add card_style if missing
alter table testimonials add column if not exists card_style text default 'white';

-- 6. Create Storage Bucket for Videos
insert into storage.buckets (id, name, public) 
values ('videos', 'videos', true)
on conflict (id) do nothing;

create policy "Public Access Videos" on storage.objects for select using ( bucket_id = 'videos' );
create policy "User Upload Videos" on storage.objects for insert with check ( bucket_id = 'videos' );


-- 7. Create Profiles Table (for company branding/settings)
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  company_name text,
  email text,
  primary_color text default '#D4F954',
  font text default 'Plus Jakarta Sans',
  website text,
  logo_url text, -- For future logo upload
  updated_at timestamp with time zone default now()
);

-- 8. Profiles RLS
alter table profiles enable row level security;

drop policy if exists "Public profiles" on profiles;
drop policy if exists "User update own profile" on profiles;
drop policy if exists "User insert own profile" on profiles;

create policy "Public profiles" on profiles for select using (true);
create policy "User update own profile" on profiles for update using (auth.uid() = id);
create policy "User insert own profile" on profiles for insert with check (auth.uid() = id);`;

      return (
         <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 text-center">
            <Shield size={64} className="text-red-500 mb-6" />
            <h1 className="text-3xl font-extrabold mb-4">Database Setup Required</h1>
            <p className="max-w-md text-gray-600 mb-8">
               Your Supabase project is connected, but the <b>testimonials</b> table needs updates.
            </p>
            <div className="bg-gray-100 p-6 rounded-2xl text-left w-full max-w-2xl overflow-auto mb-8 font-mono text-xs">
               <p className="text-gray-500 mb-2 font-sans font-bold">Instuctions: Click "Copy SQL" below and paste it into Supabase SQL Editor.</p>
               <pre>{sqlToRun}</pre>
               <Button 
                  size="sm" 
                  onClick={() => {
                     navigator.clipboard.writeText(sqlToRun);
                     showToast('SQL copied to clipboard!');
                  }}
                  className="mt-4"
               >
                  <Copy size={14} className="mr-2" /> Copy SQL
               </Button>
            </div>
            <Button onClick={() => window.location.reload()}>I've Run the SQL, Refresh</Button>
         </div>
      );
   }

   const renderFeed = () => (
      <>
         <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
               <div className="flex items-center gap-3 mb-1">
                 {/* Dashboard-specific Logo used as home/refresh, prevents jumping to landing page */}
                 <div className="font-extrabold text-2xl tracking-tighter text-black cursor-pointer" onClick={() => setActiveTab('feed')}>
                   TrustGrid.
                 </div>
                 <h1 className="text-3xl font-extrabold text-black">Dashboard</h1>
               </div>
               <p className="text-gray-500 text-sm">Manage your reputation and verified proofs.</p>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex bg-gray-100 p-1 rounded-xl">
                  {(['all', 'verified', 'pending'] as const).map((f) => (
                     <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${filter === f ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}
                     >
                        {f}
                     </button>
                  ))}
               </div>
               <Button onClick={() => setIsModalOpen(true)} className="shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Plus size={18} className="mr-2" /> Add Proof
               </Button>
            </div>
         </header>

         {/* Trust Meter (Gamification) */}
         <TrustMeter score={calculateTrustScore()} />

         {/* AI Summary Header */}
         <AiSummaryHeader reviews={testimonials.filter(t => t.status === 'verified').map(t => t.text)} />

         {/* Masonry Feed */}
         {isLoadingTestimonials ? (
            <div className="flex justify-center py-20">
               <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
         ) : filteredTestimonials.length === 0 ? (
            testimonials.length === 0 ? (
               <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                  <div className="bg-white p-4 rounded-full shadow-sm mb-6">
                     <Shield size={32} className="text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome to TrustGrid!</h3>
                  <p className="text-gray-500 max-w-md mb-8">
                     You don't have any proofs yet. Start by importing a recommendation from LinkedIn or add one manually.
                  </p>
                  <div className="flex gap-4">
                     <Button onClick={() => { setIsModalOpen(true); setVerificationType('linkedin'); }}>
                        <RefreshCw size={16} className="mr-2" /> Import from LinkedIn
                     </Button>
                     <Button variant="outline" onClick={() => { setIsModalOpen(true); setVerificationType('manual'); }}>
                        <Plus size={16} className="mr-2" /> Add Manually
                     </Button>
                  </div>
               </div>
            ) : (
               <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <Shield className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-bold text-gray-900">No proofs match this filter</h3>
                  <p className="text-gray-500 text-sm cursor-pointer hover:underline" onClick={() => setFilter('all')}>View all proofs</p>
               </div>
            )
         ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
               {filteredTestimonials.map((t) => (
                  <div key={t.id} className={`break-inside-avoid border-2 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 group relative ${getCardStyle(t)}`}>

                     {/* Actions Dropdown (Hover) */}
                     <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-20">
                        {/* Verify Button (New Feature) */}
                        {t.status !== 'verified' && (
                           <button
                              onClick={() => handleVerify(t.id)}
                              className={`p-1.5 rounded-lg hover:bg-green-50 hover:text-green-600 transition-colors ${t.cardStyle === 'dark' ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-400'}`}
                              title="Mark as Verified"
                           >
                              <CheckCircle2 size={16} />
                           </button>
                        )}
                        {/* Share Button (Feature 2) */}
                        <button
                           onClick={() => setShareModalData(t)}
                           className={`p-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors ${t.cardStyle === 'dark' ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-400'}`}
                           title="Share to Social"
                        >
                           <Share2 size={16} />
                        </button>
                        
                        {/* Embed Button (New - Utilization) */}
                        <button
                           onClick={() => setEmbedModalId(t.id)}
                           className={`p-1.5 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-colors ${t.cardStyle === 'dark' ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-400'}`}
                           title="Embed on Website"
                        >
                           <Code size={16} />
                        </button>

                        {/* Delete Button */}
                        <button
                           onClick={() => handleDelete(t.id)}
                           className={`p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors ${t.cardStyle === 'dark' ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-400'}`}
                           title="Delete"
                        >
                           <Trash2 size={16} />
                        </button>

                        {/* Verify Button (New Feature) */}
                        {t.status === 'pending' && (
                           <button
                              onClick={() => handleVerify(t.id)}
                              className={`p-1.5 rounded-lg hover:bg-green-50 hover:text-green-600 transition-colors ${t.cardStyle === 'dark' ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-400'}`}
                              title="Verify & Publish"
                           >
                              <CheckCircle2 size={16} />
                           </button>
                        )}
                     </div>

                     {/* Status Badge */}
                     <div className="flex justify-between items-start mb-4">
                        <VerificationBadge method={t.verificationMethod} />
                     </div>

                     {/* Text Content */}
                     <p className={`text-sm leading-relaxed mb-6 font-medium ${t.cardStyle === 'dark' ? 'text-gray-200' : 'text-gray-800'} ${/[\u1200-\u137F]/.test(t.text) ? 'font-ethiopic' : ''}`}>
                        "{t.text}"
                     </p>

                     {/* Email Verification Pending State */}
                     {t.verificationMethod === 'email' && t.status === 'pending' && (
                        <div className="mb-4 bg-yellow-50 border border-yellow-200 p-3 rounded-xl">
                           <p className="text-xs text-yellow-800 font-bold mb-1 flex items-center gap-1">
                              <Clock size={12} /> Pending Client Actions
                           </p>
                           <p className="text-[10px] text-yellow-600 mb-2">
                              Email sent to {t.clientEmail}
                           </p>
                           <button
                              onClick={() => showToast('Verification email resent!')}
                              className="text-[10px] font-bold underline text-yellow-700 hover:text-black"
                           >
                              Resend Email
                           </button>
                        </div>
                     )}

                     <div className={`flex items-center justify-between border-t pt-4 ${t.cardStyle === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
                        <div className="flex items-center gap-3">
                           <img src={t.avatarUrl} alt={t.clientName} className="w-8 h-8 rounded-full border border-gray-200 object-cover" />
                           <div>
                              <p className={`text-xs font-bold ${t.cardStyle === 'dark' ? 'text-white' : 'text-black'}`}>{t.clientName}</p>
                              <p className={`text-[10px] flex items-center gap-1 ${t.cardStyle === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
                                 {t.verificationMethod} • {new Date(t.createdAt).toLocaleDateString()}
                              </p>
                           </div>
                        </div>
                     </div>

                     {/* Quick Action */}
                     <div className={`mt-4 pt-4 border-t border-dashed hidden group-hover:block animate-fade-in ${t.cardStyle === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
                        <Button
                           size="sm"
                           variant="outline"
                           fullWidth
                           onClick={() => handleCustomizeStyle(t.id)}
                           className={`text-xs h-8 ${t.cardStyle === 'dark' ? 'border-gray-700 text-white hover:bg-gray-800' : 'border-gray-300'}`}
                        >
                           <Palette size={12} className="mr-2" /> Customize Style
                        </Button>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </>
   );

   const renderWidgetLab = () => {
      // Determine preview styles based on active theme
      let previewClass = "bg-white border-2 border-black";
      let textClass = "text-black";
      if (activeTheme === 'dark_mode') {
         previewClass = "bg-black border-2 border-[#3B82F6] shadow-[0_0_15px_rgba(59,130,246,0.5)]";
         textClass = "text-white";
      } else if (activeTheme === 'minimalist') {
         previewClass = "bg-gray-50 border border-gray-200 shadow-sm";
         textClass = "text-gray-800";
      }

      return (
         <div className="animate-fade-in">
            <header className="mb-8">
               <h1 className="text-3xl font-extrabold text-black mb-1">Widget Lab</h1>
               <p className="text-gray-500 text-sm">Customize how your Wall of Love looks on your website.</p>
            </header>

            <div className="grid lg:grid-cols-3 gap-8">
               {/* Theme Selection */}
               <div className="lg:col-span-1 space-y-6">
                  <h3 className="font-bold text-lg">Select Theme</h3>

                  <div
                     onClick={() => setActiveTheme('modern')}
                     className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${activeTheme === 'modern' ? 'border-brand-lime bg-brand-lime/10' : 'border-gray-200 hover:border-black'}`}
                  >
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white border border-black rounded shadow-[2px_2px_0_0_#000]"></div>
                        <div>
                           <h4 className="font-bold text-sm">The Modern</h4>
                           <p className="text-xs text-gray-500">High contrast, brutalist style.</p>
                        </div>
                     </div>
                  </div>

                  <div
                     onClick={() => setActiveTheme('dark_mode')}
                     className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${activeTheme === 'dark_mode' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-black'}`}
                  >
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black border border-blue-500 rounded shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                        <div>
                           <h4 className="font-bold text-sm">Dark Mode</h4>
                           <p className="text-xs text-gray-500">Neon accents on black.</p>
                        </div>
                     </div>
                  </div>

                  <div
                     onClick={() => setActiveTheme('minimalist')}
                     className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${activeTheme === 'minimalist' ? 'border-gray-500 bg-gray-50' : 'border-gray-200 hover:border-black'}`}
                  >
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 border border-gray-300 rounded"></div>
                        <div>
                           <h4 className="font-bold text-sm">Minimalist</h4>
                           <p className="text-xs text-gray-500">Clean, no shadows.</p>
                        </div>
                     </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                     <Button fullWidth onClick={handleCopyEmbed} className="bg-black text-white">
                        <Code size={16} className="mr-2" /> Copy Widget Code
                     </Button>
                  </div>
               </div>

               {/* Live Preview */}
               <div className="lg:col-span-2 bg-gray-100 rounded-2xl p-8 flex flex-col justify-center items-center border border-gray-200 bg-grid min-h-[500px]">
                  <div className="mb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Live Preview</div>

                  <div className={`w-full max-w-md p-6 rounded-2xl transition-all duration-300 ${previewClass}`}>
                     <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100/10 border border-gray-500/20 rounded-lg text-[10px] font-bold">
                           <CheckCircle2 size={12} className={activeTheme === 'dark_mode' ? 'text-blue-400' : 'text-green-500'} />
                           VERIFIED
                        </div>
                        <div className="text-xs text-gray-400">2 days ago</div>
                     </div>

                     <p className={`text-sm leading-relaxed mb-6 font-medium ${textClass}`}>
                        "TrustGrid changed how we do business. The widgets look amazing on our site and load instantly."
                     </p>

                     <div className="flex items-center gap-3 pt-4 border-t border-gray-500/10">
                        <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&h=100" className="w-10 h-10 rounded-full object-cover" />
                        <div>
                           <p className={`text-sm font-bold ${textClass}`}>Yonas A.</p>
                           <p className="text-xs text-gray-500">Freelancer</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      );
   };

   const renderSettings = () => (
      <div className="max-w-2xl mx-auto animate-fade-in">
         <header className="mb-10">
            <h1 className="text-3xl font-extrabold text-black mb-1">Account Settings</h1>
            <p className="text-gray-500 text-sm">Manage your brand profile and team access.</p>
         </header>

         <div className="space-y-8">
            {/* Team Management Section (Feature 4) */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                     <Users size={20} /> Team Members
                  </h3>
                  <Button size="sm" onClick={handleInviteTeam} variant="outline" className="text-xs">
                     + Invite Member
                  </Button>
               </div>

               <div className="space-y-4">
                  {/* Real User Entry */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full border border-gray-200 bg-black text-white flex items-center justify-center font-bold">
                              {profileData.companyName ? profileData.companyName.charAt(0).toUpperCase() : 'U'}
                           </div>
                           <div>
                              <p className="text-sm font-bold text-black">{profileData.companyName || 'You'}</p> 
                              <p className="text-xs text-gray-500">{profileData.email}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-black text-white">
                              Owner
                           </span>
                        </div>
                  </div>
                  
                  {/* Demo Team Members (Optional: Remove if confusing) */}
                  {teamMembers.filter(m => m.id !== '1').map(member => (
                     <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-3">
                           <img src={member.avatarUrl} className="w-10 h-10 rounded-full border border-gray-200" />
                           <div>
                              <p className="text-sm font-bold text-black">{member.name}</p>
                              <p className="text-xs text-gray-500">{member.email}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${member.role === 'Admin' ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'}`}>
                              {member.role}
                           </span>
                           {member.status === 'Pending' && <span className="text-[10px] text-orange-500 font-bold">Pending</span>}
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* Profile Section */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm">
               <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <User size={20} /> Profile Details
               </h3>
               <div className="grid gap-4">
                  <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Display Name (Company or Personal)</label>
                     <input
                        type="text"
                        value={profileData.companyName}
                        onChange={(e) => setProfileData({ ...profileData, companyName: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-black focus:ring-0 outline-none transition-colors"
                        placeholder="e.g. Addis Design or Abebe Bikila"
                     />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Public Handle (slug)</label>
                     <div className="flex items-center">
                        <span className="text-gray-400 text-sm bg-gray-100 border border-r-0 border-gray-300 px-3 py-2 rounded-l-xl">trustgrid.et/</span>
                        <input
                           type="text"
                           value={profileData.username || ''}
                           onChange={(e) => setProfileData({ ...profileData, username: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                           className="w-full px-4 py-2 rounded-r-xl border border-gray-300 focus:border-black focus:ring-0 outline-none transition-colors"
                           placeholder="company-name"
                        />
                     </div>
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contact Email</label>
                     <div className="relative">
                        <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                        <input
                           type="email"
                           value={profileData.email}
                           onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                           className="w-full pl-10 px-4 py-2 rounded-xl border border-gray-300 focus:border-black focus:ring-0 outline-none transition-colors"
                        />
                     </div>
                  </div>
               </div>
            </div>

            {/* Branding Section */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm">
               <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Palette size={20} /> Branding
               </h3>
               <div className="grid md:grid-cols-2 gap-6">
                  <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Primary Color</label>
                     <div className="flex gap-2">
                        {['#D4F954', '#3B82F6', '#A855F7', '#111111'].map((color) => (
                           <button
                              key={color}
                              onClick={() => setProfileData({ ...profileData, primaryColor: color })}
                              className={`w-8 h-8 rounded-full border border-gray-200 transition-all ${profileData.primaryColor === color ? 'ring-2 ring-offset-2 ring-black scale-110' : 'hover:scale-105'}`}
                              style={{ backgroundColor: color }}
                           />
                        ))}
                     </div>
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Font</label>
                     <select className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-black outline-none bg-white">
                        <option>Plus Jakarta Sans</option>
                        <option>Inter</option>
                        <option>Roboto</option>
                     </select>
                  </div>
               </div>
            </div>

            <div className="flex justify-end">
               <Button onClick={handleSaveSettings} className="shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Check size={18} className="mr-2" /> Save Changes
               </Button>
            </div>
         </div>
      </div>
   );

   const renderContent = () => {
      switch (activeTab) {
         case 'feed': return renderFeed();
         case 'analytics': return <AnalyticsTab />;
         case 'widgets': return renderWidgetLab();
         case 'settings': return renderSettings();
         default: return renderFeed();
      }
   }

   return (
      <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
         {/* Toast Notification */}
         {toast && (
            <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] flex items-center gap-2 animate-fade-in ${toast.type === 'success' ? 'bg-black text-white' : 'bg-red-500 text-white'}`}>
               {toast.type === 'success' ? <CheckCircle2 size={18} /> : <X size={18} />}
               <span className="font-bold text-sm">{toast.message}</span>
            </div>
         )}

         {/* Social Share Modal */}
         {shareModalData && (
            <SocialShareModal testimonial={shareModalData} onClose={() => setShareModalData(null)} />
         )}

         {/* Embed Code Modal */}
         {embedModalId && (
            <EmbedCodeModal testimonialId={embedModalId} onClose={() => setEmbedModalId(null)} />
         )}

         {/* Sidebar */}
         <aside className="w-full md:w-80 bg-white border-r border-gray-200 p-6 flex flex-col fixed md:relative h-auto md:h-screen z-20">
            <div className="flex items-center gap-1 mb-10 cursor-pointer" onClick={() => setActiveTab('feed')}>
               <span className="font-extrabold text-2xl tracking-tighter text-black">
                  TrustGrid.
               </span>
               <span className="font-black text-2xl tracking-tighter text-brand-lime bg-black px-1 rounded transform -rotate-2">PRO</span>
            </div>

            <div className="mb-8">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full border-2 border-gray-100 bg-gray-200 overflow-hidden flex items-center justify-center font-bold text-gray-500">
                     {profileData.logoUrl ? (
                         <img src={profileData.logoUrl} className="w-full h-full object-cover" /> 
                     ) : (
                         profileData.companyName ? profileData.companyName.charAt(0).toUpperCase() : 'U'
                     )}
                  </div>
                  <div>
                     <h3 className="font-bold text-sm truncate max-w-[150px]">{profileData.companyName || 'Your Name'}</h3>
                     <p className="text-xs text-gray-500">Elite Plan</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 group hover:border-black transition-colors">
                     <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Your Public Wall</p>
                     <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 mb-2">
                        <LinkIcon size={14} className="text-gray-400" />
                        <span className="text-xs truncate flex-1 text-gray-600">trustgrid.et/{profileData.username || 'your-handle'}</span>
                     </div>
                     <Button size="sm" fullWidth variant="secondary" onClick={() => {
                        const url = window.location.origin + '/embed/' + (profileData.username || '');
                        navigator.clipboard.writeText(url);
                        showToast('Link copied to clipboard!', 'success');
                     }} className="text-xs h-8">
                        <Copy size={12} className="mr-2" /> Copy Link
                     </Button>
                  </div>

                  {/* Feature: Auto-Magic Collection Link */}
                  <div className="p-4 bg-brand-lime/10 rounded-xl border border-brand-lime group hover:bg-brand-lime/20 transition-colors cursor-pointer" onClick={() => {
                        // Logic to copy or open
                        if (profileData.username) {
                           const url = window.location.origin + '/collect/' + profileData.username;
                           navigator.clipboard.writeText(url);
                           showToast('Collection form link copied!', 'success');
                           window.open(url, '_blank');
                        } else {
                           showToast('Please set a username in Settings first', 'error');
                        }
                  }}>
                     <p className="text-xs font-bold text-gray-600 mb-1 uppercase flex items-center gap-2">
                        <Send size={12} /> Share Collection Form
                     </p>
                     <p className="text-xs text-black font-bold flex items-center gap-1">
                        Copy link to send to clients <ExternalLink size={10} />
                     </p>
                  </div>
               </div>
            </div>

            <nav className="space-y-1 flex-1">
               <button
                  onClick={() => setActiveTab('feed')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'feed' ? 'bg-black text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}
               >
                  <LayoutGrid size={18} /> Proof Feed
               </button>
               <button
                  onClick={() => setActiveTab('analytics')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'analytics' ? 'bg-black text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}
               >
                  <BarChart3 size={18} /> Analytics
               </button>
               <button
                  onClick={() => setActiveTab('widgets')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'widgets' ? 'bg-black text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}
               >
                  <Layout size={18} /> Widget Lab
               </button>
               <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-black text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}
               >
                  <Settings size={18} /> Settings
               </button>
            </nav>

            <Button variant="ghost" onClick={onLogout} className="mt-auto justify-start px-4 text-red-500 hover:text-red-600 hover:bg-red-50">
               <LogOut size={18} className="mr-2" /> Log Out
            </Button>
         </aside>

         {/* Main Content Area */}
         <main className="flex-1 p-6 md:p-10 overflow-y-auto">
            {renderContent()}
         </main>

         {/* Add Testimonial Modal (Reused) */}
         {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
               <div className="bg-white rounded-[2rem] border-2 border-black w-full max-w-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="flex justify-between items-center p-6 border-b border-gray-100">
                     <h2 className="text-xl font-extrabold">Add New Proof</h2>
                     <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                     </button>
                  </div>
                  <div className="p-6 overflow-y-auto">
                     <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                           <label className="block text-sm font-bold">Verification Source</label>
                           <div className="grid grid-cols-3 gap-2">
                              <button
                                 type="button"
                                 onClick={() => setVerificationType('manual')}
                                 className={`p-3 rounded-xl border-2 text-xs font-bold transition-all ${verificationType === 'manual' ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                              >
                                 Manual
                              </button>
                              <button
                                 type="button"
                                 onClick={() => setVerificationType('email')}
                                 className={`p-3 rounded-xl border-2 text-xs font-bold transition-all ${verificationType === 'email' ? 'border-[#0088cc] bg-[#0088cc] text-white' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                              >
                                 Client Email
                              </button>
                              <button
                                 type="button"
                                 onClick={() => setVerificationType('linkedin')}
                                 className={`p-3 rounded-xl border-2 text-xs font-bold transition-all ${verificationType === 'linkedin' ? 'border-[#0a66c2] bg-[#0a66c2] text-white' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                              >
                                 LinkedIn
                              </button>
                           </div>
                        {/* LinkedIn Modal Update */}
                           {verificationType === 'linkedin' && (
                              <div className="bg-[#0a66c2]/5 p-4 rounded-xl border border-[#0a66c2]/20 animate-fade-in">
                                 <label className="block text-xs font-bold text-[#0a66c2] uppercase mb-2">LinkedIn Profile URL</label>
                                 <div className="flex gap-2">
                                    <input
                                       type="url"
                                       placeholder="https://www.linkedin.com/in/username"
                                       value={formData.linkedinUrl}
                                       onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                                       className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-[#0a66c2]"
                                    />
                                    {/* Removed Simulate Fetch Button for now as requested */}
                                 </div>
                                 <p className="text-[10px] text-gray-500 mt-2">Paste the client's public profile link manually.</p>
                              </div>
                           )}
                           
                           {/* Email Input - Always Visible for ALL Types (Requirement: All 3 ways need email) */}
                           <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                 <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                    Client Email (For Verification) <span className="text-red-500">*</span>
                                 </label>
                                 <div className="flex gap-2">
                                    <Mail size={16} className="text-gray-400 mt-3" />
                                    <input
                                       type="email"
                                       placeholder="client@company.com"
                                       value={formData.email}
                                       onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                       className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-black"
                                       required
                                    />
                                 </div>
                                 <p className="text-[10px] text-gray-500 mt-2">
                                    {verificationType === 'manual' && "We'll send a confirmation link to this email to mark it as Verified."}
                                    {verificationType === 'email' && "We'll send the verification request here."}
                                    {verificationType === 'linkedin' && "We'll notify them you've added their LinkedIn review."}
                                 </p>
                           </div>
                        </div>
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                           <label className="block text-sm font-bold">Client Details</label>
                           <input
                              type="text"
                              placeholder="Client Name"
                              required
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black focus:ring-0 outline-none transition-colors"
                           />
                           <textarea
                              placeholder="Paste their review or testimonial here..."
                              required
                              rows={3}
                              value={formData.text}
                              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black focus:ring-0 outline-none transition-colors resize-none"
                           />
                           <div className="flex items-center gap-4">
                              <label className="w-16 h-16 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-black transition-colors relative overflow-hidden">
                                 {formData.avatarFile ? (
                                     <img src={URL.createObjectURL(formData.avatarFile)} alt="Preview" className="w-full h-full object-cover" />
                                 ) : (
                                     <ImageIcon size={20} className="text-gray-400" />
                                 )}
                                 <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={(e) => {
                                       if (e.target.files?.[0]) {
                                          setFormData({ ...formData, avatarFile: e.target.files[0] });
                                       }
                                    }}
                                 />
                              </label>
                              <div className="text-xs text-gray-500">
                                 <p className="font-bold text-black">Client Photo</p>
                                 <p>Recommended: 400x400px</p>
                              </div>
                              {formData.avatarFile && (
                                 <button type="button" onClick={() => setFormData({...formData, avatarFile: null})} className="text-xs text-red-500 underline">Remove</button>
                              )}
                           </div>
                        </div>
                        <div className="pt-4">
                           <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
                              {isSubmitting ? <Loader2 className="animate-spin" /> : 'Add to Wall'}
                           </Button>
                        </div>
                     </form>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};
