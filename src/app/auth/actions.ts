"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string };

/*
  Server Action: girano solo sul server, quindi le credenziali non passano
  mai dal bundle client.
*/

/*
  Un errore di RETE non è una password sbagliata.

  Se il database non risponde, `signInWithPassword` fallisce come fallirebbe
  con le credenziali errate — e rispondere «Email o password non corretti»
  manda la persona a cambiarsi una password che era giusta. È successo: il
  progetto Supabase è diventato irraggiungibile e il sito continuava a dare
  la colpa a chi provava a entrare.

  Il messaggio sulle credenziali resta volutamente generico — non diciamo se
  l'indirizzo esista — ma solo quando è davvero quello il problema.
*/
function reteCaduta(error: { message?: string; status?: number }) {
  const testo = (error.message ?? "").toLowerCase();
  return (
    testo.includes("fetch failed") ||
    testo.includes("failed to fetch") ||
    testo.includes("network") ||
    error.status === 0 ||
    (error.status ?? 0) >= 500
  );
}

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Inserisci email e password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (reteCaduta(error)) {
      console.error("[login] database irraggiungibile", {
        status: error.status,
        message: error.message,
      });
      return {
        error:
          "Non riusciamo a raggiungere il servizio in questo momento. Non è la tua password: riprova fra poco.",
      };
    }
    // Volutamente generico: non riveliamo se l'email esiste.
    return { error: "Email o password non corretti." };
  }

  /*
    Dal 25/11/2026 l'unico accesso è quello dell'amministrazione: il portfolio
    è aperto e i visitatori non hanno più un account. Chi si era registrato
    prima ha ancora le credenziali, ma qui non entra: la sessione appena
    aperta si chiude subito, così non resta loggato a metà.
  */
  const { data: utente } = await supabase.auth.getUser();
  const { data: profilo } = utente.user
    ? await supabase.from("profiles").select("role").eq("id", utente.user.id).maybeSingle()
    : { data: null };
  if (profilo?.role !== "super_admin") {
    await supabase.auth.signOut();
    return { error: "Questo accesso è riservato all'amministrazione del sito." };
  }

  revalidatePath("/", "layout");
  redirect("/admin");
}

/*
  Recupero password, primo tempo: si chiede l'email e Supabase manda un link.

  Il messaggio è lo stesso che l'indirizzo esista o no, ed è voluto: dire
  «questa email non risulta» trasformerebbe la pagina in uno strumento per
  scoprire chi ha accesso al portfolio.
*/
export async function richiediRecupero(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Inserisci la tua email." };

  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm`,
  });

  return {
    message:
      "Se quell'indirizzo ha un accesso, ti abbiamo mandato il link per scegliere una nuova password.",
  };
}

/*
  Secondo tempo: si arriva qui dal link, quindi con una sessione già aperta da
  `/auth/confirm`. Senza quella sessione l'aggiornamento fallisce, ed è la
  ragione per cui non serve chiedere di nuovo la password vecchia.
*/
export async function impostaPassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8)
    return { error: "La password deve avere almeno 8 caratteri." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error)
    return {
      error:
        "Il link non è più valido. Richiedi di nuovo il recupero della password.",
    };

  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
