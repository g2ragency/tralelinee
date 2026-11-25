-- Portfolio aperto a tutti (richiesta di Veronika, 25/11/2026): niente più
-- account per vederlo. Il login resta solo per l'amministrazione.
--
-- Chi non è entrato (ruolo anon) legge i progetti PUBBLICATI e, di questi, i
-- blocchi VISIBILI. Bozze e blocchi nascosti restano leggibili solo dal super
-- admin, come prima. La scrittura non cambia: solo il super admin.

grant usage on schema public to anon;
grant select on public.projects, public.project_sections to anon;

drop policy if exists "progetti: lettura approvati" on public.projects;
create policy "progetti: lettura pubblicati" on public.projects
  for select using (published or public.is_super_admin());

drop policy if exists "sezioni: lettura approvati" on public.project_sections;
create policy "sezioni: lettura pubblicate" on public.project_sections
  for select using (
    public.is_super_admin()
    or (
      visible
      and exists (
        select 1 from public.projects p
        where p.id = project_sections.project_id and p.published
      )
    )
  );

-- Permessi che le API non usano e nessuno deve avere: TRUNCATE salta le RLS.
revoke truncate, trigger, references on public.projects, public.project_sections
  from anon, authenticated;

-- Immagine che compare al passaggio del mouse sulla copertina, nell'elenco
-- del portfolio (le ha preparate Fabio, 25/11/2026). Facoltativa.
alter table public.projects add column if not exists hover_path text;
