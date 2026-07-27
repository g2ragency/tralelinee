"use client";

import { useRef, useState } from "react";

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
      <h3 className="text-[52px] font-light leading-[0.933] tracking-[-2.08px]">
        {title}
      </h3>
      <div
        ref={bodyRef}
        className="max-h-0 overflow-hidden opacity-0 transition-[max-height,opacity] duration-400 ease-out"
      >
        <p className="max-w-[862px] pt-5 text-[30px] font-light leading-[1.1] tracking-[-1.2px] text-grey2">
          {desc}
        </p>
      </div>
    </div>
  );
}

function ArrowButton({
  dir,
  onClick,
}: {
  dir: "prev" | "next";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={dir === "prev" ? "Precedente" : "Successivo"}
      onClick={onClick}
      className="hoverable grid h-9 w-9 place-items-center rounded-full border border-grey text-foreground"
    >
      <svg
        aria-hidden
        viewBox="0 0 12 12"
        className={`h-3 w-3 ${dir === "prev" ? "rotate-180" : ""}`}
      >
        <path
          d="M3 1l5 5-5 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </svg>
    </button>
  );
}

export function Metodo() {
  const [index, setIndex] = useState(0);
  const item = ITEMS[index];

  return (
    <section id="metodo" className="px-6 py-24 xl:px-10 xl:py-40">
      <div className="mb-10 flex items-center justify-between xl:mb-20">
        {/* Label di sezione: Diatype Medium 24px, lh 93.3%, ls -4%, GRIGIO1 */}
        <p className="text-[16px] tracking-[-0.64px] text-grigio1 xl:text-[24px] xl:font-medium xl:leading-[0.933] xl:tracking-[-0.96px]">
          Metodo
        </p>
        {/* Frecce carosello — solo mobile */}
        <div className="flex gap-3 xl:hidden">
          <ArrowButton
            dir="prev"
            onClick={() =>
              setIndex((i) => (i - 1 + ITEMS.length) % ITEMS.length)
            }
          />
          <ArrowButton
            dir="next"
            onClick={() => setIndex((i) => (i + 1) % ITEMS.length)}
          />
        </div>
      </div>

      {/* Intro come sul live: 52px Light #dfdfdf, leading 1, tutta larghezza */}
      <div className="mb-24 hidden xl:block">
        {INTRO.map((p) => (
          <p
            key={p.slice(0, 20)}
            className="mt-[52px] text-[52px] leading-none tracking-[-2.08px] first:mt-0"
          >
            {p}
          </p>
        ))}
      </div>

      {/* Mobile: carosello, un item per volta con descrizione visibile */}
      <div key={index} className="animate-metodo-slide xl:hidden">
        <h3 className="text-[34px] font-light leading-[0.97] tracking-[-1.36px]">
          {item.title}
        </h3>
        <p className="mt-5 max-w-[340px] text-[18px] font-light leading-[1.2] tracking-[-0.72px] text-grey2">
          {item.desc}
        </p>
      </div>

      {/* Desktop: accordion hover */}
      <div className="hidden max-w-[901px] flex-col gap-9 xl:flex">
        {ITEMS.map((it) => (
          <Row key={it.title} {...it} />
        ))}
      </div>
    </section>
  );
}
