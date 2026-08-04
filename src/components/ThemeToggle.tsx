"use client";

import { useTheme } from "@/components/providers/ThemeProvider";

/*
  Bottone cambio palette — replica del theme switcher del sito live,
  spostato sticky in basso a destra (richiesta cliente).
  Il testo indica il tema di destinazione: "Light" quando è attivo il dark.
*/
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 z-30 hidden border border-current px-5 py-2 text-[16px] font-bold transition-colors duration-300 xl:block"
      aria-label="Cambia tema"
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
