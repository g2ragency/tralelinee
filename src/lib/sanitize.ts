import sanitizeHtml from "sanitize-html";

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

  Perché sanitize-html e non DOMPurify: DOMPurify lato server ha bisogno di
  un DOM, cioè di jsdom, che Next tiene FUORI dal bundle e carica a runtime
  con require(). jsdom oggi è ESM, e su un runtime che non sa fare require()
  di un modulo ESM il caricamento fallisce e con lui l'intera pagina che lo
  importa (era il 500 fisso su /admin/progetti). sanitize-html lavora su un
  parser, non su un DOM, e finisce impacchettato nel bundle del server:
  niente confine CJS/ESM da attraversare a runtime.
*/
const OPZIONI: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "strong", "b", "em", "i", "a"],
  /* Solo sui link, non su tutti i tag: nessun altro elemento ne ha bisogno. */
  allowedAttributes: { a: ["href", "rel"] },
  /* Nessun protocollo esotico: via javascript:, data:, vbscript: */
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesAppliedToAttributes: ["href"],
  /*
    Riscrive il tag invece di ripulirlo attributo per attributo: qualunque
    cosa ci fosse sopra (target, ping, gestori) sparisce perché non viene
    ricopiata. `target` NON è ammesso: i link restano nella stessa scheda e
    così non esiste nemmeno il problema della finestra di origine
    manipolabile. Lo schema dell'href lo controlla comunque il filtro sopra.
  */
  transformTags: {
    a: (tagName, attribs) => {
      const puliti: Record<string, string> = { rel: "noopener noreferrer" };
      if (attribs.href) puliti.href = attribs.href;
      return { tagName, attribs: puliti };
    },
  },
};

export function sanitizeRichText(dirty: string): string {
  return sanitizeHtml(dirty, OPZIONI);
}
