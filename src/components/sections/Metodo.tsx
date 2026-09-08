"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EvidenziaScroll } from "@/components/EvidenziaScroll";

gsap.registerPlugin(ScrollTrigger);

/*
  A6 — Metodo. Intro a piena schermata, poi i quattro punti in quattro
  schede: 2x2 da desktop, una sotto l'altra da mobile.
  Le schede hanno sostituito l'accordion su hover: il testo ora sta sempre a
  vista, quindi non serve piu' ne' l'apertura ne' il carosello mobile.
*/
const ITEMS = [
  {
    title: "Anticipazione Strategica",
    desc: "Analizziamo segnali emergenti, trasformazioni sociali e dinamiche di contesto per individuare in anticipo rischi, opportunità e possibili scenari evolutivi. Trasformiamo l’osservazione del presente in una visione strategica capace di orientare decisioni, posizionamento e azioni future.",
  },
  {
    title: "Issue Shaping",
    desc: "Interveniamo sulla costruzione e sull’evoluzione dei temi rilevanti per organizzazioni, istituzioni e comunità. Definiamo argomenti, linguaggi e priorità in grado di portare una questione all’interno del dibattito pubblico, rafforzandone la rilevanza e orientandone la comprensione.",
  },
  {
    title: "Creazione di nuovi frame culturali",
    desc: "Progettiamo nuove chiavi di lettura attraverso cui interpretare fenomeni complessi e cambiamenti in corso. Costruiamo narrazioni, concetti e riferimenti culturali capaci di modificare la percezione di un tema, ampliarne il significato e generare nuove possibilità di azione.",
  },
  {
    title: "Stimolazione delle policy",
    desc: "Trasformiamo visioni, analisi e proposte in percorsi concreti di interlocuzione e cambiamento. Favoriamo il coinvolgimento degli stakeholder, la costruzione del consenso e l’attivazione dei decisori, creando le condizioni affinché un tema possa tradursi in iniziative, strumenti e politiche pubbliche.",
  },
];

const INTRO = [
  "Costruiamo narrazioni che generano immaginari capaci di influenzare percezioni pubbliche e private. Il nostro approccio si basa sull'elaborazione strategica e la diffusione mirata di frame comunicativi in grado di orientare l'agenda setting.",
  "Integriamo gli strumenti dello speculative design nei servizi di comunicazione tradizionale, creando un ecosistema ibrido di soluzioni editoriali, relazionali, istituzionali e comunicative. Il risultato è un metodo che unisce concretezza operativa e visione innovativa, trasformando ogni progetto in un'opportunità di crescita.",
];

/* Etichetta di sezione, uguale sopra l'intro e a lato delle schede. */
const ETICHETTA =
  "text-[12px] font-medium leading-[1.1] tracking-[-0.04em] text-label xl:text-[24px] xl:leading-[0.933] xl:tracking-[-0.72px]";

export function Metodo() {
  const schede = useRef<HTMLOListElement>(null);

  /*
    Le schede entrano salendo, una dopo l'altra, quando la fila arriva in
    vista. E' l'apparizione: il riempimento del testo, che e' un'altra cosa e
    segue lo scroll carattere per carattere, lo fa EvidenziaScroll qui sotto.
    `from` e non `to`: lo stato a riposo resta quello scritto nel markup, cosi'
    senza JS — o con le animazioni ridotte — le schede si vedono e basta.
  */
  useLayoutEffect(() => {
    const root = schede.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.from(root.children, {
        opacity: 0,
        y: 28,
        duration: 0.7,
        ease: "power2.out",
        stagger: 0.12,
        scrollTrigger: { trigger: root, start: "top 85%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    /* Due schermate a ogni misura: etichetta+intro e le quattro schede. */
    <>
      <section
        id="metodo"
        className="flex min-h-svh flex-col justify-center px-[10px] py-24 xl:px-10 xl:py-28"
      >
        <p className={`mb-[10px] xl:mb-20 ${ETICHETTA}`}>Metodo</p>

        {/* Intro: Regular 26px su mobile e 52px da desktop, lh 102%, ls -4%,
            allineata a sinistra; si accende con lo scroll */}
        <EvidenziaScroll
          paragrafi={INTRO}
          classeP="mt-[26px] text-left text-[26px] font-normal leading-[1.02] tracking-[-0.04em] first:mt-0 xl:mt-[52px] xl:text-[52px]"
        />
      </section>

      <section
        aria-label="Metodo — i quattro punti"
        className="flex min-h-svh flex-col justify-center px-[10px] py-24 xl:px-10 xl:py-28"
      >
        {/* Da desktop l'etichetta sta a sinistra delle schede, non sopra. */}
        <div className="xl:grid xl:grid-cols-[220px_1fr]">
          <p className={`mb-[10px] xl:mb-0 ${ETICHETTA}`}>Metodo</p>

          {/* Figma: schede 15px di raggio, fondo GRIGIO2, 20px di padding
              interno e 20px fra riga e riga; da mobile in colonna a 12px. */}
          <ol
            ref={schede}
            className="grid gap-[12px] xl:grid-cols-2 xl:gap-[20px]"
          >
            {ITEMS.map((it, i) => (
              <li key={it.title} className="rounded-[15px] bg-box p-[20px]">
                {/* Pallino numerato 25x25, numero 14px: resta uguale a ogni
                    misura, e' gia' la taglia minima. */}
                <span
                  aria-hidden
                  className="flex h-[25px] w-[25px] items-center justify-center rounded-full bg-grey text-[14px] leading-none tracking-[-0.04em] text-white"
                >
                  {i + 1}
                </span>
                {/* 20px di stacco fra pallino, titolo e descrizione. */}
                <h3 className="pt-[20px] text-[18px] font-normal leading-none tracking-[-0.04em] xl:text-[24px]">
                  {it.title}
                </h3>
                {/*
                  Il testo si accende con lo scroll come l'intro. Qui pero' il
                  colore pieno e' il GRIGIO1 della descrizione, non il bianco:
                  EvidenziaScroll anima l'opacita', quindi il punto d'arrivo
                  lo decide la classe.
                */}
                <EvidenziaScroll
                  paragrafi={[it.desc]}
                  classeP="pt-[20px] text-[14px] leading-[1.4] tracking-[-0.04em] text-grey xl:text-[16px]"
                />
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
