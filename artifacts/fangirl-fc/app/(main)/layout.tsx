/**
 * Main Fangirl shell layout.
 *
 * All normal Fangirl routes (dashboard, quiz, card, penalty, …) sit inside
 * this route group and inherit the header + TopNav + footer chrome.
 *
 * /creator is intentionally NOT in this group — it has its own isolated
 * fullscreen layout under app/creator/layout.tsx.
 */
import Link from "next/link";
import { TopNav } from "@/components/TopNav";
import { UserButton } from "@/components/UserButton";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
      <footer className="mt-10 flex flex-col items-center gap-3 text-center text-[11px] leading-relaxed text-white/40">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link href="/about" className="hover:text-white/70 transition">About</Link>
          <Link href="/contact" className="hover:text-white/70 transition">Contact</Link>
          <Link href="/privacy" className="hover:text-white/70 transition">Privacy</Link>
          <Link href="/terms" className="hover:text-white/70 transition">Terms</Link>
          <Link href="/support" className="hover:text-white/70 transition">Support</Link>
          <Link href="/delete-account" className="hover:text-white/70 transition">Delete Account</Link>
        </div>
        <p>
          Fangirl FC is a fan-made app and is not affiliated with FIFA, EA, EA SPORTS FC, UEFA, any football federation, club, league, or sponsor.
        </p>
      </footer>
    </div>
  );
}
