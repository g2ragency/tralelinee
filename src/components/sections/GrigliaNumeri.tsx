"use client";

import { useEffect, useState } from "react";
import type { Slide } from "@/lib/sections/griglia";

/* Ogni riquadro è un elenco di contenuti che si alternano. */
const DURATA = 4500;

/*
  Nel Figma i simboli accanto alla cifra sono in corpo ridotto: «+700k» ha il
  «+» a 50px e «700k» a 104px, «41,6%» ha il «%» piccolo. Le lettere restano
  grandi (la «k» di 700k), quindi la regola guarda i simboli, non i non-numeri.
*/
const SIMBOLI = "+\\-−–%<>~≈";

function Numero({ valore }: { valore: string }) {
  // Spezzoni omogenei: o tutti simboli o nessuno, quindi basta il primo carattere.
  const pezzi =
    valore.match(new RegExp(`[${SIMBOLI}]+|[^${SIMBOLI}]+`, "g")) ?? [];
  return (
    <p className="text-[56px] font-light leading-[1.2] tracking-[-0.04em] xl:text-[104px]">
      {pezzi.map((p, i) => (
        <span
          key={i}
          className={
            new RegExp(`^[${SIMBOLI}]`).test(p)
              ? /* tracking ripetuto: in em va ricalcolato sul corpo ridotto */
                "text-[27px] tracking-[-0.04em] xl:text-[50px]"
              : ""
          }
        >
          {p}
        </span>
      ))}
    </p>
  );
}

/* Classi letterali: Tailwind non genera quelle costruite a runtime. */
const COLONNE: Record<number, string> = {
  1: "xl:grid-cols-1",
  2: "xl:grid-cols-2",
  3: "xl:grid-cols-3",
  4: "xl:grid-cols-4",
};

/*
  Fila di box. «sopra» sta prima del testo di raccordo (etichetta 24px grigia),
  «sotto» dopo (titolo 30px bianco e didascalia grigia).
*/
export function FilaBox({
  boxes,
  variante,
}: {
  boxes: Slide[][];
  variante: "sopra" | "sotto";
}) {
  const [indici, setIndici] = useState<number[]>(() => boxes.map(() => 0));
  const rotante = boxes.some((b) => b.length > 1);

  useEffect(() => {
    if (!rotante) return;
    // Chi ha chiesto meno animazioni non si vede cambiare i numeri sotto gli occhi.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(
      () => setIndici((prev) => prev.map((i, k) => (i + 1) % boxes[k].length)),
      DURATA,
    );
    return () => clearInterval(t);
  }, [boxes, rotante]);

  if (boxes.length === 0) return null;

  const scegli = (box: number, slide: number) =>
    setIndici((prev) => prev.map((v, k) => (k === box ? slide : v)));

  return (
    <div
      className={`grid gap-[14px] sm:grid-cols-2 ${COLONNE[Math.min(boxes.length, 4)]}`}
    >
      {boxes.map((slides, i) => {
        const attivo = indici[i] % slides.length;
        const slide = slides[attivo];
        return (
          <article
            key={i}
            /* Figma: #1B1B1B, raggio 20px, padding 28px 30px */
            className="flex flex-col overflow-hidden rounded-[20px] bg-box px-[30px] py-[28px]"
          >
            {/* Niente spazio riservato: un riquadro con un solo contenuto fa
                salire il titolo al posto delle linette. I numeri restano
                comunque allineati, sono ancorati in basso. */}
            {slides.length > 1 && (
              <div className="mb-7 flex gap-[10px]">
                {slides.map((_, k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => scegli(i, k)}
                    aria-label={`Contenuto ${k + 1} di ${slides.length}`}
                    aria-current={k === attivo}
                    /* La linea è alta 3px: il bersaglio cliccabile lo si allarga
                       con del padding trasparente, non ingrossando la linea. */
                    className="hoverable -my-2 flex-1 py-2"
                  >
                    <span
                      /* Dai token e non dai due esadecimali: sul tema chiaro
                         le linette restavano quelle del tema scuro. */
                      className={`block h-[3px] rounded-full transition-colors duration-300 ${
                        k === attivo ? "bg-foreground" : "bg-grey"
                      }`}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* La chiave rimonta il contenuto al cambio, così l'entrata è
                animata invece di sostituirsi di scatto. */}
            <div key={attivo} className="animate-entra flex flex-1 flex-col">
              {slide.etichetta && (
                <p
                  className={
                    variante === "sopra"
                      ? "text-[18px] leading-[1.2] tracking-[-0.04em] text-grey xl:text-[24px]"
                      : "text-[22px] leading-[1.2] tracking-[-0.04em] xl:text-[30px]"
                  }
                >
                  {slide.etichetta}
                </p>
              )}
              <div className="mt-auto pt-10">
                <Numero valore={slide.numero} />
                {slide.didascalia && (
                  <p className="text-[22px] leading-[1.2] tracking-[-0.04em] text-grey xl:text-[30px]">
                    {slide.didascalia}
                  </p>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
