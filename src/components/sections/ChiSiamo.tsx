"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/*
  A3 — Chi Siamo: sezione pinnata con scroll orizzontale scrub e indicatore
  di avanzamento aggiornato via containerAnimation (trigger "left center"),
  visibile solo durante il pin. Desktop: contatore "n/4" (Figma 1230:2292);
  mobile: trattini di paginazione e testo a sinistra (Figma 1230:2619).
  Copy verbatim dal Figma (slide 1 dal frame definitivo 1230:2206,
  slide 2-4 dai text node 1230:2146/2148/2150).
*/
const SLIDES: ReactNode[] = [
  /* Figma 1237:551 — Regular 400, enfasi col colore (bianco/grigio) */
  <>
    Tra le linee{" "}
    <span className="text-grey">
      è un&rsquo;agenzia di comunicazione cross mediale e interdisciplinare
      specializzata nell&rsquo;
    </span>
    elaborazione <span className="text-grey">e gestione di </span>
    sistemi di influenza integrati.
  </>,
  <span key="2" className="text-grey">
    <span className="font-normal text-foreground">Progettiamo significati</span>
    , costruiamo senso e visione per chi vuole affermare il proprio
    posizionamento profondo e coerente.
  </span>,
  <span key="3" className="text-grey">
    Pensiamo narrazioni e produciamo immagini influenzando narrazioni pubbliche
    e private attraverso{" "}
    <span className="font-normal text-foreground">
      meccanismi di elaborazione e diffusione
    </span>{" "}
    di frame target.
  </span>,
  <span key="4" className="text-grey">
    Applichiamo lo{" "}
    <span className="font-normal text-foreground">speculative design</span> alla
    comunicazione classica per creare strumenti innovativi ed efficaci,
    editoriali, relazionali e istituzionali.
  </span>,
];

export function ChiSiamo() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(1);
  const [pinned, setPinned] = useState(false);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const ctx = gsap.context(() => {
      const scrollLength = () => track.scrollWidth - window.innerWidth;

      const tween = gsap.to(track, {
        x: () => -scrollLength(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          pin: true,
          // scrub morbido: la posizione insegue lo scroll in ~0.8s
          scrub: 0.8,
          anticipatePin: 1,
          end: () => "+=" + scrollLength(),
          invalidateOnRefresh: true,
          onToggle: (self) => setPinned(self.isActive),
        },
      });

      Array.from(track.children).forEach((slide, i) => {
        ScrollTrigger.create({
          trigger: slide,
          containerAnimation: tween,
          start: "left center",
          onEnter: () => setActive(i + 1),
          onLeaveBack: () => setActive(Math.max(i, 1)),
        });
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="chi-siamo"
      className="relative flex h-svh items-center overflow-hidden"
    >
      <p className="absolute left-6 top-24 text-[16px] tracking-[-0.64px] text-label xl:hidden">
        Chi Siamo
      </p>
      <div ref={trackRef} className="flex will-change-transform">
        {SLIDES.map((slide, i) => (
          <div
            key={i}
            className="grid w-screen shrink-0 place-items-center px-6 xl:px-10"
          >
            <p className="max-w-[1009px] text-left text-[26px] leading-none tracking-[-1.04px] xl:text-center xl:text-[52px] xl:tracking-[-2.08px]">
              {slide}
            </p>
          </div>
        ))}
      </div>
      <div
        aria-hidden
        className={`absolute left-1/2 top-[calc(50%+120px)] -translate-x-1/2 transition-opacity duration-300 xl:top-[calc(50%+170px)] ${pinned ? "opacity-100" : "opacity-0"}`}
      >
        {/* Desktop: contatore n/4 — mobile: trattini di paginazione */}
        <p className="hidden text-[19px] font-bold text-grey xl:block">
          {active}/{SLIDES.length}
        </p>
        <div className="flex gap-2 xl:hidden">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={`h-px w-6 transition-colors duration-300 ${i + 1 === active ? "bg-foreground" : "bg-grey"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
