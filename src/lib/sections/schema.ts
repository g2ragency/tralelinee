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
);

export type SectionContent = Record<string, unknown>;

export type SectionSchema = {
  label: string;
  hint?: string;
  fields: FieldSpec[];
};

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

  carosello: {
    label: "Carosello immagini",
    hint: "Card 30px di raggio, scorrimento orizzontale, 2,2 in vista su desktop.",
    fields: [
      { name: "immagini", label: "Immagini", type: "images" },
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
      ?.fields.filter((f) => f.type === "images")
      .map((f) => f.name) ?? []
  );
}

/* Campi rich text: il sanificatore si basa su questi. */
export function richTextFields(kind: string): string[] {
  return (
    getSchema(kind)
      ?.fields.filter((f) => f.type === "richtext")
      .map((f) => f.name) ?? []
  );
}
