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
