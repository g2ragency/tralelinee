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

/*
  Due misure per immagine.

  Un file chiamato «foto.w2720h1958.webp» ha accanto «foto.w1360h979.webp»,
  larga la metà: la crea l'admin al caricamento. Le foto a 2720px servono
  solo agli schermi ad alta densità; su un monitor normale e sui telefoni il
  browser le decodificava comunque intere, ~90ms ciascuna, e lo scorrimento
  scattava a ogni foto che entrava (misurato con le tracce di Chrome, 18/11).
  Con `srcSet` il browser sceglie da sé: un quarto dei pixel dove bastano.

  Le misure stanno nel nome del file: la pagina sa se la variante c'è senza
  chiederlo all'archivio, e dà al riquadro la proporzione giusta prima che
  l'immagine arrivi (altrimenti la pagina si allunga mentre si scorre). I
  file caricati prima, senza «.wNNNNhNNNN», restano com'erano.
*/
const MISURA = /\.w(\d+)h(\d+)\.(webp|jpe?g|png)$/i;

export function variante(path: string) {
  const m = path.match(MISURA);
  if (!m) return null;
  const [w, h] = [Number(m[1]), Number(m[2])];
  const mezza = Math.round(w / 2);
  const piccola = `.w${mezza}h${Math.round(h / 2)}.${m[3]}`;
  return { w, h, mezza, path: path.replace(MISURA, piccola) };
}

export type Firmata = {
  src: string;
  srcSet?: string;
  w?: number;
  h?: number;
  /* Un video al posto della foto: si mostra con l'anteprima e parte da solo. */
  video?: boolean;
  poster?: string;
};

export const eVideo = (path: string) => /\.(mp4|webm|mov|m4v)$/i.test(path);

/*
  Un video «nome.w1920h1382.mp4» ha accanto l'anteprima
  «nome.w1920h1382.poster.webp» (il primo fotogramma): stessa convenzione
  delle foto, così la cella ha le proporzioni giuste prima che arrivi.
*/
function datiVideo(path: string) {
  const m = path.match(/\.w(\d+)h(\d+)\.[a-z0-9]+$/i);
  return {
    w: m ? Number(m[1]) : undefined,
    h: m ? Number(m[2]) : undefined,
    poster: path.replace(/\.[a-z0-9]+$/i, ".poster.webp"),
  };
}

/* Come `signedUrls`, ma con il `srcSet` quando la variante c'è. */
export async function immaginiFirmate(
  paths: (string | null | undefined)[],
): Promise<(Firmata | null)[]> {
  const extra = paths.map((p) =>
    !p ? undefined : eVideo(p) ? datiVideo(p).poster : variante(p)?.path,
  );
  const firme = await signedUrls([...paths, ...extra]);
  return paths.map((p, i) => {
    const src = firme[i];
    if (!src || !p) return null;
    const accanto = firme[paths.length + i] ?? undefined;
    if (eVideo(p)) {
      const d = datiVideo(p);
      return { src, video: true, w: d.w, h: d.h, poster: accanto };
    }
    const v = variante(p);
    return {
      src,
      w: v?.w,
      h: v?.h,
      srcSet: v && accanto ? `${accanto} ${v.mezza}w, ${src} ${v.w}w` : undefined,
    };
  });
}

/* Larghezze di riferimento per `sizes`: margini di 10px da mobile, 40 da desktop. */
export const MISURE = {
  piena: "(min-width: 1280px) calc(100vw - 80px), calc(100vw - 20px)",
  mezza: "(min-width: 1280px) calc(50vw - 50px), calc(50vw - 20px)",
  scheda: "(min-width: 1280px) calc(50vw - 50px), calc(100vw - 20px)",
};

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
