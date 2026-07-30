"use client";

import { useState } from "react";
import type { FieldSpec } from "@/lib/sections/schema";
import { RichText } from "./RichText";
import { FileUpload } from "./FileUpload";

type Item = Record<string, string>;

/*
  Elenco ripetibile di gruppi di campi (voci di un accordion, box di una
  griglia). L'intero elenco viaggia in un unico input hidden come JSON: così
  la Server Action non deve ricostruire nomi indicizzati tipo voci[0][titolo],
  che è la parte che di solito si rompe.

  I campi interni non usano `name`, altrimenti finirebbero anche loro nel
  FormData duplicando i dati.
*/
export function Repeater({
  name,
  label,
  itemLabel,
  fields,
  projectId,
  defaultItems,
}: {
  name: string;
  label: string;
  itemLabel: string;
  fields: FieldSpec[];
  projectId: string;
  defaultItems: Item[];
}) {
  const [items, setItems] = useState<Item[]>(defaultItems);

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

  const sposta = (i: number, delta: number) =>
    setItems((prev) => {
      const j = i + delta;
      if (j < 0 || j >= prev.length) return prev;
      const out = [...prev];
      [out[i], out[j]] = [out[j], out[i]];
      return out;
    });

  const classeInput =
    "border border-grey bg-transparent px-4 py-2 text-[18px] outline-none focus:border-foreground";

  return (
    <div className="flex flex-col gap-3">
      <span className="text-[16px] text-grey">{label}</span>
      <input type="hidden" name={name} value={JSON.stringify(items)} />

      {items.map((item, i) => (
        <fieldset
          key={i}
          className="flex flex-col gap-3 border border-grey/40 p-4"
        >
          <legend className="flex items-center gap-2 px-2 text-[15px] text-grey">
            {itemLabel} {i + 1}
            <button
              type="button"
              onClick={() => sposta(i, -1)}
              disabled={i === 0}
              aria-label="Sposta prima"
              className="hoverable border border-grey px-2 disabled:opacity-30"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => sposta(i, 1)}
              disabled={i === items.length - 1}
              aria-label="Sposta dopo"
              className="hoverable border border-grey px-2 disabled:opacity-30"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() =>
                setItems((prev) => prev.filter((_, k) => k !== i))
              }
              className="hoverable underline"
            >
              Rimuovi
            </button>
          </legend>

          {fields.map((f) => {
            if (f.type === "richtext") {
              return (
                <RichText
                  key={f.name}
                  /* niente name: il valore viaggia nel JSON del repeater */
                  name={`__${name}_${i}_${f.name}`}
                  defaultValue={item[f.name]}
                  label={f.label}
                  hint={f.hint}
                  onChange={(html) => aggiorna(i, f.name, html)}
                />
              );
            }

            if (f.type === "image") {
              return (
                <FileUpload
                  key={f.name}
                  name={`__${name}_${i}_${f.name}`}
                  projectId={projectId}
                  defaultPath={item[f.name]}
                  label={f.label}
                  onChange={(path) => aggiorna(i, f.name, path)}
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
                    onChange={(e) => aggiorna(i, f.name, e.target.value)}
                    className={classeInput}
                  />
                ) : f.type === "select" ? (
                  <select
                    value={item[f.name] ?? ""}
                    onChange={(e) => aggiorna(i, f.name, e.target.value)}
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
                    onChange={(e) => aggiorna(i, f.name, e.target.value)}
                    className={classeInput}
                  />
                )}
                {f.hint && (
                  <span className="text-[14px] text-grey2">{f.hint}</span>
                )}
              </label>
            );
          })}
        </fieldset>
      ))}

      <button
        type="button"
        onClick={() => setItems((prev) => [...prev, nuovo()])}
        className="hoverable self-start border border-grey px-4 py-2 text-[16px]"
      >
        Aggiungi {itemLabel.toLowerCase()}
      </button>
    </div>
  );
}
