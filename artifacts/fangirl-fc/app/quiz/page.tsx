"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Quiz } from "@/components/Quiz";

function QuizInner() {
  const params = useSearchParams();
  const compareTo = params.get("compareTo") ?? undefined;
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-black">The Fangirl Quiz</h1>
        <p className="mt-1 text-sm text-white/60">
          Pick the option that's most you. No wrong answers, only chaos.
        </p>
      </div>
      <Quiz compareTo={compareTo} />
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="text-white/50">Loading…</div>}>
      <QuizInner />
    </Suspense>
  );
}
