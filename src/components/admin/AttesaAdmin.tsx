/*
  Cosa si vede mentre una pagina dell'area riservata arriva.

  Senza un confine di attesa, al clic non succede NIENTE finché il server non
  ha finito: il browser resta sulla pagina di prima e chi ha cliccato non sa
  se il clic è stato raccolto.

  Un solo `loading.tsx` in cima all'area non basta: il confine si presenta
  entrando nel sottoalbero, non muovendosi al suo interno. Misurato — aprire
  un progetto dall'elenco non mostrava nulla, mentre entrare in /admin sì.
  Per questo ogni rotta ha il suo `loading.tsx` che rimanda qui, invece di
  ricopiare le sagome quattro volte.
*/
export function AttesaAdmin() {
  return (
    <main className="min-h-svh px-6 py-32 xl:px-10" aria-busy="true">
      <p className="text-[18px] tracking-[-0.72px] text-grey">Caricamento…</p>

      {/* Sagome al posto del contenuto: la pagina non "salta" quando arriva */}
      <div className="mt-10 max-w-[720px] animate-pulse motion-reduce:animate-none">
        <div className="h-[52px] w-[280px] rounded bg-box" />
        <div className="mt-10 flex flex-col gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-[56px] w-full rounded bg-box" />
          ))}
        </div>
      </div>
    </main>
  );
}
