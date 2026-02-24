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
