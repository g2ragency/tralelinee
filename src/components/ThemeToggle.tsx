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
      /* Lo sfondo non è decorativo: senza, il pulsante è trasparente e il
         logo gigante del footer gli passa dietro restando visibile dentro la
         cornice. Sta già sopra a tutto, era il vuoto a ingannare. */
      /* right-10 come il padding laterale del sito: a 24px il pulsante
         sbordava di 16px oltre il filo di tutto il resto. */
      className="fixed bottom-10 right-10 z-30 hidden border border-current bg-background px-5 py-2 text-[16px] font-bold transition-colors duration-300 xl:block"
      aria-label="Cambia tema"
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
