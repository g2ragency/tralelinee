"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export type Foto = { src: string; srcSet?: string };

/* Spostamento massimo di una fila mentre il blocco attraversa lo schermo,
   in frazione della larghezza della finestra: più alto = più veloce. */
const CORSA = 0.25;

/*
  Doppio carosello che scorre con la pagina (Veronika, 24/11).

  Due file di foto orizzontali, una sotto l'altra, che si muovono in versi
  opposti SOLO con lo scroll: scendendo la prima va verso sinistra e la
  seconda verso destra, risalendo tornano indietro, e se la pagina è ferma
  sono ferme. Non si trascinano col mouse: per quello c'è il Carosello.

  Il movimento copre il tratto in cui il blocco attraversa lo schermo, da
  quando entra dal basso a quando esce dall'alto, ed è pari a quanto la fila
  sporge oltre la finestra: così all'inizio la prima foto è al margine e alla
  fine si vede l'ultima, senza mai lasciare vuoto ai lati. `scrub` morbido:
  la fila insegue lo scroll invece di agganciarsi, il «piano piano».

  Le misure delle file si rileggono a ogni refresh di ScrollTrigger
  (`invalidateOnRefresh`), quindi reggono il ridimensionamento della finestra
  e le immagini che arrivano dopo.
*/
export function CaroselloScorrimento({
  righe,
  aspetto,
}: {
  righe: (Foto | null)[][];
  aspetto: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    // Chi ha chiesto meno animazioni vede le file ferme.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      root.querySelectorAll<HTMLElement>("[data-fila]").forEach((fila, i) => {
        /*
          Quanto si sposta: quello che la fila sporge oltre la finestra, ma al
          massimo CORSA della larghezza della finestra. Con tante foto la
          sporgenza è grande e la fila correva quasi quanto lo scroll; il
          movimento deve essere lento («piano piano», Veronika).
        */
        const sporgenza = () =>
          Math.min(
            window.innerWidth * CORSA,
            Math.max(0, fila.scrollWidth - (fila.parentElement?.clientWidth ?? 0)),
          );
        const versoSinistra = i % 2 === 0;
        gsap.fromTo(
          fila,
          { x: () => (versoSinistra ? 0 : -sporgenza()) },
          {
            x: () => (versoSinistra ? -sporgenza() : 0),
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          },
        );
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      /* Da bordo a bordo dello schermo come il Carosello; le foto partono dal
         margine della pagina. */
      className="-mx-[10px] flex flex-col gap-[12px] overflow-hidden xl:-mx-10 xl:gap-[18px]"
    >
      {righe.map((foto, r) => (
        <div key={r} className="overflow-hidden">
          <div
            data-fila
            className="flex w-max gap-[12px] px-[10px] will-change-transform xl:gap-[18px] xl:px-10"
          >
            {foto.map((f, i) => (
              <figure
                key={i}
                /* Da computer se ne vedono due e mezza, da telefono una e un
                   pezzo: si capisce che la fila continua. */
                className={`w-[calc((100vw-20px)/1.3)] shrink-0 overflow-hidden rounded-[15px] bg-box xl:w-[calc((100vw-80px)/2.5)] xl:rounded-[30px] ${aspetto}`}
              >
                {f && (
                  /* eslint-disable-next-line @next/next/no-img-element --
                     URL firmato a scadenza: next/image lo terrebbe in cache
                     oltre la validità. */
                  <img
                    src={f.src}
                    srcSet={f.srcSet}
                    sizes="(min-width: 1280px) 40vw, 77vw"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className="h-full w-full object-cover"
                  />
                )}
              </figure>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
