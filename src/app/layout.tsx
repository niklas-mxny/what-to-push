import type { Metadata } from "next";
import { Baloo_2, Inter } from "next/font/google";
import { NavBar } from "@/components/NavBar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "What to Push — Brawl Stars Tracker",
  description:
    "Maßgeschneiderte Brawler-Empfehlungen für die aktuelle Map-Rotation, basierend auf deinen eigenen Stats und Zielen.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`${inter.variable} ${baloo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <NavBar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
        <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-2 sm:px-6">
          Nicht offiziell mit Supercell verbunden. Erstellt unter der Supercell Fan Content Policy.
        </footer>
      </body>
    </html>
  );
}
