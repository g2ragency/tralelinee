import { signup } from "@/app/auth/actions";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata = { title: "Richiedi portfolio — Tra le linee" };

export default function RegistratiPage() {
  return (
    <AuthShell>
      <AuthForm
        action={signup}
        titolo="Richiedi accesso al portfolio"
        cta="Invia richiesta"
        altroTesto="Hai già un accesso?"
        altroLink="/login"
        altroLabel="Accedi"
      />
    </AuthShell>
  );
}
