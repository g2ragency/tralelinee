"use client";

import type { SupabaseClient } from "@supabase/supabase-js";

/*
  Caricamento di un file nel bucket, dal browser.

  Le foto escono di qui in due misure, «nome.w2720h1958.webp» e la metà
  «nome.w1360h979.webp»: la pagina pubblica le offre al browser con srcSet
  (vedi `variante` in lib/media.ts, che ricava il nome della piccola da
  quello della grande: i due arrotondamenti devono restare uguali).
  Senza, una foto da fotocamera (6000px, 8MB) arrivava intera a tutti e lo
  scorrimento scattava a ogni immagine. 2720 = 1360px di pagina × 2, gli
  schermi ad alta densità.

  Restano come sono: video, GIF (l'animazione andrebbe persa), SVG, e
  qualunque cosa il browser non sappia aprire.
*/
const MASSIMA = 2720;

async function codifica(
  bitmap: ImageBitmap,
  w: number,
  h: number,
): Promise<{ blob: Blob; ext: string }> {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
  const blob = await new Promise<Blob | null>((ok) =>
    canvas.toBlob(ok, "image/webp", 0.82),
  );
  // Safari non sa scrivere WebP e restituisce un PNG: meglio un JPEG.
  if (blob?.type === "image/webp") return { blob, ext: "webp" };
  const jpeg = await new Promise<Blob | null>((ok) =>
    canvas.toBlob(ok, "image/jpeg", 0.85),
  );
  if (!jpeg) throw new Error("codifica non riuscita");
  return { blob: jpeg, ext: "jpg" };
}

export async function caricaFile(
  supabase: SupabaseClient,
  projectId: string,
  file: File,
): Promise<string | null> {
  const base = `progetti/${projectId}/${Date.now()}-${file.name
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
  const bucket = supabase.storage.from("portfolio-media");

  const riducibile =
    file.type.startsWith("image/") &&
    !/gif|svg/.test(file.type);
  if (riducibile) {
    try {
      const bitmap = await createImageBitmap(file);
      const w = Math.min(bitmap.width, MASSIMA);
      const h = Math.round((bitmap.height * w) / bitmap.width);
      const [mw, mh] = [Math.round(w / 2), Math.round(h / 2)];
      const grande = await codifica(bitmap, w, h);
      const piccola = await codifica(bitmap, mw, mh);
      bitmap.close();
      const path = `${base}.w${w}h${h}.${grande.ext}`;
      const r1 = await bucket.upload(path, grande.blob, {
        contentType: grande.blob.type,
        cacheControl: "31536000",
      });
      if (r1.error) return null;
      // Se la piccola non passa la pagina usa la grande: non è un errore.
      await bucket.upload(`${base}.w${mw}h${mh}.${piccola.ext}`, piccola.blob, {
        contentType: piccola.blob.type,
        cacheControl: "31536000",
      });
      return path;
    } catch {
      // formato che il browser non sa aprire (es. HEIC): si carica com'è
    }
  }

  const ext = file.name.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] ?? "";
  const path = base + ext;
  const { error } = await bucket.upload(path, file, { upsert: false });
  return error ? null : path;
}
