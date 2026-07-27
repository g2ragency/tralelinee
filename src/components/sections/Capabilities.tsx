"use client";

import { forwardRef, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/*
  A4/A5 — Capabilities: UN solo numero gigante pinnato a sinistra (digit
  sticky) che cambia testo 01→06 a ogni sezione mentre si scorre (come il
  sito live: numberText aggiornato al trigger "top" di ogni sezione),
  visibile solo dentro la sezione. Accordion di sottovoci con icona "+"
  (un solo pannello aperto per sezione).
  Titoli/sottovoci verbatim dal Figma definitivo (1230:2206), descrizioni
  degli accordion dal sito live (assenti nel Figma).
*/
type Item = { t: string; d: string };
type Cap = { num: string; title: string; items: Item[] };

const SECTIONS: Cap[] = [
  {
    num: "01",
    title: "Futures Strategy Unit",
    items: [
      { t: "Trend Intelligence & Media Monitoring", d: "Analisi dei segnali deboli e dei trend; mappatura degli scenari emergenti ad alta potenzialità" },
      { t: "Speculative Brand Positioning", d: "Posizionamento strategico per contesti attuali e futuri selezionando nuove opportunità" },
      { t: "Future Audience Mapping", d: "Profilazione avanzata, anticipazione delle esigenze delle audience attuali e future" },
      { t: "Competitor Analysis", d: "Analisi dei competitor e identificazione delle loro potenziali strategie di scenario" },
      { t: "Brand Identity", d: "Visioni di storytelling speculativo ed ecosistema di rete relazionale profonda" },
    ],
  },
  {
    num: "02",
    title: "Pr & Future Media Relations",
    items: [
      { t: "Narrative PR & Speculative Relations", d: "Visioni di storytelling speculativo ed ecosistema di rete relazionale profonda" },
      { t: "Media Relations Aumentate", d: "Gestione proattiva delle relazioni stampa basata su narrazioni ad alto capitale simbolico" },
      { t: "Crisis Prevention", d: "Potenziamento della comunicazione di crisi attraverso lo sviluppo di protocolli e strategie mirate" },
      { t: "Press Office", d: "Produzione di materiali stampa, strumenti comunicativi e hardware di supporto visivo" },
      { t: "Influencer Narrative Collaborations", d: "Collaborazioni tattiche o strategiche con opinion leader e decisori" },
    ],
  },
  {
    num: "03",
    title: "Speculative Storytelling LAB",
    items: [
      { t: "Content & Digital Strategy", d: "Contenuti digitali che fondono copywriting, design fiction, arte visiva e nuovi linguaggi" },
      { t: "Social Media Casting", d: "Strategie social in grado di esplorare scenari inediti, con forme di comunicazione ad intenso capitale narrativo" },
      { t: "Content Marketing", d: "Elaborazione di contenuti strategici mirati ad influenzare l’agenda setting e i topic trend" },
      { t: "SEO & Cultural Framing", d: "SEO orientato al posizionamento su keyword competitive nel contesto presente e futuro" },
      { t: "Interactive Experiences", d: "Contenuti interattivi per coinvolgere e fidelizzare gli utenti con esperienze immersive" },
    ],
  },
  {
    num: "04",
    title: "Influence Design Studio",
    items: [
      { t: "Visual Communication & Design Fiction", d: "Comunicazione visiva potenziata per raccontare il presente e il prossimo futuro" },
      { t: "Brand Identity Evolution", d: "Sviluppo di identità visive versatili, adattabili e in grado di costruire frame meta-narrativi" },
      { t: "Artefatti Speculativi", d: "Creazione di oggetti simbolici e discorsivi, prototipi per il mondo di domani" },
      { t: "Advertising Concepts Disruptive", d: "Campagne pubblicitarie innovative, coinvolgenti e mirate su target segmentati" },
      { t: "Future UX/UI Design", d: "Progettazione di interfacce tecnologicamente avanzate e visivamente impattanti" },
    ],
  },
  {
    num: "05",
    title: "Alternative Events & Experience Design",
    items: [
      { t: "Workshop", d: "Organizzazione di laboratori interattivi" },
      { t: "Hybrid Reality Events", d: "Eventi fisici con tecnologie immersive" },
      { t: "Brand Fiction Installations", d: "Spazi esperienziali creativi ad alto contenuto ingaggiante" },
      { t: "Speculative Product Launches", d: "Lanci prodotto con elementi di design fiction" },
    ],
  },
  {
    num: "06",
    title: "Futures Policy LAB",
    items: [
      { t: "Futures Regulatory Scanner", d: "Monitoraggio e anticipazione dell’evoluzione normativa" },
      { t: "Policy Workshops", d: "Laboratori interattivi con stakeholder e decisori sugli attuali e futuri contesti normativi" },
      { t: "Regulatory Future Narratives", d: "Narrative per influenzare policy maker attraverso elaborazione di scenari strategici futuri" },
      { t: "Impact Assessment Speculativo", d: "Valutazione impatti regolatori con metodologie speculative" },
    ],
  },
];

const CapSection = forwardRef<HTMLDivElement, Cap>(function CapSection(
  { num, title, items },
  ref,
) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div id={`cap-${num}`} ref={ref} className="scroll-mt-[130px]">
      <div>
        {/* Figma Component 2 (1230:2228): Diatype Regular 52px, ls -2.08 */}
        <h3 className="mb-4 text-[24px] font-normal leading-[0.933] tracking-[-0.96px] xl:mb-6 xl:text-[52px] xl:tracking-[-2.08px]">
          <span className="xl:hidden">[{num}] </span>
          {title}
        </h3>
        <ul className="border-b border-grey/40">
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <li key={item.t} className="border-t border-grey/40">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="hoverable flex w-full items-center justify-between gap-6 py-3 text-left"
                >
                  {/* Figma 1230:2229-2233: Regular 30px, ls -1.2, GRIGIO1 */}
                  <span className="text-[16px] font-normal leading-[0.933] tracking-[-0.64px] text-grey xl:text-[30px] xl:tracking-[-1.2px]">
                    {item.t}
                  </span>
                  <svg
                    aria-hidden
                    viewBox="0 0 22 22"
                    className={`h-[22px] w-[22px] shrink-0 text-grey transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
                  >
                    <path d="M11 0v22M0 11h22" stroke="currentColor" strokeWidth="1" />
                  </svg>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "[grid-template-rows:1fr]" : "[grid-template-rows:0fr]"}`}
                >
                  <div className="overflow-hidden">
                    <p
                      className={`max-w-[720px] pb-5 text-[15px] font-light leading-[1.1] tracking-[-0.4px] text-grey2 transition-opacity duration-300 xl:text-[20px] ${isOpen ? "opacity-100" : "opacity-0"}`}
                    >
                      {item.d}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
});

export function Capabilities() {
  const digitRef = useRef<HTMLParagraphElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const digit = digitRef.current;
    if (!digit) return;

    const ctx = gsap.context(() => {
      // UN solo numero: ogni sezione, quando la sua cima passa il centro
      // dello schermo, aggiorna il testo del digit (01→06 e ritorno).
      sectionRefs.current.forEach((el, i) => {
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: "top center",
          end: "bottom center",
          onEnter: () => (digit.textContent = SECTIONS[i].num),
          onEnterBack: () => (digit.textContent = SECTIONS[i].num),
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section id="capabilities" className="px-6 py-24 xl:px-10 xl:py-40">
      <div className="mb-16 max-w-[1265px] xl:mb-24">
        {/* Label di sezione: Diatype Medium 24px, lh 93.3%, ls -4%, GRIGIO1 */}
        <p className="mb-6 text-[40px] leading-[0.97] tracking-[-1.6px] text-label xl:text-[24px] xl:font-medium xl:leading-[0.933] xl:tracking-[-0.96px]">
          Servizi
        </p>
        <p className="text-[15px] leading-[1.2] tracking-[-0.45px] text-grey2 xl:text-[52px] xl:font-medium xl:leading-[1.02] xl:tracking-[-2.08px] xl:text-foreground">
          Chiamati dalla vocazione agli scenari del futuro, plasmiamo il
          dibattito pubblico costruendo nuovi mondi narrativi. Il nostro
          obiettivo è creare cornici culturali dove istituzioni, corporate e
          professionisti possano affermarsi come leader di pensiero sviluppando
          concept in grado di ispirare politiche.
        </p>
      </div>

      {/* Nav interna [01]-[06] con smooth scroll alle sezioni */}
      <nav aria-label="Capabilities" className="mb-32 hidden grid-cols-6 gap-6 xl:grid">
        {SECTIONS.map(({ num, title }) => (
          <a key={num} href={`#cap-${num}`} className="hoverable block">
            <span className="block text-[14px] font-bold tracking-[-0.56px]">
              [{num}]
            </span>
            <span className="mt-2 block max-w-[220px] text-[14px] font-medium leading-[0.933] tracking-[-0.56px] text-grey">
              {title}
            </span>
          </a>
        ))}
      </nav>

      {/* Desktop: digit unico pinnato a sinistra + colonna sezioni a destra.
          Il numero è sticky per l'intera pila e il suo testo cambia 01→06. */}
      <div className="xl:grid xl:grid-cols-[385px_1fr]">
        <div className="hidden xl:block">
          <p
            ref={digitRef}
            aria-hidden
            className="sticky top-[100px] w-fit text-[52px] font-normal leading-[0.933] tracking-[-2.08px]"
          >
            01
          </p>
        </div>
        <div className="flex flex-col gap-16 xl:gap-[420px]">
          {SECTIONS.map((section, i) => (
            <CapSection
              key={section.num}
              ref={(el) => {
                sectionRefs.current[i] = el;
              }}
              {...section}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
