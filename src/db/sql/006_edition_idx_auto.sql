-- 006_edition_idx_auto.sql — editions idx is server-assigned (max+1) via advisory lock; client no longer supplies idx
-- idx stays int unique for display (01, 02, …), identity is uuid id. See admin routes advisory lock.
create unique index if not exists idx_editions_idx_unique on editions(idx);
