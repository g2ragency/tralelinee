"use client";

import { useEffect } from "react";
import { useLenis } from "lenis/react";
import Snap from "lenis/snap";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/*
  Aggancio morbido alle sezioni della home (solo desktop).

  `proximity`: lo scroll resta libero, ma fermandosi entro il 35% dell'altezza
  dello schermo dall'inizio di una sezione ci si adagia lì. Niente `mandatory`:
  bloccherebbe lo scorrimento dentro le sezioni più alte di uno schermo
  (Capabilities) e dentro i pin.

  Su touch questo modulo non fa nulla per scelta di Lenis (ignora i gesti):
  lì lavora lo scroll-snap CSS in globals.css, sullo scroll nativo.

  I punti si misurano sugli involucri `.sezione-snap`, mai trasformati: le
  sezioni pinnate durante il pin sono `fixed` e non hanno una posizione utile.
  Si rimisura a ogni refresh di ScrollTrigger, cioè quando i pin-spacer
  cambiano la geometria della pagina.
*/
export function SnapSezioni() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    if (window.matchMedia("(hover: none)").matches) return;
    // Un aggancio è uno scroll automatico: chi ha chiesto meno animazioni non lo subisce.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const snap = new Snap(lenis, {
      type: "proximity",
      distanceThreshold: "35%",
      duration: 1,
      // La stessa curva degli anchor di Lenis: partenza decisa, arrivo morbido.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      debounce: 400,
    });

    let togli: (() => void)[] = [];
    const misura = () => {
      togli.forEach((t) => t());
      togli = [];
      document.querySelectorAll<HTMLElement>(".sezione-snap").forEach((el) => {
        const cima = el.getBoundingClientRect().top + lenis.scroll;
        togli.push(snap.add(Math.round(cima)));
      });
    };

    misura();
    ScrollTrigger.addEventListener("refresh", misura);
    return () => {
      ScrollTrigger.removeEventListener("refresh", misura);
      snap.destroy();
    };
  }, [lenis]);

  return null;
}
