# Literatura Quiz — v2 Roadmap

---

## Branch Workflow

```
main                          ← v1 production (live on Vercel) — do not touch
│
└── v2/main                   ← v2 integration branch (merge target for all sprints)
    ├── v2/restructure-and-docs   ← completed: repo flattened, docs updated
    ├── v2/sprint1-smart-practice
    ├── v2/sprint2-question-variants
    ├── v2/sprint3-essay-prep
    └── v2/sprint4-ux-deployment
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

## Sprint 1 — Smart Practice

**Branch:** `v2/sprint1-smart-practice`

### Weak Spots Mode

Surfaces questions the user has answered incorrectly most often or has never seen.

- Read wrong-answer history from localStorage.
- Weight question selection by error rate (questions answered wrong ≥ 2 times appear first).
- Show a "Weak spots" entry point on the home screen.
- If no history exists, fall back to random mode with a prompt to play first.

### Daily Practice Mode

A short, consistent daily session to build habit.

- Fixed length: 10 questions per day.
- Selection algorithm: 50% weak spots + 50% unseen questions.
- Track last-played date in localStorage; show a streak counter on the home screen.
- Questions reset eligibility after 7 days to allow revisiting.

### Wrong Answer History Screen

Replace the existing basic wrong-answers list with a richer review screen.

- Show each wrong answer with: question text, the user's answer, the correct answer, and explanation.
- Group by author or work (toggle).
- Allow the user to mark individual items as "learned" to remove them from the queue.
- Add a "Clear history" button with a confirmation step.

---

## Sprint 2 — More Question Variants

**Branch:** `v2/sprint2-question-variants`

### Question Variant Structure

Reduce repetition without bloating `questions.json` by supporting lightweight variants.

- Option A: add an optional `variants` array inside each question in `questions.json`.
- Option B: introduce a separate `src/data/questionVariants.json` keyed by question id.
- Each variant provides an alternate `question` string and optionally reshuffled distractors.
- The quiz engine picks one variant at random per session; the `correctAnswer` is always inherited from the base question.
- Decide on Option A vs B before implementing — document the decision here.

### Generated Variations

Question types to add for existing works and authors:

- **Work recognition** — show an excerpt or key fact, ask which work it describes.
- **Author recognition** — given a biographical clue, identify the author.
- **Reverse lookup** — given a work title, name the author (distinct from existing author questions).
- **Period placement** — given a work or author, identify the literary period.

New questions go through the content QA script before merging (`npm run qa:content` must exit 0).

### Work Recognition Questions

A dedicated sub-type for `category: "work_recognition"` (add to `VALID_CATEGORIES` in `qa-content.mjs`).

- Provide a short excerpt or thematic clue in the `question` field.
- `correctAnswer` is the work title.
- `workId` must be set; `authorId` must match the work's author.

---

## Sprint 3 — Essay Preparation

**Branch:** `v2/sprint3-essay-prep`

### Study Guide Mode

A read-only reference mode, not a quiz.

- For each author: show name, period, key facts, main themes, literary context.
- For each work: show title, genre, year/period, composition notes, themes, motifs.
- Data sourced from existing fields in `authors.json` and `works.json` — no new JSON changes required unless fields are missing.
- Accessible from the home screen and from author/work selection screens.

### Essay Prep Mode

Structured practice aligned with the матура essay format (тема, теза, аргументи, заключение).

- Present a тема (topic/prompt) drawn from a curated list.
- User selects an author and work relevant to the topic.
- App displays: key themes, motifs, and composition notes from the data files as a reference panel.
- User writes (or thinks through) their теза — no text input required for MVP; just the reference display.
- Show a checklist of standard essay elements to tick off mentally.

Topics list: store as a static array in a new file `src/data/essayTopics.json` (add to QA scope when created).

### Thesis Practice

Quick-fire mode for practising thesis construction.

- Show a тема, ask the user to identify which of four provided тези is best-formed.
- `correctAnswer` is the strongest теза; distractors are weaker or off-topic versions.
- Implement as a new question category: `"essay_preparation"` (already in `VALID_CATEGORIES`).
- Questions in this category must have `workId: null` and use `authorId` only where the topic is author-specific.

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
