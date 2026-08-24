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

  revalidatePath("/", "layout");
  redirect("/portfolio");
}

/*
  Perché la registrazione può fallire, detto per davvero.

  Prima rispondeva sempre «Registrazione non riuscita. Riprova.»: chi la
  leggeva non poteva farci niente e chi doveva ripararla non sapeva da dove
  partire. I motivi veri sono pochi e nessuno è un segreto — l'unica cosa che
  non va rivelata è se un indirizzo è già registrato, e a quella pensa già
  Supabase, che in quel caso risponde come se fosse andata bene.

  Il motivo finisce anche nei log del server: a schermo ci sta una frase, nei
  log ci sta il codice, e sono due pubblici diversi.
*/
function perche(error: { message?: string; code?: string; status?: number }) {
  const codice = error.code ?? "";
  const testo = (error.message ?? "").toLowerCase();

  if (codice === "over_email_send_rate_limit" || error.status === 429)
    return "Troppi tentativi in poco tempo. Riprova fra un'ora.";
  if (codice === "weak_password" || testo.includes("password"))
    return "Password troppo debole: usa almeno 8 caratteri, meglio se lunga.";
  if (codice === "email_address_invalid" || testo.includes("invalid email"))
    return "Questo indirizzo email non sembra valido.";
  if (testo.includes("signups not allowed") || testo.includes("disabled"))
    return "Le registrazioni sono chiuse al momento.";
  if (testo.includes("database error"))
    return "Non siamo riusciti a creare l'account. Segnalacelo: è un problema nostro, non tuo.";
  return "Registrazione non riuscita: " + (error.message ?? "motivo sconosciuto");
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

  if (error) {
    console.error("[signup] fallita", {
      code: error.code,
      status: error.status,
      message: error.message,
    });
    return { error: perche(error) };
  }

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
