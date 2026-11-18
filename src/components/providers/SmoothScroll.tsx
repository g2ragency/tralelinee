"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis, type LenisRef } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* Posizioni per pagina, per la durata della scheda del browser. */
const MEMORIA = "tralelinee:posizioni";

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
  /* Primo montaggio: un ricaricamento o un Indietro da un altro sito
     ripristinano anche loro, un ingresso normale parte in cima. */
  const primoGiro = useRef(true);

  /*
    Ripristino della posizione con Indietro/Avanti: lo facciamo noi.

    Lasciato al browser non teneva: dopo l'Indietro la pagina si apriva al
    punto giusto, ma un fotogramma dopo Lenis finiva lo scorrimento iniziato
    sulla pagina VECCHIA, e ScrollTrigger, ricalcolando, rimetteva quella
    posizione. Dalla home in cima si tornava a 1080px, cioè dove si era nel
    portfolio; da un progetto lungo, nel footer. Misurato il 18/11 sullo
    staging, con le chiamate registrate una per una.

    Quindi: il browser non ripristina più (`manual`), la posizione di ogni
    pagina si annota qui mentre si scorre, e tornandoci la si dice a Lenis.
    La chiave è il percorso, senza la query: i filtri del portfolio non sono
    pagine diverse.
  */
  const posizioni = useRef<Record<string, number>>({});
  /* Pagina di cui si sta annotando la posizione: finché il percorso nella
     barra non coincide (navigazione in corso) non si annota niente, o la
     posizione della pagina vecchia finirebbe su quella nuova. */
  const pagina = useRef<string | null>(null);
  /*
    Posizione da raggiungere. Si riapplica a ogni fotogramma finché la pagina
    non è abbastanza lunga per arrivarci: le immagini si caricano mentre si
    scende e una pagina lunga, appena riaperta, è più corta di com'era.
    Si abbandona se chi legge scorre, o dopo qualche secondo.
  */
  const obiettivo = useRef<{ y: number; fino: number } | null>(null);

  useEffect(() => {
    const segna = () => {
      daCronologia.current = true;
    };
    window.addEventListener("popstate", segna);

    window.history.scrollRestoration = "manual";
    try {
      posizioni.current = JSON.parse(sessionStorage.getItem(MEMORIA) ?? "{}");
    } catch {
      // sessione non disponibile (navigazione privata): si ricomincia vuoti
    }
    const salva = () => {
      try {
        sessionStorage.setItem(MEMORIA, JSON.stringify(posizioni.current));
      } catch {}
    };
    // Chi tocca la pagina ha la precedenza sul ripristino.
    const lascia = () => {
      obiettivo.current = null;
    };
    const input = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    input.forEach((e) => window.addEventListener(e, lascia, { passive: true }));
    window.addEventListener("pagehide", salva);
    return () => {
      window.removeEventListener("popstate", segna);
      input.forEach((e) => window.removeEventListener(e, lascia));
      window.removeEventListener("pagehide", salva);
      salva();
    };
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
    const tipo = (
      performance.getEntriesByType("navigation")[0] as
        | PerformanceNavigationTiming
        | undefined
    )?.type;
    const ripristina =
      daCronologia.current ||
      (primoGiro.current && (tipo === "reload" || tipo === "back_forward"));
    daCronologia.current = false;
    primoGiro.current = false;
    pagina.current = pathname;

    if (!ripristina && window.location.hash) {
      obiettivo.current = null;
      return;
    }
    const y = ripristina ? (posizioni.current[pathname] ?? 0) : 0;
    obiettivo.current = { y, fino: performance.now() + 3000 };
    // Subito, se Lenis c'è già: ferma anche lo scorrimento rimasto a metà
    // dalla pagina di prima. Il resto lo fa il ticker, fotogramma per
    // fotogramma.
    lenisRef.current?.lenis?.scrollTo(y, { immediate: true, force: true });
  }, [pathname]);

  useEffect(() => {
    /*
      ScrollTrigger va aggiornato DENTRO il fotogramma di Lenis, non dopo.
      L'aggancio si fa al primo fotogramma in cui l'istanza esiste: al
      montaggio `lenisRef.current.lenis` non c'e' ancora (ReactLenis la crea
      nel proprio effetto), e un `on` fatto qui fuori cadeva nel vuoto.
      Senza aggancio ScrollTrigger si arrangiava con l'evento `scroll` del
      browser, che arriva un paio di fotogrammi dopo: il numero 01-06 dei
      servizi cambiava col titolo gia' 14px oltre il punto giusto.
    */
    let sgancia: (() => void) | null = null;
    const annota = ({ scroll }: { scroll: number }) => {
      // Durante un ripristino le posizioni intermedie non contano.
      if (obiettivo.current) return;
      if (pagina.current && pagina.current === window.location.pathname) {
        posizioni.current[pagina.current] = Math.round(scroll);
      }
    };
    const update = (time: number) => {
      const lenis = lenisRef.current?.lenis;
      if (!lenis) return;
      if (!sgancia) {
        lenis.on("scroll", ScrollTrigger.update);
        lenis.on("scroll", annota);
        sgancia = () => {
          lenis.off("scroll", ScrollTrigger.update);
          lenis.off("scroll", annota);
        };
      }
      const o = obiettivo.current;
      if (o) {
        // Si arriva al punto chiesto, o al più lontano possibile per ora.
        const y = Math.min(o.y, lenis.limit);
        if (Math.abs(lenis.scroll - y) > 1) {
          lenis.scrollTo(y, { immediate: true, force: true });
        }
        const arrivato = lenis.limit >= o.y && Math.abs(lenis.scroll - o.y) <= 1;
        if (arrivato || performance.now() > o.fino) {
          obiettivo.current = null;
        }
      }
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

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
      /*
        Un refresh non deve MUOVERE la pagina: ricalcola e basta.
        ScrollTrigger la posizione prova a rimetterla da se', ma dopo un
        cambio pagina quella che rimette e' la posizione della pagina
        VECCHIA. Aprendo il portfolio da meta' home si finiva in fondo, nel
        footer: 7729px chiesti su una pagina che ne e' lunga 861, quindi
        tutto in giu'. Si fotografa prima e si rimette solo se e' cambiata.
        (a valle della transizione: gli accordion animano ~300-500ms)
      */
      attesa = setTimeout(() => {
        const prima = window.scrollY;
        ScrollTrigger.refresh();
        /*
          Il controllo va al fotogramma dopo, non subito: ScrollTrigger muove
          la finestra e l'evento `scroll` che ne segue arriva in coda: Lenis
          lo legge e ci si riallinea. Correggendo subito, quell'evento
          arriverebbe DOPO la correzione e rimetterebbe la posizione
          sbagliata.
        */
        requestAnimationFrame(() => {
          if (Math.abs(window.scrollY - prima) > 1) {
            lenisRef.current?.lenis?.scrollTo(prima, {
              immediate: true,
              force: true,
            });
          }
        });
      }, 250);
    });
    ro.observe(document.body);

    return () => {
      gsap.ticker.remove(update);
      sgancia?.();
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
