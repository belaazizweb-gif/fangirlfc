import Link from "next/link";

export const metadata = {
  title: "About — Fangirl FC",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0d0d1a] text-white">
      <div className="mx-auto max-w-2xl px-5 py-10">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-[12px] text-white/40 hover:text-white/70 transition"
        >
          ← Back to Fangirl FC
        </Link>

        <h1 className="text-3xl font-black tracking-tight">About Fangirl FC</h1>
        <p className="mt-2 text-[13px] text-white/50">A fan-made football experience for World Cup 2026</p>

        <div className="mt-8 flex flex-col gap-8 text-[14px] leading-relaxed text-white/75">

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">What is Fangirl FC?</h2>
            <p>
              Fangirl FC is a fan-made football app created to celebrate the passion, personality,
              and creativity of football fans around the world. It is built for World Cup 2026 and
              designed as a personal football experience — not a sports news platform or official
              football product.
            </p>
            <p className="mt-2">
              Fangirl FC is made by fans, for fans. It is independent and not affiliated with
              any football organisation, club, league, or governing body.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">The two modules</h2>

            <div className="mt-3 rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/5 p-5">
              <p className="text-[15px] font-bold text-white">⚽ FC Card Creator</p>
              <p className="mt-1.5 text-white/65">
                Create your own personal football fan card. Upload a photo, remove the background
                with browser-based AI, choose a template, customise your identity, and export your
                card to share on social media. Card creation runs entirely in your browser — your
                photo is never uploaded to Fangirl FC servers.
              </p>
              <Link
                href="/creator"
                className="mt-3 inline-block rounded-full bg-fuchsia-500/20 px-4 py-1.5 text-[12px] font-semibold text-fuchsia-200 hover:bg-fuchsia-500/30 transition"
              >
                Open Creator →
              </Link>
            </div>

            <div className="mt-3 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5">
              <p className="text-[15px] font-bold text-white">🏆 Fangirl FC</p>
              <p className="mt-1.5 text-white/65">
                Discover your football fan identity through quizzes, mini-games, challenges, and
                a leaderboard. Earn official stars, pick your team, and compete with fans worldwide
                during World Cup 2026. Sign in with Google to save your progress and appear on the
                global ranking.
              </p>
              <Link
                href="/quiz"
                className="mt-3 inline-block rounded-full bg-violet-500/20 px-4 py-1.5 text-[12px] font-semibold text-violet-200 hover:bg-violet-500/30 transition"
              >
                Take the quiz →
              </Link>
            </div>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">Privacy-first card creation</h2>
            <p>
              The FC Card Creator is designed with privacy in mind. Background removal and card
              rendering happen entirely inside your browser using client-side AI (Apache-2.0
              licensed models). Your photos are never sent to Fangirl FC servers during the
              creation process. You export your own card from your own device.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">Unofficial disclaimer</h2>
            <p>
              Fangirl FC is a fan-made app and is not affiliated with FIFA, EA, EA SPORTS FC,
              UEFA, any football federation, club, league, or sponsor. All team names, flags,
              and tournament references are used in a fan context for identification purposes only.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">Contact us</h2>
            <p>
              Questions, feedback, or support requests — email us at{" "}
              <a href="mailto:support@fangirlfc.live" className="text-pink-300 underline">
                support@fangirlfc.live
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 border-t border-white/10 pt-6 text-[12px] text-white/40">
          <Link href="/privacy" className="hover:text-white/70 transition">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white/70 transition">Terms of Service</Link>
          <Link href="/support" className="hover:text-white/70 transition">Support</Link>
          <Link href="/contact" className="hover:text-white/70 transition">Contact</Link>
          <Link href="/" className="hover:text-white/70 transition">Home</Link>
        </div>
      </div>
    </main>
  );
}
