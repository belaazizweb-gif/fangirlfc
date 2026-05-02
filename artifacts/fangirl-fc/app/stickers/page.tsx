import Link from "next/link";

export default function StickersPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-black">Sticker Tracker</h1>
        <p className="mt-1 text-sm text-white/60">
          Coming soon. Track every World Cup '26 sticker, swap doubles, and
          show off your collection.
        </p>
      </div>
      <div className="glass rounded-3xl p-6 text-center">
        <div className="text-5xl">🏷️</div>
        <p className="mt-3 text-sm text-white/70">
          We're cooking. Take the quiz in the meantime — your fan identity
          unlocks early access perks.
        </p>
        <Link
          href="/quiz"
          className="mt-5 inline-block rounded-full bg-white/10 px-5 py-2.5 text-sm hover:bg-white/20"
        >
          Take the quiz
        </Link>
      </div>
    </div>
  );
}
