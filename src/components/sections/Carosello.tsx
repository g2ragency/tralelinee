"use client";

import { useRef, useState } from "react";

/*
  Carosello immagini.

  Due motivi per cui deve essere client:

  1. La rotella. Lenis la governa su tutta la pagina e non lascia scorrere i
     contenitori interni. `data-lenis-prevent` risolverebbe lo scorrimento
     orizzontale ma spegnerebbe anche quello verticale: col puntatore sopra il
     carosello — che è alto quanto lo schermo — la pagina non si muoverebbe
     più. Quindi si toglie a Lenis il solo gesto orizzontale, lasciandolo
     gestire al browser, e il verticale prosegue fino a Lenis come sempre.
  2. Trascinamento col mouse — un mouse senza rotella orizzontale non ha alcun
     modo di scorrere un contenitore, e la barra di scorrimento è nascosta.
*/
export function Carosello({ urls }: { urls: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [trascina, setTrascina] = useState(false);
  const inizio = useRef({ x: 0, scroll: 0 });
  const spostato = useRef(0);

  /*
    Solo il gesto orizzontale viene sottratto a Lenis: il verticale continua a
    salire fino a lui, così la pagina scorre anche col puntatore qui sopra.
  */
  const rotella = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) e.stopPropagation();
  };

  const giu = (e: React.PointerEvent) => {
    const el = ref.current;
    // Il dito scorre già da sé, e catturare il puntatore su touch dirotterebbe
    // anche le passate verticali: il trascinamento serve solo al mouse.
    if (!el || e.pointerType !== "mouse") return;
    setTrascina(true);
    spostato.current = 0;
    inizio.current = { x: e.clientX, scroll: el.scrollLeft };
    el.setPointerCapture(e.pointerId);
  };

  const muovi = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || !trascina) return;
    const dx = e.clientX - inizio.current.x;
    spostato.current = Math.max(spostato.current, Math.abs(dx));
    el.scrollLeft = inizio.current.scroll - dx;
  };

  const su = (e: React.PointerEvent) => {
    ref.current?.releasePointerCapture(e.pointerId);
    setTrascina(false);
  };

  return (
    <section
      ref={ref}
      onWheel={rotella}
      onPointerDown={giu}
      onPointerMove={muovi}
      onPointerUp={su}
      onPointerCancel={su}
      /*
        snap disattivato durante il trascinamento: con snap obbligatorio attivo
        il browser riaggancia a ogni frame e il trascinamento risulta a scatti.
      */
      className={`-mx-6 flex gap-[18px] overflow-x-auto scroll-pl-6 px-6 pb-2 xl:-mx-10 xl:scroll-pl-10 xl:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
        trascina
          ? "cursor-grabbing select-none"
          : "cursor-grab snap-x snap-mandatory"
      }`}
    >
      {urls.map((url, i) => (
        <figure
          key={i}
          className="aspect-[596/760] w-[clamp(260px,calc((100%-18px)/1.15),680px)] shrink-0 snap-start overflow-hidden rounded-[30px] bg-grey/15 xl:w-[clamp(260px,calc((100%-18px)/2.2),680px)]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element --
              URL firmato a scadenza: next/image lo cacherebbe oltre la validità. */}
          <img
            src={url}
            alt=""
            draggable={false}
            className="h-full w-full object-cover"
            loading={i > 1 ? "lazy" : undefined}
          />
        </figure>
      ))}
    </section>
  );
}
