-- Multi-phase character sheets: drop old columns, add new tables
-- Pre-requisite: delete from orders; delete from character_versions;

alter table character_versions drop column if exists character_sheet_url;
alter table character_versions drop column if exists preview_image_url;

create table character_sheets (
  id uuid primary key default uuid_generate_v4(),
  character_version_id uuid not null references character_versions(id) on delete cascade,
  story_id uuid not null references stories(id),
  phase text not null,
  image_url text not null,
  created_at timestamptz not null default now()
);

create unique index idx_character_sheets_version_phase
  on character_sheets(character_version_id, phase);

create table character_version_scenes (
  id uuid primary key default uuid_generate_v4(),
  character_version_id uuid not null references character_versions(id) on delete cascade,
  scene_id text not null,
  image_url text not null,
  created_at timestamptz not null default now()
);

create unique index idx_character_version_scenes_version_scene
  on character_version_scenes(character_version_id, scene_id);
