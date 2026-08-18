-- CLEAN SLATE SETUP
DROP TABLE IF EXISTS views CASCADE;
DROP TABLE IF EXISTS widget_configs CASCADE;
DROP TABLE IF EXISTS form_configs CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Enable RLS (Row Level Security)
-- Create profiles table (public public profile info)
create table profiles (
  id uuid references auth.users not null,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  company_name text,
  primary_color text default '#D4F954',
  
  primary key (id),
  constraint username_length check (char_length(username) >= 3)
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create testimonials table
create table testimonials (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null, -- The user who owns this dashboard/collection
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,          -- Reviewer Name
  company text,                -- Reviewer Company
  text text,                   -- Review Text
  video_url text,              -- URL to video if uploaded
  score int,                   -- AI Trust Score
  sentiment text,              -- AI Sentiment
  is_verified boolean default false,
  source text default 'web_collection', -- 'web_collection', 'linkedin', etc
  status text default 'pending' -- 'pending', 'approved', 'rejected'
);

alter table testimonials enable row level security;

create policy "Testimonials are viewable by everyone."
  on testimonials for select
  using ( true );

create policy "Anyone can insert a testimonial." 
  on testimonials for insert
  with check ( true ); 
  -- In a real app, you might want strict policies here, but for collection page we need public insert

create policy "Users can update their own testimonials."
  on testimonials for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own testimonials."
  on testimonials for delete
  using ( auth.uid() = user_id );

-- Set up Storage for Videos (Optional, needing 'videos' bucket)
-- insert into storage.buckets (id, name, public) values ('videos', 'videos', true);
-- create policy "Videos are publicly accessible." on storage.objects for select using ( bucket_id = 'videos' );
-- create policy "Anyone can upload a video." on storage.objects for insert with check ( bucket_id = 'videos' );
-- Enable the storage extension if not already enabled (usually enabled by default in Supabase)
-- CREATE EXTENSION IF NOT EXISTS "storage";

-- Create the 'videos' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Grant public read access to the 'videos' bucket
CREATE POLICY "Videos are publicly accessible"
ON storage.objects FOR SELECT
USING ( bucket_id = 'videos' );

-- Grant public upload access to the 'videos' bucket (for testimonials)
CREATE POLICY "Anyone can upload a video"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'videos' );

-- Grant users update/delete access to their own videos (optional, broadly useful)
CREATE POLICY "Users can update their own videos"
ON storage.objects FOR UPDATE
USING ( auth.uid() = owner );

CREATE POLICY "Users can delete their own videos"
ON storage.objects FOR DELETE
USING ( auth.uid() = owner );
-- STEP 2: FORM CONFIGURATION & COLLECTION
-- This table stores the customization for the public collection form

CREATE TABLE IF NOT EXISTS public.form_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
    title TEXT DEFAULT 'Share your experience',
    subtitle TEXT DEFAULT 'Your feedback helps us grow.',
    
    -- Custom questions stored as JSONB
    -- Example: [{"id": "q1", "label": "What did you like best?", "type": "text", "required": true}]
    questions JSONB DEFAULT '[
        {"id": "q1", "label": "What did you like most about working with us?", "type": "textarea", "required": true},
        {"id": "q2", "label": "How would you rate our service?", "type": "rating", "required": true}
    ]'::jsonb,
    
    -- Toggle features
    allow_video BOOLEAN DEFAULT TRUE,
    allow_photo BOOLEAN DEFAULT TRUE,
    allow_linkedin_import BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.form_configs ENABLE ROW LEVEL SECURITY;

-- 1. Public can READ form config (to render the form)
CREATE POLICY "Public can view form configs"
ON public.form_configs
FOR SELECT
TO anon, authenticated
USING (true);

-- 2. Users can INSERT their own config
CREATE POLICY "Users can create their own form config"
ON public.form_configs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. Users can UPDATE their own config
CREATE POLICY "Users can update their own form config"
ON public.form_configs
FOR UPDATE
USING (auth.uid() = user_id);

-- Add index for faster lookup by user_id
CREATE INDEX IF NOT EXISTS idx_form_configs_user_id ON public.form_configs(user_id);
-- Create widget_configs table
CREATE TABLE IF NOT EXISTS widget_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    layout TEXT NOT NULL DEFAULT 'grid',
    theme TEXT NOT NULL DEFAULT 'modern',
    columns INTEGER NOT NULL DEFAULT 3,
    gap TEXT NOT NULL DEFAULT 'gap-4',
    border_radius TEXT NOT NULL DEFAULT 'rounded-xl',
    shadow TEXT NOT NULL DEFAULT 'shadow-sm',
    font TEXT NOT NULL DEFAULT 'inter',
    header_title TEXT NOT NULL DEFAULT 'What our clients say',
    show_rating BOOLEAN NOT NULL DEFAULT true,
    show_date BOOLEAN NOT NULL DEFAULT true,
    show_avatar BOOLEAN NOT NULL DEFAULT true,
    min_rating INTEGER NOT NULL DEFAULT 4,
    cards_to_show INTEGER NOT NULL DEFAULT 6,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE widget_configs ENABLE ROW LEVEL SECURITY;

-- Policies for widget_configs
-- 1. Owners can insert/update their own config
CREATE POLICY "Users can manage their own widget config"
    ON widget_configs
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 2. Anyone can read widget configs (for public walls and embeds)
CREATE POLICY "Anyone can view widget configs"
    ON widget_configs
    FOR SELECT
    USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_widget_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_widget_configs_updated_at ON widget_configs;
CREATE TRIGGER trg_widget_configs_updated_at
BEFORE UPDATE ON widget_configs
FOR EACH ROW
EXECUTE FUNCTION update_widget_configs_updated_at();
-- Create Views Table
CREATE TABLE IF NOT EXISTS public.views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wall_id UUID NOT NULL, -- This links to the profile.id (user_id) whose wall was viewed
    referrer TEXT, -- e.g., 'google', 'direct', or the URL where the widget is embedded
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.views ENABLE ROW LEVEL SECURITY;

-- Policies for Views
-- 1. Anyone can INSERT a view (Public access when loading a wall)
CREATE POLICY "Public can insert views"
ON public.views
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 2. Users can VIEW their own wall stats
-- Assuming wall_id matches auth.uid()
CREATE POLICY "Users can view stats for their own wall"
ON public.views
FOR SELECT
TO authenticated
USING (wall_id = auth.uid());

-- Add simple index for performance on counting
CREATE INDEX IF NOT EXISTS idx_views_wall_id ON public.views(wall_id);
CREATE INDEX IF NOT EXISTS idx_views_created_at ON public.views(created_at);
-- Add missing columns to 'testimonials' table if they don't exist
DO $$ 
BEGIN 
    -- Add 'source' column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'testimonials' AND column_name = 'source') THEN
        ALTER TABLE testimonials ADD COLUMN source TEXT DEFAULT 'web_collection';
    END IF;

    -- Add 'status' column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'testimonials' AND column_name = 'status') THEN
        ALTER TABLE testimonials ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;

    -- Add 'video_url' column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'testimonials' AND column_name = 'video_url') THEN
        ALTER TABLE testimonials ADD COLUMN video_url TEXT;
    END IF;

    -- Add 'card_style' column (used for display customization)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'testimonials' AND column_name = 'card_style') THEN
        ALTER TABLE testimonials ADD COLUMN card_style TEXT DEFAULT 'white';
    END IF;

    -- Add 'company_name' to profiles if missing (from previous steps, just to be sure)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'company_name') THEN
        ALTER TABLE profiles ADD COLUMN company_name TEXT;
    END IF;

     -- Add 'primary_color' to profiles if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'primary_color') THEN
        ALTER TABLE profiles ADD COLUMN primary_color TEXT DEFAULT '#D4F954';
    END IF;

END $$;
-- Add missing columns to profiles
alter table profiles add column if not exists font text default 'Plus Jakarta Sans';
alter table profiles add column if not exists email text;
-- Also ensure RLS allows updates
-- (Already handled by "Users can update own profile" policy)
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

-- Allow public submissions to testimonials (for collection flow)
create policy "Allow public inserts for testimonials"
  on testimonials for insert
  with check ( true );
-- Add verification columns
alter table testimonials add column if not exists client_email text;
alter table testimonials add column if not exists verification_token uuid default uuid_generate_v4();
alter table testimonials add column if not exists verified_at timestamp with time zone;

-- Allow public access to update verification status (via token)
create policy "Allow public verification updates"
  on testimonials for update
  using ( true )
  with check ( verification_token is not null );
-- Consolidated Schema Update
-- Run this in your Supabase SQL Editor to fix the "column not found" errors

-- 1. Add missing emails column to testimonials (Critical for verification)
alter table testimonials add column if not exists client_email text;

-- 2. Add verification columns if missing
alter table testimonials add column if not exists verification_token uuid default uuid_generate_v4();
alter table testimonials add column if not exists verified_at timestamp with time zone;
alter table testimonials add column if not exists source text default 'manual'; 

-- 3. Add profiles columns (for settings)
alter table profiles add column if not exists email text;
alter table profiles add column if not exists font text default 'Plus Jakarta Sans';
alter table profiles add column if not exists username text;
alter table profiles add column if not exists website text;
alter table profiles add column if not exists logo_url text;


-- 1. Add telegram_id (unique), telegram_username, and avatar_url to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telegram_id TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telegram_username TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Add reviewer_telegram_id and reviewer_telegram_username to testimonials
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS reviewer_telegram_id TEXT;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS reviewer_telegram_username TEXT;

-- 3. Add UNIQUE constraint to testimonials to enforce one review per telegram_id per business (user_id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'unique_review_per_telegram_user'
    ) THEN
        ALTER TABLE testimonials ADD CONSTRAINT unique_review_per_telegram_user UNIQUE (user_id, reviewer_telegram_id);
    END IF;
END $$;
