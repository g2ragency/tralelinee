import { redirect } from "next/navigation";
import Link from "next/link";
import { getProfile } from "@/lib/auth";
import { logout } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Portfolio — Tra le linee" };

/*
  Pagina riservata. Il proxy ha già escluso chi non ha sessione; qui si
  controlla l'approvazione. La difesa vera resta comunque RLS: un non
  approvato che arrivasse fin qui riceverebbe zero righe dal database.
*/
export default async function PortfolioPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login?next=/portfolio");

  if (!profile.approved) {
    return (
      <main className="flex min-h-svh items-center px-6 py-32 xl:px-10">
        <div className="max-w-[720px]">
          <p className="text-[24px] font-medium leading-[0.933] tracking-[-0.72px] text-label">
            Richiesta ricevuta
          </p>
          <h1 className="mt-6 text-[40px] leading-[1.02] tracking-[-1.6px] xl:text-[52px] xl:tracking-[-2.08px]">
            La tua richiesta è in attesa di approvazione.
          </h1>
          <p className="mt-6 text-[18px] leading-[1.02] tracking-[-0.72px] text-grey">
            Ti scriveremo a {profile.email} appena il portfolio sarà
            disponibile per il tuo account.
          </p>
          <form action={logout} className="mt-10">
            <button
              type="submit"
              className="hoverable border border-foreground px-5 py-3 text-[18px] tracking-[-0.72px]"
            >
              Esci
            </button>
          </form>
        </div>
      </main>
    );
  }

  const supabase = await createClient();
  const { data: sezioni } = await supabase
    .from("portfolio_sections")
    .select("id, kind, content")
    .eq("visible", true)
    .order("position");

  return (
    <main className="min-h-svh px-6 py-32 xl:px-10">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-[24px] font-medium leading-[0.933] tracking-[-0.72px] text-label">
            Portfolio
          </p>
          <h1 className="mt-6 max-w-[900px] text-[40px] leading-[1.02] tracking-[-1.6px] xl:text-[52px] xl:tracking-[-2.08px]">
            I nostri lavori
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {profile.role === "super_admin" && (
            <Link
              href="/admin"
              className="hoverable border border-grey px-5 py-3 text-[18px] tracking-[-0.72px]"
            >
              Gestione accessi
            </Link>
          )}
          <form action={logout}>
            <button
              type="submit"
              className="hoverable border border-foreground px-5 py-3 text-[18px] tracking-[-0.72px]"
            >
              Esci
            </button>
          </form>
        </div>
      </div>

      {!sezioni?.length ? (
        <p className="mt-16 text-[18px] tracking-[-0.72px] text-grey">
          Nessun contenuto pubblicato al momento.
        </p>
      ) : (
        <div className="mt-16 flex flex-col gap-16">
          {sezioni.map((s) => (
            <section key={s.id}>
              <pre className="whitespace-pre-wrap text-[16px] text-grey">
                {JSON.stringify(s.content, null, 2)}
              </pre>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
