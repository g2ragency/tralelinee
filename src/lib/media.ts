import { unstable_cache } from "next/cache";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isApproved } from "@/lib/auth";

export const BUCKET = "portfolio-media";
const SCADENZA = 60 * 60; // 1 ora

/*
  Il bucket è privato e deve restarlo: le immagini del portfolio riservato non
  devono essere raggiungibili con un URL indovinato. Quindi ogni path va
  convertito in un URL firmato a scadenza breve, lato server, al momento del
  render.
*/
export async function signedUrl(path: string | null): Promise<string | null> {
  return (await signedUrls([path]))[0];
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

/*
  Firme riusate per un'ora.

  Una firma nuova a ogni apertura di pagina dava indirizzi sempre diversi, e
  per il browser un indirizzo diverso è un file diverso: tornando su Samsara
  riscaricava tutti i suoi 34 file, 6,1MB, senza usare la cache (misurato il
  18/11). Qui la firma di un gruppo di file si fa una volta per ora e si
  riusa per tutti; vale 2 ore, quindi chi la riceve alla fine dell'ora ne ha
  ancora una. Supabase risponde con `Expires` uguale alla scadenza della
  firma: il browser tiene il file senza chiedere finché la firma vale.

  L'ora sta nella CHIAVE della cache e non nel `revalidate`: scaduto il
  revalidate, Next servirebbe ancora una volta il valore vecchio mentre lo
  rinnova, cioè un indirizzo che potrebbe essere già scaduto.

  Riusare la firma fra utenti diversi richiede la chiave di servizio (dentro
  la cache non ci sono i cookie di chi visita). Per questo il controllo
  «utente approvato» sta qui sotto, prima della cache: il database non lo fa
  più al momento della firma, ma nessun indirizzo esce per chi non è
  approvato anche se una pagina se ne dimenticasse. I percorsi arrivano da
  righe che l'utente ha potuto leggere, cioè già filtrate dalle RLS.
*/
const VALIDITÀ_FIRMA = 2 * 60 * 60;
const UN_ORA = 60 * 60 * 1000;

const firmeDellOra = unstable_cache(
  async (paths: string[], ora: number): Promise<(string | null)[]> => {
    void ora; // serve solo come chiave: cambia ogni ora, e con lei la firma
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const chiave = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !chiave) return paths.map(() => null);
    const servizio = createServiceClient(url, chiave, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await servizio.storage
      .from(BUCKET)
      .createSignedUrls(paths, VALIDITÀ_FIRMA);
    const mappa = new Map((data ?? []).map((d) => [d.path, d.signedUrl]));
    return paths.map((p) => mappa.get(p) ?? null);
  },
  ["firme-portfolio-v1"],
  { revalidate: 2 * 60 * 60 },
);

/* Versione in blocco: una sola andata per N immagini (es. una galleria). */
export async function signedUrls(
  paths: (string | null | undefined)[],
): Promise<(string | null)[]> {
  const validi = [...new Set(paths.filter((p): p is string => !!p))].sort();
  if (validi.length === 0) return paths.map(() => null);
  if (!(await isApproved())) return paths.map(() => null);

  let firme: (string | null)[];
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    firme = await firmeDellOra(validi, Math.floor(Date.now() / UN_ORA));
  } else {
    // Senza chiave di servizio (es. un ambiente nuovo): firma con la sessione
    // di chi visita, come prima. Funziona, solo senza cache.
    const supabase = await createClient();
    const { data } = await supabase.storage
      .from(BUCKET)
      .createSignedUrls(validi, SCADENZA);
    const m = new Map((data ?? []).map((d) => [d.path, d.signedUrl]));
    firme = validi.map((p) => m.get(p) ?? null);
  }
  const mappa = new Map(validi.map((p, i) => [p, firme[i]]));
  return paths.map((p) => (p ? (mappa.get(p) ?? null) : null));
}
