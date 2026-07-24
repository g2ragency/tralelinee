/*
  Homepage — struttura delle sezioni dal Figma definitivo (frame 1230:2206).
  Placeholder di fase Fondamenta: i contenuti e le animazioni per ogni sezione
  arrivano nella fase "Clone sito pubblico" (vedi DISCOVERY.md).
*/
import { ChiSiamo } from "@/components/sections/ChiSiamo";
import { Metodo } from "@/components/sections/Metodo";

export default function Home() {
  return (
    <main className="pt-24">
      {/* Hero — spans grigio/bianco come nel Figma 1230:2212 */}
      <section className="flex min-h-svh items-center px-6 xl:px-10">
        <h1 className="max-w-5xl text-5xl leading-none tracking-tight text-grey xl:text-[86px] xl:tracking-[-3.44px]">
          Il concetto di{" "}
          <span className="text-foreground">progresso </span>è un{" "}
          <span className="text-foreground">meccanismo protettivo</span> che ci
          difende dai terrori del futuro
        </h1>
      </section>

      {/* Chi Siamo — scroll orizzontale pinnato (A3) */}
      <ChiSiamo />

      {/* Metodo — accordion hover (A6) */}
      <Metodo />

      {/* Capabilities — digit sticky 01→06 (A4/A5) */}
      <section id="capabilities" className="min-h-svh px-6 py-24 xl:px-12">
        <h2 className="font-mono text-sm uppercase tracking-widest">
          Capabilities
        </h2>
      </section>

      {/* Contatti */}
      <section id="contatti" className="px-6 py-24 xl:px-12">
        <h2 className="font-mono text-sm uppercase tracking-widest">
          Contatti
        </h2>
        <address className="mt-8 font-mono text-sm not-italic leading-relaxed">
          Viale Parioli 39c - Roma
          <br />
          <a href="mailto:info@tralelinee.com" className="hoverable">
            info@tralelinee.com
          </a>
          <br />
          <a href="tel:+393324353480" className="hoverable">
            +39 332 435 3480
          </a>
        </address>
      </section>
    </main>
  );
}
