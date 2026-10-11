-- RoomReset early-access waitlist.
-- The site inserts with the anon/publishable key from the server. RLS allows INSERT only:
-- nobody using that key can read, update or delete rows. Review sign-ups in the Supabase dashboard.

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  first_name text,
  style_id text,
  source text,
  consent_at timestamptz not null,
  policy_version text not null,
  created_at timestamptz not null default now(),
  constraint waitlist_email_lower check (email = lower(email)),
  constraint waitlist_email_format check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 254),
  constraint waitlist_first_name_len check (first_name is null or char_length(first_name) <= 60),
  constraint waitlist_style_len check (style_id is null or char_length(style_id) <= 40),
  constraint waitlist_source_len check (source is null or char_length(source) <= 80),
  constraint waitlist_policy_len check (char_length(policy_version) <= 20)
);

-- Duplicate sign-ups fail with 23505, which the API reports as "already on the list".
create unique index if not exists waitlist_email_key on public.waitlist (email);

alter table public.waitlist enable row level security;

revoke all on table public.waitlist from anon, authenticated;
grant insert (email, first_name, style_id, source, consent_at, policy_version) on table public.waitlist to anon;

drop policy if exists "Anyone can join the waitlist" on public.waitlist;
create policy "Anyone can join the waitlist"
  on public.waitlist for insert to anon
  with check (true);
-- No SELECT/UPDATE/DELETE policies exist, so submitted emails are never publicly readable.
