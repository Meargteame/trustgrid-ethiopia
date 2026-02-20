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
