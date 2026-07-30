import { login } from "@/app/auth/actions";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata = { title: "Accedi — Tra le linee" };

export default function LoginPage() {
  return (
    <AuthShell>
      <AuthForm
        action={login}
        titolo="Accedi per visualizzare il portfolio"
        cta="Accedi"
        altroTesto="Non hai ancora un accesso?"
        altroLink="/registrati"
        altroLabel="Richiedi il portfolio"
      />
    </AuthShell>
  );
}
