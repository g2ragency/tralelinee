import type { Metadata } from "next";
import { DM_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import {
  ThemeProvider,
  themeInitScript,
} from "@/components/providers/ThemeProvider";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { CustomCursor } from "@/components/CustomCursor";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Chrome } from "@/components/layout/Chrome";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

/*
  ABC Diatype — woff2 dalla famiglia completa fornita dal cliente.
  Solo i 5 pesi in uso: next/font fa il preload di ogni faccia dichiarata,
  quindi Thin/Black/Ultra e i corsivi non vanno aggiunti finché non servono.
  ⚠️ Licenza da regolarizzare (HANDOFF §Decisioni APERTE): quando arriva,
  basta sostituire i file in src/fonts/.
*/
const diatype = localFont({
  variable: "--font-diatype",
  src: [
    { path: "../fonts/ABCDiatype-Light-Trial.woff2", weight: "300" },
    { path: "../fonts/ABCDiatype-Regular-Trial.woff2", weight: "400" },
    { path: "../fonts/ABCDiatype-Medium-Trial.woff2", weight: "500" },
    { path: "../fonts/ABCDiatype-Bold-Trial.woff2", weight: "700" },
    { path: "../fonts/ABCDiatype-Heavy-Trial.woff2", weight: "800" },
  ],
  fallback: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
});

const DESCRIZIONE =
  "Agenzia di comunicazione cross mediale e interdisciplinare specializzata in sistemi di influenza integrati.";

/*
  Metadati condivisi da tutte le pagine.

  `metadataBase` non e' un dettaglio: senza, Next scrive l'indirizzo
  dell'anteprima in forma relativa, e chi legge la pagina da fuori — WhatsApp,
  LinkedIn, Slack — non ha modo di risolverlo e non mostra nulla. Si prende
  dall'indirizzo che Vercel espone, con il dominio finale come ripiego.

  L'immagine di anteprima e' quella del sito precedente: 1080x721.
*/
const ORIGINE = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://tralelinee.com";

export const metadata: Metadata = {
  metadataBase: new URL(ORIGINE),
  title: {
    default: "Tra le linee",
    template: "%s",
  },
  description: DESCRIZIONE,
  openGraph: {
    title: "Tra le linee",
    description: DESCRIZIONE,
    siteName: "Tra le linee",
    locale: "it_IT",
    type: "website",
    images: [{ url: "/anteprima-social.jpg", width: 1080, height: 721 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tra le linee",
    description: DESCRIZIONE,
    images: ["/anteprima-social.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      data-theme="dark"
      className={`${dmMono.variable} ${diatype.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-svh antialiased">
        <ThemeProvider>
          <SmoothScroll>
            <CustomCursor />
            <Chrome>
              <Header />
            </Chrome>
            {children}
            <Chrome>
              <Footer />
            </Chrome>
            <Chrome>
              <ThemeToggle />
            </Chrome>
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
