"use client";

import dynamic from "next/dynamic";

// Konva is browser-only — ssr:false requires a Client Component
const CreatorPreviewScreen = dynamic(
  () => import("@/components/cardCreator/CreatorPreviewScreen"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#0b0613] flex items-center justify-center">
        <p className="text-white/40 text-sm animate-pulse">Loading render engine…</p>
      </div>
    ),
  }
);

export default function CreatorPage() {
  return <CreatorPreviewScreen />;
}
