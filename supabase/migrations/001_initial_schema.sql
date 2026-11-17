-- Intereor admin schema + RLS + storage

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  location text not null,
  category text not null,
  year text not null default '',
  area text not null default '',
  image text not null,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  src text not null,
  alt text not null,
  collection text not null default 'General',
  tall boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  tagline text not null default '',
  description text not null,
  image text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  name text not null,
  role text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null default '',
  project_type text not null default '',
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();
create trigger gallery_items_updated_at before update on public.gallery_items
  for each row execute function public.set_updated_at();
create trigger services_updated_at before update on public.services
  for each row execute function public.set_updated_at();
create trigger testimonials_updated_at before update on public.testimonials
  for each row execute function public.set_updated_at();
create trigger faqs_updated_at before update on public.faqs
  for each row execute function public.set_updated_at();
create trigger contact_messages_updated_at before update on public.contact_messages
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.projects enable row level security;
alter table public.gallery_items enable row level security;
alter table public.services enable row level security;
alter table public.testimonials enable row level security;
alter table public.faqs enable row level security;
alter table public.contact_messages enable row level security;

-- Public read for site content
create policy "Public read projects" on public.projects for select using (true);
create policy "Public read gallery" on public.gallery_items for select using (true);
create policy "Public read services" on public.services for select using (true);
create policy "Public read testimonials" on public.testimonials for select using (true);
create policy "Public read faqs" on public.faqs for select using (true);

-- Authenticated admin write for content
create policy "Admin insert projects" on public.projects for insert with check (auth.role() = 'authenticated');
create policy "Admin update projects" on public.projects for update using (auth.role() = 'authenticated');
create policy "Admin delete projects" on public.projects for delete using (auth.role() = 'authenticated');

create policy "Admin insert gallery" on public.gallery_items for insert with check (auth.role() = 'authenticated');
create policy "Admin update gallery" on public.gallery_items for update using (auth.role() = 'authenticated');
create policy "Admin delete gallery" on public.gallery_items for delete using (auth.role() = 'authenticated');

create policy "Admin insert services" on public.services for insert with check (auth.role() = 'authenticated');
create policy "Admin update services" on public.services for update using (auth.role() = 'authenticated');
create policy "Admin delete services" on public.services for delete using (auth.role() = 'authenticated');

create policy "Admin insert testimonials" on public.testimonials for insert with check (auth.role() = 'authenticated');
create policy "Admin update testimonials" on public.testimonials for update using (auth.role() = 'authenticated');
create policy "Admin delete testimonials" on public.testimonials for delete using (auth.role() = 'authenticated');

create policy "Admin insert faqs" on public.faqs for insert with check (auth.role() = 'authenticated');
create policy "Admin update faqs" on public.faqs for update using (auth.role() = 'authenticated');
create policy "Admin delete faqs" on public.faqs for delete using (auth.role() = 'authenticated');

-- Contact messages: anyone can submit, only admins manage
create policy "Anyone insert messages" on public.contact_messages for insert with check (true);
create policy "Admin read messages" on public.contact_messages for select using (auth.role() = 'authenticated');
create policy "Admin update messages" on public.contact_messages for update using (auth.role() = 'authenticated');
create policy "Admin delete messages" on public.contact_messages for delete using (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- Storage bucket for image uploads
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "Public read media"
on storage.objects for select
using (bucket_id = 'media');

create policy "Admin upload media"
on storage.objects for insert
with check (bucket_id = 'media' and auth.role() = 'authenticated');

create policy "Admin update media"
on storage.objects for update
using (bucket_id = 'media' and auth.role() = 'authenticated');

create policy "Admin delete media"
on storage.objects for delete
using (bucket_id = 'media' and auth.role() = 'authenticated');
