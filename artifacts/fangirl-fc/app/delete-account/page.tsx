import Link from "next/link";
import { Mail } from "lucide-react";

export const metadata = {
  title: "Delete Account & Data — Fangirl FC",
};

export default function DeleteAccountPage() {
  return (
    <main className="min-h-screen bg-[#0d0d1a] text-white">
      <div className="mx-auto max-w-2xl px-5 py-10">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-[12px] text-white/40 hover:text-white/70 transition"
        >
          ← Back to Fangirl FC
        </Link>

        <h1 className="text-3xl font-black tracking-tight">Delete Account &amp; Data</h1>
        <p className="mt-2 text-[13px] text-white/50">
          How to request removal of your account and personal data.
        </p>

        <div className="mt-8 flex flex-col gap-8 text-[14px] leading-relaxed text-white/75">

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">Your right to deletion</h2>
            <p>
              You may request deletion of your Fangirl FC account and any associated cloud data
              at any time. Fangirl FC does not currently support automated in-app account
              deletion. All deletion requests are handled by email and processed within 30 days
              of verification.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">How to submit a deletion request</h2>
            <p>Send an email to:</p>
            <a
              href="mailto:support@fangirlfc.live"
              className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-pink-400/30 bg-pink-400/10 px-5 py-3 text-[14px] font-semibold text-pink-200 transition hover:bg-pink-400/20"
            >
              <Mail className="h-4 w-4" />
              support@fangirlfc.live
            </a>
            <p className="mt-4">Use the subject line:</p>
            <div className="mt-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-[13px] text-white/80">
              Account Deletion Request
            </div>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">What to include in your email</h2>
            <p>To help us verify and process your request, please include:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-white/65">
              <li>The email address you used to sign in to Fangirl FC</li>
              <li>Your Firebase user ID (UID), if known — optional but helpful</li>
              <li>A brief statement confirming you are requesting full account and data deletion</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">What data will be deleted</h2>
            <p>Upon verification, we will delete:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-white/65">
              <li>Your Firebase Authentication account (email, display name, profile photo URL)</li>
              <li>Your user profile stored in Firestore (<code className="text-white/70">users/&#123;uid&#125;</code>)</li>
              <li>Your leaderboard entry (<code className="text-white/70">leaderboard/&#123;uid&#125;</code>)</li>
              <li>Any official share records linked to your account</li>
            </ul>
            <p className="mt-2">
              Public share links you have created (in <code className="text-white/70">shares</code> or{" "}
              <code className="text-white/70">public_cards</code>) may remain accessible if they
              were shared publicly, as they contain no personally identifying information beyond
              a display name you chose.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">Deleting local browser data</h2>
            <p>
              Fangirl FC stores some data locally in your browser (quiz progress, stars, saved
              card state, fan identity). This data is not linked to your account and must be
              deleted separately through your browser settings.
            </p>
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-semibold text-white/80">How to clear local data:</p>
              <ol className="mt-2 list-decimal pl-5 space-y-1 text-white/65">
                <li>Open your browser settings</li>
                <li>Go to Privacy or Site Settings</li>
                <li>Find &quot;Clear browsing data&quot; or &quot;Manage site data&quot;</li>
                <li>Search for <strong className="text-white/70">fangirlfc.live</strong></li>
                <li>Delete site data and storage</li>
              </ol>
              <p className="mt-2 text-[12px] text-white/45">
                This will remove all locally saved progress, cards, and identity data for
                fangirlfc.live from your device.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">Processing time</h2>
            <p>
              We will confirm receipt of your request by email. Cloud data deletion will be
              completed within 30 days of identity verification. You will receive a confirmation
              once deletion is complete.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">Questions</h2>
            <p>
              If you have any questions about the deletion process, see our{" "}
              <Link href="/privacy" className="text-pink-300 underline">
                Privacy Policy
              </Link>{" "}
              or contact us at{" "}
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
          <Link href="/contact" className="hover:text-white/70 transition">Contact</Link>
          <Link href="/" className="hover:text-white/70 transition">Home</Link>
        </div>
      </div>
    </main>
  );
}
