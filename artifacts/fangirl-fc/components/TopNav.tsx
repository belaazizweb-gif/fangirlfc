"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HelpCircle,
  CalendarDays,
  Users,
  Layers,
  Trophy,
  Target,
  Sticker,
  Medal,
  Flag,
  Crosshair,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/quiz",          label: "Quiz",       icon: HelpCircle   },
  { href: "/penalty",       label: "Penalty",    icon: Crosshair    },
  { href: "/football-iq",   label: "IQ",         icon: Brain        },
  { href: "/matchday",      label: "Matchday",   icon: CalendarDays },
  { href: "/groups",        label: "Groups",     icon: Users        },
  { href: "/my-cards",      label: "Cards",      icon: Layers       },
  { href: "/level",         label: "Level",      icon: Trophy       },
  { href: "/ranking",       label: "Ranking",    icon: Medal        },
  { href: "/team-ranking",  label: "Teams",      icon: Flag         },
  { href: "/challenges",    label: "Challenges", icon: Target       },
  { href: "/stickers",      label: "Stickers",   icon: Sticker      },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="no-scrollbar -mx-4 mt-3 flex gap-1.5 overflow-x-auto px-4 pb-1">
      {LINKS.map((l) => {
        const Icon = l.icon;
        const active =
          pathname === l.href ||
          (l.href !== "/" && pathname.startsWith(l.href));
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition",
              active
                ? "border-pink-300/60 bg-pink-400/20 text-pink-50"
                : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10",
            )}
          >
            <Icon className="h-3 w-3" />
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
