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
export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Inserisci email e password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  // Messaggio volutamente generico: non riveliamo se l'email esiste.
  if (error) return { error: "Email o password non corretti." };

  revalidatePath("/", "layout");
  redirect("/portfolio");
}

export async function signup(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Inserisci email e password." };
  if (password.length < 8)
    return { error: "La password deve avere almeno 8 caratteri." };

  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/confirm` },
  });

  if (error) return { error: "Registrazione non riuscita. Riprova." };

  return {
    message:
      "Ti abbiamo inviato una email di conferma. Dopo averla confermata, la richiesta passa in approvazione.",
  };
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
  redirect("/portfolio");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
