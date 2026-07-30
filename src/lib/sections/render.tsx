import type { ReactNode } from "react";
import { signedUrl, signedUrls } from "@/lib/media";
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
    "relative w-full overflow-hidden rounded-[30px] bg-grey/15 aspect-video";

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

      <div className="xl:ml-auto xl:max-w-[693px]">
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
  const urls = await signedUrls(paths);

  return (
    <section
      /* -mx e px compensano il padding del sito: le card possono uscire dal
         bordo destro come nel design, senza tagliare la prima a sinistra. */
      /*
        scroll-pl oltre a px: con snap obbligatorio l'aggancio della prima card
        ignora il padding (scroll-padding vale `auto`), quindi il browser
        scrollava di 40px e la card finiva a filo del bordo.
      */
      className="-mx-6 flex snap-x snap-mandatory scroll-pl-6 gap-[18px] overflow-x-auto px-6 pb-2 xl:-mx-10 xl:scroll-pl-10 xl:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {urls.map((url, i) =>
        url ? (
          <figure
            key={i}
            className="aspect-[596/760] w-[clamp(260px,calc((100%-18px)/1.15),680px)] shrink-0 snap-start overflow-hidden rounded-[30px] bg-grey/15 xl:w-[clamp(260px,calc((100%-18px)/2.2),680px)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element --
                URL firmato a scadenza: next/image lo cacherebbe oltre la validità. */}
            <img
              src={url}
              alt=""
              className="h-full w-full object-cover"
              loading={i > 1 ? "lazy" : undefined}
            />
          </figure>
        ) : null,
      )}
    </section>
  );
}

export const RENDERERS: Record<string, SectionRenderer> = {
  intro: IntroRender,
  carosello: CaroselloRender,
  media: MediaRender,
};

export function getRenderer(kind: string): SectionRenderer | undefined {
  return RENDERERS[kind];
}
