/*
  Homepage — struttura delle sezioni dal Figma definitivo (frame 1230:2206).

  Ogni schermata occupa l'altezza della finestra. Metodo e Capabilities si
  dividono al loro interno in più schermate (intro e voci), quindi la
  suddivisione non è tutta visibile da qui.
*/
import { ChiSiamo } from "@/components/sections/ChiSiamo";
import { Metodo } from "@/components/sections/Metodo";
import { Clienti } from "@/components/sections/Clienti";
import { Capabilities } from "@/components/sections/Capabilities";
import { Contatti } from "@/components/sections/Contatti";
import { RivelaRighe } from "@/components/RivelaRighe";
import { VideoInVista } from "@/components/sections/VideoInVista";

export default function Home() {
  return (
    <main>
      {/* Hero — come il live: testo in basso, 90px Light, evidenziazioni Regular */}
      {/* Testo in basso a ogni misura */}
      <section className="relative isolate flex min-h-svh items-end overflow-hidden px-[10px] pb-10 xl:px-10">
        {/*
          Showreel di sfondo (Veronika, 26/11): a tutto schermo dietro il
          testo. Compresso da 86 MB a 8 MB (1920px) e 4 MB (1280px, per i
          telefoni), senza audio. Sta in /public e non nel bucket: la home è
          statica e non deve firmare indirizzi. Gira solo mentre si vede.
        */}
        <VideoInVista
          sorgenti={[
            { src: "/video/showreel-home.w1280.mp4", media: "(max-width: 767px)" },
            { src: "/video/showreel-home.w1920.mp4" },
          ]}
          poster="/video/showreel-home.poster.webp"
          preload="auto"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        {/*
          Velo scuro che sale dal basso, solo dove sta il testo: il video ha
          fotogrammi quasi bianchi e il testo (grigio e bianco) sparirebbe. In
          alto il video resta pieno; in fondo arriva al nero della sezione
          dopo, come la «SFUMATURA SOTTO» del Figma. Sul telefono sale di più:
          il testo va su sei righe e occupa quasi metà dello schermo.
        */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-background from-25% via-background/75 via-60% to-transparent to-95% xl:from-10% xl:via-40% xl:to-75%"
        />
        {/* Figma: Regular 46px su mobile e 86px da desktop, lh 100%, ls -4%.
            Enfasi col colore: grigio #696969 / bianco #DFDFDF */}
        {/* Le righe salgono da dietro una maschera all'apertura della pagina;
            l'enfasi resta quella fissa del colore. */}
        <RivelaRighe
          className="max-w-[1100px] text-[46px] leading-none tracking-[-0.04em] text-grey xl:text-[86px]"
        >
          Il concetto di <span className="text-foreground">progresso </span>è un{" "}
          <span className="text-foreground">meccanismo protettivo</span> che ci
          difende dai terrori del futuro
        </RivelaRighe>
      </section>

      {/* Chi Siamo — scroll orizzontale pinnato (A3) */}
      <ChiSiamo />

      {/* Metodo — intro e le quattro voci (A6) */}
      <Metodo />

      {/* Capabilities — digit sticky 01→06 (A4/A5) */}
      {/* Clienti: fila di loghi che scorre (A8) */}
      <Clienti />

      <Capabilities />

      {/* Contatti */}
      <Contatti />
    </main>
  );
}
