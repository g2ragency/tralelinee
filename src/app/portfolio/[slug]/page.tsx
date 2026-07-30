import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getProfile, getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getSection, type SectionContent } from "@/lib/sections/registry";

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
    .select("id, slug, title, client, summary")
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
    <main className="min-h-svh px-6 py-32 xl:px-10">
      <Link href="/portfolio" className="hoverable text-[16px] text-grey">
        ← Portfolio
      </Link>

      <header className="mt-8 max-w-[1100px]">
        {progetto.client && (
          <p className="text-[24px] font-medium leading-[0.933] tracking-[-0.72px] text-label">
            {progetto.client}
          </p>
        )}
        <h1 className="mt-6 text-[40px] leading-[1.02] tracking-[-1.6px] xl:text-[52px] xl:tracking-[-2.08px]">
          {progetto.title}
        </h1>
        {progetto.summary && (
          <p className="mt-8 max-w-[900px] text-[18px] leading-[1.02] tracking-[-0.72px] text-grey">
            {progetto.summary}
          </p>
        )}
      </header>

      {sezioni.length === 0 ? (
        <p className="mt-20 text-[18px] tracking-[-0.72px] text-grey">
          Questo case study non ha ancora contenuti.
        </p>
      ) : (
        <div className="mt-20 flex flex-col gap-24">
          {sezioni.map((s) => {
            const def = getSection(s.kind);
            // Tipo non (ancora) registrato: si salta invece di rompere la
            // pagina. Capita se una sezione resta in archivio dopo che il suo
            // tipo è stato rinominato o rimosso dal registro.
            if (!def) return null;
            return <def.Render key={s.id} content={s.content} />;
          })}
        </div>
      )}
    </main>
  );
}
