import { richiediRecupero } from "@/app/auth/actions";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata = {
  title: "Recupera password — Tra le linee",
  robots: { index: false, follow: false },
};

export default function RecuperaPasswordPage() {
  return (
    <AuthShell>
      <AuthForm
        action={richiediRecupero}
        titolo="Recupera la tua password"
        cta="Invia il link"
        campi="email"
        altroTesto="Ti è tornata in mente?"
        altroLink="/admin/accesso"
        altroLabel="Torna all'accesso"
      />
    </AuthShell>
  );
}
