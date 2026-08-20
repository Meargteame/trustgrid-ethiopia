-- ==============================================================================
-- TrustGrid Dedicated Beta / Sandbox Test Account Provisioning Script
-- Run this in your Supabase Project SQL Editor (supabase.com/dashboard)
-- ==============================================================================

-- 1. Create the Beta User in auth.users (Credentials: beta@trustgrid.et / BetaTester2026!)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'b0000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'beta@trustgrid.et',
  crypt('BetaTester2026!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"company_name":"Habesha Digital (Beta Sandbox)"}',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  encrypted_password = crypt('BetaTester2026!', gen_salt('bf')),
  email_confirmed_at = NOW();

-- 2. Create the Business Profile in public.profiles
INSERT INTO public.profiles (
  id,
  company_name,
  username,
  website,
  primary_color,
  avatar_url,
  logo_url
) VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'Habesha Digital (Beta Sandbox)',
  'habesha-beta',
  'https://leonslab.tech',
  '#D7FF3D',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
) ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  username = EXCLUDED.username,
  primary_color = EXCLUDED.primary_color;

-- 3. Pre-seed 3 Realistic Verified Beta Testimonials
DELETE FROM public.testimonials WHERE user_id = 'b0000000-0000-0000-0000-000000000001';

INSERT INTO public.testimonials (
  user_id,
  name,
  company,
  avatar_url,
  text,
  score,
  status,
  is_verified,
  source,
  reviewer_telegram_username,
  created_at
) VALUES 
(
  'b0000000-0000-0000-0000-000000000001',
  'Abebe Kebede',
  'Addis Commerce Ltd',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
  'TrustGrid helped us double our Telegram checkout conversions in Addis Ababa. Real verified buyer feedback builds instant trust without screenshot fraud.',
  98,
  'verified',
  true,
  'telegram_collection',
  'abebe_k',
  NOW() - INTERVAL '2 days'
),
(
  'b0000000-0000-0000-0000-000000000001',
  'Selamawit Tadesse',
  'Fintech Solutions Ethiopia',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
  'The Widget Studio is exceptionally fast. The live toast popups look amazing on our storefront and boosted our credibility immediately.',
  95,
  'verified',
  true,
  'telegram_collection',
  'selam_t',
  NOW() - INTERVAL '5 days'
),
(
  'b0000000-0000-0000-0000-000000000001',
  'Dawit Yohannes',
  'Creative Media Addis',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
  'No more screenshot fraud. Customers love that their reviews are cryptographically attested and verified via Telegram login.',
  100,
  'verified',
  true,
  'telegram_collection',
  'dawit_y',
  NOW() - INTERVAL '7 days'
);

-- 4. Set Default Widget Studio Config
INSERT INTO public.widget_configs (
  user_id,
  layout,
  theme,
  columns,
  gap,
  border_radius,
  shadow,
  font,
  header_title,
  show_rating,
  show_date,
  show_avatar,
  cards_to_show
) VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'grid',
  'modern',
  3,
  'normal',
  'md',
  'card',
  'inter',
  'Verified Customer Proof',
  true,
  true,
  true,
  6
) ON CONFLICT (user_id) DO NOTHING;
