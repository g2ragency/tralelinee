"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExpandLogo } from "./ExpandLogo";
import { VoceMenu } from "./VoceMenu";
import { ThemeSwitch } from "@/components/ThemeToggle";
import { createClient } from "@/lib/supabase/client";

/*
  Header: logo espandibile + menu inline sopra il breakpoint xl,
  hamburger + overlay a tutto schermo sotto (Figma menu mobile 1:559).
  Nota: nel menu mobile la voce Capabilities è etichettata "Servizi".
*/
const NAV_ITEMS = [
  { label: "Chi siamo", mobileLabel: "Chi siamo", href: "#chi-siamo" },
  { label: "Metodo", mobileLabel: "Metodo", href: "#metodo" },
  { label: "Capabilities", mobileLabel: "Servizi", href: "#capabilities" },
  { label: "Contatti", mobileLabel: "Contatti", href: "#contatti" },
];

/*
  Stato di sessione letto lato client: così il layout resta statico e la
  homepage non diventa dinamica solo per mostrare un link.
  `null` = ancora sconosciuto, per non far lampeggiare la voce sbagliata.
*/
function useLoggato() {
  const [loggato, setLoggato] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return; // Supabase non configurato: nessun link di accesso
    supabase.auth.getUser().then(({ data }) => setLoggato(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setLoggato(!!session?.user),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  return loggato;
}

/*
  Voce attiva = la sezione che sta attraversando la metà dello schermo.
  Il margine negativo al 50% riduce l'area osservata a una riga sottile a
  metà finestra: una sezione «interseca» solo mentre la taglia.
  Non si azzera quando nessuna la taglia — fra una sezione e l'altra (per
  esempio le voci del Metodo, che non hanno una voce di menu) resta accesa
  l'ultima, invece di lampeggiare.
*/
function useSezioneAttiva(attivo: boolean) {
  const [sezione, setSezione] = useState<string | null>(null);

  useEffect(() => {
    if (!attivo) return;
    const sezioni = NAV_ITEMS.map((i) => document.querySelector(i.href)).filter(
      (el): el is Element => !!el,
    );
    if (sezioni.length === 0) return;

    const io = new IntersectionObserver(
      (voci) => {
        for (const v of voci) {
          if (v.isIntersecting) setSezione(`#${v.target.id}`);
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    sezioni.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [attivo]);

  // Fuori dalla home il valore si deriva, non si azzera: azzerarlo dentro
  // l'effetto costringerebbe a un secondo giro di render.
  return attivo ? sezione : null;
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const loggato = useLoggato();
  const pathname = usePathname();
  const inHome = pathname === "/";
  const sezione = useSezioneAttiva(inHome);
  const areaAttiva = !inHome && /^\/(portfolio|admin)/.test(pathname);

  /*
    Le voci del menu puntano a sezioni della home. Da un'altra pagina un
    «#metodo» da solo cerca quell'ancora nella pagina corrente, dove non
    esiste, e il clic non porta da nessuna parte: fuori dalla home diventa
    «/#metodo», cioè vai alla home e poi scendi a quella sezione.
  */
  const indirizzo = (href: string) => (inHome ? href : `/${href}`);

  // Blocca lo scroll del body quando il menu è aperto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    /* Figma mobile: padding 18px 10px */
    <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-[10px] py-[18px] xl:px-10 xl:py-5">
      {/*
        Velo sfumato: scende oltre l'header e si dissolve, così il testo della
        pagina che scorre sotto non entra in collisione col menu. Parte dal
        colore di sfondo e non dal nero, altrimenti sul tema chiaro comparirebbe
        una fascia scura in cima.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[180%] bg-gradient-to-b from-background to-transparent"
      />

      <ExpandLogo />

      {/* Menu desktop */}
      <nav className="hidden xl:block" aria-label="Principale">
        {/* Voci menu: Diatype Medium 18px, interlinea 100%, spaziatura -2% */}
        <ul className="flex items-center gap-[30px] text-[18px] font-medium leading-none tracking-[-0.36px]">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <VoceMenu
                href={indirizzo(item.href)}
                attiva={sezione === item.href}
              >
                {item.label}
              </VoceMenu>
            </li>
          ))}
          {/* Accesso: mostrato solo a stato noto, per non lampeggiare */}
          {loggato !== null && (
            <li className="border-l border-grey/40 pl-[30px]">
              <VoceMenu
                href={loggato ? "/portfolio" : "/login"}
                attiva={areaAttiva}
              >
                {loggato ? "Area riservata" : "Accedi"}
              </VoceMenu>
            </li>
          )}
        </ul>
      </nav>

      {/* Hamburger mobile */}
      {/* Figma: 25×20, tre righe da 2px distanziate 4px. Il bersaglio
          tattile è allargato col padding e riassorbito col margine
          negativo: 25×20 sono pochi per un dito. */}
      <button
        type="button"
        className="-m-3 box-content flex h-[20px] w-[25px] flex-col justify-center gap-[4px] p-3 xl:hidden"
        aria-label="Apri menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(true)}
      >
        <span className="h-[2px] w-full bg-current" />
        <span className="h-[2px] w-full bg-current" />
        <span className="h-[2px] w-full bg-current" />
      </button>

      {/* Overlay mobile: sempre montato, scorre da destra */}
      <nav
        className={`fixed inset-0 z-50 flex flex-col bg-background text-foreground transition-transform duration-500 ease-out xl:hidden ${menuOpen ? "translate-x-0" : "pointer-events-none translate-x-full"}`}
        aria-label="Menu mobile"
        aria-hidden={!menuOpen}
      >
          <div className="flex items-center justify-between px-5 py-5">
            <ExpandLogo />
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center"
              aria-label="Chiudi menu"
              onClick={() => setMenuOpen(false)}
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
                <path
                  d="M4 4l16 16M20 4L4 20"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
              </svg>
            </button>
          </div>

          <ul className="mt-[100px] px-5">
            {NAV_ITEMS.map((item) => (
              <li key={item.href} className="border-t border-grey/40 last:border-b">
                <a
                  href={indirizzo(item.href)}
                  onClick={() => setMenuOpen(false)}
                  className="block py-2 text-[36px] font-light leading-[61px] tracking-[-1.44px]"
                >
                  {item.mobileLabel}
                </a>
              </li>
            ))}
            {loggato !== null && (
              <li className="border-t border-grey/40 last:border-b">
                <Link
                  href={loggato ? "/portfolio" : "/login"}
                  onClick={() => setMenuOpen(false)}
                  className="block py-2 text-[36px] font-light leading-[61px] tracking-[-1.44px]"
                >
                  {loggato ? "Area riservata" : "Accedi"}
                </Link>
              </li>
            )}
          </ul>

          <div className="mt-auto px-5 pb-8">
            <ThemeSwitch />
          </div>
      </nav>
    </header>
  );
}
