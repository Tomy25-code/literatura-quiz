# Literatura Quiz

Bulgarian literature quiz app for матура по български език и литература (BEL graduation exam).

Built with Vite + React. Fully static — no backend, no API calls.

---

## Features

### Quiz Modes

- Random quiz — questions from all authors and topics
- Quiz filtered by author
- Quiz filtered by literary work
- Quiz filtered by category (author, genre, period, themes, composition, etc.)
- Quiz filtered by difficulty (easy / medium / hard)
- Configurable quiz length (5 / 10 / 15 / 20 questions)
- Flashcards — author and work reference cards

### V2 Smart Practice

- **Weak Spots mode** (`Слаби места`) — selects questions from the active wrong-review queue and from categories/difficulties where the user's accuracy is statistically low (below 70% over at least 10 answered questions). Shows a positive empty state when no weak areas exist; never falls back to random questions silently.
- **Daily Practice mode** (`Дневна тренировка`) — builds a short balanced quiz using the user's selected quiz length. Selection is split 40% active wrong-review questions, 40% weak-area questions, 20% random (unseen preferred). Tracks daily completion with a streak counter. Repeating on the same day is allowed but does not advance the streak.
- **Smart Wrong Review** (`Преговор на грешните`) — spaced-repetition style. Wrong answers are tracked with per-question metadata (wrong count, correct streak, last dates). A question requires **2 consecutive correct answers** in a focused remediation mode (Wrong Review or Weak Spots) to be marked mastered and removed from the queue. Priority is given to questions answered wrong more times and with a lower correct streak.

### Stats and Progress

- Learning statistics per quiz attempt stored in localStorage
- Per-category and per-difficulty accuracy tracking
- Comparison to personal average on results screen
- Daily practice streak and best streak

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
| `src/data/questions.v2.json` | Generated variant questions — **do not edit by hand** |

Source reference notes are in `source/literatura-zapiski.md`.

### Question pool

The app uses both files together (`questions.json` + `questions.v2.json`) as the active quiz pool. The combined pool currently has **496 questions**.

`questions.v2.json` is generated output. To regenerate it after changing `authors.json` or `works.json`:

```bash
npm run generate:variants
npm run build
npm run qa:content
npm run qa:source
npm run qa:semantic
```

**Never edit `questions.v2.json` directly.** Edit the generator (`scripts/generate-question-variants.mjs`) or the source data files instead.

#### Distractor quality rules

- For question types where all four options are author names, the generator uses `pickDiverseAuthorDistractors()` to ensure no more than 2 options share the same first name.
- `qa:content` will warn `CLUSTERED_FIRST_NAME` if 3+ options share a first name — this should never appear after a clean regeneration.

---

## Local Development

```bash
npm install              # install dependencies
npm run dev              # start dev server at http://localhost:5173
npm run build            # production build → dist/
npm run preview          # serve the production build locally
npm run lint             # ESLint
npm run generate:variants  # regenerate src/data/questions.v2.json from source data
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

### Semantic content cleanup (pre-Phase 2)

Before Phase 2 question expansion, a dedicated cleanup pass was run on `src/data/questions.json`:

- **47 duplicate-concept questions removed** — `q-work-X-002` work-identification duplicates and second composition questions per work (e.g. `-016`, `-018`–`-020` series). Question count reduced from 462 → 415.
- **8 questions rewritten** — 2 `CATEGORY_SOURCE_MISMATCH` fixes (including two "Спи езерото" questions where `"състоянието"` was replaced with proper thematic answers), and 6 `ESSAY_WEAK_ANSWER`/`TOO_ABSTRACT_ANSWER` fixes where single-word answers were expanded to interpretative phrases.

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
