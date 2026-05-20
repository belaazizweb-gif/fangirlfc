import type { CardTemplateId } from "./templateConfig";
import type { StatKey } from "./renderUtils";

export type BadgeId = "shield" | "star" | "crown" | "lion" | "ball" | "lightning";

export type BadgeState =
  | { type: "generic"; id: BadgeId }
  | { type: "upload"; src: string }
  | { type: "none" };

export interface CreatorPhotoState {
  src: string | null;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  naturalWidth: number;
  naturalHeight: number;
}

export interface CreatorPlayerState {
  name: string;
  rating: number;
  position: string;
  countryCode: string;
  flagPath: string;
}

export interface CreatorCardState {
  templateId: CardTemplateId;
  photo: CreatorPhotoState;
  player: CreatorPlayerState;
  badge: BadgeState;
  stats: Record<StatKey, number>;
}

export const DEFAULT_CARD_STATE: CreatorCardState = {
  templateId: "gold_elite_2026",
  photo: {
    src: null,
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    naturalWidth: 0,
    naturalHeight: 0,
  },
  player: {
    name: "LUCAS MOREAU",
    rating: 91,
    position: "ST",
    countryCode: "FR",
    flagPath: "/flags/fr.svg",
  },
  badge: { type: "generic", id: "shield" },
  stats: { PAC: 89, SHO: 86, PAS: 82, DRI: 88, DEF: 45, PHY: 84 },
};
