"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Copy, Trash2, ExternalLink } from "lucide-react";
import { FanCard } from "@/components/FanCard";
import { FAN_TYPES } from "@/lib/fanTypes";
import { getTeam, TEAMS } from "@/lib/teams";
import { getTemplate } from "@/lib/templates";
import {
  deleteCard,
  duplicateCard,
  listCards,
  type SavedCard,
} from "@/lib/cardHistory";
import { getIdentityStars } from "@/lib/stars";

const PREVIEW_SCALE = 0.4;
const CARD_W = 360;
const CARD_H = 640;

function formatDate(ts: number): string {
  try {
    return new Date(ts).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function buildReopenHref(c: SavedCard): string {
  const params = new URLSearchParams({
    id: c.identityId,
    team: c.teamCode,
    template: c.templateId,
  });
  if (c.displayName && c.displayName !== "Anonymous Fan") {
    params.set("name", c.displayName);
  }
  return `/card?${params.toString()}`;
}

export default function MyCardsPage() {
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCards(listCards());
    setLoaded(true);
  }, []);

  const stars = useMemo(() => {
    const map: Partial<Record<string, number>> = {};
    cards.forEach((c) => {
      if (map[c.identityId] === undefined) {
        map[c.identityId] = getIdentityStars(c.identityId);
      }
    });
    return map;
  }, [cards]);

  const handleDelete = (id: string) => {
    const next = deleteCard(id);
    setCards(next);
  };

  const handleDuplicate = (id: string) => {
    duplicateCard(id);
    setCards(listCards());
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-black">My Cards</h1>
        <p className="mt-1 text-sm text-white/60">
          Your saved Fangirl cards. Stored only on this device — selfies are
          never saved.
        </p>
      </div>

      {loaded && cards.length === 0 && (
        <div className="glass flex flex-col items-center gap-3 rounded-3xl p-8 text-center">
          <div className="text-5xl">💖</div>
          <div className="text-base font-bold">No cards yet</div>
          <p className="text-xs text-white/60">
            Take the quiz, build your card, and download it. It'll show up
            here.
          </p>
          <Link
            href="/quiz"
            className="shine-button mt-2 flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm"
          >
            Find my fan type
          </Link>
        </div>
      )}

      {cards.length > 0 && (
        <Link
          href="/quiz"
          className="flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/85 hover:bg-white/10"
        >
          <Plus className="h-4 w-4" /> Make a new card
        </Link>
      )}

      <div className="flex flex-col gap-4">
        {cards.map((c) => {
          const identity = FAN_TYPES[c.identityId];
          const team = getTeam(c.teamCode) ?? TEAMS[0]!;
          const template = getTemplate(c.templateId);
          if (!identity) return null;
          return (
            <div
              key={c.id}
              className="glass flex gap-3 rounded-2xl p-3"
            >
              <div
                className="relative shrink-0 overflow-hidden rounded-xl"
                style={{
                  width: CARD_W * PREVIEW_SCALE,
                  height: CARD_H * PREVIEW_SCALE,
                }}
              >
                <div
                  style={{
                    width: CARD_W,
                    height: CARD_H,
                    transform: `scale(${PREVIEW_SCALE})`,
                    transformOrigin: "top left",
                  }}
                >
                  <FanCard
                    identity={identity}
                    team={team}
                    template={template}
                    displayName={c.displayName}
                    selfieUrl={null}
                    stars={stars[c.identityId] ?? 0.5}
                  />
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white/45">
                    {formatDate(c.createdAt)}
                  </div>
                  <div className="text-sm font-black leading-tight text-white">
                    {identity.title}
                  </div>
                  <div className="text-[11px] text-white/65">
                    {c.displayName} · {team.flag} {team.name}
                  </div>
                </div>
                <div className="mt-auto flex flex-col gap-1.5">
                  <Link
                    href={buildReopenHref(c)}
                    className="flex items-center justify-center gap-1.5 rounded-full bg-pink-400/20 px-3 py-1.5 text-[11px] font-bold text-pink-50 hover:bg-pink-400/30"
                  >
                    <ExternalLink className="h-3 w-3" /> Reopen
                  </Link>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleDuplicate(c.id)}
                      className="flex items-center justify-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1.5 text-[10px] font-bold text-white/80 hover:bg-white/10"
                    >
                      <Copy className="h-3 w-3" /> Duplicate
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="flex items-center justify-center gap-1 rounded-full border border-rose-300/20 bg-rose-400/10 px-2 py-1.5 text-[10px] font-bold text-rose-100 hover:bg-rose-400/20"
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
