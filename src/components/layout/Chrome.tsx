"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/*
  Header e footer non compaiono sulle pagine di accesso: il design le vuole a
  tutto schermo, con un «Indietro» al posto della navigazione.

  Sta qui e non in un layout annidato perché header e footer li monta il layout
  radice: un layout figlio può aggiungere, non togliere. Header e footer
  restano Server Component, questo componente riceve solo il risultato.
*/
const SENZA_CORNICE = [
  "/login",
  "/registrati",
  "/recupera-password",
  "/nuova-password",
];

export function Chrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (SENZA_CORNICE.includes(pathname)) return null;
  return <>{children}</>;
}
