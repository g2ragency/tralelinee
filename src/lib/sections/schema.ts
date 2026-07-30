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
  | { type: "images" }
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
  { name: "etichetta", label: "Testo sopra il numero", type: "text" },
  {
    name: "numero",
    label: "Numero",
    type: "text",
    hint: "I simboli + − % sono resi in corpo più piccolo, come nel design.",
  },
  { name: "didascalia", label: "Testo sotto il numero", type: "text" },
];

export const SCHEMAS: Record<string, SectionSchema> = {
  intro: {
    label: "Intro",
    hint: "Scheda dati a sinistra (letta dal progetto) e paragrafo a destra.",
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
    label: "Testo con voci laterali",
    hint: "Voci selezionabili a sinistra, ognuna col proprio testo a destra.",
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

  conclusioni: {
    label: "Conclusioni",
    hint: "Titolo a sinistra, testo a destra con «Leggi di più» se è lungo.",
    fields: [
      { name: "titolo", label: "Titolo", type: "text", required: true },
      { name: "testo", label: "Testo", type: "richtext" },
    ],
  },

  carosello: {
    label: "Carosello immagini",
    hint: "Card 30px di raggio, scorrimento orizzontale, 2,2 in vista su desktop.",
    fields: [
      { name: "immagini", label: "Immagini", type: "images" },
    ],
  },

  griglia: {
    label: "Griglia numeri",
    hint: "Riquadri con i numeri, testo di raccordo, e una seconda fila di riquadri.",
    fields: [
      {
        name: "sopra",
        label: "Riquadri sopra il testo",
        type: "repeater",
        itemLabel: "Contenuto",
        fields: CAMPI_BOX,
        groupBy: "box",
        groupLabel: "Riquadro",
        groupHint: GRUPPO_HINT,
      },
      {
        name: "testo",
        label: "Testo di raccordo",
        type: "richtext",
        hint: "Il grassetto mette in evidenza in bianco (nomi, cariche).",
      },
      {
        name: "sotto",
        label: "Riquadri sotto il testo",
        type: "repeater",
        itemLabel: "Contenuto",
        fields: CAMPI_BOX,
        groupBy: "box",
        groupLabel: "Riquadro",
        groupHint: GRUPPO_HINT,
      },
    ],
  },

  media: {
    label: "Media",
    hint: "Immagine o video a piena larghezza, angoli 30px, proporzione 16:9.",
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
        hint: "Resta nel bucket privato. Meglio restare sotto i 50MB.",
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
      { name: "alt", label: "Testo alternativo", type: "text" },
    ],
  },
};

export function getSchema(kind: string): SectionSchema | undefined {
  return SCHEMAS[kind];
}

/* Elenco per il menu "aggiungi sezione". */
export function sectionOptions() {
  return Object.entries(SCHEMAS)
    .map(([kind, s]) => ({ kind, label: s.label, hint: s.hint }))
    .sort((a, b) => a.label.localeCompare(b.label));
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
