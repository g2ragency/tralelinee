"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile, isSuperAdmin } from "@/lib/auth";
import { nessunaRiga, spiega, type Esito } from "@/lib/esito";

/*
  Azioni dell'area admin. Il controllo qui è una cortesia per l'interfaccia:
  la barriera vera sono le RLS — se un utente normale invocasse queste azioni,
  il database rifiuterebbe comunque la scrittura.
*/
const NON_AUTORIZZATO: Esito = {
  errore: "Sessione scaduta o permessi insufficienti: ricarica la pagina e rientra.",
};

export async function setApproved(_: Esito, formData: FormData): Promise<Esito> {
  if (!(await isSuperAdmin())) return NON_AUTORIZZATO;
  const id = String(formData.get("id"));
  const approved = formData.get("approved") === "true";

  // Non lasciamo che l'admin revochi sé stesso e si chiuda fuori.
  const me = await getProfile();
  if (me?.id === id && !approved)
    return { errore: "Non puoi revocare l'accesso a te stesso." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ approved })
    .eq("id", id)
    .select("id");
  if (error) return spiega(error);
  if (!data?.length) return nessunaRiga();
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
export async function setSuperAdmin(_: Esito, formData: FormData): Promise<Esito> {
  if (!(await isSuperAdmin())) return NON_AUTORIZZATO;
  const id = String(formData.get("id"));
  const promuovi = formData.get("super_admin") === "true";

  // Stesso principio della revoca di approvazione: non ci si toglie da soli
  // l'unico ruolo che permette di rientrare.
  const me = await getProfile();
  if (me?.id === id)
    return { errore: "Non puoi cambiare il tuo stesso ruolo." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update(
      promuovi
        ? { role: "super_admin", approved: true }
        : { role: "user" },
    )
    .eq("id", id)
    .select("id");
  if (error) return spiega(error);
  if (!data?.length) return nessunaRiga();
  revalidatePath("/admin/accessi");
}

export async function addToWhitelist(_: Esito, formData: FormData): Promise<Esito> {
  if (!(await isSuperAdmin())) return NON_AUTORIZZATO;
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return { errore: "Indirizzo email non valido." };

  const supabase = await createClient();
  const { error } = await supabase.from("approved_emails").upsert({ email });
  if (error) return spiega(error);

  // Se quell'utente si è già registrato ed è in attesa, approvalo subito:
  // il trigger vale solo alla registrazione.
  const r = await supabase
    .from("profiles")
    .update({ approved: true })
    .eq("email", email);
  if (r.error) return spiega(r.error);
  revalidatePath("/admin/accessi");
}

export async function removeFromWhitelist(_: Esito, formData: FormData): Promise<Esito> {
  if (!(await isSuperAdmin())) return NON_AUTORIZZATO;
  const email = String(formData.get("email") ?? "");
  const supabase = await createClient();
  const { error } = await supabase
    .from("approved_emails")
    .delete()
    .eq("email", email);
  if (error) return spiega(error, "Rimozione");
  revalidatePath("/admin/accessi");
}
