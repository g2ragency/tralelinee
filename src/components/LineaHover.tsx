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

  Spessore 5% del corpo del testo, come tutte le sottolineature del sito:
  in `em`, così una voce a 18px e una a 30px restano in proporzione senza
  doverlo ricalcolare a mano.
*/
export function LineaHover({
  sempre,
  children,
}: {
  /* Linea sempre disegnata (voce attiva): il mouse non la ritira. */
  sempre?: boolean;
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
        className="pointer-events-none absolute -bottom-[0.2em] left-0 h-[0.05em] w-full origin-left bg-current transition-transform duration-300 ease-out motion-reduce:transition-none"
      />
    </span>
  );
}
