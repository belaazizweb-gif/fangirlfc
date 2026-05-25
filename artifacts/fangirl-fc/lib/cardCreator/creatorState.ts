import type { CardTemplateId } from "./templateConfig";
import type { StatKey } from "./renderUtils";

export type BadgeId = "shield" | "star" | "crown" | "lion" | "ball" | "lightning";

export type BadgeState =
  | { type: "generic"; id: BadgeId }
  | { type: "upload"; src: string }
  | { type: "none" };

export interface CreatorPhotoState {
  src: string | null;
  /** Data URL of the transparent PNG cutout. Null for normal photos. */
  cutoutSrc?: string | null;
  /** True when the uploaded PNG had meaningful alpha transparency. */
  isCutout?: boolean;
  /** How the active cutout was produced. "manual" = user uploaded a transparent PNG.
   *  "ai" = background was removed by the browser-based MODNet background removal engine. undefined = no cutout. */
  cutoutSource?: "manual" | "ai";
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
    cutoutSrc: null,
    isCutout: false,
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    naturalWidth: 0,
    naturalHeight: 0,
  },
  player: {
    name: "YOUR NAME",
    rating: 99,
    position: "POS",
    countryCode: "FR",
    flagPath: "/flags/fr.svg",
  },
  badge: { type: "generic", id: "shield" },
  stats: { PAC: 99, SHO: 99, PAS: 99, DRI: 99, DEF: 99, PHY: 99 },
};
