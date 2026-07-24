import Link from "next/link";

/*
  Footer: logo gigante "| T | L | L |" vettoriale (SVG esportato dal Figma,
  Frame 9 di 1230:2206, fill currentColor per seguire il tema), copyright
  e Privacy Policy. Nel Figma light il footer si inverte come il resto
  della pagina: niente colori forzati.
*/
export function Footer() {
  return (
    <footer className="flex flex-col gap-10 px-6 py-16 xl:px-10">
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
      <div className="flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-widest sm:text-xs">
        <p>©2025 Tra le linee All Rights Reserved</p>
        <Link href="/privacy-policy" className="hoverable">
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}
