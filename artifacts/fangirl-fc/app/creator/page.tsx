"use client";

import dynamic from "next/dynamic";

// Konva + localStorage are browser-only — load the full screen client-side
const CreatorScreen = dynamic(
  () => import("@/components/cardCreator/CreatorScreen"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#0b0613] flex items-center justify-center">
        <p className="text-white/40 text-sm animate-pulse">Loading creator…</p>
      </div>
    ),
  }
);

export default function CreatorPage() {
  return <CreatorScreen />;
}
