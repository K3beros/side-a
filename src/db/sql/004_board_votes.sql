-- 004_board_votes.sql — board: top-12 voted submissions, weekly reset, Google-gated votes
alter table recommendations
  add column if not exists upvotes int not null default 0 check (upvotes >= 0),
  add column if not exists downvotes int not null default 0 check (downvotes >= 0),
  add column if not exists score int generated always as (upvotes - downvotes) stored,
  add column if not exists picked_as_song_id uuid null references songs(id);

create table if not exists recommendation_votes (
  id uuid primary key default gen_random_uuid(),
  recommendation_id uuid not null references recommendations(id) on delete cascade,
  google_user_id text not null,
  direction text not null check (direction in ('up','down')),
  created_at timestamptz not null default now(),
  unique (recommendation_id, google_user_id)
);

create index if not exists idx_recommendations_score on recommendations(score desc, created_at asc);
create index if not exists idx_recommendations_status on recommendations(status);
