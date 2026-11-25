import { createClient } from "@/lib/supabase/server";
import { immaginiFirmate } from "@/lib/media";
import { ElencoProgetti } from "@/components/portfolio/ElencoProgetti";

export const metadata = { title: "Portfolio — Tra le linee" };

type Progetto = {
  id: string;
  slug: string;
  title: string;
  client: string | null;
  category: string | null;
  cover_path: string | null;
  hover_path: string | null;
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
  // Aperto a tutti dal 25/11/2026 (Veronika): niente più account.
  const supabase = await createClient();
  /*
    Solo i pubblicati, anche per il super admin: le RLS gli lascerebbero
    vedere le bozze, e nell'elenco si confondevano coi progetti veri (due
    «Ex Machina», uno con la copertina vuota — 23/11). Le bozze si guardano
    dall'admin, col bottone Anteprima.
  */
  const { data } = await supabase
    .from("projects")
    .select("id, slug, title, client, cover_path, hover_path, category")
    .eq("published", true)
    .order("position");
  const progetti = (data as Progetto[] | null) ?? [];

  // Un filtro senza progetti non si mostra (oggi nessun case study pubblicato).
  const categorie = CATEGORIE.filter(
    (c) => !c.chiave || progetti.some((p) => p.category === c.chiave),
  );
  // Solo valori dell'elenco: uno inventato nell'indirizzo vale come «tutti».
  const { categoria } = await searchParams;
  const attiva = categorie.some((c) => c.chiave === categoria)
    ? (categoria as string)
    : "";
  const [covers, hovers] = await Promise.all([
    immaginiFirmate(progetti.map((p) => p.cover_path)),
    immaginiFirmate(progetti.map((p) => p.hover_path)),
  ]);
  /*
    Le schede arrivano tutte al client, che filtra da solo: il portfolio è un
    elenco corto e il cambio di filtro non deve passare dalla rete.
  */
  const schede = progetti.map((p, i) => ({
    ...p,
    cover: covers[i]?.src ?? null,
    coverSet: covers[i]?.srcSet ?? null,
    hover: hovers[i]?.src ?? null,
    hoverSet: hovers[i]?.srcSet ?? null,
  }));

  return (
    /* Sotto l'header — alto 58px su mobile e 70px su desktop — 50px su
       mobile e 90px da desktop. Padding laterale come nel resto del sito. */
    <main className="min-h-svh px-[10px] pb-32 pt-[108px] xl:px-10 xl:pt-[160px]">
      <ElencoProgetti
        schede={schede}
        categorie={categorie}
        iniziale={attiva}
      />
    </main>
  );
}
