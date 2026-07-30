import type { ReactNode } from "react";

/*
  Esiste solo per marcare l'area super admin: gli angoli a 10px sono una
  regola d'area (vedi globals.css), non una classe da ripetere su una
  quarantina di campi e pulsanti. Il sito pubblico resta fuori, e ogni campo
  aggiunto qui dentro in futuro se la prende senza doverselo ricordare.
*/
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div data-area="admin">{children}</div>;
}
