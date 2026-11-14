-- Admin overview of signed-in users (docs/DECISIONS.md D-054).
--
-- Admins are listed in public.admins. Nobody can read or write that table through the API
-- (RLS on, no policies, no grants): add an admin in the Supabase SQL editor (docs/DEPLOYMENT.md).
-- The overview is a security-definer function that checks the caller is an admin, so the
-- other users' data never leaves the database for anyone else. Guests aren't recorded.

create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  added_at timestamptz not null default now()
);

alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;

-- True when the signed-in user is an admin.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- One row per account with activity totals. Raises 42501 for anyone who isn't an admin.
create function public.admin_user_overview()
returns table (
  user_id uuid,
  email text,
  display_name text,
  provider text,
  signed_up_at timestamptz,
  last_sign_in_at timestamptz,
  questions_answered integer,
  last_answered_at timestamptz,
  practice_sessions integer,
  exam_attempts integer,
  best_exam_percent numeric,
  last_exam_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Admins only.' using errcode = '42501';
  end if;
  return query
  select
    u.id,
    u.email::text,
    coalesce(p.display_name, nullif(u.raw_user_meta_data ->> 'full_name', '')),
    u.raw_app_meta_data ->> 'provider',
    u.created_at,
    u.last_sign_in_at,
    coalesce(qp.answered, 0),
    qp.last_at,
    coalesce(ps.sessions, 0),
    coalesce(ea.attempts, 0),
    ea.best,
    ea.last_at
  from auth.users u
  left join public.profiles p on p.id = u.id
  left join lateral (
    select count(*)::integer as answered, max(q.last_answered_at) as last_at
    from public.question_progress q where q.user_id = u.id
  ) qp on true
  left join lateral (
    select count(*)::integer as sessions
    from public.practice_sessions s where s.user_id = u.id
  ) ps on true
  left join lateral (
    select
      count(*)::integer as attempts,
      -- Proctor-ended attempts are void (D-043), so they don't count for the best score.
      max((a.summary ->> 'percent')::numeric) filter (where a.submit_reason <> 'proctor_ended') as best,
      max(a.submitted_at) as last_at
    from public.exam_attempts a where a.user_id = u.id
  ) ea on true
  order by u.created_at;
end;
$$;

revoke execute on function public.admin_user_overview() from public, anon;
grant execute on function public.admin_user_overview() to authenticated;
