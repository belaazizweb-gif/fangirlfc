import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Playfair_Display, Dancing_Script } from "next/font/google";
import "./globals.css";
import { ToastHost } from "@/components/ToastHost";
import { TopNav } from "@/components/TopNav";
import { AuthProvider } from "@/components/AuthProvider";
import { UserButton } from "@/components/UserButton";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

const dancing = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing",
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fangirl FC — Which World Cup fan are you?",
  description:
    "Take the quiz, unlock your fan identity, and create your Fangirl FC card.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  applicationName: "Fangirl FC",
  appleWebApp: {
    capable: true,
    title: "Fangirl FC",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "Fangirl FC",
    description:
      "Take the quiz, unlock your fan identity, and create your Fangirl FC card.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0613",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${dancing.variable}`}>
      <body>
        <AuthProvider>
          <ToastHost />
          <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pt-6 pb-10">
            <header className="flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center gap-2 text-sm font-bold tracking-tight"
              >
                <span className="text-lg">⚽</span>
                <span className="gradient-text text-base font-extrabold">
                  Fangirl FC
                </span>
              </Link>
              <div className="flex items-center gap-2">
                <Link
                  href="/quiz"
                  className="rounded-full bg-pink-400/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-pink-100 hover:bg-pink-400/30"
                >
                  Take quiz
                </Link>
                <UserButton />
              </div>
            </header>
            <TopNav />
            <main className="mt-5 flex-1">{children}</main>
            <footer className="mt-10 text-center text-[11px] leading-relaxed text-white/40">
              Fangirl FC is an independent fan-made experience and is not
              affiliated with FIFA, teams, leagues, or sponsors.
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
