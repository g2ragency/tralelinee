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
    .select("id, slug, title, client, year, industry, services, summary, category")
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

  /*
    Prossimo progetto: si gira in tondo, così l'ultimo riporta al primo invece
    di ritrovarsi senza uscita. Resta dentro la stessa categoria, altrimenti da
    un portfolio si finirebbe su un case study (e viceversa) senza preavviso.
    `published` è esplicito perché a un super admin le RLS lascerebbero vedere
    anche le bozze, e il link è rivolto ai lettori.
  */
  const { data: elenco } = await supabase
    .from("projects")
    .select("slug, title")
    .eq("published", true)
    .eq("category", progetto.category)
    .order("position");
  const tutti = elenco ?? [];
  const corrente = tutti.findIndex((p) => p.slug === slug);
  const prossimo =
    tutti.length > 1 && corrente !== -1
      ? tutti[(corrente + 1) % tutti.length]
      : null;

  return (
    /*
      Misure dal Figma su base 1440: sezioni a piena larghezza dentro il
      padding laterale del sito (40px), ~70px sotto l'header — alto 70px su
      desktop e 58px su mobile — e 60px fra intestazione e primo blocco.
    */
    <main className="min-h-svh px-6 pb-32 pt-[128px] xl:px-10 xl:pt-[140px]">
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
        /* 60px fra intestazione e primo blocco, ~95px fra i blocchi */
        <div className="mt-[60px] flex flex-col gap-[95px]">
          {sezioni.map((s) => {
            const Render = getRenderer(s.kind);
            // Tipo non (ancora) registrato: si salta invece di rompere la
            // pagina. Capita se una sezione resta in archivio dopo che il suo
            // tipo è stato rinominato o rimosso.
            if (!Render) return null;
            return (
              <Render key={s.id} content={s.content} project={progetto} />
            );
          })}
        </div>
      )}

      {/* Figma: 24px Regular, interlinea 120%, spaziatura -4%, #C4C4C4 */}
      <nav className="mt-[95px] flex items-center justify-between gap-6 text-[18px] leading-[1.2] tracking-[-0.04em] text-[#C4C4C4] xl:text-[24px]">
        <Link href="/portfolio">
          ← Torna all&rsquo;indice
        </Link>
        {prossimo && (
          <Link
            href={`/portfolio/${prossimo.slug}`}
            className="text-right"
          >
            Guarda il prossimo{" "}
            {progetto.category === "portfolio" ? "progetto" : "Case Study"} →
          </Link>
        )}
      </nav>
    </main>
  );
}
