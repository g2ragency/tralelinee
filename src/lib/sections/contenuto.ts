/* Estensione esplicita: così `contenuto.test.ts` risolve anche con node puro,
   che non ha la risoluzione del bundler. */
import { getSchema, arrayFields, type SectionContent } from "./schema.ts";

/*
  Costruisce il contenuto di una sezione dal form.

  Perché una FUSIONE e non una sostituzione: i campi con `showIf` non sono a
  schermo quando la condizione non vale, quindi non arrivano nel FormData.
  Riscrivendo il contenuto con i soli campi arrivati, quelli nascosti
  sparivano dall'archivio — nel blocco Media bastava passare da video a
  immagine per perdere il link del video. Un campo assente non è un campo
  svuotato: chi svuota un campo lo manda comunque, vuoto.

  Restano però solo le chiavi previste dallo schema, per due motivi: Next
  inietta campi propri nel form (es. $ACTION_ID_…) e non devono finire nel
  jsonb, e un campo tolto dallo schema non deve trascinarsi dietro per sempre
  il proprio valore.

  Niente import interni oltre allo schema (che a sua volta non ne ha), così
  `contenuto.test.ts` gira con node puro.
*/
export function contenutoDaForm(
  kind: string,
  formData: FormData,
  precedente: SectionContent | null | undefined,
): SectionContent {
  const ammessi = getSchema(kind)?.fields.map((f) => f.name) ?? [];
  const vecchio =
    precedente && typeof precedente === "object" ? precedente : {};
  const elenchi = new Set(arrayFields(kind));

  const content: SectionContent = {};
  for (const nome of ammessi) {
    const v = formData.get(nome);

    if (v === null) {
      // Non era a schermo: si tiene quello che c'era.
      if (nome in vecchio) content[nome] = vecchio[nome];
      continue;
    }

    const valore = typeof v === "string" ? v : String(v);
    if (!elenchi.has(nome)) {
      content[nome] = valore;
      continue;
    }

    // Elenchi (immagini, voci ripetibili): viaggiano come JSON, in archivio
    // devono essere array o il renderer riceverebbe una stringa.
    try {
      const parsed: unknown = JSON.parse(valore);
      content[nome] = Array.isArray(parsed) ? parsed : [];
    } catch {
      content[nome] = [];
    }
  }

  return content;
}
