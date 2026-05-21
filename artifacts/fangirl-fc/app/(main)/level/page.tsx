"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Trophy, Sparkles, Target, Layers, ArrowRight } from "lucide-react";
import { StarProgress } from "@/components/StarProgress";
import { UnlockedIdentities } from "@/components/UnlockedIdentities";
import { getStars, MAX_STARS } from "@/lib/stars";
import { getUnlocked, totalIdentities } from "@/lib/unlocks";
import { CHALLENGES, getCompletedChallenges } from "@/lib/challenges";
import { countCards } from "@/lib/cardHistory";

export default function LevelPage() {
  const [stars, setStars] = useState(0.5);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [challengeCount, setChallengeCount] = useState(0);
  const [cards, setCards] = useState(0);

  useEffect(() => {
    setStars(getStars());
    setUnlockedCount(getUnlocked().length);
    setChallengeCount(getCompletedChallenges().length);
    setCards(countCards());
  }, []);

  const totalIds = totalIdentities();
  const totalCh = CHALLENGES.length;

  const tier =
    stars >= 4.5
      ? { name: "Galaxy Tier", color: "from-fuchsia-400 to-amber-300" }
      : stars >= 3
        ? { name: "Iconic Tier", color: "from-pink-400 to-fuchsia-400" }
        : stars >= 1.5
          ? { name: "Rising Tier", color: "from-amber-300 to-pink-300" }
          : { name: "Newbie Tier", color: "from-white/40 to-white/20" };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black">My Fan Level</h1>
        <p className="mt-1 text-sm text-white/60">
          Your Fangirl FC progress, all on this device.
        </p>
      </div>

      {/* Hero level card */}
      <div className="relative overflow-hidden rounded-3xl border border-pink-300/30 bg-gradient-to-br from-pink-500/20 via-fuchsia-500/15 to-amber-300/15 p-6 text-center">
        <div className="absolute -right-8 -top-8 text-[140px] leading-none opacity-15">
          ⭐
        </div>
        <div className="relative">
          <div
            className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${tier.color} px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.25em] text-black`}
          >
            <Sparkles className="h-3 w-3" />
            {tier.name}
          </div>
          <div className="mt-3 flex items-baseline justify-center gap-1">
            <span className="text-5xl font-black text-white">
              {stars % 1 === 0 ? stars : stars.toFixed(1)}
            </span>
            <span className="text-lg font-black text-white/55">
              / {MAX_STARS}
            </span>
          </div>
          <div className="mt-3">
            <StarProgress stars={stars} compact />
          </div>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-3 gap-2">
        <StatTile
          icon={Trophy}
          value={`${unlockedCount}/${totalIds}`}
          label="Identities"
          tint="from-amber-300/20 to-rose-400/10 border-amber-300/30"
        />
        <StatTile
          icon={Target}
          value={`${challengeCount}/${totalCh}`}
          label="Challenges"
          tint="from-cyan-400/20 to-emerald-400/10 border-cyan-300/30"
        />
        <StatTile
          icon={Layers}
          value={String(cards)}
          label="Cards saved"
          tint="from-pink-400/20 to-fuchsia-400/10 border-pink-300/30"
        />
      </div>

      {/* Unlocked identities */}
      <UnlockedIdentities />

      {/* Next steps */}
      <div className="flex flex-col gap-2">
        <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/55">
          Level up
        </div>
        <NextStep
          href="/card?id=princess"
          title="Make a card"
          subtitle="+0.5 ⭐ when you download"
          tint="from-pink-400/30 to-rose-400/10"
        />
        <NextStep
          href="/challenges"
          title="Complete a challenge"
          subtitle={`${challengeCount}/${totalCh} done · +0.5 ⭐ each`}
          tint="from-cyan-400/30 to-emerald-400/10"
        />
        <NextStep
          href="/quiz"
          title="Unlock another identity"
          subtitle={`${unlockedCount}/${totalIds} unlocked · retake the quiz`}
          tint="from-amber-300/30 to-pink-300/10"
        />
      </div>
    </div>
  );
}

function StatTile({
  icon: Icon,
  value,
  label,
  tint,
}: {
  icon: typeof Star;
  value: string;
  label: string;
  tint: string;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-1 rounded-2xl border bg-gradient-to-br p-3 text-center ${tint}`}
    >
      <Icon className="h-4 w-4 text-white/85" />
      <div className="text-base font-black leading-none text-white">
        {value}
      </div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-white/65">
        {label}
      </div>
    </div>
  );
}

function NextStep({
  href,
  title,
  subtitle,
  tint,
}: {
  href: string;
  title: string;
  subtitle: string;
  tint: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-br ${tint} p-3.5 transition active:scale-[0.99]`}
    >
      <div className="flex-1">
        <div className="text-[14px] font-bold text-white">{title}</div>
        <div className="text-[11px] text-white/70">{subtitle}</div>
      </div>
      <ArrowRight className="h-4 w-4 text-white/85" />
    </Link>
  );
}
