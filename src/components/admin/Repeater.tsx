"use client";

import { useState } from "react";
import type { FieldSpec } from "@/lib/sections/schema";
import { RichText } from "./RichText";
import { FileUpload } from "./FileUpload";

type Item = Record<string, string>;

const classeInput =
  "border border-grey bg-transparent px-4 py-2 text-[18px] outline-none focus:border-foreground";

const classeBottone = "border border-grey px-2 disabled:opacity-30";

/* Campi di un singolo elemento. Uguali nelle due modalità del repeater. */
function Campi({
  fields,
  item,
  indice,
  nome,
  projectId,
  aggiorna,
}: {
  fields: FieldSpec[];
  item: Item;
  indice: number;
  nome: string;
  projectId: string;
  aggiorna: (indice: number, campo: string, valore: string) => void;
}) {
  return (
    <>
      {fields.map((f) => {
        if (f.type === "richtext") {
          return (
            <RichText
              key={f.name}
              /* niente name: il valore viaggia nel JSON del repeater */
              name={`__${nome}_${indice}_${f.name}`}
              defaultValue={item[f.name]}
              label={f.label}
              hint={f.hint}
              onChange={(html) => aggiorna(indice, f.name, html)}
            />
          );
        }

        if (f.type === "image") {
          return (
            <FileUpload
              key={f.name}
              name={`__${nome}_${indice}_${f.name}`}
              projectId={projectId}
              defaultPath={item[f.name]}
              label={f.label}
              onChange={(path) => aggiorna(indice, f.name, path)}
            />
          );
        }

        return (
          <label key={f.name} className="flex flex-col gap-2">
            <span className="text-[16px] text-grey">{f.label}</span>
            {f.type === "textarea" ? (
              <textarea
                rows={3}
                value={item[f.name] ?? ""}
                onChange={(e) => aggiorna(indice, f.name, e.target.value)}
                className={classeInput}
              />
            ) : f.type === "select" ? (
              <select
                value={item[f.name] ?? ""}
                onChange={(e) => aggiorna(indice, f.name, e.target.value)}
                className="border border-grey bg-background px-4 py-2 text-[18px]"
              >
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={f.type === "number" ? "number" : "text"}
                value={item[f.name] ?? ""}
                onChange={(e) => aggiorna(indice, f.name, e.target.value)}
                className={classeInput}
              />
            )}
            {f.hint && <span className="text-[14px] text-grey">{f.hint}</span>}
          </label>
        );
      })}
    </>
  );
}

/*
  Elenco ripetibile di gruppi di campi (voci di un accordion, contenuti di una
  griglia). L'intero elenco viaggia in un unico input hidden come JSON: così
  la Server Action non deve ricostruire nomi indicizzati tipo voci[0][titolo],
  che è la parte che di solito si rompe.

  Con `groupBy` gli elementi vengono raccolti per il valore di quel campo e
  mostrati dentro il riquadro a cui appartengono: il campo esiste ancora nei
  dati ma sparisce dal form, perché scrivere a mano la stessa sigla su più
  elementi è esattamente il modo in cui il legame diventa illeggibile.
*/
export function Repeater({
  name,
  label,
  itemLabel,
  fields,
  projectId,
  defaultItems,
  groupBy,
  groupLabel = "Riquadro",
  groupHint,
  groupFields,
}: {
  name: string;
  label: string;
  itemLabel: string;
  fields: FieldSpec[];
  projectId: string;
  defaultItems: Item[];
  groupBy?: string;
  groupLabel?: string;
  groupHint?: string;
  groupFields?: FieldSpec[];
}) {
  /*
    Chiave vuota = elemento per conto suo: gliene si assegna una all'ingresso,
    altrimenti nel form finirebbero tutti nello stesso riquadro mentre la
    pagina continua a mostrarli separati.
  */
  const [items, setItems] = useState<Item[]>(() => {
    if (!groupBy) return defaultItems;
    const usate = new Set(defaultItems.map((it) => it[groupBy]).filter(Boolean));
    let n = 0;
    return defaultItems.map((it) => {
      if (it[groupBy]) return it;
      while (usate.has(String(++n)));
      usate.add(String(n));
      return { ...it, [groupBy]: String(n) };
    });
  });

  /* Fuori dai singoli contenuti: la chiave del gruppo (la assegna groupBy) e i
     campi che descrivono il riquadro, che stanno nella sua intestazione. */
  const diGruppo = new Set([groupBy, ...(groupFields ?? []).map((f) => f.name)]);
  const visibili = groupBy
    ? fields.filter((f) => !diGruppo.has(f.name))
    : fields;

  const nuovo = (): Item =>
    Object.fromEntries(
      fields.map((f) => [
        f.name,
        f.type === "select" ? (f.options[0]?.value ?? "") : "",
      ]),
    );

  const aggiorna = (i: number, campo: string, valore: string) =>
    setItems((prev) =>
      prev.map((it, k) => (k === i ? { ...it, [campo]: valore } : it)),
    );

  const rimuovi = (i: number) =>
    setItems((prev) => prev.filter((_, k) => k !== i));

  /* Serve su elementi, gruppi e indici: la virgola dopo T è per non farlo
     leggere come JSX. */
  const scambia = <T,>(lista: T[], i: number, j: number) => {
    const out = [...lista];
    [out[i], out[j]] = [out[j], out[i]];
    return out;
  };

  const sposta = (i: number, delta: number) =>
    setItems((prev) =>
      i + delta < 0 || i + delta >= prev.length
        ? prev
        : scambia(prev, i, i + delta),
    );

  const intestazione = (
    testo: string,
    su: () => void,
    giu: () => void,
    primo: boolean,
    ultimo: boolean,
    elimina: () => void,
  ) => (
    <legend className="flex items-center gap-2 px-2 text-[15px] text-grey">
      {testo}
      <button
        type="button"
        onClick={su}
        disabled={primo}
        aria-label="Sposta prima"
        className={classeBottone}
      >
        ↑
      </button>
      <button
        type="button"
        onClick={giu}
        disabled={ultimo}
        aria-label="Sposta dopo"
        className={classeBottone}
      >
        ↓
      </button>
      <button type="button" onClick={elimina} className="underline">
        Rimuovi
      </button>
    </legend>
  );

  const hidden = (
    <input type="hidden" name={name} value={JSON.stringify(items)} />
  );

  /* ===== Senza raggruppamento: elenco piatto ===== */
  if (!groupBy) {
    return (
      <div className="flex flex-col gap-3">
        <span className="text-[16px] text-grey">{label}</span>
        {hidden}

        {items.map((item, i) => (
          <fieldset
            key={i}
            className="flex flex-col gap-3 border border-grey/40 p-4"
          >
            {intestazione(
              `${itemLabel} ${i + 1}`,
              () => sposta(i, -1),
              () => sposta(i, 1),
              i === 0,
              i === items.length - 1,
              () => rimuovi(i),
            )}
            <Campi
              fields={visibili}
              item={item}
              indice={i}
              nome={name}
              projectId={projectId}
              aggiorna={aggiorna}
            />
          </fieldset>
        ))}

        <button
          type="button"
          onClick={() => setItems((prev) => [...prev, nuovo()])}
          className="self-start border border-grey px-4 py-2 text-[16px]"
        >
          Aggiungi {itemLabel.toLowerCase()}
        </button>
      </div>
    );
  }

  /* ===== Raggruppato: un blocco per riquadro ===== */
  const gruppi: { chiave: string; indici: number[] }[] = [];
  items.forEach((it, i) => {
    const chiave = it[groupBy] ?? "";
    const g = gruppi.find((x) => x.chiave === chiave);
    if (g) g.indici.push(i);
    else gruppi.push({ chiave, indici: [i] });
  });

  // I gruppi si spostano in blocco: si riordinano e si riappiattisce l'elenco.
  const riappiattisci = (ordine: { indici: number[] }[]) =>
    ordine.flatMap((g) => g.indici.map((i) => items[i]));

  const spostaGruppo = (gi: number, delta: number) => {
    if (gi + delta < 0 || gi + delta >= gruppi.length) return;
    setItems(riappiattisci(scambia(gruppi, gi, gi + delta)));
  };

  const spostaNelGruppo = (gi: number, pos: number, delta: number) => {
    const g = gruppi[gi];
    if (pos + delta < 0 || pos + delta >= g.indici.length) return;
    const ordinati = gruppi.map((x, k) =>
      k === gi ? { ...x, indici: scambia(x.indici, pos, pos + delta) } : x,
    );
    setItems(riappiattisci(ordinati));
  };

  const chiaveLibera = () => {
    const usate = new Set(items.map((it) => it[groupBy]));
    let n = 1;
    while (usate.has(String(n))) n++;
    return String(n);
  };

  /*
    Un campo del riquadro si compila una volta ma nei dati sta su ogni
    contenuto: qui lo si scrive su tutti quelli del gruppo, così l'elenco
    resta piatto e chi legge lo trova sul primo.
  */
  const aggiornaGruppo = (chiave: string, campo: string, valore: string) =>
    setItems((prev) =>
      prev.map((it) =>
        it[groupBy] === chiave ? { ...it, [campo]: valore } : it,
      ),
    );

  const aggiungiAlGruppo = (gi: number) => {
    const g = gruppi[gi];
    const dopo = g.indici[g.indici.length - 1] + 1;
    // Il contenuto nuovo eredita i campi del riquadro: sono suoi anche loro.
    const daRiquadro = Object.fromEntries(
      (groupFields ?? []).map((f) => [f.name, items[g.indici[0]][f.name] ?? ""]),
    );
    setItems((prev) => [
      ...prev.slice(0, dopo),
      { ...nuovo(), ...daRiquadro, [groupBy]: g.chiave },
      ...prev.slice(dopo),
    ]);
  };

  return (
    <div className="flex flex-col gap-4">
      <span className="text-[16px] text-grey">{label}</span>
      {/* Una volta sola: ripeterlo sotto ogni riquadro è solo rumore. */}
      {groupHint && <p className="text-[14px] text-grey">{groupHint}</p>}
      {hidden}

      {gruppi.map((g, gi) => (
        <fieldset
          key={g.chiave}
          className="flex flex-col gap-3 border border-grey p-4"
        >
          {intestazione(
            `${groupLabel} ${gi + 1}`,
            () => spostaGruppo(gi, -1),
            () => spostaGruppo(gi, 1),
            gi === 0,
            gi === gruppi.length - 1,
            () =>
              setItems((prev) =>
                prev.filter((it) => it[groupBy] !== g.chiave),
              ),
          )}

          {/* Campi del riquadro: una volta sola, in cima, prima dei contenuti
              che si alternano. Nei social è il nome del canale, che resta
              fermo mentre numero e didascalia ruotano. */}
          {groupFields && groupFields.length > 0 && (
            <Campi
              fields={groupFields}
              item={items[g.indici[0]]}
              indice={g.indici[0]}
              nome={name}
              projectId={projectId}
              aggiorna={(_, campo, valore) =>
                aggiornaGruppo(g.chiave, campo, valore)
              }
            />
          )}

          {g.indici.map((i, pos) => (
            <fieldset
              key={i}
              className="flex flex-col gap-3 border border-grey/40 p-4"
            >
              {intestazione(
                g.indici.length > 1
                  ? `${itemLabel} ${pos + 1} di ${g.indici.length}`
                  : itemLabel,
                () => spostaNelGruppo(gi, pos, -1),
                () => spostaNelGruppo(gi, pos, 1),
                pos === 0,
                pos === g.indici.length - 1,
                () => rimuovi(i),
              )}
              <Campi
                fields={visibili}
                item={items[i]}
                indice={i}
                nome={name}
                projectId={projectId}
                aggiorna={aggiorna}
              />
            </fieldset>
          ))}

          <button
            type="button"
            onClick={() => aggiungiAlGruppo(gi)}
            className="self-start border border-grey/40 px-3 py-1 text-[15px]"
          >
            Aggiungi {itemLabel.toLowerCase()} a questo{" "}
            {groupLabel.toLowerCase()}
          </button>
        </fieldset>
      ))}

      <button
        type="button"
        onClick={() =>
          setItems((prev) => [
            ...prev,
            { ...nuovo(), [groupBy]: chiaveLibera() },
          ])
        }
        className="self-start border border-grey px-4 py-2 text-[16px]"
      >
        Aggiungi {groupLabel.toLowerCase()}
      </button>
    </div>
  );
}
