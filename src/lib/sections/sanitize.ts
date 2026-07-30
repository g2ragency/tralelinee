import { sanitizeRichText } from "@/lib/sanitize";
import { getSchema } from "./schema";

/*
  Sanifica i campi rich text di una sezione seguendo lo schema del suo tipo,
  compresi quelli annidati dentro i repeater. Passando dallo schema invece di
  un elenco di nomi, un tipo nuovo è coperto senza che nessuno se lo ricordi.
*/
export function sanitizeBySchema(
  kind: string,
  content: Record<string, unknown>,
): Record<string, unknown> {
  const fields = getSchema(kind)?.fields ?? [];
  const out = { ...content };

  for (const f of fields) {
    if (f.type === "richtext" && typeof out[f.name] === "string") {
      out[f.name] = sanitizeRichText(out[f.name] as string);
      continue;
    }

    if (f.type === "repeater" && Array.isArray(out[f.name])) {
      const richInterni = f.fields
        .filter((sub) => sub.type === "richtext")
        .map((sub) => sub.name);
      if (richInterni.length === 0) continue;

      out[f.name] = (out[f.name] as unknown[]).map((item) => {
        if (!item || typeof item !== "object") return item;
        const copia = { ...(item as Record<string, unknown>) };
        for (const nome of richInterni) {
          if (typeof copia[nome] === "string") {
            copia[nome] = sanitizeRichText(copia[nome] as string);
          }
        }
        return copia;
      });
    }
  }

  return out;
}
