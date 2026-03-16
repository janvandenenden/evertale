-- Admin story scene workspace for iterative panel generation and promotion

create table admin_story_scene_workspaces (
  id uuid primary key default uuid_generate_v4(),
  story_id uuid not null references stories(id),
  character_version_id uuid not null references character_versions(id) on delete cascade,
  character_sheet_id uuid not null references character_sheets(id) on delete cascade,
  phase text not null,
  child_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_admin_workspaces_character_version
  on admin_story_scene_workspaces(character_version_id);
create index idx_admin_workspaces_story
  on admin_story_scene_workspaces(story_id);

create table admin_story_scene_generations (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references admin_story_scene_workspaces(id) on delete cascade,
  scene_id text not null,
  prompt_text text not null,
  template_url text not null,
  character_sheet_url text not null,
  image_url text,
  status text not null default 'pending' check (status in ('pending', 'generating', 'completed', 'failed')),
  error text,
  created_at timestamptz not null default now()
);

create unique index idx_admin_generations_workspace_scene
  on admin_story_scene_generations(workspace_id, scene_id);
create index idx_admin_generations_workspace
  on admin_story_scene_generations(workspace_id);

create trigger admin_workspaces_updated_at
  before update on admin_story_scene_workspaces
  for each row execute function update_updated_at();
