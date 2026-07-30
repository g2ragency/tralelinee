-- Portfolio: progetti + sezioni del case study.
--
-- Sostituisce portfolio_sections (tabella piatta, mai popolata) con un modello
-- a due livelli: un progetto ha molte sezioni ordinate.

drop table if exists public.portfolio_sections;

-- ===========================================================================
-- Tabelle
-- ===========================================================================

create table public.projects (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  title      text not null,
  client     text,
  summary    text,
  cover_path text,                                  -- path nel bucket privato
  position   integer not null default 0,
  published  boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.projects is
  'Progetti del portfolio riservato. published=false => visibile solo al super admin.';

create table public.project_sections (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  kind       text not null,                          -- chiave nel registro dei tipi
  position   integer not null default 0,
  content    jsonb not null default '{}'::jsonb,
  visible    boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.project_sections is
  'Blocchi del case study. kind corrisponde a una voce di src/lib/sections/registry.ts.';

create index projects_position_idx on public.projects (position);
create index project_sections_project_idx
  on public.project_sections (project_id, position);

-- updated_at automatico, riusando la funzione della 0001
create trigger projects_touch
  before update on public.projects
  for each row execute function public.touch_updated_at();

create trigger project_sections_touch
  before update on public.project_sections
  for each row execute function public.touch_updated_at();

-- ===========================================================================
-- GRANT — servono OLTRE alle RLS: senza, PostgREST risponde 42501 e la policy
-- non viene nemmeno valutata (vedi 0002_grants.sql). Niente per anon: il
-- portfolio è interamente riservato.
-- ===========================================================================

grant select, insert, update, delete on public.projects         to authenticated;
grant select, insert, update, delete on public.project_sections to authenticated;

-- ===========================================================================
-- RLS
-- ===========================================================================

alter table public.projects         enable row level security;
alter table public.project_sections enable row level security;

-- Helper: l'utente corrente è approvato? Stesso motivo di is_super_admin():
-- SECURITY DEFINER per non incrociare le policy di profiles.
create or replace function public.is_approved()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and approved
  );
$$;

-- projects ------------------------------------------------------------------
-- Gli approvati vedono solo i pubblicati; l'admin vede anche le bozze.
create policy "progetti: lettura approvati" on public.projects
  for select using (
    public.is_super_admin() or (published and public.is_approved())
  );

create policy "progetti: scrive solo admin" on public.projects
  for all using (public.is_super_admin())
  with check (public.is_super_admin());

-- project_sections ----------------------------------------------------------
-- Una sezione è leggibile se lo è il suo progetto: la condizione sul padre
-- evita che una sezione di una bozza sfugga.
create policy "sezioni: lettura approvati" on public.project_sections
  for select using (
    public.is_super_admin()
    or (
      visible
      and public.is_approved()
      and exists (
        select 1 from public.projects p
        where p.id = project_id and p.published
      )
    )
  );

create policy "sezioni: scrive solo admin" on public.project_sections
  for all using (public.is_super_admin())
  with check (public.is_super_admin());
