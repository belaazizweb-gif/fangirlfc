"use client";

import { useState } from "react";
import { LogIn, LogOut, UserCircle2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { AuthModal } from "@/components/AuthModal";
import { signOut } from "@/lib/auth";

export function UserButton() {
  const { user, loading } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) return null;

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 rounded-full bg-pink-400/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-pink-100 hover:bg-pink-400/30"
        >
          <LogIn className="h-3 w-3" />
          Sign in
        </button>
        {showModal && <AuthModal onClose={() => setShowModal(false)} />}
      </>
    );
  }

  const initials = (user.displayName ?? user.email ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen((o) => !o)}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-pink-500 text-[11px] font-extrabold text-white"
        title={user.displayName ?? user.email ?? "Account"}
      >
        {user.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.photoURL}
            alt="avatar"
            className="h-7 w-7 rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </button>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute right-0 top-9 z-50 w-52 rounded-2xl border border-white/10 bg-[#130820] p-3 shadow-xl">
            <div className="mb-2 flex items-center gap-2 border-b border-white/10 pb-2">
              <UserCircle2 className="h-5 w-5 text-pink-300" />
              <div className="min-w-0">
                <p className="truncate text-[12px] font-bold text-white">
                  {user.displayName ?? "Fan"}
                </p>
                <p className="truncate text-[10px] text-white/40">
                  {user.email}
                </p>
              </div>
            </div>
            <button
              onClick={async () => {
                await signOut();
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-[12px] text-white/70 hover:bg-white/10"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
