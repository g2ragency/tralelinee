"use client";

import { Fragment, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/*
  Testo che si «accende» con lo scroll, carattere per carattere in ordine di
  lettura (come il taglio a metà parola nel design: «strum|enti»).

  Si anima l'OPACITÀ, non il colore: i caratteri restano il bianco del tema a
  ~45% — che sul nero rende quasi esattamente il grigio #696969 — e salgono a
  piena. Così il tema chiaro funziona da sé, senza colori letti al mount che
  resterebbero stantii dopo un cambio tema.

  Il trigger è la <section> che contiene il testo, non il testo stesso:
  l'accensione parte quando la sezione entra (top 80%) e si COMPLETA quando la
  sezione si aggancia in cima (top top). Legarla al testo — che a riposo sta
  centrato, mai in cima — lascerebbe le ultime righe spente a scroll fermo.

  I caratteri stanno in span per parola con nowrap: senza, gli a-capo
  cadrebbero dentro le parole spezzate in singoli span.
*/
export function EvidenziaScroll({
  paragrafi,
  classeP,
}: {
  paragrafi: string[];
  classeP?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const chars = root.querySelectorAll<HTMLElement>("[data-c]");

    // Chi ha chiesto meno animazioni legge il testo pieno, non uno spento.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(chars, { opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.to(chars, {
        opacity: 1,
        ease: "none",
        // durata lunga rispetto al passo: il fronte di accensione resta
        // morbido, ~13 caratteri in transizione invece di un interruttore
        duration: 2,
        stagger: { each: 0.15 },
        scrollTrigger: {
          trigger: root.closest("section") ?? root,
          start: "top 80%",
          end: "top top",
          scrub: 0.6,
        },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref}>
      {paragrafi.map((testo, i) => (
        <p key={i} className={classeP}>
          {testo.split(" ").map((parola, j) => (
            <Fragment key={j}>
              {j > 0 && " "}
              <span className="whitespace-nowrap">
                {[...parola].map((c, k) => (
                  <span key={k} data-c className="opacity-45">
                    {c}
                  </span>
                ))}
              </span>
            </Fragment>
          ))}
        </p>
      ))}
    </div>
  );
}
