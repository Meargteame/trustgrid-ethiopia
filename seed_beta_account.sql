-- ==============================================================================
-- TrustGrid Dedicated Beta / Sandbox Test Account Provisioning Script
-- Target Account: beta@trustgrid.com / BetaTester2026!
-- ==============================================================================

-- 1. Link Business Profile
INSERT INTO public.profiles (
  id,
  company_name,
  username,
  website,
  primary_color,
  avatar_url,
  logo_url
)
SELECT 
  id,
  'Habesha Digital (Beta Sandbox)',
  'habesha-beta',
  'https://leonslab.tech',
  '#D7FF3D',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
FROM auth.users 
WHERE email = 'beta@trustgrid.com'
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  username = EXCLUDED.username;

-- 2. Add 3 Verified Demo Testimonials
DELETE FROM public.testimonials WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'beta@trustgrid.com');

INSERT INTO public.testimonials (
  user_id, name, company, avatar_url, text, score, status, is_verified, source, reviewer_telegram_username, created_at
)
SELECT 
  id, 'Abebe Kebede', 'Addis Commerce Ltd', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
  'TrustGrid helped us double our Telegram checkout conversions in Addis Ababa. Real verified buyer feedback builds instant trust without screenshot fraud.',
  98, 'verified', true, 'telegram_collection', 'abebe_k', NOW() - INTERVAL '2 days'
FROM auth.users WHERE email = 'beta@trustgrid.com';

INSERT INTO public.testimonials (
  user_id, name, company, avatar_url, text, score, status, is_verified, source, reviewer_telegram_username, created_at
)
SELECT 
  id, 'Selamawit Tadesse', 'Fintech Solutions Ethiopia', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
  'The Widget Studio is exceptionally fast. The live toast popups look amazing on our storefront and boosted our credibility immediately.',
  95, 'verified', true, 'telegram_collection', 'selam_t', NOW() - INTERVAL '5 days'
FROM auth.users WHERE email = 'beta@trustgrid.com';

INSERT INTO public.testimonials (
  user_id, name, company, avatar_url, text, score, status, is_verified, source, reviewer_telegram_username, created_at
)
SELECT 
  id, 'Dawit Yohannes', 'Creative Media Addis', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
  'No more screenshot fraud. Customers love that their reviews are cryptographically attested and verified via Telegram login.',
  100, 'verified', true, 'telegram_collection', 'dawit_y', NOW() - INTERVAL '7 days'
FROM auth.users WHERE email = 'beta@trustgrid.com';

-- 3. Default Widget Studio Config
INSERT INTO public.widget_configs (
  user_id, layout, theme, columns, gap, border_radius, shadow, font, header_title, show_rating, show_date, show_avatar, cards_to_show
)
SELECT 
  id, 'grid', 'modern', 3, 'normal', 'md', 'card', 'inter', 'Verified Customer Proof', true, true, true, 6
FROM auth.users WHERE email = 'beta@trustgrid.com'
ON CONFLICT (user_id) DO NOTHING;
