import Link from "next/link";
import { Mail } from "lucide-react";

export const metadata = {
  title: "Support — Fangirl FC",
};

const FAQ = [
  {
    q: "How do I create a fan card?",
    a: "Go to Creator, choose a template, upload a photo, customise your card, then use the download or export button to save it.",
  },
  {
    q: "How does background removal work?",
    a: "Background removal runs entirely in your browser using client-side AI. The first time you use it, it may need to download AI model data before processing begins.",
  },
  {
    q: "Why does background removal take time the first time?",
    a: "The browser needs to download the AI model data before it can process your image. This only happens once. After that, it runs from your browser's cache.",
  },
  {
    q: "Does Fangirl FC upload my image?",
    a: "Card creation images are processed in your browser and are not intentionally uploaded to Fangirl FC servers for the creator flow. Your photo stays on your device.",
  },
  {
    q: "How do I download or export my card?",
    a: "Use the export or download button inside the creator. If it does not work, try Chrome, make sure your browser is up to date, or try clearing site storage and trying again.",
  },
  {
    q: "Is Fangirl FC official?",
    a: "No. Fangirl FC is fan-made and is not affiliated with FIFA, EA, EA SPORTS FC, UEFA, any football federation, club, league, or sponsor.",
  },
  {
    q: "How do I delete my local saved data?",
    a: "Clear browser site data for fangirlfc.live through your browser's settings (Settings → Privacy → Clear browsing data, or similar). This will remove all locally saved progress, cards, and identity data.",
  },
  {
    q: "How do I delete my account and cloud data?",
    a: "Send an email to fangirlfc2026@gmail.com with the subject line 'Account Deletion Request' and include your registered email address or user ID. We will process your request within 30 days.",
  },
  {
    q: "How do I contact the team?",
    a: "Email us at fangirlfc2026@gmail.com. We aim to respond within a few business days.",
  },
];

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-[#0d0d1a] text-white">
      <div className="mx-auto max-w-2xl px-5 py-10">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-[12px] text-white/40 hover:text-white/70 transition"
        >
          ← Back to Fangirl FC
        </Link>

        <h1 className="text-3xl font-black tracking-tight">Support</h1>
        <p className="mt-2 text-[13px] text-white/50">
          We&apos;re here to help.
        </p>

        <a
          href="mailto:fangirlfc2026@gmail.com"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-pink-400/30 bg-pink-400/10 px-5 py-2.5 text-[13px] font-semibold text-pink-200 transition hover:bg-pink-400/20"
        >
          <Mail className="h-3.5 w-3.5" />
          fangirlfc2026@gmail.com
        </a>

        <h2 className="mt-10 text-[18px] font-bold">Frequently Asked Questions</h2>

        <div className="mt-4 flex flex-col gap-5">
          {FAQ.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/10 bg-white/4 p-5"
            >
              <p className="text-[14px] font-bold text-white">{item.q}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-white/65">{item.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-4 border-t border-white/10 pt-6 text-[12px] text-white/40">
          <Link href="/about" className="hover:text-white/70 transition">About</Link>
          <Link href="/contact" className="hover:text-white/70 transition">Contact</Link>
          <Link href="/privacy" className="hover:text-white/70 transition">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white/70 transition">Terms of Service</Link>
          <Link href="/delete-account" className="hover:text-white/70 transition">Delete Account</Link>
          <Link href="/creator" className="hover:text-white/70 transition">Creator</Link>
          <Link href="/" className="hover:text-white/70 transition">Home</Link>
        </div>
      </div>
    </main>
  );
}
