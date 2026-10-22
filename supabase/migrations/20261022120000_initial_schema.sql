-- CloudPrep initial schema (docs/DECISIONS.md D-044).
--
-- Content (exams, questions) is written only by the publish script with the service-role key,
-- which bypasses RLS. The repo is the source of truth for questions; never edit them here.
-- User data is private: every user table has RLS limiting rows to auth.uid().
--
-- Every table carries exam_id so more exams can be added later without schema changes.
-- Answers live in question_keys, apart from questions, so they can be locked down when
-- scoring moves to the server.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Exam catalogue
-- ---------------------------------------------------------------------------

create table public.exams (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  code text not null unique,
  name text not null,
  provider text not null,
  question_count integer not null check (question_count > 0),
  scored_question_count integer check (scored_question_count > 0),
  duration_minutes integer not null check (duration_minutes > 0),
  guide_url text check (guide_url ~ '^https://'),
  -- Matches BANK_VERSION in the repo; set after a publish completes. Clients cache by it.
  bank_version text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.exam_domains (
  exam_id text not null references public.exams (id) on delete cascade,
  id text not null,
  number smallint not null check (number > 0),
  name text not null,
  weight_percent numeric(5, 2) not null check (weight_percent > 0 and weight_percent <= 100),
  primary key (exam_id, id),
  unique (exam_id, number)
);

-- Task statements in the CLF-C02 guide; called topics so other exams fit too.
create table public.exam_topics (
  exam_id text not null,
  id text not null,
  domain_id text not null,
  title text not null,
  position smallint not null check (position >= 0),
  primary key (exam_id, id),
  foreign key (exam_id, domain_id) references public.exam_domains (exam_id, id) on delete cascade
);

-- ---------------------------------------------------------------------------
-- Questions
-- ---------------------------------------------------------------------------

-- Current content of each question, without answers or explanations.
-- Questions are never deleted: retiring sets status = 'retired', and IDs are never reused.
create table public.questions (
  id text primary key,
  exam_id text not null references public.exams (id),
  revision integer not null check (revision >= 1),
  type text not null check (type in ('single', 'multiple')),
  domain_id text not null,
  topic_id text not null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  status text not null check (status in ('unverified', 'checked', 'approved', 'retired')),
  stem text not null,
  -- [{ "id": "a", "text": "..." }, ...] in authored order.
  options jsonb not null check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) >= 4),
  required_selections smallint not null check (required_selections >= 1),
  tags text[] not null default '{}',
  last_verified date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (exam_id, domain_id) references public.exam_domains (exam_id, id),
  foreign key (exam_id, topic_id) references public.exam_topics (exam_id, id)
);

create index questions_exam_status_idx on public.questions (exam_id, status);

-- Answers, explanations and sources for the current revision.
create table public.question_keys (
  question_id text primary key references public.questions (id) on delete cascade,
  revision integer not null check (revision >= 1),
  correct_option_ids text[] not null check (cardinality(correct_option_ids) >= 1),
  explanation text not null,
  -- { "<option id>": "why it is right or wrong" }
  option_explanations jsonb not null check (jsonb_typeof(option_explanations) = 'object'),
  -- [{ "title": "...", "url": "https://..." }]
  "references" jsonb not null check (jsonb_typeof("references") = 'array' and jsonb_array_length("references") >= 1),
  review_notes text,
  updated_at timestamptz not null default now()
);

-- Full question content per revision, so past attempts can be reviewed as taken (D-031).
-- `content` has the app's Question shape.
create table public.question_revisions (
  question_id text not null references public.questions (id) on delete cascade,
  revision integer not null check (revision >= 1),
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (question_id, revision)
);

-- ---------------------------------------------------------------------------
-- Users
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 80), ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Only the settings the user changed (D-034); defaults stay in code.
create table public.user_preferences (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  preferences jsonb not null default '{}' check (jsonb_typeof(preferences) = 'object'),
  updated_at timestamptz not null default now()
);

-- User data doesn't reference questions(id): history must survive content changes and
-- imports of local data that mention questions never published.

-- Learning mode: latest state per question (D-019, D-023).
create table public.question_progress (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  exam_id text not null references public.exams (id),
  question_id text not null,
  attempts integer not null check (attempts >= 1),
  correct integer not null check (correct >= 0 and correct <= attempts),
  last_result text not null check (last_result in ('correct', 'incorrect')),
  first_answered_at timestamptz not null,
  last_answered_at timestamptz not null,
  last_incorrect_at timestamptz,
  last_session_id text not null,
  primary key (user_id, question_id),
  check (first_answered_at <= last_answered_at),
  check (last_result = 'incorrect' or correct > 0),
  check (last_result = 'correct' or (correct < attempts and last_incorrect_at is not null))
);

create index question_progress_user_exam_idx on public.question_progress (user_id, exam_id);

create table public.bookmarks (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  exam_id text not null references public.exams (id),
  question_id text not null,
  added_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

create index bookmarks_user_exam_idx on public.bookmarks (user_id, exam_id);

-- Finished learning sessions (summaries only).
create table public.practice_sessions (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null,
  exam_id text not null references public.exams (id),
  label text not null,
  started_at timestamptz not null,
  finished_at timestamptz not null,
  total integer not null check (total >= 0),
  answered integer not null check (answered >= 0 and answered <= total),
  correct integer not null check (correct >= 0 and correct <= answered),
  by_domain jsonb not null default '{}' check (jsonb_typeof(by_domain) = 'object'),
  incorrect_question_ids text[] not null default '{}',
  primary key (user_id, id),
  check (started_at <= finished_at)
);

create index practice_sessions_user_exam_idx on public.practice_sessions (user_id, exam_id, finished_at desc);

-- Submitted exams (ExamAttempt). Scoring is client-side for now; server scoring comes later.
create table public.exam_attempts (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null,
  exam_id text not null references public.exams (id),
  kind text not null check (kind in ('full', 'short')),
  bank_version text not null,
  started_at timestamptz not null,
  ends_at timestamptz not null,
  duration_ms integer not null check (duration_ms > 0),
  submitted_at timestamptz not null,
  submit_reason text not null check (submit_reason in ('manual', 'time_expired', 'expired_while_away', 'proctor_ended')),
  time_used_ms integer not null check (time_used_ms >= 0),
  benchmark_percent smallint not null check (benchmark_percent between 0 and 100),
  benchmark_met boolean not null,
  -- ScoreSummary at submission (D-032).
  summary jsonb not null check (jsonb_typeof(summary) = 'object'),
  unavailable_question_ids text[] not null default '{}',
  -- IntegrityLog: { mode, events: [{ type, at }] }. Never frames, audio or images.
  integrity jsonb not null default '{"mode": "standard", "events": []}' check (jsonb_typeof(integrity) = 'object'),
  created_at timestamptz not null default now(),
  primary key (user_id, id),
  check (started_at <= submitted_at)
);

create index exam_attempts_user_exam_idx on public.exam_attempts (user_id, exam_id, submitted_at desc);

create table public.exam_attempt_questions (
  user_id uuid not null default auth.uid(),
  attempt_id text not null,
  position smallint not null check (position >= 0),
  question_id text not null,
  revision integer not null check (revision >= 1),
  domain_id text not null,
  topic_id text not null,
  selected_option_ids text[] not null default '{}',
  option_order text[] not null,
  flagged boolean not null default false,
  outcome text not null check (outcome in ('correct', 'incorrect', 'unanswered')),
  primary key (user_id, attempt_id, position),
  unique (user_id, attempt_id, question_id),
  foreign key (user_id, attempt_id) references public.exam_attempts (user_id, id) on delete cascade
);

-- The exam in progress (ExamSession), saved on every action. One per user per exam.
create table public.active_exams (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  exam_id text not null references public.exams (id),
  session jsonb not null check (jsonb_typeof(session) = 'object'),
  updated_at timestamptz not null default now(),
  primary key (user_id, exam_id)
);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

create trigger exams_updated_at before update on public.exams
  for each row execute function public.set_updated_at();
create trigger questions_updated_at before update on public.questions
  for each row execute function public.set_updated_at();
create trigger question_keys_updated_at before update on public.question_keys
  for each row execute function public.set_updated_at();
create trigger question_revisions_updated_at before update on public.question_revisions
  for each row execute function public.set_updated_at();
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger user_preferences_updated_at before update on public.user_preferences
  for each row execute function public.set_updated_at();
create trigger active_exams_updated_at before update on public.active_exams
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.exams enable row level security;
alter table public.exam_domains enable row level security;
alter table public.exam_topics enable row level security;
alter table public.questions enable row level security;
alter table public.question_keys enable row level security;
alter table public.question_revisions enable row level security;
alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.question_progress enable row level security;
alter table public.bookmarks enable row level security;
alter table public.practice_sessions enable row level security;
alter table public.exam_attempts enable row level security;
alter table public.exam_attempt_questions enable row level security;
alter table public.active_exams enable row level security;

-- Content: readable by everyone (guests use Learning mode), only for published exams
-- and visible statuses. No write policies: only the service role writes content.
create policy "Published exams are readable" on public.exams
  for select to anon, authenticated
  using (is_published);

create policy "Domains of published exams are readable" on public.exam_domains
  for select to anon, authenticated
  using (exists (select 1 from public.exams e where e.id = exam_id));

create policy "Topics of published exams are readable" on public.exam_topics
  for select to anon, authenticated
  using (exists (select 1 from public.exams e where e.id = exam_id));

create policy "Visible questions are readable" on public.questions
  for select to anon, authenticated
  using (
    status in ('unverified', 'checked', 'approved')
    and exists (select 1 from public.exams e where e.id = exam_id)
  );

-- Temporary: answers are readable while scoring is client-side. Server scoring will
-- replace this policy.
create policy "Keys of visible questions are readable" on public.question_keys
  for select to anon, authenticated
  using (exists (select 1 from public.questions q where q.id = question_id));

-- Signed-in users can review any revision, including retired questions from past attempts.
create policy "Revisions are readable when signed in" on public.question_revisions
  for select to authenticated
  using (true);

-- User data: each user sees and changes only their own rows.
create policy "Own profile is readable" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));
create policy "Own profile is updatable" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "Own preferences" on public.user_preferences
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Own question progress" on public.question_progress
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Own bookmarks" on public.bookmarks
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Own practice sessions" on public.practice_sessions
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Own exam attempts" on public.exam_attempts
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Own exam attempt questions" on public.exam_attempt_questions
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Own active exams" on public.active_exams
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Grants (explicit, on top of RLS)
-- ---------------------------------------------------------------------------

revoke all on
  public.exams, public.exam_domains, public.exam_topics, public.questions, public.question_keys,
  public.question_revisions, public.profiles, public.user_preferences, public.question_progress,
  public.bookmarks, public.practice_sessions, public.exam_attempts, public.exam_attempt_questions,
  public.active_exams
from anon, authenticated;

grant select on
  public.exams, public.exam_domains, public.exam_topics, public.questions, public.question_keys
to anon, authenticated;

grant select on public.question_revisions to authenticated;
grant select, update (display_name) on public.profiles to authenticated;

grant select, insert, update, delete on
  public.user_preferences, public.question_progress, public.bookmarks, public.practice_sessions,
  public.exam_attempts, public.exam_attempt_questions, public.active_exams
to authenticated;

grant all on
  public.exams, public.exam_domains, public.exam_topics, public.questions, public.question_keys,
  public.question_revisions, public.profiles, public.user_preferences, public.question_progress,
  public.bookmarks, public.practice_sessions, public.exam_attempts, public.exam_attempt_questions,
  public.active_exams
to service_role;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
