-- 008: merch publish workflow. New items are drafts (hidden from public)
-- until explicitly published. Defaults false so existing rows stay hidden
-- until a stakeholder publishes them.
alter table merch_items add column if not exists is_published boolean not null default false;
