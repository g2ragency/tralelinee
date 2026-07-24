import Link from "next/link";

/*
  Footer: logo gigante "| T | L | L |" (da sostituire con l'SVG esportato
  dal Figma), copyright e Privacy Policy. Area a cursore bianco forzato.
*/
export function Footer() {
  return (
    <footer className="flex flex-col gap-10 bg-black px-6 py-16 text-white xl:px-12">
      <p className="text-center text-[18vw] leading-none tracking-tight">
        | T | L | L |
      </p>
      <div className="flex flex-col items-center justify-between gap-4 font-mono text-xs uppercase tracking-widest sm:flex-row">
        <p>©2025 Tra le linee All Rights Reserved</p>
        <Link href="/privacy-policy" className="hoverable">
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}
