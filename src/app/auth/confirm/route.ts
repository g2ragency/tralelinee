import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/*
  Atterraggio dei link che Supabase manda per email. Arrivano token_hash +
  type: li scambiamo per una sessione e poi si smista.

  Conferma dell'email: al portfolio, dove si vede lo stato della richiesta.
  Recupero password: alla pagina per sceglierne una nuova — la sessione appena
  aperta è proprio quella che le permette di salvarla.
*/
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) redirect(type === "recovery" ? "/nuova-password" : "/portfolio");
  }

  redirect("/login?errore=conferma");
}
