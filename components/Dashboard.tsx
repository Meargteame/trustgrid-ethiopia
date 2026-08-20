import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import {
   Plus, Copy, Code, LayoutGrid, Settings,
   CheckCircle2, Clock, Send, Link as LinkIcon,
   Image as ImageIcon, X, Palette, User, Mail, Shield,
   Trash2, LogOut, Check, Loader2, RefreshCw, BarChart3, ExternalLink,
   Share2, Users, Monitor, Layout, Maximize2, Columns, List, MessageSquare, Linkedin
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TestimonialData, TeamMember, WidgetTheme, WidgetLayout } from '../types';
import { VerificationBadge } from './VerificationBadge';
import { AnalyticsTab } from './AnalyticsTab';
import { SettingsTab } from './SettingsTab';
import { FormBuilderTab } from './FormBuilderTab';
import { TrustMeter } from './TrustMeter';
import { SocialShareModal } from './SocialShareModal';
import { EmbedCodeModal } from './EmbedCodeModal';
import { WidgetEmbedModal } from './WidgetEmbedModal';
import { InviteMemberModal } from './InviteMemberModal';

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
   const [activeTab, setActiveTab] = useState<'feed' | 'analytics' | 'widgets' | 'collection' | 'settings'>('feed');
   const [feedTab, setFeedTab] = useState<'inbox' | 'published'>('published');
   const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
   const [setupRequired, setSetupRequired] = useState(false);
   const [isSavingWidget, setIsSavingWidget] = useState(false);
   const [isWidgetEmbedModalOpen, setIsWidgetEmbedModalOpen] = useState(false);
   const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
   const [previewBg, setPreviewBg] = useState<'light' | 'dark' | 'checkered'>('light');

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
      id: '',
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
      fetchWidgetConfig();
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
                 id: data.id,
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
                 id: user.id,
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

   const fetchWidgetConfig = async () => {
      try {
         const { data: { user } } = await supabase.auth.getUser();
         if (!user) return;

         const { data, error } = await supabase
            .from('widget_configs')
            .select('*')
            .eq('user_id', user.id)
            .single();

         if (error && error.code !== 'PGRST116') {
             console.error("Error fetching widget config:", error);
         }

         if (data) {
             setWidgetConfig({
                 layout: data.layout as WidgetLayout,
                 theme: data.theme as WidgetTheme,
                 columns: data.columns,
                 gap: data.gap,
                 borderRadius: data.border_radius,
                 shadow: data.shadow,
                 font: data.font,
                 headerTitle: data.header_title,
                 showRating: data.show_rating,
                 showDate: data.show_date,
                 showAvatar: data.show_avatar,
                 minRating: data.min_rating,
                 cardsToShow: data.cards_to_show,
                 filterTag: 'all' // not in DB right now
             });
         }
      } catch (err) {
         console.warn("Failed to load widget config:", err);
      }
   };

   const saveWidgetConfig = async () => {
      setIsSavingWidget(true);
      try {
         const { data: { user } } = await supabase.auth.getUser();
         if (!user) return;

         const configToSave = {
            user_id: user.id,
            layout: widgetConfig.layout,
            theme: widgetConfig.theme,
            columns: widgetConfig.columns,
            gap: widgetConfig.gap,
            border_radius: widgetConfig.borderRadius,
            shadow: widgetConfig.shadow,
            font: widgetConfig.font,
            header_title: widgetConfig.headerTitle,
            show_rating: widgetConfig.showRating,
            show_date: widgetConfig.showDate,
            show_avatar: widgetConfig.showAvatar,
            min_rating: widgetConfig.minRating,
            cards_to_show: widgetConfig.cardsToShow
         };

         // Upsert based on user_id
         const { error } = await supabase
            .from('widget_configs')
            .upsert(configToSave, { onConflict: 'user_id' });

         if (error) throw error;
         showToast('Widget configuration saved successfully!', 'success');
      } catch (err: any) {
         console.error('Failed to save widget config:', err);
         showToast(`Error saving config: ${err.message}`, 'error');
      } finally {
         setIsSavingWidget(false);
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
            verificationMethod: item.reviewer_telegram_id ? 'telegram' : (item.is_verified ? 'email' : 'manual'),
            reviewerTelegramUsername: item.reviewer_telegram_username,
              socialUrl: item.social_url,
              consentGiven: item.consent_given,
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
      let score = 10; // Base score for account setup
      
      const verified = testimonials.filter(t => t.status === 'published' || t.status === 'verified');
      if (verified.length === 0) return 10;

      // 1. Volume (2 points per review, max 30 points)
      score += Math.min(verified.length * 2, 30);

      // 2. Telegram Verification (20 points per review, max 40 points)
      const telegramCount = verified.filter(t => t.verificationMethod === 'telegram' || t.reviewerTelegramUsername).length;
      score += Math.min(telegramCount * 20, 40);

      // 3. Video Testimonials (10 points per review, max 20 points)
      const videoCount = verified.filter(t => t.videoUrl).length;
      score += Math.min(videoCount * 10, 20);

      return Math.min(100, Math.round(score));
   };

   const handleCopyLink = () => {
      const url = window.location.origin + '/wall/' + (profileData.username || '');
      navigator.clipboard.writeText(url);
      showToast('Public wall link copied to clipboard!');
   };

   const handleCopyEmbed = () => {
      setIsWidgetEmbedModalOpen(true);
   };

   const handleInviteTeam = () => {
      setIsInviteModalOpen(true);
   };
   
   const handleSendInvite = async (email: string, role: string) => {
      // Direct call to Edge Function URL
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`;
      
      try {
         // FORCE REFRESH SESSION to ensure no stale tokens
         const { data: { session }, error: sessionError } = await supabase.auth.getSession();
         
         const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
         
         if (!anonKey) {
             console.error("CRITICAL: VITE_SUPABASE_ANON_KEY is missing from environment variables!");
             showToast('Configuration Error: Internal Anon Key Missing', 'error');
             return;
         }

         let token = session?.access_token || anonKey;

         console.log("Attempt 1: Using token type:", session ? "User Session" : "Anon Key");
         
         let res = await fetch(functionUrl, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`,
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

         // RETRY LOGIC: If 401/Invalid JWT with user token, try Anon Key
         if (res.status === 401 && session) {
             console.warn("Session token rejected. Retrying with Anon Key...");
             token = anonKey;
             res = await fetch(functionUrl, {
                method: 'POST',
                headers: {
                   'Content-Type': 'application/json',
                   'Authorization': `Bearer ${token}`,
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
         }


         const responseData = await res.json();
         console.log("Function Response:", responseData); // DEBUG

         if (!res.ok) {
            console.error('Email send error:', responseData);
            // Specific handling for common Resend issues
            const errMsg = responseData.message || (responseData.error && responseData.error.message) || JSON.stringify(responseData.error) || 'Unknown Error';
            if (errMsg.includes('resend_api_key')) {
                showToast('Configuration Error: Invalid Resend API Key in Supabase Secrets.', 'error');
            } else if (errMsg.includes('rate_limit')) {
                showToast('Rate Limited: Please wait 1 minute before sending again.', 'error');
            } else {
                showToast('Failed: ' + errMsg, 'error');
            }
         } else {
            showToast(`Invitation sent! ID: ${responseData.id}`);
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

   const handleApprove = async (id: string) => {
      try {
         showToast('Verifying and publishing...', 'success');
         
         const testimonial = testimonials.find(t => t.id === id);

         // Update DB
         const { error } = await supabase
            .from('testimonials')
            .update({ 
                status: 'verified', 
                is_verified: true
            })
            .eq('id', id);

         if (error) throw error;

         // Optimistic Update
         setTestimonials(testimonials.map(t => 
             t.id === id ? { 
                 ...t, 
                 status: 'verified'
             } : t
         ));
         
         showToast('Proof verified and published!');
      } catch (err: any) {
         console.error(err);
         showToast('Failed to verify proof', 'error');
         if (err.message?.includes('policies')) setSetupRequired(true);
      }
   };



   const handleReject = async (id: string) => {
      if (!window.confirm("Are you sure you want to reject and delete this testimonial? This cannot be undone.")) return;
       
      try {
          const { error } = await supabase
              .from('testimonials')
              .delete()
              .eq('id', id);

          if (error) throw error;

          // Remove from list
          setTestimonials(testimonials.filter(t => t.id !== id));
          
          showToast('Testimonial deleted.');
      } catch (err: any) {
          console.error("Reject failed:", err);
          showToast('Failed to reject testimonial', 'error');
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

   // TODO: LinkedIn import is not implemented. No LinkedIn API integration exists.
   // This function previously faked data with a setTimeout. Replaced with honest 'coming soon' message.
   const handleSimulateFetch = () => {
      showToast('LinkedIn import is coming soon! For now, add testimonials manually or via the collection page.', 'error');
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

         // 3. Prepare Payload
         const payload = {
            user_id: user.id,
            name: formData.name,
            text: formData.text,
            avatar_url: avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`,
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
             const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`;
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






   const filteredTestimonials = testimonials.filter(t => {
      if (feedTab === 'inbox') {
         return t.status === 'pending' || t.status === 'pending_verification';
      }
      return t.status === 'verified';
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
                  <button
                     onClick={() => setFeedTab('published')}
                     className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${feedTab === 'published' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}
                  >
                     Published
                  </button>
                  <button
                     onClick={() => setFeedTab('inbox')}
                     className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${feedTab === 'inbox' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}
                  >
                     Inbox (Pending)
                     {testimonials.filter(t => t.status === 'pending' || t.status === 'pending_verification').length > 0 && (
                        <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">
                           {testimonials.filter(t => t.status === 'pending' || t.status === 'pending_verification').length}
                        </span>
                     )}
                  </button>
               </div>
               <Button onClick={() => {
                     if (!profileData.username) {
                         showToast('Please set your Username in Settings first!', 'error');
                         setActiveTab('settings');
                         return;
                     }
                     const url = window.location.origin + '/collect/' + profileData.username;
                     navigator.clipboard.writeText(url);
                      showToast('Collection link copied!', 'success');
                  }} className="shadow-sm hover:shadow-md">
                     <LinkIcon size={18} className="mr-2" /> Get Proofs
                  </Button>
            </div>
         </header>

         {/* Trust Meter (Gamification) */}
         <TrustMeter score={calculateTrustScore()} />



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
                     You don't have any proofs yet. Add a testimonial manually or share your collection page link with clients.
                  </p>
                  <div className="flex justify-center w-full">
                       <Button onClick={() => {
                          if (!profileData.username) {
                              showToast('Please set your Username in Settings first!', 'error');
                              setActiveTab('settings');
                              return;
                          }
                          const url = window.location.origin + '/collect/' + profileData.username;
                          navigator.clipboard.writeText(url);
                          showToast('Collection link copied!', 'success');
                       }}>
                          <Copy size={16} className="mr-2" /> Copy Collection Link
                       </Button>
                    </div>
               </div>
            ) : (
               <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <Shield className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-bold text-gray-900">
                     {feedTab === 'inbox' ? 'No pending proofs' : 'No published proofs'}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                     {feedTab === 'inbox' ? 'All caught up! Check your published proofs.' : 'Approve pending proofs to see them here.'}
                  </p>
                  <Button 
                     variant="outline" 
                     onClick={() => setFeedTab(feedTab === 'inbox' ? 'published' : 'inbox')}
                  >
                     Switch to {feedTab === 'inbox' ? 'Published' : 'Inbox'}
                  </Button>
               </div>
            )
         ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">

               {filteredTestimonials.map((t) => (
                  <div key={t.id} className={`break-inside-avoid border-2 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 group relative ${getCardStyle(t)}`}>

                     {/* Actions Dropdown (Hover) */}
                     <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-20">
                        
                        {/* PENDING ACTIONS */}
                        {t.status === 'pending' || t.status === 'pending_verification' ? (
                           <>
                              <button
                                 onClick={() => handleApprove(t.id)}
                                 className="p-1.5 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors shadow-sm"
                                 title="Approve & Analyze"
                              >
                                 <CheckCircle2 size={16} />
                              </button>
                              <button
                                 onClick={() => handleReject(t.id)}
                                 className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors shadow-sm"
                                 title="Reject"
                              >
                                 <X size={16} />
                              </button>
                           </>
                        ) : (
                           /* VERIFIED ACTIONS */
                           <>
                              <button
                                 onClick={() => setShareModalData(t)}
                                 className={`p-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors ${t.cardStyle === 'dark' ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-400'}`}
                                 title="Share to Social"
                              >
                                 <Share2 size={16} />
                              </button>
                              
                              <button
                                 onClick={() => setEmbedModalId(t.id)}
                                 className={`p-1.5 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-colors ${t.cardStyle === 'dark' ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-400'}`}
                                 title="Embed on Website"
                              >
                                 <Code size={16} />
                              </button>

                              <button
                                 onClick={() => handleDelete(t.id)}
                                 className={`p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors ${t.cardStyle === 'dark' ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-400'}`}
                                 title="Delete"
                              >
                                 <Trash2 size={16} />
                              </button>
                           </>
                        )}
                     </div>

                     {/* Status Badge */}
                     <div className="flex justify-between items-start mb-4">
                        <VerificationBadge method={t.verificationMethod} />
                        {t.score && t.status === 'verified' && (
                           <div className="bg-black/5 px-2 py-1 rounded text-[10px] font-bold">
                              Trust Score: {t.score}
                           </div>
                        )}
                     </div>

                     {/* Video Player (Mock Supported) */}
                     {t.videoUrl && t.videoUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                        <div className="mb-4 rounded-xl overflow-hidden bg-black aspect-video relative group/video">
                           <video 
                              src={t.videoUrl} 
                              controls 
                              className="w-full h-full object-cover"
                           />
                        </div>
                     ) : t.videoUrl && (
                        /* Handle simple links or non-video URLs appropriately */
                        <div className="mb-4 bg-gray-100 rounded-xl p-3 flex items-center gap-2">
                           <ExternalLink size={16} />
                           <a href={t.videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline truncate block">{t.videoUrl}</a>
                        </div>
                     )}

                     {/* Text Content */}
                     <p className={`text-sm leading-relaxed mb-6 font-medium break-words whitespace-pre-wrap ${t.cardStyle === 'dark' ? 'text-gray-200' : 'text-gray-800'} ${/[\u1200-\u137F]/.test(t.text) ? 'font-ethiopic' : ''}`}>
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
                              <p className={`text-xs font-bold flex items-center gap-1 ${t.cardStyle === 'dark' ? 'text-white' : 'text-black'}`}>
                                  {t.clientName}
                                  {t.socialUrl && (
                                     <a href={t.socialUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600" title="Social Profile">
                                        <LinkIcon size={12} />
                                     </a>
                                  )}
                                </p>
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
      const { theme, layout, borderRadius, shadow, font, columns, gap, showRating, showDate, showAvatar, headerTitle } = widgetConfig;
      
      // Theme Classes
      let cardBgClass = "bg-white text-gray-900 border-gray-200";
      let cardTextClass = "text-gray-900";
      let cardSubtextClass = "text-gray-500";
      let cardQuoteClass = "text-gray-700";
      let badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";

      if (theme === 'dark_mode') {
         cardBgClass = "bg-gray-900 text-white border-gray-800";
         cardTextClass = "text-white";
         cardSubtextClass = "text-gray-400";
         cardQuoteClass = "text-gray-200";
         badgeStyle = "bg-emerald-950/60 text-emerald-300 border-emerald-800/60";
      } else if (theme === 'minimalist') {
         cardBgClass = "bg-white/40 backdrop-blur-md text-gray-900 border-white/50";
         cardTextClass = "text-gray-900";
         cardSubtextClass = "text-gray-600";
         cardQuoteClass = "text-gray-800";
         badgeStyle = "bg-emerald-500/10 text-emerald-800 border-emerald-500/20";
      } else if (theme === 'brand') {
         cardBgClass = "bg-white text-black border-2 border-brand-lime shadow-brutal";
         cardTextClass = "text-black";
         cardSubtextClass = "text-gray-700";
         cardQuoteClass = "text-gray-900";
         badgeStyle = "bg-brand-lime text-black border-black";
      }

      // Radius Classes
      const radiusMap: Record<string, string> = {
         'none': 'rounded-none',
         'sm': 'rounded-lg',
         'md': 'rounded-2xl',
         'full': 'rounded-3xl'
      };
      const activeRadius = radiusMap[borderRadius] || 'rounded-2xl';

      // Shadow Classes
      const shadowMap: Record<string, string> = {
         'none': 'shadow-none',
         'sm': 'shadow-sm',
         'card': 'shadow-md',
         'strong': 'shadow-xl'
      };
      const activeShadow = shadowMap[shadow] || 'shadow-md';

      // Font Classes
      const fontMap: Record<string, string> = {
         'inter': 'font-sans',
         'serif': 'font-serif',
         'mono': 'font-mono'
      };
      const activeFont = fontMap[font] || 'font-sans';

      // Gap Classes
      let gapSpacing = 'gap-5';
      if (gap === 'tight') gapSpacing = 'gap-3';
      if (gap === 'loose') gapSpacing = 'gap-6';
      if (gap === 'extra') gapSpacing = 'gap-8';

      // Layout Container
      let gridColsClass = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
      if (columns === 1) gridColsClass = 'grid-cols-1 max-w-xl mx-auto';
      if (columns === 2) gridColsClass = 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto';
      if (columns === 4) gridColsClass = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

      // Mock or Real items for live preview
      const visibleItems = (testimonials.length > 0 ? testimonials : [
         { 
            id: '1', 
            clientName: 'Yonas Alemayehu', 
            clientCompany: 'Tech Lead at AddisHub', 
            text: 'TrustGrid made collecting and showing off real client feedback effortless. Our conversion rate jumped significantly!', 
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 
            score: 5,
            verificationMethod: 'telegram',
            reviewerTelegramUsername: 'yonas_tech',
            createdAt: new Date().toISOString()
         },
         { 
            id: '2', 
            clientName: 'Sara Kifle', 
            clientCompany: 'Founder, BlueNile Studio', 
            text: 'Being able to verify that our clients are real Telegram users has eliminated fake reviews completely. Super clean UI!', 
            avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', 
            score: 5,
            verificationMethod: 'telegram',
            reviewerTelegramUsername: 'sara_k',
            createdAt: new Date().toISOString()
         },
         { 
            id: '3', 
            clientName: 'Dawit Mengistu', 
            clientCompany: 'Product Manager', 
            text: 'Embedded the widget on our Webflow site in 30 seconds. Seamless and looks stunning on both mobile and desktop.', 
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 
            score: 5,
            verificationMethod: 'linkedin',
            createdAt: new Date().toISOString()
         }
      ]).slice(0, widgetConfig.cardsToShow || 6);

      // Canvas background class
      let canvasBg = 'bg-gray-100';
      if (previewBg === 'dark') canvasBg = 'bg-gray-950';
      if (previewBg === 'checkered') canvasBg = 'bg-stone-200 [background-image:radial-gradient(#9ca3af_1px,transparent_1px)] [background-size:16px_16px]';

      // Device frame max-width
      let deviceWidth = 'w-full max-w-5xl';
      if (previewDevice === 'tablet') deviceWidth = 'w-full max-w-[720px]';
      if (previewDevice === 'mobile') deviceWidth = 'w-full max-w-[390px]';

      return (
         <div className="animate-fade-in w-full h-full flex flex-col space-y-6">
            {/* Studio Header */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
               <div>
                  <div className="flex items-center gap-2 mb-1">
                     <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-black text-white">
                        Studio 2.0
                     </span>
                     <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        Widget Studio
                     </h1>
                  </div>
                  <p className="text-gray-500 text-xs font-medium">
                     Customize, preview, and embed your verified wall of love onto any website
                  </p>
               </div>
               
               <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Button 
                     onClick={saveWidgetConfig} 
                     disabled={isSavingWidget} 
                     variant="outline" 
                     className="flex-1 sm:flex-initial border-gray-200 hover:bg-gray-50 font-bold"
                  >
                     {isSavingWidget ? <Loader2 size={16} className="animate-spin mr-2" /> : <Settings size={16} className="mr-2" />}
                     {isSavingWidget ? 'Saving...' : 'Save Preset'}
                  </Button>
                  <Button 
                     onClick={handleCopyEmbed} 
                     className="flex-1 sm:flex-initial bg-black text-white hover:bg-gray-900 shadow-lg font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                     <Code size={16} className="mr-2 text-brand-lime" /> Get Embed Code
                  </Button>
               </div>
            </header>

            {/* Split-Pane Studio */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
               
               {/* LEFT PANE: Controls Sidebar */}
               <div className="xl:col-span-4 bg-white border border-gray-200 rounded-3xl shadow-sm flex flex-col overflow-hidden">
                  
                  {/* Category Tabs */}
                  <div className="flex border-b border-gray-100 bg-gray-50/70 p-1.5">
                     {[
                        { id: 'layout', icon: <LayoutGrid size={15} />, label: 'Layout' },
                        { id: 'style', icon: <Palette size={15} />, label: 'Style & Theme' },
                        { id: 'content', icon: <Settings size={15} />, label: 'Content' }
                     ].map((tab) => (
                        <button
                           key={tab.id}
                           onClick={() => setConfigTab(tab.id as any)}
                           className={`flex-1 py-2.5 px-3 rounded-2xl flex items-center justify-center gap-1.5 text-xs font-extrabold transition-all ${
                              configTab === tab.id 
                                 ? 'bg-white text-black shadow-sm border border-gray-200/60' 
                                 : 'text-gray-400 hover:text-gray-700'
                           }`}
                        >
                           {tab.icon} {tab.label}
                        </button>
                     ))}
                  </div>

                  {/* Tab Body */}
                  <div className="p-6 space-y-6 max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar">
                     
                     {/* TAB 1: LAYOUT */}
                     {configTab === 'layout' && (
                        <div className="space-y-6 animate-fade-in">
                           {/* Display Mode */}
                           <div className="space-y-2.5">
                              <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
                                 Display Mode
                              </label>
                              <div className="grid grid-cols-3 gap-2.5">
                                 {[
                                    { id: 'grid', label: 'Grid Wall', icon: <LayoutGrid size={18} /> },
                                    { id: 'carousel', label: 'Slider Row', icon: <Columns size={18} /> },
                                    { id: 'feed', label: 'Single Feed', icon: <List size={18} /> }
                                 ].map((opt) => (
                                    <button
                                       key={opt.id}
                                       onClick={() => setWidgetConfig({ ...widgetConfig, layout: opt.id as any })}
                                       className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all ${
                                          widgetConfig.layout === opt.id 
                                             ? 'border-black bg-black text-white shadow-md' 
                                             : 'border-gray-100 hover:border-gray-300 text-gray-600 bg-gray-50/50'
                                       }`}
                                    >
                                       {opt.icon}
                                       <span className="text-[11px] font-bold">{opt.label}</span>
                                    </button>
                                 ))}
                              </div>
                           </div>

                           {/* Columns (only for Grid) */}
                           {widgetConfig.layout === 'grid' && (
                              <div className="space-y-2.5">
                                 <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
                                    Desktop Columns
                                 </label>
                                 <div className="grid grid-cols-4 gap-2 bg-gray-100 p-1.5 rounded-2xl">
                                    {[1, 2, 3, 4].map(cols => (
                                       <button 
                                          key={cols}
                                          onClick={() => setWidgetConfig({...widgetConfig, columns: cols})}
                                          className={`py-2 rounded-xl text-xs font-black transition-all ${
                                             widgetConfig.columns === cols 
                                                ? 'bg-white text-black shadow-sm' 
                                                : 'text-gray-400 hover:text-gray-700'
                                          }`}
                                       >
                                          {cols} {cols === 1 ? 'Col' : 'Cols'}
                                       </button>
                                    ))}
                                 </div>
                              </div>
                           )}

                           {/* Card Spacing (Gap) */}
                           <div className="space-y-2.5">
                              <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
                                 Card Spacing
                              </label>
                              <div className="grid grid-cols-4 gap-2 bg-gray-100 p-1.5 rounded-2xl">
                                 {[
                                    { id: 'tight', label: 'Compact' },
                                    { id: 'normal', label: 'Normal' },
                                    { id: 'loose', label: 'Relaxed' },
                                    { id: 'extra', label: 'Spacious' }
                                 ].map(g => (
                                    <button 
                                       key={g.id}
                                       onClick={() => setWidgetConfig({...widgetConfig, gap: g.id})}
                                       className={`py-2 rounded-xl text-[11px] font-bold transition-all ${
                                          widgetConfig.gap === g.id 
                                             ? 'bg-white text-black shadow-sm' 
                                             : 'text-gray-400 hover:text-gray-700'
                                       }`}
                                    >
                                       {g.label}
                                    </button>
                                 ))}
                              </div>
                           </div>

                           {/* Maximum items */}
                           <div className="space-y-2.5">
                              <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
                                 Maximum Reviews to Show
                              </label>
                              <select 
                                 value={widgetConfig.cardsToShow}
                                 onChange={(e) => setWidgetConfig({...widgetConfig, cardsToShow: parseInt(e.target.value)})}
                                 className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-800 outline-none focus:border-black"
                              >
                                 <option value="3">Show 3 reviews</option>
                                 <option value="6">Show 6 reviews</option>
                                 <option value="9">Show 9 reviews</option>
                                 <option value="12">Show 12 reviews</option>
                                 <option value="24">Show 24 reviews</option>
                              </select>
                           </div>
                        </div>
                     )}

                     {/* TAB 2: STYLE & THEME */}
                     {configTab === 'style' && (
                        <div className="space-y-6 animate-fade-in">
                           {/* Theme Presets */}
                           <div className="space-y-2.5">
                              <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
                                 Theme Preset
                              </label>
                              <div className="grid grid-cols-2 gap-2.5">
                                 {[
                                    { id: 'modern', label: 'Clean Light', bg: 'bg-white', border: 'border-gray-200', text: 'text-gray-900' },
                                    { id: 'dark_mode', label: 'Cyber Dark', bg: 'bg-gray-950', border: 'border-gray-800', text: 'text-white' },
                                    { id: 'minimalist', label: 'Glass Frosted', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-950' },
                                    { id: 'brand', label: 'Neo-Brutalist', bg: 'bg-brand-lime/20', border: 'border-brand-lime', text: 'text-black' }
                                 ].map(thm => (
                                    <button
                                       key={thm.id}
                                       onClick={() => setWidgetConfig({...widgetConfig, theme: thm.id as any})}
                                       className={`p-3 rounded-2xl border-2 flex items-center gap-2.5 transition-all text-left ${
                                          widgetConfig.theme === thm.id
                                             ? 'border-black bg-gray-50 shadow-sm'
                                             : 'border-gray-100 hover:border-gray-200 bg-white'
                                       }`}
                                    >
                                       <span className={`w-5 h-5 rounded-full ${thm.bg} border ${thm.border} flex-shrink-0 shadow-inner`} />
                                       <span className="text-xs font-bold text-gray-900">{thm.label}</span>
                                    </button>
                                 ))}
                              </div>
                           </div>

                           {/* Card Roundness */}
                           <div className="space-y-2.5">
                              <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
                                 Corner Roundness
                              </label>
                              <div className="grid grid-cols-4 gap-2 bg-gray-100 p-1.5 rounded-2xl">
                                 {[
                                    { id: 'none', label: 'Sharp' },
                                    { id: 'sm', label: 'Subtle' },
                                    { id: 'md', label: 'Rounded' },
                                    { id: 'full', label: 'Pill' }
                                 ].map(r => (
                                    <button 
                                       key={r.id}
                                       onClick={() => setWidgetConfig({...widgetConfig, borderRadius: r.id})}
                                       className={`py-2 rounded-xl text-xs font-bold transition-all ${
                                          widgetConfig.borderRadius === r.id 
                                             ? 'bg-white text-black shadow-sm' 
                                             : 'text-gray-400 hover:text-gray-700'
                                       }`}
                                    >
                                       {r.label}
                                    </button>
                                 ))}
                              </div>
                           </div>

                           {/* Shadow Intensity */}
                           <div className="space-y-2.5">
                              <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
                                 Shadow & Depth
                              </label>
                              <div className="grid grid-cols-4 gap-2 bg-gray-100 p-1.5 rounded-2xl">
                                 {[
                                    { id: 'none', label: 'Flat' },
                                    { id: 'sm', label: 'Soft' },
                                    { id: 'card', label: 'Elevated' },
                                    { id: 'strong', label: 'Deep' }
                                 ].map(s => (
                                    <button 
                                       key={s.id}
                                       onClick={() => setWidgetConfig({...widgetConfig, shadow: s.id})}
                                       className={`py-2 rounded-xl text-xs font-bold transition-all ${
                                          widgetConfig.shadow === s.id 
                                             ? 'bg-white text-black shadow-sm' 
                                             : 'text-gray-400 hover:text-gray-700'
                                       }`}
                                    >
                                       {s.label}
                                    </button>
                                 ))}
                              </div>
                           </div>

                           {/* Typography */}
                           <div className="space-y-2.5">
                              <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
                                 Font Style
                              </label>
                              <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1.5 rounded-2xl">
                                 <button 
                                    onClick={() => setWidgetConfig({...widgetConfig, font: 'inter'})} 
                                    className={`py-2 rounded-xl font-sans text-xs font-bold transition-all ${widgetConfig.font === 'inter' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}
                                 >
                                    Modern Sans
                                 </button>
                                 <button 
                                    onClick={() => setWidgetConfig({...widgetConfig, font: 'serif'})} 
                                    className={`py-2 rounded-xl font-serif text-xs font-bold transition-all ${widgetConfig.font === 'serif' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}
                                 >
                                    Editorial Serif
                                 </button>
                                 <button 
                                    onClick={() => setWidgetConfig({...widgetConfig, font: 'mono'})} 
                                    className={`py-2 rounded-xl font-mono text-xs font-bold transition-all ${widgetConfig.font === 'mono' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}
                                 >
                                    Code Mono
                                 </button>
                              </div>
                           </div>
                        </div>
                     )}

                     {/* TAB 3: CONTENT & TOGGLES */}
                     {configTab === 'content' && (
                        <div className="space-y-6 animate-fade-in">
                           {/* Widget Header Title */}
                           <div className="space-y-2.5">
                              <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
                                 Widget Section Title
                              </label>
                              <input 
                                 type="text" 
                                 value={widgetConfig.headerTitle}
                                 onChange={(e) => setWidgetConfig({...widgetConfig, headerTitle: e.target.value})}
                                 className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-800 outline-none focus:border-black"
                                 placeholder="e.g. What Our Clients Say"
                              />
                           </div>

                           {/* Toggle Switches */}
                           <div className="space-y-2.5">
                              <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
                                 Card Elements
                              </label>
                              <div className="bg-gray-50 rounded-2xl p-4 space-y-3.5 border border-gray-100">
                                 <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-xs font-bold text-gray-700">Show 5-Star Ratings</span>
                                    <input 
                                       type="checkbox" 
                                       checked={widgetConfig.showRating}
                                       onChange={(e) => setWidgetConfig({...widgetConfig, showRating: e.target.checked})}
                                       className="w-4 h-4 rounded text-black accent-black cursor-pointer" 
                                    />
                                 </label>
                                 <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-xs font-bold text-gray-700">Show Review Date</span>
                                    <input 
                                       type="checkbox" 
                                       checked={widgetConfig.showDate}
                                       onChange={(e) => setWidgetConfig({...widgetConfig, showDate: e.target.checked})}
                                       className="w-4 h-4 rounded text-black accent-black cursor-pointer" 
                                    />
                                 </label>
                                 <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-xs font-bold text-gray-700">Show Client Photo Avatar</span>
                                    <input 
                                       type="checkbox" 
                                       checked={widgetConfig.showAvatar}
                                       onChange={(e) => setWidgetConfig({...widgetConfig, showAvatar: e.target.checked})}
                                       className="w-4 h-4 rounded text-black accent-black cursor-pointer" 
                                    />
                                 </label>
                              </div>
                           </div>
                        </div>
                     )}
                  </div>
               </div>

               {/* RIGHT PANE: Interactive Live Studio Canvas */}
               <div className="xl:col-span-8 flex flex-col space-y-4">
                  
                  {/* Canvas Viewport Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-200 shadow-sm">
                     {/* Responsive Device Toggles */}
                     <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                        <button
                           onClick={() => setPreviewDevice('desktop')}
                           className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                              previewDevice === 'desktop' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-700'
                           }`}
                        >
                           <Monitor size={14} /> Desktop
                        </button>
                        <button
                           onClick={() => setPreviewDevice('tablet')}
                           className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                              previewDevice === 'tablet' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-700'
                           }`}
                        >
                           <Layout size={14} /> Tablet
                        </button>
                        <button
                           onClick={() => setPreviewDevice('mobile')}
                           className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                              previewDevice === 'mobile' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-700'
                           }`}
                        >
                           <MessageSquare size={14} /> Mobile
                        </button>
                     </div>

                     {/* Canvas Background Simulation */}
                     <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-gray-400 mr-1">Preview Surface:</span>
                        <button
                           onClick={() => setPreviewBg('light')}
                           className={`w-7 h-7 rounded-lg border-2 bg-white flex items-center justify-center transition-all ${previewBg === 'light' ? 'border-black scale-110 shadow-sm' : 'border-gray-200'}`}
                           title="Light Surface"
                        />
                        <button
                           onClick={() => setPreviewBg('dark')}
                           className={`w-7 h-7 rounded-lg border-2 bg-gray-950 flex items-center justify-center transition-all ${previewBg === 'dark' ? 'border-black scale-110 shadow-sm' : 'border-gray-300'}`}
                           title="Dark Surface"
                        />
                        <button
                           onClick={() => setPreviewBg('checkered')}
                           className={`w-7 h-7 rounded-lg border-2 bg-stone-200 flex items-center justify-center transition-all ${previewBg === 'checkered' ? 'border-black scale-110 shadow-sm' : 'border-gray-300'}`}
                           title="Transparent Checkered"
                        />
                     </div>
                  </div>

                  {/* Browser Window Simulation */}
                  <div className={`rounded-3xl border border-gray-200/80 shadow-md overflow-hidden flex flex-col ${canvasBg} transition-colors duration-300 min-h-[520px]`}>
                     {/* Window Header */}
                     <div className="bg-white/90 backdrop-blur-md px-4 py-3 border-b border-gray-200/60 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                           <div className="w-3 h-3 rounded-full bg-red-400/80" />
                           <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                           <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                        </div>
                        <div className="bg-gray-100 px-4 py-1 rounded-full text-[11px] font-mono text-gray-500 max-w-xs w-full text-center truncate border border-gray-200/50">
                           https://yourwebsite.com/client-reviews
                        </div>
                        <div className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                           LIVE PREVIEW
                        </div>
                     </div>

                     {/* Live Canvas Viewport */}
                     <div className="flex-1 p-6 sm:p-10 flex flex-col items-center justify-center overflow-x-auto">
                        <div className={`${deviceWidth} transition-all duration-300 ${activeFont}`}>
                           
                           {/* Optional Header Title */}
                           {headerTitle && (
                              <div className="text-center mb-8">
                                 <h2 className={`text-2xl sm:text-3xl font-black tracking-tight mb-2 ${previewBg === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {headerTitle}
                                 </h2>
                                 <div className="w-12 h-1 bg-brand-lime mx-auto rounded-full" />
                              </div>
                           )}

                           {/* Dynamic Testimonial Grid / Carousel / Feed */}
                           <div className={`w-full transition-all duration-300 ${
                              layout === 'grid' 
                                 ? `grid ${gridColsClass} ${gapSpacing}` 
                                 : layout === 'carousel'
                                    ? `flex overflow-x-auto pb-4 ${gapSpacing} snap-x snap-mandatory scrollbar-none`
                                    : `flex flex-col ${gapSpacing} max-w-xl mx-auto`
                           }`}>
                              {visibleItems.map((item: any) => (
                                 <div 
                                    key={item.id} 
                                    className={`p-5 sm:p-6 transition-all duration-300 flex flex-col h-full border ${cardBgClass} ${activeRadius} ${activeShadow} ${
                                       layout === 'carousel' ? 'min-w-[280px] sm:min-w-[320px] snap-start flex-shrink-0' : 'w-full'
                                    } hover:-translate-y-1 hover:shadow-lg`}
                                 >
                                    {/* Star Rating & Date */}
                                    <div className="flex justify-between items-start mb-3 gap-2">
                                       {showRating && (
                                          <div className="flex gap-1 text-amber-400 text-sm">
                                             {[1,2,3,4,5].map(i => (
                                                <span key={i} className="text-amber-400">★</span>
                                             ))}
                                          </div>
                                       )}
                                       {showDate && (
                                          <div className={`text-[11px] font-medium opacity-50 ${cardSubtextClass}`}>
                                             {item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Verified Proof'}
                                          </div>
                                       )}
                                    </div>

                                    {/* Review Text */}
                                    <p className={`text-sm sm:text-base leading-relaxed mb-5 flex-1 break-words whitespace-pre-wrap ${cardQuoteClass}`}>
                                       "{item.text}"
                                    </p>

                                    {/* Reviewer Profile & Badges */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-500/10 mt-auto gap-2">
                                       <div className="flex items-center gap-3 min-w-0">
                                          {showAvatar && (
                                             <img 
                                                src={item.avatarUrl} 
                                                className="w-9 h-9 rounded-full object-cover bg-gray-200 border border-gray-100 flex-shrink-0" 
                                                alt={item.clientName}
                                             />
                                          )}
                                          <div className="min-w-0">
                                             <p className={`text-xs sm:text-sm font-bold truncate ${cardTextClass}`}>
                                                {item.clientName}
                                             </p>
                                             {item.clientCompany && (
                                                <p className={`text-[11px] opacity-70 truncate ${cardSubtextClass}`}>
                                                   {item.clientCompany}
                                                </p>
                                             )}
                                          </div>
                                       </div>

                                       {item.verificationMethod && item.verificationMethod !== 'manual' && (
                                          <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${badgeStyle} flex-shrink-0`}>
                                             <CheckCircle2 size={11} />
                                             {item.verificationMethod === 'telegram' ? 'Telegram' : 'LinkedIn'}
                                          </span>
                                       )}
                                    </div>
                                 </div>
                              ))}
                           </div>

                           {/* Subtle watermark */}
                           <div className="text-center mt-6">
                              <span className="text-[11px] font-medium text-gray-400 inline-flex items-center gap-1">
                                 Verified by <strong className={previewBg === 'dark' ? 'text-white' : 'text-black'}>TrustGrid.et</strong>
                              </span>
                           </div>

                        </div>
                     </div>
                  </div>
               </div>

            </div>
         </div>
      );
   };

   const renderSettings = () => (
      <SettingsTab onProfileUpdate={fetchProfile} />
   );

   const renderContent = () => {
      switch (activeTab) {
         case 'feed': return renderFeed();
         case 'collection': return <FormBuilderTab userId={profileData.id} />;
         case 'analytics': return <AnalyticsTab />;
         case 'widgets': return renderWidgetLab();
         case 'settings': return renderSettings();
         default: return renderFeed();
      }
   }

   return (
      <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans relative">
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

         {/* Widget Embed Publishing Modal */}
         {isWidgetEmbedModalOpen && (
            <WidgetEmbedModal
               username={profileData.username || ''}
               config={{
                  theme: widgetConfig.theme,
                  layout: widgetConfig.layout,
                  showRating: widgetConfig.showRating,
                  showDate: widgetConfig.showDate,
                  showAvatar: widgetConfig.showAvatar,
                  borderRadius: widgetConfig.borderRadius,
                  shadow: widgetConfig.shadow,
                  font: widgetConfig.font,
                  columns: widgetConfig.columns,
                  gap: widgetConfig.gap,
                  headerTitle: widgetConfig.headerTitle
               }}
               onClose={() => setIsWidgetEmbedModalOpen(false)}
            />
         )}

           {/* Onboarding Modal */}
           {!loadingProfile && !profileData.username && activeTab !== 'settings' && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                 <div className="bg-white rounded-3xl border border-gray-200 w-full max-w-md shadow-2xl overflow-hidden flex flex-col p-8 text-center">
                    <div className="w-16 h-16 bg-[#D4F954]/30 border border-black/10 text-black rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <User size={28} />
                    </div>
                    <h2 className="text-2xl font-extrabold mb-2 text-black">Welcome to TrustGrid!</h2>
                    <p className="text-gray-500 text-sm mb-6 leading-relaxed">Before you can start collecting verified testimonials, you need to claim your unique public username.</p>
                    <Button onClick={() => setActiveTab('settings')} className="w-full shadow-sm hover:bg-gray-800 transition-all font-bold">
                        Set Username Now
                    </Button>
                 </div>
              </div>
           )}


         {/* Sidebar */}
         <aside className="w-full md:w-80 bg-white border-r border-gray-200 p-6 flex flex-col fixed md:sticky top-0 h-auto md:h-screen z-20 overflow-y-auto">
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
                     
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 group hover:border-black transition-colors">
                     <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-gray-500 uppercase">Your Public Wall</p>
                        <a 
                           href={`/wall/${profileData.username || ''}`}
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                           title="Open Public Wall"
                        >
                           Visit <ExternalLink size={10} />
                        </a>
                     </div>
                     <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 mb-2">
                        <LinkIcon size={14} className="text-gray-400" />
                        <span className="text-xs truncate flex-1 text-gray-600 font-mono">
                           trustgrid.pro/wall/{profileData.username || 'your-handle'}
                        </span>
                     </div>
                     <Button size="sm" fullWidth variant="secondary" onClick={() => {
                        const url = window.location.origin + '/wall/' + (profileData.username || '');
                        navigator.clipboard.writeText(url);
                        showToast('Public Wall link copied to clipboard!', 'success');
                     }} className="text-xs h-8">
                        <Copy size={12} className="mr-2" /> Copy Wall Link
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
                  onClick={() => setActiveTab('collection')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'collection' ? 'bg-black text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}
               >
                  <Send size={18} /> Collection Form
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

            <Button variant="ghost" onClick={onLogout} className="mt-auto justify-start px-4 text-gray-500 hover:text-gray-800 hover:bg-gray-100">
               <LogOut size={18} className="mr-2" /> Log Out
            </Button>
         </aside>

         {/* Main Content Area */}
         <main className="flex-1 p-6 md:p-10 overflow-y-auto">
            {renderContent()}
         </main>

         {/* Add Testimonial Modal (Reused) */}
         
      </div>
   );
};
