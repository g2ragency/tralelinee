import { signup } from "@/app/auth/actions";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = { title: "Richiedi portfolio — Tra le linee" };

export default function RegistratiPage() {
  return (
    <main className="flex min-h-svh items-center px-6 py-32 xl:px-10">
      <AuthForm
        action={signup}
        titolo="Richiedi portfolio"
        cta="Invia richiesta"
        altroTesto="Hai già un accesso?"
        altroLink="/login"
        altroLabel="Accedi"
      />
    </main>
  );
}
