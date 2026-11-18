-- Live direct messaging and voice-room metadata extension.
create table if not exists public.direct_conversations (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,
  title text,
  is_group boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.direct_conversation_members (
  conversation_id uuid not null references public.direct_conversations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (conversation_id, profile_id)
);
create table if not exists public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.direct_conversations(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now(),
  edited_at timestamptz
);
create index if not exists direct_messages_conversation_created_idx on public.direct_messages(conversation_id, created_at desc);

create or replace function public.add_direct_conversation_creator()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
  insert into public.direct_conversation_members (conversation_id, profile_id)
  values (new.id, new.created_by)
  on conflict (conversation_id, profile_id) do nothing;
  return new;
end $$;
drop trigger if exists direct_conversation_creator_membership on public.direct_conversations;
create trigger direct_conversation_creator_membership after insert on public.direct_conversations
for each row execute function public.add_direct_conversation_creator();

create or replace function public.is_direct_conversation_member(target_conversation uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.direct_conversation_members m where m.conversation_id = target_conversation and m.profile_id = auth.uid()) $$;

alter table public.direct_conversations enable row level security;
alter table public.direct_conversation_members enable row level security;
alter table public.direct_messages enable row level security;

create policy "Members view direct conversations" on public.direct_conversations
for select to authenticated using (public.is_direct_conversation_member(id));
create policy "Users create conversations as themselves" on public.direct_conversations
for insert to authenticated with check (created_by = auth.uid());
create policy "Members view direct conversation roster" on public.direct_conversation_members
for select to authenticated using (public.is_direct_conversation_member(conversation_id));
create policy "Existing members can invite participants" on public.direct_conversation_members
for insert to authenticated with check (public.is_direct_conversation_member(conversation_id) and profile_id <> auth.uid());
create policy "Users leave direct conversations" on public.direct_conversation_members
for delete to authenticated using (profile_id = auth.uid());
create policy "Members read direct messages" on public.direct_messages
for select to authenticated using (public.is_direct_conversation_member(conversation_id));
create policy "Members send direct messages as themselves" on public.direct_messages
for insert to authenticated with check (author_id = auth.uid() and public.is_direct_conversation_member(conversation_id));
create policy "Authors edit own direct messages" on public.direct_messages
for update to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());

-- Voice room metadata only. Actual audio uses a separate SFU such as LiveKit.
create table if not exists public.voice_rooms (
  id uuid primary key default gen_random_uuid(),
  community_id uuid references public.communities(id) on delete cascade,
  guild_id uuid references public.guilds(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (community_id is not null or guild_id is not null)
);
alter table public.voice_rooms enable row level security;
create policy "Voice room metadata visible to community or guild members" on public.voice_rooms
for select to authenticated using (
  (community_id is not null and public.is_community_member(community_id))
  or (guild_id is not null and exists (select 1 from public.guild_members gm where gm.guild_id = voice_rooms.guild_id and gm.profile_id = auth.uid()))
);
create policy "Community moderators create voice rooms" on public.voice_rooms
for insert to authenticated with check (
  created_by = auth.uid() and (
    (community_id is not null and public.is_community_moderator(community_id))
    or (guild_id is not null and exists (select 1 from public.guilds g where g.id = voice_rooms.guild_id and g.owner_id = auth.uid()))
  )
);

drop policy if exists "Community moderators create voice rooms" on public.voice_rooms;
create policy "Community moderators or guild members create voice rooms" on public.voice_rooms
for insert to authenticated with check (
  created_by = auth.uid() and (
    (community_id is not null and public.is_community_moderator(community_id))
    or (guild_id is not null and exists (select 1 from public.guild_members gm where gm.guild_id = voice_rooms.guild_id and gm.profile_id = auth.uid()))
  )
);
