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
