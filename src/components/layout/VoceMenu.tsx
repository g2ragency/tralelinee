"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { LineaHover } from "@/components/LineaHover";

/*
  Voce del menu con la linea che si disegna al passaggio del mouse.
  Il comportamento della linea sta in `LineaHover`, che serve anche altrove
  (il «Leggi di più», che è un bottone). Qui resta solo la scelta fra ancora
  e Link.
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
  const props = {
    onClick,
    "aria-current": attiva ? ("true" as const) : undefined,
  };

  const contenuto = <LineaHover sempre={attiva}>{children}</LineaHover>;

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
