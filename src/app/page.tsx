/*
  Homepage — struttura delle sezioni dal Figma definitivo (frame 1230:2206).
  Placeholder di fase Fondamenta: i contenuti e le animazioni per ogni sezione
  arrivano nella fase "Clone sito pubblico" (vedi DISCOVERY.md).
*/
import { ChiSiamo } from "@/components/sections/ChiSiamo";
import { Metodo } from "@/components/sections/Metodo";
import { Capabilities } from "@/components/sections/Capabilities";
import { Contatti } from "@/components/sections/Contatti";

export default function Home() {
  return (
    <main>
      {/* Hero — come il live: testo in basso, 90px Light, evidenziazioni Regular */}
      <section className="flex min-h-svh items-center px-6 pb-10 xl:items-end xl:px-10">
        {/* Figma 1237:471 — Regular 86px, ls -4% (-3.44px), lh 1.
            Enfasi col colore: grigio #696969 / bianco #DFDFDF */}
        <h1 className="max-w-[1100px] text-[40px] leading-none tracking-[-1.6px] text-grey xl:text-[86px] xl:tracking-[-3.44px]">
          Il concetto di{" "}
          <span className="text-foreground">progresso </span>
          è un <span className="text-foreground">meccanismo protettivo</span>
          {" "}che ci difende dai terrori del futuro
        </h1>
      </section>

      {/* Chi Siamo — scroll orizzontale pinnato (A3) */}
      <ChiSiamo />

      {/* Metodo — accordion hover (A6) */}
      <Metodo />

      {/* Capabilities — digit sticky 01→06 (A4/A5) */}
      <Capabilities />

      {/* Contatti */}
      <Contatti />
    </main>
  );
}
