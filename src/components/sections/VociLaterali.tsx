"use client";

import { useEffect, useRef, useState } from "react";
import { LineaHover } from "@/components/LineaHover";

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

/*
  Il «+» del Figma (22x22, tratto 1px): da aperto resta la sola orizzontale,
  cioe' il «-». Una sola icona invece di due file, la differenza e' un tratto.
*/
function PiuMeno({ aperto }: { aperto: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path d="M0 11.0015H22" stroke="currentColor" strokeMiterlimit="10" />
      <path
        d="M11.001 0V22.0011"
        stroke="currentColor"
        strokeMiterlimit="10"
        className={`transition-opacity duration-200 motion-reduce:transition-none ${
          aperto ? "opacity-0" : "opacity-100"
        }`}
      />
    </svg>
  );
}

export function VociLaterali({ voci }: { voci: Voce[] }) {
  const [attiva, setAttiva] = useState(0);
  /* Fisarmonica da mobile: tutte chiuse all'apertura della pagina. */
  const [apertaMobile, setApertaMobile] = useState<number | null>(null);
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
    "leading-[1.2] tracking-[-1.36px] xl:text-[52px] xl:tracking-[-2.08px]";

  return (
    <>
      {/*
        Da mobile le voci sono una fisarmonica: riga col titolo e il «+», e il
        testo che si apre sotto. Non le due colonne rimpicciolite, che
        costringevano a scegliere una voce per leggerne il testo.
        Figma: titoli 26px interlinea 80%, linee 1px GRIGIO1 sopra e sotto,
        12px di aria fra titolo e linea.
        L'apertura anima `grid-template-rows` da 0fr a 1fr: e' l'unico modo di
        animare verso un'altezza automatica senza misurarla a mano.
      */}
      {!unica && (
        <ul className="border-t border-grey xl:hidden">
          {voci.map((v, i) => {
            const apertoQui = apertaMobile === i;
            return (
              <li key={i} className="border-b border-grey">
                <button
                  type="button"
                  onClick={() => setApertaMobile(apertoQui ? null : i)}
                  aria-expanded={apertoQui}
                  className="flex w-full items-center justify-between gap-4 py-[12px] text-left text-[26px] leading-[0.8] tracking-[-0.04em] text-grey"
                >
                  <span>{v.titolo}</span>
                  <PiuMeno aperto={apertoQui} />
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                    apertoQui ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div
                      className="pb-[12px] text-[14px] font-medium leading-[1.2] tracking-[-0.04em] text-grey [&_a]:underline [&_p]:mt-[1.2em] [&_p:first-child]:mt-0 [&_strong]:font-bold [&_strong]:text-foreground"
                      dangerouslySetInnerHTML={{ __html: v.testo }}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {/* Da desktop restano le due colonne: voci a sinistra, testo a destra.
          Il Figma dà 468px su base 1440, ma nella pagina lasciava troppo vuoto
          in mezzo: sta a poco meno di metà della larghezza utile e cresce con
          la finestra, senza scatti ai breakpoint. */}
      <section
        className={`${unica ? "grid" : "hidden xl:grid"} gap-[22px] xl:grid-cols-[1fr_clamp(468px,43vw,700px)] xl:gap-0`}
      >
        {unica ? (
          /* Conclusioni: titolo 26px da mobile, 22px sopra il testo (il gap
           della section) */
          <h2 className={`${corpoTitolo} max-w-[560px] text-[26px]`}>
            {voci[0].titolo}
          </h2>
        ) : (
          /* Voci: attiva bianca e sottolineata, le altre grigie; hover a bianco */
          <ul className="flex flex-col gap-1">
            {voci.map((v, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => scegli(i)}
                  aria-current={i === attiva}
                  className={`${corpoTitolo} text-[34px] text-left transition-colors duration-200 hover:text-foreground ${
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
              className="text-[14px] leading-[1.2] tracking-[-0.03em] text-grey transition-[max-height] duration-500 ease-out motion-reduce:transition-none xl:text-[30px] xl:tracking-[-1.2px]"
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
              /* Sottolineatura solo al passaggio del mouse, come le voci di
               menu: da fermo il comando non deve gridare. */
              className="mt-6 text-[14px] leading-[1.2] tracking-[-0.03em] text-[#C4C4C4] xl:text-[30px] xl:tracking-[-1.2px]"
            >
              <LineaHover spessore="h-px xl:h-[2px]">
                {espansa ? "Chiudi −" : "Leggi di più +"}
              </LineaHover>
            </button>
          )}
        </div>
      </section>
    </>
  );
}
