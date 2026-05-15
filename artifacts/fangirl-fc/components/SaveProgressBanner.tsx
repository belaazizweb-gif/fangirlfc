"use client";

import { useState } from "react";
import { LogIn } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { AuthModal } from "@/components/AuthModal";

interface Props {
  title?: string;
  message?: string;
}

export function SaveProgressBanner({
  title = "Save your Fangirl Card",
  message = "Sign in to keep your stars, badges, IQ level and share link.",
}: Props) {
  const { user, loading } = useAuth();
  const [showModal, setShowModal] = useState(false);

  if (loading || user) return null;

  return (
    <>
      <div className="flex items-center gap-3 rounded-2xl border border-pink-400/25 bg-pink-400/8 px-4 py-3">
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-bold text-pink-100">{title}</p>
          <p className="text-[11px] text-white/50 mt-0.5">{message}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-pink-500 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-pink-400 active:scale-95"
        >
          <LogIn className="h-3 w-3" />
          Sign in
        </button>
      </div>
      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </>
  );
}
