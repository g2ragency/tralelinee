"use client";

import {
  createContext,
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Esito } from "@/lib/esito";

/*
  Form dell'area riservata che dice com'è andata.

  Prima ogni `<form action>` chiamava l'azione e la pagina si ricaricava sia
  che il database avesse salvato sia che avesse rifiutato: un indirizzo già
  usato da un altro progetto faceva perdere tutte le modifiche senza un
  avviso. Ora l'azione restituisce un `Esito` e qui lo si mostra.

  Tiene anche il conto delle modifiche non salvate, confrontando il contenuto
  del form con quello dell'ultimo salvataggio. Il confronto sui dati, e non
  sugli eventi, copre anche i campi nascosti che cambiano senza che nessuno
  scriva: le immagini appena caricate, le voci spostate con le frecce.
  Finché qualcosa resta in sospeso, chiudere la scheda chiede conferma.

  Il form si invia da onSubmit e non con : con l'attributo
  React 19 svuota i campi dopo ogni invio, e dopo un errore («indirizzo già
  usato») si perdeva proprio quello che si era appena scritto. Lo stato di
  attesa arriva a BottoneInvio da InvioInCorso, perché useFormStatus vede solo
  gli invii fatti con l'attributo.
*/

export const InvioInCorso = createContext<boolean | null>(null);

const sospesi = new Set<symbol>();
let ascoltoUscita = false;

function avvisaPrimaDiUscire() {
  if (ascoltoUscita || typeof window === "undefined") return;
  ascoltoUscita = true;
  window.addEventListener("beforeunload", (e) => {
    if (sospesi.size > 0) e.preventDefault();
  });
}

/* Solo i campi con un nome: sono quelli che arrivano all'azione. */
const fotografia = (form: HTMLFormElement) =>
  JSON.stringify(
    [...new FormData(form).entries()].filter(([k]) => !k.startsWith("$ACTION")),
  );

export function FormAzione({
  action,
  className,
  children,
  /* Per i form da un solo bottone (pubblica, sposta, elimina): non c'è niente
     di «non salvato» da segnalare, e un «Salvato» accanto a una freccia è
     solo rumore. Gli errori invece si mostrano sempre. */
  semplice = false,
}: {
  action: (prev: Esito, formData: FormData) => Promise<Esito>;
  className?: string;
  children: React.ReactNode;
  semplice?: boolean;
}) {
  const [esito, formAction, pending] = useActionState(action, undefined);
  const ref = useRef<HTMLFormElement>(null);
  const base = useRef<string>("");
  const id = useRef(Symbol());
  const [modificato, setModificato] = useState(false);

  useEffect(() => {
    if (semplice) return;
    const form = ref.current;
    if (!form) return;
    avvisaPrimaDiUscire();
    const chiave = id.current;
    base.current = fotografia(form);

    const controlla = () => {
      const diverso = fotografia(form) !== base.current;
      setModificato(diverso);
      if (diverso) sospesi.add(chiave);
      else sospesi.delete(chiave);
    };
    form.addEventListener("input", controlla);
    form.addEventListener("change", controlla);
    // I campi nascosti cambiano da React senza eventi: per un input hidden il
    // valore è l'attributo, quindi l'osservatore lo vede.
    const osservatore = new MutationObserver(controlla);
    osservatore.observe(form, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["value"],
    });
    return () => {
      form.removeEventListener("input", controlla);
      form.removeEventListener("change", controlla);
      osservatore.disconnect();
      sospesi.delete(chiave);
    };
  }, [semplice]);

  // Dopo un salvataggio riuscito il nuovo punto di partenza è quello attuale.
  useEffect(() => {
    if (semplice || !esito?.ok || !ref.current) return;
    base.current = fotografia(ref.current);
    setModificato(false);
    sospesi.delete(id.current);
  }, [esito, semplice]);

  return (
    <form
      ref={ref}
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        if (pending) return;
        const dati = new FormData(e.currentTarget);
        startTransition(() => formAction(dati));
      }}
    >
      <InvioInCorso.Provider value={pending}>{children}</InvioInCorso.Provider>
      {esito?.errore && (
        <p
          role="alert"
          className="border border-[#d33] px-4 py-2 text-[16px] text-[#d33]"
        >
          {esito.errore}
        </p>
      )}
      {!semplice && (modificato || esito?.ok) && (
        <p aria-live="polite" className="text-[15px] text-grey">
          {modificato ? "Modifiche non salvate" : esito?.ok}
        </p>
      )}
    </form>
  );
}
