import Link from "next/link";
import { Mail } from "lucide-react";

export const metadata = {
  title: "Account Deletion — FUT Card Creator: FC Fan 26",
  description:
    "Request deletion of your account and data for FUT Card Creator: FC Fan 26 (Fangirl FC).",
};

export default function DeleteAccountPage() {
  return (
    <main className="min-h-screen bg-[#0d0d1a] text-white">
      <div className="mx-auto max-w-2xl px-5 py-10">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-[12px] text-white/40 hover:text-white/70 transition"
        >
          ← Back to app
        </Link>

        <h1 className="text-3xl font-black tracking-tight">
          Account &amp; Data Deletion
        </h1>
        <p className="mt-1 text-[15px] font-semibold text-pink-300">
          FUT Card Creator: FC Fan 26
        </p>
        <p className="mt-2 text-[13px] text-white/50">
          Also published as <strong className="text-white/70">Fangirl FC</strong> at fangirlfc.live
        </p>

        <div className="mt-8 flex flex-col gap-8 text-[14px] leading-relaxed text-white/75">

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">Who this page is for</h2>
            <p>
              This page is for users of <strong className="text-white/90">FUT Card Creator: FC Fan 26</strong>{" "}
              (available on Google Play) and the web app at{" "}
              <strong className="text-white/90">fangirlfc.live</strong>. If you have created an
              account in the app — using Google Sign-In — you may request full deletion of your
              account and associated app data at any time.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">How to request deletion</h2>
            <p>
              Send an email to the address below. We do not currently support automated in-app
              deletion. All requests are handled by email and processed within 30 days of
              identity verification.
            </p>
            <a
              href="mailto:fangirlfc2026@gmail.com"
              className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-pink-400/30 bg-pink-400/10 px-5 py-3 text-[14px] font-semibold text-pink-200 transition hover:bg-pink-400/20"
            >
              <Mail className="h-4 w-4" />
              fangirlfc2026@gmail.com
            </a>
            <p className="mt-4">Use the subject line:</p>
            <div className="mt-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-[13px] text-white/80">
              Account Deletion Request — FUT Card Creator: FC Fan 26
            </div>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">What to include in your email</h2>
            <p>To help us verify and process your request, please include:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-white/65">
              <li>
                <strong className="text-white/80">The email address you used to sign in</strong> to
                FUT Card Creator: FC Fan 26 / Fangirl FC
              </li>
              <li>Your Firebase user ID (UID), if known — optional but helpful</li>
              <li>A brief statement confirming you are requesting full account and data deletion</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">What data will be deleted</h2>
            <p>Upon verification, we will delete:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-white/65">
              <li>Your sign-in account (email address, display name, profile photo URL)</li>
              <li>Your in-app profile and progression data (stars, rank, team selection, fan identity)</li>
              <li>Your leaderboard entry</li>
              <li>Any official share records linked to your account</li>
            </ul>
            <p className="mt-2">
              Anonymous public share links (fan cards shared publicly) may remain accessible as
              they contain no personally identifying information beyond a display name you chose.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">Data retained after deletion</h2>
            <p>
              We will only retain limited data beyond your deletion request if required for legal
              obligations, security, fraud prevention, or compliance purposes. Any retained data
              will not be used for marketing or app features.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">Deleting local device data</h2>
            <p>
              The app also stores some data locally on your device (quiz progress, saved card
              state, fan identity). This data is not linked to your account and must be deleted
              separately through your device or browser settings.
            </p>
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-semibold text-white/80">To clear local data on Android:</p>
              <ol className="mt-2 list-decimal pl-5 space-y-1 text-white/65">
                <li>Open Android Settings → Apps</li>
                <li>Find <strong className="text-white/70">FUT Card Creator: FC Fan 26</strong></li>
                <li>Tap Storage → Clear Data</li>
              </ol>
              <p className="mt-3 font-semibold text-white/80">To clear local data on web (fangirlfc.live):</p>
              <ol className="mt-2 list-decimal pl-5 space-y-1 text-white/65">
                <li>Open your browser settings → Privacy</li>
                <li>Find &quot;Clear browsing data&quot; or &quot;Manage site data&quot;</li>
                <li>Search for <strong className="text-white/70">fangirlfc.live</strong> and delete its data</li>
              </ol>
            </div>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">Processing time</h2>
            <p>
              We will confirm receipt of your request by email. Account and cloud data deletion
              will be completed within <strong className="text-white/80">30 days</strong> of
              identity verification. You will receive a confirmation email once deletion is
              complete.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">Questions</h2>
            <p>
              For any questions about account deletion or data privacy, see our{" "}
              <Link href="/privacy" className="text-pink-300 underline">
                Privacy Policy
              </Link>{" "}
              or contact us at{" "}
              <a href="mailto:fangirlfc2026@gmail.com" className="text-pink-300 underline">
                fangirlfc2026@gmail.com
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 border-t border-white/10 pt-6 text-[12px] text-white/40">
          <Link href="/privacy" className="hover:text-white/70 transition">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white/70 transition">Terms of Service</Link>
          <Link href="/contact" className="hover:text-white/70 transition">Contact</Link>
          <Link href="/" className="hover:text-white/70 transition">Home</Link>
        </div>
      </div>
    </main>
  );
}
