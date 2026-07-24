"use client";

import { useEffect, useState } from "react";
import { ExpandLogo } from "./ExpandLogo";
import { useTheme } from "@/components/providers/ThemeProvider";

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

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Blocca lo scroll del body quando il menu è aperto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-5 xl:px-10">
      <ExpandLogo />

      {/* Menu desktop */}
      <nav className="hidden xl:block" aria-label="Principale">
        <ul className="flex items-center gap-10 font-mono text-sm uppercase tracking-widest">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a href={item.href} className="hoverable">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Hamburger mobile */}
      <button
        type="button"
        className="hoverable flex h-10 w-10 flex-col items-center justify-center gap-1.5 xl:hidden"
        aria-label="Apri menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(true)}
      >
        <span className="h-px w-6 bg-current" />
        <span className="h-px w-6 bg-current" />
      </button>

      {/* Overlay mobile a tutto schermo */}
      {menuOpen && (
        <nav
          className="fixed inset-0 z-50 flex flex-col bg-background text-foreground xl:hidden"
          aria-label="Menu mobile"
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
          </ul>

          <div className="mt-auto px-5 pb-8">
            <ThemePill />
          </div>
        </nav>
      )}
    </header>
  );
}
