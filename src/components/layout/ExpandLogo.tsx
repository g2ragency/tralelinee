"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";

/*
  A7 — logo "| T | L | L |" espandibile.

  Si apre SOLO la lettera sotto il puntatore (T→RA, L→E, L→INEE): passando
  alla vicina la prima si richiude da sé, perché ognuna ha il proprio hover.
  Apertura 0.8s power2.out, chiusura 0.6s power2.in.
*/
const PARTS: Array<[initial: string, rest: string]> = [
  ["T", "RA"],
  ["L", "E"],
  ["L", "INEE"],
];

/* `compatto`: versione per le pagine di accesso, dove il logo sta al centro
   della finestra e non nell'header. */
export function ExpandLogo({ compatto }: { compatto?: boolean }) {
  const reveals = useRef<(HTMLSpanElement | null)[]>([]);
  const larghezze = useRef<number[]>([]);

  useEffect(() => {
    larghezze.current = reveals.current.map((el) => {
      if (!el) return 0;
      el.style.width = "auto";
      const w = el.scrollWidth;
      el.style.width = "0px";
      return w;
    });
  }, []);

  const anima = (i: number, apri: boolean) => {
    const el = reveals.current[i];
    if (!el) return;
    gsap.to(el, {
      width: apri ? larghezze.current[i] : 0,
      opacity: apri ? 1 : 0,
      x: apri ? 0 : -10,
      duration: apri ? 0.8 : 0.6,
      ease: apri ? "power2.out" : "power2.in",
    });
  };

  const barra = compatto ? "px-[9px]" : "px-[8px]";

  return (
    <Link
      href="/"
      /* Figma: 126×30 nell'header. leading fissa l'altezza del riquadro,
         che altrimenti dipenderebbe dall'interlinea del font. */
      className={`hoverable flex items-baseline font-medium tracking-tight ${
        compatto ? "text-[26px] leading-none" : "text-[24px] leading-[30px]"
      }`}
      aria-label="Tra le linee — home"
    >
      {PARTS.map(([initial, rest], i) => (
        <span
          key={i}
          className="flex items-baseline"
          onMouseEnter={() => anima(i, true)}
          onMouseLeave={() => anima(i, false)}
        >
          <span className={barra}>|</span>
          <span>{initial}</span>
          <span
            ref={(el) => {
              reveals.current[i] = el;
            }}
            className="inline-block overflow-hidden whitespace-nowrap"
            style={{ width: 0, opacity: 0, transform: "translateX(-10px)" }}
            aria-hidden="true"
          >
            {rest}
          </span>
        </span>
      ))}
      <span className={barra}>|</span>
    </Link>
  );
}
