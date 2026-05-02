# Project Overview

Monorepo built on the Replit pnpm workspace template.

## Artifacts

- **fangirl-fc** (`artifacts/fangirl-fc`) — Mobile-first **Next.js 16 PWA** for World Cup 2026.
  - Path: `/` · Port: `24216`
  - Stack: Next.js App Router, TypeScript, Tailwind CSS v4, Firebase Firestore (optional), html-to-image, lucide-react, nanoid
  - Features: 5-question quiz → 6 fan identities (Chaotic Fan, Loyal Queen, Soft Fan, Matchday Princess, Last Minute Screamer, Tactical Girl), star progression (localStorage), fan card generator with PNG export, share/compare flow `/compare/[shareId]`, Sticker Tracker placeholder.
  - **Privacy**: selfies are loaded via `FileReader` and live only in component state. Never uploaded.
  - **Mock mode**: when `NEXT_PUBLIC_FIREBASE_*` env vars are missing, share links fall back to a localStorage store (`lib/mockStore.ts`).
  - **Disclaimer**: footer on every page notes the app is fan-made and not affiliated with FIFA.
- **api-server** (`artifacts/api-server`) — Express API at `/api`, port 8080. (Unused by fangirl-fc.)
- **mockup-sandbox** (`artifacts/mockup-sandbox`) — Canvas component preview server at `/__mockup`, port 8081.

## Key files in fangirl-fc

- `app/layout.tsx` — root layout, header, footer disclaimer, PWA metadata.
- `app/page.tsx` + `components/LandingHero.tsx` — landing.
- `app/quiz/page.tsx` + `components/Quiz.tsx` + `components/QuestionCard.tsx` — quiz.
- `app/result/page.tsx` + `components/ResultCard.tsx` — identity reveal.
- `app/card/page.tsx` + `components/FanCard.tsx` etc. — card editor + share.
- `app/compare/[shareId]/page.tsx` + `components/ComparisonResult.tsx` — friend comparison.
- `lib/quizQuestions.ts` — questions + weighted scoring.
- `lib/fanTypes.ts` — 6 identities.
- `lib/teams.ts` — 48 World Cup nations.
- `lib/templates.ts` — 6 card templates.
- `lib/stars.ts` — localStorage star progression.
- `lib/firebase.ts` + `lib/share.ts` + `lib/mockStore.ts` — share persistence with mock fallback.
- `lib/exportImage.ts` — html-to-image PNG export wrapper.

## Environment variables (optional)

Only needed for cross-device share links. Without them the app falls back to localStorage:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

## User preferences

- Mobile-first design.
- No emojis in UI chrome (fan-identity emojis are user-facing content, allowed).
- Selfies must stay local — never uploaded.
