"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { QUIZ_QUESTIONS, scoreQuiz } from "@/lib/quizQuestions";
import { QuestionCard } from "./QuestionCard";
import { awardStar } from "@/lib/stars";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/cn";

interface Props {
  compareTo?: string;
}

export function Quiz({ compareTo }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  useEffect(() => {
    trackEvent("quiz_started", { compareTo });
  }, [compareTo]);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(QUIZ_QUESTIONS.length).fill(null),
  );

  const current = QUIZ_QUESTIONS[step];
  const total = QUIZ_QUESTIONS.length;
  const progress = useMemo(
    () => ((step + 1) / total) * 100,
    [step, total],
  );

  const select = (idx: number) => {
    const next = [...answers];
    next[step] = idx;
    setAnswers(next);
  };

  const goNext = () => {
    if (answers[step] === null) return;
    if (step < total - 1) {
      setStep(step + 1);
    } else {
      const finalAnswers = answers.map((a) => a ?? 0);
      const result = scoreQuiz(finalAnswers);
      // Silent: ResultCard's per-identity award will surface the toast.
      // Keeps global stars in sync without double-toasting.
      awardStar("quiz_completed", { silent: true });
      const params = new URLSearchParams({ id: result.identityId });
      if (compareTo) params.set("compareTo", compareTo);
      router.push(`/result?${params.toString()}`);
    }
  };

  const goBack = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-pink-400 via-fuchsia-400 to-violet-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <QuestionCard
        question={current!}
        index={step}
        total={total}
        selected={answers[step]}
        onSelect={select}
      />

      <div className="flex items-center justify-between gap-3">
        <button
          onClick={goBack}
          disabled={step === 0}
          className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/70 disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <button
          onClick={goNext}
          disabled={answers[step] === null}
          className={cn(
            "shine-button flex items-center gap-1 rounded-full px-5 py-3 text-sm",
            "disabled:cursor-not-allowed disabled:opacity-40",
          )}
        >
          {step === total - 1 ? "Reveal my fan type" : "Next"}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
