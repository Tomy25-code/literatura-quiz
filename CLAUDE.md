# Literatura Quiz — Project Instructions

## Project

Bulgarian literature quiz website for матура по български език и литература (Bulgarian language and literature graduation exam).

Production app is live on Vercel from the `main` branch. v2 development happens in separate feature branches.

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
main                        ← production (live on Vercel) — protected
└── v2/restructure-and-docs ← current v2 base branch
    └── v2/feature-xyz      ← individual feature branches
```

- **Never push experimental or in-progress work to `main`.**
- Branch all v2 work off `v2/restructure-and-docs` (or the latest v2 base).
- Merge to `main` only when a feature is complete, build passes, and QA passes with 0 errors.

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
