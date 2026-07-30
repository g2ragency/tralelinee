/*
  Controllo del sanificatore. È l'unico punto che impedisce a HTML ostile di
  finire in una pagina vista da tutti gli utenti approvati, quindi merita una
  verifica eseguibile.

  Esegui:  node --experimental-strip-types src/lib/sanitize.test.ts
*/
import assert from "node:assert/strict";
import { sanitizeRichText } from "./sanitize.ts";

const casi: [string, string, (out: string) => boolean][] = [
  [
    "conserva grassetto, corsivo e paragrafi",
    "<p><strong>Attacco:</strong> testo <em>corsivo</em></p>",
    (o) => o.includes("<strong>") && o.includes("<em>") && o.includes("<p>"),
  ],
  [
    "rimuove gli script",
    '<p>ok</p><script>alert("x")</script>',
    (o) => !/script/i.test(o) && o.includes("ok"),
  ],
  [
    "rimuove i gestori inline",
    '<p onclick="rubaDati()">testo</p>',
    (o) => !/onclick/i.test(o) && o.includes("testo"),
  ],
  [
    "rimuove i link javascript:",
    '<a href="javascript:alert(1)">clic</a>',
    (o) => !/javascript:/i.test(o),
  ],
  [
    "rimuove i tag non ammessi ma tiene il testo",
    "<h1>Titolo</h1><ul><li>voce</li></ul>",
    (o) => !/<h1|<ul|<li/i.test(o) && o.includes("Titolo"),
  ],
  [
    "rimuove target e mette rel di sicurezza su ogni link",
    '<a href="https://esempio.it" target="_blank">vai</a>',
    (o) =>
      !/target/i.test(o) &&
      o.includes('rel="noopener noreferrer"') &&
      o.includes("esempio.it"),
  ],
  [
    "rimuove le immagini iniettate con onerror",
    '<img src=x onerror="alert(1)">',
    (o) => !/onerror/i.test(o) && !/<img/i.test(o),
  ],
];

let falliti = 0;
for (const [nome, input, atteso] of casi) {
  const out = sanitizeRichText(input);
  try {
    assert.ok(atteso(out), `atteso non soddisfatto — uscita: ${out}`);
    console.log("  ok  " + nome);
  } catch (e) {
    falliti++;
    console.error("FAIL  " + nome + "\n      " + (e as Error).message);
  }
}

/*
  Non è coperto qui il caso annidato nei repeater (sanitizeBySchema, in
  sections/sanitize.ts): dipende dallo schema e non gira con node puro.
  Verificato empiricamente sul database: nel blocco «voci» il contenuto
  archiviato contiene solo <p> e <strong>.
*/

if (falliti > 0) {
  console.error(`\n${falliti} controlli falliti`);
  process.exit(1);
}
console.log("\ntutti i controlli passati");
