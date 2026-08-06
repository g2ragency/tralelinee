"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Slide } from "@/lib/sections/griglia";

/* Quanto resta a schermo un contenuto: è anche il tempo che impiega la
   linetta a riempirsi, perché è lei a dire quando si cambia. */
const DURATA = 4500;

/* Ritardo fra un carattere e il successivo, da sinistra a destra. */
const PASSO_CARATTERE = 80;
/* Le parole della didascalia partono più distanziate: sono meno e più larghe. */
const PASSO_PAROLA = 115;
/* Durata del singolo giro: il vecchio esce in alto mentre il nuovo sale. */
const GIRO = 860;
/*
  La didascalia parte quando il numero sta per finire, non dopo: si accavallano
  di poco e il riquadro sembra un movimento solo invece di due.
*/
const ANTICIPO = 620;

/*
  Nel Figma i simboli accanto alla cifra sono in corpo ridotto: «+700k» ha il
  «+» a 50px e «700k» a 104px, «41,6%» ha il «%» piccolo. Le lettere restano
  grandi (la «k» di 700k), quindi la regola guarda i simboli, non i non-numeri.
*/
const SIMBOLI = "+\\-−–%<>~≈";
const inizioSimbolo = new RegExp(`^[${SIMBOLI}]`);

const spezza = (valore: string) =>
  valore.match(new RegExp(`[${SIMBOLI}]+|[^${SIMBOLI}]+`, "g")) ?? [];

/*
  Un numero come sequenza di caratteri animabili singolarmente.

  I pezzi restano quelli di prima (simboli in corpo ridotto), ma ogni carattere
  finisce in un suo `span` così può partire con un ritardo proprio. Il ritardo
  cresce da sinistra a destra: il movimento attraversa il numero invece di
  scattare tutto insieme.
*/
function caratteri(valore: string) {
  const out: { ch: string; simbolo: boolean }[] = [];
  for (const pezzo of spezza(valore)) {
    const simbolo = inizioSimbolo.test(pezzo);
    for (const ch of pezzo) out.push({ ch, simbolo });
  }
  return out;
}

/*
  Contenuto che ruota: il vecchio esce dall'alto mentre il nuovo sale da sotto,
  un pezzo per volta da sinistra a destra.

  Servono entrambi a schermo insieme, quindi si tiene anche il contenuto
  precedente finché l'animazione non è finita. Il nuovo sta nel flusso (è lui
  a dare la misura), il vecchio gli sta sopra in posizione assoluta: così la
  larghezza del riquadro segue quello che resterà, non quello che se ne va.

  `overflow-hidden` taglierebbe le parti basse delle lettere (le «g» di
  «raggiunti»): il riquadro si allarga sotto con del padding e si riprende lo
  spazio con un margine negativo, come nel resto del sito.
*/
function Rotante({
  pezzi,
  precedenti,
  passo,
  ritardo = 0,
  coda = "pb-[0.22em] -mb-[0.22em]",
  chiave,
  className,
  classePezzo,
}: {
  pezzi: { ch: string; simbolo?: boolean }[];
  precedenti: { ch: string; simbolo?: boolean }[] | null;
  passo: number;
  /* Attesa prima del primo pezzo: serve a far partire la didascalia mentre
     il numero sta finendo, invece che insieme a lui. */
  ritardo?: number;
  /*
    Spazio lasciato sotto perché il taglio non mangi le lettere basse. È in
    `em`, quindi va scelto sul testo: alla didascalia serve per le «g», al
    numero basta molto meno (al più una virgola) — e a 104px la misura della
    didascalia diventerebbe uno sbordo di 19px sopra la riga sotto.
  */
  coda?: string;
  /* Cambia a ogni contenuto: rimonta gli span e fa ripartire le animazioni. */
  chiave: number;
  className?: string;
  classePezzo?: (p: { simbolo?: boolean }) => string;
}) {
  const riga = (
    lista: { ch: string; simbolo?: boolean }[],
    verso: "entra" | "esce",
    ritardoBase: number,
  ) => (
    <span className="whitespace-pre">
      {lista.map((p, i) => {
        const ridotto = classePezzo?.(p) ?? "";
        return (
          /*
            Il corpo ridotto sta DENTRO, non su questo span.

            `translateY(100%)` si misura sulla scatola del pezzo che si muove:
            col corpo ridotto addosso, il «+» era alto 60px invece dei 125 del
            contenitore, quindi si spostava di 60 e non usciva mai — restava a
            metà strada e se ne vedevano due, il vecchio e il nuovo. Tenendo
            qui il corpo della riga la scatola è alta quanto il taglio e il
            pezzo lo oltrepassa davvero; il glifo piccolo lo disegna lo span
            interno, appoggiato alla stessa linea di base di prima.
          */
          <span
            key={i}
            className={`inline-block ${
              verso === "entra" ? "animate-sale-dentro" : "animate-sale-fuori"
            }`}
            style={{
              animationDelay: `${ritardoBase + i * passo}ms`,
              animationDuration: `${GIRO}ms`,
            }}
          >
            {ridotto ? (
              <span className={ridotto}>{p.ch === " " ? " " : p.ch}</span>
            ) : p.ch === " " ? (
              " "
            ) : (
              p.ch
            )}
          </span>
        );
      })}
    </span>
  );

  return (
    <span
      className={`relative block overflow-hidden ${coda} ${className ?? ""}`}
    >
      <span key={`n${chiave}`} className="block">
        {riga(pezzi, "entra", ritardo)}
      </span>
      {precedenti && (
        <span
          key={`v${chiave}`}
          aria-hidden
          className="absolute left-0 top-0 block"
        >
          {riga(precedenti, "esce", ritardo)}
        </span>
      )}
    </span>
  );
}

/*
  Chi ha chiesto meno animazioni non si vede cambiare i numeri sotto gli occhi.

  Si legge con `useSyncExternalStore` e non con uno stato aggiornato in un
  effetto: la preferenza è roba del browser, sul server non esiste (da lì la
  terza funzione, che risponde «no»), e così React sa allineare i due alberi
  senza un secondo render a vuoto. Se l'utente cambia impostazione mentre la
  pagina è aperta, il cambio arriva da solo.
*/
const MENO_MOVIMENTO = "(prefers-reduced-motion: reduce)";

function useAnimazioniRidotte() {
  return useSyncExternalStore(
    (notifica) => {
      const mq = window.matchMedia(MENO_MOVIMENTO);
      mq.addEventListener("change", notifica);
      return () => mq.removeEventListener("change", notifica);
    },
    () => window.matchMedia(MENO_MOVIMENTO).matches,
    () => false,
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
  Un riquadro. Tiene per sé l'indice del contenuto mostrato e quello di prima,
  perché durante il cambio devono stare a schermo tutti e due.
*/
function Box({
  slides,
  variante,
  fermo,
}: {
  slides: Slide[];
  variante: "sopra" | "sotto";
  /* Nessuna rotazione: contenuto unico, oppure animazioni ridotte. */
  fermo: boolean;
}) {
  const [attivo, setAttivo] = useState(0);
  const [precedente, setPrecedente] = useState<number | null>(null);
  const ripulisci = useRef<ReturnType<typeof setTimeout> | null>(null);

  const vai = (k: number) => {
    setAttivo((corrente) => {
      if (k === corrente) return corrente;
      setPrecedente(corrente);
      return k;
    });
  };

  /*
    Un'attesa che riparte a ogni cambio, non un intervallo fisso: la linetta
    si riempie in DURATA e ricomincia insieme al contenuto, quindi devono
    essere lo stesso orologio. Con un intervallo fisso, scegliendo una linetta
    a mano la barra ripartiva da zero mentre il conto andava avanti per conto
    suo, e il contenuto cambiava a barra mezza piena.
  */
  useEffect(() => {
    if (fermo || slides.length < 2) return;
    const t = setTimeout(() => {
      setPrecedente(attivo);
      setAttivo((i) => (i + 1) % slides.length);
    }, DURATA);
    return () => clearTimeout(t);
  }, [fermo, slides.length, attivo]);

  /* Finita l'animazione il contenuto vecchio si butta: lasciarlo lì
     terrebbe in piedi un secondo strato per nulla. */
  useEffect(() => {
    if (precedente === null) return;
    clearTimeout(ripulisci.current ?? undefined);
    const massimo =
      GIRO + PASSO_CARATTERE * 12 + PASSO_PAROLA * 6 + ANTICIPO + 100;
    ripulisci.current = setTimeout(() => setPrecedente(null), massimo);
    return () => clearTimeout(ripulisci.current ?? undefined);
  }, [precedente, attivo]);

  const slide = slides[attivo];
  const prima = precedente !== null ? slides[precedente] : null;

  /* L'etichetta descrive il riquadro, non il contenuto: sta sul primo e non
     si muove mentre numero e didascalia ruotano. */
  const etichetta = slides[0]?.etichetta ?? "";

  const numero = caratteri(slide.numero ?? "");
  const numeroPrima = prima ? caratteri(prima.numero ?? "") : null;
  const parole = (t: string) =>
    (t.match(/\S+\s*/g) ?? []).map((p) => ({ ch: p }));

  return (
    <article
      /* Figma: #1B1B1B, raggio 20px, padding 28px 30px */
      className="flex flex-col overflow-hidden rounded-[20px] bg-box px-[30px] py-[28px]"
    >
      {/* Niente spazio riservato: un riquadro con un solo contenuto fa salire
          il titolo al posto delle linette. */}
      {slides.length > 1 && (
        <div className="mb-7 flex gap-[10px]">
          {slides.map((_, k) => (
            <button
              key={k}
              type="button"
              onClick={() => vai(k)}
              aria-label={`Contenuto ${k + 1} di ${slides.length}`}
              aria-current={k === attivo}
              /* La linea è alta 3px: il bersaglio cliccabile lo si allarga con
                 del padding trasparente, non ingrossando la linea. */
              className="-my-2 flex-1 py-2"
            >
              <span className="block h-[3px] overflow-hidden rounded-full bg-grey">
                {/*
                  La linetta non è un pallino acceso o spento: è il tempo che
                  passa. Si riempie da sinistra e quando è piena si cambia
                  contenuto, così il movimento dei testi è la conseguenza
                  visibile di qualcosa, non un timer nascosto.
                */}
                <span
                  key={`${k}-${attivo}`}
                  /*
                    Le linette raccontano a che punto siamo: quelle gia' viste
                    restano piene, quella in corso si riempie, quelle dopo sono
                    vuote. Tornando alla prima si svuotano tutte e il giro
                    ricomincia.
                  */
                  className={`block h-full rounded-full bg-foreground ${
                    k < attivo
                      ? "w-full"
                      : k === attivo && !fermo
                        ? "origin-left animate-riempi"
                        : k === attivo
                          ? "w-full"
                          : "w-0"
                  }`}
                  style={
                    k === attivo && !fermo
                      ? { animationDuration: `${DURATA}ms` }
                      : undefined
                  }
                />
              </span>
            </button>
          ))}
        </div>
      )}

      {etichetta && (
        <p
          className={
            variante === "sopra"
              ? "text-[18px] leading-[1.2] tracking-[-0.04em] text-grey xl:text-[24px]"
              : "text-[22px] leading-[1.2] tracking-[-0.04em] xl:text-[30px]"
          }
        >
          {etichetta}
        </p>
      )}

      <div className="mt-auto pt-10">
        {/* Figma: 56/104px Light, il simbolo in corpo ridotto */}
        <Rotante
          chiave={attivo}
          pezzi={numero}
          precedenti={numeroPrima}
          passo={PASSO_CARATTERE}
          /* Nessuno spazio di grazia sul numero: l'altezza di riga a 1,2
             contiene gia' la virgola di «41,6%», e ogni pixel lasciato qui e'
             un pixel di cifra che sbanda sulla didascalia mentre sale. */
          coda=""
          className="text-[56px] font-light leading-[1.2] tracking-[-0.04em] xl:text-[104px]"
          classePezzo={(p) =>
            p.simbolo
              ? /* tracking ripetuto: in em va ricalcolato sul corpo ridotto */
                "text-[27px] tracking-[-0.04em] xl:text-[50px]"
              : ""
          }
        />
        {slide.didascalia && (
          <Rotante
            chiave={attivo}
            pezzi={parole(slide.didascalia)}
            precedenti={prima?.didascalia ? parole(prima.didascalia) : null}
            passo={PASSO_PAROLA}
            /* Parte mentre l'ultimo carattere del numero sta ancora salendo:
               i due movimenti si toccano invece di darsi il cambio. */
            ritardo={Math.max(
              0,
              (numero.length - 1) * PASSO_CARATTERE + GIRO - ANTICIPO,
            )}
            className="text-[22px] leading-[1.2] tracking-[-0.04em] text-grey xl:text-[30px]"
          />
        )}
      </div>
    </article>
  );
}

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
  const ridotte = useAnimazioniRidotte();

  if (boxes.length === 0) return null;

  return (
    <div
      className={`grid gap-[14px] sm:grid-cols-2 ${COLONNE[Math.min(boxes.length, 4)]}`}
    >
      {boxes.map((slides, i) => (
        <Box
          key={i}
          slides={slides}
          variante={variante}
          fermo={ridotte || slides.length < 2}
        />
      ))}
    </div>
  );
}
