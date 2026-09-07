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
  /*
    Chi non e' entrato NON viene rimbalzato al login: la voce «Portfolio» sta
    nel menu ed e' visibile a tutti, quindi qui ci si arriva di proposito. Un
    rimbalzo lascerebbe su una pagina di accesso senza spiegare perche'; qui
    invece si dice cosa manca e si danno le due strade per ottenerlo.
  */
  const user = await getUser();
  if (!user) return <Cancello />;

  const profile = await getProfile();
  if (!profile) {
    return (
      <main className="flex min-h-svh items-center px-[10px] py-32 xl:px-10">
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
              className="border border-foreground px-5 py-3 text-[18px] tracking-[-0.72px]"
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
      <main className="flex min-h-svh items-center px-[10px] py-32 xl:px-10">
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
              className="border border-foreground px-5 py-3 text-[18px] tracking-[-0.72px]"
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
    /* Sotto l'header — alto 58px su mobile e 70px su desktop — 50px su
       mobile e 90px da desktop. Padding laterale come nel resto del sito. */
    <main className="min-h-svh px-[10px] pb-32 pt-[108px] xl:px-10 xl:pt-[160px]">
      <ElencoProgetti
        schede={schede}
        categorie={CATEGORIE}
        iniziale={attiva}
      />
    </main>
  );
}

/*
  Invito ad accedere. Stesse misure della pagina: chi arriva deve avere la
  sensazione di essere ARRIVATO da qualche parte, non di essere stato fermato.
*/
function Cancello() {
  return (
    <main className="flex min-h-svh flex-col justify-center px-[10px] pb-32 pt-[108px] xl:px-10 xl:pt-[160px]">
      <h1 className="max-w-[760px] text-[34px] leading-none tracking-[-0.04em] xl:text-[52px]">
        Devi accedere per vedere il portfolio
      </h1>
      <p className="mt-6 max-w-[560px] text-[18px] leading-[1.2] tracking-[-0.04em] text-grey xl:text-[24px]">
        I progetti sono riservati: l&rsquo;accesso si richiede una volta e vale
        per sempre.
      </p>
      <div className="mt-12 flex flex-wrap items-center gap-4">
        <Link
          href="/login"
          className="rounded-[10px] border border-foreground px-6 py-3 text-[18px] leading-none tracking-[-0.04em] xl:text-[24px]"
        >
          Accedi
        </Link>
        <Link
          href="/registrati"
          className="rounded-[10px] border border-grey px-6 py-3 text-[18px] leading-none tracking-[-0.04em] text-grey xl:text-[24px]"
        >
          Richiedi il portfolio
        </Link>
      </div>
    </main>
  );
}
