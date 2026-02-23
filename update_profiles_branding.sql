-- STEP 1: Update Profiles for Branding & Settings
-- This adds the necessary columns to the profiles table.

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{"notifications_email": true}'::jsonb,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Ensure RLS allows users to UPDATE their own profile (already exists but reinforcing)
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile."
ON public.profiles
FOR UPDATE
USING ( auth.uid() = id );

-- Ensure RLS allows users to INSERT their own profile (for signup)
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile."
ON public.profiles
FOR INSERT
WITH CHECK ( auth.uid() = id );
