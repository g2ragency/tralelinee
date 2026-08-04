"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import Link from "next/link";

export type Scheda = {
  id: string;
  slug: string;
  title: string;
  client: string | null;
  category: string | null;
  cover: string | null;
};

type Categoria = { chiave: string; label: string };

const USCITA = 180;

const indirizzo = (chiave: string) =>
  chiave ? `/portfolio?categoria=${chiave}` : "/portfolio";

/*
  Elenco e filtri.

  Le schede arrivano tutte insieme dal server e il filtro lavora qui: con una
  navigazione, ogni clic sarebbe un giro di rete — query, firma delle
  copertine, nuovo albero — e il cambio si sentirebbe. Il portfolio è un
  elenco corto, quindi tenerlo tutto in pagina costa meno del ritardo.

  L'indirizzo resta allineato con la History API, senza passare dal router:
  così il link è condivisibile e il tasto Indietro fa quello che ci si aspetta,
  ma non parte nessuna richiesta.
*/
export function ElencoProgetti({
  schede,
  categorie,
  iniziale,
  azioni,
}: {
  schede: Scheda[];
  categorie: Categoria[];
  iniziale: string;
  azioni: ReactNode;
}) {
  const [attiva, setAttiva] = useState(iniziale);
  const [uscita, setUscita] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Indietro/Avanti del browser: l'indirizzo cambia senza passare da noi.
  useEffect(() => {
    const sync = () => {
      const c = new URLSearchParams(location.search).get("categoria") ?? "";
      setAttiva(categorie.some((x) => x.chiave === c) ? c : "");
    };
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, [categorie]);

  useEffect(
    () => () => void (timer.current && clearTimeout(timer.current)),
    [],
  );

  const scegli = (e: MouseEvent<HTMLAnchorElement>, chiave: string) => {
    // ctrl/cmd/shift o tasto centrale: apre in una scheda nuova, non tocca a noi
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    if (chiave === attiva) return;

    window.history.pushState({}, "", indirizzo(chiave));
    // Prima l'uscita, poi il cambio: senza questa pausa le schede vecchie
    // sparirebbero di colpo, che è esattamente quello che si voleva evitare.
    setUscita(true);
    timer.current = setTimeout(() => {
      setAttiva(chiave);
      setUscita(false);
    }, USCITA);
  };

  const visibili = attiva
    ? schede.filter((s) => s.category === attiva)
    : schede;

  return (
    /*
      Su mobile i comandi di servizio stanno in fondo alla pagina: nella riga
      dei filtri andrebbero a capo fra i filtri e le card, sballando sia i
      50px sotto l'header sia i 65px prima della griglia. Da desktop tornano
      in alto a destra, in posizione assoluta: così restano un elemento solo
      nel markup invece di essere stampati due volte.
    */
    <div className="relative flex flex-col">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-4">
        {/* Figma: Regular, interlinea 120%, spaziatura -4%; 26px su mobile e
            30px da desktop. La voce attiva è bianca e sottolineata. */}
        <p className="text-[26px] leading-[1.2] tracking-[-0.04em] text-grey xl:text-[30px]">
          {categorie.map((c, i) => (
            <span key={c.chiave || "tutti"}>
              {i > 0 && ", "}
              <Link
                href={indirizzo(c.chiave)}
                onClick={(e) => scegli(e, c.chiave)}
                aria-current={attiva === c.chiave ? "page" : undefined}
                className={`transition-colors duration-200 hover:text-foreground ${
                  attiva === c.chiave ? "text-foreground underline" : ""
                }`}
              >
                {c.label}
              </Link>
            </span>
          ))}
        </p>
      </div>

      <div
        /* La chiave rimonta la griglia al cambio: è quello che fa ripartire
           l'animazione d'entrata delle schede. */
        key={attiva}
        className={`griglia-entra transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none ${
          uscita ? "translate-y-2 opacity-0" : "opacity-100"
        }`}
      >
        {visibili.length === 0 ? (
          <p className="mt-16 text-[18px] tracking-[-0.72px] text-grey">
            {attiva
              ? "Nessun progetto in questa categoria."
              : "Nessun progetto pubblicato al momento."}
          </p>
        ) : (
          /* Figma: sotto la riga dei filtri 65px su mobile e 60px da desktop;
             20px fra le colonne; fra le righe 30px su mobile e 44px da desktop */
          <ul className="mt-[65px] grid gap-x-[20px] gap-y-[30px] xl:mt-[60px] xl:grid-cols-2 xl:gap-y-[44px]">
            {visibili.map((p) => (
              <li key={p.id}>
                <Link href={`/portfolio/${p.slug}`} className="block">
                  {p.cover ? (
                    /* eslint-disable-next-line @next/next/no-img-element --
                       URL firmato a scadenza: next/image lo rifirmerebbe e
                       scadrebbe in cache. */
                    <img
                      src={p.cover}
                      alt=""
                      className="aspect-[4/3] w-full rounded-[20px] object-cover"
                    />
                  ) : (
                    <div className="aspect-[4/3] w-full rounded-[20px] bg-box" />
                  )}
                  {/* 8px fra copertina e cliente, poi il titolo attaccato.
                      Senza cliente resta una riga vuota, così i titoli di due
                      schede affiancate restano sulla stessa linea. */}
                  <p className="mt-2 text-[18px] leading-[1.2] tracking-[-0.04em] text-grey">
                    {p.client ?? " "}
                  </p>
                  {/* Regular, lh 120%, ls -4%: 26px su mobile, 30px da desktop */}
                  <h2 className="text-[26px] leading-[1.2] tracking-[-0.04em] xl:text-[30px]">
                    {p.title}
                  </h2>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-16 xl:absolute xl:right-0 xl:top-[10px] xl:mt-0">
        {azioni}
      </div>
    </div>
  );
}
