import { login } from "@/app/auth/actions";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthShell } from "@/components/auth/AuthShell";

/*
  Accesso all'amministrazione. Dal 25/11/2026 è l'unico login del sito: il
  portfolio è aperto e i visitatori non hanno più un account. Nessun link
  porta qui dal sito pubblico; ci si arriva da /admin, che rimanda qui a chi
  non è entrato. Fuori dai motori di ricerca.
*/
export const metadata = {
  title: "Accesso amministrazione — Tra le linee",
  robots: { index: false, follow: false },
};

export default function AccessoAdminPage() {
  return (
    <AuthShell>
      <AuthForm
        action={login}
        titolo="Accesso amministrazione"
        cta="Accedi"
        conRecupero
      />
    </AuthShell>
  );
}
