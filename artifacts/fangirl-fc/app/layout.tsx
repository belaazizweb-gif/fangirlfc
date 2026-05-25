/**
 * Root layout — html / body / global providers and fonts only.
 *
 * The Fangirl navigation shell (header, TopNav, footer) lives in
 * app/(main)/layout.tsx so that /creator can be a completely isolated
 * fullscreen editor with no Fangirl chrome.
 */
import type { Metadata, Viewport } from "next";
import { Playfair_Display, Dancing_Script } from "next/font/google";
import "./globals.css";
import { ToastHost } from "@/components/ToastHost";
import { AuthProvider } from "@/components/AuthProvider";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

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
          <ServiceWorkerRegister />
          <ToastHost />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
