"use client";

import type { Match, Prediction, PredictionPick } from "@/types";

const KEY = "fangirlfc.predictions";

type PredictionMap = Record<string, Prediction>;

function readMap(): PredictionMap {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as PredictionMap;
  } catch {
    return {};
  }
  return {};
}

function writeMap(map: PredictionMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(map));
}

export function getPrediction(matchId: string): Prediction | null {
  return readMap()[matchId] ?? null;
}

export function hasPrediction(matchId: string): boolean {
  return Boolean(readMap()[matchId]);
}

export function savePrediction(
  matchId: string,
  pick: PredictionPick,
): Prediction {
  const map = readMap();
  const p: Prediction = { matchId, pick, createdAt: Date.now() };
  map[matchId] = p;
  writeMap(map);
  return p;
}

export type PredictionOutcome = "correct" | "wrong" | "pending";

export function predictionOutcome(
  match: Match,
  prediction: Prediction | null,
): PredictionOutcome {
  if (!prediction) return "pending";
  if (match.status !== "completed" || !match.result) return "pending";
  return match.result.winner === prediction.pick ? "correct" : "wrong";
}

export const OUTCOME_LABEL: Record<PredictionOutcome, string> = {
  correct: "You called it 👑",
  wrong: "You were robbed 😭",
  pending: "Still to be decided",
};

export const OUTCOME_DRAMA: Record<PredictionOutcome, string> = {
  correct: "Drama level: legend",
  wrong: "Drama level: high",
  pending: "Drama level: building",
};
