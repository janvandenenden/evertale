-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Users table (synced from Clerk)
create table users (
  id uuid primary key default uuid_generate_v4(),
  clerk_user_id text unique not null,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_users_clerk_user_id on users(clerk_user_id);

-- Children table
create table children (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  birth_year integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_children_user_id on children(user_id);

-- Child photos table
create table child_photos (
  id uuid primary key default uuid_generate_v4(),
  child_id uuid not null references children(id) on delete cascade,
  image_url text not null,
  storage_key text not null,
  created_at timestamptz not null default now()
);

create index idx_child_photos_child_id on child_photos(child_id);

-- Stories table
create table stories (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  status text not null default 'active' check (status in ('active', 'coming_soon', 'archived')),
  created_at timestamptz not null default now()
);

-- Character versions table
create table character_versions (
  id uuid primary key default uuid_generate_v4(),
  child_id uuid not null references children(id) on delete cascade,
  story_id uuid not null references stories(id),
  source_photo_id uuid not null references child_photos(id),
  status text not null default 'pending' check (status in ('pending', 'generating_character', 'generating_preview', 'completed', 'failed')),
  character_sheet_url text,
  preview_image_url text,
  generation_count integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_character_versions_child_id on character_versions(child_id);
create index idx_character_versions_story_id on character_versions(story_id);

-- Orders table
create table orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id),
  child_id uuid not null references children(id),
  character_version_id uuid not null references character_versions(id),
  story_id uuid not null references stories(id),
  stripe_session_id text unique not null,
  product_type text not null check (product_type in ('personalized_book', 'founding_family_edition')),
  price_cents integer not null,
  currency text not null default 'usd',
  status text not null default 'pending' check (status in ('pending', 'paid', 'shipped', 'cancelled')),
  shipping_name text,
  shipping_line1 text,
  shipping_line2 text,
  shipping_city text,
  shipping_postal_code text,
  shipping_country text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_orders_user_id on orders(user_id);

-- Founding edition counter table (atomic counter for 500 limit)
create table founding_edition_counter (
  id integer primary key default 1 check (id = 1),
  count integer not null default 0,
  max_count integer not null default 500
);

insert into founding_edition_counter (id, count, max_count) values (1, 0, 500);

-- Seed Momotaro story
insert into stories (slug, title, status) values (
  'momotaro',
  'Momotaro -- The Peach Boy',
  'active'
);

-- Updated_at trigger function
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at before update on users for each row execute function update_updated_at();
create trigger children_updated_at before update on children for each row execute function update_updated_at();
create trigger character_versions_updated_at before update on character_versions for each row execute function update_updated_at();
create trigger orders_updated_at before update on orders for each row execute function update_updated_at();

-- RPC for atomic founding edition claim
create or replace function claim_founding_edition()
returns boolean as $$
declare
  current_count integer;
  max_allowed integer;
begin
  select count, max_count into current_count, max_allowed
  from founding_edition_counter
  where id = 1
  for update;

  if current_count >= max_allowed then
    return false;
  end if;

  update founding_edition_counter set count = count + 1 where id = 1;
  return true;
end;
$$ language plpgsql;
