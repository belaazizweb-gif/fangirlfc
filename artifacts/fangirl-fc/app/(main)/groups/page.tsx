"use client";

import { useEffect, useState } from "react";
import { Plus, Users, Globe2, Trash2 } from "lucide-react";
import type { LocalGroup } from "@/types";
import {
  addMember,
  createGroup,
  deleteGroup,
  listGroups,
  removeMember,
} from "@/lib/groups";
import { trackEvent } from "@/lib/analytics";
import { GroupBuilder } from "@/components/GroupBuilder";
import { GroupLeaderboard } from "@/components/GroupLeaderboard";
import { WorldwideBattle } from "@/components/WorldwideBattle";
import { cn } from "@/lib/cn";

type Tab = "squad" | "world";

export default function GroupsPage() {
  const [groups, setGroups] = useState<LocalGroup[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [tab, setTab] = useState<Tab>("squad");

  useEffect(() => {
    const list = listGroups();
    setGroups(list);
    if (list[0]) setActiveId(list[0].id);
  }, []);

  const active = groups.find((g) => g.id === activeId) ?? null;

  const handleCreate = () => {
    if (!newName.trim()) return;
    const g = createGroup(newName);
    trackEvent("group_created", { groupId: g.id });
    setGroups(listGroups());
    setActiveId(g.id);
    setNewName("");
  };

  const handleDelete = (id: string) => {
    deleteGroup(id);
    const next = listGroups();
    setGroups(next);
    if (activeId === id) setActiveId(next[0]?.id ?? null);
  };

  const handleAddMember: React.ComponentProps<typeof GroupBuilder>["onAdd"] = (
    m,
  ) => {
    if (!activeId) return;
    addMember(activeId, m);
    setGroups(listGroups());
  };

  const handleRemoveMember = (memberId: string) => {
    if (!activeId) return;
    removeMember(activeId, memberId);
    setGroups(listGroups());
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-black">Groups</h1>
        <p className="mt-1 text-sm text-white/60">
          Build your fan squad. Rank your friends. Battle other countries.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <TabButton
          active={tab === "squad"}
          onClick={() => setTab("squad")}
          icon={<Users className="h-3.5 w-3.5" />}
          label="My Squad"
        />
        <TabButton
          active={tab === "world"}
          onClick={() => setTab("world")}
          icon={<Globe2 className="h-3.5 w-3.5" />}
          label="Worldwide Battle"
        />
      </div>

      {tab === "squad" && (
        <>
          <div className="glass flex flex-col gap-3 rounded-2xl p-4">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/65">
              Create a new group
            </div>
            <div className="flex gap-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value.slice(0, 32))}
                placeholder="Girls Squad, Office Crew..."
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-white/30 focus:outline-none"
              />
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="flex items-center gap-1 rounded-xl bg-pink-400/25 px-3 py-2 text-sm font-bold text-pink-50 hover:bg-pink-400/35 disabled:opacity-40"
              >
                <Plus className="h-4 w-4" /> Create
              </button>
            </div>
          </div>

          {groups.length > 1 && (
            <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1">
              {groups.map((g) => {
                const a = g.id === activeId;
                return (
                  <button
                    key={g.id}
                    onClick={() => setActiveId(g.id)}
                    className={cn(
                      "shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-bold transition",
                      a
                        ? "border-pink-300/60 bg-pink-400/20 text-pink-50"
                        : "border-white/10 bg-white/5 text-white/65 hover:bg-white/10",
                    )}
                  >
                    {g.name}
                  </button>
                );
              })}
            </div>
          )}

          {active ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-base font-black text-white">
                    {active.name}
                  </div>
                  <div className="text-[11px] text-white/55">
                    {active.members.length} member
                    {active.members.length === 1 ? "" : "s"}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(active.id)}
                  className="flex items-center gap-1 rounded-full border border-rose-300/20 bg-rose-400/10 px-3 py-1.5 text-[11px] font-bold text-rose-100 hover:bg-rose-400/20"
                >
                  <Trash2 className="h-3 w-3" /> Delete group
                </button>
              </div>
              <GroupBuilder onAdd={handleAddMember} />
              <GroupLeaderboard
                group={active}
                onRemoveMember={handleRemoveMember}
              />
            </div>
          ) : (
            <div className="glass flex flex-col items-center gap-3 rounded-3xl p-8 text-center">
              <Users className="h-8 w-8 text-pink-200" />
              <div className="text-base font-bold">No squad yet</div>
              <p className="text-xs text-white/60">
                Name your group and start adding friends.
              </p>
            </div>
          )}
        </>
      )}

      {tab === "world" && <WorldwideBattle yourGroup={active} />}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider transition",
        active
          ? "border-pink-300/60 bg-pink-400/20 text-pink-50"
          : "border-white/10 bg-white/5 text-white/65 hover:bg-white/10",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
