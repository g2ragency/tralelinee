"use client";

import { Fragment, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { rivelaParole } from "@/lib/rivela";

gsap.registerPlugin(ScrollTrigger);

/*
  Testo che si «accende» con lo scroll, carattere per carattere in ordine di
  lettura (come il taglio a metà parola nel design: «strum|enti»).

  Si anima l'OPACITÀ, non il colore: i caratteri sono il bianco del tema
  (#DFDFDF) e da spenti stanno al 47,1%, che sul nero dà 223 × 0,471 = 105,
  cioè esattamente il grigio #696969 richiesto. Animare il colore vero
  significherebbe leggerlo al montaggio e ritrovarselo stantìo dopo un cambio
  tema; così invece il tema chiaro si arrangia da sé.

  La corsa è misurata sul testo, non sulla sezione che lo contiene: il testo
  sta centrato, quindi una fine legata alla sezione lo faceva completare
  quando era già uscito dallo schermo — le ultime lettere si accendevano
  invisibili.

  Si guarda la CIMA del blocco in entrambi gli estremi, non il fondo: così la
  corsa è la stessa mezza schermata per tutti (450px a 900 di altezza), mentre
  legandola al fondo dipenderebbe dall'altezza del blocco — il testo lungo di
  Metodo finirebbe già tagliato in cima e quello corto di Contatti prima
  ancora di arrivare. Accende mentre il testo sale da 80% a 30% dello schermo,
  cioè fin dove si legge comodo.

  I caratteri stanno in span per parola con nowrap: senza, gli a-capo
  cadrebbero dentro le parole spezzate in singoli span.
*/
export function EvidenziaScroll({
  paragrafi,
  classeP,
  inizio = "top 50%",
  fine = "top 0%",
  rivela = false,
}: {
  paragrafi: string[];
  classeP?: string;
  /*
    Prima dell'accensione, le righe entrano da dietro una maschera (vedi
    lib/rivela). L'accensione parte a salita finita, sui nodi ripristinati.
  */
  rivela?: boolean;
  /*
    Dove comincia e dove finisce l'accensione, in posizione del blocco
    rispetto alla finestra. I valori di partenza sono quelli dell'intro, che
    occupa lo schermo intero: un blocco piu' piccolo, come le schede del
    Metodo, deve finire piu' in alto — altrimenti la sezione se ne va prima
    che il testo si sia acceso del tutto.
  */
  inizio?: string;
  fine?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    // Chi ha chiesto meno animazioni legge il testo pieno, non uno spento.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(root.querySelectorAll("[data-c]"), { opacity: 1 });
      root
        .querySelectorAll(".invisible")
        .forEach((el) => el.classList.remove("invisible"));
      return;
    }

    /*
      GSAP non tocca i caratteri: fa avanzare un numero da 0 a 1 con lo
      scroll (con la stessa morbidezza, scrub 0.6) e l'opacità di ognuno la
      calcola `dipingi`, che scrive e basta.

      Prima era un tween scaglionato sui caratteri: GSAP leggeva l'opacità
      di partenza di ognuno alternando letture e scritture, e il browser
      ricalcolava gli stili a ogni lettera — fino a 938 ricalcoli in un
      fotogramma, 1,8 secondi di pagina ferma su un telefono medio (tracce
      di Chrome, 18/11). La formula è quella dello scaglionamento di prima:
      ogni carattere parte 0,15 dopo il precedente e dura 2, quindi ~13
      caratteri sono in transizione insieme e il fronte resta morbido.
    */
    const PASSO = 0.15;
    const DURATA = 2;
    const SPENTO = 0.471;
    let ctx: gsap.Context | null = null;
    const accendi = () => {
      const chars = [...root.querySelectorAll<HTMLElement>("[data-c]")];
      const totale = (chars.length - 1) * PASSO + DURATA;
      const scritte = new Float64Array(chars.length).fill(SPENTO);
      const dipingi = (progresso: number) => {
        const t = progresso * totale;
        for (let i = 0; i < chars.length; i++) {
          const locale = Math.min(1, Math.max(0, (t - i * PASSO) / DURATA));
          // al millesimo: sotto non si vede, e si risparmiano scritture
          const o = Math.round((SPENTO + (1 - SPENTO) * locale) * 1000) / 1000;
          if (o !== scritte[i]) {
            scritte[i] = o;
            chars[i].style.opacity = String(o);
          }
        }
      };
      const stato = { p: 0 };
      ctx = gsap.context(() => {
        gsap.to(stato, {
          p: 1,
          ease: "none",
          onUpdate: () => dipingi(stato.p),
          scrollTrigger: {
            trigger: root,
            start: inizio,
            end: fine,
            scrub: 0.6,
          },
        });
      }, root);
    };

    let fermaRivela: (() => void) | undefined;
    if (rivela) {
      fermaRivela = rivelaParole([...root.querySelectorAll<HTMLElement>("p")], {
        alTermine: accendi,
      });
    } else {
      accendi();
    }

    return () => {
      fermaRivela?.();
      ctx?.revert();
    };
  }, [inizio, fine, rivela]);

  return (
    <div ref={ref}>
      {paragrafi.map((testo, i) => (
        <p key={i} className={`${rivela ? "invisible " : ""}${classeP ?? ""}`}>
          {testo.split(" ").map((parola, j) => (
            <Fragment key={j}>
              {j > 0 && " "}
              {/* inline-block perché la parola possa salire (transform);
                  con nowrap era già un blocco unico, l'impaginazione non
                  cambia. */}
              <span data-parola className="inline-block whitespace-nowrap">
                {[...parola].map((c, k) => (
                  <span key={k} data-c className="opacity-[0.471]">
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
