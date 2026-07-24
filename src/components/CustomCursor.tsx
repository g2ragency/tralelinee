"use client";

import { useEffect, useRef } from "react";

const HOVER_SELECTOR = "a, button, .popup-btn, .popup-btn2, .hoverable";
const WHITE_AREA_SELECTOR = "footer, .bluebg-sec, #popup-content, .popup-content";

/*
  A2 — cursore custom a due elementi:
  - dot (#cursor): segue il mouse istantaneamente
  - ring (#cursor-shadow): insegue con lerp 0.1 in requestAnimationFrame
  Su hover di link/bottoni il dot cresce a 6rem (classi in globals.css);
  dentro footer/aree scure il colore è forzato a bianco.
  Sotto i 768px è nascosto via CSS.
*/
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const mouse = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    let raf = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      dot.style.left = `${mouse.x}px`;
      dot.style.top = `${mouse.y}px`;
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const hover = !!target?.closest(HOVER_SELECTOR);
      dot.classList.toggle("is-hover", hover);
      ring.classList.toggle("is-hover", hover);
      document.body.dataset.cursorWhite = String(
        !!target?.closest(WHITE_AREA_SELECTOR)
      );
    };

    const tick = () => {
      ringPos.x += (mouse.x - ringPos.x) * 0.1;
      ringPos.y += (mouse.y - ringPos.y) * 0.1;
      ring.style.left = `${ringPos.x}px`;
      ring.style.top = `${ringPos.y}px`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseover", onMouseOver);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div id="cursor" ref={dotRef} aria-hidden="true" />
      <div id="cursor-shadow" ref={ringRef} aria-hidden="true" />
    </>
  );
}
