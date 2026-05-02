"use client";

import { Suspense } from "react";
import { CalloutBuilder } from "@/components/CalloutBuilder";

export default function CalloutPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-black">Call out a friend</h1>
        <p className="mt-1 text-sm text-white/60">
          Assign a fan identity to your bestie, your boyfriend, your girls.
          Send the card. Watch them argue with you.
        </p>
      </div>
      <Suspense fallback={<div className="text-white/50">Loading…</div>}>
        <CalloutBuilder />
      </Suspense>
    </div>
  );
}
