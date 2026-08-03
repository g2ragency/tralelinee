"use client";

import { useRef } from "react";
import { EvidenziaScroll } from "@/components/EvidenziaScroll";

/*
  A6 — Metodo. Desktop: accordion su hover (max-height 0→scrollHeight +
  opacity; la linea verticale a sinistra è alta quanto la riga e si estende
  con il contenuto). Mobile (Figma 1230:2619): carosello con frecce
  prev/next, un item per volta con descrizione sempre visibile.
  Copy verbatim dal componente Figma ACCORDION METODO (1230:2429) e
  intro dal sito live.
*/
const ITEMS = [
  {
    title: "Anticipazione Strategica",
    desc: "Immaginare scenari futuri per aiutare clienti, istituzioni o brand a posizionarsi prima che accadano i cambiamenti",
  },
  {
    title: "Issue Shaping",
    desc: "Costruisci mondi futuri e fai in modo che il tuo cliente plasmi il dibattito",
  },
  {
    title: "Creazione di nuovi frame culturali",
    desc: "Nuovi modi di pensare problemi consolidati (es. lavoro, benessere, identità) e creare un “campo semantico” dove il cliente è già leader",
  },
  {
    // Live aggiornato dopo il Figma: "Attivazione", non "Stimolazione"
    title: "Attivazione delle policy",
    desc: "Elaborare concept utili a influenzare chi scrive norme e regolamenti.",
  },
];

const INTRO = [
  "Costruiamo narrazioni che generano immaginari capaci di influenzare percezioni pubbliche e private. Il nostro approccio si basa sull'elaborazione strategica e la diffusione mirata di frame comunicativi in grado di orientare l'agenda setting.",
  "Integriamo gli strumenti dello speculative design nei servizi di comunicazione tradizionale, creando un ecosistema ibrido di soluzioni editoriali, relazionali, istituzionali e comunicative. Il risultato è un metodo che unisce concretezza operativa e visione innovativa, trasformando ogni progetto in un'opportunità di crescita.",
];

function Row({ title, desc }: { title: string; desc: string }) {
  const bodyRef = useRef<HTMLDivElement>(null);

  const toggle = (open: boolean) => {
    const el = bodyRef.current;
    if (!el) return;
    el.style.maxHeight = open ? el.scrollHeight + "px" : "0px";
    el.style.opacity = open ? "1" : "0";
  };

  return (
    <div
      className="relative pl-4"
      tabIndex={0}
      onMouseEnter={() => toggle(true)}
      onMouseLeave={() => toggle(false)}
      onFocus={() => toggle(true)}
      onBlur={() => toggle(false)}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[5px] bg-foreground"
      />
      {/* Regular, lh 93.3%, ls -4%: 26px su mobile come la descrizione di
          sezione, 52px da desktop */}
      <h3 className="text-[26px] font-normal leading-[0.933] tracking-[-0.04em] xl:text-[52px]">
        {title}
      </h3>
      <div
        ref={bodyRef}
        className="max-h-0 overflow-hidden opacity-0 transition-[max-height,opacity] duration-400 ease-out"
      >
        <p className="max-w-[862px] pt-3 text-[18px] font-light leading-[1.1] tracking-[-0.04em] text-grey2 xl:pt-5 xl:text-[30px]">
          {desc}
        </p>
      </div>
    </div>
  );
}

export function Metodo() {
  return (
    /* Due schermate a ogni misura: etichetta+intro e le quattro voci. */
    <>
      <section
        id="metodo"
        className="flex min-h-svh flex-col justify-center px-[10px] py-24 xl:px-10 xl:py-28"
      >
        {/* Etichetta: Medium 12px lh 110% su mobile, 24px lh 93.3% da
            desktop; spaziatura -4%, GRIGIO1 */}
        <p className="mb-[10px] text-[12px] font-medium leading-[1.1] tracking-[-0.04em] text-label xl:mb-20 xl:text-[24px] xl:leading-[0.933] xl:tracking-[-0.72px]">
          Metodo
        </p>

        {/* Intro: Regular 26px su mobile e 52px da desktop, lh 102%, ls -4%,
            allineata a sinistra; si accende con lo scroll */}
        <EvidenziaScroll
          paragrafi={INTRO}
          classeP="mt-[26px] text-left text-[26px] font-normal leading-[1.02] tracking-[-0.04em] first:mt-0 xl:mt-[52px] xl:text-[52px]"
        />
      </section>

      {/* Le quattro voci: schermata a sé. La descrizione si apre al passaggio
          del mouse e, su touch, al tocco — `tabIndex` rende la riga
          focalizzabile, quindi il focus fa da equivalente dell'hover. */}
      <section
        aria-label="Metodo — i quattro punti"
        className="flex min-h-svh flex-col justify-center px-[10px] py-24 xl:px-10 xl:py-28"
      >
        <div className="flex max-w-[901px] flex-col gap-6 xl:gap-9">
          {ITEMS.map((it) => (
            <Row key={it.title} {...it} />
          ))}
        </div>
      </section>
    </>
  );
}
