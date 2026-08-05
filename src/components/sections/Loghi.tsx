"use client";

import { useEffect, useRef, useState } from "react";

/* Pixel al secondo: la velocità resta questa qualunque sia il numero di loghi. */
const VELOCITA = 40;

/*
  Righe di loghi che scorrono all'infinito, la prima verso sinistra e la
  seconda verso destra.

  Il gruppo di loghi è stampato DUE volte e la pista trasla di metà della
  propria larghezza: al termine dell'animazione la seconda copia si trova
  esattamente dove stava la prima, quindi il salto di ritorno non si vede.

  La durata si calcola dalla larghezza misurata invece di essere fissa: con
  una durata fissa, più loghi significherebbe scorrimento più veloce.
*/
function Riga({ urls, verso }: { urls: string[]; verso: "sinistra" | "destra" }) {
  const pista = useRef<HTMLDivElement>(null);
  const [durata, setDurata] = useState(0);

  useEffect(() => {
    const el = pista.current;
    if (!el) return;
    // Le immagini arrivano dopo: si rimisura quando la pista cambia larghezza.
    const misura = () => setDurata(el.scrollWidth / 2 / VELOCITA);
    misura();
    const ro = new ResizeObserver(misura);
    ro.observe(el);
    return () => ro.disconnect();
  }, [urls]);

  return (
    <div className="overflow-hidden">
      <div
        ref={pista}
        style={durata ? { animationDuration: `${durata}s` } : undefined}
        className={`flex w-max items-center gap-10 xl:gap-[60px] ${
          verso === "sinistra" ? "animate-scorri-sx" : "animate-scorri-dx"
        }`}
      >
        {/* aria-hidden sulla seconda copia: è un doppione grafico */}
        {[0, 1].map((copia) => (
          <div
            key={copia}
            aria-hidden={copia === 1}
            className="flex shrink-0 items-center gap-10 xl:gap-[60px]"
          >
            {urls.map((url, i) => (
              /* eslint-disable-next-line @next/next/no-img-element --
                 URL firmato a scadenza: next/image lo cacherebbe oltre la
                 validità. */
              <img
                key={i}
                src={url}
                alt=""
                /* Tetto, non altezza fissa: ogni logo resta della misura con
                   cui è stato preparato, e solo quelli troppo alti vengono
                   ricondotti. Così il bilanciamento fra i marchi lo decide
                   chi carica i file. */
                className="max-h-[32px] w-auto shrink-0 object-contain xl:max-h-[44px]"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Loghi({ titolo, righe }: { titolo: string; righe: string[][] }) {
  const piene = righe.filter((r) => r.length > 0);
  if (piene.length === 0) return null;

  return (
    <section>
      {titolo && (
        /* Figma: Regular 30px, interlinea 120%, spaziatura -4%, centrato,
           68px sopra le righe */
        <p className="pb-[68px] text-center text-[22px] leading-[1.2] tracking-[-0.04em] xl:text-[30px]">
          {titolo}
        </p>
      )}
      {/* 44px fra una riga e l'altra */}
      <div className="flex flex-col gap-[44px]">
        {piene.map((urls, i) => (
          <Riga
            key={i}
            urls={urls}
            verso={i % 2 === 0 ? "sinistra" : "destra"}
          />
        ))}
      </div>
    </section>
  );
}
