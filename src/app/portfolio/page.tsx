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
    /* 90px sotto l'header, che è alto ~91px su desktop e ~72px su mobile */
    <main className="min-h-svh px-6 pb-32 pt-[162px] xl:px-10 xl:pt-[181px]">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-4">
        {/*
          Le tre voci sono quelle del Figma. Per ora sono un'indicazione, non
          un filtro: i progetti non hanno una categoria in banca dati, quindi
          filtrare vorrebbe dire prima aggiungere il campo.
          Figma: 30px Regular, interlinea 120%, spaziatura -4%.
        */}
        <p className="text-[22px] leading-[1.2] tracking-[-0.04em] text-grey xl:text-[30px]">
          <span className="text-foreground underline">Tutti i progetti</span>,
          Portfolio, Case Studies
        </p>

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
      </div>

      {progetti.length === 0 ? (
        <p className="mt-16 text-[18px] tracking-[-0.72px] text-grey">
          Nessun progetto pubblicato al momento.
        </p>
      ) : (
        /* Figma: 60px sotto la riga, 20px fra le colonne, ~44px fra le righe */
        <ul className="mt-[60px] grid gap-x-[20px] gap-y-[44px] xl:grid-cols-2">
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
                    className="aspect-[4/3] w-full rounded-[20px] object-cover"
                  />
                ) : (
                  <div className="aspect-[4/3] w-full rounded-[20px] bg-box" />
                )}
                {/* 8px fra copertina e cliente, poi il titolo attaccato.
                    Senza cliente resta una riga vuota, così i titoli di due
                    schede affiancate restano sulla stessa linea. */}
                <p className="mt-2 text-[18px] leading-[1.2] tracking-[-0.04em] text-grey">
                  {p.client ?? " "}
                </p>
                <h2 className="text-[24px] leading-[1.2] tracking-[-0.04em] xl:text-[30px]">
                  {p.title}
                </h2>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
