# CloudPrep — Decision Log

> Lightweight ADRs. Status: **Proposed** (awaiting approval) · **Accepted** · **Superseded**.
> Last updated: 2026-10-21 (release preparation)

| ID | Decision | Status |
|---|---|---|
| D-001 | Greenfield project; no migration needed | Accepted |
| D-002 | npm as package manager | Proposed |
| D-003 | Static SPA, no backend; data in localStorage | Accepted (requirement) |
| D-004 | BrowserRouter + SPA-fallback host: Vercel | Accepted |
| D-005 | Runtime validation of stored data and imports: hand-written parsers, no Zod | Accepted |
| D-006 | Questions as typed TypeScript modules + build-time validator | Proposed |
| D-007 | Full mock allocation 16/19/22/8 (largest remainder over 65) | Proposed |
| D-008 | Practice score = percent correct; default benchmark 70%; no fake /1000 score | **Needs input** |
| D-009 | Store per-question correctness snapshot in exam history | Proposed |
| D-010 | Practice sessions not restored after refresh in v1 | Proposed |
| D-011 | Inter Variable via @fontsource (self-hosted) | Proposed |
| D-012 | Multiple-response scoring is all-or-nothing | Proposed |
| D-013 | No pause in Exam Mode | Proposed |
| D-014 | Native `<dialog>` and native inputs instead of a UI library | Proposed |
| D-015 | `useSyncExternalStore` store + Context; no state library | Proposed |
| D-016 | Review workflow: draft → checked → approved; practice shows checked + approved | Accepted (interim) |
| D-017 | Dark theme only in v1; light theme optional later | Proposed |
| D-018 | Strict option counts: single = 4, multiple ≥ 5 (mirrors exam guide) | Accepted |
| D-019 | Practice statistics: attempt counts + question-level latest result | Accepted |
| D-020 | Tool versions: TypeScript 6.0 and ESLint 9 (not 7 / 10) | Accepted |
| D-021 | User's phase numbering differs from the original plan | Accepted |
| D-022 | Every answer option needs an explanation (not only incorrect ones) | Accepted |
| D-023 | Practice sessions are idempotent per session; one attempt per question per session | Accepted |
| D-024 | Colour tokens verified against WCAG 2.2 AA | Accepted |
| D-025 | Shorter timed exam offered when the bank can't supply a full exam | Accepted (pending review) |
| D-026 | Exam question selection: unseen first, spread by task statement, seeded | Accepted |
| D-027 | Partly answered multiple-response questions are shown as "partly answered" and scored incorrect | Accepted |
| D-028 | Exam timer: absolute end time; auto-submit from an app-wide watcher | Accepted |
| D-029 | Submitted exams update practice progress for answered questions only | Accepted |
| D-030 | Exams accept `checked` questions until questions are approved | Accepted (interim) |
| D-031 | Question archive: question content stored once per revision for past attempts | Accepted |
| D-032 | Attempts store score, counts and domain breakdown (schema v2) | Accepted |
| D-033 | Readiness guidance: explicit criteria, 3+ exams, never "ready" | Accepted |
| D-034 | Settings: defaults in code, only explicit choices saved (schema v2) | Accepted |
| D-035 | Export/import: same validation as storage; merge and replace rules; backup first | Accepted |
| D-036 | Practice-integrity monitoring: opt-in, local, type + timestamp only, no verdicts | Accepted |
| D-037 | Face detection: built-in browser FaceDetector only; no ML library | Accepted |
| D-038 | Vercel configuration: SPA fallback except /assets, immutable asset caching | Accepted |
| D-039 | Apply the saved theme before first paint with a small inline script | Accepted |
| D-040 | Full 65-question exam journey tested with a generated bank | Accepted |

---

### D-001 Greenfield project
**Context:** On 2026-10-21, `D:\AWS Mock Exam Platform` was empty (no files, no git repo). Installed: Node v24.13.1, npm 11.8.0, pnpm 11.10.0, git 2.36.0.
**Decision:** Scaffold fresh in P0. There is nothing to migrate.
**Note:** git 2.36 is from 2022 and works, but updating it is recommended.

### D-002 npm as package manager
**Options:** npm, pnpm (both installed).
**Decision:** npm. It ships with Node, so friends who clone the repo have nothing extra to install, and it's the default in most documentation. pnpm's speed and disk savings matter little for a single small app.

### D-003 Static SPA
Required by the brief. Consequences: progress is per browser and per device; no cross-device sync; data can be lost if browser storage is cleared (mitigated by export/import and an occasional "export a backup" hint).

### D-004 Routing mode — **resolved: option A, Vercel** (release preparation)
The user asked for a Vercel deployment, so CloudPrep keeps BrowserRouter with a host fallback to `index.html` (D-038).

_Original question:_
**Context:** You'll share the app with friends, so it needs a host. Browser history routes (`/dashboard`) need the host to serve `index.html` for unknown paths.
**Options:**
- **A. BrowserRouter + Netlify / Vercel / Cloudflare Pages** (free tiers; one-line SPA fallback config). Clean URLs. *Recommended.*
- B. HashRouter + GitHub Pages. Works without any config, but URLs look like `/#/dashboard`.
- C. Undecided. Build with BrowserRouter and keep the router choice in one file so it's easy to switch.

### D-005 Runtime validation — **interim: hand-written**
**Update (Phase 2):** No answer on Zod yet, so persisted data is validated with small hand-written parsers in `src/storage/areas.ts` (no new dependency). They are isolated behind `AreaDefinition.parse`, so swapping in Zod later touches only that file. Revisit when export/import (larger untrusted files) is built.

**Original proposal:**
**Context:** The brief limits dependencies, but persisted data and imported files are untrusted and nested. Hand-written guards for about 8 nested shapes would be several hundred lines that duplicate the TS types.
**Decision (proposed):** Add `zod` (one dependency, no transitive dependencies, tree-shakeable). Infer TS types from the schemas for persisted shapes, so the types and validation can't drift apart. The domain layer stays plain TS.
**Alternative:** Hand-written type guards (zero dependencies, more code to maintain).

### D-006 Question bank format
**Options:** JSON files + runtime validation; TS modules.
**Decision:** TS modules (`satisfies Question[]`) so the compiler catches structural errors as you type, plus `validateBank()` for semantic rules, run in Vitest and `validate:questions`. The bank is lazy-loaded as its own chunk.
**Trade-off:** Non-developers can't edit it easily. That's acceptable for v1, and an editor UI is deferred.

### D-007 Domain allocation for 65 questions
The official weights apply to 50 scored questions; the distribution of the 15 unscored ones is unknown. Applying the weights to 65 with the largest-remainder method gives 15.6/19.5/22.1/7.8 → **16/19/22/8**. (Applying them to 50 would give 12/15/17/6 + 15 unknown.) This is documented in the UI as an approximation.

### D-008 Unofficial practice score — **needs your input**
**Context:** AWS reports a proprietary scaled score of 100–1,000, with 700 to pass.
**Options:**
- **A. Percent correct + configurable benchmark (default 70%)**, with no /1000 number. Honest and easy to understand. *Recommended.*
- B. Also show a linear "practice points out of 1000" (percent × 10). Familiar-looking, but it suggests a precision we don't have and invites comparison with the real 700.
- C. A different default benchmark, such as 75% for a safety margin.

### D-009 Scoring snapshot in history
**Context:** The brief says not to store derived values. But questions can be revised or retired after an attempt, which would silently change past scores if they were recalculated.
**Decision:** Store `isCorrect`, `domain` and `taskStatement` per question in each attempt (a few bytes each). Totals, percentages, pass/fail and breakdowns are still derived when read.

### D-010 Practice sessions not persisted
Practice sessions are short and low-stakes. Each answer already updates progress immediately, so a refresh loses only the session's ordering. Restoring them would add state-machine complexity for little value, so this is deferred.

### D-011 Font
Inter Variable through `@fontsource-variable/inter` (self-hosted, no third-party request, about 100 KB woff2 for Latin). It gives a more polished, consistent look than the system font stack, especially with tabular numbers for timers. The fallback is the system UI stack.

### D-012 Multiple-response scoring
All-or-nothing: the selected set must equal the correct set. The exam guide doesn't describe partial credit for multiple-response questions. All-or-nothing is the stricter and more common assumption, and it is documented in the UI.

### D-013 No pause
The real exam can't be paused. The timer is wall-clock based and keeps running when the tab is closed. Learning Mode is the untimed alternative.

### D-014 Native controls instead of a UI library
Native `<dialog>`, radio, checkbox and `<select>` give accessibility (focus trapping, keyboard behaviour, form semantics) without dependencies. They are styled with Tailwind. This meets the brief's "no unnecessary UI component libraries" requirement.

### D-015 State management
A small external store (cache + subscribe) read through `useSyncExternalStore`. Components re-render only for the slice they use, cross-tab sync is straightforward, and tests can inject an in-memory store through Context. The exam session uses `useReducer` with a pure reducer from `domain/`.

### D-016 Content review gate — **interim decision**
**Update (Phase 2):** Without a decision, the bank uses a four-step status: `draft` (never shown), `checked` (author verified against the cited AWS pages), `approved` (a human reviewer signed off), `retired`. Learning Mode shows `checked` and `approved` questions, with a visible note on `checked` ones that they haven't had a second review. **Proposed for exams:** only `approved`, which needs your sign-off (Option A below) — to be confirmed before the exam phase.

**Original context:**
**Context:** The brief requires factually reviewed questions. I can write questions from AWS documentation and check them against the cited pages, but AWS changes over time, and a second human check catches errors I might miss.
**Options:**
- **A. I draft and self-check; you review and approve each batch; only `reviewed` questions appear in exams.** *Recommended.*
- B. I draft, self-check and mark them reviewed; you spot-check (faster, more risk).
- C. You supply questions, and I validate their structure and check their facts.

### D-017 Dark-only v1
The brief asks for dark-first. Tokens are named by role (`--color-surface`, not `--gray-900`), so a light palette can be added later with no component changes.

### D-018 Strict option counts
The exam guide defines multiple choice as 1 correct + 3 distractors, and multiple response as 2 or more correct out of 5 or more options. The validator enforces 4 options for single and ≥ 5 for multiple. This is stricter than the brief's "at least two options", and it keeps practice questions realistic.

### D-019 Practice statistics
**Context:** Repeat attempts must not corrupt or inflate statistics.
**Decision:** Each question stores `attempts` and `correct` (every checked answer, including retries) plus `lastResult`. Displayed accuracy is **question-level**: correct questions ÷ answered questions, where "correct" means the most recent answer was right and each question counts once. "Answered" counts unique questions. Mistakes = questions whose latest answer is wrong; answering correctly in practice clears them. Attempt counts are kept for future "times missed" views.

### D-020 Tool versions
TypeScript 7 isn't yet supported by typescript-eslint (needs < 6.1), so TypeScript 6.0 is used. eslint-plugin-jsx-a11y doesn't support ESLint 10, so ESLint 9 is used. npm marks ESLint 9 as end-of-life; it is dev-only (no runtime or security exposure). Revisit both when the plugins catch up. React Router 8 is used (`RouterProvider` now imported from `react-router/dom`).

### D-021 Phase numbering
The user's "Phase 1" = plan P0 + P1 (scaffold, design system, shell). The user's "Phase 2" = plan P2 (domain core, questions part) + P3 (persistence, partial) + C1 (first content batch) + P7 (Learning Mode). IMPLEMENTATION_PLAN.md maps both.

### D-022 Explanations for every option
The brief requires explanations for incorrect options and asks Learning Mode to explain every option. The validator therefore requires an explanation on **every** option, correct ones included.

### D-023 Idempotent answer recording
Each practice session has an id. `recordAnswer` ignores a second record for the same question and session, so double clicks, re-renders, or retries within one session can't double-count. A new session (including "Retry incorrect") records a new attempt.

### D-024 Colour contrast (Phase 1, AC-1.4)
Every text/background token pair was computed against WCAG 2.2 AA in both themes (script run during Phase 1). Lowest results: dark — fg-subtle on surface-3 4.96:1, danger text on danger-subtle 4.54:1, control borders 3.62:1; light — subtle on surface-3 4.98:1, danger on danger-subtle 4.72:1, control borders 3.42:1. Four light-theme colours were darkened to pass (fg-subtle, success, warning, control border). Axe checks in the E2E suite cover both themes.

### D-025 Shorter timed exam when the bank is too small
The full exam (65 questions, 90 minutes) needs 16 / 19 / 22 / 8 questions; the bank has 10 / 12 / 15 / 7. CloudPrep never duplicates a question or starts a partial "full" exam. The exam page explains the shortfall per domain and offers two alternatives: Learning Mode, and a **shorter timed exam** using the same rules and domain balance at the real pace. Its size is the largest balanced exam the bank can supply (`maxBalancedQuestionCount`, currently 41) and its time is `ceil(n × 90 / 65)` minutes (currently 57). It's labelled "Shorter exam" everywhere and in history. The full exam stays the default and becomes available automatically once the bank is large enough. A shorter exam isn't offered below 10 questions.

### D-026 Exam question selection
`selectExamQuestions` (pure, seeded): allocate per domain with the largest-remainder method (D-007; ties go to the larger weight, then the lower domain number). Within each domain, pick questions not used in earlier exams first, then previously seen ones, spreading picks across task statements by round-robin. The final order is shuffled. Option order is shuffled with a separate seeded stream. The seed is stored in the session.

### D-027 Partly answered questions
A multiple-response question with fewer selections than required is shown as "partly answered" (dashed outline icon) and counted with unanswered questions in the finish dialog. It is scored as incorrect (no partial credit, D-012).

### D-028 Timer and auto-submission
The session stores `startedAt`, `endsAt` and `durationMs`. Remaining time is always `max(0, endsAt − now)`; a 1-second interval and `visibilitychange`/`focus` events only trigger re-renders. An app-wide `ExamWatcher` (in the root layout) submits when time runs out on any page. On load, an already-expired session is submitted with reason `expired_while_away`. Exactly-once submission comes from three layers: the reducer's terminal `submitted` state, `completeExam` storing an attempt id at most once, and the active exam being cleared after submission. Edits carry a timestamp and are refused at or after `endsAt`. Limitation: the timer trusts the device clock.

### D-029 Exams and practice progress
On submission, each **answered** exam question is recorded in practice progress (attempt id = session id, so it's idempotent). Unanswered questions aren't recorded, so running out of time doesn't flood Mistakes with unseen questions.

### D-030 Exam eligibility (interim)
`EXAM_ELIGIBLE_STATUSES` is `['checked', 'approved']`, because no question is approved yet (D-016). Change it to `['approved']` in `src/domain/exam/config.ts` once questions are reviewed.

### D-005 (final) Hand-written validation instead of Zod
Every stored area and every imported file goes through `decodeArea` (version check, then explicit migrations, then a hand-written parser). The parsers are small, typed and unit-tested per field, and do things a generic schema library wouldn't do by default: per-entry recovery (keep valid entries, report dropped ones), cross-field consistency checks (answers only to questions in the exam, outcome agrees with selection, summary recomputed from outcomes) and unsafe-key filtering. Zod would duplicate this without removing the custom checks, so no dependency was added.

### D-031 Question archive (snapshot strategy)
Attempts store ids, revisions, selections, option order and outcomes, never question text. Each question revision used in an exam is stored once in `cloudprep:questionArchive` (keyed `id@revision`) and shared by every attempt that used it; revisions no attempt uses are pruned. Old attempts are reviewed exactly as taken, even after the bank changes. If an archived revision is missing, the current version is shown with a note.

### D-032 Attempt summaries (replaces the "derive on read" part of D-009)
Each attempt stores its summary (total, correct, incorrect, unanswered, per-domain breakdown), time used and benchmark outcome. Per-question outcomes stay the source of truth: on read, the summary is recomputed and repaired (with a notice) if it disagrees. The schema v1 to v2 migration derives outcomes from `isCorrect` and computes the summary.

### D-033 Readiness guidance
Four explicit criteria over the last three exams: at least three exams; average at or above the benchmark; each exam at or above it; every domain at or above it with at least 10 questions pooled. Levels: not enough data / below / approaching / "consistently at or above your practice benchmark". It never says "ready" and is always shown with its criteria and an uncertainty note. Domains are called strengths or weaknesses only with at least 10 questions; small samples in a single attempt are flagged.

### D-034 Settings storage
`DEFAULT_PREFERENCES` lives in code; `cloudprep:preferences` (v2) stores only the fields the learner changed. Invalid or unknown fields are dropped one by one. The v1 (full object) to v2 migration keeps only values that differed from the v1 defaults. "Restore default settings" clears the overrides. Only implemented settings are offered: theme (dark/light/system), motion (system/reduce), benchmark (50–90 in steps of 5), low-time warnings, option shuffling and practice length. There are no sound settings, because the app has no sounds.

### D-035 Export, import and recovery
Export format: `{ app, kind: 'export', format: 1, exportedAt, areas: { <area>: { schemaVersion, data } } }`. Any exam in progress is excluded. Import uses JSON.parse only (content is never evaluated), with a 5 MB limit; every included area is decoded and migrated exactly like storage. Any unusable area rejects the whole file, so imports never half-apply. Invalid entries inside an area are skipped and counted, and keys such as `__proto__` are ignored. A preview is shown before anything is applied.
- **Merge** (idempotent): attempts and sessions are combined by id, with current records winning; bookmarks are combined, keeping the earliest date; for practice progress, each question keeps the record with more attempts (counts are never added together); current settings are kept.
- **Replace**: areas in the file replace the current ones; areas not in the file are untouched.

A full backup (`cloudprep:backup:snapshot:<ts>`, newest 3 kept) is saved before either. The Recovery section lists backups and copies of unreadable data, with download, restore (full backups only) and delete. Clear actions are separate: exam in progress, learning progress, exam history, and everything (type RESET to confirm).

### D-036 Practice-integrity monitoring
Opt-in per exam:
- **Standard**: nothing is monitored.
- **Strict**: fullscreen is requested from the start click, and tab visibility, window focus and fullscreen changes are logged.
- **Strict with webcam**: adds local face-presence checks every 3 seconds, logging only changes.

Only `{type, at}` is stored, capped at 500 events, in the session and then copied to the attempt. The learner can stop monitoring or turn the camera off at any time. Monitoring stops and all camera tracks are released when the exam ends or the exam layout unmounts. Results show a neutral timeline with plain-language explanations and "action needed" text: no score, percentage or verdict. Each attempt has a "Delete log" action. Monitoring never affects scoring, and a damaged log is dropped without invalidating its exam.

### D-037 Face detection evaluation
Options evaluated:
- face-api.js: unmaintained since 2020.
- TensorFlow.js with BlazeFace: about 1 MB or more of JS plus a model.
- MediaPipe Tasks Vision: Apache-2.0 and maintained, but multi-MB WebAssembly plus a model to self-host.
- The browser's built-in `FaceDetector` (Shape Detection API): no download, but not enabled by default in desktop Chrome, Edge, Firefox or Safari.

For an optional feature in a personal tool, the libraries' size and fragility weren't justified. Detection therefore uses `FaceDetector` behind an interface; where it's missing, the webcam option is disabled with an explanation.

Verified on 2026-10-21: Playwright Chromium and WebKit both lack `FaceDetector`, so the option is disabled in both; fullscreen works in both; camera access works in Chromium. The webcam flow is tested end to end with a stand-in detector.

### D-038 Vercel configuration
`vercel.json` sets framework `vite`, build `npm run build` and output `dist`. It rewrites every path **except `/assets/*`** to `/index.html`, so deep links and refreshes work. Hashed asset files are cached for a year (`immutable`). Excluding `/assets` means a missing page file (for example, after a redeploy while a tab was open) returns a 404 rather than HTML served as JavaScript. The route error page then offers Reload, and no data is lost. No other headers (such as a Content Security Policy) were added: the site has no backend or third-party scripts, and a CSP would need testing against the inline theme script (D-039).

### D-039 Theme before first paint
`index.html` hard-coded `data-theme="dark"`, so light-theme users saw a dark flash on every load. A small inline script reads `cloudprep:preferences` and applies `light` (or the system preference when "System" is chosen) before the app loads. It is wrapped in try/catch and falls back to dark. The app then applies the same setting through `src/lib/theme.ts`.

### D-040 Full-exam journey with a generated bank (QA pass)
The real bank is too small for a 65-question exam, so the full journey (65 unique questions in a 16 / 19 / 22 / 8 split, 90 minutes, change answers, flag and unflag, grid navigation, final review, submit and exact scoring) is tested in `src/features/exam/FullExam.test.tsx`. That test swaps in a generated bank with `vi.mock`. The shorter-exam journey runs end to end against the real bank in Playwright.
