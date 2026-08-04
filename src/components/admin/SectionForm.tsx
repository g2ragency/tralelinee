"use client";

import { useState } from "react";
import { getSchema, type FieldSpec } from "@/lib/sections/schema";
import { updateSection } from "@/app/admin/progetti/actions";
import { FileUpload } from "./FileUpload";
import { MultiFileUpload } from "./MultiFileUpload";
import { RichText } from "./RichText";
import { Repeater } from "./Repeater";

/*
  Form generico di una sezione: si costruisce dai `fields` dello schema, così
  aggiungere un tipo non richiede di scrivere un form.
  Lo stato locale serve solo per `showIf`, cioè per i campi che dipendono dal
  valore di un altro (es. immagine vs video).
*/
export function SectionForm({
  id,
  projectId,
  kind,
  content,
}: {
  id: string;
  projectId: string;
  kind: string;
  content: Record<string, unknown>;
}) {
  const schema = getSchema(kind);
  const [valori, setValori] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of schema?.fields ?? []) {
      const v = content[f.name];
      const salvato =
        typeof v === "string" || typeof v === "number" ? String(v) : "";
      /*
        I select partono dalla prima opzione, non da stringa vuota: altrimenti
        su una sezione nuova il menu mostrerebbe la prima voce mentre lo stato
        resta vuoto, e i campi con showIf legati a quel valore non compaiono
        (era il caso del caricatore immagine nel blocco Media).
      */
      init[f.name] =
        salvato || (f.type === "select" ? (f.options[0]?.value ?? "") : "");
    }
    return init;
  });

  if (!schema) {
    return (
      <p className="text-[16px] text-grey">
        Tipo «{kind}» non presente nello schema: la sezione resta in archivio ma
        non è modificabile.
      </p>
    );
  }

  const visibile = (f: FieldSpec) =>
    !f.showIf || valori[f.showIf.field] === f.showIf.equals;

  const set = (name: string, value: string) =>
    setValori((v) => ({ ...v, [name]: value }));

  const classeInput =
    "border border-grey bg-transparent px-4 py-2 text-[18px] outline-none focus:border-foreground";

  return (
    <form action={updateSection} className="mt-4 flex flex-col gap-4">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="project_id" value={projectId} />
      <input type="hidden" name="kind" value={kind} />

      {schema.fields.filter(visibile).map((f) => {
        if (f.type === "repeater") {
          const iniziali = Array.isArray(content[f.name])
            ? (content[f.name] as unknown[])
                .filter((v): v is Record<string, unknown> => !!v && typeof v === "object")
                .map((v) =>
                  Object.fromEntries(
                    Object.entries(v).map(([k, val]) => [
                      k,
                      typeof val === "string" ? val : String(val ?? ""),
                    ]),
                  ),
                )
            : [];
          return (
            <Repeater
              key={f.name}
              name={f.name}
              label={f.label}
              itemLabel={f.itemLabel}
              fields={f.fields}
              projectId={projectId}
              defaultItems={iniziali}
              groupBy={f.groupBy}
              groupLabel={f.groupLabel}
              groupHint={f.groupHint}
            />
          );
        }

        if (f.type === "richtext") {
          return (
            <RichText
              key={f.name}
              name={f.name}
              defaultValue={valori[f.name]}
              label={f.label}
              hint={f.hint}
            />
          );
        }

        if (f.type === "images") {
          const iniziali = Array.isArray(content[f.name])
            ? (content[f.name] as unknown[]).filter(
                (v): v is string => typeof v === "string",
              )
            : [];
          return (
            <MultiFileUpload
              key={f.name}
              name={f.name}
              projectId={projectId}
              defaultPaths={iniziali}
              label={f.label}
              hint={f.hint}
            />
          );
        }

        if (f.type === "image" || f.type === "video") {
          return (
            <FileUpload
              key={f.name}
              name={f.name}
              projectId={projectId}
              defaultPath={valori[f.name]}
              accept={f.type === "video" ? "video/*" : "image/*"}
              label={f.label}
            />
          );
        }

        return (
          <label key={f.name} className="flex flex-col gap-2">
            <span className="text-[16px] text-grey">{f.label}</span>

            {f.type === "select" ? (
              <select
                name={f.name}
                value={valori[f.name]}
                onChange={(e) => set(f.name, e.target.value)}
                className="border border-grey bg-background px-4 py-2 text-[18px]"
              >
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : f.type === "textarea" ? (
              <textarea
                name={f.name}
                rows={4}
                required={f.required}
                value={valori[f.name]}
                onChange={(e) => set(f.name, e.target.value)}
                className={classeInput}
              />
            ) : (
              <input
                type={f.type === "url" ? "url" : f.type === "number" ? "number" : "text"}
                name={f.name}
                required={f.required}
                value={valori[f.name]}
                onChange={(e) => set(f.name, e.target.value)}
                className={classeInput}
              />
            )}

            {f.hint && <span className="text-[14px] text-grey">{f.hint}</span>}
          </label>
        );
      })}

      <button
        type="submit"
        className="self-start border border-foreground px-5 py-2 text-[16px]"
      >
        Salva sezione
      </button>
    </form>
  );
}
