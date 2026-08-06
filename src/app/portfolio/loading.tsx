/*
  Come per l'area riservata: qualcosa da vedere al clic, invece della pagina
  di prima che resta ferma. Le sagome hanno le misure delle card dell'elenco
  (4:3, raggio 20px), così l'arrivo del contenuto non sposta nulla.
*/
export default function Caricamento() {
  return (
    <main
      className="min-h-svh px-[10px] pb-32 pt-[108px] xl:px-10 xl:pt-[160px]"
      aria-busy="true"
    >
      <p className="text-[26px] leading-[1.2] tracking-[-0.04em] text-grey xl:text-[30px]">
        Caricamento…
      </p>
      <ul className="mt-[65px] grid animate-pulse gap-x-[20px] gap-y-[30px] motion-reduce:animate-none xl:mt-[60px] xl:grid-cols-2 xl:gap-y-[44px]">
        {[0, 1].map((i) => (
          <li key={i}>
            <div className="aspect-[4/3] w-full rounded-[20px] bg-box" />
            <div className="mt-2 h-[22px] w-[120px] rounded bg-box" />
            <div className="mt-1 h-[36px] w-[220px] rounded bg-box" />
          </li>
        ))}
      </ul>
    </main>
  );
}
