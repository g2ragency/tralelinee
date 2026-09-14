"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { rivelaRighe } from "@/lib/rivela";

/*
  Titolo che entra riga per riga da dietro una maschera all'apertura della
  pagina (vedi lib/rivela). Per i blocchi che poi si accendono con lo scroll
  c'e' EvidenziaScroll, che fa la stessa salita e continua; questo e' per un
  testo e basta — l'hero. E' un h1 perche' serve solo li': se servira'
  altrove, il tag diventa una prop.
*/
export function RivelaRighe({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    return rivelaRighe([el], { inVista: false });
  }, []);

  return (
    <h1 ref={ref} className={`invisible ${className ?? ""}`}>
      {children}
    </h1>
  );
}
