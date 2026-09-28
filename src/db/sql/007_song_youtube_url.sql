-- 007: songs carry an optional YouTube link (logo + inline embed in web UIs).
alter table songs add column if not exists youtube_url text;
