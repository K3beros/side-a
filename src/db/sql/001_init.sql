-- 001_init.sql — baseline
-- Add new migrations as 002_*.sql, 003_*.sql ... never edit an applied file.

create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);
