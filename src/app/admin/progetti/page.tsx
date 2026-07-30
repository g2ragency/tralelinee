import { redirect } from "next/navigation";
import Link from "next/link";
import { getProfile, getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createProject, setPublished } from "./actions";

export const metadata = { title: "Progetti — Tra le linee" };

type Progetto = {
  id: string;
  slug: string;
  title: string;
  client: string | null;
  published: boolean;
  updated_at: string;
};

export default async function ProgettiPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/admin/progetti");
  const me = await getProfile();
  if (!me) redirect("/portfolio");
  if (me.role !== "super_admin") redirect("/portfolio");

  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("id, slug, title, client, published, updated_at")
    .order("position");
  const progetti = (data as Progetto[] | null) ?? [];

  return (
    <main className="min-h-svh px-6 py-32 xl:px-10">
      <Link href="/admin" className="hoverable text-[16px] text-grey">
        ← Area riservata
      </Link>
      <h1 className="mt-6 text-[40px] leading-[1.02] tracking-[-1.6px] xl:text-[52px] xl:tracking-[-2.08px]">
        Progetti
      </h1>

      <form action={createProject} className="mt-10 flex max-w-[720px] gap-3">
        <input
          type="text"
          name="title"
          required
          placeholder="Titolo del nuovo progetto"
          className="flex-1 border border-grey bg-transparent px-4 py-2 text-[18px] outline-none focus:border-foreground"
        />
        <button
          type="submit"
          className="hoverable border border-foreground px-5 py-2 text-[16px]"
        >
          Crea
        </button>
      </form>

      {progetti.length === 0 ? (
        <p className="mt-16 text-[18px] tracking-[-0.72px] text-grey">
          Nessun progetto. Creane uno per iniziare.
        </p>
      ) : (
        <ul className="mt-12 border-t border-grey/40">
          {progetti.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-4 border-b border-grey/40 py-4"
            >
              <div>
                <Link
                  href={`/admin/progetti/${p.id}`}
                  className="hoverable text-[24px] tracking-[-0.96px]"
                >
                  {p.title}
                </Link>
                <p className="mt-1 text-[16px] text-grey">
                  {p.client ? `${p.client} · ` : ""}/{p.slug}
                  {!p.published && (
                    <span className="ml-3 border border-grey/60 px-2 py-0.5 text-[13px]">
                      bozza
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <form action={setPublished}>
                  <input type="hidden" name="id" value={p.id} />
                  <input
                    type="hidden"
                    name="published"
                    value={p.published ? "false" : "true"}
                  />
                  <button
                    type="submit"
                    className="hoverable border border-grey px-4 py-2 text-[16px] text-grey"
                  >
                    {p.published ? "Ritira" : "Pubblica"}
                  </button>
                </form>
                <Link
                  href={`/admin/progetti/${p.id}`}
                  className="hoverable border border-foreground px-4 py-2 text-[16px]"
                >
                  Modifica
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
