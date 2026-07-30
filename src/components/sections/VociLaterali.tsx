"use client";

import { useEffect, useRef, useState } from "react";

type Voce = { titolo: string; testo: string };

/*
  Blocco «Testo con voci laterali».

  Interattivo, quindi client component: le voci selezionano il testo a destra
  e «Leggi di più» espande in posizione.

  Il «Leggi di più» compare SOLO se il testo eccede l'altezza di troncamento:
  su un testo breve la sfumatura e il collegamento non hanno senso. La misura
  va fatta a valle del layout, e ripetuta quando cambia la larghezza o la voce.
*/
/*
  Troncamento espresso in RIGHE, non in pixel: così vale anche col corpo
  ridotto su mobile senza doppioni per breakpoint.
  ⚠️ 12 righe è stimato dal crop del Figma — valore da confermare.
*/
const RIGHE_CHIUSE = 12;
const ALTEZZA_CHIUSA = `${RIGHE_CHIUSE * 1.2}em`;

export function VociLaterali({ voci }: { voci: Voce[] }) {
  const [attiva, setAttiva] = useState(0);
  const [espansa, setEspansa] = useState(false);
  const [tronca, setTronca] = useState(false);
  /*
    Altezza reale del testo: serve per animare l'apertura. Una transizione
    verso `none` non si anima, quindi da chiuso si va all'altezza misurata in
    pixel e non a un valore automatico.
  */
  const [altezzaPiena, setAltezzaPiena] = useState(0);
  const testoRef = useRef<HTMLDivElement>(null);

  const voce = voci[attiva];

  /*
    Si misura solo a testo chiuso, confrontando l'altezza reale con quella
    visibile: così il valore non dipende dall'unità usata per il troncamento.
    Da espanso non si rimisura, altrimenti «tronca» tornerebbe falso e il
    pulsante per richiudere sparirebbe.
  */
  useEffect(() => {
    const el = testoRef.current;
    if (!el || espansa) return;
    const misura = () => {
      setTronca(el.scrollHeight > el.clientHeight + 8);
      setAltezzaPiena(el.scrollHeight);
    };
    misura();
    const ro = new ResizeObserver(misura);
    ro.observe(el);
    return () => ro.disconnect();
  }, [attiva, espansa, voce?.testo]);

  if (!voce) return null;

  // Cambiando voce si riparte dal testo chiuso: nel gestore, non in un effect.
  const scegli = (i: number) => {
    setAttiva(i);
    setEspansa(false);
  };

  /* Titolo unico: non c'è niente da scegliere, quindi è un titolo e non un
     elenco di pulsanti. È il caso del blocco «Conclusioni». */
  const unica = voci.length === 1;
  const corpoTitolo =
    "text-[34px] leading-[1.2] tracking-[-1.36px] xl:text-[52px] xl:tracking-[-2.08px]";

  return (
    /* Colonna del testo: 468px sul Figma (base 1440). Sopra i 1536 cresce con
       la finestra invece di lasciare una riga corta in mezzo al vuoto. */
    <section className="grid gap-8 xl:grid-cols-[1fr_468px] xl:gap-0 2xl:grid-cols-[1fr_clamp(468px,30.5vw,620px)]">
      {unica ? (
        <h2 className={`${corpoTitolo} max-w-[560px]`}>{voci[0].titolo}</h2>
      ) : (
        /* Voci: attiva bianca e sottolineata, le altre grigie; hover a bianco */
        <ul className="flex flex-col gap-1">
          {voci.map((v, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => scegli(i)}
                aria-current={i === attiva}
                className={`hoverable ${corpoTitolo} text-left transition-colors duration-200 hover:text-foreground ${
                  i === attiva
                    ? "text-foreground underline decoration-solid underline-offset-[6px]"
                    : "text-grey"
                }`}
              >
                {v.titolo}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="xl:ml-auto xl:w-full">
        <div className="relative">
          <div
            ref={testoRef}
            style={{
              maxHeight: espansa ? `${altezzaPiena}px` : ALTEZZA_CHIUSA,
              overflow: "hidden",
            }}
            /* Corpo 30px grigio, attacchi in grassetto bianchi */
            className="text-[20px] leading-[1.2] tracking-[-0.8px] text-grey transition-[max-height] duration-500 ease-out motion-reduce:transition-none xl:text-[30px] xl:tracking-[-1.2px]"
          >
            {/* La chiave rimonta il testo al cambio voce, così l'animazione
                di entrata riparte invece di sostituirlo di scatto. */}
            <div
              key={attiva}
              className="animate-entra [&_a]:underline [&_p]:mt-[1.2em] [&_p:first-child]:mt-0 [&_strong]:font-bold [&_strong]:text-foreground"
              dangerouslySetInnerHTML={{ __html: voce.testo }}
            />
          </div>

          {/* Sfumatura sull'ultima parte del testo troncato */}
          {tronca && !espansa && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[96px] bg-gradient-to-b from-transparent to-background"
            />
          )}
        </div>

        {tronca && (
          <button
            type="button"
            onClick={() => setEspansa((v) => !v)}
            className="hoverable mt-6 text-[20px] leading-[1.2] tracking-[-0.8px] text-[#C4C4C4] underline underline-offset-[6px] xl:text-[30px] xl:tracking-[-1.2px]"
          >
            {espansa ? "Chiudi −" : "Leggi di più +"}
          </button>
        )}
      </div>
    </section>
  );
}
