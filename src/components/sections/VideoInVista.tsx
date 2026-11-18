"use client";

import { useEffect, useRef } from "react";

/*
  Video in loop che gira solo quando si vede.

  Le pagine portfolio ne hanno fino a otto: tutti in riproduzione insieme
  terrebbero occupato il decodificatore anche fuori dallo schermo, e lo
  scorrimento tornerebbe a scattare. Qui il video non si scarica finché non
  si avvicina (preload none), parte entrando in vista e si ferma uscendo.

  Muto, perché i browser avviano da soli solo i video senza audio. Chi ha
  chiesto meno animazioni vede l'anteprima ferma.
*/
export function VideoInVista({
  src,
  poster,
  className,
}: {
  src: string;
  poster?: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    v.muted = true;
    const osserva = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      // parte poco prima di entrare, così il primo fotogramma è già pronto
      { rootMargin: "200px 0px" },
    );
    osserva.observe(v);
    return () => osserva.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden
      className={className}
    />
  );
}
