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
