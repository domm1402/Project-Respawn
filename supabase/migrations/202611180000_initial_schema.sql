-- Respawn starter schema. Apply to a fresh Supabase project.
-- All user-facing tables enable RLS. Extend policies and test them before production.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (char_length(username) between 3 and 24),
  display_name text not null default 'Player',
  bio text not null default '' check (char_length(bio) <= 280),
  avatar_url text,
  banner_url text,
  region text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  genre text,
  cover_url text,
  official_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.profile_games (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  game_id uuid not null references public.games(id) on delete cascade,
  platform text,
  is_favourite boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (profile_id, game_id, platform)
);

create table if not exists public.platform_connections (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null,
  provider_user_id text not null,
  display_name text,
  status text not null default 'connected' check (status in ('connected','expired','revoked')),
  connected_at timestamptz not null default now(),
  unique (provider, provider_user_id),
  unique (profile_id, provider)
);
-- OAuth tokens must live in a private server-only store, never in this client-readable table.

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','declined','blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (requester_id <> addressee_id),
  unique (requester_id, addressee_id)
);

create table if not exists public.communities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  name text not null check (char_length(name) between 3 and 60),
  slug text not null unique,
  description text not null default '' check (char_length(description) <= 1000),
  visibility text not null default 'public' check (visibility in ('public','private')),
  game_id uuid references public.games(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.community_members (
  community_id uuid not null references public.communities(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','moderator','member')),
  joined_at timestamptz not null default now(),
  primary key (community_id, profile_id)
);

-- Owners are automatically inserted into their own rosters.
create or replace function public.add_community_owner_membership()
returns trigger language plpgsql security definer set search_path = public
as $ begin
  insert into public.community_members (community_id, profile_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict (community_id, profile_id) do nothing;
  return new;
end $;

create or replace function public.add_guild_owner_membership()
returns trigger language plpgsql security definer set search_path = public
as $ begin
  insert into public.guild_members (guild_id, profile_id, role)
  values (new.id, new.owner_id, 'leader')
  on conflict (guild_id, profile_id) do nothing;
  return new;
end $;

create trigger community_owner_membership
after insert on public.communities
for each row execute function public.add_community_owner_membership();

create trigger guild_owner_membership
after insert on public.guilds
for each row execute function public.add_guild_owner_membership();

create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  channel_type text not null default 'text' check (channel_type in ('text','announcement')),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  unique (community_id, name)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.channels(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now(),
  edited_at timestamptz
);

create table if not exists public.guilds (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  name text not null check (char_length(name) between 3 and 60),
  description text not null default '' check (char_length(description) <= 1000),
  game_id uuid references public.games(id) on delete set null,
  region text,
  recruiting boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.guild_members (
  guild_id uuid not null references public.guilds(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('leader','officer','member')),
  joined_at timestamptz not null default now(),
  primary key (guild_id, profile_id)
);

create table if not exists public.lfg_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  game_id uuid not null references public.games(id) on delete cascade,
  platform text,
  region text,
  play_style text,
  description text not null check (char_length(description) between 1 and 1000),
  status text not null default 'open' check (status in ('open','filled','closed')),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles(id) on delete cascade,
  community_id uuid references public.communities(id) on delete cascade,
  guild_id uuid references public.guilds(id) on delete cascade,
  game_id uuid references public.games(id) on delete set null,
  title text not null check (char_length(title) between 3 and 100),
  description text not null default '' check (char_length(description) <= 2000),
  starts_at timestamptz not null,
  capacity integer check (capacity is null or capacity > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.event_attendees (
  event_id uuid not null references public.events(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'going' check (status in ('going','interested','cancelled')),
  created_at timestamptz not null default now(),
  primary key (event_id, profile_id)
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  community_id uuid references public.communities(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now(),
  edited_at timestamptz
);

create table if not exists public.post_reactions (
  post_id uuid not null references public.posts(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  reaction text not null default 'like' check (reaction in ('like','love','gg')),
  created_at timestamptz not null default now(),
  primary key (post_id, profile_id, reaction)
);

create table if not exists public.user_blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('profile','post','message','community','guild')),
  target_id uuid not null,
  reason text not null check (char_length(reason) between 3 and 100),
  details text not null default '' check (char_length(details) <= 2000),
  status text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null,
  title text not null,
  body text not null default '',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists messages_channel_created_idx on public.messages(channel_id, created_at desc);
create index if not exists posts_created_idx on public.posts(created_at desc);
create index if not exists lfg_game_status_idx on public.lfg_posts(game_id, status, created_at desc);
create index if not exists events_starts_idx on public.events(starts_at);
create index if not exists notifications_profile_created_idx on public.notifications(profile_id, created_at desc);

-- Helper functions keep membership checks consistent. SECURITY DEFINER functions use a fixed search_path.
create or replace function public.is_community_member(target_community uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.community_members m where m.community_id = target_community and m.profile_id = auth.uid()) $$;

create or replace function public.is_community_moderator(target_community uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.community_members m where m.community_id = target_community and m.profile_id = auth.uid() and m.role in ('owner','admin','moderator')) $$;

alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.profile_games enable row level security;
alter table public.platform_connections enable row level security;
alter table public.friendships enable row level security;
alter table public.communities enable row level security;
alter table public.community_members enable row level security;
alter table public.channels enable row level security;
alter table public.messages enable row level security;
alter table public.guilds enable row level security;
alter table public.guild_members enable row level security;
alter table public.lfg_posts enable row level security;
alter table public.events enable row level security;
alter table public.event_attendees enable row level security;
alter table public.posts enable row level security;
alter table public.post_reactions enable row level security;
alter table public.user_blocks enable row level security;
alter table public.reports enable row level security;
alter table public.notifications enable row level security;

-- Profiles and catalogue
create policy "Profiles are viewable by signed-in users" on public.profiles for select to authenticated using (true);
create policy "Users create their own profile" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "Users update their own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "Games are readable" on public.games for select to anon, authenticated using (true);
create policy "Users manage their game list" on public.profile_games for all to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "Users view their platform links" on public.platform_connections for select to authenticated using (profile_id = auth.uid());

-- Friend requests are visible only to their participants.
create policy "Friendship participants read" on public.friendships for select to authenticated using (requester_id = auth.uid() or addressee_id = auth.uid());
create policy "Send friend request" on public.friendships for insert to authenticated with check (requester_id = auth.uid());
create policy "Recipient or requester updates friendship" on public.friendships for update to authenticated using (requester_id = auth.uid() or addressee_id = auth.uid()) with check (requester_id = auth.uid() or addressee_id = auth.uid());

-- Communities and membership
create policy "Public communities or member communities are visible" on public.communities for select to authenticated using (visibility = 'public' or public.is_community_member(id));
create policy "Signed-in users create communities" on public.communities for insert to authenticated with check (owner_id = auth.uid());
create policy "Community moderators update" on public.communities for update to authenticated using (public.is_community_moderator(id)) with check (public.is_community_moderator(id));
create policy "Members can view member roster" on public.community_members for select to authenticated using (public.is_community_member(community_id) or exists (select 1 from public.communities c where c.id = community_id and c.visibility = 'public'));
create policy "Users join as members" on public.community_members for insert to authenticated with check (profile_id = auth.uid() and role = 'member');
create policy "Users leave or moderators manage membership" on public.community_members for delete to authenticated using (profile_id = auth.uid() or public.is_community_moderator(community_id));
create policy "Members read channels" on public.channels for select to authenticated using (public.is_community_member(community_id));
create policy "Moderators manage channels" on public.channels for all to authenticated using (public.is_community_moderator(community_id)) with check (public.is_community_moderator(community_id));
create policy "Members read messages" on public.messages for select to authenticated using (exists (select 1 from public.channels c where c.id = channel_id and public.is_community_member(c.community_id)));
create policy "Members send messages as themselves" on public.messages for insert to authenticated with check (author_id = auth.uid() and exists (select 1 from public.channels c where c.id = channel_id and public.is_community_member(c.community_id)));
create policy "Authors edit own messages" on public.messages for update to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());

-- Guilds, LFG and events
create policy "Guilds are readable" on public.guilds for select to authenticated using (true);
create policy "Users create guilds" on public.guilds for insert to authenticated with check (owner_id = auth.uid());
create policy "Guild owners update guilds" on public.guilds for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Guild roster readable" on public.guild_members for select to authenticated using (true);
create policy "Users join guilds as members" on public.guild_members for insert to authenticated with check (profile_id = auth.uid() and role = 'member');
create policy "Users leave guilds" on public.guild_members for delete to authenticated using (profile_id = auth.uid());
create policy "LFG posts readable" on public.lfg_posts for select to authenticated using (true);
create policy "Users create their LFG posts" on public.lfg_posts for insert to authenticated with check (author_id = auth.uid());
create policy "Authors manage LFG posts" on public.lfg_posts for update using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "Events readable" on public.events for select to authenticated using (community_id is null or public.is_community_member(community_id));
create policy "Hosts create events" on public.events for insert to authenticated with check (host_id = auth.uid());
create policy "Hosts update events" on public.events for update to authenticated using (host_id = auth.uid()) with check (host_id = auth.uid());
create policy "Event attendee list visible to signed-in users" on public.event_attendees for select to authenticated using (true);
create policy "Users RSVP as themselves" on public.event_attendees for insert to authenticated with check (profile_id = auth.uid());
create policy "Users update own RSVP" on public.event_attendees for update to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "Users cancel own RSVP" on public.event_attendees for delete to authenticated using (profile_id = auth.uid());

-- Feed and moderation
create policy "Public feed posts readable" on public.posts for select to authenticated using (community_id is null or public.is_community_member(community_id));
create policy "Users create posts as themselves" on public.posts for insert to authenticated with check (author_id = auth.uid() and (community_id is null or public.is_community_member(community_id)));
create policy "Authors update own posts" on public.posts for update to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "Reactions readable" on public.post_reactions for select to authenticated using (true);
create policy "Users react as themselves" on public.post_reactions for insert to authenticated with check (profile_id = auth.uid());
create policy "Users remove own reactions" on public.post_reactions for delete to authenticated using (profile_id = auth.uid());
create policy "Users manage blocks" on public.user_blocks for all to authenticated using (blocker_id = auth.uid()) with check (blocker_id = auth.uid());
create policy "Users create reports" on public.reports for insert to authenticated with check (reporter_id = auth.uid());
create policy "Users see own reports" on public.reports for select to authenticated using (reporter_id = auth.uid());
create policy "Users read own notifications" on public.notifications for select to authenticated using (profile_id = auth.uid());
create policy "Users update own notifications" on public.notifications for update to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- Production follow-up: add a trusted server-side moderation role and policies for report review.
-- Do not grant clients access to service-role credentials or OAuth token storage.
