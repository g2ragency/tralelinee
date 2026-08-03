-- Categoria del progetto: alimenta i filtri dell'elenco portfolio
-- («Tutti i progetti, Portfolio, Case Studies»).
--
-- Nota sui permessi: qui NON servono nuovi GRANT. Quelli della 0002 sono a
-- livello di tabella, quindi valgono anche per le colonne aggiunte dopo. Se un
-- giorno si passasse a grant per colonna, questa aggiunta andrebbe ripetuta lì.

alter table public.projects
  add column if not exists category text not null default 'case_study';

alter table public.projects
  drop constraint if exists projects_category_check;

alter table public.projects
  add constraint projects_category_check
  check (category in ('portfolio', 'case_study'));

-- L'elenco filtra per categoria e ordina per posizione.
create index if not exists projects_category_idx
  on public.projects (category, position);
