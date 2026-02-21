
-- Allow public submissions to testimonials (for collection flow)
create policy "Allow public inserts for testimonials"
  on testimonials for insert
  with check ( true );
