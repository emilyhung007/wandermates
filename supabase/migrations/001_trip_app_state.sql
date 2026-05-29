-- Optional: dedicated JSON columns (app currently syncs via public.trips.destinations).
-- Run in Supabase SQL Editor if you prefer a normalized payload column.

alter table public.trips
  add column if not exists itinerary jsonb,
  add column if not exists expenses jsonb,
  add column if not exists settlement jsonb,
  add column if not exists trip_meta jsonb;
