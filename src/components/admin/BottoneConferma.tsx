"use client";

/*
  Bottone di invio che chiede conferma prima di procedere.

  `confirm` del browser e non una finestra costruita a mano: è bloccante, sa
  già stare sotto tastiera e lettore di schermo, e non porta con sé stato da
  gestire. L'unico motivo per cui questo componente esiste è che la pagina è
  un Server Component e non può passare un gestore di eventi: il resto del
  form resta una `<form action={…}>` normale.
*/
export function BottoneConferma({
  domanda,
  className,
  children,
}: {
  domanda: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(domanda)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
