import Link from "next/link";

export const metadata = {
  title: "Terms of Service — Fangirl FC",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0d0d1a] text-white">
      <div className="mx-auto max-w-2xl px-5 py-10">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-[12px] text-white/40 hover:text-white/70 transition"
        >
          ← Back to Fangirl FC
        </Link>

        <h1 className="text-3xl font-black tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-[13px] text-white/50">Effective date: 25 May 2026</p>

        <div className="mt-8 flex flex-col gap-8 text-[14px] leading-relaxed text-white/75">

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">1. Acceptance of terms</h2>
            <p>
              By using Fangirl FC, you agree to these Terms of Service. If you do not agree,
              please do not use the app.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">2. Fan-made entertainment purpose</h2>
            <p>
              Fangirl FC is a fan-made app created for entertainment. It provides football
              identity quizzes, fan card creation, mini-games, and social sharing features.
              It is not an official product of any football organisation, club, league, or
              governing body. All features are provided for personal entertainment only.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">3. User content responsibility</h2>
            <p>
              You are responsible for any images or text you upload or submit through Fangirl FC.
              You must have permission to use any images you upload. You must not submit content
              that is:
            </p>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-white/65">
              <li>Copyrighted material you do not have rights to use</li>
              <li>Illegal, hateful, explicit, harmful, or non-consensual</li>
              <li>Impersonating another person without consent</li>
            </ul>
            <p className="mt-2">
              Fangirl FC reserves the right to remove content that violates these terms.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">4. Generated cards</h2>
            <p>
              Cards created in Fangirl FC are for personal fan entertainment only. They are not
              official credentials, memberships, or endorsements of any kind. They are not
              affiliated with or authorised by any official football entity. Generated cards must
              not be used to misrepresent official affiliations or to deceive others.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">5. No gambling or real-money prizes</h2>
            <p>
              Fangirl FC does not offer betting, gambling, or real-money prizes of any kind.
              All in-app rewards such as stars and badges are for entertainment purposes only
              and have no monetary value. They cannot be redeemed, transferred, or exchanged for
              anything of value.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">6. Accounts and sharing</h2>
            <p>
              Sign-in is optional. If you sign in or share content through Fangirl FC, you are
              responsible for what you publish. Shared links may be publicly accessible to anyone
              with the link. Do not share content that includes personal information you do not
              want made public.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">7. Account deletion</h2>
            <p>
              You may request deletion of your account and associated data at any time by
              contacting us at{" "}
              <a href="mailto:support@fangirlfc.live" className="text-pink-300 underline">
                support@fangirlfc.live
              </a>
              . See our{" "}
              <Link href="/delete-account" className="text-pink-300 underline">
                Delete Account &amp; Data page
              </Link>{" "}
              for full instructions.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">8. Service availability</h2>
            <p>
              Fangirl FC is provided as-is. The app may change, be updated, experience downtime,
              or become unavailable at any time without notice. We make no guarantees of
              continuous availability.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">9. Intellectual property disclaimer</h2>
            <p>
              Fangirl FC is a fan-made app and is not affiliated with FIFA, EA, EA SPORTS FC,
              UEFA, any football federation, club, league, or sponsor. All official team names,
              flags, and tournament references are used for identification purposes only in a
              fan context.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">10. Third-party services</h2>
            <p>
              Background removal uses @huggingface/transformers and the Xenova/modnet model.
              Both are listed as Apache-2.0 licensed. Fangirl FC is not responsible for
              third-party package availability, model download failures, or browser
              compatibility. Use of Firebase services is subject to{" "}
              <a
                href="https://firebase.google.com/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-300 underline"
              >
                Google&apos;s terms of service
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">11. Contact</h2>
            <p>
              For questions about these terms, contact us at{" "}
              <a href="mailto:support@fangirlfc.live" className="text-pink-300 underline">
                support@fangirlfc.live
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 border-t border-white/10 pt-6 text-[12px] text-white/40">
          <Link href="/privacy" className="hover:text-white/70 transition">Privacy Policy</Link>
          <Link href="/support" className="hover:text-white/70 transition">Support</Link>
          <Link href="/delete-account" className="hover:text-white/70 transition">Delete Account</Link>
          <Link href="/contact" className="hover:text-white/70 transition">Contact</Link>
          <Link href="/" className="hover:text-white/70 transition">Home</Link>
        </div>
      </div>
    </main>
  );
}
