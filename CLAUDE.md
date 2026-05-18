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
| `src/data/questions.recognition.json` | 64 generated thematic work-recognition questions (do not edit by hand) |

**Total question pool: 415 + 81 + 59 + 83 + 64 = 702 questions**

---

## Data Integrity Rules

- **Do not modify any JSON data file unless explicitly asked by the user.**
- Do not invent literary facts. Every fact in question/explanation fields must be traceable to the existing JSON data or to `source/literatura-zapiski.md`.
- Questions must come from `questions.json`. Authors from `authors.json`. Works from `works.json`.
- After any change to a JSON data file, run **all three QA scripts** and confirm 0 errors before committing.
- Do not add, remove, or rename fields in the JSON schema without discussion first.

### Generated questions files

- **Never manually edit `src/data/questions.v2.json`, `src/data/questions.types.json`, `src/data/questions.fillblank.json`, or `src/data/questions.recognition.json`** unless explicitly asked. All four are generated output.
- `questions.json` is the canonical curated base set. The other four files are derived output.
- Always run `npm run generate:variants` after changing `authors.json` or `works.json` fields that affect alternate-phrasing variants (author names, work titles, genres, key_facts, nicknames).
- Always run `npm run generate:types` after changing `authors.json` or `works.json` (affects true/false and match questions).
- Always run `npm run generate:fillblank` after changing `authors.json` or `works.json` fields that affect fill-blank answers (author names, work titles, genres, year_or_period, nicknames).
- Always run `npm run generate:work-recognition` after changing `authors.json` or `works.json` fields that affect thematic content (themes, motifs).
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
npm run generate:variants          # regenerate src/data/questions.v2.json from authors/works
npm run generate:types             # regenerate src/data/questions.types.json (true/false + match)
npm run generate:fillblank         # regenerate src/data/questions.fillblank.json (fill-in-the-blank)
npm run generate:work-recognition  # regenerate src/data/questions.recognition.json (thematic recognition)
npm run qa:content                 # structural validation — validates all five questions files
npm run qa:source                  # cross-check base data fields against source/literatura-zapiski.md (skips generated)
npm run qa:semantic                # pedagogical quality — flags weak answers, duplicates, generic explanations
```

All three scripts write reports to `reports/`. `qa:content` exits with code 1 on hard errors; the others exit 0 but print severity-tagged findings to the console.

### What each script checks

| Script | Checks | Blocker threshold |
|--------|--------|-------------------|
| `qa:content` | Field presence, type correctness, cross-references, valid category/difficulty/type, duplicate IDs — across all five question files; fill_blank-specific: ID format, acceptedAnswers, banned vague answers; recognition-specific: workId required, correctAnswer = work.title, unique options, sourceFields present | Any error → exits 1 |
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

## UI / Navigation Rules

- **Do not add routing libraries** (React Router, etc.) unless explicitly requested. Use React `useState` for all screen/tab state.
- **Keep "Какво да уча днес?" always visible** near the top of the home screen, above the tab navigation. Do not hide it inside a tab.
- **All user-facing labels must be in Bulgarian.** No English text visible to the user.
- **Keep home navigation mobile responsive.** The tab bar must not create horizontal overflow on a 375 px viewport. Tabs may shrink text slightly but must remain readable.
- **Do not hide core modes behind confusing labels.** Tabs group modes by purpose (tests / smart practice / reference cards / stats / help); the label must clearly indicate what is inside.
- **Home navigation component:** `src/components/HomeNavigation.jsx` — five tabs: Тестове, Практика, Справочник, Статистика, Помощ.
- **Tab state is local React state** in `HomeNavigation.jsx`. It is not persisted to localStorage and resets to "Тестове" on every home screen visit.
- **ModeSelector.jsx** has been deleted — superseded by `HomeNavigation.jsx`.

## Theme Rules

- **localStorage key:** `literaturaQuizTheme`. Allowed values: `"dark"`, `"light"`, `"system"`. Invalid/missing → `"system"`.
- **Do not add new theme values** without an explicit request.
- **Theme is applied by setting `document.documentElement.dataset.theme`** to `"dark"` or `"light"`. JS always resolves "system" to the actual OS preference via `window.matchMedia`.
- **CSS uses `[data-theme="dark"]` selectors only** for dark overrides — no `@media (prefers-color-scheme: dark)` in `App.css` or `index.css`. The JS handles system preference detection.
- **All new components must be theme-aware** — use CSS variables (`--bg`, `--text`, `--text-h`, `--border`, `--accent`, etc.) rather than hardcoded colors. Do not add `@media (prefers-color-scheme: dark)` blocks; add `[data-theme="dark"]` overrides if needed.
- **Theme utility:** `src/utils/theme.js` — `getStoredTheme()`, `saveTheme()`, `resolveTheme()`, `applyTheme()`.

---

## Development Commands

```bash
npm install                        # install dependencies
npm run dev                        # dev server → http://localhost:5173
npm run build                      # production build → dist/
npm run lint                       # ESLint
npm run qa:content
npm run qa:source
npm run generate:variants          # regenerate questions.v2.json
npm run generate:types             # regenerate questions.types.json
npm run generate:fillblank         # regenerate questions.fillblank.json
npm run generate:work-recognition  # regenerate questions.recognition.json
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

### Question Variant Generator (`questions.v2.json`)

- Generator: `scripts/generate-question-variants.mjs` (`npm run generate:variants`)
- `type: "multiple_choice"`, ID prefix `qv-`.
- Four variant templates generated from existing `authors.json` / `works.json` data:

| Type | Count | Template |
|------|-------|----------|
| Alternate work → author | 27 | "Кой е авторът на „X"?" |
| Work recognition | 26 | "За коя творба се отнася следният факт: „X"?" |
| Alternate author → work | 20 | "Кое от изброените произведения е написано от X?" |
| Reverse nickname | 8 | "Кой автор е известен с прозвището „X"?" |

- 1 work skipped for recognition template: „История" (title word appears in all key_facts as substring).
- `qa:semantic` DUPLICATE_CONCEPT check is restricted to base questions only — generated variants are intentional alternate phrasings.
- `qa:source` skips generated questions — they are validated by the generator from already-verified data.

### Distractor diversity (`pickDiverseAuthorDistractors()`)

- Problem: a naive random pick can produce 3 distractors that all share a first name (e.g. Христо Ботев, Христо Смирненски, Христо Фотев), making options hard to distinguish.
- Solution: `pickDiverseAuthorDistractors()` in the variant generator uses 3-pass progressive relaxation: max 1 same first name → max 2 → no constraint as emergency fallback.
- Applied to Type A (work → author) and Type D (nickname → author) loops; Types B and C use work titles and are unaffected.
- `qa:content` warns `CLUSTERED_FIRST_NAME` when 3+ options share a first name in any `author`/`nickname` category question.

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

### Thematic work-recognition questions (`questions.recognition.json`)

- Generator: `scripts/generate-work-recognition-questions.mjs` (`npm run generate:work-recognition`)
- `type: "multiple_choice"`, `category: "work_recognition"`, ID prefix `qr-`.
- These are richer than the bibliographic recognition variants in `questions.v2.json` — clues come from `work.themes` and `work.motifs`, not from `key_facts`.
- Three templates: theme-pair (T1, medium), motif-pair (T2, hard), essay-theme (T3, medium).
- Clue uniqueness guarantee: every clue value or pair appears in exactly one work's themes/motifs across the whole dataset. The generator enforces this at generation time and skips any clue that would be ambiguous.
- Distractors prefer cross-author works; selection is hash-seeded (deterministic).
- `sourceFields` array on each question records which work fields produced the clue — used by QA.
- All existing quiz modes, wrong review, weak spots, daily practice, and filters work automatically since the questions carry `authorId` and `workId`.

---

## Implemented V2 Features (Phase 3 — Essay Preparation)

### Phase 3 Step 2 — INTENTIONALLY DEFERRED

**Do not implement Essay Prep mode (Step 2) without an explicit request.** It requires careful manual curation of essay topics (`src/data/essayTopics.json`) and a reference-panel UX. There is no automatic generation path for this content. Implementing it without the curated content would mean inventing facts, which violates the data integrity rules above.

### Study Guide mode — Phase 3 Step 1 (`Падна ми се автор/произведение`)

- Entry: `src/components/StudyGuide.jsx` (selection screen), `src/components/StudyGuideDetail.jsx` (detail card)
- Mode ID: `'studyGuide'` — handled in `App.jsx` `handleModeSelect`, sets `screen` to `'study-guide'`
- Screen states: `'study-guide'` → selection; `'study-guide-detail'` → author or work card
- **This is not a quiz mode.** It must not affect stats, wrong-answer review, weak spots, daily practice streak, or any localStorage learning state.
- Data sourced exclusively from `authors.json` and `works.json` — no facts invented.
- Sections with missing/empty data are hidden (not shown as placeholder text).
- Author card sections: Период, Литературен контекст, Основни теми, Ключови факти, Произведения
- Work card sections: Автор, Жанр, Година / период, Творческа история, Композиция, Теми, Мотиви, Ключови идеи
- Works listed under an author are clickable — navigate directly to the work study card.
- Back from detail → study-guide selection screen. Back from selection → home.

### Thesis Practice mode — Phase 3 Step 3 (`Избери теза`)

- Mode ID: `'thesisPractice'` — handled in `App.jsx` `handleModeSelect` / `startQuiz`
- Builder: `buildThesisPracticeQuiz({ allQuestions, length })` in `src/utils/quiz.js`
- **Filter rule:** `category === 'essay_preparation'` only — 47 questions, all from `questions.json`, all `difficulty: hard`
- **No invented thesis content.** Every answer is directly sourced from existing JSON fields. Do not generate new thesis content automatically.
- **No fallback to unrelated random questions.** If the pool is empty, shows a clean empty state (`screen === 'thesis-practice-empty'`); never pads with author/genre/year/recognition questions.
- Quiz length uses the user's selected quiz length from the home screen; if fewer questions exist than the selected length, runs with the available count.
- Stats, wrong-answer review, smart wrong review, weak spots, and daily practice all interact with thesis-practice questions identically to any other quiz mode.

---

## Implemented V2 Features (Phase 4 — Guided Learning)

### Today Plan dashboard — Phase 4 Step 1 (`Какво да уча днес?`)

- Entry: `src/components/TodayPlan.jsx` (home-screen widget), `src/utils/todayPlan.js` (recommendation logic)
- Placement: home screen, between `StatsSummary` and `ModeSelector`.
- **Read-only recommendation layer.** Viewing the dashboard does NOT modify stats, wrong-answer review, daily streak, or any localStorage learning state. No new localStorage keys are written.
- **No invented facts.** Recommendations are derived solely from existing localStorage data and existing JSON question pool metadata.
- **No JSON data file modifications.** Does not touch any file in `src/data/`.
- **No new quiz logic.** Recommendation actions reuse existing modes via `handleModeSelect`, `startQuiz`, or `handleStudyGuideSelect`. New action types (`category-quiz`, `author-quiz`, `work-quiz`) call `buildQuiz` directly with a fixed length of 5.
- **No backend, no API, no external data.** Fully local and browser-based.

#### Recommendation priority logic

Up to 3 recommendations are shown. Priority order:
1. **Wrong review** — if active wrong-review queue is non-empty.
2. **Daily Practice** — if not yet completed today (checks `dailyPracticeState.lastDate`).
3. **Weakest category** — lowest accuracy category with ≥ 3 questions seen and accuracy < 70%. If that category is `essay_preparation`, the action opens Thesis Practice instead of a category quiz.
4. **Weakest author** — lowest accuracy author with ≥ 3 questions seen and accuracy < 70%. Uses `computeAuthorStats` from `stats.js`. Starts a 5-question author-filtered quiz.
5. **Weakest work** — lowest accuracy work with ≥ 3 questions seen and accuracy < 70%. Uses `computeWorkStats` from `stats.js`. Starts a 5-question work-filtered quiz.
6. **Thesis Practice** — if `essay_preparation` is weak (accuracy < 70%, ≥ 3 seen) and not already covered above.
7. **Flashcards** — with descriptive mention of the top wrong-answer author when derivable; author hint is suppressed if that author was already used in a weak-author recommendation.
8. **Study Guide deep-link** — opens the Study Guide detail card for the top wrong-answer author directly; skipped if that author was already targeted.
9. **Starter fallback** — when no stats and no wrong answers; shows 3 cards: random quiz, flashcards, study guide.

#### Today Plan rules for author/work stats

- Reads `computeAuthorStats` and `computeWorkStats` (same functions used by the Stats screen).
- Weak author/work requires **accuracy < 70% and ≥ 3 answered questions**. Items at or above 70% are never recommended as weak.
- Author names resolved from `authors.json`; work titles from `works.json`. Raw IDs are never shown in the UI.
- `usedAuthorIds` set tracks entities already targeted so the same author is not mentioned twice in one 3-card plan.
- No new localStorage keys written. Viewing the dashboard does not affect any learning state.

---

## Implemented V2 Features (Phase 4 — Guided Learning, continued)

### Author and Work Statistics — Phase 4 Step 2

- Functions: `computeAuthorStats(stats, allQuestions)` and `computeWorkStats(stats, allQuestions)` in `src/utils/stats.js`
- UI: two new sections ("Най-слаби автори", "Най-слаби произведения") added to `StatsScreen.jsx`
- **Derive from existing stats only.** Both functions scan completed attempt records and look up `question.authorId` / `question.workId` in the full question pool. No new localStorage keys are written.
- **Skip missing metadata safely.** If a question has no `authorId`, it is skipped for author stats. If no `workId`, skipped for work stats. Match questions (which use `authorIds[]` / `workIds[]` arrays instead of singular fields) are naturally skipped.
- **Do not invent metadata.** Names and titles are resolved from `authors.json` and `works.json` only. If an ID cannot be resolved, it is excluded from display.
- **Do not mutate learning state by viewing statistics.** The stats screen is read-only; no quiz logic, wrong-review, or daily-practice state is touched when viewing these sections.
- **Do not use raw IDs in UI.** Author names come from `author.name`; work titles from `work.title`. Unresolvable IDs are filtered out via the `nameResolver` in `sortedWeakest`.
- **Minimum threshold:** `total >= 3` questions answered before an author/work appears in the weakest lists.
- **Sort order:** accuracy ascending → total descending → Bulgarian name ascending.
- **Maximum rows:** 5 per section.
- **Action buttons:** each row has a "Тест →" button that calls `onStartQuiz(mode, id, label)` → `startQuiz` in App.jsx with mode `'author'` or `'work'`. Uses the current quiz length.

#### What `handleTodayPlanAction` dispatches

| Action `type` | Handler | Notes |
|---------------|---------|-------|
| `mode` | `handleModeSelect(modeId)` | Covers all standard modes |
| `category-quiz` | `buildQuiz(..., 'category', category, works, 5)` inline | Hardcoded 5 questions |
| `author-quiz` | `buildQuiz(..., 'author', authorId, works, 5)` inline | Hardcoded 5 questions |
| `work-quiz` | `buildQuiz(..., 'work', workId, works, 5)` inline | Hardcoded 5 questions |
| `study-guide` | `handleStudyGuideSelect(itemType, itemId)` | Deep-links to author or work card |
