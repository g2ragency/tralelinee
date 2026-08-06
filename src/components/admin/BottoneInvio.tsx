"use client";

import { useFormStatus } from "react-dom";

/*
  Bottone di invio dell'area riservata: mostra che il clic è stato raccolto e,
  se serve, chiede conferma prima di procedere.

  Perché esiste: le pagine sono Server Component e non possono passare un
  gestore di eventi né conoscere lo stato dell'invio. `useFormStatus` lo legge
  dal form che lo contiene, quindi basta stare dentro la `<form action={…}>`
  senza cambiare altro.

  Mentre l'azione è in corso il bottone si disabilita: oltre a farsi vedere,
  impedisce il doppio invio di chi clicca due volte perché "non era successo
  niente".

  Per la conferma si usa `confirm` del browser e non una finestra costruita a
  mano: è bloccante, sa già stare sotto tastiera e lettore di schermo, e non
  porta con sé stato da gestire.
*/
export function BottoneInvio({
  domanda,
  className,
  disabled,
  ariaLabel,
  children,
}: {
  /* Se presente, prima di inviare compare la richiesta di conferma. */
  domanda?: string;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      aria-label={ariaLabel}
      disabled={disabled || pending}
      aria-busy={pending}
      onClick={(e) => {
        if (domanda && !window.confirm(domanda)) e.preventDefault();
      }}
      /* I puntini invece di sostituire l'etichetta: il bottone non cambia
         larghezza e la riga non salta mentre si aspetta. */
      className={`${className ?? ""} disabled:opacity-50`}
    >
      {children}
      {pending && "…"}
    </button>
  );
}
