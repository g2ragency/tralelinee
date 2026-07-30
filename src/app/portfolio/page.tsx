import { redirect } from "next/navigation";
import Link from "next/link";
import { getProfile, getUser } from "@/lib/auth";
import { logout } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { signedUrls } from "@/lib/media";

export const metadata = { title: "Portfolio — Tra le linee" };

type Progetto = {
  id: string;
  slug: string;
  title: string;
  client: string | null;
  summary: string | null;
  cover_path: string | null;
};

export default async function PortfolioPage() {
  // Distinzione importante: "non loggato" e "profilo non leggibile" sono due
  // casi diversi. Trattarli entrambi con un redirect al login creava un
  // rimbalzo infinito quando la sessione c'era ma la riga profiles no.
  const user = await getUser();
  if (!user) redirect("/login?next=/portfolio");

  const profile = await getProfile();
  if (!profile) {
    return (
      <main className="flex min-h-svh items-center px-6 py-32 xl:px-10">
        <div className="max-w-[720px]">
          <h1 className="text-[40px] leading-[1.02] tracking-[-1.6px]">
            Profilo non trovato
          </h1>
          <p className="mt-6 text-[18px] leading-[1.02] tracking-[-0.72px] text-grey">
            Sei autenticato come {user.email}, ma non riusciamo a leggere il tuo
            profilo. Segnalacelo: è un problema di configurazione, non tuo.
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
  // Le RLS filtrano già: gli approvati vedono solo i pubblicati, l'admin tutto.
  const { data } = await supabase
    .from("projects")
    .select("id, slug, title, client, summary, cover_path")
    .order("position");
  const progetti = (data as Progetto[] | null) ?? [];
  const covers = await signedUrls(progetti.map((p) => p.cover_path));

  return (
    <main className="min-h-svh px-6 py-32 xl:px-10">
      <div className="flex flex-wrap items-start justify-between gap-6">
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
              Amministrazione
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

      {progetti.length === 0 ? (
        <p className="mt-16 text-[18px] tracking-[-0.72px] text-grey">
          Nessun progetto pubblicato al momento.
        </p>
      ) : (
        <ul className="mt-20 grid gap-12 xl:grid-cols-2">
          {progetti.map((p, i) => (
            <li key={p.id}>
              <Link href={`/portfolio/${p.slug}`} className="hoverable block">
                {covers[i] ? (
                  /* eslint-disable-next-line @next/next/no-img-element --
                     URL firmato a scadenza: next/image lo rifirmerebbe e
                     scadrebbe in cache. */
                  <img
                    src={covers[i]!}
                    alt=""
                    className="aspect-[4/3] w-full object-cover"
                  />
                ) : (
                  <div className="aspect-[4/3] w-full border border-grey/40" />
                )}
                <h2 className="mt-5 text-[30px] leading-[0.933] tracking-[-1.2px]">
                  {p.title}
                </h2>
                {p.client && (
                  <p className="mt-2 text-[18px] tracking-[-0.72px] text-grey">
                    {p.client}
                  </p>
                )}
                {p.summary && (
                  <p className="mt-3 max-w-[520px] text-[18px] leading-[1.02] tracking-[-0.72px] text-grey2">
                    {p.summary}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
