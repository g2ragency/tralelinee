/*
  Risultato di un'azione dell'area riservata, mostrato da `FormAzione`.
  `ok` è il messaggio di conferma, `errore` quello da far vedere in rosso.
*/
export type Esito = { ok?: string; errore?: string } | undefined;

type ErroreDb = { code?: string; message: string } | null;

/*
  Traduce l'errore di Supabase in una frase per chi usa l'admin. I codici sono
  quelli di Postgres: 23505 = valore già presente dove deve essere unico,
  42501 = permesso negato dalle regole di accesso.
*/
export function spiega(errore: ErroreDb, cosa = "Salvataggio"): Esito {
  if (!errore) return undefined;
  if (errore.code === "23505")
    return { errore: "Questo indirizzo è già usato da un altro progetto: scegline un altro." };
  if (errore.code === "42501")
    return { errore: `${cosa} rifiutato: la sessione potrebbe essere scaduta. Ricarica la pagina e rientra.` };
  return { errore: `${cosa} non riuscito: ${errore.message}` };
}

/*
  Un update che le regole di accesso escludono non dà errore: semplicemente
  non tocca nessuna riga. Per accorgersene si chiede indietro la riga.
*/
export const nessunaRiga = (cosa = "Salvataggio"): Esito => ({
  errore: `${cosa} non riuscito: elemento non trovato o permessi insufficienti. Ricarica la pagina.`,
});
