import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getProfile, getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sectionOptions, getSection } from "@/lib/sections/registry";
import {
  updateProject,
  setPublished,
  deleteProject,
  addSection,
  setSectionVisible,
  moveSection,
  deleteSection,
} from "../actions";

export const metadata = { title: "Modifica progetto — Tra le linee" };

type Sezione = {
  id: string;
  kind: string;
  position: number;
  visible: boolean;
  content: Record<string, unknown>;
};

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getUser();
  if (!user) redirect(`/login?next=/admin/progetti/${id}`);
  const me = await getProfile();
  if (!me) redirect("/portfolio");
  if (me.role !== "super_admin") redirect("/portfolio");

  const supabase = await createClient();
  const { data: progetto } = await supabase
    .from("projects")
    .select("id, slug, title, client, year, industry, services, summary, published")
    .eq("id", id)
    .maybeSingle();
  if (!progetto) notFound();

  const { data } = await supabase
    .from("project_sections")
    .select("id, kind, position, visible, content")
    .eq("project_id", id)
    .order("position");
  const sezioni = (data as Sezione[] | null) ?? [];
  const tipi = sectionOptions();

  return (
    <main className="min-h-svh px-6 py-32 xl:px-10">
      <Link href="/admin/progetti" className="hoverable text-[16px] text-grey">
        ← Progetti
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-[40px] leading-[1.02] tracking-[-1.6px] xl:text-[52px] xl:tracking-[-2.08px]">
          {progetto.title}
        </h1>
        <div className="flex items-center gap-3">
          <form action={setPublished}>
            <input type="hidden" name="id" value={progetto.id} />
            <input
              type="hidden"
              name="published"
              value={progetto.published ? "false" : "true"}
            />
            <button
              type="submit"
              className="hoverable border border-foreground px-4 py-2 text-[16px]"
            >
              {progetto.published ? "Ritira" : "Pubblica"}
            </button>
          </form>
          {progetto.published && (
            <Link
              href={`/portfolio/${progetto.slug}`}
              className="hoverable border border-grey px-4 py-2 text-[16px] text-grey"
            >
              Vedi pagina
            </Link>
          )}
        </div>
      </div>

      {/* Metadati -------------------------------------------------------- */}
      <section className="mt-16 max-w-[720px]">
        <h2 className="text-[30px] tracking-[-1.2px]">Dati del progetto</h2>
        <form action={updateProject} className="mt-6 flex flex-col gap-4">
          <input type="hidden" name="id" value={progetto.id} />
          <label className="flex flex-col gap-2">
            <span className="text-[16px] text-grey">Titolo</span>
            <input
              name="title"
              defaultValue={progetto.title}
              required
              className="border border-grey bg-transparent px-4 py-2 text-[18px] outline-none focus:border-foreground"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[16px] text-grey">
              Slug (indirizzo della pagina)
            </span>
            <input
              name="slug"
              defaultValue={progetto.slug}
              required
              className="border border-grey bg-transparent px-4 py-2 text-[18px] outline-none focus:border-foreground"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[16px] text-grey">Cliente</span>
            <input
              name="client"
              defaultValue={progetto.client ?? ""}
              className="border border-grey bg-transparent px-4 py-2 text-[18px] outline-none focus:border-foreground"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-[16px] text-grey">Anno</span>
              <input
                name="year"
                defaultValue={progetto.year ?? ""}
                placeholder="2026"
                className="border border-grey bg-transparent px-4 py-2 text-[18px] outline-none focus:border-foreground"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[16px] text-grey">Industry</span>
              <input
                name="industry"
                defaultValue={progetto.industry ?? ""}
                placeholder="Festival Culturale"
                className="border border-grey bg-transparent px-4 py-2 text-[18px] outline-none focus:border-foreground"
              />
            </label>
          </div>
          <label className="flex flex-col gap-2">
            <span className="text-[16px] text-grey">
              Servizi (separati da virgola)
            </span>
            <input
              name="services"
              defaultValue={progetto.services ?? ""}
              placeholder="Brand Identity, Comunicazione, Advertising"
              className="border border-grey bg-transparent px-4 py-2 text-[18px] outline-none focus:border-foreground"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[16px] text-grey">
              Sommario (mostrato nella lista)
            </span>
            <textarea
              name="summary"
              defaultValue={progetto.summary ?? ""}
              rows={3}
              className="border border-grey bg-transparent px-4 py-2 text-[18px] outline-none focus:border-foreground"
            />
          </label>
          <button
            type="submit"
            className="hoverable self-start border border-foreground px-5 py-2 text-[16px]"
          >
            Salva
          </button>
        </form>
      </section>

      {/* Sezioni -------------------------------------------------------- */}
      <section className="mt-20">
        <h2 className="text-[30px] tracking-[-1.2px]">
          Sezioni del case study{" "}
          <span className="text-grey">({sezioni.length})</span>
        </h2>

        {tipi.length === 0 ? (
          <p className="mt-4 max-w-[720px] text-[18px] leading-[1.02] tracking-[-0.72px] text-grey">
            Nessun tipo di sezione ancora definito. I blocchi vanno aggiunti al
            registro (<code>src/lib/sections/registry.ts</code>) sulla base dei
            design: appena ce ne sarà uno, compare qui il menu per inserirlo.
          </p>
        ) : (
          <form action={addSection} className="mt-6 flex gap-3">
            <input type="hidden" name="project_id" value={progetto.id} />
            <select
              name="kind"
              className="border border-grey bg-background px-4 py-2 text-[18px]"
            >
              {tipi.map((t) => (
                <option key={t.kind} value={t.kind}>
                  {t.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="hoverable border border-foreground px-5 py-2 text-[16px]"
            >
              Aggiungi sezione
            </button>
          </form>
        )}

        {sezioni.length > 0 && (
          <ul className="mt-8 border-t border-grey/40">
            {sezioni.map((s, i) => {
              const def = getSection(s.kind);
              return (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-4 border-b border-grey/40 py-4"
                >
                  <div>
                    <p className="text-[18px] tracking-[-0.72px]">
                      {def?.label ?? (
                        <span className="text-grey">
                          {s.kind} — tipo non registrato
                        </span>
                      )}
                      {!s.visible && (
                        <span className="ml-3 border border-grey/60 px-2 py-0.5 text-[13px] text-grey">
                          nascosta
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <form action={moveSection}>
                      <input type="hidden" name="id" value={s.id} />
                      <input
                        type="hidden"
                        name="project_id"
                        value={progetto.id}
                      />
                      <input type="hidden" name="direction" value="up" />
                      <button
                        type="submit"
                        disabled={i === 0}
                        aria-label="Sposta su"
                        className="hoverable border border-grey px-3 py-1 text-[16px] text-grey disabled:opacity-30"
                      >
                        ↑
                      </button>
                    </form>
                    <form action={moveSection}>
                      <input type="hidden" name="id" value={s.id} />
                      <input
                        type="hidden"
                        name="project_id"
                        value={progetto.id}
                      />
                      <input type="hidden" name="direction" value="down" />
                      <button
                        type="submit"
                        disabled={i === sezioni.length - 1}
                        aria-label="Sposta giù"
                        className="hoverable border border-grey px-3 py-1 text-[16px] text-grey disabled:opacity-30"
                      >
                        ↓
                      </button>
                    </form>
                    <form action={setSectionVisible}>
                      <input type="hidden" name="id" value={s.id} />
                      <input
                        type="hidden"
                        name="project_id"
                        value={progetto.id}
                      />
                      <input
                        type="hidden"
                        name="visible"
                        value={s.visible ? "false" : "true"}
                      />
                      <button
                        type="submit"
                        className="hoverable border border-grey px-3 py-1 text-[16px] text-grey"
                      >
                        {s.visible ? "Nascondi" : "Mostra"}
                      </button>
                    </form>
                    <form action={deleteSection}>
                      <input type="hidden" name="id" value={s.id} />
                      <input
                        type="hidden"
                        name="project_id"
                        value={progetto.id}
                      />
                      <button
                        type="submit"
                        className="hoverable px-3 py-1 text-[16px] text-grey underline"
                      >
                        Elimina
                      </button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Elimina progetto ----------------------------------------------- */}
      <section className="mt-20 border-t border-grey/40 pt-8">
        <form action={deleteProject}>
          <input type="hidden" name="id" value={progetto.id} />
          <button
            type="submit"
            className="hoverable text-[16px] text-grey underline"
          >
            Elimina questo progetto e tutte le sue sezioni
          </button>
        </form>
      </section>
    </main>
  );
}
