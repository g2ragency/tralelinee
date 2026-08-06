/*
  Cosa si vede mentre la pagina arriva.

  Senza questo file, passando da una pagina all'altra non succede NIENTE
  finché il server non ha finito: il browser resta sulla pagina di prima e
  chi ha cliccato non sa se il clic è stato raccolto. Next mostra questo
  subito, al clic, e lo sostituisce quando la pagina è pronta.

  Vale per tutta l'area riservata, sottocartelle comprese.
*/
export default function Caricamento() {
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
