"use client";

import { customAlphabet } from "nanoid";
import type { FanIdentityId, GroupMember, LocalGroup } from "@/types";

const KEY = "fangirlfc.groups";
const MAX_GROUPS = 12;
const MAX_MEMBERS = 24;
const nano = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 8);

function readAll(): LocalGroup[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as LocalGroup[];
  } catch {
    return [];
  }
  return [];
}

function writeAll(groups: LocalGroup[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    KEY,
    JSON.stringify(groups.slice(0, MAX_GROUPS)),
  );
}

export function listGroups(): LocalGroup[] {
  return readAll().sort((a, b) => b.createdAt - a.createdAt);
}

export function getGroup(id: string): LocalGroup | null {
  return readAll().find((g) => g.id === id) ?? null;
}

export function createGroup(name: string): LocalGroup {
  const all = readAll();
  const group: LocalGroup = {
    id: nano(),
    name: name.trim().slice(0, 32) || "My Squad",
    createdAt: Date.now(),
    members: [],
  };
  all.unshift(group);
  writeAll(all);
  return group;
}

export function deleteGroup(id: string): LocalGroup[] {
  const next = readAll().filter((g) => g.id !== id);
  writeAll(next);
  return next;
}

export function addMember(
  groupId: string,
  member: Omit<GroupMember, "id">,
): LocalGroup | null {
  const all = readAll();
  const group = all.find((g) => g.id === groupId);
  if (!group) return null;
  if (group.members.length >= MAX_MEMBERS) return group;
  group.members.push({
    ...member,
    id: nano(),
    name: member.name.trim().slice(0, 24) || "Anonymous",
  });
  writeAll(all);
  return group;
}

export function removeMember(
  groupId: string,
  memberId: string,
): LocalGroup | null {
  const all = readAll();
  const group = all.find((g) => g.id === groupId);
  if (!group) return null;
  group.members = group.members.filter((m) => m.id !== memberId);
  writeAll(all);
  return group;
}

// ---------- Leaderboard helpers ----------

export interface RankedMember extends GroupMember {
  rank: number;
}

export function rankMembers(group: LocalGroup): RankedMember[] {
  return [...group.members]
    .sort((a, b) => b.stars - a.stars)
    .map((m, i) => ({ ...m, rank: i + 1 }));
}

const FUN_LABELS: Array<{
  label: string;
  emoji: string;
  pick: (group: LocalGroup) => GroupMember | null;
}> = [
  {
    label: "Most Chaotic",
    emoji: "⚡",
    pick: (g) => firstByIdentity(g, "chaotic"),
  },
  {
    label: "Most Loyal",
    emoji: "👑",
    pick: (g) => firstByIdentity(g, "loyal"),
  },
  {
    label: "Drama Queen",
    emoji: "😭",
    pick: (g) => firstByIdentity(g, "screamer"),
  },
  {
    label: "Tactical Brain",
    emoji: "🧠",
    pick: (g) => firstByIdentity(g, "tactical"),
  },
  {
    label: "Top Princess",
    emoji: "💅",
    pick: (g) => firstByIdentity(g, "princess"),
  },
  {
    label: "Softest Heart",
    emoji: "🌸",
    pick: (g) => firstByIdentity(g, "soft"),
  },
];

function firstByIdentity(
  g: LocalGroup,
  id: FanIdentityId,
): GroupMember | null {
  return (
    [...g.members]
      .sort((a, b) => b.stars - a.stars)
      .find((m) => m.identityId === id) ?? null
  );
}

export interface SuperlativeAward {
  label: string;
  emoji: string;
  member: GroupMember;
}

export function groupSuperlatives(group: LocalGroup): SuperlativeAward[] {
  const out: SuperlativeAward[] = [];
  for (const def of FUN_LABELS) {
    const member = def.pick(group);
    if (member) out.push({ label: def.label, emoji: def.emoji, member });
    if (out.length >= 4) break;
  }
  return out;
}

export function groupAverageStars(group: LocalGroup): number {
  if (group.members.length === 0) return 0;
  const sum = group.members.reduce((acc, m) => acc + m.stars, 0);
  return sum / group.members.length;
}

export function dominantIdentity(group: LocalGroup): FanIdentityId | null {
  if (group.members.length === 0) return null;
  const counts: Partial<Record<FanIdentityId, number>> = {};
  for (const m of group.members) {
    counts[m.identityId] = (counts[m.identityId] ?? 0) + 1;
  }
  let best: FanIdentityId | null = null;
  let bestCount = -1;
  (Object.entries(counts) as [FanIdentityId, number][]).forEach(([id, c]) => {
    if (c > bestCount) {
      best = id;
      bestCount = c;
    }
  });
  return best;
}
