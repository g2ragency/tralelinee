import { redirect } from "next/navigation";
import Link from "next/link";
import { getProfile, getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";

export const metadata = { title: "Admin — Tra le linee" };

export default async function AdminPage() {
  // Sessione assente => login. Profilo illeggibile => portfolio, che spiega
  // il problema: mai rimbalzare al login con una sessione valida.
  const user = await getUser();
  if (!user) redirect("/login?next=/admin");
  const me = await getProfile();
  if (!me) redirect("/portfolio");
  if (me.role !== "super_admin") redirect("/portfolio");

  const supabase = await createClient();
  const [{ count: daApprovare }, { count: progetti }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("approved", false),
    supabase.from("projects").select("id", { count: "exact", head: true }),
  ]);

  const voci = [
    {
      href: "/admin/accessi",
      titolo: "Gestione accessi",
      testo: "Approva le richieste, revoca accessi, gestisci le email pre-autorizzate.",
      badge: daApprovare ? `${daApprovare} in attesa` : null,
    },
    {
      href: "/admin/progetti",
      titolo: "Progetti",
      testo: "Crea e modifica i progetti del portfolio e i loro case study.",
      badge: progetti ? `${progetti}` : null,
    },
  ];

  return (
    <main className="min-h-svh px-6 py-32 xl:px-10">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-[24px] font-medium leading-[0.933] tracking-[-0.72px] text-label">
            Area riservata
          </p>
          <h1 className="mt-6 text-[40px] leading-[1.02] tracking-[-1.6px] xl:text-[52px] xl:tracking-[-2.08px]">
            Amministrazione
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/portfolio"
            className="border border-grey px-5 py-3 text-[18px] tracking-[-0.72px]"
          >
            Portfolio
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="border border-foreground px-5 py-3 text-[18px] tracking-[-0.72px]"
            >
              Esci
            </button>
          </form>
        </div>
      </div>

      <ul className="mt-20 grid gap-6 xl:grid-cols-2">
        {voci.map((v) => (
          <li key={v.href}>
            <Link
              href={v.href}
              className="block border border-grey/40 p-8 transition-colors hover:border-foreground"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-[30px] tracking-[-1.2px]">{v.titolo}</h2>
                {v.badge && (
                  <span className="text-[16px] text-grey">{v.badge}</span>
                )}
              </div>
              <p className="mt-3 text-[18px] leading-[1.02] tracking-[-0.72px] text-grey">
                {v.testo}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
