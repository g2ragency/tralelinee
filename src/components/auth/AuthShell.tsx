import type { ReactNode } from "react";
import Link from "next/link";
import { ExpandLogo } from "@/components/layout/ExpandLogo";

/*
  Cornice delle pagine di accesso: niente header — al suo posto un «Indietro»
  in alto a sinistra e il logo in cima, sulla stessa riga — form al centro
  della finestra, nota sulla privacy in fondo.

  Il logo è centrato in posizione assoluta e non dal flex: così sta al centro
  della finestra e non al centro dello spazio che avanza accanto a «Indietro»,
  che lo spingerebbe a destra di mezza scritta.

  Il centraggio del form è in flex e non in posizione assoluta: la nota resta
  l'ultimo elemento del flusso, quindi su finestre basse scende invece di
  finire sopra il form.
*/
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-svh flex-col items-center px-6 py-8 xl:px-10">
      <div className="relative flex w-full items-center">
        <Link
          href="/"
          className="relative z-10 text-[18px] leading-[0.93] tracking-[-0.04em] text-[#C4C4C4]"
        >
          ← Indietro
        </Link>
        <span className="pointer-events-none absolute inset-x-0 flex justify-center">
          <span className="pointer-events-auto">
            <ExpandLogo compatto />
          </span>
        </span>
      </div>

      {/* w-full: senza, questa colonna si stringe sul contenuto e il `w-full`
          del form non ha nulla su cui misurarsi — restava larga quanto il
          titolo invece dei 554px chiesti. */}
      <div className="flex w-full flex-1 flex-col items-center justify-center">
        {/* Figma: 90px fra la riga del logo e il titolo */}
        <div className="mt-[90px] w-full">{children}</div>
      </div>

      {/* 18px, interlinea 100%, spaziatura -4% */}
      <p className="text-center text-[18px] leading-none tracking-[-0.04em] text-grey">
        Accedendo, accetterai la nostra{" "}
        <Link
          href="/privacy-policy"
          className="text-foreground underline"
        >
          Privacy Policy
        </Link>
      </p>
    </main>
  );
}
