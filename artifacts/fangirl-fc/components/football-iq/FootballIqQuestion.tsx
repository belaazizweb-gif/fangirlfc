"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import type { FootballIqQuestion, FootballIqOption } from "@/lib/footballIqQuestions";

interface FootballIqQuestionProps {
  question: FootballIqQuestion;
  shuffledOptions: FootballIqOption[];
  questionNumber: 1 | 2;
  totalQuestions: number;
  onNext: (selectedId: string, isCorrect: boolean) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  rules_basics: "Rules",
  match_situations: "Match",
  world_cup_basics: "World Cup",
  tactics_lite: "Tactics",
  fan_culture: "Fan Life",
};

export function FootballIqQuestion({
  question,
  shuffledOptions,
  questionNumber,
  totalQuestions,
  onNext,
}: FootballIqQuestionProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const answered = selectedId !== null;
  const isCorrect = selectedId === question.correctOptionId;

  const handleSelect = (id: string) => {
    if (answered) return;
    setSelectedId(id);
  };

  const handleNext = () => {
    if (!answered || selectedId === null) return;
    onNext(selectedId, isCorrect);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300/70">
          {CATEGORY_LABELS[question.category] ?? question.category}
        </span>
        <span className="text-[11px] text-white/30">
          {questionNumber} / {totalQuestions}
        </span>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-[15px] font-bold leading-snug text-white">
          {question.question}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {shuffledOptions.map((opt) => {
          const isSelected = selectedId === opt.id;
          const isThisCorrect = opt.id === question.correctOptionId;

          let className =
            "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-[13px] font-semibold transition";

          if (!answered) {
            className +=
              " border-white/10 bg-white/5 text-white/80 hover:border-white/20 hover:bg-white/10 active:scale-[0.98]";
          } else if (isThisCorrect) {
            className +=
              " border-emerald-400/50 bg-emerald-400/15 text-emerald-100";
          } else if (isSelected && !isThisCorrect) {
            className += " border-red-400/40 bg-red-400/10 text-red-200/80";
          } else {
            className += " border-white/5 bg-white/2 text-white/30";
          }

          return (
            <button key={opt.id} onClick={() => handleSelect(opt.id)} className={className}>
              <span className="mt-0.5 shrink-0">
                {answered && isThisCorrect && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                )}
                {answered && isSelected && !isThisCorrect && (
                  <XCircle className="h-4 w-4 text-red-400" />
                )}
                {(!answered || (!isThisCorrect && !isSelected)) && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full border border-white/20 text-[10px] font-bold text-white/40">
                    {opt.id.toUpperCase()}
                  </span>
                )}
              </span>
              <span className="flex-1 leading-snug">{opt.text}</span>
            </button>
          );
        })}
      </div>

      {answered && (
        <div
          className={`rounded-xl border p-3 text-[12px] leading-relaxed ${
            isCorrect
              ? "border-emerald-400/25 bg-emerald-400/8 text-emerald-100/80"
              : "border-white/10 bg-white/5 text-white/60"
          }`}
        >
          <span className="mr-1 font-bold">{isCorrect ? "✓ Correct." : "Not quite."}</span>
          {question.explanation}
        </div>
      )}

      {answered && (
        <button
          onClick={handleNext}
          className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 text-sm font-extrabold text-white transition hover:from-indigo-400 hover:to-purple-400 active:scale-[0.98]"
        >
          {questionNumber < totalQuestions ? "Next question →" : "See results →"}
        </button>
      )}
    </div>
  );
}
