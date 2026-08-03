"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExpandLogo } from "./ExpandLogo";
import { useTheme } from "@/components/providers/ThemeProvider";
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

/* Toggle tema a pillola (Figma 1:561/1:560): knob a sinistra = dark. */
function ThemePill() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Cambia tema"
      className="hoverable relative h-[42px] w-[75px] rounded-full border border-foreground"
    >
      <span
        className={`absolute top-1/2 h-[31px] w-[31px] -translate-y-1/2 rounded-full bg-foreground transition-[left] duration-300 ${isDark ? "left-[5px]" : "left-[39px]"}`}
      />
    </button>
  );
}

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

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const loggato = useLoggato();

  // Blocca lo scroll del body quando il menu è aperto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    /* Figma mobile: padding 10px 18px */
    <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-[18px] py-[10px] xl:px-10 xl:py-5">
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
              <a href={item.href} className="hoverable">
                {item.label}
              </a>
            </li>
          ))}
          {/* Accesso: mostrato solo a stato noto, per non lampeggiare */}
          {loggato !== null && (
            <li className="border-l border-grey/40 pl-[30px]">
              <Link
                href={loggato ? "/portfolio" : "/login"}
                className="hoverable"
              >
                {loggato ? "Area riservata" : "Accedi"}
              </Link>
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
        className="hoverable -m-3 box-content flex h-[20px] w-[25px] flex-col justify-center gap-[4px] p-3 xl:hidden"
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
              className="hoverable flex h-8 w-8 items-center justify-center"
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
                  href={item.href}
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
            <ThemePill />
          </div>
      </nav>
    </header>
  );
}
