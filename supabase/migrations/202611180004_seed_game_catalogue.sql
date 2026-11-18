insert into public.games (name, slug, genre, official_url) values
  ('Fortnite', 'fortnite', 'Battle Royale', 'https://www.fortnite.com/'),
  ('Minecraft', 'minecraft', 'Sandbox', 'https://www.minecraft.net/'),
  ('Call of Duty', 'call-of-duty', 'FPS', 'https://www.callofduty.com/'),
  ('Rocket League', 'rocket-league', 'Sports', 'https://www.rocketleague.com/'),
  ('Grand Theft Auto V', 'grand-theft-auto-v', 'Open world', 'https://www.rockstargames.com/gta-v'),
  ('Apex Legends', 'apex-legends', 'Battle Royale', 'https://www.ea.com/games/apex-legends')
on conflict (slug) do update set name = excluded.name, genre = excluded.genre, official_url = excluded.official_url;
