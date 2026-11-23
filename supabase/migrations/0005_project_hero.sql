-- Immagine (o video) in apertura della pagina del progetto, separata dalla
-- copertina: la copertina è la card dell'elenco, l'apertura è la prima cosa
-- che si vede entrando nel progetto, e devono poter essere diverse
-- (richiesta di Veronika, 23/11/2026). Facoltativa: vuota, la pagina parte
-- dal titolo e poi dai blocchi.
alter table public.projects add column if not exists hero_path text;
