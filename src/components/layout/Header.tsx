"use client";

import { useState } from "react";
import { ExpandLogo } from "./ExpandLogo";

const NAV_ITEMS = [
  { label: "Chi siamo", href: "#chi-siamo" },
  { label: "Metodo", href: "#metodo" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "Contatti", href: "#contatti" },
];

/*
  Header: logo espandibile + menu inline sopra il breakpoint xl,
  hamburger + overlay sotto (come il sito live).
*/
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-5 xl:px-12">
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
        aria-label={menuOpen ? "Chiudi menu" : "Apri menu"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span className="h-px w-6 bg-current" />
        <span className="h-px w-6 bg-current" />
      </button>

      {/* Offcanvas mobile */}
      {menuOpen && (
        <nav
          className="fixed inset-0 z-50 flex flex-col bg-background text-foreground xl:hidden"
          aria-label="Menu mobile"
        >
          <div className="flex items-center justify-between px-6 py-5">
            <ExpandLogo />
            <button
              type="button"
              className="hoverable h-10 w-10 text-2xl"
              aria-label="Chiudi menu"
              onClick={() => setMenuOpen(false)}
            >
              ×
            </button>
          </div>
          <ul className="flex flex-1 flex-col justify-center gap-8 px-6 text-3xl">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a href={item.href} onClick={() => setMenuOpen(false)}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
