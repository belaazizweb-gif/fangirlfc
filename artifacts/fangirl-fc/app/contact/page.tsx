import Link from "next/link";
import { Mail } from "lucide-react";

export const metadata = {
  title: "Contact — Fangirl FC",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#0d0d1a] text-white">
      <div className="mx-auto max-w-2xl px-5 py-10">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-[12px] text-white/40 hover:text-white/70 transition"
        >
          ← Back to Fangirl FC
        </Link>

        <h1 className="text-3xl font-black tracking-tight">Contact</h1>
        <p className="mt-2 text-[13px] text-white/50">
          Get in touch with the Fangirl FC team.
        </p>

        <div className="mt-8 flex flex-col gap-8 text-[14px] leading-relaxed text-white/75">

          <section>
            <h2 className="mb-3 text-[16px] font-bold text-white">Email us</h2>
            <p>
              Fangirl FC is a small, fan-made project. We do not have a live chat or phone
              support. All enquiries are handled by email.
            </p>
            <a
              href="mailto:fangirlfc2026@gmail.com"
              className="mt-5 inline-flex items-center gap-2.5 rounded-2xl border border-pink-400/30 bg-pink-400/10 px-6 py-4 text-[15px] font-semibold text-pink-200 transition hover:bg-pink-400/20"
            >
              <Mail className="h-5 w-5" />
              fangirlfc2026@gmail.com
            </a>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">What to include in your email</h2>
            <p>To help us respond faster, please include:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-white/65">
              <li>A brief description of your question or issue</li>
              <li>The device and browser you are using (if relevant)</li>
              <li>Your registered email address (for account-related enquiries)</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">Account or data deletion</h2>
            <p>
              If you would like to request deletion of your account or personal data, please see
              our{" "}
              <Link href="/delete-account" className="text-pink-300 underline">
                Delete Account &amp; Data page
              </Link>{" "}
              for instructions and the information to include in your request.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">Response time</h2>
            <p>
              We aim to respond to all emails within a few business days. Deletion requests are
              processed within 30 days of verification.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-bold text-white">Unofficial disclaimer</h2>
            <p>
              Fangirl FC is a fan-made app and is not affiliated with FIFA, EA, EA SPORTS FC,
              UEFA, any football federation, club, league, or sponsor.
            </p>
          </section>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 border-t border-white/10 pt-6 text-[12px] text-white/40">
          <Link href="/privacy" className="hover:text-white/70 transition">Privacy Policy</Link>
          <Link href="/delete-account" className="hover:text-white/70 transition">Delete Account</Link>
          <Link href="/support" className="hover:text-white/70 transition">Support</Link>
          <Link href="/" className="hover:text-white/70 transition">Home</Link>
        </div>
      </div>
    </main>
  );
}
