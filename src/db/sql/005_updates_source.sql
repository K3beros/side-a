-- 005_updates_source.sql — updates: manual multi-source (instagram, youtube, twitter_spaces)
alter table updates
  add column if not exists source text not null default 'side_a' check (source in ('side_a','instagram','youtube','twitter_spaces','other')),
  add column if not exists source_url text null,
  add column if not exists meta jsonb null;

create index if not exists idx_updates_source on updates(source);
