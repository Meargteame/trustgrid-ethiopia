-- Add missing columns to profiles
alter table profiles add column if not exists font text default 'Plus Jakarta Sans';
alter table profiles add column if not exists email text;
-- Also ensure RLS allows updates
-- (Already handled by "Users can update own profile" policy)
