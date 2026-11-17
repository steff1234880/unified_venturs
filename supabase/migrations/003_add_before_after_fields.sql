-- Migration: 003_add_before_after_fields.sql
-- Adds before_image, after_image, and is_transformation columns to projects table

alter table public.projects
  add column if not exists before_image text default null,
  add column if not exists after_image text default null,
  add column if not exists is_transformation boolean not null default false;

-- Create an index on is_transformation and published for quick retrieval
create index if not exists idx_projects_transformation on public.projects(is_transformation, published);
