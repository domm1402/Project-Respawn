-- One-time OAuth state records. Access only through trusted Edge Functions.
create table if not exists public.oauth_states (
  state text primary key,
  profile_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
alter table public.oauth_states enable row level security;
-- No client policies by design. Service-role Edge Functions alone consume/delete these rows.
