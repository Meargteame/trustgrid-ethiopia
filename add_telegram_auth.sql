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
