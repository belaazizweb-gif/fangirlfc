import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Fangirl FC",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0d0d1a] text-white">
      <div className="mx-auto max-w-2xl px-5 py-10">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-[12px] text-white/40 hover:text-white/70 transition"
        >
          ← Back to Fangirl FC
        </Link>

        <h1 className="text-3xl font-black tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-[13px] text-white/50">Effective date: 25 May 2026</p>

        <div className="mt-8 flex flex-col gap-8 text-[14px] leading-relaxed text-white/75">

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">1. What Fangirl FC is</h2>
            <p>
              Fangirl FC is a fan-made football identity, quiz, card creator, and light game app.
              It is not affiliated with any official football organisation, league, club, or sponsor.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">2. Images and card creation</h2>
            <p>
              Users may upload images to create fan cards. Image processing for the card creator,
              including background removal, runs client-side in your browser. Fangirl FC does not
              intentionally upload card creation images to its own servers. Exported cards are
              generated in your browser. You should not upload images you do not have permission
              to use.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">3. Local storage</h2>
            <p>
              Fangirl FC uses your browser&apos;s local storage to save:
            </p>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-white/65">
              <li>Quiz answers and fan identity</li>
              <li>Stars and progression data</li>
              <li>Challenge completion status</li>
              <li>Saved card data and card creator state</li>
              <li>Uploaded photo data, if saved by the app</li>
            </ul>
            <p className="mt-2">
              This data stays on your device and is not transmitted to Fangirl FC servers unless
              you explicitly use a sign-in or share feature.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">4. Firebase and optional account features</h2>
            <p>
              Fangirl FC uses Firebase services provided by Google. Sign-in is optional. If you
              sign in, Firebase Auth may process your email address, display name, profile photo
              URL, and a unique user ID depending on your sign-in method.
            </p>
            <p className="mt-2">
              Firestore (Firebase&apos;s database) may store public and shared card metadata,
              display name, team selection, fan identity, and ranking or leaderboard data when
              you use sharing or official card features. No Firebase Storage image upload is
              used in the current version of the app.
            </p>
            <p className="mt-2">
              Firebase services are subject to{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-300 underline"
              >
                Google&apos;s Privacy Policy
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">5. Analytics</h2>
            <p>
              Fangirl FC does not currently use a production analytics SDK. Some technical logs
              may appear during development.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">6. Sharing</h2>
            <p>
              Shared links may display selected card or profile information publicly to anyone
              with the link. You should avoid sharing personal information you do not want made
              public.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">7. Children and target audience</h2>
            <p>
              Fangirl FC is intended for general football fans and is not directed at children
              under 13. Users under the minimum age required in their country should use the app
              with permission from a parent or guardian.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">8. No sale of personal data</h2>
            <p>Fangirl FC does not sell personal data.</p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">9. Third-party services and attribution</h2>
            <p>Fangirl FC uses the following third-party software:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-white/65">
              <li>
                <strong className="text-white/80">Firebase / Google services</strong> — for
                optional authentication and data storage where configured.
              </li>
              <li>
                <strong className="text-white/80">
                  @huggingface/transformers (Apache-2.0)
                </strong>{" "}
                — used for browser-based background removal via a MODNet pipeline. Background
                removal uses @huggingface/transformers and the Xenova/modnet model. Both are
                listed as Apache-2.0 licensed. Processing runs entirely in the user&apos;s browser;
                images are not uploaded to Fangirl FC servers for card creation.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">10. Account deletion and data removal</h2>
            <p>
              You may request deletion of your account and associated cloud data at any time.
              Because Fangirl FC does not support automated in-app deletion at this time, deletion
              requests are processed by email.
            </p>
            <p className="mt-2">
              To request deletion, send an email to{" "}
              <a href="mailto:fangirlfc2026@gmail.com" className="text-pink-300 underline">
                fangirlfc2026@gmail.com
              </a>{" "}
              with the subject line <strong className="text-white/80">Account Deletion Request</strong> and
              include your registered email address or user ID. We will process your request within
              30 days.
            </p>
            <p className="mt-2">
              Local browser data (quiz progress, stars, saved cards) can be deleted at any time
              through your browser&apos;s site storage settings for fangirlfc.live.
            </p>
            <p className="mt-2">
              For full instructions, see our{" "}
              <Link href="/delete-account" className="text-pink-300 underline">
                Delete Account &amp; Data page
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">11. Unofficial disclaimer</h2>
            <p>
              Fangirl FC is a fan-made app and is not affiliated with FIFA, EA, EA SPORTS FC,
              UEFA, any football federation, club, league, or sponsor.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">12. Contact</h2>
            <p>
              For privacy questions, contact us at{" "}
              <a href="mailto:fangirlfc2026@gmail.com" className="text-pink-300 underline">
                fangirlfc2026@gmail.com
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 border-t border-white/10 pt-6 text-[12px] text-white/40">
          <Link href="/terms" className="hover:text-white/70 transition">Terms of Service</Link>
          <Link href="/support" className="hover:text-white/70 transition">Support</Link>
          <Link href="/delete-account" className="hover:text-white/70 transition">Delete Account</Link>
          <Link href="/contact" className="hover:text-white/70 transition">Contact</Link>
          <Link href="/" className="hover:text-white/70 transition">Home</Link>
        </div>
      </div>
    </main>
  );
}
