import type { ReactNode } from "react";
import Link from "next/link";
import { ExpandLogo } from "@/components/layout/ExpandLogo";

/*
  Cornice delle pagine di accesso: niente header — al suo posto un «Indietro»
  in alto a sinistra — logo e form al centro della finestra, nota sulla privacy
  in fondo.

  Il centraggio è in flex e non in posizione assoluta: la nota resta l'ultimo
  elemento del flusso, quindi su finestre basse scende invece di finire sopra
  il form.
*/
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-svh flex-col items-center px-6 py-8 xl:px-10">
      <Link
        href="/"
        className="self-start text-[18px] leading-[0.93] tracking-[-0.04em] text-[#C4C4C4]"
      >
        ← Indietro
      </Link>

      <div className="flex flex-1 flex-col items-center justify-center">
        <ExpandLogo compatto />
        {/* Figma: 90px fra logo e titolo */}
        <div className="mt-[90px] w-full">{children}</div>
      </div>

      {/* 14px, interlinea 100%, spaziatura -4% */}
      <p className="text-center text-[14px] leading-none tracking-[-0.04em] text-grey">
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
