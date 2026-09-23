import type { Metadata } from "next";
import { Baloo_2, Inter } from "next/font/google";
import { BrawlerDetailsProvider } from "@/components/BrawlerDetails";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import { AuthProvider } from "@/lib/auth-context";
import { FavoritesProvider } from "@/lib/favorites-context";
import { I18nProvider } from "@/lib/i18n";
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
    "Personalized brawler recommendations for the current map rotation, based on your own stats and goals.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${baloo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <I18nProvider>
          <AuthProvider>
            <FavoritesProvider>
              <BrawlerDetailsProvider>
                <NavBar />
                <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
                <Footer />
              </BrawlerDetailsProvider>
            </FavoritesProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
