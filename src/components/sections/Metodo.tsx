"use client";

import { useRef } from "react";

/*
  A6 — Metodo: accordion su hover. Il contenuto si apre animando
  max-height 0→scrollHeight + opacity; la linea verticale a sinistra è
  alta quanto la riga (base ~57px) e si estende con il contenuto.
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
    title: "Stimolazione delle policy",
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
      <h3 className="text-3xl font-light leading-[0.933] tracking-[-1.2px] xl:text-[52px] xl:tracking-[-2.08px]">
        {title}
      </h3>
      <div
        ref={bodyRef}
        className="max-h-0 overflow-hidden opacity-0 transition-[max-height,opacity] duration-400 ease-out"
      >
        <p className="max-w-[862px] pt-5 text-xl font-light leading-[1.1] tracking-[-0.8px] text-grey2 xl:text-[30px] xl:tracking-[-1.2px]">
          {desc}
        </p>
      </div>
    </div>
  );
}

export function Metodo() {
  return (
    <section id="metodo" className="px-6 py-24 xl:px-10 xl:py-40">
      <div className="mb-20 max-w-[1265px]">
        <p className="mb-6 text-[24px] font-medium leading-[0.933] tracking-[-0.96px]">
          Metodo
        </p>
        {/* ponytail: stile intro non presente nel Figma definitivo — allineato al pattern delle altre sezioni */}
        {INTRO.map((p) => (
          <p
            key={p.slice(0, 20)}
            className="mt-4 text-xl font-light leading-[1.1] tracking-[-0.8px] text-grey2 xl:text-[30px] xl:tracking-[-1.2px]"
          >
            {p}
          </p>
        ))}
      </div>
      <div className="flex max-w-[901px] flex-col gap-9">
        {ITEMS.map((item) => (
          <Row key={item.title} {...item} />
        ))}
      </div>
    </section>
  );
}
