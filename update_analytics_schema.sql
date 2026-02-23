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
