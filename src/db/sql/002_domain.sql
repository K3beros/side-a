-- 002_domain.sql — Side A Lagos domain (editions, songs, merch, updates, recommendations)
-- Payments external: Tix Africa (tickets per-edition), Monnify (merch per-cart). Inventory truth lives here.

-- Editions
create table if not exists editions (
  id uuid primary key default gen_random_uuid(),
  idx int unique not null,
  album text not null,
  artist text not null,
  date timestamptz not null,
  venue text not null,
  price int not null check (price >= 0),
  capacity int not null check (capacity > 0),
  spots_sold int not null default 0 check (spots_sold >= 0),
  status text not null check (status in ('upcoming','past')),
  attendance int null,
  tix_africa_url text null,
  tix_africa_event_id text null,
  created_at timestamptz not null default now(),
  check (spots_sold <= capacity)
);

-- Songs of the week
create table if not exists songs (
  id uuid primary key default gen_random_uuid(),
  week_number int unique not null,
  title text not null,
  artist text not null,
  picked_by text not null,
  note text not null,
  is_current boolean not null default false,
  reaction_repeat int not null default 0 check (reaction_repeat >= 0),
  reaction_needed int not null default 0 check (reaction_needed >= 0),
  reaction_skip int not null default 0 check (reaction_skip >= 0),
  created_at timestamptz not null default now()
);

create table if not exists song_comments (
  id uuid primary key default gen_random_uuid(),
  song_id uuid not null references songs(id) on delete cascade,
  who text not null,
  text text not null,
  created_at timestamptz not null default now()
);

create table if not exists song_reactions (
  id uuid primary key default gen_random_uuid(),
  song_id uuid not null references songs(id) on delete cascade,
  kind text not null check (kind in ('repeat','needed','skip')),
  fingerprint text not null,
  created_at timestamptz not null default now(),
  unique (song_id, kind, fingerprint)
);

-- Recommendations
create table if not exists recommendations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  track text not null,
  why text not null,
  link text null,
  status text not null default 'queued' check (status in ('queued','picked','archived')),
  created_at timestamptz not null default now()
);

-- Merch
create table if not exists merch_items (
  id uuid primary key default gen_random_uuid(),
  sku text unique not null,
  name text not null,
  description text not null,
  price int not null check (price >= 0),
  stock int null check (stock is null or stock >= 0),
  sold int not null default 0 check (sold >= 0),
  status text not null check (status in ('preorder','in_stock')),
  note text not null,
  size_options jsonb null,
  monnify_base_url text null,
  created_at timestamptz not null default now(),
  check (stock is null or sold <= stock)
);

create table if not exists merch_orders (
  id uuid primary key default gen_random_uuid(),
  items jsonb not null,
  total int not null check (total >= 0),
  monnify_link text null,
  payment_ref text null,
  status text not null default 'pending' check (status in ('pending','paid','fulfilled','cancelled')),
  created_at timestamptz not null default now()
);

-- Updates
create table if not exists updates (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  title text not null,
  description text not null,
  created_at timestamptz not null default now()
);

-- Seed — editions (04 upcoming, 01-03 past) — matches web/index.html hardcoded data
insert into editions (idx, album, artist, date, venue, price, capacity, spots_sold, status, attendance, tix_africa_url, tix_africa_event_id)
values
  (4, 'Discovery', 'Daft Punk', '2025-10-18 12:00:00+01', 'PANU, Victoria Island', 15000, 30, 8, 'upcoming', null, 'https://tix.africa/event/side-a-04', 'side-a-04'),
  (3, 'To Pimp a Butterfly', 'Kendrick Lamar', '2025-09-20 12:00:00+01', 'PANU, Victoria Island', 10000, 50, 40, 'past', 40, null, null),
  (2, 'Channel Orange', 'Frank Ocean', '2025-08-23 12:00:00+01', 'Private garden, Ikoyi', 10000, 40, 31, 'past', 31, null, null),
  (1, 'Voodoo', 'D''Angelo', '2025-07-26 12:00:00+01', 'Private garden, Ikoyi', 0, 30, 18, 'past', 18, null, null)
on conflict (idx) do nothing;

-- Songs
insert into songs (week_number, title, artist, picked_by, note, is_current, reaction_repeat, reaction_needed, reaction_skip)
values
  (14, 'Optimistic', 'Sounds of Blackness', 'Tomiwa', 'Put this on during the worst go-slow of my year and made it to the office smiling. Feels like Side A distilled into one song.', true, 18, 11, 2),
  (13, 'Blessed', 'Nina Simone', 'Aisha', 'For anyone who needs reminding that gratitude is also a groove.', false, 9, 14, 0),
  (12, 'Ye', 'Burna Boy', 'Chidi', 'Didn''t get it until the third listen, then it didn''t leave.', false, 21, 6, 1)
on conflict (week_number) do nothing;

-- Comments (use subquery to get song ids)
insert into song_comments (song_id, who, text)
select id, who, text from (
  values
    (14, 'Aisha', 'the horns coming in at 1:40 undid me'),
    (14, 'Chidi', 'been on loop since Sunday, thank you for this'),
    (14, 'Femi', 'underrated album generally, glad it''s getting a moment'),
    (14, 'Bimpe', 'added to my Monday morning playlist immediately'),
    (13, 'Daniel', 'Nina Simone always fixes my week'),
    (13, 'Tomiwa', 'this is going straight into the Side A archive'),
    (12, 'Bimpe', 'third listen is when it always clicks for me too')
) as c(week_number, who, text)
join songs s on s.week_number = c.week_number
on conflict do nothing;

-- Merch
insert into merch_items (sku, name, description, price, stock, sold, status, note, size_options)
values
  ('tote', '"Find your frequency" tote', 'Heavy canvas, one colour print, holds a record sleeve without bending it.', 8000, null, 0, 'preorder', 'Preorder · ships mid Nov', null),
  ('tee', 'Side A tee', 'Plum on cream, front chest print, unisex fit.', 12000, null, 0, 'preorder', 'Preorder · ships mid Nov', '["S","M","L","XL"]'::jsonb),
  ('pin', 'Enamel pin', 'Soft enamel, tracklist motif, butterfly clasp.', 3500, 30, 12, 'in_stock', 'In stock · hand over at Edition 04', null)
on conflict (sku) do nothing;

-- Updates
insert into updates (date, title, description)
values
  ('2025-09-20', 'Edition 03 recap: 40 people, one album, zero skips', 'To Pimp a Butterfly held the room in a way we didn''t expect from a Sunday afternoon. Full recap and photos are up on the Spaces feed.'),
  ('2025-09-12', 'PANU pilot confirmed for Edition 04', 'We''re moving from private gardens to our first proper venue partnership. Capacity goes up to 30 — tickets are live under Editions.'),
  ('2025-09-05', 'Spaces session #8 this Sunday', 'Virtual listening continues between editions — hot takes round plus a closing pick from the room.'),
  ('2025-08-28', 'First two editions, free', 'Editions 01 and 02 ran free while we found our footing. Edition 03 onward carries a small door fee to cover the food.')
on conflict do nothing;
