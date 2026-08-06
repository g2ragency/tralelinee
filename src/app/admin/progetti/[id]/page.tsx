import { notFound, redirect } from "next/navigation";
import { BottoneInvio } from "@/components/admin/BottoneInvio";
import Link from "next/link";
import { getProfile, getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sectionOptions, getSchema } from "@/lib/sections/schema";
import { SectionForm } from "@/components/admin/SectionForm";
import { FileUpload } from "@/components/admin/FileUpload";
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
    /*
      Riga intera: il form la mostra quasi tutta, e con l'elenco esplicito
      una colonna aggiunta da una migrazione non ancora eseguita farebbe
      fallire la query, cioè un 404 sulla pagina invece di un campo vuoto.
    */
    .select("*")
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
      <Link href="/admin/progetti" className="text-[16px] text-grey">
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
            <BottoneInvio
              className="border border-foreground px-4 py-2 text-[16px]"
            >
              {progetto.published ? "Ritira" : "Pubblica"}
            </BottoneInvio>
          </form>
          {progetto.published && (
            <Link
              href={`/portfolio/${progetto.slug}`}
              className="border border-grey px-4 py-2 text-[16px] text-grey"
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
            <span className="text-[16px] text-grey">
              Categoria (filtro nell&rsquo;elenco portfolio)
            </span>
            <select
              name="category"
              defaultValue={progetto.category ?? "case_study"}
              className="border border-grey bg-background px-4 py-2 text-[18px]"
            >
              <option value="case_study">Case Study</option>
              <option value="portfolio">Portfolio</option>
            </select>
          </label>
          {/* La copertina è l'immagine della card nell'elenco portfolio: non
              è una sezione della pagina, quindi sta qui coi dati. */}
          <FileUpload
            name="cover_path"
            projectId={progetto.id}
            defaultPath={progetto.cover_path ?? ""}
            label="Copertina (card nell'elenco, proporzione 4:3)"
          />
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
              Sommario (uso interno, non compare nell&rsquo;elenco)
            </span>
            <textarea
              name="summary"
              defaultValue={progetto.summary ?? ""}
              rows={3}
              className="border border-grey bg-transparent px-4 py-2 text-[18px] outline-none focus:border-foreground"
            />
          </label>
          <BottoneInvio
            className="self-start border border-foreground px-5 py-2 text-[16px]"
          >
            Salva
          </BottoneInvio>
        </form>
      </section>

      {/* Sezioni -------------------------------------------------------- */}
      <section className="mt-20">
        <h2 className="text-[30px] tracking-[-1.2px]">
          Sezioni della pagina{" "}
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
            <BottoneInvio
              className="border border-foreground px-5 py-2 text-[16px]"
            >
              Aggiungi sezione
            </BottoneInvio>
          </form>
        )}

        {sezioni.length > 0 && (
          <ul className="mt-8 border-t border-grey/40">
            {sezioni.map((s, i) => {
              const schema = getSchema(s.kind);
              return (
                <li key={s.id} className="border-b border-grey/40 py-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-[18px] tracking-[-0.72px]">
                      {schema?.label ?? (
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
                      <BottoneInvio
                        disabled={i === 0}
                        ariaLabel="Sposta su"
                        className="border border-grey px-3 py-1 text-[16px] text-grey disabled:opacity-30"
                      >
                        ↑
                      </BottoneInvio>
                    </form>
                    <form action={moveSection}>
                      <input type="hidden" name="id" value={s.id} />
                      <input
                        type="hidden"
                        name="project_id"
                        value={progetto.id}
                      />
                      <input type="hidden" name="direction" value="down" />
                      <BottoneInvio
                        disabled={i === sezioni.length - 1}
                        ariaLabel="Sposta giù"
                        className="border border-grey px-3 py-1 text-[16px] text-grey disabled:opacity-30"
                      >
                        ↓
                      </BottoneInvio>
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
                      <BottoneInvio
                        className="border border-grey px-3 py-1 text-[16px] text-grey"
                      >
                        {s.visible ? "Nascondi" : "Mostra"}
                      </BottoneInvio>
                    </form>
                    <form action={deleteSection}>
                      <input type="hidden" name="id" value={s.id} />
                      <input
                        type="hidden"
                        name="project_id"
                        value={progetto.id}
                      />
                      <BottoneInvio
                        domanda={`Eliminare la sezione «${schema?.label ?? s.kind}»? Il suo contenuto non è recuperabile.`}
                        className="px-3 py-1 text-[16px] text-grey underline"
                      >
                        Elimina
                      </BottoneInvio>
                    </form>
                  </div>
                  </div>

                  {/* Il form si costruisce dai campi dello schema del tipo */}
                  <SectionForm
                    id={s.id}
                    projectId={progetto.id}
                    kind={s.kind}
                    content={s.content}
                  />
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
          <BottoneInvio
            domanda={`Eliminare definitivamente «${progetto.title}» e tutte le sue ${sezioni.length} sezioni?\n\nNon si torna indietro: testi e impostazioni vanno persi.`}
            className="text-[16px] text-grey underline"
          >
            Elimina questo progetto e tutte le sue sezioni
          </BottoneInvio>
        </form>
      </section>
    </main>
  );
}
