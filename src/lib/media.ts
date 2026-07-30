import { createClient } from "@/lib/supabase/server";

export const BUCKET = "portfolio-media";
const SCADENZA = 60 * 60; // 1 ora

/*
  Il bucket è privato e deve restarlo: le immagini del portfolio riservato non
  devono essere raggiungibili con un URL indovinato. Quindi ogni path va
  convertito in un URL firmato a scadenza breve, lato server, al momento del
  render.
*/
export async function signedUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const supabase = await createClient();
  const { data } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SCADENZA);
  return data?.signedUrl ?? null;
}

/* Versione in blocco: una sola andata per N immagini (es. una galleria). */
export async function signedUrls(
  paths: (string | null | undefined)[],
): Promise<(string | null)[]> {
  const validi = paths.filter((p): p is string => !!p);
  if (validi.length === 0) return paths.map(() => null);

  const supabase = await createClient();
  const { data } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(validi, SCADENZA);

  const mappa = new Map(
    (data ?? []).map((d) => [d.path, d.signedUrl as string | null]),
  );
  return paths.map((p) => (p ? mappa.get(p) ?? null : null));
}
