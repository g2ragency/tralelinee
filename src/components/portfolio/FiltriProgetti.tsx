"use client";

import { useTransition, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Categoria = { chiave: string; label: string };

/*
  Riga dei filtri + involucro della griglia.

  Il filtro resta lato server (l'elenco arriva già filtrato), ma il cambio
  passa da `useTransition`: durante l'attesa le schede vecchie sono ancora
  montate, quindi si possono far uscire in dissolvenza invece di sparire di
  colpo. Quando arriva l'elenco nuovo cambia la chiave dell'involucro, il
  contenuto si rimonta e le schede rientrano scalate.

  L'ancora resta un'ancora vera: si intercetta solo il clic sinistro, così
  ctrl/cmd-clic e tasto centrale continuano ad aprire in una scheda nuova.
*/
export function FiltriProgetti({
  categorie,
  attiva,
  azioni,
  children,
}: {
  categorie: Categoria[];
  attiva: string;
  azioni: ReactNode;
  children: ReactNode;
}) {
  const router = useRouter();
  const [inCorso, startTransition] = useTransition();

  const vai = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    // scroll: false — è un filtro, non un cambio di pagina: la vista resta dov'è.
    startTransition(() => router.push(href, { scroll: false }));
  };

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-4">
        {/* Figma: 30px Regular, interlinea 120%, spaziatura -4%; la voce
            attiva è bianca e sottolineata, le altre grigie. */}
        <p className="text-[22px] leading-[1.2] tracking-[-0.04em] text-grey xl:text-[30px]">
          {categorie.map((c, i) => {
            const href = c.chiave
              ? `/portfolio?categoria=${c.chiave}`
              : "/portfolio";
            return (
              <span key={c.chiave || "tutti"}>
                {i > 0 && ", "}
                <Link
                  href={href}
                  onClick={(e) => vai(e, href)}
                  aria-current={attiva === c.chiave ? "page" : undefined}
                  className={`hoverable transition-colors duration-200 hover:text-foreground ${
                    attiva === c.chiave ? "text-foreground underline" : ""
                  }`}
                >
                  {c.label}
                </Link>
              </span>
            );
          })}
        </p>

        {azioni}
      </div>

      <div
        key={attiva}
        className={`griglia-entra transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none ${
          inCorso ? "translate-y-2 opacity-0" : "opacity-100"
        }`}
      >
        {children}
      </div>
    </>
  );
}
