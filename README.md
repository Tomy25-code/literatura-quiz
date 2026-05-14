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
| `src/data/questions.json` | 415 multiple-choice quiz questions |

Source reference notes are in `source/literatura-zapiski.md`.

---

## Local Development

```bash
npm install      # install dependencies
npm run dev      # start dev server at http://localhost:5173
npm run build    # production build → dist/
npm run preview  # serve the production build locally
npm run lint     # ESLint
```

---

## QA Scripts

Run after any changes to the JSON data files.

```bash
npm run qa:content   # validate structure, cross-references, duplicates
npm run qa:source    # cross-check data against source notes
```

Reports are written to `reports/`. The content QA script exits with code 1 if hard errors are found.

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
