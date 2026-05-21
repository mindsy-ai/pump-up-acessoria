
create table public.form_leads (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_step_completed integer not null default 0,
  is_completed boolean not null default false,
  form_data jsonb not null default '{}'::jsonb
);

create index form_leads_created_at_idx on public.form_leads (created_at desc);

alter table public.form_leads enable row level security;

-- Anonymous tracking: anyone can insert/update (gated by unique session_id)
create policy "anyone can insert leads"
  on public.form_leads for insert
  to anon, authenticated
  with check (true);

create policy "anyone can update leads"
  on public.form_leads for update
  to anon, authenticated
  using (true)
  with check (true);

-- Only authenticated users (admins) can read
create policy "authenticated can read leads"
  on public.form_leads for select
  to authenticated
  using (true);
