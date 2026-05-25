import Link from "next/link";
import { ArrowRight, Wand2, Sparkles, Camera, Trophy, Brain, Crosshair } from "lucide-react";

export default function Page() {
  return (
    <div className="flex flex-col gap-8">

      {/* ── HERO ── */}
      <section className="pt-2 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/8 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-white/80 backdrop-blur">
          <Sparkles className="h-3 w-3 text-pink-300" /> World Cup 2026
        </span>
        <h1 className="mt-4 text-[28px] font-black leading-tight tracking-tight text-white">
          Choose your{" "}
          <span className="gradient-text">Fangirl FC</span>{" "}
          experience
        </h1>
        <p className="mt-2 text-[14px] leading-snug text-white/60">
          Create your football fan card or discover your fan identity.
        </p>
      </section>

      {/* ── MODULE CARDS ── */}
      <section className="flex flex-col gap-4">

        {/* Card 1 — FC Card Creator */}
        <div className="relative overflow-hidden rounded-[28px] border border-fuchsia-400/30 bg-gradient-to-br from-fuchsia-500/20 via-pink-400/10 to-rose-400/8 p-6">
          {/* background glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-fuchsia-400/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-pink-400/15 blur-2xl"
          />

          <div className="relative flex flex-col gap-5">
            {/* label + icon */}
            <div className="flex items-start justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-fuchsia-300/30 bg-fuchsia-400/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-fuchsia-200">
                <Wand2 className="h-2.5 w-2.5" /> Creator
              </span>
              <div className="flex gap-2 text-[22px] opacity-60">
                <Camera aria-hidden />
              </div>
            </div>

            {/* title + description */}
            <div>
              <h2 className="text-[24px] font-black leading-tight tracking-tight text-white">
                FC Card Creator
              </h2>
              <p className="mt-2 text-[13px] leading-snug text-white/65">
                Build your football fan card, upload your photo, remove the background, and export your design.
              </p>
            </div>

            {/* feature pills */}
            <div className="flex flex-wrap gap-1.5">
              {["Upload photo", "Remove background", "Custom template", "Export card"].map((f) => (
                <span
                  key={f}
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-white/55"
                >
                  {f}
                </span>
              ))}
            </div>

            {/* CTA */}
            <Link
              href="/creator"
              className="shine-button flex items-center justify-center gap-2 rounded-full px-6 py-4 text-[15px]"
            >
              Create My Card
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Card 2 — Fangirl FC */}
        <div className="relative overflow-hidden rounded-[28px] border border-violet-400/30 bg-gradient-to-br from-violet-500/20 via-indigo-400/10 to-purple-400/8 p-6">
          {/* background glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-violet-400/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-indigo-400/15 blur-2xl"
          />

          <div className="relative flex flex-col gap-5">
            {/* label + icons */}
            <div className="flex items-start justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-300/30 bg-violet-400/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-violet-200">
                <Sparkles className="h-2.5 w-2.5" /> Main App
              </span>
              <div className="flex gap-2 text-[22px] opacity-60">
                <Trophy aria-hidden />
              </div>
            </div>

            {/* title + description */}
            <div>
              <h2 className="text-[24px] font-black leading-tight tracking-tight text-white">
                Fangirl FC
              </h2>
              <p className="mt-2 text-[13px] leading-snug text-white/65">
                Take the quiz, discover your fan identity, play mini-games, complete challenges, and climb the rankings.
              </p>
            </div>

            {/* feature pills */}
            <div className="flex flex-wrap gap-1.5">
              {["Fan identity quiz", "Mini-games", "Challenges", "Rankings"].map((f) => (
                <span
                  key={f}
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-white/55"
                >
                  {f}
                </span>
              ))}
            </div>

            {/* secondary icons */}
            <div className="flex items-center gap-3 text-white/30">
              <Brain className="h-4 w-4" />
              <Crosshair className="h-4 w-4" />
              <span className="text-[11px] font-semibold">Football IQ · Penalty Queen · and more</span>
            </div>

            {/* CTA */}
            <Link
              href="/quiz"
              className="flex items-center justify-center gap-2 rounded-full border border-violet-400/50 bg-violet-500/20 px-6 py-4 text-[15px] font-extrabold text-violet-100 transition hover:bg-violet-500/30 active:scale-[0.98]"
            >
              Start Fangirl FC
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── ALREADY PLAYED CTA ── */}
      <section className="flex justify-center">
        <Link
          href="/fangirl"
          className="text-[11px] font-semibold text-white/30 underline-offset-2 hover:text-white/50 transition"
        >
          See the full Fangirl FC landing page →
        </Link>
      </section>

    </div>
  );
}
