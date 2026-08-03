import Link from "next/link";

/*
  Footer: logo gigante "| T | L | L |" vettoriale (SVG esportato dal Figma,
  Frame 9 di 1230:2206, fill currentColor per seguire il tema), copyright
  e Privacy Policy. Nel Figma light il footer si inverte come il resto
  della pagina: niente colori forzati.

  Spaziature dal Figma 1230:2206: 509px tra indirizzo e logo (349 qui + 160
  di padding della sezione Contatti), 34px tra logo e copyright. Il pb è più
  generoso del Figma (21px) per non far finire il bottone tema sticky sopra
  "Privacy Policy".
*/
export function Footer() {
  return (
    <footer className="flex flex-col gap-10 px-[10px] pb-16 pt-16 xl:gap-[34px] xl:px-10 xl:pb-20 xl:pt-[349px]">
      <svg
        viewBox="0 0 1360 328"
        fill="currentColor"
        className="h-auto w-full"
        role="img"
        aria-label="Tra le linee"
      >
        <path d="M31 0H0V328H31V0Z" />
        <path d="M474 0H443V328H474V0Z" />
        <path d="M917 0H886V328H917V0Z" />
        <path d="M1360 0H1329V328H1360V0Z" />
        <path d="M154 91.6363H221.685V267H252.581V91.6363H320V64H154V91.6363Z" />
        <path d="M1087.17 236.228V60H1056V264H1190V236.228H1087.17Z" />
        <path d="M644.132 60H613V264H747V236.228H644.132V60Z" />
      </svg>
      {/* Diatype Medium 14px, lh 93.3%, ls -4% (Figma 1230:2279/2280) */}
      <div className="flex items-center justify-between gap-4 text-[14px] font-medium leading-[0.933] tracking-[-0.56px]">
        <p>©2025 Tra le linee All Rights Reserved</p>
        <Link href="/privacy-policy" className="hoverable">
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}
