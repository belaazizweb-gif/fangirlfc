"use client";

import { useState } from "react";
import { X, Mail, Lock, User as UserIcon, Chrome } from "lucide-react";
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from "@/lib/auth";

interface Props {
  onClose: () => void;
}

type Tab = "signin" | "signup";

export function AuthModal({ onClose }: Props) {
  const [tab, setTab] = useState<Tab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const handleGoogle = async () => {
    setBusy(true);
    clearError();
    try {
      await signInWithGoogle();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  const handleEmail = async () => {
    if (!email || !password) { setError("Email and password required"); return; }
    if (tab === "signup" && !name) { setError("Name required"); return; }
    setBusy(true);
    clearError();
    try {
      if (tab === "signup") {
        await signUpWithEmail(email, password, name);
      } else {
        await signInWithEmail(email, password);
      }
      onClose();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Sign-in failed";
      setError(
        msg.includes("email-already-in-use")
          ? "Account already exists — sign in instead"
          : msg.includes("wrong-password") || msg.includes("invalid-credential")
          ? "Wrong email or password"
          : msg.includes("weak-password")
          ? "Password must be at least 6 characters"
          : msg,
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-t-3xl bg-[#130820] p-6 sm:rounded-3xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-white/10 p-1.5 text-white/60 hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="mb-1 text-center text-xl font-extrabold text-white">
          {tab === "signup" ? "Create your account" : "Welcome back"}
        </h2>
        <p className="mb-5 text-center text-[12px] text-white/50">
          Save your fan identity across devices
        </p>

        {/* Tabs */}
        <div className="mb-5 flex rounded-full border border-white/10 bg-white/5 p-0.5">
          {(["signin", "signup"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); clearError(); }}
              className={`flex-1 rounded-full py-1.5 text-[12px] font-bold transition ${
                tab === t
                  ? "bg-pink-500 text-white"
                  : "text-white/50 hover:text-white"
              }`}
            >
              {t === "signin" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={busy}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 py-3 text-sm font-bold text-white transition hover:bg-white/20 disabled:opacity-50"
        >
          <Chrome className="h-4 w-4" />
          Continue with Google
        </button>

        <div className="mb-4 flex items-center gap-2">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-[11px] text-white/40">or</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* Form */}
        <div className="space-y-3">
          {tab === "signup" && (
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
              <UserIcon className="h-4 w-4 text-white/40" />
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => { setName(e.target.value); clearError(); }}
                className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
              />
            </div>
          )}
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
            <Mail className="h-4 w-4 text-white/40" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError(); }}
              className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
            />
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
            <Lock className="h-4 w-4 text-white/40" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError(); }}
              onKeyDown={(e) => e.key === "Enter" && handleEmail()}
              className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
            />
          </div>
        </div>

        {error && (
          <p className="mt-3 text-center text-[12px] text-red-400">{error}</p>
        )}

        <button
          onClick={handleEmail}
          disabled={busy}
          className="mt-4 w-full rounded-full bg-pink-500 py-3 text-sm font-extrabold text-white transition hover:bg-pink-400 disabled:opacity-50"
        >
          {busy
            ? "Please wait…"
            : tab === "signup"
            ? "Create account"
            : "Sign in"}
        </button>

        <p className="mt-4 text-center text-[11px] text-white/30">
          Your data stays on this device unless you choose to sync.
        </p>
      </div>
    </div>
  );
}
