/*
  Homepage — struttura delle sezioni dal Figma definitivo (frame 1230:2206).

  Ogni sezione vive in un involucro `.sezione-snap`: sono i punti di aggancio
  dello scroll (SnapSezioni su desktop, scroll-snap CSS su touch). Involucri e
  non le sezioni stesse perché due di loro sono pinnate da GSAP: durante il pin
  l'elemento è `fixed` e non ha una posizione utile, l'involucro — che contiene
  il pin-spacer — sì.
*/
import { ChiSiamo } from "@/components/sections/ChiSiamo";
import { Metodo } from "@/components/sections/Metodo";
import { Capabilities } from "@/components/sections/Capabilities";
import { Contatti } from "@/components/sections/Contatti";
import { SnapSezioni } from "@/components/providers/SnapSezioni";

export default function Home() {
  return (
    <main>
      <SnapSezioni />

      {/* Hero — come il live: testo in basso, 90px Light, evidenziazioni Regular */}
      <div className="sezione-snap">
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
      </div>

      {/* Chi Siamo — scroll orizzontale pinnato (A3) */}
      <div className="sezione-snap">
        <ChiSiamo />
      </div>

      {/* Metodo — accordion hover (A6) */}
      <div className="sezione-snap">
        <Metodo />
      </div>

      {/* Capabilities — digit sticky 01→06 (A4/A5) */}
      <div className="sezione-snap">
        <Capabilities />
      </div>

      {/* Contatti */}
      <div className="sezione-snap">
        <Contatti />
      </div>
    </main>
  );
}
