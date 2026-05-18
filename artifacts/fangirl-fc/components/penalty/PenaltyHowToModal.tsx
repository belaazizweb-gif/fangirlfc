"use client";

const STEPS = [
  { n: 1, emoji: "🎯", text: "Tap inside the goal to aim" },
  { n: 2, emoji: "🦵", text: "Choose Safe or Power" },
  { n: 3, emoji: "⚡", text: "Tap the power bar to shoot" },
];

const STORAGE_KEY = "fangirlfc.penaltyTutorialSeen";

export function markPenaltyTutorialSeen(): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, "1");
  }
}

export function hasPenaltyTutorialBeenSeen(): boolean {
  if (typeof window === "undefined") return true;
  return !!window.localStorage.getItem(STORAGE_KEY);
}

interface Props {
  onDismiss: () => void;
}

export function PenaltyHowToModal({ onDismiss }: Props) {
  const handleGotIt = () => {
    markPenaltyTutorialSeen();
    onDismiss();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-[#130820] p-6 shadow-2xl">
        <h2 className="text-xl font-black text-white">How to play Penalty Queen</h2>
        <div className="mt-4 flex flex-col gap-3">
          {STEPS.map((s) => (
            <div key={s.n} className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-pink-400/20 text-[12px] font-extrabold text-pink-200">
                {s.n}
              </span>
              <span className="text-xl">{s.emoji}</span>
              <p className="text-[14px] font-semibold text-white">{s.text}</p>
            </div>
          ))}
        </div>
        <button
          onClick={handleGotIt}
          className="mt-6 w-full rounded-full bg-pink-500 py-3 text-sm font-extrabold text-white transition hover:bg-pink-400 active:scale-[0.98]"
        >
          Got it ⚽
        </button>
      </div>
    </div>
  );
}
