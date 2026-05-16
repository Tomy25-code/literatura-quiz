# Literatura Quiz — v2 Roadmap

---

## Branch Workflow

```
main                      ← v1 production (live on Vercel) — do not touch
│
└── v2/main               ← v2 integration branch (merge target for all sprints)
    └── v2/feature-xyz    ← individual v2 feature branches
```

- Branch every feature off `v2/main`. Merge back via PR when DoD is met.
- Never rebase or force-push `v2/main` or `main`.
- `main` is frozen for v1 bugfixes only — no v2 code merges there until v2 ships.

---

## V2 Goals

1. **Smarter practice** — guide the user toward their weakest material, not just random questions.
2. **More question variety** — reduce repetition; add recognition and variant question types.
3. **Essay preparation** — structured study mode aligned with the матура essay format.
4. **Polished UX** — smooth navigation, better mobile quiz experience, v2 deployed independently.

---

## Sprint 1 — Smart Practice ✅ COMPLETED

**Branches:** `v2/feature/weak-spots`, `v2/feature/daily-practice`, `v2/feature/smart-wrong-review`

### Completed in Phase 1

- [x] Weak Spots mode (`Слаби места`)
- [x] Daily Practice mode (`Дневна тренировка`) with daily streak tracking
- [x] Smart Wrong Review with spaced-repetition mastery model
- [x] Per-question wrong-review metadata (wrongCount, correctStreak, status)
- [x] Automatic migration from legacy wrong-answer ID array to metadata model
- [x] `getWeakSets()` shared helper used by both Weak Spots and Daily Practice

### Weak Spots Mode — Implemented

Surfaces questions from areas where the user is statistically weak.

- Qualifies questions that are in the active wrong-review queue OR belong to a category/difficulty where accuracy is below 70% over at least 10 answered questions.
- Historical wrong count used for priority scoring only — mastered questions do not re-enter.
- If no weak spots exist, shows a positive empty state. Does not fall back to random questions.
- Priority scoring: `+4` active wrong queue, `+3` per historical wrong answer, `+2` weak category, `+1` weak difficulty, `−1` per correct answer.
- The `mode-card-weakspots` card shows amber hover only when weak spots exist; otherwise renders as a normal card.

### Daily Practice Mode — Implemented

A short, balanced daily session to build habit.

- Uses the user's currently selected quiz length (5 / 10 / 15 / 20 questions).
- Selection split: `40%` active wrong-review questions, `40%` weak-area questions, `20%` random (unseen preferred).
- Shortfalls redistribute forward without duplication: wrong → weak → random.
- Tracks daily completion in localStorage (`literaturaQuizDailyPractice`): last date, total count, streak, best streak.
- Streak increments at most once per local calendar date. Repeating Daily Practice on the same day is allowed but does not increase the streak again.
- Correct answers in Daily Practice record stats normally but do NOT advance wrong-review mastery.
- Wrong answers in Daily Practice DO update the wrong-review metadata.

### Smart Wrong Review / Spaced Repetition — Implemented

Replaced the basic wrong-answer ID array with a per-question metadata model.

- Storage key: `literaturaQuizWrongReview` (object keyed by question ID).
- Per-question fields: `id`, `wrongCount`, `correctStreak`, `lastWrongAt`, `lastCorrectAt`, `masteredAt`, `status`.
- A question is marked `status: 'mastered'` after **2 consecutive correct answers** in a focused remediation mode (Wrong Review or Weak Spots).
- Getting a question wrong in any mode resets `correctStreak` to 0 and increments `wrongCount`.
- Regular quiz modes and Daily Practice add wrong-answer records but cannot advance or clear mastery.
- Selection priority: higher `wrongCount` → lower `correctStreak` → more recent `lastWrongAt` → random.
- Wrong Review never pads with non-wrong questions.
- Legacy wrong-answer ID array (`literaturaQuizWrongQuestionIds`) is auto-migrated on first access.
- Quiz feedback during remediation: amber message after 1st correct answer ("Добре! Още 1 верен отговор за усвояване."), green mastered message after 2nd ("Браво! Въпросът е усвоен и премахнат от преговора.").

### Not yet implemented from original Sprint 1 plan

- Wrong Answer History Screen (dedicated UI to browse and manage wrong-answer records): data model is complete; the review UI is a future item, moved to Sprint 4 or beyond.

---

## Interlude: Semantic Content QA & Cleanup ✅ COMPLETED

**Branch:** `v2/content/semantic-cleanup-pass-1`

Before starting Phase 2 question expansion, a dedicated content quality pass was completed to remove weak and redundant questions and raise the baseline quality of existing content.

### What was done

- **Semantic QA script added** — `scripts/qa-semantic-content.mjs` (`npm run qa:semantic`) flags five categories of pedagogically weak questions:
  - `CATEGORY_SOURCE_MISMATCH` — answer derived from `work.composition`, not from thematic content
  - `DUPLICATE_CONCEPT` — same work/author + category with identical correct answers on multiple questions
  - `ESSAY_WEAK_ANSWER` — essay preparation answer too short to be a useful interpretative accent
  - `TOO_ABSTRACT_ANSWER` — theme/motif answer is a single decontextualised word
  - `GENERIC_EXPLANATION` — explanation only states the answer is in the notes without explaining why

- **47 duplicate-concept questions removed** — question count reduced from **462 → 415**:
  - `q-work-X-002` series: work-identification questions that duplicated the correct answer of an existing question in the same work + category scope
  - `q-work-X-016/018/019/020` series: second composition questions per work with identical answers

- **8 questions rewritten**:
  - 2 `CATEGORY_SOURCE_MISMATCH` — both in „Спи езерото": `"състоянието"` replaced with `"усещането за тук и сега"` (themes) and `"откъсването на личността от социалните проблеми"` (essay_preparation); explanations made substantive
  - 6 `ESSAY_WEAK_ANSWER` / `TOO_ABSTRACT_ANSWER` — single-word answers expanded to interpretative phrases: Димитър Талев, „Балкански синдром", „Спасова могила", „Аз искам да те помня все така", „Песента на колелетата", „Честен кръст"

- **QA script false-positive fix** — `CATEGORY_SOURCE_MISMATCH` now skips answers already present in `work.themes` or `work.motifs`, preventing legitimate thematic terms from being flagged because `work.composition` references the same concept

### QA status after cleanup

| Script | Result |
|--------|--------|
| `npm run build` | PASS |
| `npm run qa:content` | PASS — 0 errors, 19 LONG_OPTION warnings (pre-existing) |
| `npm run qa:source` | PASS — 0 errors, 261 warnings (pre-existing) |
| `npm run qa:semantic` | PASS — 0 high-severity findings |

Remaining backlog: ~95 `GENERIC_EXPLANATION` (low), ~20 `TOO_ABSTRACT_ANSWER` (medium), ~15 `ESSAY_WEAK_ANSWER` (medium). These are not blockers and will be addressed opportunistically during content expansion.

---

## Sprint 2 — Question Variety ✅ COMPLETED

**Branch:** `v2/feature/question-variants`

### Completed in Sprint 2

- [x] Question Variant Generator — 81 alternate-phrasing variants (`questions.v2.json`)
- [x] Distractor Diversity — `pickDiverseAuthorDistractors()`, first-name clustering prevention
- [x] New Question Types — 59 true/false + match questions (`questions.types.json`)
- [x] Fill-in-the-blank questions — 83 cloze-style questions (`questions.fillblank.json`)
- [x] Thematic Work-Recognition questions — 64 theme/motif-based questions (`questions.recognition.json`)
- [x] Total pool: **702 questions** (415 base + 81 variants + 59 types + 83 fill-blank + 64 recognition)

### Step 1 — Question Variant Generator ✅ IMPLEMENTED

**Decision:** Option B — separate `src/data/questions.v2.json` (generated output; canonical base stays in `questions.json`).

#### Implementation

- **Generator script:** `scripts/generate-question-variants.mjs` (`npm run generate:variants`)
- **Generated file:** `src/data/questions.v2.json` (81 variants; do not edit by hand)
- **Combined pool:** 415 base + 81 generated = **496 questions**
- **Integration:** `App.jsx` imports both files and merges them; all quiz modes use the full pool

#### Generated variant types

| Type | Count | Template |
|------|-------|----------|
| Alternate work → author | 27 | "Кой е авторът на „X"?" |
| Work recognition | 26 | "За коя творба се отнася следният факт: „X"?" |
| Alternate author → work | 20 | "Кое от изброените произведения е написано от X?" |
| Reverse nickname | 8 | "Кой автор е известен с прозвището „X"?" |

1 work skipped for recognition („История" — title word appears in all key_facts as substring).

#### QA changes

- `work_recognition` added to `VALID_CATEGORIES` in `qa-content.mjs` and to `CATEGORY_LABELS` in `quiz.js`
- `qa:content` validates both `questions.json` and `questions.v2.json` (cross-file duplicate ID check)
- `qa:semantic` DUPLICATE_CONCEPT check restricted to base questions only (generated variants are intentional alternate phrasings)
- `qa:source` skips generated questions (validated by generator from already-verified data)

#### Distractor diversity polish ✅ IMPLEMENTED

**Branch:** `v2/feature/distractor-diversity`

Problem: the original generator could pick 3 distractors that all share a first name (e.g. Христо Ботев, Христо Смирненски, Христо Фотев), making options hard to distinguish visually.

Changes:
- Added `firstName()` helper and `pickDiverseAuthorDistractors()` with 3-pass progressive relaxation (max 1 same first name → max 2 → no constraint as emergency fallback)
- Applied to Type A and Type D loops (author-name option sets); Types B and C use work titles and are unaffected
- Added `CLUSTERED_FIRST_NAME` warning to `qa:content` — fires when 3+ options share a first name in any `author`/`nickname` category question

#### QA status after implementation

| Check | Result |
|-------|--------|
| `npm run build` | ✅ PASS |
| `npm run qa:content` | ✅ 0 errors, 0 CLUSTERED_FIRST_NAME, 19 LONG_OPTION warnings (pre-existing) |
| `npm run qa:source` | ✅ 0 errors, 261 warnings (pre-existing) |
| `npm run qa:semantic` | ✅ 0 high-severity findings |

### Step 2 — New Question Types ✅ IMPLEMENTED

**Branch:** `v2/feature/question-types`

A separate generator (`scripts/generate-question-types.mjs`, `npm run generate:types`) produces `src/data/questions.types.json`.

#### Implemented types

| Type | Category label | Count | UI |
|------|---------------|-------|----|
| `true_false` | Вярно/невярно | 54 | 2-button (Вярно / Невярно) |
| `match_author_work` | Свържи автор с произведение | 5 | Select dropdowns, one per row; scored as one question |

**True/False difficulty rule:** TRUE statements → `easy`, FALSE statements → `medium`. All false statements pick a deterministic wrong author via `hash32`.

**Match scoring:** all 4 pairs must be correct to score the question as correct. Incorrect pairs shown with the right answer after submission.

**Backward compatibility:** existing `multiple_choice` questions are unaffected. `question.type` defaults to `"multiple_choice"` when absent — no changes to `questions.json` required.

**Filtering:** author/work filters extended to check `authorIds`/`workIds` arrays on match questions. Category filter shows `"Вярно/невярно"` and `"Свържи автор с произведение"`.

**Wrong Review / Weak Spots / Daily Practice:** all modes track match questions by `question.id` the same as any other question. Match questions enter wrong review on incorrect answers and follow the same 2-correct mastery rule.

#### QA status

| Check | Result |
|-------|--------|
| `npm run build` | ✅ PASS |
| `npm run qa:content` | ✅ 0 errors, 19 LONG_OPTION warnings (pre-existing) |
| `npm run qa:source` | ✅ 0 errors, 261 warnings (pre-existing) |
| `npm run qa:semantic` | ✅ 0 high-severity findings |

**Total pool after types:** 415 base + 81 variants + 59 types = **555 questions**

#### Future question types (not yet implemented)

- **Chronological ordering** — sort works/events by date
- **Select-all-correct** — choose all correct answers from a list

### Step 3 — Fill-in-the-blank questions ✅ IMPLEMENTED

**Branch:** `v2/feature/fill-blank-questions`

A fourth generated file (`src/data/questions.fillblank.json`) adds cloze-style questions where the user types the answer into a text field.

#### Implementation

- **Generator script:** `scripts/generate-fill-blank-questions.mjs` (`npm run generate:fillblank`)
- **Generated file:** `src/data/questions.fillblank.json` (83 questions; do not edit by hand)
- **Component:** `src/components/FillBlankQuestion.jsx` — text input, Enter-submits, reveals correct answer on wrong
- **Integration:** `App.jsx` merges fill-blank questions into the full pool; all quiz modes, wrong review, weak spots, and daily practice include them automatically

#### Generated templates

| Template | Count | Difficulty | Source field |
|----------|-------|------------|--------------|
| Author attribution | 27 | medium | `work.authorId` → author name |
| Genre | 27 | easy | `work.genre` (primary segment) |
| Year | 21 | easy | `work.year_or_period` (clean single-year works only) |
| Nickname | 8 | medium | `author.nickname` (first phrase before ";") |

Answer matching is case-insensitive, whitespace-normalised, and ignores Bulgarian quotation marks. Year answers accept both `"1952"` and `"1952 г."`. Genre answers accept the primary segment, the full genre string, and the base word for compound genres.

#### QA status

| Check | Result |
|-------|--------|
| `npm run build` | ✅ PASS |
| `npm run qa:content` | ✅ 0 errors, 19 LONG_OPTION warnings (pre-existing) |
| `npm run qa:source` | ✅ 0 errors, 261 warnings (pre-existing) |
| `npm run qa:semantic` | ✅ 0 high-severity findings |

**Total pool after fill-blank:** 415 base + 81 variants + 59 types + 83 fill-blank = **638 questions**

### Step 4 — Thematic Work-Recognition Questions ✅ IMPLEMENTED

**Branch:** `v2/feature/work-recognition-questions`

A fifth generated file (`src/data/questions.recognition.json`) adds richer work-recognition questions based on thematic and motif clues — distinct from the bibliographic fact-based variants in `questions.v2.json`.

#### Implementation

- **Generator script:** `scripts/generate-work-recognition-questions.mjs` (`npm run generate:work-recognition`)
- **Generated file:** `src/data/questions.recognition.json` (64 questions; do not edit by hand)
- **Integration:** `App.jsx` merges recognition questions into the full pool; all quiz modes, wrong review, weak spots, and daily practice include them automatically

#### Generated templates

| Template | Count | Difficulty | Clue source |
|----------|-------|------------|-------------|
| Theme pair (T1) | 27 | medium | First unique pair from `work.themes` |
| Motif pair (T2) | 22 | hard | First unique pair from `work.motifs` (≥ 2 motifs required) |
| Essay theme (T3) | 15 | medium | First unique theme ≥ 30 chars (starts lowercase) from `work.themes` |

5 works skipped for T2 (insufficient motifs: novoto-grobishte, andreshko, spasova-mogila, gradushka, pesenta-na-koleletata). 12 works skipped for T3 (no qualifying long unique theme).

**Clue uniqueness guarantee:** each generated clue value or pair is present in exactly one work in `works.json`. Clues that would match multiple works are skipped automatically. Additionally, semantically nested theme pairs (e.g. "свободата" + "пътят към свободата") are excluded.

#### QA additions

- `RECOGNITION_MISSING_WORK_ID` — recognition question must have workId
- `RECOGNITION_ANSWER_MISMATCH` — correctAnswer must equal work.title
- `RECOGNITION_DUPLICATE_OPTIONS` — all 4 options must be distinct
- `RECOGNITION_MISSING_SOURCE_FIELDS` — sourceFields array must be present

#### QA status

| Check | Result |
|-------|--------|
| `npm run build` | ✅ PASS |
| `npm run qa:content` | ✅ 0 errors, 19 LONG_OPTION warnings (pre-existing) |
| `npm run qa:source` | ✅ 0 errors, 261 warnings (pre-existing) |
| `npm run qa:semantic` | ✅ 0 high-severity findings |

**Total pool:** 415 base + 81 variants + 59 types + 83 fill-blank + 64 recognition = **702 questions**

---

## Sprint 3 — Essay Preparation ✅ COMPLETED (Step 2 deferred by decision)

**Branch:** `v2/sprint3-essay-prep`

### Step 1 — Study Guide Mode ✅ IMPLEMENTED

**Branch:** `v2/feature/study-guide`

A read-only reference mode. Not a quiz. Does not affect stats, wrong-answer review, weak spots, daily practice streak, or any localStorage learning state.

#### Implementation

- **Entry point:** New mode card on the home screen — "Падна ми се автор/произведение" / "Бърз справочник за автор или произведение"
- **Selection screen:** `src/components/StudyGuide.jsx` — two-tab switcher (Автор / Произведение), search, grid of cards matching existing filter UI patterns
- **Detail screen:** `src/components/StudyGuideDetail.jsx` — structured study card; sections hidden when data is absent

#### Author card sections (when data exists)

- Период (`author.period`)
- Литературен контекст (`author.literary_context`)
- Основни теми (`author.main_themes`)
- Ключови факти (`author.key_facts`)
- Произведения — all works from `works.json` where `work.authorId` matches; each work is clickable and opens the work study card directly

#### Work card sections (when data exists)

- Автор (resolved via `work.authorId` → `author.name`)
- Жанр (`work.genre`)
- Година / период (`work.year_or_period`)
- Творческа история (`work.creative_history`)
- Композиция (`work.composition`)
- Теми (`work.themes`)
- Мотиви (`work.motifs`)
- Ключови идеи (`work.key_facts`)

#### Data policy

- Uses `authors.json` and `works.json` only — no new facts invented.
- Neither file was modified for this feature.
- All five generated question files (`questions.v2.json`, `questions.types.json`, `questions.fillblank.json`, `questions.recognition.json`) remain unchanged.

#### QA status

| Check | Result |
|-------|--------|
| `npm run build` | ✅ PASS |
| `npm run qa:content` | ✅ 0 errors, 19 LONG_OPTION warnings (pre-existing) |
| `npm run qa:source` | ✅ 0 errors, 261 warnings (pre-existing) |
| `npm run qa:semantic` | ✅ 0 high-severity findings |

### Step 2 — Essay Prep Mode ⏸ DEFERRED

Intentionally skipped for now. Requires careful manual content selection (curated essay topics list, reference panel UX). Will be revisited in a later sprint when content is ready.

Planned shape (for reference):
- Present a тема (topic/prompt) drawn from a curated list (`src/data/essayTopics.json`).
- User selects an author and work relevant to the topic.
- App displays key themes, motifs, and composition notes as a reference panel.
- No text input required for MVP.

### Step 3 — Thesis Practice ✅ IMPLEMENTED

**Branch:** `v2/feature/thesis-practice`

Quick-fire mode where the user chooses the most appropriate thesis/essay-focus from four options.

#### Implementation

- **Mode ID:** `thesisPractice` — handled in `App.jsx` `handleModeSelect` / `startQuiz`
- **Builder:** `buildThesisPracticeQuiz({ allQuestions, length })` in `src/utils/quiz.js`
- **Filter:** `category === 'essay_preparation'` only — no invented content, no fallback to unrelated questions
- **Pool size:** 47 questions (all from `questions.json`, all `difficulty: hard`)
- **Quiz label:** "Избери теза"
- **Empty state:** shown if pool is ever empty; never pads with other question types
- Stats, wrong-answer review, smart wrong review, weak spots, and daily practice all interact with thesis-practice questions identically to any other quiz mode (they are already tracked by `question.id`)

#### QA status

| Check | Result |
|-------|--------|
| `npm run build` | ✅ PASS |
| `npm run qa:content` | ✅ 0 errors |
| `npm run qa:source` | ✅ 0 errors |
| `npm run qa:semantic` | ✅ 0 high-severity findings |

---

## Sprint 4 — UX and Deployment

**Branch:** `v2/sprint4-ux-deployment`

### Navigation Improvements

- Add a persistent bottom navigation bar on mobile (Home / Practice / Study / Stats).
- Add breadcrumb or back-navigation context so the user always knows where they are.
- Ensure the home screen clearly separates "Practice" modes from "Study" modes.

### Mobile Quiz Polish

- Increase tap target size for answer options (minimum 48 px height).
- Show progress indicator (question N of M) throughout the quiz.
- After answering, animate correct/incorrect feedback before advancing.
- Prevent accidental double-tap advancing past the feedback screen.

### Wrong Answer History Screen

Browse and manage the wrong-review queue (data model implemented in Sprint 1).

- Show each active wrong-review question with: question text, correct answer, explanation, wrongCount, correctStreak.
- Allow filtering or grouping by author or category.
- Allow the user to manually clear individual questions or the full queue.

### Second Vercel Project for V2

- Create a separate Vercel project (`literatura-quiz-v2`) pointing to the `v2/main` branch.
- Configure it as a preview deployment — not the primary production URL.
- Once v2 is stable and signed off, merge `v2/main` → `main` and retire the separate v2 project.
- Update `README.md` with the v2 preview URL when it exists.

---

## QA Rules

These apply to every sprint before merging to `v2/main`.

1. `npm run build` must complete with no errors.
2. `npm run qa:content` must exit 0 (zero errors — warnings are acceptable).
3. `npm run qa:source` must exit 0.
4. No modification to `questions.json`, `authors.json`, or `works.json` unless the change is the explicit goal of the task and QA passes afterwards.
5. No English text visible to the user.
6. Test on a mobile viewport (375 px wide) before marking UI tasks done.
7. No new runtime dependencies added without discussion.

---

## Definition of Done

Every feature is done when all of the following are true:

- [ ] Feature works correctly on desktop and on a 375 px mobile viewport.
- [ ] `npm run build` passes.
- [ ] `npm run qa:content` exits 0.
- [ ] `npm run qa:source` exits 0.
- [ ] No console errors or warnings in the browser.
- [ ] localStorage keys used by the feature are documented in `CLAUDE.md`.
- [ ] If JSON data was changed: QA passes and changes are described in the commit message.
- [ ] PR is reviewed and merged to `v2/main` — not pushed directly.
