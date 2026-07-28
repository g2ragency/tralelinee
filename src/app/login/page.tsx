import { login } from "@/app/auth/actions";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = { title: "Accedi — Tra le linee" };

export default function LoginPage() {
  return (
    <main className="flex min-h-svh items-center px-6 py-32 xl:px-10">
      <AuthForm
        action={login}
        titolo="Accedi"
        cta="Entra"
        altroTesto="Non hai ancora un accesso?"
        altroLink="/registrati"
        altroLabel="Richiedi il portfolio"
      />
    </main>
  );
}
