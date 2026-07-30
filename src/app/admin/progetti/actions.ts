"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSuperAdmin } from "@/lib/auth";
import { sanitizeContent } from "@/lib/sanitize";
import { richTextFields } from "@/lib/sections/registry";

/*
  Azioni del builder. I controlli qui servono all'interfaccia: la barriera
  vera sono le RLS, che rifiuterebbero la scrittura anche se queste azioni
  venissero invocate da un utente normale.
*/
async function assertAdmin() {
  if (!(await isSuperAdmin())) throw new Error("Non autorizzato");
}

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

// ===========================================================================
// Progetti
// ===========================================================================

export async function createProject(formData: FormData) {
  await assertAdmin();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

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

  const { data: creato } = await supabase
    .from("projects")
    .insert({ title, slug, position: (ultimo?.position ?? 0) + 1 })
    .select("id")
    .single();

  revalidatePath("/admin/progetti");
  if (creato) redirect(`/admin/progetti/${creato.id}`);
}

export async function updateProject(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id"));
  const title = String(formData.get("title") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "")) || undefined;
  if (!id || !title) return;

  const supabase = await createClient();
  await supabase
    .from("projects")
    .update({
      title,
      slug,
      client: String(formData.get("client") ?? "").trim() || null,
      year: String(formData.get("year") ?? "").trim() || null,
      industry: String(formData.get("industry") ?? "").trim() || null,
      services: String(formData.get("services") ?? "").trim() || null,
      summary: String(formData.get("summary") ?? "").trim() || null,
    })
    .eq("id", id);

  revalidatePath(`/admin/progetti/${id}`);
  revalidatePath("/portfolio");
}

export async function setPublished(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id"));
  const published = formData.get("published") === "true";

  const supabase = await createClient();
  await supabase.from("projects").update({ published }).eq("id", id);

  revalidatePath("/admin/progetti");
  revalidatePath(`/admin/progetti/${id}`);
  revalidatePath("/portfolio");
}

export async function setCover(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id"));
  const path = String(formData.get("cover_path") ?? "").trim() || null;

  const supabase = await createClient();
  await supabase.from("projects").update({ cover_path: path }).eq("id", id);

  revalidatePath(`/admin/progetti/${id}`);
  revalidatePath("/portfolio");
}

export async function deleteProject(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id"));

  const supabase = await createClient();
  // Le sezioni cadono per ON DELETE CASCADE.
  await supabase.from("projects").delete().eq("id", id);

  revalidatePath("/admin/progetti");
  revalidatePath("/portfolio");
  redirect("/admin/progetti");
}

// ===========================================================================
// Sezioni
// ===========================================================================

export async function addSection(formData: FormData) {
  await assertAdmin();
  const projectId = String(formData.get("project_id"));
  const kind = String(formData.get("kind") ?? "").trim();
  if (!projectId || !kind) return;

  const supabase = await createClient();
  const { data: ultima } = await supabase
    .from("project_sections")
    .select("position")
    .eq("project_id", projectId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  await supabase.from("project_sections").insert({
    project_id: projectId,
    kind,
    position: (ultima?.position ?? 0) + 1,
  });

  revalidatePath(`/admin/progetti/${projectId}`);
}

export async function updateSection(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id"));
  const projectId = String(formData.get("project_id"));
  const kind = String(formData.get("kind"));
  if (!id) return;

  // Tutti i campi tranne quelli di servizio finiscono nel content.
  const riservati = new Set(["id", "project_id", "kind"]);
  const content: Record<string, unknown> = {};
  for (const [k, v] of formData.entries()) {
    if (!riservati.has(k)) content[k] = typeof v === "string" ? v : String(v);
  }

  // Unico punto in cui l'HTML entra in archivio: qui va sanificato.
  const pulito = sanitizeContent(content, richTextFields(kind));

  const supabase = await createClient();
  await supabase
    .from("project_sections")
    .update({ content: pulito })
    .eq("id", id);

  revalidatePath(`/admin/progetti/${projectId}`);
  revalidatePath("/portfolio");
}

export async function setSectionVisible(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id"));
  const projectId = String(formData.get("project_id"));
  const visible = formData.get("visible") === "true";

  const supabase = await createClient();
  await supabase.from("project_sections").update({ visible }).eq("id", id);

  revalidatePath(`/admin/progetti/${projectId}`);
  revalidatePath("/portfolio");
}

export async function moveSection(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id"));
  const projectId = String(formData.get("project_id"));
  const su = formData.get("direction") === "up";

  const supabase = await createClient();
  const { data: corrente } = await supabase
    .from("project_sections")
    .select("id, position")
    .eq("id", id)
    .single();
  if (!corrente) return;

  // La vicina nella direzione richiesta: si scambiano le posizioni.
  const { data: vicina } = await supabase
    .from("project_sections")
    .select("id, position")
    .eq("project_id", projectId)
    [su ? "lt" : "gt"]("position", corrente.position)
    .order("position", { ascending: !su })
    .limit(1)
    .maybeSingle();
  if (!vicina) return;

  await supabase
    .from("project_sections")
    .update({ position: vicina.position })
    .eq("id", corrente.id);
  await supabase
    .from("project_sections")
    .update({ position: corrente.position })
    .eq("id", vicina.id);

  revalidatePath(`/admin/progetti/${projectId}`);
  revalidatePath("/portfolio");
}

export async function deleteSection(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id"));
  const projectId = String(formData.get("project_id"));

  const supabase = await createClient();
  await supabase.from("project_sections").delete().eq("id", id);

  revalidatePath(`/admin/progetti/${projectId}`);
  revalidatePath("/portfolio");
}
