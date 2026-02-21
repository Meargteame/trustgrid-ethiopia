-- Add verification columns
alter table testimonials add column if not exists client_email text;
alter table testimonials add column if not exists verification_token uuid default uuid_generate_v4();
alter table testimonials add column if not exists verified_at timestamp with time zone;

-- Allow public access to update verification status (via token)
create policy "Allow public verification updates"
  on testimonials for update
  using ( true )
  with check ( verification_token is not null );
