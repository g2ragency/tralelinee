import Link from "next/link";

/*
  Logo «| T | L | L |». Statico: c'era un'animazione che apriva le lettere al
  passaggio del mouse (T→TRA, L→LE, L→INEE), tolta su richiesta del cliente.
*/
const LETTERE = ["T", "L", "L"];

/* `compatto`: versione per le pagine di accesso, dove il logo sta al centro
   della finestra e non nell'header. */
export function Logo({ compatto }: { compatto?: boolean }) {
  const barra = compatto ? "px-[9px]" : "px-[5px] xl:px-[8px]";

  return (
    <Link
      href="/"
      /* Figma: 85×22 su mobile, 126×30 da desktop. leading fissa l'altezza del
         riquadro, che altrimenti dipenderebbe dall'interlinea del font. */
      className={`flex items-baseline font-medium tracking-tight ${
        compatto
          ? "text-[26px] leading-none"
          : "text-[17px] leading-[22px] xl:text-[24px] xl:leading-[30px]"
      }`}
      aria-label="Tra le linee — home"
    >
      {LETTERE.map((lettera, i) => (
        <span key={i} className="flex items-baseline">
          <span className={barra}>|</span>
          <span>{lettera}</span>
        </span>
      ))}
      <span className={barra}>|</span>
    </Link>
  );
}
