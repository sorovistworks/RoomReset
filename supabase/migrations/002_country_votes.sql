-- Habitaste "bring it to my country" votes.
-- The site is static, so the browser calls these functions directly with the public (publishable/anon) key.
-- Anon can execute the two functions below and nothing else: it can't read or write the table directly.

-- 1. Now that the public key ships to browsers, it must not be able to write the waitlist directly
--    (that would skip the server's bot checks and rate limit). The server uses SUPABASE_SECRET_KEY instead.
drop policy if exists "Anyone can join the waitlist" on public.waitlist;
revoke all on table public.waitlist from anon, authenticated;

-- 2. One vote per internet connection. We keep a salted SHA-256 of the IP, never the IP itself;
--    the salt lives in a schema the API doesn't expose, so the hash can't be reversed by guessing IPs.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table if not exists private.vote_salt (salt text not null);
insert into private.vote_salt (salt)
  select gen_random_uuid()::text || gen_random_uuid()::text
  where not exists (select 1 from private.vote_salt);

create table if not exists public.country_votes (
  voter text primary key,
  country text not null,
  updated_at timestamptz not null default now(),
  constraint country_votes_code check (country ~ '^[A-Z]{2}$' and country <> 'IN')
);
alter table public.country_votes enable row level security;
revoke all on table public.country_votes from anon, authenticated;
-- No policies: only the security-definer functions below touch this table.

create or replace function public.country_vote_totals()
returns table (country text, votes bigint)
language sql stable security definer set search_path = ''
as $$
  select v.country, count(*) from public.country_votes v group by v.country order by 2 desc, 1;
$$;

-- Records (or changes) this connection's vote and returns the new totals.
create or replace function public.vote_country(p_country text)
returns table (country text, votes bigint)
language plpgsql volatile security definer set search_path = ''
as $$
#variable_conflict use_column
declare
  h json := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json;
  ip text := coalesce(h->>'cf-connecting-ip', nullif(trim(split_part(h->>'x-forwarded-for', ',', 1)), ''), 'unknown');
  code text := upper(trim(coalesce(p_country, '')));
begin
  if code !~ '^[A-Z]{2}$' or code = 'IN' then
    raise exception 'Choose a country outside India.' using errcode = '22023';
  end if;
  insert into public.country_votes (voter, country)
  values (encode(sha256(convert_to((select s.salt from private.vote_salt s limit 1) || ip, 'UTF8')), 'hex'), code)
  on conflict (voter) do update set country = excluded.country, updated_at = now();
  return query select * from public.country_vote_totals();
end;
$$;

revoke all on function public.country_vote_totals() from public;
revoke all on function public.vote_country(text) from public;
grant execute on function public.country_vote_totals() to anon, authenticated;
grant execute on function public.vote_country(text) to anon, authenticated;
