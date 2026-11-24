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
  /*
    Quante volte il gruppo di loghi sta in ciascuna metà della pista. Se una
    metà è più corta dello schermo, mentre scorre resta un buco prima che
    ricominci (Veronika, 24/11): si ripete il gruppo finché la metà non è
    almeno larga quanto la riga.
  */
  const [ripeti, setRipeti] = useState(1);

  useEffect(() => {
    const el = pista.current;
    const riga = el?.parentElement;
    if (!el || !riga) return;
    // Le immagini arrivano dopo: si rimisura quando la pista cambia larghezza.
    const misura = () => {
      const meta = el.scrollWidth / 2;
      setDurata(meta / VELOCITA);
      const gruppo = meta / ripeti;
      if (gruppo > 0) {
        const servono = Math.max(1, Math.ceil(riga.clientWidth / gruppo));
        if (servono !== ripeti) setRipeti(servono);
      }
    };
    misura();
    const ro = new ResizeObserver(misura);
    ro.observe(el);
    ro.observe(riga);
    return () => ro.disconnect();
  }, [urls, ripeti]);

  const gruppo = Array.from({ length: ripeti }, () => urls).flat();

  return (
    /* Da bordo a bordo dello schermo, oltre i margini della pagina, come il
       carosello: prima le file si fermavano ai margini (Veronika, 24/11). */
    <div className="-mx-[10px] overflow-hidden xl:-mx-10">
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
            {gruppo.map((url, i) => (
              /* eslint-disable-next-line @next/next/no-img-element --
                 URL firmato a scadenza: next/image lo cacherebbe oltre la
                 validità. */
              <img
                key={i}
                src={url}
                alt=""
                /*
                  Tetto in altezza, non misura fissa: i marchi hanno proporzioni
                  diverse e uno stesso tetto li tiene in riga.

                  Perche' il tetto funzioni le immagini vanno RITAGLIATE sul
                  proprio inchiostro: con un margine trasparente attorno, il
                  tetto lo si spende per il vuoto — misurato, fra i loghi dei
                  clienti si andava dal 36% al 97% di inchiostro, cioe' a
                  parita' di tetto un marchio si vedeva tre volte piu' piccolo
                  di un altro.
                */
                className="max-h-[38px] w-auto shrink-0 object-contain xl:max-h-[56px]"
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
        <p className="pb-[60px] text-center text-[22px] xl:pb-[68px] leading-[1.2] tracking-[-0.04em] xl:text-[30px]">
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
