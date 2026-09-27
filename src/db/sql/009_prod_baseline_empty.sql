-- 009: production baseline = empty domain tables.
-- Neutralizes the 002_domain.sql demo seed (and any dev-inserted rows) on every
-- database this migration runs on. Predicate-free TRUNCATE so it is idempotent
-- and safe to run on fresh databases (seed rows may not exist yet — TRUNCATE
-- does not care). The migrations ledger itself is intentionally preserved.
-- All PKs are uuids: no sequences/identity columns to restart.

truncate table
  editions,
  songs,
  song_comments,
  song_reactions,
  recommendations,
  recommendation_votes,
  merch_items,
  merch_orders,
  updates,
  users
cascade;
