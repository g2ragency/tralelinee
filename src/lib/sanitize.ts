import DOMPurify from "isomorphic-dompurify";

/*
  Sanificazione del rich text.

  Questo file resta SENZA import interni, così `sanitize.test.ts` gira con
  node puro: è il cuore di sicurezza e deve essere verificabile da solo.
  La parte che conosce lo schema delle sezioni sta in sections/sanitize.ts.

  Va invocata nel punto di SCRITTURA (Server Action), non nel rendering: è
  l'unico collo di bottiglia da cui passano tutte le modifiche, quindi in
  archivio finisce solo HTML già pulito.

  L'autore è fidato — solo il super admin scrive — ma una sua sessione
  compromessa inietterebbe script in pagine viste da tutti gli utenti
  approvati. Allowlist stretta: solo ciò che l'editor può produrre.
*/
const ALLOWED_TAGS = ["p", "br", "strong", "b", "em", "i", "a"];
/* `target` NON è ammesso: i link restano nella stessa scheda e così non
   esiste nemmeno il problema della finestra di origine manipolabile. */
const ALLOWED_ATTR = ["href", "rel"];

/*
  Hook invece di una sostituzione con regex sull'HTML: opera sul nodo già
  interpretato, quindi non si fa ingannare da attributi con virgolette
  strane o tag annidati. Registrato una volta a livello di modulo.
*/
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.nodeName === "A") {
    (node as Element).removeAttribute("target");
    (node as Element).setAttribute("rel", "noopener noreferrer");
  }
});

export function sanitizeRichText(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // Nessun protocollo esotico: via javascript:, data:, vbscript:
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|#|\/)/i,
  });
}
