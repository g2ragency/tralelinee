"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ReactLenis, type LenisRef } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/*
  A1 — smooth scroll globale con Lenis, guidato dal ticker GSAP così che
  ScrollTrigger e Lenis condividano lo stesso clock (necessario per le
  sezioni pinnate A3/A4).
*/
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    const update = (time: number) => {
      lenisRef.current?.lenis?.raf(time * 1000);
    };
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    lenisRef.current?.lenis?.on("scroll", ScrollTrigger.update);

    /*
      ScrollTrigger calcola le posizioni una volta e non si accorge se la
      pagina si allunga DOPO: un accordion aperto sposta tutto quello che sta
      sotto, e i punti in cui il digit 01→06 cambia restano quelli del layout
      vecchio. Aprendo più pannelli lo sfasamento si accumula fino a mostrare
      il numero della sezione sbagliata.
      Si osserva l'altezza del body e a variazione finita si rimisura tutto.
      Il confronto con l'altezza precedente evita di rimisurare in loop
      (refresh muove i pin-spacer e rifarebbe scattare l'observer).
    */
    let altezza = document.body.offsetHeight;
    let attesa: ReturnType<typeof setTimeout> | undefined;
    const ro = new ResizeObserver(() => {
      const nuova = document.body.offsetHeight;
      if (Math.abs(nuova - altezza) < 2) return;
      altezza = nuova;
      clearTimeout(attesa);
      // a valle della transizione (gli accordion animano ~300-500ms)
      attesa = setTimeout(() => ScrollTrigger.refresh(), 250);
    });
    ro.observe(document.body);

    return () => {
      gsap.ticker.remove(update);
      ro.disconnect();
      clearTimeout(attesa);
    };
  }, []);

  return (
    <ReactLenis
      root
      options={{ autoRaf: false, anchors: { duration: 1.5 } }}
      ref={lenisRef}
    >
      {children}
    </ReactLenis>
  );
}
