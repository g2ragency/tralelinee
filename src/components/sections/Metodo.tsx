import { EvidenziaScroll } from "@/components/EvidenziaScroll";

/*
  A6 — Metodo. Intro a piena schermata, poi i quattro punti in quattro
  schede: 2x2 da desktop, una sotto l'altra da mobile.
  Le schede hanno sostituito l'accordion su hover: il testo ora sta sempre a
  vista, quindi non serve piu' ne' l'apertura ne' il carosello mobile.
  Copy dal sito live; intro verbatim.
*/
const ITEMS = [
  {
    title: "Anticipazione Strategica",
    desc: "Immaginare scenari futuri per aiutare clienti, istituzioni o brand a posizionarsi prima che accadano i cambiamenti",
  },
  {
    title: "Issue Shaping",
    desc: "Costruisci mondi futuri e fai in modo che il tuo cliente plasmi il dibattito",
  },
  {
    title: "Creazione di nuovi frame culturali",
    desc: "Nuovi modi di pensare problemi consolidati (es. lavoro, benessere, identità) e creare un “campo semantico” dove il cliente è già leader",
  },
  {
    // Live aggiornato dopo il Figma: "Attivazione", non "Stimolazione"
    title: "Attivazione delle policy",
    desc: "Elaborare concept utili a influenzare chi scrive norme e regolamenti.",
  },
];

const INTRO = [
  "Costruiamo narrazioni che generano immaginari capaci di influenzare percezioni pubbliche e private. Il nostro approccio si basa sull'elaborazione strategica e la diffusione mirata di frame comunicativi in grado di orientare l'agenda setting.",
  "Integriamo gli strumenti dello speculative design nei servizi di comunicazione tradizionale, creando un ecosistema ibrido di soluzioni editoriali, relazionali, istituzionali e comunicative. Il risultato è un metodo che unisce concretezza operativa e visione innovativa, trasformando ogni progetto in un'opportunità di crescita.",
];

/* Etichetta di sezione, uguale sopra l'intro e a lato delle schede. */
const ETICHETTA =
  "text-[12px] font-medium leading-[1.1] tracking-[-0.04em] text-label xl:text-[24px] xl:leading-[0.933] xl:tracking-[-0.72px]";

export function Metodo() {
  return (
    /* Due schermate a ogni misura: etichetta+intro e le quattro schede. */
    <>
      <section
        id="metodo"
        className="flex min-h-svh flex-col justify-center px-[10px] py-24 xl:px-10 xl:py-28"
      >
        <p className={`mb-[10px] xl:mb-20 ${ETICHETTA}`}>Metodo</p>

        {/* Intro: Regular 26px su mobile e 52px da desktop, lh 102%, ls -4%,
            allineata a sinistra; si accende con lo scroll */}
        <EvidenziaScroll
          paragrafi={INTRO}
          classeP="mt-[26px] text-left text-[26px] font-normal leading-[1.02] tracking-[-0.04em] first:mt-0 xl:mt-[52px] xl:text-[52px]"
        />
      </section>

      <section
        aria-label="Metodo — i quattro punti"
        className="flex min-h-svh flex-col justify-center px-[10px] py-24 xl:px-10 xl:py-28"
      >
        {/* Da desktop l'etichetta sta a sinistra delle schede, non sopra. */}
        <div className="xl:grid xl:grid-cols-[220px_1fr]">
          <p className={`mb-[10px] xl:mb-0 ${ETICHETTA}`}>Metodo</p>

          {/* Figma: schede 15px di raggio, fondo GRIGIO2, 20px di padding
              interno e 20px fra riga e riga; da mobile in colonna a 12px. */}
          <ol className="grid gap-[12px] xl:grid-cols-2 xl:gap-[20px]">
            {ITEMS.map((it, i) => (
              <li key={it.title} className="rounded-[15px] bg-box p-[20px]">
                {/* Pallino numerato 25x25, numero 14px: resta uguale a ogni
                    misura, e' gia' la taglia minima. */}
                <span
                  aria-hidden
                  className="flex h-[25px] w-[25px] items-center justify-center rounded-full bg-grey text-[14px] leading-none tracking-[-0.04em] text-white"
                >
                  {i + 1}
                </span>
                {/* 20px di stacco fra pallino, titolo e descrizione. */}
                <h3 className="pt-[20px] text-[18px] font-normal leading-none tracking-[-0.04em] xl:text-[24px]">
                  {it.title}
                </h3>
                <p className="pt-[20px] text-[14px] leading-[1.4] tracking-[-0.04em] text-grey xl:text-[16px]">
                  {it.desc}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
