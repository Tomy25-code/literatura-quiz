# Literatura Quiz — Project Instructions

## Project

Bulgarian literature quiz website for матура по български език и литература (Bulgarian language and literature graduation exam).

`main` is the live v1 production branch on Vercel and must not be touched. All v2 development happens in branches off `v2/main`.

---

## Tech Stack

- Vite + React (JSX)
- Plain CSS — no CSS framework
- Static JSON data only
- No backend, no API calls, no server-side logic
- localStorage for user progress, wrong answers, and preferences

---

## Repository Structure

The app lives directly at the repository root (not in a nested subfolder).

```
src/data/         ← JSON content files — treat as protected
src/components/   ← React components
src/utils/        ← quiz logic, stats, localStorage helpers
scripts/          ← Node QA and data utility scripts
reports/          ← auto-generated QA output (do not hand-edit)
source/           ← source reference notes (read-only reference)
```

---

## Data Files

| File | Contents |
|------|----------|
| `src/data/authors.json` | 20 Bulgarian authors |
| `src/data/works.json` | 27 literary works |
| `src/data/questions.json` | 462 multiple-choice quiz questions |

---

## Data Integrity Rules

- **Do not modify any JSON data file unless explicitly asked by the user.**
- Do not invent literary facts. Every fact in question/explanation fields must be traceable to the existing JSON data or to `source/literatura-zapiski.md`.
- Questions must come from `questions.json`. Authors from `authors.json`. Works from `works.json`.
- After any change to a JSON data file, run both QA scripts and confirm 0 errors before committing.
- Do not add, remove, or rename fields in the JSON schema without discussion first.

---

## QA Scripts

```bash
npm run qa:content   # structural validation (cross-refs, duplicates, field checks)
npm run qa:source    # cross-check data against source notes
```

Both scripts write reports to `reports/`. `qa:content` exits with code 1 on hard errors.

---

## UI Rules

- The UI language must be Bulgarian at all times. No English visible to the user.
- The app must remain mobile-responsive (tested on both mobile and desktop).
- Keep components small and readable.
- Do not introduce a CSS framework unless explicitly requested.

---

## Architecture Rules

- The app must remain fully static — no backend, no API calls, no server-side rendering.
- Do not add a database or authentication layer.
- Do not store question/answer data in localStorage — only user progress, wrong answers, and preferences.
- Do not add external runtime dependencies without discussion.

---

## Branch Workflow

```
main                      ← v1 production (live on Vercel) — protected
│
└── v2/main               ← v2 integration branch (merge target for all v2 work)
    └── v2/feature-xyz    ← individual v2 feature branches
```

- **Never push experimental or in-progress work to `main`.**
- **Branch all v2 work off `v2/main`.**
- Merge to `v2/main` via PR when build and QA pass.
- Merge to `main` only when a v2 release is fully tested and signed off.

---

## Development Commands

```bash
npm install       # install dependencies
npm run dev       # dev server → http://localhost:5173
npm run build     # production build → dist/
npm run lint      # ESLint
npm run qa:content
npm run qa:source
```

---

## localStorage Keys

All localStorage keys used by the app. Do not change key names without migrating existing data.

| Key | File | Purpose |
|-----|------|---------|
| `literaturaQuizStats` | `src/utils/stats.js` | Array of quiz attempt records |
| `literaturaQuizLength` | `src/utils/settings.js` | User's selected quiz length (5/10/15/20) |
| `literaturaQuizWrongReview` | `src/utils/wrongAnswers.js` | Smart wrong-review metadata map |
| `literaturaQuizWrongQuestionIds` | `src/utils/wrongAnswers.js` | Legacy wrong-answer ID array (auto-migrated, then deleted) |
| `literaturaQuizDailyPractice` | `src/utils/dailyPractice.js` | Daily practice completion and streak |

### `literaturaQuizStats` — shape

Array of attempt objects:
```json
{
  "id": "timestamp string",
  "timestamp": "ISO 8601",
  "quizMode": "random | author | work | category | difficulty | wrong | weakSpots | dailyPractice",
  "modeLabel": "human-readable label",
  "totalQuestions": 10,
  "correctAnswers": 7,
  "percentage": 70,
  "questionIds": ["q-id", "..."],
  "correctIds": ["q-id", "..."],
  "wrongIds": ["q-id", "..."],
  "categories": ["author", "genre", "..."],
  "difficulties": ["easy", "medium", "..."]
}
```

### `literaturaQuizLength` — shape

Single integer stored as a string: `"10"`. Valid values: `5`, `10`, `15`, `20`. Defaults to `10` if missing or invalid.

### `literaturaQuizWrongReview` — shape

Object keyed by question ID:
```json
{
  "question-id": {
    "id": "question-id",
    "wrongCount": 2,
    "correctStreak": 1,
    "lastWrongAt": "ISO 8601",
    "lastCorrectAt": "ISO 8601 or null",
    "masteredAt": "ISO 8601 or null",
    "status": "active | mastered"
  }
}
```

Migration: if `literaturaQuizWrongQuestionIds` (old array format) exists and `literaturaQuizWrongReview` does not, the old IDs are migrated automatically on first read with `wrongCount: 1, correctStreak: 0, status: 'active'`. The old key is then deleted.

### `literaturaQuizDailyPractice` — shape

```json
{
  "lastDate": "YYYY-MM-DD or null",
  "count": 5,
  "streak": 3,
  "bestStreak": 7
}
```

---

## Implemented V2 Features (Phase 1 — Smart Practice)

### Weak Spots mode (`Слаби места`)

- Entry: `src/utils/weakSpots.js` — `buildWeakSpotsQuiz()`, `hasWeakSpots()`, `getWeakSets()`
- Qualification: a question qualifies if it is in the active wrong-review queue, OR belongs to a category/difficulty where accuracy is below 70% over at least 10 answered questions.
- Historical wrong count is used for scoring only, not admission — mastered questions do not re-enter.
- **Must not fall back to random questions if no weak spots exist.** Show the empty state instead.
- Priority scoring: `+4` active wrong queue, `+3` per historical wrong answer, `+2` weak category, `+1` weak difficulty, `−1` per historical correct answer.

### Daily Practice mode (`Дневна тренировка`)

- Entry: `src/utils/dailyPractice.js` — `buildDailyPracticeQuiz()`, `getDailyPracticeState()`, `saveDailyPracticeCompletion()`
- Selection split (target length N): `floor(N × 0.4)` wrong, `floor(N × 0.4)` weak, remainder random.
- Shortfalls redistribute forward: wrong shortage → weak quota, weak shortage → random quota.
- Random pool prefers unseen questions first.
- **Correct answers in Daily Practice must NOT call `recordWrongQuestionCorrect` and must NOT advance `correctStreak`.** They are recorded in stats only.
- Wrong answers in Daily Practice DO call `saveWrongQuestionId` and update the wrong-review record.
- Streak increments at most once per local calendar date. Repeating Daily Practice on the same day is allowed.

### Smart Wrong Review (`Преговор на грешните`)

- Entry: `src/utils/wrongAnswers.js` — `buildWrongReviewQuiz()`, `saveWrongQuestionId()`, `recordWrongQuestionCorrect()`
- A question is marked `status: 'mastered'` only after **2 consecutive correct answers** (`correctStreak >= 2`) in a focused remediation mode.
- **Focused remediation modes:** Wrong Review (`wrong`) and Weak Spots (`weakSpots`) only.
- Getting a question wrong in any mode resets `correctStreak` to 0 and increments `wrongCount`.
- Regular quizzes and Daily Practice can add wrong-answer records but cannot master/remove questions.
- Selection priority: higher `wrongCount` → lower `correctStreak` → more recent `lastWrongAt` → random tie-breaker.
- Wrong Review is never padded with non-wrong questions.

### Quiz.jsx remediation behavior

- Prop `isRemediationMode` is `true` for `wrong` and `weakSpots` quiz modes only.
- Correct answer + `isRemediationMode`: calls `recordWrongQuestionCorrect(id)`. Shows amber progress message if `correctStreak < 2`, green mastered message if `correctStreak >= 2`.
- Wrong answer + `isRemediationMode`: calls `saveWrongQuestionId(id)`, shows "stays in queue" note.
- Correct answer without `isRemediationMode`: no wrong-review interaction.
- Wrong answer without `isRemediationMode`: calls `saveWrongQuestionId(id)`.
