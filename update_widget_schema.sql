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
