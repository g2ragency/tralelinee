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
  revalidatePath("/admin/accessi");
}

/*
  Nomina (o revoca) un altro super admin.

  Le RLS consentono l'aggiornamento di `profiles` al solo super admin, quindi
  un utente normale non può auto-nominarsi nemmeno chiamando l'azione a mano:
  il database rifiuterebbe la scrittura. Qui il controllo serve a fermarlo
  prima, con un errore leggibile.

  Chi viene nominato è anche approvato: un super admin non approvato passerebbe
  da /admin ma verrebbe rimbalzato fuori da /portfolio, cioè un accesso a metà
  che non vuole nessuno.
*/
export async function setSuperAdmin(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id"));
  const promuovi = formData.get("super_admin") === "true";

  // Stesso principio della revoca di approvazione: non ci si toglie da soli
  // l'unico ruolo che permette di rientrare.
  const me = await getProfile();
  if (me?.id === id) return;

  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update(
      promuovi
        ? { role: "super_admin", approved: true }
        : { role: "user" },
    )
    .eq("id", id);
  revalidatePath("/admin/accessi");
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
  revalidatePath("/admin/accessi");
}

export async function removeFromWhitelist(formData: FormData) {
  await assertAdmin();
  const email = String(formData.get("email") ?? "");
  const supabase = await createClient();
  await supabase.from("approved_emails").delete().eq("email", email);
  revalidatePath("/admin/accessi");
}
