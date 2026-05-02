"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ResultCard } from "@/components/ResultCard";
import { FAN_TYPES } from "@/lib/fanTypes";
import type { FanIdentityId } from "@/types";

function Inner() {
  const params = useSearchParams();
  const id = params.get("id") as FanIdentityId | null;
  const compareTo = params.get("compareTo") ?? undefined;
  const matchId = params.get("matchId") ?? undefined;
  const identity = id && FAN_TYPES[id];

  if (!identity) {
    return (
      <div className="glass rounded-2xl p-5 text-center">
        <p className="text-sm text-white/70">No result found.</p>
        <Link
          href="/quiz"
          className="mt-3 inline-block rounded-full bg-white/10 px-4 py-2 text-sm"
        >
          Take the quiz
        </Link>
      </div>
    );
  }

  return (
    <ResultCard
      identity={identity}
      compareToId={compareTo}
      matchId={matchId}
    />
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="text-white/50">Revealing…</div>}>
      <Inner />
    </Suspense>
  );
}
