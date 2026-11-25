/*
  Schema dei tipi di sezione: etichette e campi compilabili.

  Volutamente SENZA i componenti di rendering, che stanno in `render.tsx`:
  questo file lo importa anche il form dell'admin, che è un client component,
  e includere qui i renderer (Server Component, che leggono dal database)
  li trascinerebbe nel bundle del browser.

  Aggiungere un tipo = una voce qui + una voce in render.tsx.
*/

export type FieldSpec = {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  /* Mostra il campo solo se un altro campo ha un certo valore. */
  showIf?: { field: string; equals: string };
} & (
  | { type: "text" }
  | { type: "textarea" }
  | { type: "richtext" }
  | { type: "image" }
  /* video: il campo accetta anche MP4/WebM (solo dove il blocco li sa mostrare) */
  | { type: "images"; video?: boolean }
  | { type: "video" }
  | { type: "url" }
  | { type: "number" }
  | { type: "select"; options: { value: string; label: string }[] }
  /*
    Elenco ripetibile di gruppi di campi (es. le voci di un accordion, i box
    di una griglia). Viaggia nel form come JSON e finisce nel jsonb come array
    di oggetti. Un solo livello: niente repeater dentro repeater.
  */
  | {
      type: "repeater";
      itemLabel: string;
      fields: FieldSpec[];
      /*
        Raccoglie gli elementi per il valore di questo campo, mostrandoli
        dentro il gruppo a cui appartengono invece che in un elenco piatto: il
        campo resta nei dati ma sparisce dal form, perché ricopiare la stessa
        sigla su più elementi è il modo migliore per rendere il legame
        illeggibile.
      */
      groupBy?: string;
      groupLabel?: string;
      groupHint?: string;
      /*
        Campi che descrivono il RIQUADRO e non il singolo contenuto: si
        compilano una volta sola in cima al gruppo e il valore viene scritto
        su tutti i suoi elementi. I dati restano piatti — chi legge prende il
        valore dal primo contenuto del riquadro — così `raggruppa` non cambia.
      */
      groupFields?: FieldSpec[];
    }
);

export type SectionContent = Record<string, unknown>;

export type SectionSchema = {
  label: string;
  hint?: string;
  fields: FieldSpec[];
};

/*
  Un box della griglia mostra un contenuto per volta. Più contenuti con lo
  stesso nome di box si alternano dentro lo stesso riquadro, con le linette in
  alto per passare da uno all'altro.
*/
const GRUPPO_HINT =
  "Con più contenuti il riquadro diventa un carosello: si alternano da soli e in cima compaiono le linette per sceglierli.";

const CAMPI_BOX: FieldSpec[] = [
  /* Nascosto dal form: il riquadro di appartenenza lo assegna `groupBy`. */
  { name: "box", label: "Riquadro", type: "text" },
  {
    name: "numero",
    label: "Numero",
    type: "text",
    hint: "I simboli + − % sono resi in corpo più piccolo, come nel design.",
  },
  { name: "didascalia", label: "Testo sotto il numero", type: "text" },
];

/*
  Il testo in cima descrive il riquadro, non il singolo contenuto: nei social
  è il nome del canale, e resta fermo mentre numero e didascalia si alternano.
  Per questo si scrive una volta sola.
*/
const CAMPI_RIQUADRO: FieldSpec[] = [
  { name: "etichetta", label: "Testo sopra il numero", type: "text" },
];

export const SCHEMAS: Record<string, SectionSchema> = {
  intro: {
    label: "Apertura: dati del progetto e paragrafo",
    hint: "A sinistra Industry e Servizi, presi dai dati del progetto qui sopra; a destra il paragrafo di presentazione.",
    fields: [
      {
        name: "testo",
        label: "Paragrafo",
        type: "textarea",
        hint: "Righe vuote per separare i paragrafi.",
        required: true,
      },
    ],
  },

  voci: {
    label: "Testo a schede (titoli a sinistra)",
    hint: "Titoli cliccabili a sinistra; ognuno mostra il proprio testo a destra. Es. «La sfida», «La strategia».",
    fields: [
      {
        name: "voci",
        label: "Voci",
        type: "repeater",
        itemLabel: "Voce",
        fields: [
          { name: "titolo", label: "Titolo", type: "text", required: true },
          {
            name: "testo",
            label: "Testo",
            type: "richtext",
            hint: "Il grassetto serve per gli attacchi tipo «Nessuna Brand Equity:».",
          },
        ],
      },
    ],
  },

  carosello: {
    label: "Carosello di immagini",
    hint: "Immagini in fila che scorrono di lato; da computer se ne vedono due e un pezzo della terza.",
    fields: [
      { name: "immagini", label: "Immagini", type: "images" },
    ],
  },

  /* Veronika, 24/11: al posto del carosello verticale nel case study. */
  "carosello-scorrimento": {
    label: "Doppio carosello (si muove con lo scorrimento)",
    hint: "Due file di foto orizzontali, una sotto l'altra, che si spostano in versi opposti mentre si scorre la pagina e tornano indietro risalendo. Almeno 4 foto per fila: con meno la fila non ha spazio per muoversi.",
    fields: [
      {
        name: "formato",
        label: "Formato delle foto",
        type: "select",
        options: [
          { value: "3-2", label: "3:2" },
          { value: "16-9", label: "16:9" },
        ],
      },
      {
        name: "riga1",
        label: "Foto della prima fila",
        type: "images",
        hint: "Scendendo si sposta verso sinistra.",
      },
      {
        name: "riga2",
        label: "Foto della seconda fila",
        type: "images",
        hint: "Scendendo si sposta verso destra.",
      },
    ],
  },

  griglia: {
    label: "Numeri in evidenza",
    hint: "Riquadri con un numero grande e la sua didascalia (visitatori, ospiti…), più un testo sotto.",
    fields: [
      {
        name: "sopra",
        label: "Riquadri",
        type: "repeater",
        itemLabel: "Contenuto",
        fields: CAMPI_BOX,
        groupFields: CAMPI_RIQUADRO,
        groupBy: "box",
        groupLabel: "Riquadro",
        groupHint: GRUPPO_HINT,
      },
      {
        name: "testo",
        label: "Testo sotto i riquadri",
        type: "richtext",
        hint: "Il grassetto si vede in bianco: serve per nomi e cariche.",
      },
    ],
  },

  social: {
    label: "Numeri dei social",
    hint: "Un riquadro per canale (Instagram, Facebook…) con numero e didascalia. Più numeri nello stesso riquadro si alternano da soli.",
    fields: [
      {
        name: "riquadri",
        label: "Riquadri",
        type: "repeater",
        itemLabel: "Contenuto",
        fields: CAMPI_BOX,
        groupFields: CAMPI_RIQUADRO,
        groupBy: "box",
        groupLabel: "Riquadro",
        groupHint: GRUPPO_HINT,
      },
    ],
  },

  loghi: {
    label: "Loghi della stampa (scorrono)",
    hint: "Una o due file di loghi che scorrono senza fine, in direzioni opposte.",
    fields: [
      { name: "titolo", label: "Titolo", type: "text" },
      {
        name: "riga1",
        label: "Loghi della prima riga",
        type: "images",
        hint: "Scorre verso sinistra.",
      },
      {
        name: "riga2",
        label: "Loghi della seconda riga",
        type: "images",
        hint: "Scorre verso destra. Lasciandola vuota resta una riga sola.",
      },
    ],
  },

  immagini: {
    label: "Immagini (una o due per riga)",
    hint: "Un formato per blocco. Per alternare formati diversi si aggiungono più blocchi e si mettono in ordine con le frecce.",
    fields: [
      {
        name: "formato",
        label: "Formato",
        type: "select",
        /*
          Misure del Figma su base 1440: larghezza utile 1360 e 20px di gap,
          quindi i formati affiancati sono larghi (1360 − 20) / 2 = 670.
        */
        options: [
          { value: "16-9", label: "Una per riga, 16:9 — 1360×765" },
          { value: "alta", label: "Una per riga, alta — 1360×980" },
          { value: "3-2", label: "Una per riga, 3:2 — 1360×907" },
          { value: "2-1", label: "Una per riga, 2:1 — 1360×680" },
          { value: "fascia", label: "Una per riga, fascia bassa — 1360×300" },
          {
            value: "originale",
            label: "Una per riga, proporzione dell'immagine (nessun ritaglio)",
          },
          { value: "verticali-3-4", label: "Due per riga, verticali 3:4 — 670×894" },
          { value: "verticali", label: "Due per riga, verticali — 670×820" },
          { value: "quadrate", label: "Due per riga, quadrate — 670×670" },
          {
            value: "originale-doppie",
            label: "Due per riga, proporzione dell'immagine (nessun ritaglio)",
          },
        ],
      },
      {
        name: "immagini",
        label: "Immagini e video",
        type: "images",
        video: true,
        hint: "I video (MP4, meglio sotto i 10 MB) partono da soli, senza audio, quando sono sullo schermo. Nei formati «due per riga» quattro immagini fanno due righe. Le immagini vengono ritagliate al formato scelto, tranne in «proporzione dell'immagine». Misura consigliata: almeno il doppio di quella indicata (es. 2720 px di larghezza).",
      },
    ],
  },

  media: {
    label: "Video, o immagine singola 16:9",
    hint: "Un video caricato o da YouTube/Vimeo, oppure una sola immagine, a tutta larghezza in formato 16:9.",
    fields: [
      {
        name: "tipo",
        label: "Contenuto",
        type: "select",
        options: [
          { value: "immagine", label: "Immagine" },
          { value: "video_file", label: "Video caricato" },
          { value: "video_embed", label: "Video da YouTube o Vimeo" },
        ],
      },
      {
        name: "immagine",
        label: "Immagine",
        type: "image",
        showIf: { field: "tipo", equals: "immagine" },
      },
      {
        name: "video",
        label: "File video",
        type: "video",
        hint: "Meglio restare sotto i 50 MB (MP4): pesa su chi apre la pagina.",
        showIf: { field: "tipo", equals: "video_file" },
      },
      {
        name: "modo",
        label: "Riproduzione",
        type: "select",
        options: [
          { value: "comandi", label: "Con i comandi: parte quando lo si avvia" },
          { value: "loop", label: "In loop, da solo e senza audio (animazioni)" },
        ],
        showIf: { field: "tipo", equals: "video_file" },
      },
      {
        name: "embed",
        label: "Indirizzo del video",
        type: "url",
        hint: "Incolla il link di YouTube o Vimeo.",
        showIf: { field: "tipo", equals: "video_embed" },
      },
      {
        name: "poster",
        label: "Immagine di anteprima",
        type: "image",
        hint: "Opzionale, mostrata prima dell'avvio del video.",
        showIf: { field: "tipo", equals: "video_file" },
      },
      {
        name: "alt",
        label: "Descrizione per chi non vede l'immagine",
        type: "text",
        hint: "Letta dagli screen reader. Una frase breve su cosa si vede.",
      },
    ],
  },

  conclusioni: {
    label: "Conclusioni (con «Leggi di più»)",
    hint: "Titolo a sinistra, testo a destra. Se il testo è lungo compare «Leggi di più» per aprirlo tutto.",
    fields: [
      { name: "titolo", label: "Titolo", type: "text", required: true },
      { name: "testo", label: "Testo", type: "richtext" },
    ],
  },
};

export function getSchema(kind: string): SectionSchema | undefined {
  return SCHEMAS[kind];
}

/*
  Elenco per il menu «Aggiungi blocco», nell'ordine in cui di solito i blocchi
  compaiono nella pagina (quello di SCHEMAS), non in ordine alfabetico.
*/
export function sectionOptions() {
  return Object.entries(SCHEMAS).map(([kind, s]) => ({
    kind,
    label: s.label,
    hint: s.hint,
  }));
}

/*
  Campi che viaggiano nel form come JSON (elenchi di path) e vanno riportati
  ad array prima di finire nel jsonb.
*/
export function arrayFields(kind: string): string[] {
  return (
    getSchema(kind)
      ?.fields.filter((f) => f.type === "images" || f.type === "repeater")
      .map((f) => f.name) ?? []
  );
}
