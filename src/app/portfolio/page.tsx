import { redirect } from "next/navigation";
import Link from "next/link";
import { getProfile, getUser } from "@/lib/auth";
import { logout } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { signedUrls } from "@/lib/media";
import { ElencoProgetti } from "@/components/portfolio/ElencoProgetti";

export const metadata = { title: "Portfolio — Tra le linee" };

type Progetto = {
  id: string;
  slug: string;
  title: string;
  client: string | null;
  category: string | null;
  cover_path: string | null;
};

/*
  Filtri dell'elenco. La chiave vuota è «tutti»: non finisce nell'indirizzo,
  così /portfolio resta l'indirizzo canonico della pagina senza doppioni.
*/
const CATEGORIE = [
  { chiave: "", label: "Tutti i progetti" },
  { chiave: "portfolio", label: "Portfolio" },
  { chiave: "case_study", label: "Case Studies" },
];

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
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
            Ti scriveremo a {profile.email} appena il portfolio sarà disponibile
            per il tuo account.
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

  // Solo valori dell'elenco: uno inventato nell'indirizzo vale come «tutti».
  const { categoria } = await searchParams;
  const attiva = CATEGORIE.some((c) => c.chiave === categoria)
    ? (categoria as string)
    : "";

  const supabase = await createClient();
  // Le RLS filtrano già: gli approvati vedono solo i pubblicati, l'admin tutto.
  const { data } = await supabase
    .from("projects")
    .select("id, slug, title, client, cover_path, category")
    .order("position");
  const progetti = (data as Progetto[] | null) ?? [];
  const covers = await signedUrls(progetti.map((p) => p.cover_path));
  /*
    Le schede arrivano tutte al client, che filtra da solo: il portfolio è un
    elenco corto e il cambio di filtro non deve passare dalla rete.
  */
  const schede = progetti.map((p, i) => ({ ...p, cover: covers[i] ?? null }));

  return (
    /* 90px sotto l'header, che è alto ~91px su desktop e ~72px su mobile */
    <main className="min-h-svh px-6 pb-32 pt-[162px] xl:px-10 xl:pt-[181px]">
      <ElencoProgetti
        schede={schede}
        categorie={CATEGORIE}
        iniziale={attiva}
        azioni={
          <div className="flex items-center gap-5 text-[16px] tracking-[-0.04em] text-grey">
            {profile.role === "super_admin" && (
              <Link href="/admin" className="hoverable">
                Amministrazione
              </Link>
            )}
            <form action={logout}>
              <button type="submit" className="hoverable">
                Esci
              </button>
            </form>
          </div>
        }
      />
    </main>
  );
}
