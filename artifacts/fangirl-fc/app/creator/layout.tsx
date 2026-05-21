/**
 * Creator route layout — fullscreen standalone editor.
 *
 * After the route-group refactor the root layout (app/layout.tsx) is minimal
 * (html/body/providers only) so there is no Fangirl nav to fight against.
 * This layout simply gives the creator a true full-viewport canvas.
 */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créateur de cartes — Fangirl FC",
};

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-dvh overflow-hidden bg-[#0b0613]">
      {children}
    </div>
  );
}
