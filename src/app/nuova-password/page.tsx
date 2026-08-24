import { impostaPassword } from "@/app/auth/actions";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata = { title: "Nuova password — Tra le linee" };

/*
  Si arriva qui solo dal link di recupero: è `/auth/confirm` ad aprire la
  sessione e a mandare qui. Chi ci capita senza quella sessione compila e si
  vede dire che il link non è più valido, che è esattamente la verità.
*/
export default function NuovaPasswordPage() {
  return (
    <AuthShell>
      <AuthForm
        action={impostaPassword}
        titolo="Scegli una nuova password"
        cta="Salva la password"
        campi="password"
        nuovaPassword
        altroTesto="Hai cambiato idea?"
        altroLink="/login"
        altroLabel="Torna all'accesso"
      />
    </AuthShell>
  );
}
