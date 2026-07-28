"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile, isSuperAdmin } from "@/lib/auth";

/*
  Azioni dell'area admin. Il controllo qui è una cortesia per l'interfaccia:
  la barriera vera sono le RLS — se un utente normale invocasse queste azioni,
  il database rifiuterebbe comunque la scrittura.
*/
async function assertAdmin() {
  if (!(await isSuperAdmin())) throw new Error("Non autorizzato");
}

export async function setApproved(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id"));
  const approved = formData.get("approved") === "true";

  // Non lasciamo che l'admin revochi sé stesso e si chiuda fuori.
  const me = await getProfile();
  if (me?.id === id && !approved) return;

  const supabase = await createClient();
  await supabase.from("profiles").update({ approved }).eq("id", id);
  revalidatePath("/admin");
}

export async function addToWhitelist(formData: FormData) {
  await assertAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return;

  const supabase = await createClient();
  await supabase.from("approved_emails").upsert({ email });

  // Se quell'utente si è già registrato ed è in attesa, approvalo subito:
  // il trigger vale solo alla registrazione.
  await supabase.from("profiles").update({ approved: true }).eq("email", email);
  revalidatePath("/admin");
}

export async function removeFromWhitelist(formData: FormData) {
  await assertAdmin();
  const email = String(formData.get("email") ?? "");
  const supabase = await createClient();
  await supabase.from("approved_emails").delete().eq("email", email);
  revalidatePath("/admin");
}
