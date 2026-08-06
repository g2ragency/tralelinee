"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  /* Indietro/Avanti: quella posizione va ripristinata, non azzerata. */
  const daCronologia = useRef(false);

  useEffect(() => {
    const segna = () => {
      daCronologia.current = true;
    };
    window.addEventListener("popstate", segna);
    return () => window.removeEventListener("popstate", segna);
  }, []);

  /*
    Ritorno in cima al cambio pagina.

    Lenis non legge la posizione dal browser: ne tiene una sua e la riapplica
    a ogni fotogramma. Quando Next apre una pagina nuova e riporta il browser
    in cima, Lenis al giro dopo rimette il valore di prima, e la pagina nuova
    si apre nel punto in cui si era lasciata quella vecchia. Capita solo
    quando il suo fotogramma cade dopo l'azzeramento di Next — ed è per
    questo che si presenta a intermittenza e non a ogni passaggio.

    Non basta scrivere sul browser: va detto a LENIS, che è quello che
    comanda. Senza animazione perché non è un movimento da mostrare, e
    forzato perché deve valere anche mentre è fermo.

    Due eccezioni, dove restare in cima sarebbe sbagliato:
    — c'è un'ancora nell'indirizzo (i «/#metodo» del menu): lì si deve
      scendere alla sezione;
    — si è arrivati con Indietro o Avanti: quella posizione va ripristinata.
  */
  useEffect(() => {
    if (daCronologia.current) {
      daCronologia.current = false;
      return;
    }
    if (window.location.hash) return;
    lenisRef.current?.lenis?.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

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
      options={{
        autoRaf: false,
        anchors: { duration: 1.5 },
        /*
          Scorrimento più lento e con partenza più morbida del prestabilito.
          `lerp` è la frazione di distanza recuperata a ogni fotogramma: più
          bassa del solito 0.1, quindi la pagina prende velocità con calma
          invece di scattare; `wheelMultiplier` accorcia il passo di ogni
          scatto di rotella.
        */
        lerp: 0.065,
        wheelMultiplier: 0.9,
      }}
      ref={lenisRef}
    >
      {children}
    </ReactLenis>
  );
}
