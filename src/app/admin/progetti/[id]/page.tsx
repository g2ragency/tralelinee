import { notFound, redirect } from "next/navigation";
import { BottoneInvio } from "@/components/admin/BottoneInvio";
import { FormAzione } from "@/components/admin/FormAzione";
import Link from "next/link";
import { getProfile, getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sectionOptions, getSchema } from "@/lib/sections/schema";
import { SectionForm } from "@/components/admin/SectionForm";
import { FileUpload } from "@/components/admin/FileUpload";
import { Ripiegabile } from "@/components/admin/Ripiegabile";
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

const classeInput =
  "border border-grey bg-transparent px-4 py-2 text-[18px] outline-none focus:border-foreground";

/* Una riga per riconoscere un blocco chiuso senza aprirlo. */
function riassunto(s: Sezione): string {
  const c = s.content ?? {};
  const testo = (v: unknown) =>
    typeof v === "string" ? v.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "";
  const conta = (v: unknown, una: string, tante: string) => {
    const n = Array.isArray(v) ? v.length : 0;
    return n === 0 ? "vuoto" : `${n} ${n === 1 ? una : tante}`;
  };
  switch (s.kind) {
    case "immagini": {
      const schema = getSchema("immagini");
      const formato = schema?.fields.find((f) => f.name === "formato");
      const etichetta =
        formato?.type === "select"
          ? formato.options.find((o) => o.value === c.formato)?.label
          : undefined;
      return `${conta(c.immagini, "immagine", "immagini")} · ${etichetta ?? "Una per riga, 16:9"}`;
    }
    case "carosello":
      return conta(c.immagini, "immagine", "immagini");
    case "loghi":
      return `${conta(c.riga1, "logo", "loghi")} + ${conta(c.riga2, "logo", "loghi")}`;
    case "voci":
      return Array.isArray(c.voci) && c.voci.length
        ? (c.voci as { titolo?: string }[]).map((v) => v.titolo || "senza titolo").join(" · ")
        : "vuoto";
    case "media":
      return c.tipo === "video_file"
        ? c.video ? "video caricato" : "video da caricare"
        : c.tipo === "video_embed"
          ? testo(c.embed) || "link da inserire"
          : c.immagine ? "immagine" : "immagine da caricare";
    default:
      return testo(c.titolo) || testo(c.testo).slice(0, 90) || "vuoto";
  }
}

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
        <div>
          <h1 className="text-[40px] leading-[1.02] tracking-[-1.6px] xl:text-[52px] xl:tracking-[-2.08px]">
            {progetto.title}
          </h1>
          <p className="mt-2 text-[16px] text-grey">
            {progetto.published
              ? "Pubblicato: lo vedono gli utenti approvati."
              : "Bozza: la vedono solo i super admin."}
          </p>
        </div>
        <div className="flex flex-wrap items-start gap-3">
          {/* Anche per una bozza: la pagina pubblica la mostra ai super admin,
              ed è proprio lì che si controlla prima di pubblicare. */}
          <Link
            href={`/portfolio/${progetto.slug}`}
            target="_blank"
            className="border border-grey px-4 py-2 text-[16px] text-grey"
          >
            {progetto.published ? "Vedi pagina" : "Anteprima"} ↗
          </Link>
          <FormAzione action={setPublished} semplice>
            <input type="hidden" name="id" value={progetto.id} />
            <input
              type="hidden"
              name="published"
              value={progetto.published ? "false" : "true"}
            />
            <BottoneInvio className="border border-foreground px-4 py-2 text-[16px]">
              {progetto.published ? "Ritira (torna bozza)" : "Pubblica"}
            </BottoneInvio>
          </FormAzione>
        </div>
      </div>

      {/* Metadati -------------------------------------------------------- */}
      <section className="mt-16 max-w-[720px]">
        <h2 className="text-[30px] tracking-[-1.2px]">Dati del progetto</h2>
        <FormAzione action={updateProject} className="mt-6 flex flex-col gap-4">
          <input type="hidden" name="id" value={progetto.id} />
          <label className="flex flex-col gap-2">
            <span className="text-[16px] text-grey">Titolo</span>
            <input
              name="title"
              defaultValue={progetto.title}
              required
              className={classeInput}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[16px] text-grey">
              Indirizzo della pagina: /portfolio/…
            </span>
            <input
              name="slug"
              defaultValue={progetto.slug}
              required
              className={classeInput}
            />
            <span className="text-[14px] text-grey">
              Solo lettere minuscole, numeri e trattini; il resto viene
              convertito al salvataggio. Cambiandolo, i link già condivisi
              smettono di funzionare.
            </span>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[16px] text-grey">
              Tipo (il filtro dell&rsquo;elenco portfolio)
            </span>
            <select
              name="category"
              defaultValue={progetto.category ?? "case_study"}
              className="border border-grey bg-background px-4 py-2 text-[18px]"
            >
              <option value="case_study">Case study</option>
              <option value="portfolio">Portfolio</option>
            </select>
          </label>
          {/* Copertina e apertura non sono blocchi della pagina, quindi stanno
              qui coi dati. Sono due campi perché devono poter essere diverse
              (Veronika, 23/11): entrando nel progetto non si rivede la card
              appena cliccata. */}
          <FileUpload
            name="cover_path"
            projectId={progetto.id}
            defaultPath={progetto.cover_path ?? ""}
            label="Copertina"
            hint="L'immagine della scheda nell'elenco del portfolio. Formato 4:3, almeno 1340×1005."
          />
          <FileUpload
            name="hero_path"
            projectId={progetto.id}
            defaultPath={progetto.hero_path ?? ""}
            accept="image/*,video/mp4,video/webm"
            label="Apertura della pagina (facoltativa)"
            hint="Immagine o video in cima alla pagina del progetto, sotto il titolo. Diversa dalla copertina. Formato 16:9, almeno 2720×1530; i video partono da soli, senza audio. Vuota, la pagina parte dal titolo e poi dai blocchi."
          />
          <label className="flex flex-col gap-2">
            <span className="text-[16px] text-grey">Cliente</span>
            <input
              name="client"
              defaultValue={progetto.client ?? ""}
              className={classeInput}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-[16px] text-grey">Anno</span>
              <input
                name="year"
                defaultValue={progetto.year ?? ""}
                placeholder="2026"
                className={classeInput}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[16px] text-grey">Industry</span>
              <input
                name="industry"
                defaultValue={progetto.industry ?? ""}
                placeholder="Festival Culturale"
                className={classeInput}
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
              className={classeInput}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[16px] text-grey">
              Note interne (non compaiono sul sito)
            </span>
            <textarea
              name="summary"
              defaultValue={progetto.summary ?? ""}
              rows={3}
              className={classeInput}
            />
          </label>
          <BottoneInvio className="self-start border border-foreground px-5 py-2 text-[16px]">
            Salva i dati
          </BottoneInvio>
        </FormAzione>
      </section>

      {/* Blocchi -------------------------------------------------------- */}
      <section className="mt-20">
        <h2 className="text-[30px] tracking-[-1.2px]">
          Blocchi della pagina{" "}
          <span className="text-grey">({sezioni.length})</span>
        </h2>
        <p className="mt-2 max-w-[720px] text-[16px] text-grey">
          Compaiono nella pagina in quest&rsquo;ordine, sotto il titolo e
          l&rsquo;apertura. Ogni blocco si salva col suo bottone.
        </p>

        {sezioni.length > 0 && (
          <ol className="mt-8 border-t border-grey/40">
            {sezioni.map((s, i) => {
              const schema = getSchema(s.kind);
              const nome = schema?.label ?? s.kind;
              return (
                <li key={s.id} className="border-b border-grey/40 py-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[18px] tracking-[-0.72px]">
                        <span className="text-grey">{i + 1}. </span>
                        {schema ? (
                          nome
                        ) : (
                          <span className="text-grey">
                            {s.kind}: tipo non più previsto
                          </span>
                        )}
                        {!s.visible && (
                          <span className="ml-3 border border-grey/60 px-2 py-0.5 text-[13px] text-grey">
                            nascosto
                          </span>
                        )}
                      </p>
                      <p className="mt-1 truncate text-[15px] text-grey">
                        {riassunto(s)}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <FormAzione action={moveSection} semplice>
                        <input type="hidden" name="id" value={s.id} />
                        <input type="hidden" name="project_id" value={progetto.id} />
                        <input type="hidden" name="direction" value="up" />
                        <BottoneInvio
                          disabled={i === 0}
                          ariaLabel={`Sposta su «${nome}»`}
                          className="border border-grey px-3 py-1 text-[16px] text-grey disabled:opacity-30"
                        >
                          ↑
                        </BottoneInvio>
                      </FormAzione>
                      <FormAzione action={moveSection} semplice>
                        <input type="hidden" name="id" value={s.id} />
                        <input type="hidden" name="project_id" value={progetto.id} />
                        <input type="hidden" name="direction" value="down" />
                        <BottoneInvio
                          disabled={i === sezioni.length - 1}
                          ariaLabel={`Sposta giù «${nome}»`}
                          className="border border-grey px-3 py-1 text-[16px] text-grey disabled:opacity-30"
                        >
                          ↓
                        </BottoneInvio>
                      </FormAzione>
                      <FormAzione action={setSectionVisible} semplice>
                        <input type="hidden" name="id" value={s.id} />
                        <input type="hidden" name="project_id" value={progetto.id} />
                        <input
                          type="hidden"
                          name="visible"
                          value={s.visible ? "false" : "true"}
                        />
                        <BottoneInvio className="border border-grey px-3 py-1 text-[16px] text-grey">
                          {s.visible ? "Nascondi" : "Mostra"}
                        </BottoneInvio>
                      </FormAzione>
                      <FormAzione action={deleteSection} semplice>
                        <input type="hidden" name="id" value={s.id} />
                        <input type="hidden" name="project_id" value={progetto.id} />
                        <BottoneInvio
                          domanda={`Eliminare il blocco «${nome}»? Il suo contenuto non è recuperabile.`}
                          className="px-3 py-1 text-[16px] text-grey underline"
                        >
                          Elimina
                        </BottoneInvio>
                      </FormAzione>
                    </div>
                  </div>

                  {/* Chiuso di partenza: con venti blocchi aperti la pagina
                      diventava lunga metri. Un blocco appena aggiunto, ancora
                      vuoto, si apre da solo. Il form resta montato anche da
                      chiuso, quindi le modifiche in corso non si perdono. */}
                  <Ripiegabile aperto={Object.keys(s.content ?? {}).length === 0}>
                    {schema?.hint && (
                      <p className="mt-3 max-w-[720px] text-[14px] text-grey">
                        {schema.hint}
                      </p>
                    )}
                    {/* Il form si costruisce dai campi dello schema del tipo */}
                    <SectionForm
                      id={s.id}
                      projectId={progetto.id}
                      kind={s.kind}
                      content={s.content}
                    />
                  </Ripiegabile>
                </li>
              );
            })}
          </ol>
        )}

        <FormAzione action={addSection} className="mt-8 flex max-w-[720px] flex-col gap-3">
          <input type="hidden" name="project_id" value={progetto.id} />
          <span className="text-[16px] text-grey">Aggiungi un blocco in fondo</span>
          <div className="flex flex-wrap gap-3">
            <select
              name="kind"
              className="min-w-0 flex-1 border border-grey bg-background px-4 py-2 text-[18px]"
            >
              {tipi.map((t) => (
                <option key={t.kind} value={t.kind}>
                  {t.label}
                </option>
              ))}
            </select>
            <BottoneInvio className="border border-foreground px-5 py-2 text-[16px]">
              Aggiungi blocco
            </BottoneInvio>
          </div>
        </FormAzione>
      </section>

      {/* Elimina progetto ----------------------------------------------- */}
      <section className="mt-20 border-t border-grey/40 pt-8">
        <FormAzione action={deleteProject} semplice>
          <input type="hidden" name="id" value={progetto.id} />
          <BottoneInvio
            domanda={`Eliminare definitivamente «${progetto.title}», i suoi ${sezioni.length} blocchi e tutte le immagini caricate?\n\nNon si torna indietro.`}
            className="text-[16px] text-grey underline"
          >
            Elimina questo progetto, i suoi blocchi e le sue immagini
          </BottoneInvio>
        </FormAzione>
      </section>
    </main>
  );
}
