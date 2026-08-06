import { redirect } from "next/navigation";
import Link from "next/link";
import { getProfile, getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  setApproved,
  setSuperAdmin,
  addToWhitelist,
  removeFromWhitelist,
} from "@/app/admin/actions";
import { BottoneInvio } from "@/components/admin/BottoneInvio";

export const metadata = { title: "Accessi — Tra le linee" };

type Riga = {
  id: string;
  email: string;
  role: "user" | "super_admin";
  approved: boolean;
  created_at: string;
};

export default async function AccessiPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/admin/accessi");
  const me = await getProfile();
  if (!me) redirect("/portfolio");
  if (me.role !== "super_admin") redirect("/portfolio");

  const supabase = await createClient();
  const [{ data: utenti }, { data: whitelist }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, role, approved, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("approved_emails")
      .select("email, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const inAttesa = (utenti as Riga[] | null)?.filter((u) => !u.approved) ?? [];
  const approvati = (utenti as Riga[] | null)?.filter((u) => u.approved) ?? [];

  return (
    <main className="min-h-svh px-6 py-32 xl:px-10">
      <Link href="/admin" className="text-[16px] text-grey">
        ← Area riservata
      </Link>
      <h1 className="mt-6 text-[40px] leading-[1.02] tracking-[-1.6px] xl:text-[52px] xl:tracking-[-2.08px]">
        Gestione accessi
      </h1>

      <section className="mt-16">
        <h2 className="text-[30px] tracking-[-1.2px]">
          In attesa di approvazione{" "}
          <span className="text-grey">({inAttesa.length})</span>
        </h2>
        {inAttesa.length === 0 ? (
          <p className="mt-4 text-[18px] tracking-[-0.72px] text-grey">
            Nessuna richiesta in sospeso.
          </p>
        ) : (
          <ul className="mt-6 border-t border-grey/40">
            {inAttesa.map((u) => (
              <li
                key={u.id}
                className="flex items-center justify-between gap-6 border-b border-grey/40 py-4"
              >
                <span className="text-[18px] tracking-[-0.72px]">
                  {u.email}
                </span>
                <form action={setApproved}>
                  <input type="hidden" name="id" value={u.id} />
                  <input type="hidden" name="approved" value="true" />
                  <BottoneInvio
                    className="border border-foreground px-4 py-2 text-[16px]"
                  >
                    Approva
                  </BottoneInvio>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-16">
        <h2 className="text-[30px] tracking-[-1.2px]">
          Approvati <span className="text-grey">({approvati.length})</span>
        </h2>
        <ul className="mt-6 border-t border-grey/40">
          {approvati.map((u) => (
            <li
              key={u.id}
              className="flex items-center justify-between gap-6 border-b border-grey/40 py-4"
            >
              <span className="text-[18px] tracking-[-0.72px]">
                {u.email}
                {u.role === "super_admin" && (
                  <span className="ml-3 text-[14px] text-grey">super admin</span>
                )}
              </span>
              {/* Su sé stessi niente comandi: né togliersi l'accesso né
                  togliersi il ruolo, altrimenti ci si chiude fuori. */}
              {u.id !== me.id && (
                <div className="flex shrink-0 items-center gap-3">
                  <form action={setSuperAdmin}>
                    <input type="hidden" name="id" value={u.id} />
                    <input
                      type="hidden"
                      name="super_admin"
                      value={u.role === "super_admin" ? "false" : "true"}
                    />
                    <BottoneInvio
                      domanda={
                        u.role === "super_admin"
                          ? `Togliere a ${u.email} il ruolo di super admin? Manterrà l'accesso al portfolio, ma non potrà più modificare i progetti.`
                          : `Nominare ${u.email} super admin?\n\nPotrà creare, modificare e ELIMINARE qualsiasi progetto, approvare o revocare utenti e nominare altri super admin.\n\nDaglielo solo se ti fidi come ti fidi di te stesso.`
                      }
                      className="border border-grey px-4 py-2 text-[16px] text-grey"
                    >
                      {u.role === "super_admin"
                        ? "Rimuovi super admin"
                        : "Nomina super admin"}
                    </BottoneInvio>
                  </form>
                  <form action={setApproved}>
                    <input type="hidden" name="id" value={u.id} />
                    <input type="hidden" name="approved" value="false" />
                    <BottoneInvio
                      className="border border-grey px-4 py-2 text-[16px] text-grey"
                    >
                      Revoca
                    </BottoneInvio>
                  </form>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16 max-w-[720px]">
        <h2 className="text-[30px] tracking-[-1.2px]">
          Email pre-autorizzate{" "}
          <span className="text-grey">({whitelist?.length ?? 0})</span>
        </h2>
        <p className="mt-3 text-[18px] leading-[1.02] tracking-[-0.72px] text-grey">
          Chi si registra con una di queste email viene approvato
          automaticamente.
        </p>

        <form action={addToWhitelist} className="mt-6 flex gap-3">
          <input
            type="email"
            name="email"
            required
            placeholder="nome@azienda.it"
            className="flex-1 border border-grey bg-transparent px-4 py-2 text-[18px] outline-none focus:border-foreground"
          />
          <BottoneInvio
            className="border border-foreground px-5 py-2 text-[16px]"
          >
            Aggiungi
          </BottoneInvio>
        </form>

        <ul className="mt-6 border-t border-grey/40">
          {whitelist?.map((w) => (
            <li
              key={w.email}
              className="flex items-center justify-between gap-6 border-b border-grey/40 py-3"
            >
              <span className="text-[18px] tracking-[-0.72px] text-grey">
                {w.email}
              </span>
              <form action={removeFromWhitelist}>
                <input type="hidden" name="email" value={w.email} />
                <BottoneInvio
                  className="text-[16px] text-grey underline"
                >
                  Rimuovi
                </BottoneInvio>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
