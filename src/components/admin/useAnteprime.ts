"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/*
  URL firmati per mostrare le miniature dei file caricati nell'admin: prima si
  vedeva solo il nome del file («1763456789-img-4021.jpg») e capire quale
  immagine spostare o togliere era un tiro a indovinare.

  Una richiesta per tutto l'elenco, rifatta solo quando l'elenco cambia. Se
  la firma non riesce resta il nome del file, come prima.
*/
export function useAnteprime(paths: string[]) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const chiave = paths.join("|");

  useEffect(() => {
    const mancanti = chiave ? chiave.split("|").filter(Boolean) : [];
    if (mancanti.length === 0) return;
    const supabase = createClient();
    if (!supabase) return;
    let attivo = true;
    supabase.storage
      .from("portfolio-media")
      .createSignedUrls(mancanti, 60 * 60)
      .then(({ data }) => {
        if (!attivo || !data) return;
        setUrls((prima) => {
          const dopo = { ...prima };
          for (const r of data) if (r.path && r.signedUrl) dopo[r.path] = r.signedUrl;
          return dopo;
        });
      });
    return () => {
      attivo = false;
    };
  }, [chiave]);

  return urls;
}

export const eVideo = (path: string) => /\.(mp4|webm|mov|m4v)$/i.test(path);
