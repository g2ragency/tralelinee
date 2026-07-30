/* node --experimental-strip-types src/lib/sections/griglia.test.ts */
import assert from "node:assert/strict";
import { raggruppa } from "./griglia.ts";

const box = (box: string, numero: string) => ({
  box,
  numero,
  etichetta: "",
  didascalia: "",
});

// Senza nome ogni contenuto sta per conto suo.
assert.equal(raggruppa([box("", "1"), box("", "2")]).length, 2);

// Stesso nome = stesso riquadro, anche se i contenuti non sono adiacenti.
const misti = raggruppa([box("a", "1"), box("b", "2"), box("a", "3")]);
assert.equal(misti.length, 2);
assert.deepEqual(
  misti.map((b) => b.map((s) => s.numero)),
  [["1", "3"], ["2"]],
);

// Gli spazi attorno al nome non creano riquadri doppi.
assert.equal(raggruppa([box("a", "1"), box(" a ", "2")]).length, 1);

// Righe vuote scartate; una con la sola etichetta resta (numero facoltativo).
assert.equal(raggruppa([box("", ""), { box: "", etichetta: "solo testo" }]).length, 1);

// Valori sporchi dal jsonb: niente eccezioni.
assert.deepEqual(raggruppa(null), []);
assert.deepEqual(raggruppa("stringa"), []);
assert.deepEqual(raggruppa([null, 3, box("", "1")]).length, 1);

console.log("griglia: ok");
