"use client";

import { useTheme } from "@/components/providers/ThemeProvider";

/*
  Interruttore del tema.

  Figma: base 70×40 raggio 30, padding interno 4, pallino 32×32 — la corsa è
  quindi 70 − 4·2 − 32 = 30px, e i conti tornano da soli.

  Il pallino si sposta con `translate` e non con `left`: è la proprietà che il
  browser anima senza rifare il calcolo del layout a ogni fotogramma. Attenzione
  al nome: Tailwind v4 per `translate-x-*` scrive `translate` e lascia
  `transform: none`, quindi animare `transform` non muove niente e il pallino
  si teletrasporta.

  I colori li cambia il tema, in dissolvenza. La base riusa il token dei
  riquadri (#1B1B1B da scuro, #efefef da chiaro, cioè il grigio chiaro): è già
  quello che regge tutte le superfici del sito, e un colore in meno da tenere
  allineato a mano. Il pallino ha il suo, sempre un gradino più chiaro della
  base.

  La sfocatura dietro è nel design ma non si vede finché la base resta piena:
  serve un fondo con un po' di trasparenza perché abbia qualcosa da sfocare.
*/
export function ThemeSwitch({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Cambia tema"
      aria-pressed={isDark}
      className={
        "h-[40px] w-[70px] rounded-[30px] bg-box p-[4px] backdrop-blur-[4px] transition-colors duration-300 " +
        (className ?? "")
      }
    >
      <span
        className={
          "block h-[32px] w-[32px] rounded-full bg-[var(--switch-knob)] transition-[translate,background-color] duration-300 ease-out motion-reduce:transition-none " +
          (isDark ? "translate-x-[30px]" : "translate-x-0")
        }
      />
    </button>
  );
}

/*
  Lo stesso interruttore, fissato in basso a destra da desktop (richiesta
  cliente). Da mobile non compare qui: sta in fondo al menu.

  right-10/bottom-10 come il padding laterale del sito: a 24px sbordava di
  16px oltre il filo di tutto il resto.
*/
export function ThemeToggle() {
  return <ThemeSwitch className="fixed bottom-10 right-10 z-30 hidden xl:block" />;
}
