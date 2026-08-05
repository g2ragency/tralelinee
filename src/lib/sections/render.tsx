import type { ReactNode } from "react";
import { signedUrl, signedUrls } from "@/lib/media";
import { VociLaterali } from "@/components/sections/VociLaterali";
import { Carosello } from "@/components/sections/Carosello";
import { FilaBox } from "@/components/sections/GrigliaNumeri";
import { Loghi } from "@/components/sections/Loghi";
import { raggruppa } from "./griglia";
import type { SectionContent } from "./schema";

/*
  Alcuni blocchi mostrano dati del progetto e non solo il proprio contenuto
  (es. Intro legge industry e servizi), quindi il renderer li riceve entrambi.
*/
export type ProjectInfo = {
  title: string;
  client: string | null;
  year: string | null;
  industry: string | null;
  services: string | null;
  summary: string | null;
};

/*
  Renderer dei tipi di sezione. Sono Server Component asincroni: leggono dal
  bucket privato per firmare gli URL, quindi non possono stare in `schema.ts`,
  che è importato anche dal form client.

  Aggiungere un tipo = una voce qui + una voce in schema.ts.
*/
export type SectionRenderer = (props: {
  content: SectionContent;
  project: ProjectInfo;
}) => ReactNode | Promise<ReactNode>;

const s = (v: unknown) => (typeof v === "string" ? v : "");

/* Converte un link YouTube/Vimeo nella sua forma incorporabile. */
function embedUrl(raw: string): string | null {
  const url = raw.trim();
  if (!url) return null;
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/,
  );
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

/*
  Media — immagine o video a piena larghezza.
  Figma: 1360×765 su base 1440 (16:9), angoli 30px.
*/
async function MediaRender({ content }: { content: SectionContent }) {
  const tipo = s(content.tipo) || "immagine";
  const alt = s(content.alt);
  const cornice =
    /* Nero2 quando non c'è ancora un'immagine, come i riquadri del carosello */
    "relative w-full overflow-hidden rounded-[30px] bg-box aspect-video";

  if (tipo === "video_embed") {
    const src = embedUrl(s(content.embed));
    if (!src) return null;
    return (
      <figure className={cornice}>
        <iframe
          src={src}
          title={alt || "Video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </figure>
    );
  }

  if (tipo === "video_file") {
    const [src, poster] = await Promise.all([
      signedUrl(s(content.video) || null),
      signedUrl(s(content.poster) || null),
    ]);
    if (!src) return null;
    return (
      <figure className={cornice}>
        <video
          src={src}
          poster={poster ?? undefined}
          controls
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </figure>
    );
  }

  const src = await signedUrl(s(content.immagine) || null);
  if (!src) return <figure className={cornice} aria-hidden />;
  return (
    <figure className={cornice}>
      {/* eslint-disable-next-line @next/next/no-img-element --
          URL firmato a scadenza: next/image lo metterebbe in cache oltre la
          validità, restituendo immagini rotte. */}
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </figure>
  );
}

/*
  Formati del blocco immagini. Le proporzioni sono quelle del Figma su base
  1440: larghezza utile 1360 e 20px di gap, quindi gli affiancati sono 670.

  Le classi stanno scritte per intero perché Tailwind legge il sorgente: una
  costruita a pezzi (`aspect-[${x}]`) non finirebbe mai nel CSS.
*/
const FORMATI: Record<string, { doppio: boolean; aspetto: string }> = {
  "16-9": { doppio: false, aspetto: "aspect-video" },
  fascia: { doppio: false, aspetto: "aspect-[1360/300]" },
  quadrate: { doppio: true, aspetto: "aspect-square" },
  verticali: { doppio: true, aspetto: "aspect-[670/820]" },
};

/*
  Immagini — un formato per blocco, tante immagini quante se ne caricano.

  Il formato decide proporzione e numero di colonne, non quante immagini
  accettare: due formati «affiancati» con quattro immagini danno due righe,
  senza bisogno di un tipo di sezione per ogni combinazione.
*/
async function ImmaginiRender({ content }: { content: SectionContent }) {
  const f = FORMATI[s(content.formato)] ?? FORMATI["16-9"];
  const paths = Array.isArray(content.immagini)
    ? (content.immagini as unknown[]).filter(
        (p): p is string => typeof p === "string",
      )
    : [];
  const urls = (await signedUrls(paths)).filter((u): u is string => !!u);

  // Senza immagini restano i riquadri vuoti, come nel blocco Media: si vede
  // il formato scelto mentre si monta la pagina.
  const celle: (string | null)[] = urls.length
    ? urls
    : Array(f.doppio ? 2 : 1).fill(null);

  return (
    <section
      className={`grid gap-[10px] xl:gap-[20px] ${f.doppio ? "grid-cols-2" : ""}`}
    >
      {celle.map((url, i) => (
        <div
          key={i}
          className={`w-full overflow-hidden rounded-[30px] bg-box ${f.aspetto}`}
        >
          {url && (
            /* eslint-disable-next-line @next/next/no-img-element --
               URL firmato a scadenza: next/image lo terrebbe in cache oltre
               la validità. */
            <img src={url} alt="" className="h-full w-full object-cover" />
          )}
        </div>
      ))}
    </section>
  );
}

/*
  Intro — due colonne: scheda dati (dal progetto) e paragrafo.
  Figma: etichette e valori 18px Medium, paragrafo 30px Regular,
  entrambi interlinea 120% e spaziatura -4%.
*/
function IntroRender({
  content,
  project,
}: {
  content: SectionContent;
  project: ProjectInfo;
}) {
  const paragrafi = s(content.testo)
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const voci = [
    { label: "Industry", value: project.industry },
    { label: "Servizi", value: project.services },
  ].filter((v) => v.value);

  return (
    /* Figma: colonna dati 288px, paragrafo allineato al bordo destro */
    <section className="grid gap-10 xl:grid-cols-[288px_1fr] xl:gap-0">
      <dl className="text-[18px] font-medium leading-[1.2] tracking-[-0.72px]">
        {voci.map((v) => (
          <div key={v.label} className="mb-6">
            <dt className="text-grey">{v.label}</dt>
            <dd>{v.value}</dd>
          </div>
        ))}
      </dl>

      {/* Senza stacco i paragrafi si leggevano come uno solo: il ritorno a
          capo da solo non basta a farli vedere separati. */}
      <div className="xl:ml-auto xl:max-w-[693px] [&_p]:mt-[1.2em] [&_p:first-child]:mt-0">
        {paragrafi.map((p, i) => (
          <p
            key={i}
            className="text-[20px] leading-[1.2] tracking-[-0.8px] xl:text-[30px] xl:tracking-[-1.2px]"
          >
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}

/*
  Carosello — scorrimento orizzontale con agganci.

  Le card conservano la proporzione del Figma (596×760) e la larghezza cresce
  col viewport fino a un tetto: a 1440 ne restano 2,2 in vista come da design,
  su schermi molto grandi se ne vedono di più invece di gonfiarle a dismisura.
*/
async function CaroselloRender({ content }: { content: SectionContent }) {
  const paths = Array.isArray(content.immagini)
    ? (content.immagini as unknown[]).filter(
        (p): p is string => typeof p === "string",
      )
    : [];
  if (paths.length === 0) return null;

  // Gli URL si firmano qui (server); scorrimento e trascinamento sono client.
  const urls = (await signedUrls(paths)).filter((u): u is string => !!u);
  if (urls.length === 0) return null;
  return <Carosello urls={urls} />;
}

/* Griglia numeri — riquadri con i numeri e testo di raccordo sotto. */
function GrigliaRender({ content }: { content: SectionContent }) {
  const sopra = raggruppa(content.sopra);
  const testo = s(content.testo);
  if (sopra.length === 0 && !testo) return null;

  return (
    /* Figma: 14px fra righe e colonne, riquadri #1B1B1B raggio 20px */
    <section className="flex flex-col gap-[14px]">
      <FilaBox boxes={sopra} variante="sopra" />
      {testo && (
        <div
          /* 30px, interlinea 120%, spaziatura -4%, GRIGIO1; il grassetto
             non ingrossa, schiarisce — l'enfasi qui è di colore. */
          className="rounded-[20px] bg-box px-[30px] py-[28px] text-[20px] leading-[1.2] tracking-[-0.04em] text-grey xl:text-[30px] [&_a]:underline [&_p]:mt-[1.2em] [&_p:first-child]:mt-0 [&_strong]:font-normal [&_strong]:text-foreground"
          dangerouslySetInnerHTML={{ __html: testo }}
        />
      )}
    </section>
  );
}

/*
  Riquadri social — erano la fila sotto la griglia, ora blocco a sé: si
  possono mettere altrove nella pagina e in numero diverso dai numeri sopra.
*/
function SocialRender({ content }: { content: SectionContent }) {
  const riquadri = raggruppa(content.riquadri);
  if (riquadri.length === 0) return null;
  return (
    <section>
      <FilaBox boxes={riquadri} variante="sotto" />
    </section>
  );
}

/* Copertura stampa — due righe di loghi in movimento, delegate al client. */
async function LoghiRender({ content }: { content: SectionContent }) {
  const percorsi = (campo: unknown) =>
    Array.isArray(campo)
      ? (campo as unknown[]).filter((p): p is string => typeof p === "string")
      : [];

  const [riga1, riga2] = await Promise.all([
    signedUrls(percorsi(content.riga1)),
    signedUrls(percorsi(content.riga2)),
  ]);
  const pulisci = (urls: (string | null)[]) =>
    urls.filter((u): u is string => !!u);

  return (
    <Loghi
      titolo={s(content.titolo)}
      righe={[pulisci(riga1), pulisci(riga2)]}
    />
  );
}

/* Voci laterali — interattivo, quindi delegato a un client component. */
function VociRender({ content }: { content: SectionContent }) {
  const voci = Array.isArray(content.voci)
    ? (content.voci as unknown[])
        .filter((v): v is Record<string, unknown> => !!v && typeof v === "object")
        .map((v) => ({ titolo: s(v.titolo), testo: s(v.testo) }))
        .filter((v) => v.titolo)
    : [];
  if (voci.length === 0) return null;
  return <VociLaterali voci={voci} />;
}

/*
  Conclusioni — stesso impianto delle voci laterali con un titolo solo: cambia
  che il titolo non è selezionabile, e di quello si occupa già il componente.
*/
function ConclusioniRender({ content }: { content: SectionContent }) {
  const titolo = s(content.titolo);
  const testo = s(content.testo);
  if (!titolo && !testo) return null;
  return <VociLaterali voci={[{ titolo, testo }]} />;
}

export const RENDERERS: Record<string, SectionRenderer> = {
  conclusioni: ConclusioniRender,
  intro: IntroRender,
  voci: VociRender,
  carosello: CaroselloRender,
  immagini: ImmaginiRender,
  griglia: GrigliaRender,
  social: SocialRender,
  loghi: LoghiRender,
  media: MediaRender,
};

export function getRenderer(kind: string): SectionRenderer | undefined {
  return RENDERERS[kind];
}
