/*
  Homepage — struttura delle sezioni dal Figma definitivo (frame 1230:2206).

  Ogni schermata occupa l'altezza della finestra. Metodo e Capabilities si
  dividono al loro interno in più schermate (intro e voci), quindi la
  suddivisione non è tutta visibile da qui.
*/
import { ChiSiamo } from "@/components/sections/ChiSiamo";
import { Metodo } from "@/components/sections/Metodo";
import { Capabilities } from "@/components/sections/Capabilities";
import { Contatti } from "@/components/sections/Contatti";

export default function Home() {
  return (
    <main>
      {/* Hero — come il live: testo in basso, 90px Light, evidenziazioni Regular */}
      {/* Testo in basso a ogni misura */}
      <section className="flex min-h-svh items-end px-[10px] pb-10 xl:px-10">
        {/* Figma: Regular 46px su mobile e 86px da desktop, lh 100%, ls -4%.
            Enfasi col colore: grigio #696969 / bianco #DFDFDF */}
        <h1 className="max-w-[1100px] text-[46px] leading-none tracking-[-0.04em] text-grey xl:text-[86px]">
          Il concetto di <span className="text-foreground">progresso </span>è un{" "}
          <span className="text-foreground">meccanismo protettivo</span> che ci
          difende dai terrori del futuro
        </h1>
      </section>

      {/* Chi Siamo — scroll orizzontale pinnato (A3) */}
      <ChiSiamo />

      {/* Metodo — intro e le quattro voci (A6) */}
      <Metodo />

      {/* Capabilities — digit sticky 01→06 (A4/A5) */}
      <Capabilities />

      {/* Contatti */}
      <Contatti />
    </main>
  );
}
