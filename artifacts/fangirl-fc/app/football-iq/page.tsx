"use client";

import { useEffect, useState } from "react";
import { Brain } from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { FootballIqIntro } from "@/components/football-iq/FootballIqIntro";
import { FootballIqQuestion } from "@/components/football-iq/FootballIqQuestion";
import { FootballIqResult } from "@/components/football-iq/FootballIqResult";
import {
  getDailyQuestions,
  shuffleOptions,
  hasCompletedFootballIQToday,
  recordFootballIQSession,
  getFootballIQLevel,
  type FootballIQSessionResult,
} from "@/lib/footballIqEngine";
import { readProgression } from "@/lib/progression";
import type { FootballIqQuestion as TQuestion, FootballIqOption } from "@/lib/footballIqQuestions";

type Screen = "intro" | "q1" | "q2" | "result";

interface Answer {
  questionId: string;
  selectedId: string;
  correct: boolean;
  category: TQuestion["category"];
}

export default function FootballIQPage() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [questions, setQuestions] = useState<[TQuestion, TQuestion] | null>(null);
  const [opts, setOpts] = useState<[FootballIqOption[], FootballIqOption[]]>([[], []]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [sessionResult, setSessionResult] = useState<FootballIQSessionResult | null>(null);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [iqStats, setIqStats] = useState({ level: 0, totalCorrect: 0 });
  const [lastIdentityId, setLastIdentityId] = useState("chaotic");

  useEffect(() => {
    const qs = getDailyQuestions();
    setQuestions(qs);
    setOpts([shuffleOptions(qs[0].options), shuffleOptions(qs[1].options)]);
    setIsPracticeMode(hasCompletedFootballIQToday());
    const s = readProgression();
    setIqStats({
      level: getFootballIQLevel(s.footballIQ.totalCorrect),
      totalCorrect: s.footballIQ.totalCorrect,
    });
    const stored = window.localStorage.getItem("fangirlfc.lastIdentity");
    if (stored) setLastIdentityId(stored);
  }, []);

  const handleStart = () => {
    setAnswers([]);
    setSessionResult(null);
    if (questions) {
      const qs = getDailyQuestions();
      setOpts([shuffleOptions(qs[0].options), shuffleOptions(qs[1].options)]);
    }
    setScreen("q1");
  };

  const handleAnswerQ1 = (selectedId: string, correct: boolean) => {
    if (!questions) return;
    const q = questions[0];
    setAnswers([{ questionId: q.id, selectedId, correct, category: q.category }]);
    setScreen("q2");
  };

  const handleAnswerQ2 = (selectedId: string, correct: boolean) => {
    if (!questions) return;
    const q = questions[1];
    const allAnswers: Answer[] = [
      ...answers,
      { questionId: q.id, selectedId, correct, category: q.category },
    ];
    setAnswers(allAnswers);

    const result = recordFootballIQSession(
      allAnswers.map((a) => ({
        questionId: a.questionId,
        correct: a.correct,
        category: a.category,
      })),
    );

    setSessionResult(result);
    setIqStats({
      level: result.newFootballIQLevel,
      totalCorrect: readProgression().footballIQ.totalCorrect,
    });
    setIsPracticeMode(true);
    setScreen("result");
  };

  const handlePlayAgain = () => {
    setAnswers([]);
    setSessionResult(null);
    if (questions) {
      setOpts([shuffleOptions(questions[0].options), shuffleOptions(questions[1].options)]);
    }
    setScreen("q1");
  };

  return (
    <main className="min-h-screen bg-[#0d0d1a] text-white">
      <div className="mx-auto max-w-lg px-4 py-6">
        <div className="flex items-center gap-2 text-2xl font-extrabold">
          <Brain className="h-6 w-6 text-indigo-400" />
          Football IQ
        </div>
        <p className="mt-1 text-[13px] text-white/50">
          World Cup 2026 · 2 questions a day
        </p>

        <TopNav />

        <div className="mt-6">
          {screen === "intro" && (
            <FootballIqIntro
              isPracticeMode={isPracticeMode}
              currentLevel={iqStats.level}
              totalCorrect={iqStats.totalCorrect}
              onStart={handleStart}
            />
          )}

          {screen === "q1" && questions && (
            <FootballIqQuestion
              question={questions[0]}
              shuffledOptions={opts[0]}
              questionNumber={1}
              totalQuestions={2}
              onNext={handleAnswerQ1}
            />
          )}

          {screen === "q2" && questions && (
            <FootballIqQuestion
              question={questions[1]}
              shuffledOptions={opts[1]}
              questionNumber={2}
              totalQuestions={2}
              onNext={handleAnswerQ2}
            />
          )}

          {screen === "result" && sessionResult && (
            <FootballIqResult
              correctCount={sessionResult.correctCount}
              totalCount={sessionResult.totalCount}
              xpEarned={sessionResult.xpEarned}
              badgesUnlocked={sessionResult.badgesUnlocked}
              footballIQLevel={sessionResult.newFootballIQLevel}
              isPracticeMode={sessionResult.isPracticeMode}
              lastIdentityId={lastIdentityId}
              onPlayAgain={handlePlayAgain}
            />
          )}
        </div>
      </div>
    </main>
  );
}
