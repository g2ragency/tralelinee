"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/*
  Caricamento di più immagini (carosello, gallerie).

  L'elenco dei path viaggia in un unico input hidden come JSON, così la Server
  Action lo riceve come stringa e lo salva nel jsonb senza campi numerati.
  Riordino con le frecce: l'ordine è quello di visualizzazione.
*/
export function MultiFileUpload({
  name,
  projectId,
  defaultPaths,
  label,
  hint,
}: {
  name: string;
  projectId: string;
  defaultPaths?: string[];
  label: string;
  hint?: string;
}) {
  const [paths, setPaths] = useState<string[]>(defaultPaths ?? []);
  const [stato, setStato] = useState<"idle" | "carico" | "errore">("idle");

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const supabase = createClient();
    if (!supabase) {
      setStato("errore");
      return;
    }

    setStato("carico");
    const nuovi: string[] = [];
    for (const file of files) {
      const pulito = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
      const destinazione = `progetti/${projectId}/${Date.now()}-${pulito}`;
      const { error } = await supabase.storage
        .from("portfolio-media")
        .upload(destinazione, file, { upsert: false });
      if (error) {
        setStato("errore");
        return;
      }
      nuovi.push(destinazione);
    }
    setPaths((p) => [...p, ...nuovi]);
    setStato("idle");
    e.target.value = "";
  }

  const sposta = (i: number, delta: number) =>
    setPaths((p) => {
      const j = i + delta;
      if (j < 0 || j >= p.length) return p;
      const out = [...p];
      [out[i], out[j]] = [out[j], out[i]];
      return out;
    });

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[16px] text-grey">{label}</span>
      <input type="hidden" name={name} value={JSON.stringify(paths)} />

      <div className="flex flex-wrap items-center gap-3">
        <label className="hoverable cursor-pointer border border-grey px-4 py-2 text-[16px]">
          Aggiungi immagini
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onPick}
            className="hidden"
          />
        </label>
        {stato === "carico" && (
          <span className="text-[16px] text-grey">Caricamento…</span>
        )}
        {stato === "errore" && (
          <span role="alert" className="text-[16px] text-grey">
            Caricamento non riuscito. Riprova.
          </span>
        )}
        <span className="text-[16px] text-grey">
          {paths.length} {paths.length === 1 ? "immagine" : "immagini"}
        </span>
      </div>

      {hint && <span className="text-[14px] text-grey">{hint}</span>}

      {paths.length > 0 && (
        <ol className="mt-2 flex flex-col gap-1">
          {paths.map((p, i) => (
            <li
              key={p}
              className="flex items-center justify-between gap-3 border border-grey/40 px-3 py-2"
            >
              <span className="truncate text-[15px] text-grey">
                {i + 1}. {p.split("/").pop()}
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => sposta(i, -1)}
                  disabled={i === 0}
                  aria-label="Sposta prima"
                  className="hoverable border border-grey px-2 text-[15px] text-grey disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => sposta(i, 1)}
                  disabled={i === paths.length - 1}
                  aria-label="Sposta dopo"
                  className="hoverable border border-grey px-2 text-[15px] text-grey disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPaths((all) => all.filter((_, k) => k !== i))
                  }
                  className="hoverable text-[15px] text-grey underline"
                >
                  Rimuovi
                </button>
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
