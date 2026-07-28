-- Tralelinee — schema iniziale: account, whitelist, contenuti portfolio.
-- Vedi PLANNING.md §Ruoli e permessi.
--
-- Modello: chi si registra resta "in attesa" finché un super admin non lo
-- approva, TRANNE se la sua email è in approved_emails (auto-approvazione).

-- ===========================================================================
-- Tabelle
-- ===========================================================================

create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  role       text not null default 'user' check (role in ('user', 'super_admin')),
  approved   boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.profiles is
  'Un record per utente registrato. approved=false => vede solo il sito pubblico.';

-- Whitelist: email che vengono approvate automaticamente alla registrazione.
create table public.approved_emails (
  email      text primary key,
  note       text,
  created_at timestamptz not null default now()
);

comment on table public.approved_emails is
  'Email pre-autorizzate: il trigger di registrazione le approva subito.';

-- Contenuti dinamici della pagina portfolio, gestiti dal super admin.
create table public.portfolio_sections (
  id         uuid primary key default gen_random_uuid(),
  kind       text not null,
  position   integer not null default 0,
  content    jsonb not null default '{}'::jsonb,
  visible    boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index portfolio_sections_position_idx
  on public.portfolio_sections (position)
  where visible;

-- ===========================================================================
-- Helper: chi sta chiamando è super admin?
--
-- SECURITY DEFINER + search_path bloccato: senza questo, una policy su
-- profiles che interroga profiles va in ricorsione infinita.
-- ===========================================================================

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_admin'
  );
$$;

-- Stessa ragione: serve leggere approved_emails da dentro un trigger senza
-- che le policy della tabella blocchino l'inserimento.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, approved)
  values (
    new.id,
    new.email,
    exists (select 1 from public.approved_emails where email = new.email)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at automatico sui contenuti
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger portfolio_sections_touch
  before update on public.portfolio_sections
  for each row execute function public.touch_updated_at();

-- ===========================================================================
-- GRANT (necessari oltre alle RLS: vedi 0002_grants.sql)
-- ===========================================================================

grant usage on schema public to authenticated;
grant select, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.approved_emails to authenticated;
grant select, insert, update, delete on public.portfolio_sections to authenticated;

-- ===========================================================================
-- RLS
-- ===========================================================================

alter table public.profiles           enable row level security;
alter table public.approved_emails    enable row level security;
alter table public.portfolio_sections enable row level security;

-- profiles ------------------------------------------------------------------
-- Ognuno legge sé stesso; il super admin legge tutti.
create policy "profili: leggo il mio" on public.profiles
  for select using (id = auth.uid() or public.is_super_admin());

-- Solo il super admin cambia ruolo e stato di approvazione.
-- (Nessuna policy di update per l'utente: non può auto-approvarsi.)
create policy "profili: solo admin modifica" on public.profiles
  for update using (public.is_super_admin())
  with check (public.is_super_admin());

create policy "profili: solo admin elimina" on public.profiles
  for delete using (public.is_super_admin());

-- approved_emails -----------------------------------------------------------
-- Riservata all'admin. Il trigger la legge comunque, perché è SECURITY DEFINER.
create policy "whitelist: solo admin" on public.approved_emails
  for all using (public.is_super_admin())
  with check (public.is_super_admin());

-- portfolio_sections --------------------------------------------------------
-- Lettura: solo utenti approvati (o admin), e solo sezioni visibili.
create policy "portfolio: leggono gli approvati" on public.portfolio_sections
  for select using (
    public.is_super_admin()
    or (
      visible
      and exists (
        select 1 from public.profiles
        where id = auth.uid() and approved
      )
    )
  );

create policy "portfolio: scrive solo admin" on public.portfolio_sections
  for all using (public.is_super_admin())
  with check (public.is_super_admin());

-- ===========================================================================
-- Storage: media del portfolio
-- ===========================================================================

insert into storage.buckets (id, name, public)
values ('portfolio-media', 'portfolio-media', false)
on conflict (id) do nothing;

create policy "media: leggono gli approvati" on storage.objects
  for select using (
    bucket_id = 'portfolio-media'
    and (
      public.is_super_admin()
      or exists (
        select 1 from public.profiles
        where id = auth.uid() and approved
      )
    )
  );

create policy "media: carica solo admin" on storage.objects
  for insert with check (
    bucket_id = 'portfolio-media' and public.is_super_admin()
  );

create policy "media: modifica solo admin" on storage.objects
  for update using (
    bucket_id = 'portfolio-media' and public.is_super_admin()
  );

create policy "media: elimina solo admin" on storage.objects
  for delete using (
    bucket_id = 'portfolio-media' and public.is_super_admin()
  );
