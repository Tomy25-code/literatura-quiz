# Literatura Quiz

Bulgarian literature quiz app for матура по български език и литература (BEL graduation exam).

Built with Vite + React. Fully static — no backend, no API calls.

---

## Features

- Random quiz mode
- Quiz filtered by author
- Quiz filtered by literary work
- Quiz filtered by category (author, genre, period, themes, etc.)
- Quiz filtered by difficulty (easy / medium / hard)
- Configurable quiz length
- Wrong answers review mode (stored in localStorage)
- Flashcards mode
- Search in author and work selection screens
- Learning statistics (stored in localStorage)
- Mobile-responsive UI

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
| `src/data/questions.json` | 462 multiple-choice quiz questions |

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

Production is deployed on Vercel directly from the **`main`** branch.

- The `main` branch is the live production app — do not push experimental work there.
- All v2 development happens in feature branches branched off `main` or `v2/restructure-and-docs`.
- Merge to `main` only when a feature is fully tested and QA passes.

---

## Branch Workflow

```
main                        ← production (live on Vercel)
└── v2/restructure-and-docs ← current v2 base branch
    └── v2/feature-xyz      ← individual feature branches
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
