import { redirect } from "next/navigation";
import Link from "next/link";
import { getProfile, getUser } from "@/lib/auth";
import { logout } from "@/app/auth/actions";

export const metadata = { title: "Account — Tra le linee" };

/*
  Account: chi sei, come esci, e la porta per l'amministrazione se ti spetta.

  Sta qui e non in cima all'elenco del portfolio perche' sono due cose
  diverse: l'elenco e' contenuto, questi sono comandi sul proprio accesso — e
  averli in una voce di menu li rende raggiungibili da ogni pagina invece che
  da una sola.
*/
export default async function AccountPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/account");
  const profile = await getProfile();

  return (
    <main className="min-h-svh px-[10px] pb-32 pt-[108px] xl:px-10 xl:pt-[160px]">
      <h1 className="text-[40px] leading-none tracking-[-1.6px] xl:text-[52px] xl:tracking-[-2.08px]">
        Account
      </h1>

      <dl className="mt-12 text-[18px] leading-[1.2] tracking-[-0.04em]">
        <dt className="text-grey">Email</dt>
        <dd>{profile?.email ?? user.email}</dd>
        <dt className="mt-6 text-grey">Accesso al portfolio</dt>
        <dd>
          {profile?.approved
            ? "Attivo"
            : "In attesa di approvazione: ti scriveremo appena e' pronto."}
        </dd>
      </dl>

      <div className="mt-16 flex flex-wrap items-center gap-4">
        <Link
          href="/portfolio"
          className="rounded-[10px] border border-foreground px-5 py-3 text-[18px] leading-none tracking-[-0.04em]"
        >
          Vai al portfolio
        </Link>
        {profile?.role === "super_admin" && (
          <Link
            href="/admin"
            className="rounded-[10px] border border-grey px-5 py-3 text-[18px] leading-none tracking-[-0.04em] text-grey"
          >
            Amministrazione
          </Link>
        )}
        <form action={logout}>
          <button
            type="submit"
            className="rounded-[10px] px-5 py-3 text-[18px] leading-none tracking-[-0.04em] text-grey underline underline-offset-[6px]"
          >
            Esci
          </button>
        </form>
      </div>
    </main>
  );
}
