import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fangirl FC — Which World Cup fan are you?",
  description:
    "Take the quiz, unlock your fan identity, and create your Fangirl FC card.",
  manifest: "/manifest.json",
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
    <html lang="en">
      <body>
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
            <Link
              href="/stickers"
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-wider text-white/70 hover:bg-white/10"
            >
              Stickers · soon
            </Link>
          </header>
          <main className="mt-6 flex-1">{children}</main>
          <footer className="mt-10 text-center text-[11px] leading-relaxed text-white/40">
            Fangirl FC is an independent fan-made experience and is not
            affiliated with FIFA, teams, leagues, or sponsors.
          </footer>
        </div>
      </body>
    </html>
  );
}
