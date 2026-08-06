/* node --experimental-strip-types src/lib/sections/contenuto.test.ts */
import assert from "node:assert/strict";
import { contenutoDaForm } from "./contenuto.ts";

const form = (campi: Record<string, string>) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(campi)) fd.set(k, v);
  return fd;
};

/*
  Il caso che ha motivato tutto: nel blocco Media i campi dell'altro tipo non
  sono a schermo (showIf), quindi non arrivano nel form. Sostituendo il
  contenuto con i soli campi arrivati, il link del video spariva.
*/
const dopoIlCambioTipo = contenutoDaForm(
  "media",
  form({ tipo: "immagine", immagine: "", alt: "" }),
  { tipo: "video_embed", embed: "https://youtu.be/xyz", alt: "" },
);
assert.equal(dopoIlCambioTipo.embed, "https://youtu.be/xyz");
assert.equal(dopoIlCambioTipo.tipo, "immagine");

// Un campo che ARRIVA vince sempre, anche quando arriva vuoto: svuotare un
// testo deve restare svuotato, non farsi ripescare il valore di prima.
const svuotato = contenutoDaForm(
  "conclusioni",
  form({ titolo: "", testo: "resta" }),
  { titolo: "vecchio", testo: "vecchio" },
);
assert.equal(svuotato.titolo, "");
assert.equal(svuotato.testo, "resta");

// Chiavi non piu' previste dallo schema: potate, non trascinate per sempre.
const potato = contenutoDaForm(
  "conclusioni",
  form({ titolo: "t", testo: "x" }),
  { titolo: "v", testo: "v", campoRimosso: "spazzatura" },
);
assert.equal("campoRimosso" in potato, false);

// Gli elenchi viaggiano come JSON e devono tornare array.
const conElenco = contenutoDaForm(
  "carosello",
  form({ immagini: '["a.jpg","b.jpg"]' }),
  {},
);
assert.deepEqual(conElenco.immagini, ["a.jpg", "b.jpg"]);

// JSON rotto o non-array: elenco vuoto, mai una stringa al renderer.
assert.deepEqual(
  contenutoDaForm("carosello", form({ immagini: "{" }), {}).immagini,
  [],
);
assert.deepEqual(
  contenutoDaForm("carosello", form({ immagini: '"non un array"' }), {}).immagini,
  [],
);

// Un elenco NON arrivato resta quello di prima, gia' come array.
assert.deepEqual(
  contenutoDaForm("carosello", form({}), { immagini: ["a.jpg"] }).immagini,
  ["a.jpg"],
);

// Contenuto precedente sporco dal jsonb: nessuna eccezione.
assert.deepEqual(
  contenutoDaForm("conclusioni", form({ titolo: "t" }), null).titolo,
  "t",
);

// Tipo di sezione sconosciuto: nessun campo ammesso, niente da salvare.
assert.deepEqual(contenutoDaForm("inesistente", form({ x: "1" }), { y: "2" }), {});

console.log("contenuto: ok");
