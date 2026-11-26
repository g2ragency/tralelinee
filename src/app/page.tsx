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
      {/* Hero — showreel a tutto schermo e la frase in basso */}
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
          Frase (Veronika, 26/11): più piccola e, da computer, su due righe.
          La prima metà misura 20,9 volte il corpo: 56px stanno anche nei
          1200px utili dello schermo più stretto (1280). Le due metà vanno a
          capo da sole come blocchi da xl in su; sul telefono due righe non ci
          stanno a un corpo leggibile, lì scende da 46 a 36px e va a capo da sé.

          Niente velo scuro (Gabriele, 26/11: «prova senza sfumatura e con
          fusione difference»). La frase si fonde col video in «difference»:
          dove sotto è chiaro diventa scura, dove è scuro resta chiara, così
          resta in contrasto col video senza scurirlo (sui grigi medi meno). La fusione resta
          dentro la hero perché la sezione è `isolate`.
        */}
        <div className="relative w-full">
          {/* Figma: lh 100%, ls -4%. Enfasi col colore: grigio #696969 /
              bianco #DFDFDF. Le righe salgono da dietro una maschera
              all'apertura della pagina. */}
          <RivelaRighe className="text-[36px] leading-none tracking-[-0.04em] text-grey mix-blend-difference xl:text-[56px]">
            <span className="xl:block">
              Il concetto di <span className="text-foreground">progresso </span>
              è un <span className="text-foreground">meccanismo protettivo</span>
            </span>{" "}
            <span className="xl:block">che ci difende dai terrori del futuro</span>
          </RivelaRighe>
        </div>
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
