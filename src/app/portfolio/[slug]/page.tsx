import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getProfile, getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getRenderer } from "@/lib/sections/render";
import type { SectionContent } from "@/lib/sections/schema";

type Sezione = {
  id: string;
  kind: string;
  content: SectionContent;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return { title: `${slug} — Tra le linee` };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const user = await getUser();
  if (!user) redirect(`/login?next=/portfolio/${slug}`);
  const profile = await getProfile();
  if (!profile) redirect("/portfolio");
  if (!profile.approved) redirect("/portfolio");

  const supabase = await createClient();
  // Le RLS fanno il lavoro: una bozza non è leggibile da un non-admin, quindi
  // qui basta il notFound() quando la query non restituisce nulla.
  const { data: progetto } = await supabase
    .from("projects")
    .select("id, slug, title, client, year, industry, services, summary")
    .eq("slug", slug)
    .maybeSingle();
  if (!progetto) notFound();

  const { data } = await supabase
    .from("project_sections")
    .select("id, kind, content")
    .eq("project_id", progetto.id)
    .eq("visible", true)
    .order("position");
  const sezioni = (data as Sezione[] | null) ?? [];

  return (
    /*
      Misure dal Figma su base 1440: sezioni a piena larghezza dentro il
      padding laterale del sito (40px), ~70px sotto l'header — che è alto ~91px
      su desktop e ~72px su mobile — e 60px fra intestazione e primo blocco.
    */
    <main className="min-h-svh px-6 pb-32 pt-[142px] xl:px-10 xl:pt-[161px]">
      {/* Intestazione: titolo e anno vengono dai dati del progetto, non da un
          blocco, così non vanno ricompilati per ogni case study.
          Figma: 86px e 52px, interlinea 120%, spaziatura -4%. */}
      <header>
        <h1 className="text-[44px] leading-[1.2] tracking-[-1.76px] xl:text-[86px] xl:tracking-[-3.44px]">
          {progetto.title}
        </h1>
        {progetto.year && (
          <p className="text-[28px] leading-[1.2] tracking-[-1.12px] text-grey xl:text-[52px] xl:tracking-[-2.08px]">
            {progetto.year}
          </p>
        )}
      </header>

      {sezioni.length === 0 ? (
        <p className="mt-[60px] text-[18px] tracking-[-0.72px] text-grey">
          Questo case study non ha ancora contenuti.
        </p>
      ) : (
        <div className="mt-[60px] flex flex-col gap-[60px]">
          {sezioni.map((s) => {
            const Render = getRenderer(s.kind);
            // Tipo non (ancora) registrato: si salta invece di rompere la
            // pagina. Capita se una sezione resta in archivio dopo che il suo
            // tipo è stato rinominato o rimosso.
            if (!Render) return null;
            return <Render key={s.id} content={s.content} />;
          })}
        </div>
      )}

      <nav className="mt-32 flex items-center justify-between gap-6 text-[16px]">
        <Link href="/portfolio" className="hoverable text-grey">
          ← Torna all&rsquo;indice
        </Link>
      </nav>
    </main>
  );
}
