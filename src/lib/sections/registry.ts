import type { ComponentType } from "react";

/*
  Registro dei tipi di sezione del case study.

  Ogni tipo vive in una sola voce di SECTIONS: etichetta, campi, form per
  l'admin e componente di rendering. Builder, riordino, visibilità ed
  eliminazione sono generici e non conoscono i tipi — aggiungere una sezione
  significa aggiungere una voce qui, senza toccare nient'altro.

  ⚠️ Volutamente VUOTO: i blocchi li definisce il cliente sui design e li
  aggiungiamo uno alla volta. Finché è vuoto il builder lo dichiara
  esplicitamente invece di mostrare un menu senza opzioni.
*/

/* Descrittore di un campo: serve al form dell'admin per rendersi da sé. */
export type FieldSpec =
  | { name: string; label: string; type: "text"; required?: boolean }
  | { name: string; label: string; type: "textarea"; required?: boolean }
  | { name: string; label: string; type: "richtext"; required?: boolean }
  | { name: string; label: string; type: "image" }
  | { name: string; label: string; type: "images" }
  | { name: string; label: string; type: "number" }
  | { name: string; label: string; type: "url" };

export type SectionContent = Record<string, unknown>;

export type SectionDef = {
  /* Etichetta mostrata nel menu "aggiungi sezione" */
  label: string;
  /* Descrizione breve per l'admin */
  hint?: string;
  /* Campi compilabili: il form dell'admin si costruisce da qui */
  fields: FieldSpec[];
  /* Rendering nella pagina case study */
  Render: ComponentType<{ content: SectionContent }>;
};

export const SECTIONS: Record<string, SectionDef> = {
  // es. testo: { label: "Testo", fields: [...], Render: TestoRender },
};

export function getSection(kind: string): SectionDef | undefined {
  return SECTIONS[kind];
}

/* Elenco per il menu di inserimento, ordinato per etichetta. */
export function sectionOptions() {
  return Object.entries(SECTIONS)
    .map(([kind, def]) => ({ kind, label: def.label, hint: def.hint }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/* I campi che contengono rich text: il sanificatore si basa su questi. */
export function richTextFields(kind: string): string[] {
  return (
    getSection(kind)
      ?.fields.filter((f) => f.type === "richtext")
      .map((f) => f.name) ?? []
  );
}
