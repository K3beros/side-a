-- 003_edition_name_kind.sql — editions: name + virtual/physical tag + meta
alter table editions
  add column if not exists name text not null default '',
  add column if not exists kind text not null default 'physical' check (kind in ('physical','virtual')),
  add column if not exists meta jsonb null;

update editions set name = 'Edition ' || lpad(idx::text, 2, '0') || ' — ' || album where name = '';

create index if not exists idx_editions_kind on editions(kind);
