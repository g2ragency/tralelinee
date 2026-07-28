import { createBrowserClient } from "@supabase/ssr";

/*
  Client Supabase per i componenti "use client".
  Ritorna null se le variabili non ci sono: senza questo controllo un ambiente
  non configurato manderebbe in errore ogni pagina che monta l'header.
*/
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createBrowserClient(url, anonKey);
}
