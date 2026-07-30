import DOMPurify from "isomorphic-dompurify";

/*
  Sanificazione del rich text.

  Va invocata nel punto di SCRITTURA (Server Action), non nel rendering: è
  l'unico collo di bottiglia da cui passano tutte le modifiche, quindi in
  archivio finisce solo HTML già pulito.

  L'autore è fidato — solo il super admin scrive — ma una sua sessione
  compromessa inietterebbe script in pagine viste da tutti gli utenti
  approvati. Allowlist stretta: solo ciò che l'editor può produrre.
*/
const ALLOWED_TAGS = ["p", "br", "strong", "b", "em", "i", "a"];
const ALLOWED_ATTR = ["href", "target", "rel"];

export function sanitizeRichText(dirty: string): string {
  const clean = DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // Nessun protocollo esotico: via javascript:, data:, vbscript:
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|#|\/)/i,
  });

  // I link esterni non devono poter manipolare la finestra di origine.
  return clean.replace(
    /<a\s+([^>]*?)>/gi,
    (match, attrs: string) =>
      /target=/i.test(attrs)
        ? `<a ${attrs.replace(/\s*rel="[^"]*"/i, "")} rel="noopener noreferrer">`
        : match,
  );
}

/*
  Applica la sanificazione ai soli campi rich text di una sezione, lasciando
  intatti gli altri (numeri, path immagine, testo semplice).
*/
export function sanitizeContent(
  content: Record<string, unknown>,
  richFields: string[],
): Record<string, unknown> {
  if (richFields.length === 0) return content;
  const out = { ...content };
  for (const field of richFields) {
    if (typeof out[field] === "string") {
      out[field] = sanitizeRichText(out[field] as string);
    }
  }
  return out;
}
