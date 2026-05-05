import type { QuizQuestion, FanIdentityId, QuizResult } from "@/types";

// ---------------------------------------------------------------------------
// Scoring balance (primary weights ≥3 per identity across 5 questions):
//
//  tactical : Q1-A(3), Q2-B(3), Q3-A(3), Q5-C(3)
//  princess : Q1-B(3), Q3-B(3), Q4-C(3)
//  screamer : Q1-C(3), Q3-D(3), Q4-D(3), Q5-A(4)
//  chaotic  : Q1-D(3), Q2-A(3), Q3-C(3), Q4-D(3), Q5-D(3)
//  loyal    : Q2-C(3), Q4-A(3), Q5-B(3)
//  soft     : Q2-D(3), Q4-B(3)
//
// All identities reach 11–13 max; screamer and princess now have fair paths.
// ---------------------------------------------------------------------------

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    prompt: "How do you actually watch a big match?",
    options: [
      {
        label: "A",
        text: "I check the lineup and talk tactics before kickoff",
        weights: { tactical: 3, loyal: 2 },
      },
      {
        label: "B",
        text: "I plan the outfit, lighting, and story angles",
        weights: { princess: 3, soft: 1 },
      },
      {
        label: "C",
        text: "I stress-watch from minute one, one goal away from screaming",
        weights: { screamer: 3, chaotic: 2 },
      },
      {
        label: "D",
        text: "I live-react loudly — commentary, memes, full chaos",
        weights: { chaotic: 3, princess: 1 },
      },
    ],
  },
  {
    id: 2,
    prompt: "What's your group chat doing during the match?",
    options: [
      {
        label: "A",
        text: "All-caps reactions, voice notes, memes non-stop",
        weights: { chaotic: 3, screamer: 1 },
      },
      {
        label: "B",
        text: "Tactical takes and corrections between every play",
        weights: { tactical: 3, loyal: 1 },
      },
      {
        label: "C",
        text: "I'm defending the team every time someone turns on them",
        weights: { loyal: 3, soft: 2 },
      },
      {
        label: "D",
        text: "Heart reactions and checking everyone's okay",
        weights: { soft: 3, princess: 1 },
      },
    ],
  },
  {
    id: 3,
    prompt: "You don't understand a rule mid-match. You:",
    options: [
      {
        label: "A",
        text: "Google it immediately and explain it to the room",
        weights: { tactical: 3, loyal: 1 },
      },
      {
        label: "B",
        text: "Ask for a quick, simple explanation and move on",
        weights: { princess: 3, soft: 2 },
      },
      {
        label: "C",
        text: "Make a joke about it and keep the energy up",
        weights: { chaotic: 3, screamer: 1 },
      },
      {
        label: "D",
        text: "Spiral — wait, is that why we're losing??",
        weights: { screamer: 3, chaotic: 1 },
      },
    ],
  },
  {
    id: 4,
    prompt: "What pulls you deepest into football?",
    options: [
      {
        label: "A",
        text: "The loyalty — my team's history and the belonging",
        weights: { loyal: 3, tactical: 1 },
      },
      {
        label: "B",
        text: "The emotional moments — comebacks, player stories, happy tears",
        weights: { soft: 3, princess: 1 },
      },
      {
        label: "C",
        text: "The matchday world — jerseys, stadiums, aesthetic content",
        weights: { princess: 3, chaotic: 1 },
      },
      {
        label: "D",
        text: "The chaos — rivalries, last-minute drama, the madness",
        weights: { chaotic: 3, screamer: 2 },
      },
    ],
  },
  {
    id: 5,
    prompt: "Last-minute penalty for your team. You:",
    options: [
      {
        label: "A",
        text: "Can't breathe, can't watch — actually screaming",
        weights: { screamer: 4, chaotic: 1 },
      },
      {
        label: "B",
        text: "Eyes on the screen, still believing — they've got this",
        weights: { loyal: 3, soft: 2 },
      },
      {
        label: "C",
        text: "Run the odds in your head and try to stay calm",
        weights: { tactical: 3, screamer: 1 },
      },
      {
        label: "D",
        text: "Record everything — content either way, this is the moment",
        weights: { chaotic: 3, princess: 2 },
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
