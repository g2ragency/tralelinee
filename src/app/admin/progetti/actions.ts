"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSuperAdmin } from "@/lib/auth";
import { sanitizeBySchema } from "@/lib/sections/sanitize";
import { contenutoDaForm } from "@/lib/sections/contenuto";
import { nessunaRiga, spiega, type Esito } from "@/lib/esito";

/*
  Azioni del builder. I controlli qui servono all'interfaccia: la barriera
  vera sono le RLS, che rifiuterebbero la scrittura anche se queste azioni
  venissero invocate da un utente normale.

  Ognuna restituisce un `Esito` che `FormAzione` mostra: prima un rifiuto del
  database (indirizzo già usato, sessione scaduta) passava in silenzio e la
  pagina si ricaricava come se avesse salvato.
*/
const NON_AUTORIZZATO: Esito = {
  errore: "Sessione scaduta o permessi insufficienti: ricarica la pagina e rientra.",
};

/* Slug leggibile e stabile a partire dal titolo. */
function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // via gli accenti
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

const testo = (formData: FormData, nome: string) =>
  String(formData.get(nome) ?? "").trim();

/* Pagine da rinfrescare dopo una modifica al contenuto di un progetto. */
async function rinfresca(projectId: string) {
  revalidatePath(`/admin/progetti/${projectId}`);
  revalidatePath("/portfolio");
}

// ===========================================================================
// Progetti
// ===========================================================================

export async function createProject(_: Esito, formData: FormData): Promise<Esito> {
  if (!(await isSuperAdmin())) return NON_AUTORIZZATO;
  const title = testo(formData, "title");
  if (!title) return { errore: "Scrivi il titolo del progetto." };

  const supabase = await createClient();
  // Slug univoco: se esiste già si accoda un suffisso numerico.
  const base = slugify(title) || "progetto";
  let slug = base;
  for (let i = 2; ; i++) {
    const { data } = await supabase
      .from("projects")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!data) break;
    slug = `${base}-${i}`;
  }

  const { data: ultimo } = await supabase
    .from("projects")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: creato, error } = await supabase
    .from("projects")
    .insert({ title, slug, position: (ultimo?.position ?? 0) + 1 })
    .select("id")
    .single();
  if (error) return spiega(error, "Creazione");

  revalidatePath("/admin/progetti");
  redirect(`/admin/progetti/${creato.id}`);
}

export async function updateProject(_: Esito, formData: FormData): Promise<Esito> {
  if (!(await isSuperAdmin())) return NON_AUTORIZZATO;
  const id = testo(formData, "id");
  const title = testo(formData, "title");
  if (!title) return { errore: "Il titolo non può restare vuoto." };
  const slug = slugify(testo(formData, "slug"));
  if (!slug)
    return { errore: "L'indirizzo deve contenere almeno una lettera o un numero." };

  // Whitelist: il vincolo in banca dati rifiuterebbe comunque un valore
  // inventato, ma così l'errore non arriva nemmeno.
  const category =
    formData.get("category") === "portfolio" ? "portfolio" : "case_study";

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .update({
      title,
      slug,
      category,
      cover_path: testo(formData, "cover_path") || null,
      hero_path: testo(formData, "hero_path") || null,
      hover_path: testo(formData, "hover_path") || null,
      client: testo(formData, "client") || null,
      year: testo(formData, "year") || null,
      industry: testo(formData, "industry") || null,
      services: testo(formData, "services") || null,
      summary: testo(formData, "summary") || null,
    })
    .eq("id", id)
    .select("id");
  if (error) return spiega(error);
  if (!data?.length) return nessunaRiga();

  await rinfresca(id);
  revalidatePath("/admin/progetti");
  return { ok: "Dati salvati." };
}

export async function setPublished(_: Esito, formData: FormData): Promise<Esito> {
  if (!(await isSuperAdmin())) return NON_AUTORIZZATO;
  const id = testo(formData, "id");
  const published = formData.get("published") === "true";

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .update({ published })
    .eq("id", id)
    .select("id");
  if (error) return spiega(error, published ? "Pubblicazione" : "Ritiro");
  if (!data?.length) return nessunaRiga(published ? "Pubblicazione" : "Ritiro");

  revalidatePath("/admin/progetti");
  await rinfresca(id);
  return { ok: published ? "Pubblicato." : "Ritirato." };
}

/*
  Ordine dei progetti nell'elenco del portfolio: si scambia la posizione con
  il vicino, come per le sezioni.
*/
export async function moveProject(_: Esito, formData: FormData): Promise<Esito> {
  if (!(await isSuperAdmin())) return NON_AUTORIZZATO;
  const id = testo(formData, "id");
  const su = formData.get("direction") === "up";

  const supabase = await createClient();
  const { data: corrente } = await supabase
    .from("projects")
    .select("id, position")
    .eq("id", id)
    .maybeSingle();
  if (!corrente) return nessunaRiga("Spostamento");

  const { data: vicino } = await supabase
    .from("projects")
    .select("id, position")
    [su ? "lt" : "gt"]("position", corrente.position)
    .order("position", { ascending: !su })
    .limit(1)
    .maybeSingle();
  if (!vicino) return undefined;

  const a = await supabase
    .from("projects")
    .update({ position: vicino.position })
    .eq("id", corrente.id);
  const b = await supabase
    .from("projects")
    .update({ position: corrente.position })
    .eq("id", vicino.id);
  if (a.error || b.error) return spiega(a.error ?? b.error, "Spostamento");

  revalidatePath("/admin/progetti");
  revalidatePath("/portfolio");
  return undefined;
}

export async function deleteProject(_: Esito, formData: FormData): Promise<Esito> {
  if (!(await isSuperAdmin())) return NON_AUTORIZZATO;
  const id = testo(formData, "id");

  const supabase = await createClient();
  // Le sezioni cadono per ON DELETE CASCADE.
  const { data, error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) return spiega(error, "Eliminazione");
  if (!data?.length) return nessunaRiga("Eliminazione");

  /*
    I file del progetto stanno tutti sotto progetti/<id>/: senza questo
    restavano nel bucket per sempre, invisibili e pagati. Se la pulizia non
    riesce il progetto è comunque eliminato, quindi non la si segnala.
  */
  const cartella = `progetti/${id}`;
  const { data: file } = await supabase.storage
    .from("portfolio-media")
    .list(cartella, { limit: 1000 });
  if (file?.length) {
    await supabase.storage
      .from("portfolio-media")
      .remove(file.map((f) => `${cartella}/${f.name}`));
  }

  revalidatePath("/admin/progetti");
  revalidatePath("/portfolio");
  redirect("/admin/progetti");
}

// ===========================================================================
// Sezioni
// ===========================================================================

export async function addSection(_: Esito, formData: FormData): Promise<Esito> {
  if (!(await isSuperAdmin())) return NON_AUTORIZZATO;
  const projectId = testo(formData, "project_id");
  const kind = testo(formData, "kind");
  if (!projectId || !kind) return { errore: "Scegli il tipo di blocco." };

  const supabase = await createClient();
  const { data: ultima } = await supabase
    .from("project_sections")
    .select("position")
    .eq("project_id", projectId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("project_sections").insert({
    project_id: projectId,
    kind,
    position: (ultima?.position ?? 0) + 1,
  });
  if (error) return spiega(error, "Aggiunta");

  await rinfresca(projectId);
  return { ok: "Blocco aggiunto in fondo alla pagina." };
}

export async function updateSection(_: Esito, formData: FormData): Promise<Esito> {
  if (!(await isSuperAdmin())) return NON_AUTORIZZATO;
  const id = testo(formData, "id");
  const projectId = testo(formData, "project_id");
  const kind = testo(formData, "kind");

  const supabase = await createClient();

  /*
    Serve il contenuto già archiviato: i campi con `showIf` non sono a schermo
    quando la condizione non vale, quindi non arrivano nel form, e vanno
    conservati invece che cancellati. Il perché in dettaglio sta in
    `contenutoDaForm`.
  */
  const { data: attuale } = await supabase
    .from("project_sections")
    .select("content")
    .eq("id", id)
    .maybeSingle();
  if (!attuale) return nessunaRiga();

  const content = contenutoDaForm(kind, formData, attuale.content);

  // Unico punto in cui l'HTML entra in archivio: qui va sanificato,
  // compresi i campi rich text annidati nei repeater.
  const pulito = sanitizeBySchema(kind, content);

  const { data, error } = await supabase
    .from("project_sections")
    .update({ content: pulito })
    .eq("id", id)
    .select("id");
  if (error) return spiega(error);
  if (!data?.length) return nessunaRiga();

  await rinfresca(projectId);
  return { ok: "Blocco salvato." };
}

export async function setSectionVisible(_: Esito, formData: FormData): Promise<Esito> {
  if (!(await isSuperAdmin())) return NON_AUTORIZZATO;
  const id = testo(formData, "id");
  const projectId = testo(formData, "project_id");
  const visible = formData.get("visible") === "true";

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_sections")
    .update({ visible })
    .eq("id", id)
    .select("id");
  if (error) return spiega(error);
  if (!data?.length) return nessunaRiga();

  await rinfresca(projectId);
  return undefined;
}

export async function moveSection(_: Esito, formData: FormData): Promise<Esito> {
  if (!(await isSuperAdmin())) return NON_AUTORIZZATO;
  const id = testo(formData, "id");
  const projectId = testo(formData, "project_id");
  const su = formData.get("direction") === "up";

  const supabase = await createClient();
  const { data: corrente } = await supabase
    .from("project_sections")
    .select("id, position")
    .eq("id", id)
    .maybeSingle();
  if (!corrente) return nessunaRiga("Spostamento");

  // La vicina nella direzione richiesta: si scambiano le posizioni.
  const { data: vicina } = await supabase
    .from("project_sections")
    .select("id, position")
    .eq("project_id", projectId)
    [su ? "lt" : "gt"]("position", corrente.position)
    .order("position", { ascending: !su })
    .limit(1)
    .maybeSingle();
  if (!vicina) return undefined;

  const a = await supabase
    .from("project_sections")
    .update({ position: vicina.position })
    .eq("id", corrente.id);
  const b = await supabase
    .from("project_sections")
    .update({ position: corrente.position })
    .eq("id", vicina.id);
  if (a.error || b.error) return spiega(a.error ?? b.error, "Spostamento");

  await rinfresca(projectId);
  return undefined;
}

export async function deleteSection(_: Esito, formData: FormData): Promise<Esito> {
  if (!(await isSuperAdmin())) return NON_AUTORIZZATO;
  const id = testo(formData, "id");
  const projectId = testo(formData, "project_id");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_sections")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) return spiega(error, "Eliminazione");
  if (!data?.length) return nessunaRiga("Eliminazione");

  await rinfresca(projectId);
  return undefined;
}
