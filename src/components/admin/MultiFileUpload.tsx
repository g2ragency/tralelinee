"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAnteprime } from "./useAnteprime";
import { caricaFile } from "./carica";

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
  const anteprime = useAnteprime(paths);

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
      const destinazione = await caricaFile(supabase, projectId, file);
      if (!destinazione) break;
      nuovi.push(destinazione);
    }
    // Quelle già caricate restano anche se una successiva non è riuscita:
    // prima si perdevano tutte, pur essendo già nel bucket.
    setPaths((p) => [...p, ...nuovi]);
    setStato(nuovi.length === files.length ? "idle" : "errore");
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
        <label className="cursor-pointer border border-grey px-4 py-2 text-[16px]">
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
            Caricamento non riuscito per una o più immagini. Riprova con
            quelle mancanti.
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
              <span className="flex min-w-0 items-center gap-3">
                <span className="w-6 shrink-0 text-right text-[15px] text-grey">
                  {i + 1}.
                </span>
                {anteprime[p] ? (
                  /* eslint-disable-next-line @next/next/no-img-element --
                     URL firmato a scadenza, solo per l'anteprima. */
                  <img
                    src={anteprime[p]}
                    alt=""
                    className="h-14 w-20 shrink-0 bg-box object-cover"
                  />
                ) : (
                  <span className="h-14 w-20 shrink-0 bg-box" aria-hidden />
                )}
                <span className="truncate text-[15px] text-grey">
                  {p.split("/").pop()}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => sposta(i, -1)}
                  disabled={i === 0}
                  aria-label="Sposta prima"
                  className="border border-grey px-2 text-[15px] text-grey disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => sposta(i, 1)}
                  disabled={i === paths.length - 1}
                  aria-label="Sposta dopo"
                  className="border border-grey px-2 text-[15px] text-grey disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPaths((all) => all.filter((_, k) => k !== i))
                  }
                  className="text-[15px] text-grey underline"
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
