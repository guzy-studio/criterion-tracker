-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query)

create table profiles (
  id uuid references auth.users on delete cascade primary key,
  watched jsonb default '[]'::jsonb,
  notes jsonb default '{}'::jsonb,
  density integer default 4,
  theme text default 'dark',
  avatar_url text,
  created_at timestamptz default now()
);

-- Storage bucket for avatars
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

-- Anyone can view avatars (they're public)
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Users can upload their own avatar
create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- Users can update their own avatar
create policy "Users can update own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- Users can delete their own avatar
create policy "Users can delete own avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- Enable Row Level Security
alter table profiles enable row level security;

-- Users can only read/write their own profile
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);
