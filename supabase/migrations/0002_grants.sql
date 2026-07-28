-- Permessi di tabella mancanti nella 0001.
--
-- RLS e GRANT sono due livelli diversi: il GRANT dice "questo ruolo può
-- toccare la tabella", la policy RLS dice "queste righe". Senza GRANT,
-- PostgREST risponde 42501 "permission denied" e la policy non viene
-- nemmeno valutata. Le tabelle create dalla UI di Supabase ricevono questi
-- grant in automatico; quelle create da SQL no.
--
-- Nessun GRANT ad `anon`: niente qui è pubblico.

grant usage on schema public to authenticated;

-- Nessun INSERT: i profili li crea il trigger handle_new_user (SECURITY
-- DEFINER), così un utente non può fabbricarsi una riga con approved=true.
grant select, update, delete on public.profiles to authenticated;

grant select, insert, update, delete on public.approved_emails to authenticated;
grant select, insert, update, delete on public.portfolio_sections to authenticated;
