/*
  Raggruppamento dei contenuti della griglia in riquadri.

  Il repeater dell'admin è piatto (un livello solo), quindi il legame «più
  contenuti nello stesso riquadro» passa dal campo `box`: stesso nome = stesso
  riquadro, vuoto = riquadro a sé. L'ordine dei riquadri è quello di prima
  apparizione.

  Vive in un file suo, senza import interni, per restare collaudabile con
  `node --experimental-strip-types` come il sanificatore.
*/

export type Slide = { etichetta: string; numero: string; didascalia: string };

const s = (v: unknown) => (typeof v === "string" ? v : "");

export function raggruppa(valore: unknown): Slide[][] {
  const items = Array.isArray(valore)
    ? (valore as unknown[]).filter(
        (v): v is Record<string, unknown> => !!v && typeof v === "object",
      )
    : [];

  const boxes: { chiave: string; slides: Slide[] }[] = [];

  items.forEach((it) => {
    const slide = {
      etichetta: s(it.etichetta),
      numero: s(it.numero),
      didascalia: s(it.didascalia),
    };
    // Riga lasciata a metà nell'admin: non deve produrre un riquadro vuoto.
    if (!slide.numero && !slide.etichetta) return;

    const chiave = s(it.box).trim();
    const esistente = chiave
      ? boxes.find((b) => b.chiave === chiave)
      : undefined;
    if (esistente) esistente.slides.push(slide);
    // La chiave interna dei riquadri senza nome non può collidere con una
    // scritta dall'utente: lo spazio iniziale sopravvive al trim, quella no.
    else boxes.push({ chiave: chiave || ` ${boxes.length}`, slides: [slide] });
  });

  return boxes.map((b) => b.slides);
}
