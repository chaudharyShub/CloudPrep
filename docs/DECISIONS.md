# CloudPrep — Decision Log

> Lightweight ADRs. Status: **Accepted** · **Superseded** (replaced by a later decision; the entry is kept for history).
> Early entries were written as proposals before the app existed; on 2026-10-26 every status was checked against the code (D-051). Entries keep their original text, with updates noted.
> Last updated: 2026-10-29

| ID | Decision | Status |
|---|---|---|
| D-001 | Greenfield project; no migration needed | Accepted |
| D-002 | npm as package manager | Accepted |
| D-003 | Static SPA, no backend; data in localStorage | Superseded by D-044 (being replaced step by step) |
| D-004 | BrowserRouter + SPA-fallback host: Vercel | Accepted |
| D-005 | Runtime validation of stored data and imports: hand-written parsers, no Zod | Accepted |
| D-006 | Questions as typed TypeScript modules + build-time validator | Accepted (loading changed by D-046) |
| D-007 | Full mock allocation 16/19/22/8 (largest remainder over 65) | Accepted |
| D-008 | Practice score = percent correct; default benchmark 70%; no fake /1000 score | Accepted (option A) |
| D-009 | Store per-question correctness snapshot in exam history | Accepted (extended by D-032) |
| D-010 | Practice sessions not restored after refresh | Accepted |
| D-011 | Inter Variable via @fontsource (self-hosted) | Superseded (Source Sans 3, Newsreader, IBM Plex Mono; D-057) |
| D-012 | Multiple-response scoring is all-or-nothing | Accepted |
| D-013 | No pause in Exam Mode | Accepted |
| D-014 | Native `<dialog>` and native inputs instead of a UI library | Accepted |
| D-015 | `useSyncExternalStore` store + Context; no state library | Accepted |
| D-016 | Review workflow: draft → checked → approved; practice shows checked + approved | Superseded by D-041 |
| D-017 | Dark theme only in v1; light theme optional later | Superseded (light and system themes built, D-024, D-034) |
| D-018 | Strict option counts: single = 4, multiple ≥ 5 (mirrors exam guide) | Accepted |
| D-019 | Practice statistics: attempt counts + question-level latest result | Accepted |
| D-020 | Tool versions: TypeScript 6.0 and ESLint 9 (not 7 / 10) | Accepted |
| D-021 | User's phase numbering differs from the original plan | Accepted |
| D-022 | Every answer option needs an explanation (not only incorrect ones) | Accepted |
| D-023 | Practice sessions are idempotent per session; one attempt per question per session | Accepted |
| D-024 | Colour tokens verified against WCAG 2.2 AA | Accepted |
| D-025 | Shorter timed exam offered when the bank can't supply a full exam | Accepted |
| D-026 | Exam question selection: unseen first, spread by task statement, seeded | Accepted |
| D-027 | Partly answered multiple-response questions are shown as "partly answered" and scored incorrect | Accepted |
| D-028 | Exam timer: absolute end time; auto-submit from an app-wide watcher | Accepted |
| D-029 | Submitted exams update practice progress for answered questions only | Accepted |
| D-030 | Exams accept `checked` questions until questions are approved | Superseded by D-041 |
| D-031 | Question archive: question content stored once per revision for past attempts | Accepted |
| D-032 | Attempts store score, counts and domain breakdown (schema v2) | Accepted |
| D-033 | Readiness guidance: explicit criteria, 3+ exams, never "ready" | Accepted |
| D-034 | Settings: defaults in code, only explicit choices saved (schema v2) | Accepted |
| D-035 | Export/import: same validation as storage; merge and replace rules; backup first | Accepted |
| D-036 | Practice-integrity monitoring: opt-in, local, type + timestamp only, no verdicts | Accepted (webcam level retired by D-043) |
| D-037 | Face detection: built-in browser FaceDetector only; no ML library | Superseded by D-043 |
| D-038 | Vercel configuration: SPA fallback except /assets, immutable asset caching | Accepted (also skips /_vercel, D-048) |
| D-039 | Apply the saved theme before first paint with a small inline script | Accepted |
| D-040 | Full 65-question exam journey tested with a generated bank | Accepted |
| D-041 | Large generated bank with an `unverified` status | Accepted |
| D-042 | No imported question sets | Accepted |
| D-043 | Strict AI proctoring replaces the webcam option | Accepted |
| D-044 | Supabase backend: one repo, questions authored in the repo and published to Postgres | Accepted |
| D-045 | Sign-in: magic link + Google via an auth interface; guests keep Learning mode; fake sign-in for E2E builds | Accepted |
| D-046 | Questions load from Supabase at runtime, cached in IndexedDB by bank version; the bank leaves the bundle | Accepted |
| D-047 | Signed-in users' data syncs to Supabase from a local copy; guest data stays separate and is added only on request | Accepted |
| D-048 | Vercel Web Analytics for page views, production builds only | Accepted |
| D-049 | Test time limits sized for a parallel run on a 4-core machine; effect-timing races fixed | Accepted |
| D-050 | CloudPrep logo (circuit cloud), app icons, link preview and page icons | Accepted |
| D-051 | Docs brought in line with the app; version 2.0.0 | Accepted |
| D-052 | Review due: spaced-repetition review schedule; version 2.1.0 | Accepted |
| D-053 | Reload once when a page file is missing after a deploy; version 2.1.1 | Accepted |
| D-054 | Admin page for signed-in users, access checked in the database; version 2.2.0 | Accepted |
| D-055 | Admin link for admins only; admin email in `.env.local` added by a script; version 2.3.0 | Accepted |
| D-056 | Developer credit with a portfolio link; version 2.4.0 | Accepted |
| D-057 | UI redesign "Study notes in aubergine" (with an exam-paper answer sheet), landing page, version 3.0.0; old UI kept on `archive/ui-v2` | Accepted (live, PR #15) |

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
**Update (D-046):** the modules are still the source of truth, but they are now published to Supabase and the app downloads them at runtime; the bank is no longer in any app chunk.

### D-007 Domain allocation for 65 questions
The official weights apply to 50 scored questions; the distribution of the 15 unscored ones is unknown. Applying the weights to 65 with the largest-remainder method gives 15.6/19.5/22.1/7.8 → **16/19/22/8**. (Applying them to 50 would give 12/15/17/6 + 15 unknown.) This is documented in the UI as an approximation.

### D-008 Unofficial practice score — **resolved: option A**
**Update:** option A is what was built: percent correct, a benchmark of 70% by default (50–90% in Settings), and no number out of 1,000 anywhere in the app.

_Original question:_
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

### D-016 Content review gate — **superseded by D-041**
**Update:** D-041 added the `unverified` status, and Learning and Exam modes both show `unverified`, `checked` and `approved` questions. Only the user sets `approved`.

**Update (Phase 2):** Without a decision, the bank uses a four-step status: `draft` (never shown), `checked` (author verified against the cited AWS pages), `approved` (a human reviewer signed off), `retired`. Learning Mode shows `checked` and `approved` questions, with a visible note on `checked` ones that they haven't had a second review. **Proposed for exams:** only `approved`, which needs your sign-off (Option A below) — to be confirmed before the exam phase.

**Original context:**
**Context:** The brief requires factually reviewed questions. I can write questions from AWS documentation and check them against the cited pages, but AWS changes over time, and a second human check catches errors I might miss.
**Options:**
- **A. I draft and self-check; you review and approve each batch; only `reviewed` questions appear in exams.** *Recommended.*
- B. I draft, self-check and mark them reviewed; you spot-check (faster, more risk).
- C. You supply questions, and I validate their structure and check their facts.

### D-017 Dark-only v1 — **superseded**
**Update:** the light theme was built in Phase 1 (contrast checked in both themes, D-024), and Settings offers dark, light and system (D-034).

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
**Update:** since the 2,000-question bank (D-041) the full exam is always available; the shorter exam remains for a bank that can't supply 16 / 19 / 22 / 8 questions. The numbers below are from when the bank had 44 questions.

The full exam (65 questions, 90 minutes) needs 16 / 19 / 22 / 8 questions; the bank has 10 / 12 / 15 / 7. CloudPrep never duplicates a question or starts a partial "full" exam. The exam page explains the shortfall per domain and offers two alternatives: Learning Mode, and a **shorter timed exam** using the same rules and domain balance at the real pace. Its size is the largest balanced exam the bank can supply (`maxBalancedQuestionCount`, currently 41) and its time is `ceil(n × 90 / 65)` minutes (currently 57). It's labelled "Shorter exam" everywhere and in history. The full exam stays the default and becomes available automatically once the bank is large enough. A shorter exam isn't offered below 10 questions.

### D-026 Exam question selection
`selectExamQuestions` (pure, seeded): allocate per domain with the largest-remainder method (D-007; ties go to the larger weight, then the lower domain number). Within each domain, pick questions not used in earlier exams first, then previously seen ones, spreading picks across task statements by round-robin. The final order is shuffled. Option order is shuffled with a separate seeded stream. The seed is stored in the session.

### D-027 Partly answered questions
A multiple-response question with fewer selections than required is shown as "partly answered" (dashed outline icon) and counted with unanswered questions in the finish dialog. It is scored as incorrect (no partial credit, D-012).

### D-028 Timer and auto-submission
The session stores `startedAt`, `endsAt` and `durationMs`. Remaining time is always `max(0, endsAt − now)`; a 1-second interval and `visibilitychange`/`focus` events only trigger re-renders. An app-wide `ExamWatcher` (in the root layout) submits when time runs out on any page. On load, an already-expired session is submitted with reason `expired_while_away`. Exactly-once submission comes from three layers: the reducer's terminal `submitted` state, `completeExam` storing an attempt id at most once, and the active exam being cleared after submission. Edits carry a timestamp and are refused at or after `endsAt`. Limitation: the timer trusts the device clock.

### D-029 Exams and practice progress
On submission, each **answered** exam question is recorded in practice progress (attempt id = session id, so it's idempotent). Unanswered questions aren't recorded, so running out of time doesn't flood Mistakes with unseen questions.

### D-030 Exam eligibility (interim) — **superseded by D-041**
**Update:** `EXAM_ELIGIBLE_STATUSES` is now `['unverified', 'checked', 'approved']`, the same as Learning mode.

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

### D-037 Face detection evaluation — **superseded by D-043**
**Update:** the FaceDetector webcam option was removed; strict AI proctoring with self-hosted MediaPipe models replaced it (D-043). `webcam` stays a valid mode only so old logs load.

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
**Update:** since D-041 the real bank supports the full exam, and the unit and E2E tests cover it against the real bank as well.

The real bank is too small for a 65-question exam, so the full journey (65 unique questions in a 16 / 19 / 22 / 8 split, 90 minutes, change answers, flag and unflag, grid navigation, final review, submit and exact scoring) is tested in `src/features/exam/FullExam.test.tsx`. That test swaps in a generated bank with `vi.mock`. The shorter-exam journey runs end to end against the real bank in Playwright.

### D-041 Large generated bank with an `unverified` status
At the user's request (2026-10-21), the bank grew from 44 to 2,000 original questions, written in batches from public AWS documentation and the CLF-C02 exam guide. They could not each be re-checked against their sources, so they use a new review status, `unverified`, between `draft` and `checked`. Unverified questions appear in Learning and Exam modes (this replaces the D-016 rule for them), and Learning mode shows a note on their feedback. Every reference URL comes from `refs.ts`, a list checked for HTTP 200 on 2026-10-21 (`scripts/check-references.mjs` re-checks it). `scripts/check-duplicates.mjs` flags near-duplicates by wording; pairs above 0.3 were rewritten or reviewed. With 400 / 600 / 753 / 247 questions per domain, the full 65-question exam is available, and the unit and E2E tests now cover it against the real bank. The "full exam unavailable" state is tested with a small mocked bank (`ExamUnavailable.test.tsx`). The bank stays in the main bundle (about 430 KB compressed); lazy loading was not added without discussion. (Superseded by D-046: the bank is now loaded from Supabase.)

### D-042 No imported question sets
Public repositories with large CLF-C02 sets were reviewed (for example, nastaso/cloudcertprep and kananinirav/AWS-Certified-Cloud-Practitioner-Notes). Despite MIT labels, their questions have no documented origin and match widely circulated exam-dump questions, so none were imported. All questions in the bank are original.

### D-043 Strict AI proctoring replaces the webcam option
The user asked (2026-10-22) for exams proctored "as strictly as possible", more strictly than the real exam, including phone detection, and for the built-in-FaceDetector webcam option (D-037) to be removed, because almost no browser enables it.

- **Models:** MediaPipe Tasks Vision 1.1.0 (Apache-2.0) with Face Landmarker (478 landmarks, blendshapes, head transformation matrix) and EfficientDet-Lite2 int8 object detection (COCO labels cell phone, person, book, laptop and tv). Lite2 was chosen over Lite0 for better accuracy on small objects such as phones. The runtime and models are self-hosted (`scripts/setup-proctor-assets.mjs`, pinned SHA-256 hashes) and load only when a proctored exam starts. The GPU is used when available, otherwise the CPU. Sound is measured as loudness with the Web Audio API (no speech model). Cloud AI services were rejected: they cost money and would upload video.
- **This changes D-036 for this mode only.** Strict practice still never judges. Proctored mode is opt-in and does judge: two warnings, then the third strike ends the exam, and zero-tolerance events end it at once. The verdict is a pure function of the saved event log (`proctorStatus`), so a reload can't reset it, and `ExamWatcher` submits with `proctor_ended`. Such attempts are void (`benchmarkMet` is false, also when re-parsed) and left out of readiness, but they keep their score for review.
- **Strictness:** thresholds live in `PROCTOR_THRESHOLDS` and `SUSTAIN_MS` (for example, head turned more than 25° or eyes off the screen for 2 s). They are relative to a 3-second calibration, so camera position doesn't count against the learner. Violations within 3 s are one incident (Alt+Tab fires blur and tab-hidden together, and a reload fires tab-hidden before "Exam interrupted").
- **No opt-out mid-exam:** a proctored exam has no "Stop monitoring" button. Losing the camera or microphone ends it, and a reload is a strike followed by a forced proctor restart.
- **Privacy unchanged:** only `{type, at}` is stored, nothing is recorded or uploaded, and the camera image is always visible during the exam.
- **Testing:** the rules and engine are unit-tested with fake readings and devices. E2E tests use a scripted analyzer (`window.__cloudprepProctorAnalyzer`), Chromium's fake camera and a silent fake microphone, and one E2E test checks that the real models load and analyse the camera. Real-world accuracy hasn't been measured.
- **Storage:** the new event types, the `proctored` mode and the `proctor_ended` reason are additive, so no migration is needed. `webcam` stays a valid mode for old logs. The event cap went from 500 to 1,000.
- **Fix (2026-10-22):** in development, React mounts the exam layout twice, and the first cleanup left the fullscreen the exam had just entered, which counted as a violation. Leaving fullscreen now waits until after the render pass and is cancelled if the layout remounts (`useIntegrityMonitor`).

### D-044 Supabase backend (replaces D-003)
The user asked (2026-10-22) for questions to come from a backend, for sign-in so progress follows the user, for data to stop living only in the browser, and for the app to support more exams later.

- **Platform:** Supabase (Postgres, Auth, Row Level Security). The app talks to Supabase directly with the publishable key; RLS protects the data. No separate API server. Edge Functions are added only when server code is needed (server scoring).
- **Repository:** one repo. `supabase/` holds `config.toml`, `migrations/` and later `functions/`, versioned with the frontend, which still deploys to Vercel. A workspaces monorepo is postponed until code must be shared with a second deployable (for example, domain scoring in a Deno Edge Function, which can't resolve the `@/` alias).
- **Questions:** the repo stays the source of truth (validation, duplicate check, git history). `npm run publish:questions` validates the bank and upserts it with the secret key: exam catalogue, then `questions` (no answers), `question_keys` (answers, explanations, sources) and `question_revisions` (full content per revision, the server-side question archive of D-031). Drafts are never published. It refuses to run if a published question is missing from the repo (retire, never delete). `exams.bank_version` is set last, so clients can cache by it. Edits made directly in the database are overwritten.
- **Answers:** for now `question_keys` is readable like `questions`, because scoring is still client-side. Keeping answers in their own table lets a later step lock it and score on the server without a schema change.
- **Multiple exams:** the schema is ready (`exams`, `exam_domains`, `exam_topics`, `exam_id` on every table). The app itself stays CLF-C02-only: no exam picker, and the domain types are unchanged. CLF-C02's id is `clf-c02` (`EXAM_ID`).
- **User data:** `profiles` (created by a trigger on sign-up), `user_preferences` (only changed settings, D-034), `question_progress`, `bookmarks`, `practice_sessions`, `exam_attempts` + `exam_attempt_questions`, and `active_exams` (the exam in progress). Every table is limited to `auth.uid()` by RLS, and deleting an account deletes its data. User tables don't reference `questions(id)`, so history survives content changes and local data imports. The integrity log stays a JSON `{mode, events}` on the attempt (only `{type, at}`, as before).
- **Grants:** table privileges are set explicitly on top of RLS: guests may only read content, signed-in users read content and revisions and write only their own data, and nobody but the service role writes content.
- **Access:** guests can use Learning mode (stored locally, as now). Exams, history and the dashboard need sign-in. Sign-in uses email magic links and Google.
- **Testing:** `src/backend/schema.test.ts` applies the migrations to PGlite (in-process Postgres) with the Supabase roles and `auth.uid()` stubbed, and checks RLS, grants and constraints. Docker isn't installed on the dev machine, so the Supabase local stack isn't used.
- **Plan:** step 1 (schema, RLS, publish script) is done; then auth, loading questions from the database, moving progress to the database with a one-time import of local data, and later server scoring and multi-exam UI.

### D-045 Sign-in (Phase 8, step 2)
- **Methods:** email magic link and Google, through Supabase Auth. No passwords. PKCE flow: a sign-in link only works in the browser that asked for it; the page says so, and the callback page explains failed or expired links.
- **Interface:** the app depends on `AuthClient` (`src/backend/auth.ts`), not on Supabase. `createAuthClient` picks Supabase (`VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY`), a fake in `e2e` builds, or "unavailable" when the settings are missing (the site still works for guests and says sign-in isn't set up). The Supabase library is in its own chunk, loaded right after start-up rather than in the main bundle. `AuthProvider` (`src/state/`) exposes `loading` / `signed-out` / `signed-in`.
- **What needs sign-in:** dashboard, mock exams (entry, check-in, session, review), results, history and progress, via the `RequireAuth` route guard, which sends visitors to `/sign-in?next=…` and back afterwards. Open to guests: Learning mode, bookmarks, settings, privacy. `next` only accepts paths on this site (`safeNextPath`), so sign-in links can't redirect elsewhere. `/` still goes to the dashboard, so guests land on sign-in, which offers "Continue as a guest".
- **Data is unchanged in this step:** progress, attempts and settings stay in this browser and are shared by everyone using it, signed in or not, until step 4.
- **E2E:** Playwright runs against `vite build --mode e2e` (`dist-e2e/`). In that mode the fake sign-in reads a session from localStorage (`cloudprep-e2e-auth`), which the shared fixture (`tests/e2e/support/fixtures.ts`) seeds by default; `test.use({ signedIn: false })` tests as a guest. Production builds don't contain the fake (the `MODE === 'e2e'` branch is removed at build time; checked by searching `dist/`). Component tests pass a fake through `renderApp(path, { auth })`, signed in by default.
- **Exam auto-submit fix:** the guard renders a skeleton while sign-in loads, so an exam that expired while the app was closed could be submitted before the exam layout mounted, and the layout then sent the learner to the exam start page instead of the results. `ExamWatcher` now waits until sign-in has loaded before submitting (so the exam layout is mounted first and redirects to the results as before), and also opens the results itself when a submission happens on an exam page.
- **Known flaky tests (not caused by this step):** in WebKit on the dev machine, the two Learning mode E2E journeys take 18–31 s against Playwright's 30 s limit and sometimes time out. The same happens on the step 1 commit (checked 2026-10-23). The tests were not changed. (Fixed by D-049.)
- **Email delivery:** Supabase's built-in email service only sends to the project team's addresses and has a low hourly limit, so magic links for friends need custom SMTP (DEPLOYMENT.md). Google sign-in doesn't.
- **Email sign-in switched off for now (2026-10-24):** the user chose not to set up SMTP yet (a sender address that isn't a domain they own looked untrustworthy), so the sign-in page offers only Google unless the build has `VITE_EMAIL_SIGN_IN=true` (`readEmailSignIn`, exposed as `AuthClient.emailSignIn`). The magic-link code, callback and tests stay; test fakes and E2E builds keep it on. To turn it on: set up custom SMTP, add the variable in Vercel and redeploy.
- **Sign-out confirmation (2026-10-25, user request):** both sign-out buttons (navigation and Settings) open a confirmation dialog first (`useSignOutConfirmation`, built on `ConfirmDialog`). Its text says whether everything is already saved to the account or some changes are still waiting (AC-B.25).

### D-046 Questions from the database (Phase 8, step 3)
- **Source:** the app downloads the exam's visible questions from Supabase (`questions` with their `question_keys` embedded, 1,000 rows per request), as a guest or signed in. Every row is rebuilt with `rowsToQuestion` and checked with `validateQuestion`; invalid rows are left out and counted. The production bundle no longer contains questions: the main chunk went from about 1.55 MB to 317 KB (uncompressed), and `dist/` contains no question IDs. An ESLint rule stops app code from importing `@/content/*`.
- **Cache:** the downloaded bank is stored in IndexedDB (`cloudprep` / `questionBanks`, keyed by exam id) with its `bank_version`, in a versioned envelope (`parseCachedBank` validates every question). It's a copy of server data, so an unreadable entry is discarded and downloaded again, not backed up. IndexedDB rather than localStorage, because the bank (about 1.6 MB) would crowd out user data in localStorage's ~5 MB. Where IndexedDB is unavailable, an in-memory cache is used.
- **Loading:** `QuestionBankProvider` shows the cached bank at once, then fetches `exams.bank_version` and downloads the bank only if it changed. Without a cache, pages that use questions (`RequireQuestions`: Learning mode, bookmarks, dashboard, exams, results, history, progress) show a skeleton, and on failure an error with "Try again". With a cache the app keeps working when the download fails (offline). Settings, privacy and sign-in never wait. A newer bank replaces the old one while the app is open; question IDs are stable, so sessions continue, as they did when a new deployment changed the bundled bank.
- **Derived data:** `buildQuestionBank` computes the practice and exam sets, lookups, domain availability and the full/short exam offer once per version (these were import-time constants in `state/examQuestions.ts`, now removed). Exams record the loaded bank's version.
- **Auto-submit:** `ExamWatcher` also waits until the bank is loaded, because scoring needs the questions (and the "expired while away" reason depends on the first check).
- **Other sources:** E2E builds, and development without Supabase settings or with `VITE_QUESTIONS_SOURCE=local`, load the bundled bank as a separate chunk; production builds drop those branches. Tests start ready with `TEST_BANK` (`src/test/bank.ts`) or pass a loader to `renderApp`.
- **Checking a publish:** `npm run check:published` downloads the bank with the public key through the app's own code and compares it with the repo (checked 2026-10-23: 2,000 questions, none rejected, identical, about 1–3 s).
- **Not done here:** answers are still downloaded with the questions (server scoring is step 5), and user data still lives in the browser (step 4).

### D-047 Progress in the database (Phase 8, step 4)
- **Local copy, synced:** for signed-in users the store keeps working on a copy in this browser (so pages stay synchronous, fast and usable offline), and `src/storage/sync.ts` keeps it in step with the user tables. Each local change marks the records it touched (question ids, session or attempt ids, the exam in progress, settings) as pending. Pending records are sent after a short wait (800 ms, so bursts go together), retried with back-off (2 s up to 60 s) and when the browser comes back online, and the pending list is saved in the browser so changes made offline or just before closing the tab are sent later. Values are read from the store at send time, so the list holds only keys.
- **Downloads:** on sign-in, when the browser comes back online, and when the tab is shown after a minute or more, the engine sends pending changes and then replaces the copy with the server's data, but only if nothing is pending, and it discards a download if a change was made meanwhile. Server data goes through the same parsers as browser storage; invalid rows are left out. If the same account is changed on two devices at once, the last write per record wins.
- **Guest data stays separate (user's choice, 2026-10-24):** guest data keeps the original `cloudprep:` keys. The account copy lives under `cloudprep-account:` (a scoped driver, `createScopedDriver`) with an owner record `{userId, signedIn}`. Opening another user's copy removes the previous one. On sign-out the copy is removed once everything is on the server; unsent changes are kept (marked signed out, never shown early) and sent at the next sign-in. While sign-in loads, the copy of a user who hasn't signed out is shown at once.
- **Adding guest data (user's choice):** after signing in on a browser with guest progress, bookmarks, sessions or exams, the user is asked once per account ("Add to my account" / "Not now"); Settings offers it again. Adding merges with the existing import rules (`mergeData`) after a local backup; guest data is left as it is.
- **Settings act on the account (user's choice):** for signed-in users, clearing and resetting delete the account's rows on every device (an emptied area is sent as one "clear"). Export, import and recovery backups work on the account copy. The account card shows whether changes are saved or waiting.
- **Sign-out:** waits up to 5 s for pending changes to be sent (the server only accepts them while signed in), then signs out; if they couldn't be sent it says so.
- **Not synced:** the question archive (D-031) stays local, so on a new device an attempt taken with an older question revision is reviewed with the current one, with the existing note. The integrity log is synced with its attempt (only `{type, at}`).
- **Server code:** `src/backend/userRows.ts` (row mappers), `userDataRemote.ts` (`UserDataRemote` over a small `UserTables` interface, with a Supabase implementation that pages by primary key) and `fakeUserTables.ts` (tests, and E2E builds when a test sets `sync`). No migration was needed: the step 1 tables already fit. `schema.test.ts` runs the real sync against the migrations in PGlite (constraints, conflict keys, RLS, round trip).
- **Without a server** (E2E builds by default, development without Supabase settings) the account copy simply stays in the browser.
- **Theme before first paint:** `index.html` reads the account copy's settings when its owner is signed in, otherwise the guest's.
- **Tests:** `renderApp` uses one store for guests and accounts unless a test passes real accounts. E2E specs that seed storage while signed in use the `cloudprep-account:` keys and wait for the copy to exist.

### D-048 Page-view analytics (Vercel Web Analytics)
- **Requested by the user (2026-10-24):** to see how the shared site is used. `@vercel/analytics` (`<Analytics />` from `@vercel/analytics/react`) is mounted in `src/main.tsx`, outside `App`, and only when `import.meta.env.MODE === 'production'`, so development and E2E builds load and send nothing. It follows React Router's history changes on its own.
- **What it collects:** page views (URL path), referrer, country, browser, operating system and device type. No cookies; Vercel tells visitors apart with a hash that changes daily. App data (answers, progress, results, account details) is never sent. The privacy page has a "Usage statistics" section.
- **Hosting:** the script and its endpoint are served by Vercel under `/_vercel/insights/`; the SPA rewrite in `vercel.json` now leaves `/_vercel/*` alone. Web Analytics must be enabled once in the Vercel project (*Analytics → Enable*); until then the script isn't served and nothing is collected.
- **Deployment:** through the usual Git flow (merge the PR; Vercel deploys `master`), not `vercel --prod` from a local folder.

### D-049 Reliable test runs (2026-10-24)
- **Problem:** almost every `npm run check` on 2026-10-24 failed on one random test, a different one each time, and each passed when rerun on its own. On the 4-core dev machine the unit suite runs 55 jsdom files in parallel; page tests load lazy route chunks and routinely take 2–4 s, against a 5 s test limit and a 3 s `findBy*` wait. The WebKit Learning mode journeys took 24–28 s against Playwright's 30 s limit. Anything else running (a second check, an install, the dev server) pushed tests over.
- **Time limits:** Vitest `testTimeout` 15 s (was 5 s), Testing Library `asyncUtilTimeout` 10 s (was 3 s), Playwright `timeout` 60 s (was 30 s) and assertion timeout 15 s (was 5 s: the first page of a run, in a fresh browser, can still show "Loading questions…" after 5 s while it builds the bank). They only change how long a failing test takes to report: every assertion is unchanged, and an element that never appears still fails the test.
- **Parallelism:** running fewer Vitest workers (2) was slower (141 s against 109–133 s) and no more stable, so the default stays.
- **Races fixed in tests:** two tests acted right after a page appeared, before an effect had run. The proctor test (AC-7.5) now waits for `proctor-resumed` in the log, and the fullscreen-exit test waits for `monitoring-started` (logged as the listeners are attached) before simulating the event.
- **Checked:** two full unit runs passed; two rounds of two suites run at the same time (double load) passed all 2,040 tests; then `npm run check`.

### D-050 Logo, icons and link preview (2026-10-24)
- **Logo:** after two rounds of original options (a cloud with a check; then a C monogram, badge, summit and cloud-P), the user supplied a reference image: a cloud with circuit traces, apparently a stock graphic. It wasn't used as is (stock licences rarely allow a logo use, it isn't exclusive, and a JPG with a shadow can't follow the themes); an original version was drawn instead and the user chose variation 3: a cloud outline with three circuit traces ending in solid nodes, one colour, drawn on a 48-unit grid (paths in `src/components/brand/logoPaths.ts`, drawn by `LogoMark` and `LogoTile`). At 20 px and below it simplifies to the cloud and three dots. `LogoTile` shows it in `text-on-accent` on a solid `bg-accent` tile. It borrows nothing from Amazon Web Services branding. It appears in the sidebar and mobile header (`Brand`), on the sign-in card, the error page and the loading screens.
- **Browser and home-screen icons:** `public/favicon.svg` (the small form of the mark on the accent tile), `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` and `manifest.webmanifest` (name, colours, icons; no service worker, so it's "Add to Home Screen" only, not offline install). The PNGs and the preview image are drawn by `npm run brand:assets` (`scripts/generate-brand-assets.mjs`, Playwright's Chromium, the Inter font from `node_modules`; Source Sans 3 and Newsreader since D-057) and committed. `brandAssets.test.ts` checks that the favicon and the script use the same paths as `LogoMark`, and that every linked file exists.
- **Link preview:** Open Graph and Twitter tags in `index.html` with a 1200×630 `og-image.png`. Preview URLs must be absolute, so a small Vite plugin replaces `%SITE_URL%` with `https://` plus Vercel's `VERCEL_PROJECT_PRODUCTION_URL` at build time (site-relative elsewhere). Nothing to configure on Vercel while system environment variables are exposed (the default).
- **Page icons:** one icon per main page in `src/components/layout/pageIcons.ts`, used by both the navigation and `PageHeader`'s new `icon` prop, so they always match. Privacy uses a lock.
- **Domain icons:** tried (one icon per exam domain) and removed at the user's request; domains show their number and name only.
- **Branded waits:** `BrandLoading` (the logo pulsing, unless the system asks for reduced motion, plus a visible status message) replaces the skeleton while questions first download and the "Signing you in…" text. The 404 page keeps its compass icon inside the app layout, which already shows the logo.
- **Not done:** icons on every card heading (about 39), which would make pages busy.

### D-051 Docs brought in line with the app; version 2.0.0 (2026-10-26)
- **Audit:** at the user's request, every doc was checked against the code. README, KNOWN_LIMITATIONS and DEPLOYMENT still described a browser-only app and an unreviewed bank. PRODUCT_SPEC, ARCHITECTURE and TEST_PLAN were the first drafts from before the app was built.
- **User's choice:** rewrite PRODUCT_SPEC, ARCHITECTURE and TEST_PLAN to describe the app as it is, rather than keep them as historical plans. The original plan (phases P0–P10 and their criteria) stays in IMPLEMENTATION_PLAN.md with its changes noted, and this log keeps the reasons.
- **Acceptance-criteria tags:** only the Phase 7 and Phase 8 criteria are tagged in test names (`AC-7.x`, `AC-B.x`). The earlier phases were verified by the tests listed in TEST_PLAN.md, without tags. Old tests weren't renamed, because matching about 60 old criteria to tests after the fact would claim more traceability than was ever checked. New criteria keep using tags. The plan's Learning Mode criteria were renamed `AC-L.x`, because `AC-7.x` belongs to Phase 7 (AI proctoring).
- **Version:** `package.json` said `0.1.0`, although the first commit called the app v1.0.0. It is now **2.0.0**: the Supabase backend (accounts, sync, questions from the database) is a major change from the browser-only v1. The version isn't shown in the app, and no git tag was made.
- **Dependencies:** patch and minor updates applied, still pinned exactly: `@supabase/supabase-js` 2.118.0, `@mediapipe/tasks-vision` 1.1.1 (the WebAssembly runtime is copied from the package; the model hashes are unchanged), `@electric-sql/pglite` 0.5.11 and the `supabase` CLI 2.122.0. Still held back: TypeScript 7 and ESLint 10 (D-020: typescript-eslint supports TypeScript below 6.1, and eslint-plugin-jsx-a11y doesn't support ESLint 10), and `@types/node` 26 (the project runs on Node 24). `npm audit` reports no vulnerabilities.
- **In-app text:** the exam rules said answers were saved only in this browser, and that clearing browser data removes an exam in progress. Exams need sign-in, so they're also saved to the account. The Settings description no longer says the data is "stored in this browser".

### D-052 Review due: a spaced-repetition review schedule; version 2.1.0 (2026-10-26)
- **Why (agreed with the user):** practice picked questions at random, so when a question came back was left to chance, and a mistake answered right once (perhaps a guess) was never brought back on purpose. Spaced repetition brings missed and shaky questions back at growing gaps. Nothing is hidden: random practice, "Unanswered only", Mistakes and exams work as before.
- **Schedule (`src/domain/practice/review.ts`):** each answered question has a review level, 0–4, due again 1, 3, 7, 21 or 60 days after its latest answer. Days are local calendar days, so a late-evening mistake is due the next morning. A wrong answer sets level 0; a first correct answer sets 1; a correct answer moves up one level **only if the question was due**, so a retry in the same sitting or an early random repeat doesn't skip ahead (a Leitner-style box system rather than an SM-2 ease factor: simple to explain and to test). Exam answers move questions too, as they already update progress (D-029).
- **Queue:** due questions, lowest level first, then longest overdue. A review session takes the first ones up to the default practice length (Settings), so a large backlog becomes several short sessions; the session then shuffles them as usual.
- **UI:** a "Review due" card first in Learning mode's Review section (count due today, or when the next review is), and a "Review due" quick action on the dashboard that starts the same session (or opens Learning mode when nothing is due). Guests get the card too.
- **Storage:** `QuestionProgress.reviewLevel`; the `progress` area is now version 2. The v1 → v2 migration estimates a level, because the order of earlier answers wasn't stored: 0 if the latest answer was wrong; one level per correct answer (up to 4) if never wrong; otherwise 1. The parser rejects levels outside 0–4 and a non-zero level on a wrong latest answer. Exports from older versions import through the same migration.
- **Database:** migration `20261026120000_review_level.sql` adds `question_progress.review_level smallint` (0–4 or null). It's nullable, with no cross-column check, because rows saved before it, and rows written by an app version still open in a browser from before the deploy, have no level or a stale one. When reading rows, the app estimates a missing level the same way as the migration and always reads a wrong latest answer as level 0. **The migration must be applied (`npm run db:push`) before the app version that writes the column is deployed**, or saving progress to the account fails until it is. It was applied to the live database on 2026-10-26, before the merge.
- **Test cache gotcha:** Vitest 5 caches transformed modules on disk (`fsModuleCache`, `node_modules/.vitest-cache`), including the list of files `import.meta.glob` found. After adding a migration, `schema.test.ts` kept applying only the old ones until the cache was deleted. The cache stays on (it speeds up cold starts); after adding or removing a migration, delete `node_modules/.vitest-cache` before running the tests.
- **Version:** 2.1.0 (a new feature, backwards-compatible data).

### D-053 Reload once when a page file is missing after a deploy; version 2.1.1 (2026-10-26)
- **Problem (reported by the user):** each page is its own file with a content hash in its name, and a deploy removes the old files. A tab opened before the deploy still asks for the old names, so moving to a page it hadn't loaded yet showed "Something went wrong: Failed to fetch dynamically imported module". Reload fixed it, but users had to know that.
- **Fix:** reload the site once when a page file fails to load (`src/lib/reloadAfterUpdate.ts`). Two triggers: Vite's `vite:preloadError` event, fired for every lazily loaded file that fails (registered in `src/main.tsx`), and the route error page, which recognises the browsers' messages for a failed module script. The error page shows "CloudPrep was updated. Loading the latest version…" while the reload runs. The event isn't cancelled: cancelling it would hand the page code an empty module and a less clear error.
- **No loops:** a timestamp in `sessionStorage` allows one reload per 30 seconds. If the file fails again (offline, or really missing), the error page shows, now saying the user may be offline or the site may have been updated. Without `sessionStorage` it never reloads by itself, because it couldn't tell a second failure from the first.
- **Leaving the page:** WebKit fails the files still loading when the page navigates away, with the same message. The first version reloaded then and interrupted the navigation (seven WebKit E2E tests caught it). Failures after `beforeunload` or `pagehide` are now ignored, until `pageshow` brings the page back from the back/forward cache.
- **Rejected:** keeping old files on the host after a deploy (Vercel replaces the whole output, and it would only delay the problem); a service worker that caches every version (the PWA isn't built, PRODUCT_SPEC §4.3); checking for a new version on every navigation (an extra request for every page).
- **Test note:** WebKit remembers a failed module address within a tab even after a reload, so the E2E test simulates a real deploy: the reloaded page links to the page file under a new name, as a real new version does.
- **Version:** 2.1.1 (a fix).

### D-054 Admin page for signed-in users; version 2.2.0 (2026-10-29)
- **Requested by the user:** a dashboard in the same app, on its own route, showing who uses CloudPrep, reachable only by an admin with private credentials.
- **Scope (user's choice):** signed-in accounts with activity totals: name, email, sign-in method, sign-up date, last sign-in, questions answered and when, practice sessions, exams and best score (proctor-ended attempts are void, D-043, so they don't count). Guests aren't recorded per person; Vercel Analytics (D-048) already gives anonymous visit totals. Logging guests in the database was rejected: new data collection for little gain.
- **Access (user's choice):** the admin is a normal Google account listed in `public.admins`, checked by the database. A password or secret in the app was rejected: the site is static, so anything in its code is public. The `/admin` page's code is public too, but it holds no data; the data comes only from `admin_user_overview()`, a `security definer` function that raises `42501` unless `auth.uid()` is in `admins`. `admins` has RLS on, no policies and no grants for `anon` or `authenticated`, so nobody can read or change it from the app, admins included; it's edited in the Supabase SQL editor (DEPLOYMENT.md). Execute on the functions is revoked from `public` and `anon`.
- **App:** `AdminClient` (`src/backend/admin.ts`, an RPC plus a hand-written parser), created in `App.tsx` and provided by `AdminProvider`, like the auth client. `/admin` sits under `RequireAuth`, not under `RequireQuestions`, and isn't in the navigation. A non-admin sees "No admin access". Summary and sorting are pure (`src/domain/admin/users.ts`); "last activity" is the newest of sign-up, sign-in, latest answer and latest exam.
- **Privacy page:** now says the site owner can see the account list and totals, never answers.
- **Migration:** `20261029120000_admin_overview.sql`. The app code works before it is applied (the page just shows an error), but apply it with `npm run db:push` before deploying, then add the admin row. It was applied to the live database on 2026-10-29, just after the merge; until then the live `/admin` page showed its load error.
- **Version:** 2.2.0 (a new feature).

### D-055 Admin link and `admin:add` script; version 2.3.0 (2026-10-29)
- **Requested by the user:** a button for the admin, and a check of whether the email is the admin's, with the admin email in an env file.
- **Rejected:** `VITE_ADMIN_EMAIL` checked in the app. Vite puts `VITE_` values in the public bundle, so the email would be readable by anyone, and a check in app code can be bypassed; D-054 already rejected deciding admin access in the app.
- **Decision (user's choice):** the email goes in `.env.local` as `ADMIN_EMAIL` (no `VITE_` prefix, never in Vercel). `npm run admin:add` (`scripts/add-admin.mjs`) uses the secret key to find each listed account and add it to `public.admins`; it never removes admins. The app shows an **Admin** link in the navigation (sidebar and mobile menu, after Settings) only when `is_admin()`, which D-054 already created, returns true for the signed-in user (`useIsAdmin()` in `AdminProvider.tsx`). Errors count as "not an admin". The link is only a convenience: `/admin` data is still protected by `admin_user_overview()`.
- **Sign-in:** unchanged. The admin signs in with Google like everyone else; there is no separate admin login or password.
- **No migration:** `is_admin()` is already granted to `authenticated`.
- **Version:** 2.3.0 (a new feature).

### D-056 Developer credit; version 2.4.0 (2026-10-29)
- **Requested by the user:** show their name and portfolio link (https://shubhamworks.vercel.app/) in the app.
- **Decision:** "Made by Shubham Chaudhary" under the unofficial note in the sidebar and mobile menu (`MadeBy` in `src/components/layout/Brand.tsx`), and a "Who runs CloudPrep" section on the Privacy page, which already said the site owner can see the account list without naming them. Both use `ExternalLink` (new tab, announced). The name and URL live in `src/app/developer.ts`.
- **Not added:** a credit on exam or practice screens, the dashboard header or the sign-in page; it would distract there.
- **Note:** the name is public on the live site, as the user intended.
- **Version:** 2.4.0 (a new, small feature).

### D-057 UI redesign: "Study notes in aubergine" (2026-10-29)
- **Why:** the user wants CloudPrep to be a product (it is on their resume), and the old UI looked machine-made: Inter, a single blue accent on grey, rounded cards with an icon on each, and no landing page.
- **Chosen after mockups** (design canvas, private to the user): direction **B2 "Study notes in aubergine"**, with one change: the exam's question grid keeps direction A's exam-paper look. The user first picked A3 ("exam paper with an amber marker"; step 1 was built in it, never committed) and then switched to B2. Also rejected: a dark "console" look, cobalt, rust, red and blue variants, AWS's exact brand colours (navy `#232F3E` + orange `#FF9900` would make the site look official), and brown- or purple-tinted dark modes, which made the colours look muddy.
- **Look:** soft lilac-grey paper, white rounded cards (18px) with hairline borders, pill-shaped buttons, badges and navigation, Newsreader serif for page, card and dialog titles, Source Sans 3 for text. The exam's answer sheet is the exception: square cells, IBM Plex Mono numbers, a 1px ink border and an "ANSWER SHEET" label, in B2's colours. Fonts are self-hosted through `@fontsource-variable/source-sans-3`, `@fontsource-variable/newsreader` and `@fontsource/ibm-plex-mono` (400, 600); this replaces Inter (D-011).
- **Colour roles:** `accent` aubergine (`#6A2C5E` light, `#D9A0CB` dark), readable on surfaces; `highlight` is the soft tint for selected and active states (`#F1E0EC` / `#3D2338`) with `on-highlight` text; `primary` for main buttons; `meter` for progress fills; `flag` (orange) for flagged questions so they never look selected; `ink` for the answer sheet's hairlines; focus is blue so it never blends with the aubergine. Light paper `#F3F0F2`, ink `#1F1A1E`. Dark mode is true black `#000000` with neutral grey cards `#121214` / `#1A1A1D` and text `#EDEDED` (the user chose black over a charcoal version after comparing both).
- **Contrast is tested:** `src/styles/tokens.test.ts` reads both palettes from `index.css` and checks every text/surface pair and every on-fill pair at 4.5:1, and UI parts (control borders, meters, focus, ink, flag border) at 3:1. Axe runs in the E2E tests as before (D-024).
- **Brand:** the logo tile and all static icons are aubergine with a white mark; the link preview is light paper with Newsreader titles (`npm run brand:assets`); `theme-color` is `#000000`.
- **Process (user's choice):** the current UI is frozen on the `archive/ui-v2` branch and tag `v2.4.0`. The work was planned as steps (1 tokens and shared components; 2 sidebar, mobile menu and page headers; 3 pages; 4 a landing page at `/`; 5 product wording) and built together on the `ui/redesign` branch, merged into `master` as 3.0.0 (PR #15) and deployed on 2026-10-29.
- **Two small additions agreed for step 3:** a "weakest" tag on the lowest-scoring practice domain, and the time used in Recent attempts (already stored as `timeUsedMs`). No greeting.
- **Shell and pages (steps 2–3):** pill navigation without icons (the D-050 page icons were removed from the navigation and page titles), serif page titles, an account block with initials and a "Sign out" link, an exam header with the logo, a pill timer and a progress line. The dashboard has a large serif score, an emphasised "Review due" action, domain tiles and a full-width Recent attempts list. Answer options are rows with a letter disc (round for one answer, rounded square for several); the native input covers the row invisibly, so it is still what is clicked and focused. The exam's question grid is the "Answer sheet": square cells, mono numbers, an ink border, flagged questions in orange.
- **Weakest domain:** `weakestDomain` (`src/domain/practice/progress.ts`) returns the domain with the lowest practice accuracy once at least two domains have 20 answers each (`WEAKEST_MIN_ANSWERED`), ties going to the earlier domain; the dashboard tags it. **Time used:** `formatMinutes` rounds up to whole minutes.
- **Landing page (step 4):** `/` renders `HomeRoute`: the landing page for guests (no question count, so it can't go stale), the dashboard for signed-in users. It sits outside `AppLayout`. The logo links to `/`. The E2E test AC-B.6 now checks the landing page (with axe) instead of a redirect to sign-in.
- **Version:** 3.0.0 (a major visual change and a new front page).
- **Learning mode answer sheet (user's request):** the practice session's question navigator became the same "Answer sheet" panel as the exam (square cells, mono numbers, ink border), on the right on wide screens and under the progress bar otherwise (one element, placed by the grid). Cells show correct (green, tick), incorrect (red, cross), answer chosen but not checked (dashed), not answered, and the current question (ring), with a legend and "x correct · y incorrect". Learning mode keeps its sidebar layout, progress bar and instant feedback; there is no timer or flagging.
- **Landing page content and motion (user's requests):** the landing page carries direction A's content in the B2 style: "Sit the exam before you *sit the exam.*", a dummy exam question card, a metrics strip (2,000 questions, 65/90, 4 domains, free; `BANK_SIZE` must follow the bank), "Two ways to study", "What's covered" with weight bars, and a "$100" call to action. Light motion only: a staggered fade-and-rise for the hero (`animate-rise`), the demo picking answer B and its clock counting down (`useExamDemo`), sections fading in as they scroll into view and the domain bars filling (`useReveal`), and a 2px hover lift on cards and buttons (`hover-lift`). No library, no loops beyond the demo clock, no parallax or count-ups. Everything stops under the OS or in-app "Reduce motion" (delays removed, the demo shown already answered); without IntersectionObserver content is simply shown.
- **Default theme: System** (user's choice; replaced by Light in 3.0.1, below): new visitors get light or dark to match their device (`DEFAULT_PREFERENCES.theme`, and `index.html`'s before-paint script treats "no saved choice" as System). Anyone who picked Dark or Light keeps it. E2E tests run on a light device, so the tests that check a saved theme now pick Dark, the migration journey emulates a dark device, and a dark-theme axe check was added.
- **3.0.1, headline highlight (user's choice, after comparing mockups):** "sit the exam." in the landing headline sits on the theme's own selection tint (`bg-highlight` / `text-on-highlight`: light aubergine in light mode, deep plum in dark), like a marker. A yellow highlighter and A's black-and-yellow palette were considered and rejected: the user kept the aubergine theme.
- **3.0.1, Light is the default theme (user's choice):** new visitors see the light theme; Dark and System stay one click away in Settings, and a saved choice still wins. The before-paint script, `DEFAULT_THEME`, `DEFAULT_PREFERENCES`, the stylesheet's default block (`:root` now carries the light colours) and the `theme-color` / manifest colours all say light. Tests that check a saved theme pick Dark; the old-format migration journey saves "system" on a dark device.

