import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import {
   Plus, Copy, Code, LayoutGrid, Settings,
   CheckCircle2, Clock, Send, Link as LinkIcon,
   Image as ImageIcon, X, Palette, User, Mail, Shield,
   Trash2, LogOut, Check, Loader2, RefreshCw, BarChart3, ExternalLink,
   Share2, Users, Monitor, Layout, Maximize2, Columns, List, MessageSquare
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Testimonials, TeamMember, WidgetTheme, WidgetLayout } from '../types';
import { VerificationBadge } from './VerificationBadge';
import { AnalyticsTab } from './AnalyticsTab';
import { AiSummaryHeader } from './AiSummaryHeader';
import { TrustMeter } from './TrustMeter';
import { SocialShareModal } from './SocialShareModal';
import { EmbedCodeModal } from './EmbedCodeModal';
import { InviteMemberModal } from './InviteMemberModal';
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
   const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
   const [activeTab, setActiveTab] = useState<'feed' | 'analytics' | 'widgets' | 'settings'>('feed');
   const [filter, setFilter] = useState<'all' | 'verified' | 'pending'>('all');
   const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
   const [setupRequired, setSetupRequired] = useState(false);

   // Widget Lab State
   const [configTab, setConfigTab] = useState<'layout' | 'style' | 'content'>('layout');
   const [widgetConfig, setWidgetConfig] = useState({
      // Layout
      layout: 'grid' as WidgetLayout,
      columns: 3,
      gap: 'normal', // 'tight', 'normal', 'loose'
      
      // Style
      theme: 'modern' as WidgetTheme,
      borderRadius: 'md', // 'none', 'sm', 'md', 'full'
      font: 'inter', // 'inter', 'serif', 'mono'
      shadow: 'card', // 'none', 'sm', 'card', 'strong'
      
      // Content
      showRating: true,
      showDate: true,
      showAvatar: true,
      headerTitle: 'What our clients say',
      minRating: 0,
      cardsToShow: 6,
      filterTag: 'all'
   });

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
      const params = new URLSearchParams({
         theme: widgetConfig.theme,
         layout: widgetConfig.layout,
         rating: widgetConfig.showRating.toString(),
         date: widgetConfig.showDate.toString(),
         avatar: widgetConfig.showAvatar.toString(),
         rad: widgetConfig.borderRadius,
         shad: widgetConfig.shadow,
         font: widgetConfig.font,
         cols: widgetConfig.columns.toString(),
         gap: widgetConfig.gap
      });
      // Also encode title if present
      if (widgetConfig.headerTitle) params.append('title', widgetConfig.headerTitle);

      const code = `<iframe src="${window.location.origin}/embed/${profileData.username || ''}?${params.toString()}" width="100%" height="600" frameborder="0"></iframe>`;
      navigator.clipboard.writeText(code);
      showToast('Code copied! Ready to paste into your Telegram portfolio or Website.');
   };

   const handleInviteTeam = () => {
      setIsInviteModalOpen(true);
   };
   
   const handleSendInvite = async (email: string, role: string) => {
      // Direct call to Edge Function URL
      const functionUrl = 'https://tyenyntazlfqaoduzpxy.supabase.co/functions/v1/send-email';
      
      try {
         const { data: { session } } = await supabase.auth.getSession();
         const res = await fetch(functionUrl, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
               to: email,
               type: 'invite',
               data: {
                  role: role,
                  url: `${window.location.origin}/auth?invite=${role.toLowerCase()}`
               }
            })
         });

         const responseData = await res.json();
         
         if (!res.ok) {
            console.error('Email send error:', responseData);
            showToast('Failed: ' + (responseData.error?.message || JSON.stringify(responseData)), 'error');
         } else {
            showToast(`Invitation sent! ID: ${responseData.id || 'ok'}`);
         }

         setTeamMembers([...teamMembers, {
            id: Date.now().toString(),
            name: email.split('@')[0],
            email,
            role: role as any,
            status: 'Pending',
            avatarUrl: `https://ui-avatars.com/api/?name=${email}&background=random`
         }]);
      } catch (e: any) {
          console.error(e);
          showToast('Failed to send invite: ' + e.message, 'error');
      }
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
             
             // Direct call to Edge Function URL
             const functionUrl = 'https://tyenyntazlfqaoduzpxy.supabase.co/functions/v1/send-email';
             const { data: { session } } = await supabase.auth.getSession();
             
             const emailRes = await fetch(functionUrl, {
                method: 'POST',
                headers: {
                   'Content-Type': 'application/json',
                   'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({
                   to: formData.email,
                   type: 'verify_review',
                   data: {
                      name: formData.name,
                      companyName: profileData.companyName || 'Addis Design Co.',
                      verifyLink: verifyLink
                   }
                })
             });

             const emailDataRes = await emailRes.json();
             
             if (!emailRes.ok) {
                console.error('Email send failed object:', emailDataRes);
                showToast('Email Error: ' + (emailDataRes.error?.message || JSON.stringify(emailDataRes.error)), 'error');
             } else {
                showToast('Verification email sent successfully!', 'success');
             }
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
      // Determine preview styles based on active config
      let previewClass = "bg-white border-2 border-dashed border-gray-300";
      let textClass = "text-black font-sans";
      let cardClass = "bg-white border border-gray-100 shadow-sm rounded-xl";
      let containerClass = "";
      
      const { theme, layout, borderRadius, shadow, font } = widgetConfig;
      
      // Theme Logic
      if (theme === 'dark_mode') {
         previewClass = "bg-black border-2 border-blue-900";
         cardClass = "bg-gray-900 border border-gray-800 text-white";
         textClass = "text-white";
      } else if (theme === 'minimalist') {
         previewClass = "bg-gray-50 border-0";
         cardClass = "bg-white border-0 shadow-none";
         textClass = "text-gray-800";
      } else if (theme === 'brand') {
         previewClass = "bg-brand-lime/5 border-2 border-brand-lime";
         cardClass = "bg-white border-2 border-brand-lime shadow-brutal";
         textClass = "text-black";
      }

      // Radius Logic
      const radiusMap = { 'none': 'rounded-none', 'sm': 'rounded-md', 'md': 'rounded-xl', 'full': 'rounded-3xl' };
      cardClass = cardClass.replace('rounded-xl', ''); // remove default
      const activeRadius = radiusMap[borderRadius as keyof typeof radiusMap] || 'rounded-xl';
      cardClass += ` ${activeRadius}`;

      // Shadow Logic
      const shadowMap = { 'none': 'shadow-none', 'sm': 'shadow-sm', 'card': 'shadow-md', 'strong': 'shadow-xl' };
      cardClass = cardClass.replace('shadow-sm', ''); // remove default
      cardClass += ` ${shadowMap[shadow as keyof typeof shadowMap] || 'shadow-md'}`;

      // Font Logic
      const fontMap = { 'inter': 'font-sans', 'serif': 'font-serif', 'mono': 'font-mono' };
      textClass = textClass.replace('font-sans', '');
      textClass += ` ${fontMap[font as keyof typeof fontMap] || 'font-sans'}`;

      // Mock data for preview (filtered)
      const visibleItems = (testimonials.length > 0 ? testimonials : [
         { id: '1', clientName: 'Yonas A.', clientRole: 'Marketing', text: 'TrustGrid changed how we do business.', avatarUrl: 'https://ui-avatars.com/api/?name=Yonas+A', score: 5 },
         { id: '2', clientName: 'Sara K.', clientRole: 'CEO', text: 'Best tool for collecting testimonials in Ethiopia.', avatarUrl: 'https://ui-avatars.com/api/?name=Sara+K', score: 5 },
         { id: '3', clientName: 'Dawit M.', clientRole: 'Developer', text: 'Integration was super simple and looks great.', avatarUrl: 'https://ui-avatars.com/api/?name=Dawit+M', score: 4 },
         { id: '4', clientName: 'Abebe B.', clientRole: 'Founder', text: 'Highly recommended for any agency.', avatarUrl: 'https://ui-avatars.com/api/?name=Abebe+B', score: 5 }
      ]).slice(0, widgetConfig.cardsToShow);

      return (
         <div className="animate-fade-in w-full h-full flex flex-col">
            <header className="mb-6 border-b pb-4 flex justify-between items-end">
               <div>
                  <h1 className="text-3xl font-extrabold text-black mb-1 flex items-center gap-2">
                     <Code size={32} /> Widget Studio
                  </h1>
                  <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">
                     Build your perfect wall of love
                  </p>
               </div>
               <Button onClick={handleCopyEmbed} className="bg-black text-white hover:bg-gray-800 shadow-lg">
                  <Code size={16} className="mr-2" /> Get Embed Code
               </Button>
            </header>

            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
               {/* Controls Sidebar */}
               <div className="lg:w-[350px] bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col overflow-hidden h-[calc(100vh-250px)]">
                  {/* Tabs Header */}
                  <div className="flex border-b border-gray-100">
                     {[
                        { id: 'layout', icon: <LayoutGrid size={16} />, label: 'Layout' },
                        { id: 'style', icon: <Palette size={16} />, label: 'Style' },
                        { id: 'content', icon: <Settings size={16} />, label: 'Content' }
                     ].map((tab) => (
                        <button
                           key={tab.id}
                           onClick={() => setConfigTab(tab.id as any)}
                           className={`flex-1 py-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                              configTab === tab.id 
                                 ? 'text-black border-b-2 border-black bg-gray-50' 
                                 : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                           }`}
                        >
                           {tab.icon} {tab.label}
                        </button>
                     ))}
                  </div>

                  {/* Tabs Content - Scrollable */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-8">
                     
                     {/* TAB 1: LAYOUT */}
                     {configTab === 'layout' && (
                        <div className="space-y-6 animate-fade-in">
                           <div className="space-y-3">
                              <label className="text-xs font-bold text-gray-500 uppercase">Display Mode</label>
                              <div className="grid grid-cols-2 gap-3">
                                 {[
                                    { id: 'grid', label: 'Grid Wall', icon: <LayoutGrid size={20} /> },
                                    { id: 'carousel', label: 'Carousel', icon: <Columns size={20} /> },
                                    { id: 'list', label: 'Feed List', icon: <List size={20} /> },
                                    { id: 'popup', label: 'Pop-up', icon: <MessageSquare size={20} /> }
                                 ].map((opt) => (
                                    <button
                                       key={opt.id}
                                       onClick={() => setWidgetConfig({ ...widgetConfig, layout: opt.id as any })}
                                       className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                                          widgetConfig.layout === opt.id 
                                             ? 'border-black bg-black text-white shadow-md' 
                                             : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                       }`}
                                    >
                                       {opt.icon}
                                       <span className="text-xs font-bold">{opt.label}</span>
                                    </button>
                                 ))}
                              </div>
                           </div>

                          {widgetConfig.layout === 'grid' && (
                              <div className="space-y-3">
                                 <label className="text-xs font-bold text-gray-500 uppercase">Grid Columns</label>
                                 <div className="flex gap-2">
                                    {[2, 3, 4].map(cols => (
                                       <button 
                                          key={cols}
                                          onClick={() => setWidgetConfig({...widgetConfig, columns: cols})}
                                          className={`flex-1 py-2 border rounded-lg text-sm font-bold ${
                                             widgetConfig.columns === cols ? 'bg-black text-white border-black' : 'border-gray-200'
                                          }`}
                                       >
                                          {cols}
                                       </button>
                                    ))}
                                 </div>
                              </div>
                           )}

                           <div className="space-y-3">
                                 <label className="text-xs font-bold text-gray-500 uppercase">Spacing (Gap)</label>
                                 <input 
                                    type="range" min="0" max="3" step="1" 
                                    className="w-full accent-black"
                                    onChange={(e) => {
                                       const gaps = ['tight', 'normal', 'loose', 'extra'];
                                       setWidgetConfig({...widgetConfig, gap: gaps[parseInt(e.target.value)]});
                                    }} 
                                 />
                                 <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                                    <span>Tight</span><span>Normal</span><span>Loose</span><span>Extra</span>
                                 </div>
                           </div>
                        </div>
                     )}

                     {/* TAB 2: DESIGN/STYLE */}
                     {configTab === 'style' && (
                        <div className="space-y-6 animate-fade-in">
                           <div className="space-y-3">
                              <label className="text-xs font-bold text-gray-500 uppercase">Theme Preset</label>
                              <select 
                                 value={widgetConfig.theme}
                                 onChange={(e) => setWidgetConfig({...widgetConfig, theme: e.target.value as any})}
                                 className="w-full p-3 rounded-xl border border-gray-200 text-sm font-bold focus:border-black outline-none"
                              >
                                 <option value="modern">Modern (Default)</option>
                                 <option value="dark_mode">Dark Mode</option>
                                 <option value="minimalist">Minimalist White</option>
                                 <option value="brand">Brand Color Highlight</option>
                              </select>
                           </div>

                           <div className="space-y-3">
                              <label className="text-xs font-bold text-gray-500 uppercase">Card Roundness</label>
                              <div className="flex gap-2 bg-gray-50 p-1 rounded-lg">
                                 {['none', 'sm', 'md', 'full'].map(r => (
                                    <button 
                                       key={r}
                                       onClick={() => setWidgetConfig({...widgetConfig, borderRadius: r})}
                                       className={`flex-1 py-2 rounded-md text-xs font-bold capitalize transition-all ${
                                          widgetConfig.borderRadius === r ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-600'
                                       }`}
                                    >
                                       {r}
                                    </button>
                                 ))}
                              </div>
                           </div>

                           <div className="space-y-3">
                              <label className="text-xs font-bold text-gray-500 uppercase">Shadow Intensity</label>
                              <div className="flex gap-2 bg-gray-50 p-1 rounded-lg">
                                 {['none', 'sm', 'card', 'strong'].map(s => (
                                    <button 
                                       key={s}
                                       onClick={() => setWidgetConfig({...widgetConfig, shadow: s})}
                                       className={`flex-1 py-2 rounded-md text-xs font-bold capitalize transition-all ${
                                          widgetConfig.shadow === s ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-600'
                                       }`}
                                    >
                                       {s}
                                    </button>
                                 ))}
                              </div>
                           </div>
                           
                           <div className="space-y-3">
                              <label className="text-xs font-bold text-gray-500 uppercase">Font Family</label>
                              <div className="grid grid-cols-3 gap-2">
                                 <button onClick={()=>setWidgetConfig({...widgetConfig, font: 'inter'})} className={`py-2 border rounded-lg font-sans text-xs ${widgetConfig.font === 'inter' ? 'border-black bg-black text-white':''}`}>Sans</button>
                                 <button onClick={()=>setWidgetConfig({...widgetConfig, font: 'serif'})} className={`py-2 border rounded-lg font-serif text-xs ${widgetConfig.font === 'serif' ? 'border-black bg-black text-white':''}`}>Serif</button>
                                 <button onClick={()=>setWidgetConfig({...widgetConfig, font: 'mono'})} className={`py-2 border rounded-lg font-mono text-xs ${widgetConfig.font === 'mono' ? 'border-black bg-black text-white':''}`}>Mono</button>
                              </div>
                           </div>
                        </div>
                     )}

                     {/* TAB 3: CONTENT */}
                     {configTab === 'content' && (
                        <div className="space-y-6 animate-fade-in">
                           <div className="space-y-3">
                              <label className="text-xs font-bold text-gray-500 uppercase">Widget Title</label>
                              <input 
                                 type="text" 
                                 value={widgetConfig.headerTitle}
                                 onChange={(e) => setWidgetConfig({...widgetConfig, headerTitle: e.target.value})}
                                 className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-black outline-none"
                                 placeholder="e.g. What our clients say"
                              />
                              <p className="text-[10px] text-gray-400">Leave empty to hide header.</p>
                           </div>

                           <div className="bg-gray-50 rounded-xl p-4 space-y-4 border border-gray-100">
                              <label className="flex items-center justify-between cursor-pointer group">
                                 <span className="text-sm font-medium text-gray-700 group-hover:text-black">Show Star Rating</span>
                                 <input 
                                    type="checkbox" 
                                    checked={widgetConfig.showRating}
                                    onChange={(e) => setWidgetConfig({...widgetConfig, showRating: e.target.checked})}
                                    className="w-4 h-4 accent-black" 
                                 />
                              </label>
                              <label className="flex items-center justify-between cursor-pointer group">
                                 <span className="text-sm font-medium text-gray-700 group-hover:text-black">Show Date</span>
                                 <input 
                                    type="checkbox" 
                                    checked={widgetConfig.showDate}
                                    onChange={(e) => setWidgetConfig({...widgetConfig, showDate: e.target.checked})}
                                    className="w-4 h-4 accent-black" 
                                 />
                              </label>
                              <label className="flex items-center justify-between cursor-pointer group">
                                 <span className="text-sm font-medium text-gray-700 group-hover:text-black">Show Avatar</span>
                                 <input 
                                    type="checkbox" 
                                    checked={widgetConfig.showAvatar}
                                    onChange={(e) => setWidgetConfig({...widgetConfig, showAvatar: e.target.checked})}
                                    className="w-4 h-4 accent-black" 
                                 />
                              </label>
                           </div>

                           <div className="space-y-3">
                              <label className="text-xs font-bold text-gray-500 uppercase">Minimum Rating</label>
                              <div className="flex gap-2">
                                 {[1,2,3,4,5].map(star => (
                                    <button
                                       key={star}
                                       onClick={() => setWidgetConfig({...widgetConfig, minRating: star})}
                                       className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                                          widgetConfig.minRating === star ? 'bg-yellow-400 border-yellow-500 text-black' : 'border-gray-200 text-gray-400'
                                       }`}
                                    >
                                       {star}+
                                    </button>
                                 ))}
                              </div>
                           </div>

                           <div className="space-y-3">
                              <label className="text-xs font-bold text-gray-500 uppercase">Max Items</label>
                              <select 
                                 value={widgetConfig.cardsToShow}
                                 onChange={(e) => setWidgetConfig({...widgetConfig, cardsToShow: parseInt(e.target.value)})}
                                 className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-white"
                              >
                                 <option value="3">3 items</option>
                                 <option value="6">6 items</option>
                                 <option value="9">9 items</option>
                                 <option value="12">12 items</option>
                                 <option value="20">20 items</option>
                              </select>
                           </div>
                        </div>
                     )}
                  </div>
               </div>

               {/* Live Preview Panel */}
               <div className="flex-1 bg-gray-100 rounded-2xl p-8 flex flex-col border border-gray-200 shadow-inner overflow-hidden relative">
                  <div className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-500 flex items-center gap-2 border border-white/50 shadow-sm">
                     <Monitor size={12} /> Live Preview
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center">
                     {/* Preview Wrapper */}
                     <div className={`w-full max-w-4xl transition-all duration-300 p-8 ${previewClass} min-h-[400px] rounded-xl relative`}>
                        
                        {/* Header Title Preview */}
                        {widgetConfig.headerTitle && (
                           <div className={`text-center mb-10 ${textClass}`}>
                              <h2 className={`text-2xl font-bold mb-2`}>{widgetConfig.headerTitle}</h2>
                              <div className="w-12 h-1 bg-brand-lime mx-auto rounded-full"></div>
                           </div>
                        )}

                        <div className={`w-full transition-all duration-500 ${
                           layout === 'grid' 
                              ? `grid grid-cols-1 md:grid-cols-${widgetConfig.columns || 3} gap-${widgetConfig.gap === 'tight' ? '2' : widgetConfig.gap === 'loose' ? '8' : '4'}` 
                              : 'flex flex-col gap-4 max-w-xl mx-auto'
                        }`}>
                           {visibleItems.map((item: any) => (
                              <div key={item.id} className={`p-6 transition-all duration-300 flex flex-col h-full ${cardClass} ${layout === 'carousel' ? 'min-w-[300px]' : 'w-full'} hover:-translate-y-1 hover:shadow-lg`}>
                                 <div className="flex justify-between items-start mb-4">
                                    {widgetConfig.showRating && (
                                       <div className="flex gap-0.5 text-yellow-400 text-xs">
                                          {[1,2,3,4,5].map(i => <span key={i}>★</span>)}
                                       </div>
                                    )}
                                    {widgetConfig.showDate && (
                                       <div className={`text-[10px] uppercase font-bold tracking-wider opacity-40 ${textClass}`}>2 days ago</div>
                                    )}
                                 </div>

                                 <p className={`text-sm leading-relaxed mb-6 flex-1 opacity-90 ${textClass}`}>
                                    "{item.text}"
                                 </p>

                                 <div className="flex items-center gap-3 pt-4 border-t border-gray-500/10 mt-auto">
                                    {widgetConfig.showAvatar && (
                                       <img src={item.avatarUrl} className="w-8 h-8 rounded-full object-cover bg-gray-200 border border-gray-100" />
                                    )}
                                    <div>
                                       <p className={`text-xs font-bold ${layout === 'popup' ? 'text-xs' : ''} ${textClass}`}>{item.clientName}</p>
                                       {item.clientRole && <p className={`text-[10px] opacity-60 ${textClass}`}>{item.clientRole}</p>}
                                    </div>
                                    <div className="ml-auto">
                                       <div className="w-5 h-5 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
                                          <CheckCircle2 size={10} />
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      );
   };

   const renderSettings = () => (
      <div className="max-w-2xl mx-auto animate-fade-in pb-20">
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

         {/* Invite Member Modal */}
         {isInviteModalOpen && (
            <InviteMemberModal 
               onClose={() => setIsInviteModalOpen(false)}
               onInvite={handleSendInvite}
            />
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
