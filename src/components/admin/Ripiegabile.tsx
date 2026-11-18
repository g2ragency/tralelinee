"use client";

import { useState } from "react";

/*
  <details> che ricorda se è aperto. Con `open` passato dal server, salvare
  un blocco appena aggiunto (da vuoto a pieno) lo richiudeva sotto le mani.
*/
export function Ripiegabile({
  aperto = false,
  children,
}: {
  aperto?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(aperto);
  return (
    <details
      className="group mt-3"
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary className="cursor-pointer text-[16px] underline-offset-4 hover:underline">
        {open ? "Chiudi" : "Modifica contenuto"}
      </summary>
      {children}
    </details>
  );
}
