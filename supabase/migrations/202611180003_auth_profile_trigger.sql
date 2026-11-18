-- Automatically provision a minimal Respawn profile after email sign-up.
create or replace function public.handle_new_user_profile()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  base_name text;
begin
  base_name := coalesce(nullif(split_part(coalesce(new.email, ''), '@', 1), ''), 'player');
  insert into public.profiles (id, username, display_name)
  values (new.id, 'player_' || substr(replace(new.id::text, '-', ''), 1, 10), left(base_name, 40))
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created_respawn_profile on auth.users;
create trigger on_auth_user_created_respawn_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();
