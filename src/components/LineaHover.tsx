"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";

/*
  Linea che si disegna al passaggio del mouse.

  Entra dal lato da cui arriva il puntatore e, uscendo, si ritira verso il
  lato da cui esce: sembra che il puntatore se la porti dietro. Tutto sta
  nell'origine della trasformazione, spostata a sinistra o a destra appena
  prima di far scattare la scala — il verso non si può ottenere in solo CSS,
  perché dipende da dove il mouse tocca il bordo.

  Sta fuori da VoceMenu perché non è solo roba di menu: la usa anche il
  «Leggi di più», che è un bottone e non un link.

  Spessore: il 5% del corpo, ma arrotondato al pixel intero.

  In `em` la linea finisce sotto il pixel — 0,9px a 18 e 1,5px a 30 — e il
  browser la spalma su piu' righe con i bordi sfumati: misurato [49, 196,
  196, 49] a zoom 1,25 e [98, 196, 196, 98] a 1,5. Quelle righe deboli
  cambiano la grossezza APPARENTE a seconda dello zoom e di dove cade la
  linea, ed e' cio' che si nota. Un valore intero si disegna sempre uguale.
*/
export function LineaHover({
  sempre,
  spessore = "h-px",
  children,
}: {
  /* Linea sempre disegnata (voce attiva): il mouse non la ritira. */
  sempre?: boolean;
  /* 5% del corpo arrotondato: 1px fino a 29px di testo, 2px da 30 in su. */
  spessore?: string;
  children: ReactNode;
}) {
  const linea = useRef<HTMLSpanElement>(null);

  const muovi = (e: MouseEvent<HTMLElement>, entra: boolean) => {
    const el = linea.current;
    if (!el || sempre) return;
    const box = e.currentTarget.getBoundingClientRect();
    el.style.transformOrigin =
      e.clientX - box.left < box.width / 2 ? "left" : "right";
    el.style.transform = entra ? "scaleX(1)" : "scaleX(0)";
  };

  return (
    <span
      className="relative inline-block"
      onMouseEnter={(e) => muovi(e, true)}
      onMouseLeave={(e) => muovi(e, false)}
    >
      {children}
      <span
        ref={linea}
        aria-hidden
        style={{ transform: sempre ? "scaleX(1)" : "scaleX(0)" }}
        className={`pointer-events-none absolute -bottom-[0.2em] left-0 w-full origin-left bg-current transition-transform duration-300 ease-out motion-reduce:transition-none ${spessore}`}
      />
    </span>
  );
}
