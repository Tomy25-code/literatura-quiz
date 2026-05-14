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
| `src/data/questions.json` | 415 manually curated base questions (canonical) |
| `src/data/questions.v2.json` | 81 generated variant questions (do not edit by hand) |
| `src/data/questions.types.json` | 59 generated type questions — true/false + match (do not edit by hand) |
| `src/data/questions.fillblank.json` | 83 generated fill-in-the-blank questions (do not edit by hand) |

---

## Data Integrity Rules

- **Do not modify any JSON data file unless explicitly asked by the user.**
- Do not invent literary facts. Every fact in question/explanation fields must be traceable to the existing JSON data or to `source/literatura-zapiski.md`.
- Questions must come from `questions.json`. Authors from `authors.json`. Works from `works.json`.
- After any change to a JSON data file, run **all three QA scripts** and confirm 0 errors before committing.
- Do not add, remove, or rename fields in the JSON schema without discussion first.

### Generated questions files

- **Never manually edit `src/data/questions.v2.json`, `src/data/questions.types.json`, or `src/data/questions.fillblank.json`** unless explicitly asked. All three are generated output.
- `questions.json` is the canonical curated base set. The other three files are derived output.
- Always run `npm run generate:variants` after changing `authors.json` or `works.json` fields that affect alternate-phrasing variants (author names, work titles, genres, key_facts, nicknames).
- Always run `npm run generate:types` after changing `authors.json` or `works.json` (affects true/false and match questions).
- Always run `npm run generate:fillblank` after changing `authors.json` or `works.json` fields that affect fill-blank answers (author names, work titles, genres, year_or_period, nicknames).
- Always run `npm run build` and all three QA scripts after regeneration.

### Fill-blank question rules

- **Do not hand-edit `src/data/questions.fillblank.json`.** Regenerate with `npm run generate:fillblank`.
- Every `correctAnswer` and every entry in `acceptedAnswers` must be directly traceable to a field in `authors.json` or `works.json`. Do not invent facts.
- `acceptedAnswers` must include the `correctAnswer` value (after normalization) and all safe alternate forms (e.g. year with and without "г.", genre base word).
- Banned vague answers: `"състоянието"`, `"раздялата"`, `"добротата"`, `"човешкото"`, `"живота"`, `"света"`. These are caught by `qa:content` (`FILLBLANK_VAGUE_ANSWER`).
- Do not add fill-blank templates that require subjective interpretation. Blanks must have one objectively correct answer derivable from the source data fields.

---

## QA Scripts

```bash
npm run generate:variants   # regenerate src/data/questions.v2.json from authors/works
npm run generate:types      # regenerate src/data/questions.types.json (true/false + match)
npm run generate:fillblank  # regenerate src/data/questions.fillblank.json (fill-in-the-blank)
npm run qa:content          # structural validation — validates all four questions files
npm run qa:source           # cross-check base data fields against source/literatura-zapiski.md (skips generated)
npm run qa:semantic         # pedagogical quality — flags weak answers, duplicates, generic explanations
```

All three scripts write reports to `reports/`. `qa:content` exits with code 1 on hard errors; the others exit 0 but print severity-tagged findings to the console.

### What each script checks

| Script | Checks | Blocker threshold |
|--------|--------|-------------------|
| `qa:content` | Field presence, type correctness, cross-references, valid category/difficulty/type, duplicate IDs — across all four question files; fill_blank-specific: ID format, acceptedAnswers, banned vague answers | Any error → exits 1 |
| `qa:source` | Correctness of data fields against `source/literatura-zapiski.md`; skips generated questions (validated by generator) | Errors only (warnings acceptable) |
| `qa:semantic` | CATEGORY_SOURCE_MISMATCH, DUPLICATE_CONCEPT (base only), ESSAY_WEAK_ANSWER, TOO_ABSTRACT_ANSWER, GENERIC_EXPLANATION | High-severity findings must be resolved before merge |

### Current accepted backlog (non-blocking)

| Code | Count | Severity |
|------|-------|----------|
| `GENERIC_EXPLANATION` | ~95 | low |
| `TOO_ABSTRACT_ANSWER` | ~20 | medium |
| `ESSAY_WEAK_ANSWER` | ~15 | medium |

These are cosmetic quality issues, not structural errors. Address them opportunistically during content expansion.

---

## Content Authoring Rules

Apply these rules whenever writing or editing questions, explanations, or options:

1. **Do not invent literary facts.** Every answer, distractor, and explanation must be traceable to `src/data/authors.json`, `src/data/works.json`, or `source/literatura-zapiski.md`.
2. **Do not use abstract one-word answers** (`"доброто"`, `"народ"`, `"абсурдът"`) unless the source data explicitly lists that exact phrase as a theme or motif. Prefer fuller interpretative phrases.
3. **Do not add duplicate questions.** Before adding a question for a given `workId`/`authorId` + `category`, check that no existing question uses the same correct answer for the same scope.
4. **Do not label structural facts as themes.** If an answer comes from `work.composition` or `work.creative_history`, do not categorize it as `themes` or `essay_preparation` unless it is also present in `work.themes` or `work.motifs`.
5. **Essay preparation answers must be interpretative.** A correct answer for `category: "essay_preparation"` must be a phrase of at least 20 characters that names a meaningful analytical angle, not just a word extracted from the notes.
6. **Do not cluster author distractors by first name.** When all four options are author names, at most 2 options may share the same first name. Use `pickDiverseAuthorDistractors()` in the generator; `qa:content` will warn `CLUSTERED_FIRST_NAME` if this rule is violated.
7. **After any change to `src/data/*.json`, run all three QA scripts** (`qa:content`, `qa:source`, `qa:semantic`) and confirm zero errors before committing.

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
npm install              # install dependencies
npm run dev              # dev server → http://localhost:5173
npm run build            # production build → dist/
npm run lint             # ESLint
npm run qa:content
npm run qa:source
npm run generate:variants   # regenerate questions.v2.json
npm run generate:types      # regenerate questions.types.json
npm run generate:fillblank  # regenerate questions.fillblank.json
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

---

## Implemented V2 Features (Phase 2 — Question Types)

### True/False and Match questions (`questions.types.json`)

- Generator: `scripts/generate-question-types.mjs` (`npm run generate:types`)
- `true_false` questions have exactly `options: ["Вярно", "Невярно"]` and `type: "true_false"`.
- `match_author_work` questions have `pairs[]`, `options[]` (work titles), `authorIds[]`, `workIds[]`.
- The `"Вярно/невярно"` category filter is type-gated: only questions with `type: "true_false"` appear there. Legacy base questions with `category: "true_false"` but no `type` field are statement-selection questions and are excluded from that filter.
- Match correctness uses sentinel values `'__correct__'` / `'__wrong__'` as `selectedAnswer` — correctness is determined by comparing all dropdown selections against `pair.workTitle`.

### Fill-in-the-blank questions (`questions.fillblank.json`)

- Generator: `scripts/generate-fill-blank-questions.mjs` (`npm run generate:fillblank`)
- Component: `src/components/FillBlankQuestion.jsx`
- `type: "fill_blank"`, `category: "fill_blank"`, ID prefix `qfb-`.
- Fields: `correctAnswer` (display form), `acceptedAnswers[]` (normalized matching set).
- Answer matching: `normalize(userInput) === normalize(acceptedAnswer)` where `normalize` does `.toLowerCase().replace(/[„""«»]/g, '').replace(/\s+/g, ' ').trim()`.
- Correctness communicated to Quiz.jsx via the same sentinel pattern as match (`'__correct__'` / `'__wrong__'`).
- All quiz modes, wrong review, weak spots, and daily practice treat fill-blank questions identically to multiple-choice questions (tracked by `question.id`).
- On wrong answer: reveals "Правилният отговор е: „{correctAnswer}"" in the feedback block.
- Enter key submits; button disabled while input is empty or after answering.
