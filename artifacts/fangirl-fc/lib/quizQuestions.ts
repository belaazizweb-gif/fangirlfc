import type { QuizQuestion, FanIdentityId, QuizResult } from "@/types";

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    prompt: "When your team is losing, you:",
    options: [
      {
        label: "A",
        text: "Stay calm, the game's not over",
        weights: { tactical: 3, loyal: 2 },
      },
      {
        label: "B",
        text: "Start praying, lighting candles",
        weights: { soft: 3, screamer: 2 },
      },
      {
        label: "C",
        text: "Scream at everyone in the room",
        weights: { chaotic: 3, screamer: 2 },
      },
      {
        label: "D",
        text: "Pretend you don't even care",
        weights: { princess: 2, soft: 2 },
      },
    ],
  },
  {
    id: 2,
    prompt: "Your matchday vibe is:",
    options: [
      {
        label: "A",
        text: "Cute, calm, soft girl summer",
        weights: { soft: 3, princess: 2 },
      },
      {
        label: "B",
        text: "Loud, emotional, all caps",
        weights: { chaotic: 3, screamer: 2 },
      },
      {
        label: "C",
        text: "Strategic, focused, no talking",
        weights: { tactical: 3, loyal: 2 },
      },
      {
        label: "D",
        text: "Here for the drama, obviously",
        weights: { princess: 3, chaotic: 2 },
      },
    ],
  },
  {
    id: 3,
    prompt: "Your friend says football is boring. You:",
    options: [
      {
        label: "A",
        text: "Calmly explain the offside rule",
        weights: { tactical: 3, loyal: 1 },
      },
      {
        label: "B",
        text: "Block her jokingly in the chat",
        weights: { loyal: 3, chaotic: 2 },
      },
      {
        label: "C",
        text: "Force her to watch highlights",
        weights: { princess: 2, soft: 2 },
      },
      {
        label: "D",
        text: "Say 'wait until penalties'",
        weights: { screamer: 3, chaotic: 1 },
      },
    ],
  },
  {
    id: 4,
    prompt: "Your team scores in the last minute. You:",
    options: [
      {
        label: "A",
        text: "Cry. Real, full body cry.",
        weights: { soft: 3, screamer: 2 },
      },
      {
        label: "B",
        text: "Scream until the neighbours knock",
        weights: { chaotic: 2, screamer: 3 },
      },
      {
        label: "C",
        text: "Record everything for the story",
        weights: { princess: 3, chaotic: 1 },
      },
      {
        label: "D",
        text: "Act like you predicted this",
        weights: { tactical: 3, loyal: 2 },
      },
    ],
  },
  {
    id: 5,
    prompt: "Your World Cup personality is closest to:",
    options: [
      {
        label: "A",
        text: "Loyal — ride or die",
        weights: { loyal: 4, soft: 1 },
      },
      {
        label: "B",
        text: "Chaotic — bring the drama",
        weights: { chaotic: 4, screamer: 1 },
      },
      {
        label: "C",
        text: "Soft — feelings first",
        weights: { soft: 4, princess: 1 },
      },
      {
        label: "D",
        text: "Tactical — I read the game",
        weights: { tactical: 4, loyal: 1 },
      },
    ],
  },
];

export function scoreQuiz(answers: number[]): QuizResult {
  const scores: Record<FanIdentityId, number> = {
    chaotic: 0,
    loyal: 0,
    soft: 0,
    princess: 0,
    screamer: 0,
    tactical: 0,
  };

  answers.forEach((optionIdx, qIdx) => {
    const q = QUIZ_QUESTIONS[qIdx];
    if (!q) return;
    const option = q.options[optionIdx];
    if (!option) return;
    for (const [identity, weight] of Object.entries(option.weights)) {
      scores[identity as FanIdentityId] += weight ?? 0;
    }
  });

  let topId: FanIdentityId = "chaotic";
  let topScore = -Infinity;
  (Object.keys(scores) as FanIdentityId[]).forEach((id) => {
    if (scores[id] > topScore) {
      topScore = scores[id];
      topId = id;
    }
  });

  return { identityId: topId, scores, answers };
}
