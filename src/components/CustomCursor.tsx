"use client";

import { useEffect, useRef } from "react";

/*
  A2 — cursore custom: un solo pallino di vetro, senza cerchio, senza stati e
  senza inseguimento.

  Il pallino sta ESATTAMENTE sotto il puntatore: la posizione si scrive nel
  gestore del movimento, non in un ciclo di animazione che rincorre. Qualsiasi
  interpolazione, anche breve, si sente come ritardo.

  Il cursore di sistema si nasconde da qui e non dal foglio di stile: se il
  JavaScript non parte — o non c'è un puntatore fine, quindi niente pallino —
  la pagina resta col suo cursore invece di ritrovarsi senza nulla.
*/
export function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = ref.current;
    if (!dot) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    document.documentElement.classList.add("cursore-custom");

    const muovi = (e: MouseEvent) => {
      dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      // Fino al primo movimento resta fuori campo, per non farlo comparire
      // nell'angolo in alto a sinistra al caricamento.
      if (!dot.style.opacity) dot.style.opacity = "1";
    };

    window.addEventListener("mousemove", muovi);
    return () => {
      window.removeEventListener("mousemove", muovi);
      document.documentElement.classList.remove("cursore-custom");
    };
  }, []);

  return <div id="cursor" ref={ref} aria-hidden="true" />;
}
