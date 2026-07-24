"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/*
  A3 — Chi Siamo: sezione pinnata con scroll orizzontale scrub e contatore
  fisso "n/4" aggiornato via containerAnimation (trigger "left center"),
  visibile solo durante il pin. Copy verbatim dal Figma (slide 1 dal frame
  definitivo 1230:2206, slide 2-4 dai text node 1230:2146/2148/2150).
*/
const SLIDES: ReactNode[] = [
  <>
    Tra le linee{" "}
    <span className="text-grey">
      è un&rsquo;agenzia di comunicazione cross mediale e interdisciplinare
      specializzata nell&rsquo;
    </span>
    elaborazione <span className="text-grey">e gestione di </span>sistemi di
    influenza integrati.
  </>,
  <span key="2" className="text-grey2">
    <span className="text-foreground">Progettiamo significati</span>, costruiamo
    senso e visione per chi vuole affermare il proprio posizionamento profondo e
    coerente.
  </span>,
  <span key="3" className="text-grey2">
    Pensiamo narrazioni e produciamo immagini influenzando narrazioni pubbliche
    e private attraverso{" "}
    <span className="text-foreground">
      meccanismi di elaborazione e diffusione
    </span>{" "}
    di frame target.
  </span>,
  <span key="4" className="text-grey2">
    Applichiamo lo <span className="text-foreground">speculative design</span>{" "}
    alla comunicazione classica per creare strumenti innovativi ed efficaci,
    editoriali, relazionali e istituzionali.
  </span>,
];

export function ChiSiamo() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const ctx = gsap.context(() => {
      const scrollLength = () => track.scrollWidth - window.innerWidth;
      const setCounter = (n: number) => {
        if (counterRef.current)
          counterRef.current.textContent = `${n}/${SLIDES.length}`;
      };

      const tween = gsap.to(track, {
        x: () => -scrollLength(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: true,
          end: () => "+=" + scrollLength(),
          invalidateOnRefresh: true,
          onToggle: (self) => {
            if (counterRef.current)
              counterRef.current.style.opacity = self.isActive ? "1" : "0";
          },
        },
      });

      Array.from(track.children).forEach((slide, i) => {
        ScrollTrigger.create({
          trigger: slide,
          containerAnimation: tween,
          start: "left center",
          onEnter: () => setCounter(i + 1),
          onLeaveBack: () => setCounter(Math.max(i, 1)),
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
      <div ref={trackRef} className="flex will-change-transform">
        {SLIDES.map((slide, i) => (
          <div
            key={i}
            className="grid w-screen shrink-0 place-items-center px-6 xl:px-10"
          >
            <p className="max-w-[1009px] text-center text-3xl leading-none tracking-[-1.2px] xl:text-[52px] xl:tracking-[-2.08px]">
              {slide}
            </p>
          </div>
        ))}
      </div>
      <p
        ref={counterRef}
        aria-hidden
        className="absolute left-1/2 top-[calc(50%+170px)] -translate-x-1/2 text-[19px] font-bold text-grey opacity-0 transition-opacity duration-200"
      >
        1/{SLIDES.length}
      </p>
    </section>
  );
}
