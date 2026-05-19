# Literatura Quiz V2

Bulgarian literature quiz and study app for матура по български език и литература (BEL graduation exam).

V2 is live from branch `v2/main`. Built with Vite + React — fully static, no backend, no authentication, no database. All progress is stored locally in the browser.

---

## What's in V2

- **702-question pool** across five question files, covering multiple choice, true/false, match, fill-in-the-blank, and thematic recognition formats
- **Smart practice** — daily practice, weak-spot detection, and spaced-repetition wrong review
- **Study guide** — read-only reference cards for every author and work
- **Thesis practice** — focused essay-prep quiz mode
- **"Какво да уча днес?"** — personalised study plan based on local progress
- **Author and work statistics** — accuracy tracking per author and per literary work
- **Tabbed home navigation** with six sections
- **Light / Dark / System theme** with no-flash synchronous apply
- **Mobile-optimised quiz** — sticky progress header, larger tap targets, responsive layouts

---

## User Features

### Tests (tab: "Тестове")

| Mode | Description |
|------|-------------|
| **Случаен тест** | Random mix from the full 702-question pool |
| **Тест по автор** | All questions for a selected author |
| **Тест по произведение** | All questions for a selected literary work |
| **Тест по категория** | Filtered by category (genre, period, themes, composition, motifs, etc.) |
| **Тест по трудност** | Filtered by difficulty (easy / medium / hard) |
| **Избери теза** | Essay-focus practice using only `essay_preparation` questions; never pads with unrelated content |

Quiz length is configurable: **5 / 10 / 15 / 20 questions**.

### Smart Practice (tab: "Практика")

- **"Какво да уча днес?"** — recommends up to 3 actions based on wrong-review queue, daily completion, and weakest categories/authors/works. Read-only: viewing the dashboard does not modify any learning state.
- **"Дневна тренировка"** — balanced daily quiz (40% wrong-queue / 40% weak-area / 20% random). Tracks a daily streak. Correct answers do not advance wrong-review mastery.
- **"Слаби места"** — surfaces questions from categories and difficulties where accuracy is below 70% over at least 10 answered questions. Shows an empty state rather than falling back to random questions.
- **"Преговор на грешните"** — wrong answers queue for review and require **2 consecutive correct answers** in a focused remediation mode (Wrong Review or Weak Spots) to be marked mastered.

### Reference and Revision (tab: "Справочник")

- **"Флашкарти"** — quick-reference cards for every author and literary work; shows genre, period, themes, motifs, composition, and key facts.
- **"Падна ми се автор/произведение"** — structured study card for any author or work. Data sourced exclusively from `authors.json` and `works.json`. Sections with no data are hidden. Does not affect stats or the wrong-review queue.

### Statistics (tab: "Статистика")

- Total quizzes, best result, and average accuracy
- Per-category and per-difficulty accuracy breakdown with bar charts
- Weakest 5 authors and weakest 5 works (shown after ≥ 3 questions answered per entity)
- Recent attempt history with score and date
- "Тест →" button on each author/work row to start a targeted quiz immediately

### Theme (tab: "Настройки")

| Option | Behaviour |
|--------|-----------|
| **Системна** (default) | Follows the OS/browser dark-mode preference; updates live |
| **Тъмна** | Always dark |
| **Светла** | Always light |

Preference is saved in `localStorage` under `literaturaQuizTheme` and applied synchronously before React mounts — no flash of the wrong theme on load.

---

## Question Formats

| Format | Description |
|--------|-------------|
| Multiple choice | 4 options; standard format |
| Вярно/невярно | Binary true/false |
| Свържи автор с произведение | Match 4 authors to their works; all pairs must be correct to score |
| Попълни липсваща дума | Type the answer; case-insensitive, whitespace-normalised matching |
| Разпознаване на произведение | Identify a work from its themes or motifs |
| Избор на теза | Choose the correct essay-focus for an interpretative essay |

---

## Data and Question Pool

All content lives in `src/data/`. The canonical base file (`questions.json`) is hand-curated and protected. The four generated files are produced by generator scripts and must not be edited by hand.

| File | Contents | Count |
|------|----------|-------|
| `src/data/authors.json` | 20 Bulgarian authors | — |
| `src/data/works.json` | 27 literary works | — |
| `src/data/questions.json` | Curated base questions — canonical source of truth | 415 |
| `src/data/questions.v2.json` | Generated alternate-phrasing variants — **do not edit** | 81 |
| `src/data/questions.types.json` | Generated true/false + match questions — **do not edit** | 59 |
| `src/data/questions.fillblank.json` | Generated fill-in-the-blank questions — **do not edit** | 83 |
| `src/data/questions.recognition.json` | Generated thematic work-recognition questions — **do not edit** | 64 |

**Total: 702 questions** (415 + 81 + 59 + 83 + 64)

Source reference notes are in `source/literatura-zapiski.md`.

---

## Local Development

```bash
npm install        # install dependencies
npm run dev        # dev server → http://localhost:5173
npm run build      # production build → dist/
npm run preview    # serve the production build locally
npm run lint       # ESLint
```

---

## QA and Validation

Run these after any changes to source data or questions:

```bash
npm run qa:content   # structural validation: field checks, cross-references, duplicate IDs (exits 1 on hard errors)
npm run qa:source    # cross-check data fields against source/literatura-zapiski.md
npm run qa:semantic  # pedagogical quality: flags weak answers, duplicates, generic explanations
```

Reports are written to `reports/`. `qa:content` exits with code 1 if hard errors are found. The others always exit 0 but print severity-tagged findings to the console.

**Before merging:** all three scripts must pass with zero hard errors. High-severity semantic findings (`CATEGORY_SOURCE_MISMATCH`, `DUPLICATE_CONCEPT`) must be resolved. A small accepted backlog of low/medium findings (~95 `GENERIC_EXPLANATION`, ~20 `TOO_ABSTRACT_ANSWER`, ~15 `ESSAY_WEAK_ANSWER`) exists and is addressed opportunistically.

---

## Regenerating Generated Question Files

Only needed after changes to `authors.json` or `works.json`:

```bash
npm run generate:variants          # regenerate questions.v2.json
npm run generate:types             # regenerate questions.types.json
npm run generate:fillblank         # regenerate questions.fillblank.json
npm run generate:work-recognition  # regenerate questions.recognition.json
```

After regenerating, run `npm run build` and all three QA scripts before committing.

---

## Technical Overview

| Layer | Choice |
|-------|--------|
| Build | Vite |
| UI | React (JSX) |
| Styling | Plain CSS — no framework |
| Data | Static JSON files |
| Persistence | `localStorage` |
| Deployment | Vercel |

No backend. No API calls. No authentication. No database. All user progress (wrong answers, stats, daily streak, theme preference) is stored in the browser's `localStorage`.

---

## Branch and Deployment Workflow

```
main       ← v1 legacy production (frozen — do not push new work here)
│
└── v2/main          ← V2 live branch on Vercel — merge target for all V2 work
    └── v2/feature-xyz   ← individual feature / fix / docs branches
```

- Create feature branches off `v2/main`.
- Merge back to `v2/main` via pull request once build and QA pass.
- Never push directly to `v2/main` or `main`.

---

## Deferred Work

Several items were scoped out of V2 and are candidates for a future version. See [ROADMAP.md](ROADMAP.md) for full detail and rationale.

Short list:
- **Essay plan mode** — requires careful manual content curation per work
- **Wrong answer history screen** — browse and manage the wrong-review queue with full metadata
- **Chronological ordering questions** — sort works/events by date
- **Select-all-correct questions** — multi-select question type
- **`npm run qa:all` convenience script**
- **Possible generated-file consolidation** — only after QA strategy is finalised

---

## Project Structure

```
.
├── src/
│   ├── components/     ← React components
│   ├── data/           ← JSON data files (authors, works, questions)
│   ├── utils/          ← quiz logic, stats, localStorage helpers
│   ├── App.jsx / App.css
│   ├── main.jsx / index.css
├── public/             ← static assets (favicon, icons)
├── scripts/            ← Node QA and generator scripts
├── reports/            ← QA report output (auto-generated, do not hand-edit)
├── source/             ← source reference notes (literatura-zapiski.md)
├── index.html
└── package.json
```
