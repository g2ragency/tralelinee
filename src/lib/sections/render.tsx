import type { ReactNode } from "react";
import { signedUrl } from "@/lib/media";
import type { SectionContent } from "./schema";

/*
  Renderer dei tipi di sezione. Sono Server Component asincroni: leggono dal
  bucket privato per firmare gli URL, quindi non possono stare in `schema.ts`,
  che è importato anche dal form client.

  Aggiungere un tipo = una voce qui + una voce in schema.ts.
*/
export type SectionRenderer = (props: {
  content: SectionContent;
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

export const RENDERERS: Record<string, SectionRenderer> = {
  media: MediaRender,
};

export function getRenderer(kind: string): SectionRenderer | undefined {
  return RENDERERS[kind];
}
