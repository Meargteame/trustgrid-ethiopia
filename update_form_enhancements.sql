-- Add incentive_message to form_configs
ALTER TABLE public.form_configs ADD COLUMN IF NOT EXISTS incentive_message TEXT;

-- Add social_url and consent_given to testimonials
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS social_url TEXT;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS consent_given BOOLEAN DEFAULT false;
