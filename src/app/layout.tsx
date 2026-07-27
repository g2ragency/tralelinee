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
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

/*
  ABC Diatype — file "Trial" presi dal tema WP del sito live (stessi che
  tralelinee.com serve oggi in produzione). ⚠️ Licenza da regolarizzare
  (HANDOFF §Decisioni APERTE): quando arriva, basta sostituire i woff.
*/
const diatype = localFont({
  variable: "--font-diatype",
  src: [
    { path: "../fonts/ABCDiatype-Light-Trial.woff", weight: "300" },
    { path: "../fonts/ABCDiatype-Regular-Trial.woff", weight: "400" },
    { path: "../fonts/ABCDiatype-Medium-Trial.woff", weight: "500" },
    { path: "../fonts/ABCDiatype-Bold-Trial.woff", weight: "700" },
    { path: "../fonts/ABCDiatype-Heavy-Trial.woff", weight: "800" },
  ],
  fallback: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Tra le linee",
  description:
    "Agenzia di comunicazione cross mediale e interdisciplinare specializzata in sistemi di influenza integrati.",
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
            <Header />
            {children}
            <Footer />
            <ThemeToggle />
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
