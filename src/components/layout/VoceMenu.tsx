"use client";

import Link from "next/link";
import { useRef, type MouseEvent, type ReactNode } from "react";

/*
  Voce del menu con la linea che si disegna al passaggio del mouse.

  La linea entra dal lato da cui arriva il puntatore e, uscendo, si ritira
  verso il lato da cui esce: sembra che il puntatore se la porti dietro.
  Tutto sta nell'origine della trasformazione, spostata a sinistra o a destra
  appena prima di far scattare la scala — il verso non si può ottenere in solo
  CSS, perché dipende da dove il mouse tocca il bordo.

  Da attiva la linea resta disegnata e l'uscita del mouse non la ritira.
*/
export function VoceMenu({
  href,
  attiva,
  onClick,
  children,
}: {
  href: string;
  attiva?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  const linea = useRef<HTMLSpanElement>(null);

  const muovi = (e: MouseEvent<HTMLAnchorElement>, entra: boolean) => {
    const el = linea.current;
    if (!el || attiva) return;
    const box = e.currentTarget.getBoundingClientRect();
    el.style.transformOrigin =
      e.clientX - box.left < box.width / 2 ? "left" : "right";
    el.style.transform = entra ? "scaleX(1)" : "scaleX(0)";
  };

  const props = {
    onClick,
    onMouseEnter: (e: MouseEvent<HTMLAnchorElement>) => muovi(e, true),
    onMouseLeave: (e: MouseEvent<HTMLAnchorElement>) => muovi(e, false),
    "aria-current": attiva ? ("true" as const) : undefined,
    className: "hoverable relative inline-block",
  };

  const contenuto = (
    <>
      {children}
      <span
        ref={linea}
        aria-hidden
        style={{ transform: attiva ? "scaleX(1)" : "scaleX(0)" }}
        className="pointer-events-none absolute -bottom-[4px] left-0 h-px w-full origin-left bg-foreground transition-transform duration-300 ease-out motion-reduce:transition-none"
      />
    </>
  );

  /* Le ancore alla stessa pagina restano <a>: le governa Lenis. Gli altri
     indirizzi passano da Link, altrimenti si perde la navigazione client. */
  return href.startsWith("#") ? (
    <a href={href} {...props}>
      {contenuto}
    </a>
  ) : (
    <Link href={href} {...props}>
      {contenuto}
    </Link>
  );
}
