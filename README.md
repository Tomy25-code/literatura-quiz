# Literatura Quiz

Bulgarian literature quiz app for матура по български език и литература (BEL graduation exam).

Built with Vite + React. Fully static — no backend, no API calls.

---

## Home Navigation

The home screen is organised into six tabs below the "Какво да уча днес?" widget:

| Tab | Contents |
|-----|---------|
| **Тестове** | Случаен тест, Тест по автор, Тест по произведение, Тест по категория, Тест по трудност, Избери теза |
| **Практика** | Дневна тренировка, Слаби места, Преговор на грешните |
| **Справочник** | Флашкарти, Падна ми се автор/произведение |
| **Статистика** | Quick link to the full Statistics screen |
| **Помощ** | Full guide on how to use the site |
| **Настройки** | Theme selector (Системна / Тъмна / Светла) |

On desktop all six tabs fit in the tab bar without truncation. On mobile the tab bar is horizontally scrollable; accent-coloured ‹ › arrow indicators appear at the edges whenever there are hidden tabs in that direction and scroll the bar by 160 px on click.

The top summary (author / work / question counts, quiz length picker), StatsSummary widget, and "Какво да уча днес?" recommendations remain always visible above the tabs regardless of the active tab.

### Theme (Настройки tab)

The app supports three theme modes:

| Option | Behaviour |
|--------|-----------|
| **Системна** (default) | Follows the OS/browser dark-mode preference; updates automatically if the system preference changes while the app is open |
| **Тъмна** | Always dark |
| **Светла** | Always light |

The selected theme is saved in `localStorage` under the key `literaturaQuizTheme` and applied synchronously before React mounts (no flash of wrong theme on load). Invalid or missing values fall back to `"system"`.

---

## Features

The app supports two types of use: **practice modes** (quiz-style sessions that track progress) and **reference modes** (read-only study aids that do not affect stats or learning state).

### Practice — Quiz Modes

- **Случаен тест** — random questions from all authors and topics
- **Тест по автор** — filtered by a selected author
- **Тест по произведение** — filtered by a selected literary work
- **Тест по категория** — filtered by category (author, genre, period, themes, composition, motifs, etc.)
- **Тест по трудност** — filtered by difficulty (easy / medium / hard)
- **Избери теза** — thesis/essay-focus practice; uses only `essay_preparation` questions from the base `questions.json`; never pads with unrelated questions; uses fewer questions if the pool is smaller than the selected quiz length
- Configurable quiz length: 5 / 10 / 15 / 20 questions

### Practice — Smart Practice Modes

- **Слаби места** (`Weak Spots`) — automatically surfaces questions from categories and difficulties where the user's accuracy is below 70% over at least 10 attempts. Shows a positive empty state when no weak areas exist; never falls back to random questions silently.
- **Дневна тренировка** (`Daily Practice`) — short balanced daily quiz split 40% wrong-queue / 40% weak-area / 20% random (unseen preferred). Tracks daily completion with a streak counter.
- **Преговор на грешните** (`Wrong Review`) — spaced-repetition style. Wrong answers are queued and require **2 consecutive correct answers** in a focused remediation mode (Wrong Review or Weak Spots) to be marked mastered.

### Reference — Study Modes

- **Флашкарти** — author and work reference cards for quick revision of genres, periods, and composition
- **Падна ми се автор/произведение** (`Study Guide`) — structured read-only reference card for any author or work, sourced entirely from `authors.json` and `works.json`. Sections with no data are hidden. Does not affect quiz stats, wrong-answer review, weak spots, daily practice streak, or any other localStorage learning state.

### Question Formats

The app includes multiple question formats depending on the mode and available data:

| Format | Description |
|--------|-------------|
| Multiple choice | 4 options; standard format |
| Вярно/невярно | True/False binary questions |
| Свържи автор с произведение | Match 4 authors to their works; all pairs must be correct |
| Попълни липсваща дума | Type the answer; case-insensitive matching |
| Разпознаване на произведение | Identify a work from its themes or motifs |
| Избор на теза | Choose the right essay-focus for interpretative writing |

### Stats and Progress

- Learning statistics per quiz attempt stored in localStorage
- Per-category and per-difficulty accuracy tracking
- Per-author and per-work accuracy tracking — shows the 5 weakest authors and works based on answered question history; items appear once ≥ 3 questions have been answered for that author or work
- Comparison to personal average on results screen
- Daily practice streak and best streak
- "Тест →" action button on each author/work row to start a filtered quiz directly from the statistics screen

---

## Phase 3 — Essay Preparation

| Step | Status | Feature |
|------|--------|---------|
| Step 1 | ✅ Implemented | **Study Guide** (`Падна ми се автор/произведение`) — read-only reference cards for authors and works |
| Step 2 | ⏸ Deferred | **Essay Prep mode** — requires careful manual content curation; not yet implemented |
| Step 3 | ✅ Implemented | **Thesis Practice** (`Избери теза`) — quiz mode using existing `essay_preparation` questions only |

---

## Phase 4 — Guided Learning

### Step 1 — "Какво да уча днес?" Dashboard ✅ Implemented

A home-screen widget that recommends up to 3 actionable study steps based on the user's existing local progress.

- **Widget title:** "Какво да уча днес?" / subtitle: "Кратък план според последните ти резултати."
- Can recommend weak authors and works once enough quiz history exists (≥ 3 answered questions per author/work, accuracy below 70%)
- **Placement:** between the stats summary and the mode selector on the home screen.
- **Read-only:** viewing recommendations does not modify stats, wrong-answer review, daily streak, or any other localStorage learning state.
- **Local-only and browser-based:** all logic reads from existing localStorage keys — no network calls, no backend.

#### Recommendation priority order

| Priority | Recommendation | Condition |
|----------|---------------|-----------|
| 1 | Wrong review | Active wrong-review queue is non-empty |
| 2 | Daily Practice | Not yet completed today |
| 3 | Weakest category (5-question quiz) | ≥ 3 seen, accuracy < 70% |
| 4 | Weakest author (5-question quiz) | ≥ 3 seen, accuracy < 70% |
| 5 | Weakest work (5-question quiz) | ≥ 3 seen, accuracy < 70% |
| 6 | Thesis Practice | `essay_preparation` is weak and not already covered |
| 7 | Flashcards (with author hint) | Derived from wrong/recent answers |
| 8 | Study Guide deep-link | Top wrong-answer author |
| Fallback | Starter plan (3 cards) | No stats and no wrong answers |

Each recommendation card has a title, description, optional badge, and a direct action button. Clicking a button navigates to or starts the appropriate existing mode — no new quiz logic is introduced.

---

## Phase 5 — UI Polish

### Step 1 — Home Navigation Tabs ✅ Implemented

Tabbed home navigation groups all modes into six tabs (Тестове, Практика, Справочник, Статистика, Помощ, Настройки) below the always-visible "Какво да уча днес?" widget. On mobile the tab bar is horizontally scrollable with accent-coloured ‹ › scroll indicators.

### Step 2 — Light/Dark/System Theme Toggle ✅ Implemented

Three theme modes (Системна / Тъмна / Светла) accessible from the Настройки tab. Theme is saved in `localStorage` under `literaturaQuizTheme` and applied synchronously before React mounts to prevent a flash of wrong theme.

### Step 3 — Mobile Quiz Polish ✅ Implemented

Mobile quiz UX improvements (no logic changes):
- **Sticky progress header** — the quiz top bar, question counter, and progress bar stick to the top of the viewport on mobile (≤ 600 px) so progress is always visible while scrolling through long answers.
- **Larger answer buttons** — minimum height 52 px and extra padding on mobile for comfortable tap targets.
- **Increased option gap** — 0.75 rem gap between answer options on mobile.
- **Full-width action button** — "Следващ въпрос / Виж резултата" stretches full width on mobile.
- **Fill-blank submit button** — full width when the input row is stacked (≤ 480 px).
- **Match question** — select dropdowns get `min-height: 44 px` on narrow screens; on very narrow screens (≤ 380 px) each match row stacks vertically.
- **Flashcard viewer** — flip button stretches full width on mobile; nav buttons get `min-height: 48 px`; top bar wraps on small screens.

### Responsive Text Overflow Bugfix ✅ Implemented

CSS-only fixes for text clipping and layout overflow issues found during real-device mobile testing. Desktop layout is preserved throughout.

- **Home stat cards** — "ПРОИЗВЕДЕНИЯ" no longer touches or overflows the card border on mobile. Font size and letter-spacing are reduced at ≤ 480 px and ≤ 400 px via media queries. Wrapping is allowed on mobile only; on desktop the label stays on one line.
- **Statistics overview cards** — "СРЕДЕН РЕЗУЛТАТ" is fully readable on mobile. The label wraps cleanly with adjusted font size and letter-spacing at ≤ 500 px.
- **Recent test titles** — titles like "Случаен тест" no longer get clipped in the Statistics screen. Removed the fixed `max-width` and `text-overflow: ellipsis` so titles wrap instead of cutting off; score and date columns remain aligned.
- **Statistics category labels** — "Псевдоним/прякор" and similar labels are no longer unnecessarily truncated. The label column uses `minmax()` sizing so it can grow on desktop; `text-overflow: ellipsis` removed in favour of wrapping with `line-height: 1.3`.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Build | Vite |
| UI | React (JSX) |
| Styling | Plain CSS |
| Data | Static JSON |
| Persistence | localStorage |
| Deployment | Vercel |

---

## Data Files

All content lives in `src/data/`. Do not edit these files without running the QA scripts afterwards.

| File | Contents |
|------|----------|
| `src/data/authors.json` | 20 Bulgarian authors with biographical metadata |
| `src/data/works.json` | 27 literary works with genre, period, themes, motifs |
| `src/data/questions.json` | 415 manually curated base questions — **canonical source of truth** |
| `src/data/questions.v2.json` | 81 generated alternate-phrasing variants — **do not edit by hand** |
| `src/data/questions.types.json` | 59 generated new question types (true/false, match) — **do not edit by hand** |
| `src/data/questions.fillblank.json` | 83 generated fill-in-the-blank questions — **do not edit by hand** |
| `src/data/questions.recognition.json` | 64 generated thematic work-recognition questions — **do not edit by hand** |

Source reference notes are in `source/literatura-zapiski.md`.

### Question pool

The app merges all five files into one pool. **702 questions total** (415 base + 81 variants + 59 type questions + 83 fill-blank + 64 thematic recognition questions).

#### Regenerating generated files

```bash
npm run generate:variants          # regenerate questions.v2.json (after changing authors/works)
npm run generate:types             # regenerate questions.types.json (after changing authors/works)
npm run generate:fillblank         # regenerate questions.fillblank.json (after changing authors/works)
npm run generate:work-recognition  # regenerate questions.recognition.json (after changing authors/works)
npm run build
npm run qa:content
npm run qa:source
npm run qa:semantic
```

**Never edit generated question files directly.** Edit the generator scripts or source data files instead.

#### Distractor quality rules

- For questions where all four options are author names, the generator uses `pickDiverseAuthorDistractors()` to ensure no more than 2 options share the same first name.
- `qa:content` will warn `CLUSTERED_FIRST_NAME` if 3+ options share a first name — this should never appear after a clean regeneration.

#### Question type breakdown

| Type | Category | Count | Description |
|------|----------|-------|-------------|
| `true_false` | `true_false` | 54 | "„X" е произведение на Y." — Вярно/Невярно |
| `match_author_work` | `match_author_work` | 5 | Match 4 authors to their works |
| `fill_blank` | `fill_blank` | 83 | Complete the missing word |
| `multiple_choice` (recognition) | `work_recognition` | 64 | Identify work from themes/motifs clues |
| `multiple_choice` (variants) | various | 81 | Alternate-phrasing variants of base questions |

---

## Local Development

```bash
npm install              # install dependencies
npm run dev              # start dev server at http://localhost:5173
npm run build            # production build → dist/
npm run preview          # serve the production build locally
npm run lint             # ESLint
npm run generate:variants          # regenerate src/data/questions.v2.json
npm run generate:types             # regenerate src/data/questions.types.json
npm run generate:fillblank         # regenerate src/data/questions.fillblank.json
npm run generate:work-recognition  # regenerate src/data/questions.recognition.json
```

---

## QA Scripts

Run after any changes to the JSON data files.

```bash
npm run qa:content   # structural validation — cross-references, field checks, duplicates (exits 1 on errors)
npm run qa:source    # cross-check data fields against source/literatura-zapiski.md
npm run qa:semantic  # pedagogical quality — flags weak answers, duplicates, generic explanations
```

Reports are written to `reports/`. `qa:content` exits with code 1 if hard errors are found; the others always exit 0 but print severity-tagged findings.

### Current QA status

All three scripts pass with zero blocking errors. Accepted backlog (non-blocking):

| Finding | Count | Severity | Notes |
|---------|-------|----------|-------|
| `GENERIC_EXPLANATION` | ~95 | low | Explanations that only cite the source notes rather than explaining the answer |
| `TOO_ABSTRACT_ANSWER` | ~20 | medium | Very short motif/theme labels; some are intentional |
| `ESSAY_WEAK_ANSWER` | ~15 | medium | Short essay anchors; addressed opportunistically during content expansion |

High-severity semantic findings (`CATEGORY_SOURCE_MISMATCH`, `DUPLICATE_CONCEPT`) must be resolved before merging content changes.

---

## Deployment

- **`main`** — v1 production, live on Vercel. Do not push v2 work here.
- **`v2/main`** — v2 integration branch, merge target for all v2 feature branches.
- Individual v2 features are developed in branches off `v2/main` and merged back via PR once build and QA pass.
- A separate Vercel project for v2 preview is planned for Sprint 4.

---

## Branch Workflow

```
main                      ← v1 production (live on Vercel) — protected
│
└── v2/main               ← v2 integration branch
    └── v2/feature-xyz    ← individual v2 feature branches
```

---

## Project Structure

```
.
├── src/
│   ├── components/     # React components
│   ├── data/           # JSON data files (authors, works, questions)
│   ├── utils/          # Quiz logic, stats, localStorage helpers
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── public/             # Static assets (favicon, icons)
├── scripts/            # Node QA and data scripts
├── reports/            # QA report output (auto-generated)
├── source/             # Source reference notes (literatura-zapiski.md)
├── index.html
├── vite.config.js
├── eslint.config.js
└── package.json
```
