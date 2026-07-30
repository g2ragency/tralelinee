"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/*
  Caricamento diretto dal browser al bucket privato.

  Non passa da una Server Action di proposito: il limite di body delle funzioni
  serverless su Vercel (~4.5MB) taglierebbe fuori immagini e video di peso
  normale. Il permesso di scrittura è concesso dalla policy storage sul solo
  super admin, quindi la sessione basta e non serve alcuna chiave privilegiata.

  Il path finisce in un input hidden: il salvataggio avviene col submit del
  form della sezione.
*/
export function FileUpload({
  name,
  projectId,
  defaultPath,
  accept = "image/*",
  label,
}: {
  name: string;
  projectId: string;
  defaultPath?: string;
  accept?: string;
  label: string;
}) {
  const [path, setPath] = useState(defaultPath ?? "");
  const [stato, setStato] = useState<"idle" | "carico" | "errore">("idle");

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const supabase = createClient();
    if (!supabase) {
      setStato("errore");
      return;
    }

    setStato("carico");
    // Nome prevedibile ma non collidente; niente caratteri problematici.
    const pulito = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
    const destinazione = `progetti/${projectId}/${Date.now()}-${pulito}`;

    const { error } = await supabase.storage
      .from("portfolio-media")
      .upload(destinazione, file, { upsert: false });

    if (error) {
      setStato("errore");
      return;
    }
    setPath(destinazione);
    setStato("idle");
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[16px] text-grey">{label}</span>
      <input type="hidden" name={name} value={path} />

      <div className="flex flex-wrap items-center gap-3">
        <label className="hoverable cursor-pointer border border-grey px-4 py-2 text-[16px]">
          {path ? "Sostituisci" : "Scegli file"}
          <input
            type="file"
            accept={accept}
            onChange={onPick}
            className="hidden"
          />
        </label>

        {stato === "carico" && (
          <span className="text-[16px] text-grey">Caricamento…</span>
        )}
        {stato === "errore" && (
          <span role="alert" className="text-[16px] text-grey2">
            Caricamento non riuscito. Riprova.
          </span>
        )}
        {path && stato === "idle" && (
          <>
            <span className="max-w-[320px] truncate text-[16px] text-grey2">
              {path.split("/").pop()}
            </span>
            <button
              type="button"
              onClick={() => setPath("")}
              className="hoverable text-[16px] text-grey underline"
            >
              Rimuovi
            </button>
          </>
        )}
      </div>
    </div>
  );
}
