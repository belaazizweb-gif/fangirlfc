"use client";

import type { QuizQuestion } from "@/types";
import { cn } from "@/lib/cn";

interface Props {
  question: QuizQuestion;
  index: number;
  total: number;
  selected: number | null;
  onSelect: (idx: number) => void;
}

export function QuestionCard({
  question,
  index,
  total,
  selected,
  onSelect,
}: Props) {
  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-white/50">
        <span>Question {index + 1} / {total}</span>
        <span>Fangirl FC</span>
      </div>
      <h2 className="mt-3 text-xl font-bold leading-tight">{question.prompt}</h2>
      <div className="mt-5 flex flex-col gap-2.5">
        {question.options.map((opt, i) => {
          const isSelected = selected === i;
          return (
            <button
              key={opt.label}
              onClick={() => onSelect(i)}
              className={cn(
                "group flex items-start gap-3 rounded-2xl border px-4 py-3 text-left transition active:scale-[0.99]",
                isSelected
                  ? "border-pink-400/60 bg-pink-400/15 glow-pink"
                  : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  isSelected
                    ? "bg-pink-400 text-black"
                    : "bg-white/10 text-white/80 group-hover:bg-white/20",
                )}
              >
                {opt.label}
              </span>
              <span className="text-[15px] leading-snug text-white/90">
                {opt.text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
