-- Migration: 002_add_portfolio_book_fields.sql
-- Adds description, images array, published status, and ordering to projects table

alter table public.projects 
  add column if not exists description text default '',
  add column if not exists images text[] default '{}',
  add column if not exists published boolean not null default true,
  add column if not exists "order" integer not null default 0;

-- Create an index on published and order for rapid public querying
create index if not exists idx_projects_published_order on public.projects(published, "order");
