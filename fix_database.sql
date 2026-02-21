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

-- 4. Enable public access for the Collection Form
create policy "Allow public inserts for testimonials"
  on testimonials for insert
  with check ( true );

-- 5. Enable public access for Verification updates
create policy "Allow public verification updates"
  on testimonials for update
  using ( true )
  with check ( verification_token is not null );
